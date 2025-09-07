#!/usr/bin/env python3
"""
Simple development server for Studious
Run this script to start a local development server
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

PORT = 8000
DIRECTORY = Path(__file__).parent

class StudiousHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers for local development
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    print("🚀 Starting Studious Development Server...")
    print(f"📂 Serving from: {DIRECTORY}")
    print(f"🌐 Port: {PORT}")
    
    # Check if port is available
    with socketserver.TCPServer(("", PORT), StudiousHTTPRequestHandler) as httpd:
        print(f"✅ Server running at http://localhost:{PORT}")
        print(f"📚 Open Studious at: http://localhost:{PORT}/index.html")
        print("\n💡 Press Ctrl+C to stop the server")
        
        # Auto-open browser
        try:
            webbrowser.open(f'http://localhost:{PORT}/index.html')
            print("🌐 Browser opened automatically")
        except:
            print("⚠️  Could not open browser automatically")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Stopping development server...")
            print("🎓 Happy studying!")

if __name__ == "__main__":
    main()
