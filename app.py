#!/usr/bin/env python3
"""Run the Luna Park Departure Machine prototype locally."""

from __future__ import annotations

import argparse
import functools
import http.server
import socketserver
import threading
import webbrowser
from pathlib import Path


PROJECT_DIR = Path(__file__).resolve().parent
WEB_DIR = PROJECT_DIR


class PrototypeServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """Small local server that can handle several browser requests at once."""

    daemon_threads = True
    allow_reuse_address = True


class PrototypeRequestHandler(http.server.SimpleHTTPRequestHandler):
    """Serve the prototype without storing browser cache between test sessions."""

    def end_headers(self) -> None:
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, format: str, *args: object) -> None:
        print(f"[Luna Park] {self.address_string()} - {format % args}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Start the Luna Park Departure Machine web prototype."
    )
    parser.add_argument("--host", default="127.0.0.1", help="Server host")
    parser.add_argument("--port", default=8000, type=int, help="Server port")
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Start the server without opening a browser window",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    if not WEB_DIR.is_dir():
        raise SystemExit(f"Prototype files were not found at: {WEB_DIR}")

    handler = functools.partial(PrototypeRequestHandler, directory=str(WEB_DIR))
    server = PrototypeServer((args.host, args.port), handler)
    local_url = f"http://{args.host}:{args.port}"

    print("Luna Park Departure Machine")
    print(f"Open: {local_url}")
    print("Press Ctrl+C to stop the prototype.")

    if not args.no_browser:
        threading.Timer(0.5, webbrowser.open, args=(local_url,)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nPrototype stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
