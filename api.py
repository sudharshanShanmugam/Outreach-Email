import sys, os, threading, asyncio, json
sys.path.insert(0, os.path.dirname(__file__))

from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

app = FastAPI(title="AI Mail Generator")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Global runtime state ──────────────────────────────────────────────────────
_card_states: dict = {}        # lead_id → {status, email, sent, error}
_processing: bool = False
_sse_clients: list = []        # one asyncio.Queue per live SSE connection
_state_lock = threading.Lock()
_main_loop: asyncio.AbstractEventLoop | None = None


def _role_tier(designation: str) -> str:
    from services.outreach_generator import classify_role
    return classify_role(designation or "")


def _enrich_leads(leads: list) -> list:
    for lead in leads:
        lead["role_tier"] = _role_tier(
            lead.get("designation") or lead.get("title", "")
        )
    return leads


# ── SSE helpers ───────────────────────────────────────────────────────────────
async def _broadcast(event: dict):
    dead = []
    for q in _sse_clients:
        try:
            q.put_nowait(event)
        except Exception:
            dead.append(q)
    for q in dead:
        try:
            _sse_clients.remove(q)
        except ValueError:
            pass


def _broadcast_sync(event: dict):
    """Thread-safe broadcast from a worker thread."""
    if _main_loop and _main_loop.is_running():
        asyncio.run_coroutine_threadsafe(_broadcast(event), _main_loop)


# ── Startup ───────────────────────────────────────────────────────────────────
def _load_env():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.isfile(env_path):
        return
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, val = line.partition("=")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = val


@app.on_event("startup")
async def on_startup():
    global _main_loop
    _main_loop = asyncio.get_event_loop()
    _load_env()
    from store import init_db, clear_all_leads
    from services.chroma_manager import clear_all_collections
    from services.kb_ingestion import seed_trident_kb
    init_db()
    clear_all_leads()
    with _state_lock:
        _card_states.clear()
    clear_all_collections()
    seed_trident_kb()


# ── Leads ─────────────────────────────────────────────────────────────────────
@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    from utils.document_processor import read_dataframe
    from services.lead_processor import parse_leads_from_dataframe, save_leads_to_db
    from store import get_all_leads

    raw = await file.read()
    loop = asyncio.get_event_loop()

    def _run():
        df = read_dataframe(raw, file.filename)
        leads, warnings = parse_leads_from_dataframe(df)
        saved = save_leads_to_db(leads)
        return get_all_leads(), warnings

    leads, warnings = await loop.run_in_executor(None, _run)

    with _state_lock:
        for lead in leads:
            lid = lead["id"]
            if lid not in _card_states:
                _card_states[lid] = {
                    "status": "pending", "email": None,
                    "sent": False, "error": None,
                }

    leads = _enrich_leads(leads)
    # Broadcast new leads to any open SSE connections
    _broadcast_sync({"type": "leads_updated", "leads": leads, "card_states": dict(_card_states)})
    return {"leads": leads, "warnings": warnings, "count": len(leads)}


@app.get("/api/leads")
async def get_leads():
    from store import get_all_leads
    leads = _enrich_leads(get_all_leads())
    return {"leads": leads, "card_states": dict(_card_states), "processing": _processing}


@app.delete("/api/leads/{lead_id}")
async def delete_lead(lead_id: str):
    from store import delete_lead as _delete_lead
    _delete_lead(lead_id)
    with _state_lock:
        _card_states.pop(lead_id, None)
    from store import get_all_leads
    leads = _enrich_leads(get_all_leads())
    _broadcast_sync({"type": "leads_updated", "leads": leads, "card_states": dict(_card_states)})
    return {"status": "deleted"}


@app.delete("/api/leads")
async def clear_all():
    global _processing
    from store import clear_all_leads
    clear_all_leads()
    with _state_lock:
        _card_states.clear()
        _processing = False
    _broadcast_sync({"type": "cleared"})
    return {"status": "cleared"}


@app.get("/api/email/{lead_id}")
async def get_email(lead_id: str):
    cs = _card_states.get(lead_id)
    if not cs or not cs.get("email"):
        return JSONResponse({"error": "Email not available yet"}, status_code=404)
    return {"email": cs["email"]}


# ── Batch processing ──────────────────────────────────────────────────────────
@app.post("/api/process/start")
async def start_processing():
    global _processing, _main_loop
    _main_loop = asyncio.get_event_loop()

    from store import get_all_leads
    leads = _enrich_leads(get_all_leads())

    with _state_lock:
        for lead in leads:
            _card_states[lead["id"]] = {
                "status": "pending", "email": None,
                "sent": False, "error": None,
            }
        _processing = True

    _broadcast_sync({
        "type": "processing_started",
        "card_states": dict(_card_states),
    })

    thread = threading.Thread(target=_process_all, args=(leads,), daemon=True)
    thread.start()
    return {"status": "started", "total": len(leads)}


def _process_all(leads: list):
    global _processing

    for lead in leads:
        lid = lead["id"]

        with _state_lock:
            _card_states[lid]["status"] = "processing"
        _broadcast_sync({"type": "card_update", "lead_id": lid, "status": "processing"})

        try:
            from services.intelligence_engine import analyze_lead
            analysis = analyze_lead(lead, force_refresh=True)

            from services.outreach_generator import generate_output
            content = generate_output(
                lead, analysis, "personalized_email",
                stream=False, force_refresh=True,
            )

            email_sent = False
            subject_line, body_text = "", content or ""
            if lead.get("email") and content:
                from services.email_sender import send_email, extract_subject, is_configured
                subject_line, body_text = extract_subject(content)
                if is_configured():
                    ok, _err = send_email(lead["email"], subject_line, body_text)
                    email_sent = ok

            if content:
                from store import record_email
                record_email(
                    lead_id=lid,
                    company=lead.get("company", ""),
                    name=lead.get("name", ""),
                    email_address=lead.get("email", ""),
                    subject=subject_line,
                    body=body_text,
                    sent=email_sent,
                )

            with _state_lock:
                _card_states[lid] = {
                    "status": "done", "email": content,
                    "sent": email_sent, "error": None,
                }
            _broadcast_sync({
                "type": "card_update", "lead_id": lid,
                "status": "done", "sent": email_sent,
            })

        except Exception as exc:
            err_msg = str(exc)[:300]
            with _state_lock:
                _card_states[lid] = {
                    "status": "error", "email": None,
                    "sent": False, "error": err_msg,
                }
            _broadcast_sync({
                "type": "card_update", "lead_id": lid,
                "status": "error", "error": err_msg,
            })

    with _state_lock:
        _processing = False
    _broadcast_sync({"type": "complete"})


# ── Email history ────────────────────────────────────────────────────────────
@app.get("/api/history")
async def get_history():
    from store import get_email_history
    return {"history": get_email_history()}


@app.get("/api/history/stats")
async def get_history_stats():
    from store import get_history_stats
    return {"stats": get_history_stats()}


@app.delete("/api/history")
async def clear_history():
    from store import clear_email_history
    clear_email_history()
    return {"status": "cleared"}


# ── SSE stream ────────────────────────────────────────────────────────────────
@app.get("/api/process/stream")
async def sse_stream(request: Request):
    global _main_loop
    _main_loop = asyncio.get_event_loop()

    queue: asyncio.Queue = asyncio.Queue(maxsize=200)
    _sse_clients.append(queue)

    from store import get_all_leads
    leads = _enrich_leads(get_all_leads())
    initial = {
        "type": "initial_state",
        "leads": leads,
        "card_states": dict(_card_states),
        "processing": _processing,
    }

    async def gen():
        try:
            yield f"data: {json.dumps(initial)}\n\n"
            while True:
                if await request.is_disconnected():
                    break
                try:
                    event = await asyncio.wait_for(queue.get(), timeout=20)
                    yield f"data: {json.dumps(event)}\n\n"
                except asyncio.TimeoutError:
                    yield ": keepalive\n\n"
        finally:
            try:
                _sse_clients.remove(queue)
            except ValueError:
                pass

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


# ── SMTP config ───────────────────────────────────────────────────────────────
class SmtpConfig(BaseModel):
    user: str = ""
    password: str = ""
    host: str = "smtp.gmail.com"
    port: int = 587
    from_name: str = ""


@app.get("/api/smtp/status")
async def smtp_status():
    from services.email_sender import is_configured
    return {
        "configured": is_configured(),
        "user": os.environ.get("SMTP_USER", ""),
        "host": os.environ.get("SMTP_HOST", "smtp.gmail.com"),
        "port": int(os.environ.get("SMTP_PORT", "587")),
        "from_name": os.environ.get("FROM_NAME", ""),
    }


@app.post("/api/smtp/config")
async def save_smtp(cfg: SmtpConfig):
    os.environ["SMTP_USER"]     = cfg.user
    os.environ["SMTP_PASSWORD"] = cfg.password
    os.environ["SMTP_HOST"]     = cfg.host
    os.environ["SMTP_PORT"]     = str(cfg.port)
    os.environ["FROM_NAME"]     = cfg.from_name
    from services.email_sender import is_configured
    return {"configured": is_configured()}


# ── Serve React build (production) ────────────────────────────────────────────
_dist = os.path.join(os.path.dirname(__file__), "frontend", "dist")
if os.path.isdir(_dist):
    from fastapi.responses import FileResponse

    app.mount("/assets", StaticFiles(directory=os.path.join(_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        return FileResponse(os.path.join(_dist, "index.html"))
