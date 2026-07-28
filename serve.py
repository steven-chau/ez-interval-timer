#!/usr/bin/env python3
import http.server
import socketserver
import os

PORT = 8080

os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler
Handler.extensions_map[".js"] = "application/javascript"

print(f"Serving at http://localhost:{PORT}")
print("Press Ctrl+C to stop.")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
