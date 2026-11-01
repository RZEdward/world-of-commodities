"""Serve the dashboard locally without exposing it to the network."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


class DashboardHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self) -> None:
        if self.path == "/":
            self.send_response(302)
            self.send_header("Location", "/app/")
            self.end_headers()
            return
        if self.path.split("?", 1)[0] == "/data/opportunities.json":
            subprocess.run([sys.executable, str(ROOT / "scripts" / "export_tracker.py")], cwd=ROOT, check=True, capture_output=True, text=True)
        super().do_GET()


def main() -> None:
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("127.0.0.1", port), DashboardHandler)
    print(f"Dashboard: http://127.0.0.1:{port}/app/ (Ctrl+C to stop)")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
