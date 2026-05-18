#!/usr/bin/env bash
set -e
ROOT="$(cd "$(dirname "$0")" && pwd)"

echo "=== AI Mail Generator ==="
echo ""

# ── Python deps check ──────────────────────────────────────────────────────
if ! python -c "import fastapi, uvicorn" 2>/dev/null; then
  echo "Installing Python dependencies…"
  pip install -r "$ROOT/requirements.txt" -q
fi

# ── Node deps check ────────────────────────────────────────────────────────
if [ ! -d "$ROOT/frontend/node_modules" ]; then
  echo "Installing Node dependencies…"
  cd "$ROOT/frontend" && npm install --silent
fi

# ── Start FastAPI ──────────────────────────────────────────────────────────
echo "Starting FastAPI backend on http://localhost:8000 …"
cd "$ROOT"
uvicorn api:app --host 0.0.0.0 --port 8000 --reload &
API_PID=$!

# give uvicorn a moment to bind
sleep 1

# ── Start React (Vite dev) ─────────────────────────────────────────────────
echo "Starting React frontend on http://localhost:5173 …"
cd "$ROOT/frontend"
npm run dev &
VITE_PID=$!

# ── Cleanup on exit ────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo "Stopping servers…"
  kill "$API_PID"  2>/dev/null || true
  kill "$VITE_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "  Backend  → http://localhost:8000"
echo "  Frontend → http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop."
wait
