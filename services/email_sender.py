import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def _cfg() -> dict:
    return {
        "host":      os.environ.get("SMTP_HOST", "smtp.gmail.com"),
        "port":      int(os.environ.get("SMTP_PORT", "587")),
        "user":      os.environ.get("SMTP_USER", ""),
        "password":  os.environ.get("SMTP_PASSWORD", ""),
        "from_name": os.environ.get("FROM_NAME", ""),
    }


def is_configured() -> bool:
    c = _cfg()
    return bool(c["user"] and c["password"])


def extract_subject(content: str) -> tuple[str, str]:
    """Return (subject, body) from raw email content string."""
    subject, body = "Introduction from itTrident", content
    for i, ln in enumerate(content.split("\n")):
        if ln.strip().lower().startswith("subject:"):
            subject = ln.split(":", 1)[1].strip()
            body = "\n".join(content.split("\n")[i + 1:]).strip()
            break
    return subject, body


def send_email(to_email: str, subject: str, body: str) -> tuple[bool, str]:
    """Send a plain-text email. Returns (success, error_message)."""
    if not is_configured():
        return False, "SMTP not configured"
    if not to_email or "@" not in to_email:
        return False, f"Invalid recipient: {to_email!r}"

    c = _cfg()
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject or "Introduction"
        msg["From"] = f"{c['from_name'] or c['user']} <{c['user']}>"
        msg["To"] = to_email
        msg.attach(MIMEText(body, "plain"))

        with smtplib.SMTP(c["host"], c["port"], timeout=30) as srv:
            srv.ehlo()
            srv.starttls()
            srv.login(c["user"], c["password"])
            srv.sendmail(c["user"], to_email, msg.as_string())
        return True, ""
    except Exception as e:
        return False, str(e)
