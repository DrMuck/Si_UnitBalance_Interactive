#!/usr/bin/env python3
"""Simple HTTP server for the Si_UnitBalance interactive config editor."""

import http.server
import os
import sys

PORT = 8080

os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    # Chrome opens several parallel keep-alive connections; a single-threaded
    # server serialises them and the config fetch can stall, leaving the editor
    # blank. Disable keep-alive and serve on threads so every request is prompt.
    protocol_version = 'HTTP/1.0'

    def end_headers(self):
        # Local dev: never cache, so JS/JSON edits show up on a plain refresh.
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


Handler.extensions_map.update({
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.css': 'text/css',
})

server = http.server.ThreadingHTTPServer(('localhost', PORT), Handler)
print(f"Serving Si_UnitBalance Interactive at http://localhost:{PORT}")
print("Press Ctrl+C to stop")

try:
    server.serve_forever()
except KeyboardInterrupt:
    print("\nStopped.")
    sys.exit(0)
