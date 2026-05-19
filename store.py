import uuid, os, json, threading
from datetime import datetime, timezone

_leads: dict = {}
_analyses: dict = {}
_outreach: dict = {}
_kb_docs: dict = {}
_scores: dict = {}
_email_history: list = []

_lock = threading.Lock()
_DATA_FILE    = os.path.join(os.path.dirname(__file__), "data", "leads.json")
_HISTORY_FILE = os.path.join(os.path.dirname(__file__), "data", "email_history.json")


def _save_leads():
    try:
        os.makedirs(os.path.dirname(_DATA_FILE), exist_ok=True)
        with open(_DATA_FILE, "w") as f:
            json.dump(list(_leads.values()), f)
    except Exception:
        pass


def _load_leads():
    try:
        if os.path.isfile(_DATA_FILE):
            with open(_DATA_FILE) as f:
                for lead in json.load(f):
                    _leads[lead["id"]] = lead
    except Exception:
        pass


def _save_history():
    try:
        os.makedirs(os.path.dirname(_HISTORY_FILE), exist_ok=True)
        with open(_HISTORY_FILE, "w") as f:
            json.dump(_email_history, f)
    except Exception:
        pass


def _load_history():
    try:
        if os.path.isfile(_HISTORY_FILE):
            with open(_HISTORY_FILE) as f:
                _email_history.extend(json.load(f))
    except Exception:
        pass


def init_db():
    _load_leads()
    _load_history()


def record_email(
    lead_id: str,
    company: str,
    name: str,
    email_address: str,
    subject: str,
    body: str,
    sent: bool,
) -> dict:
    now = datetime.now(timezone.utc)
    entry = {
        "id":            str(uuid.uuid4()),
        "lead_id":       lead_id,
        "company":       company,
        "name":          name,
        "email_address": email_address,
        "subject":       subject,
        "body":          body,
        "sent":          sent,
        "sent_at":       now.isoformat(),
        "date":          now.strftime("%Y-%m-%d"),
        "time":          now.strftime("%H:%M:%S"),
    }
    with _lock:
        _email_history.append(entry)
        _save_history()
    return entry


def get_email_history() -> list[dict]:
    return list(reversed(_email_history))


def clear_email_history():
    with _lock:
        _email_history.clear()
        _save_history()


def get_history_stats() -> list[dict]:
    """Return per-date counts sorted newest first."""
    by_date: dict[str, dict] = {}
    for e in _email_history:
        d = e["date"]
        if d not in by_date:
            by_date[d] = {"date": d, "total": 0, "sent": 0}
        by_date[d]["total"] += 1
        if e["sent"]:
            by_date[d]["sent"] += 1
    return sorted(by_date.values(), key=lambda x: x["date"], reverse=True)


def upsert_lead(lead: dict) -> str:
    with _lock:
        _leads[lead["id"]] = lead
        _save_leads()
    return lead["id"]


def get_all_leads() -> list[dict]:
    return list(_leads.values())


def get_lead(lead_id: str) -> dict | None:
    return _leads.get(lead_id)


def delete_lead(lead_id: str):
    with _lock:
        _leads.pop(lead_id, None)
        for key in [k for k in _analyses if k[0] == lead_id]:
            del _analyses[key]
        _outreach.pop(lead_id, None)
        _scores.pop(lead_id, None)
        _save_leads()


def save_analysis(lead_id: str, analysis_type: str, content: str, model: str = None) -> str:
    _analyses[(lead_id, analysis_type)] = content
    return str(uuid.uuid4())


def get_analysis(lead_id: str, analysis_type: str) -> str | None:
    return _analyses.get((lead_id, analysis_type))


def save_outreach(lead_id: str, outreach_type: str, subject: str, content: str, platform: str = "email") -> str:
    _outreach.setdefault(lead_id, []).append({
        "id": str(uuid.uuid4()),
        "outreach_type": outreach_type,
        "subject": subject,
        "content": content,
        "platform": platform,
    })
    return _outreach[lead_id][-1]["id"]


def get_outreach_history(lead_id: str) -> list[dict]:
    return _outreach.get(lead_id, [])


def save_score(lead_id: str, scores: dict, reasoning: str):
    _scores[lead_id] = {**scores, "score_reasoning": reasoning, "lead_id": lead_id}


def get_score(lead_id: str) -> dict | None:
    return _scores.get(lead_id)


def save_kb_document(doc_id: str, filename: str, doc_type: str, collection: str, chunk_count: int, metadata: dict):
    _kb_docs[doc_id] = {
        "id": doc_id, "filename": filename, "doc_type": doc_type,
        "collection": collection, "chunk_count": chunk_count, "metadata": metadata,
    }


def get_kb_documents() -> list[dict]:
    return list(_kb_docs.values())


def clear_all_leads():
    with _lock:
        _leads.clear()
        for key in list(_analyses.keys()):
            del _analyses[key]
        _outreach.clear()
        _scores.clear()
        _save_leads()


def clear_all_data():
    with _lock:
        _leads.clear()
        _analyses.clear()
        _outreach.clear()
        _kb_docs.clear()
        _scores.clear()
        _save_leads()


def get_dashboard_stats() -> dict:
    return {
        "total_leads":   len(_leads),
        "analyzed":      len({k[0] for k in _analyses if k[1] == "full_intelligence"}),
        "scored":        len(_scores),
        "high_priority": sum(1 for s in _scores.values() if s.get("overall", 0) >= 75),
        "outreach_sent": sum(len(v) for v in _outreach.values()),
        "kb_docs":       len(_kb_docs),
    }
