import sys, os
sys.path.insert(0, os.path.dirname(__file__))

import streamlit as st
from datetime import datetime

st.set_page_config(
    page_title="AI Mail Generator",
    page_icon="✉",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── Styles ────────────────────────────────────────────────────────────────────
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

html, body, [class*="css"], .stApp {
    font-family: 'Inter', sans-serif !important;
    background-color: #0f0f17 !important;
    color: #d4d4e8 !important;
}
.main .block-container { padding: 1.5rem 2rem 3rem 2rem; max-width: 100%; background: #0f0f17; }

/* Sidebar */
section[data-testid="stSidebar"] { background: #13131f !important; border-right: 1px solid #1e1e30 !important; }
section[data-testid="stSidebar"] > div { padding: 1.2rem 1rem; }
section[data-testid="stSidebar"] * { color: #c0c0d8 !important; }

p, span, div, label, li { color: #c8c8e0; }
h1, h2, h3, h4 { color: #e8e8ff !important; }

/* ── Lead cards ── */
.lead-card {
    background: #16162a;
    border: 1px solid #22223a;
    border-radius: 12px;
    padding: 1rem 1.1rem 0.9rem 1.1rem;
    margin-bottom: 0.5rem;
    transition: border-color 0.2s, box-shadow 0.2s;
    min-height: 140px;
}
.lead-card:hover { border-color: #3a3a6a; }

.card-processing {
    border-color: #fbbf24 !important;
    animation: pulse-border 1.4s ease-in-out infinite;
}
.card-sent { border-color: #34d399 !important; }

@keyframes pulse-border {
    0%, 100% { box-shadow: 0 0 0 0 rgba(251,191,36,0.0); }
    50%       { box-shadow: 0 0 8px 2px rgba(251,191,36,0.22); }
}

.lead-name { font-size: 0.92rem; font-weight: 700; color: #e0e0ff !important; margin-bottom: 3px; }
.lead-sub  { font-size: 0.76rem; color: #6868a0 !important; margin-top: 1px; }
.lead-email { font-size: 0.72rem; color: #4a4a70 !important; margin-top: 2px; }

/* ── Role pills ── */
.role-pill { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 0.65rem; font-weight: 700; margin-left: 6px; }
.pill-csuite    { background: rgba(124,124,255,0.18); color: #a0a0ff !important; border: 1px solid #4444aa; }
.pill-technical { background: rgba(250,204,21,0.12);  color: #fbbf24 !important; border: 1px solid #78600a; }
.pill-manager   { background: rgba(52,211,153,0.12);  color: #34d399 !important; border: 1px solid #065f46; }
.pill-hr        { background: rgba(244,114,182,0.12); color: #f472b6 !important; border: 1px solid #831843; }
.pill-marketing { background: rgba(96,165,250,0.12);  color: #60a5fa !important; border: 1px solid #1e3a8a; }
.pill-sales     { background: rgba(251,191,36,0.12);  color: #fbbf24 !important; border: 1px solid #78600a; }
.pill-other     { background: rgba(156,163,175,0.10); color: #9ca3af !important; border: 1px solid #374151; }

/* ── Status badges ── */
.badge-row { margin: 0.65rem 0 0.55rem 0; display: flex; gap: 8px; flex-wrap: wrap; }
.badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 10px; border-radius: 20px; font-size: 0.71rem; font-weight: 700;
}
.badge-pending    { background: rgba(100,100,140,0.15); color: #6868a0 !important; border: 1px solid #2a2a4a; }
.badge-processing { background: rgba(251,191,36,0.15);  color: #fbbf24 !important; border: 1px solid #78600a; animation: badge-spin 1s linear infinite; }
.badge-done       { background: rgba(96,165,250,0.12);  color: #60a5fa !important; border: 1px solid #1e3a8a; }
.badge-sent       { background: rgba(52,211,153,0.15);  color: #34d399 !important; border: 1px solid #065f46; }
.badge-error      { background: rgba(248,113,113,0.12); color: #f87171 !important; border: 1px solid #7f1d1d; }

@keyframes badge-spin { from { opacity: 1; } 50% { opacity: 0.5; } to { opacity: 1; } }

/* ── Email modal box ── */
.email-box {
    background: #13131f; border: 1px solid #22223a; border-radius: 10px;
    padding: 1.2rem 1.5rem; font-size: 0.88rem; line-height: 1.85;
    color: #d4d4f0 !important; white-space: pre-wrap;
    font-family: 'Inter', sans-serif; max-height: 65vh; overflow-y: auto;
}
.subject-bar {
    font-size: 0.95rem; font-weight: 700; color: #e8e8ff !important;
    margin-bottom: 0.8rem; padding-bottom: 0.7rem; border-bottom: 1px solid #1e1e30;
}

/* ── Upload zone ── */
div[data-testid="stFileUploader"] {
    border: 1.5px dashed #2a2a48 !important; border-radius: 10px; background: #12121e !important;
}
div[data-testid="stFileUploader"] * { color: #7070aa !important; }

/* ── Buttons ── */
.stButton > button {
    border-radius: 8px; font-weight: 600; font-size: 0.84rem; transition: all 0.18s; border: none;
}
.stButton > button[kind="primary"] {
    background: linear-gradient(135deg, #5b5bdb, #7c7cff) !important; color: #fff !important;
}
.stButton > button[kind="primary"]:hover {
    background: linear-gradient(135deg, #4a4ac9, #6b6bef) !important;
    box-shadow: 0 4px 16px rgba(100,100,255,0.35);
}
.stButton > button[kind="secondary"] {
    background: #1a1a2e !important; border: 1px solid #2a2a48 !important; color: #a0a0cc !important;
}
.stButton > button:disabled { opacity: 0.38 !important; cursor: not-allowed !important; }

/* Metrics */
div[data-testid="metric-container"] { background: #13131f; border: 1px solid #1e1e30; border-radius: 10px; }
div[data-testid="metric-container"] label { color: #5555aa !important; }
div[data-testid="metric-container"] div[data-testid="stMetricValue"] { color: #e0e0ff !important; }

/* Text inputs */
.stTextInput > div > div > input, .stTextArea textarea, .stNumberInput > div > div > input {
    background: #13131f !important; border: 1px solid #22223a !important;
    color: #d4d4f0 !important; border-radius: 8px;
}

/* Expander */
div[data-testid="stExpander"] { background: #13131f !important; border: 1px solid #1e1e30 !important; border-radius: 10px; }
div[data-testid="stExpander"] summary { color: #9090c0 !important; }

/* Alerts */
div[data-testid="stAlert"] { border-radius: 8px !important; }

/* Scrollbar */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: #0f0f17; }
::-webkit-scrollbar-thumb { background: #22223a; border-radius: 3px; }

/* Empty hint */
.empty-hint {
    text-align: center; padding: 5rem 2rem; color: #3a3a60 !important;
    font-size: 1rem; line-height: 2;
}

hr { border-color: #1a1a2e !important; }

/* Start button bigger */
div[data-testid="column"]:last-child .stButton > button[kind="primary"] {
    padding: 0.65rem 2rem; font-size: 0.95rem;
}

/* Dialog */
div[data-testid="stDialog"] { background: #13131f !important; }
div[data-testid="stDialog"] > div { background: #13131f !important; border: 1px solid #22223a; border-radius: 14px; }
</style>
""", unsafe_allow_html=True)


# ── Init ──────────────────────────────────────────────────────────────────────

def _init():
    if "app_started" in st.session_state:
        return
    from store import init_db, clear_all_data
    from services.chroma_manager import clear_all_collections
    from services.kb_ingestion import seed_trident_kb
    init_db()
    clear_all_data()
    clear_all_collections()
    seed_trident_kb()
    st.session_state.app_started       = True
    st.session_state.leads             = []
    st.session_state.analysis_cache    = {}
    st.session_state.card_states       = {}   # lead_id → {status, email, sent, error}
    st.session_state.processing_active = False
    st.session_state.current_lead_idx  = 0
    st.session_state.processed_files   = set()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _role_pill(designation: str) -> str:
    from services.outreach_generator import classify_role
    tier = classify_role(designation or "")
    labels = {
        "c_suite":     ("C-Suite",    "csuite"),
        "vp_dir":      ("VP/Dir",     "manager"),
        "manager":     ("Manager",    "manager"),
        "technical":   ("Technical",  "technical"),
        "hr":          ("HR",         "hr"),
        "marketing":   ("Marketing",  "marketing"),
        "sales":       ("Sales",      "sales"),
        "professional":("",           "other"),
    }
    lbl, cls = labels.get(tier, ("", "other"))
    return f'<span class="role-pill pill-{cls}">{lbl}</span>' if lbl else ""


def _ensure_card_states(leads: list):
    for lead in leads:
        lid = lead["id"]
        if lid not in st.session_state.card_states:
            st.session_state.card_states[lid] = {
                "status": "pending", "email": None, "sent": False, "error": None
            }


def _load_leads():
    from store import get_all_leads
    st.session_state.leads = get_all_leads()
    _ensure_card_states(st.session_state.leads)


def _handle_upload(file):
    from utils.document_processor import read_dataframe
    from services.lead_processor import parse_leads_from_dataframe, save_leads_to_db
    try:
        df = read_dataframe(file.read(), file.name)
        leads, warnings = parse_leads_from_dataframe(df)
        saved = save_leads_to_db(leads)
        _load_leads()
        return saved, warnings
    except Exception as e:
        return 0, [str(e)]


# ── Email content modal ───────────────────────────────────────────────────────

@st.dialog("Email Content", width="large")
def _show_email_dialog(lead_id: str):
    leads = st.session_state.leads
    lead  = next((l for l in leads if l["id"] == lead_id), {})
    cs    = st.session_state.card_states.get(lead_id, {})
    content = cs.get("email") or ""

    if not content:
        st.info("Email has not been generated yet.")
        return

    # Header info
    name  = lead.get("name", "")
    email = lead.get("email", "")
    co    = lead.get("company", "")
    st.markdown(
        f'<div style="font-size:0.82rem;color:#6868a0;margin-bottom:0.6rem;">'
        f'<strong style="color:#a0a0cc;">To:</strong> {name} · {co}'
        f'{"  ·  " + email if email else ""}'
        f'</div>',
        unsafe_allow_html=True,
    )

    # Subject + body
    subject, body = "", content
    for i, ln in enumerate(content.split("\n")):
        if ln.strip().lower().startswith("subject:"):
            subject = ln.split(":", 1)[1].strip()
            body    = "\n".join(content.split("\n")[i + 1:]).strip()
            break

    if subject:
        st.markdown(f'<div class="subject-bar">📧 {subject}</div>', unsafe_allow_html=True)

    st.markdown(f'<div class="email-box">{body}</div>', unsafe_allow_html=True)

    st.markdown("<div style='margin-top:0.8rem;'></div>", unsafe_allow_html=True)
    st.download_button(
        "⬇ Download .txt",
        data=content.encode(),
        file_name=f"{co or 'email'}_outreach.txt",
        mime="text/plain",
        use_container_width=True,
    )


# ── Render a single card ──────────────────────────────────────────────────────

def _render_card(lead: dict, col):
    lid    = lead["id"]
    cs     = st.session_state.card_states.get(lid, {"status": "pending", "email": None, "sent": False})
    status = cs.get("status", "pending")
    sent   = cs.get("sent", False)
    has_email = bool(cs.get("email"))

    desig = lead.get("designation") or lead.get("title", "")
    pill  = _role_pill(desig)

    # Status badge
    if status == "processing":
        s_badge = '<span class="badge badge-processing">⟳ Processing</span>'
    elif status == "error":
        s_badge = '<span class="badge badge-error">✗ Error</span>'
    elif has_email:
        s_badge = '<span class="badge badge-done">✓ Done</span>'
    else:
        s_badge = '<span class="badge badge-pending">○ Pending</span>'

    sent_badge = '<span class="badge badge-sent">✉ Sent</span>' if sent else ""

    error_html = ""
    if status == "error" and cs.get("error"):
        err = cs["error"][:80]
        error_html = f'<div style="font-size:0.7rem;color:#f87171;margin-top:4px;">{err}</div>'

    # Card border class
    card_cls = "card-processing" if status == "processing" else ("card-sent" if sent else "")

    with col:
        st.markdown(f"""
<div class="lead-card {card_cls}">
  <div class="lead-name">{lead.get('company','—')}{pill}</div>
  <div class="lead-sub">{lead.get('name','')}{(' · ' + desig) if desig else ''}</div>
  {'<div class="lead-email">📧 ' + lead.get('email','') + '</div>' if lead.get('email') else ''}
  <div class="badge-row">{s_badge}{sent_badge}</div>
  {error_html}
</div>
""", unsafe_allow_html=True)

        if st.button(
            "📧 Email Content",
            key=f"modal_{lid}",
            disabled=not has_email,
            use_container_width=True,
            type="secondary",
        ):
            _show_email_dialog(lid)


# ── Sidebar ───────────────────────────────────────────────────────────────────

def _render_sidebar():
    with st.sidebar:
        st.markdown("## ✉ AI Mail Generator")
        st.markdown("---")

        # SMTP config
        st.markdown("### ⚙️ Email (SMTP) Settings")
        from services.email_sender import is_configured
        if is_configured():
            st.success("✓ SMTP ready")
        else:
            st.warning("SMTP not configured — emails won't be sent")

        with st.expander("Configure SMTP", expanded=not is_configured()):
            smtp_user = st.text_input(
                "Gmail / SMTP address",
                value=os.environ.get("SMTP_USER", ""),
                key="cfg_smtp_user",
            )
            smtp_pass = st.text_input(
                "App Password",
                type="password",
                value=os.environ.get("SMTP_PASSWORD", ""),
                key="cfg_smtp_pass",
            )
            smtp_host = st.text_input(
                "SMTP Host",
                value=os.environ.get("SMTP_HOST", "smtp.gmail.com"),
                key="cfg_smtp_host",
            )
            smtp_port = st.number_input(
                "Port",
                value=int(os.environ.get("SMTP_PORT", "587")),
                key="cfg_smtp_port",
            )
            from_name = st.text_input(
                "Sender Name",
                value=os.environ.get("FROM_NAME", ""),
                key="cfg_from_name",
            )
            if st.button("Save SMTP Config", type="primary", use_container_width=True):
                os.environ["SMTP_USER"]     = smtp_user
                os.environ["SMTP_PASSWORD"] = smtp_pass
                os.environ["SMTP_HOST"]     = smtp_host
                os.environ["SMTP_PORT"]     = str(int(smtp_port))
                os.environ["FROM_NAME"]     = from_name
                st.success("Saved for this session")
                st.rerun()

        st.markdown("---")
        st.caption(
            "For Gmail: go to Google Account → Security → 2-Step Verification → App Passwords "
            "and generate a 16-char app password."
        )

        # Clear leads
        if st.session_state.leads:
            st.markdown("---")
            if st.button("🗑 Clear All Leads", use_container_width=True):
                from store import clear_all_leads
                clear_all_leads()
                st.session_state.leads             = []
                st.session_state.card_states       = {}
                st.session_state.processing_active = False
                st.session_state.current_lead_idx  = 0
                st.session_state.processed_files   = set()
                st.session_state.analysis_cache    = {}
                st.rerun()


# ── Main page ─────────────────────────────────────────────────────────────────

def _render_main():
    leads = st.session_state.leads

    # ── Pre-mark the current lead as "processing" before cards are painted ────
    if st.session_state.processing_active:
        idx = st.session_state.current_lead_idx
        if idx < len(leads):
            cid = leads[idx]["id"]
            if st.session_state.card_states.get(cid, {}).get("status") == "pending":
                st.session_state.card_states[cid]["status"] = "processing"

    # ── Page title ────────────────────────────────────────────────────────────
    st.markdown(
        '<h2 style="color:#e0e0ff;margin-bottom:0.2rem;font-size:1.5rem;">✉ AI Mail Generator</h2>',
        unsafe_allow_html=True,
    )

    # ── No leads: full-page upload ────────────────────────────────────────────
    if not leads:
        st.markdown("""
<div class="empty-hint">
  <div style="font-size:3.5rem;">📂</div>
  <strong style="color:#b0b0d8;font-size:1.1rem;">Upload your leads Excel file to get started</strong><br>
  <span style="font-size:0.85rem;">Each row becomes a card · Click <strong>Start</strong> to analyse &amp; email everyone automatically</span>
</div>
""", unsafe_allow_html=True)

        _, mid, _ = st.columns([1, 2, 1])
        with mid:
            lead_file = st.file_uploader(
                "Drop your XLSX / CSV file here",
                type=["xlsx", "xls", "csv"],
                key="initial_upload",
            )
            if lead_file:
                fkey = f"{lead_file.name}_{lead_file.size}"
                if fkey not in st.session_state.processed_files:
                    with st.spinner("Reading file…"):
                        saved, warnings = _handle_upload(lead_file)
                    st.session_state.processed_files.add(fkey)
                    if warnings:
                        st.warning(f"{len(warnings)} duplicates skipped")
                    st.rerun()
        return

    # ── Stats bar ─────────────────────────────────────────────────────────────
    total      = len(leads)
    done_count = sum(1 for s in st.session_state.card_states.values() if s.get("email"))
    sent_count = sum(1 for s in st.session_state.card_states.values() if s.get("sent"))
    is_proc    = st.session_state.processing_active
    all_done   = done_count >= total

    c1, c2, c3, c4, c5 = st.columns([1, 1, 1, 1, 2])
    c1.metric("Leads",     total)
    c2.metric("Processed", done_count)
    c3.metric("Sent",      sent_count)

    # Upload more
    with c4:
        more_file = st.file_uploader(
            "Add more",
            type=["xlsx", "xls", "csv"],
            label_visibility="collapsed",
            key="more_upload",
        )
        if more_file:
            fkey = f"more_{more_file.name}_{more_file.size}"
            if fkey not in st.session_state.processed_files:
                with st.spinner("Reading…"):
                    saved, _ = _handle_upload(more_file)
                st.session_state.processed_files.add(fkey)
                st.rerun()

    # Start / status
    with c5:
        if is_proc:
            idx = st.session_state.current_lead_idx
            st.markdown(
                f'<div style="padding-top:0.5rem;font-size:0.88rem;color:#fbbf24;">'
                f'⟳ Processing {min(idx + 1, total)} / {total}…</div>',
                unsafe_allow_html=True,
            )
        elif all_done:
            st.markdown(
                f'<div style="padding-top:0.5rem;font-size:0.88rem;color:#34d399;">'
                f'✓ All {total} emails sent</div>',
                unsafe_allow_html=True,
            )
            if st.button("↺ Reprocess All", type="secondary", use_container_width=True):
                for lead in leads:
                    st.session_state.card_states[lead["id"]] = {
                        "status": "pending", "email": None, "sent": False, "error": None
                    }
                st.session_state.processing_active = True
                st.session_state.current_lead_idx  = 0
                st.rerun()
        else:
            if st.button("▶  Start", type="primary", use_container_width=True, key="start_btn"):
                for lead in leads:
                    st.session_state.card_states[lead["id"]] = {
                        "status": "pending", "email": None, "sent": False, "error": None
                    }
                st.session_state.processing_active = True
                st.session_state.current_lead_idx  = 0
                st.rerun()

    st.markdown("<hr style='border-color:#1e1e30;margin:0.6rem 0 1rem 0;'>", unsafe_allow_html=True)

    # ── Cards grid ────────────────────────────────────────────────────────────
    cols = st.columns(3, gap="medium")
    for i, lead in enumerate(leads):
        _render_card(lead, cols[i % 3])

    # ── Processing engine (runs AFTER cards are painted) ─────────────────────
    if is_proc:
        idx = st.session_state.current_lead_idx
        if idx >= len(leads):
            st.session_state.processing_active = False
            st.rerun()
            return

        lead = leads[idx]
        lid  = lead["id"]

        try:
            # 1. Analyse lead
            from services.intelligence_engine import analyze_lead
            analysis = analyze_lead(lead, force_refresh=True)
            st.session_state.analysis_cache[lid] = analysis

            # 2. Generate email
            from services.outreach_generator import generate_output
            content = generate_output(
                lead, analysis, "personalized_email",
                stream=False, force_refresh=True,
            )

            # 3. Send email
            email_sent = False
            if lead.get("email") and content:
                from services.email_sender import send_email, extract_subject, is_configured
                if is_configured():
                    subject, body = extract_subject(content)
                    success, _err = send_email(lead["email"], subject, body)
                    email_sent = success

            st.session_state.card_states[lid] = {
                "status": "done",
                "email":  content,
                "sent":   email_sent,
                "error":  None,
            }

        except Exception as exc:
            st.session_state.card_states[lid] = {
                "status": "error",
                "email":  None,
                "sent":   False,
                "error":  str(exc),
            }

        st.session_state.current_lead_idx += 1
        st.rerun()


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    _init()
    _render_sidebar()
    _render_main()


if __name__ == "__main__":
    main()
