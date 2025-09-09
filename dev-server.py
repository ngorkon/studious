#!/usr/bin/env python3
import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def guess_type(self, path):
        mimetype = super().guess_type(path)
        path_str = str(path)
        if path_str.endswith('.js'):
            return 'application/javascript'
        elif path_str.endswith('.css'):
            return 'text/css'
        return mimetype

def main():
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Study Companion Development Server")
        print(f"📍 Server running at: http://localhost:{PORT}")
        print(f"📁 Serving directory: {os.getcwd()}")
        print(f"🌐 Opening in browser...")
        print(f"⏹️  Press Ctrl+C to stop the server")
        
        # Open the browser
        webbrowser.open(f'http://localhost:{PORT}')
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n🛑 Server stopped.")
            sys.exit(0)

if __name__ == "__main__":
    main()
