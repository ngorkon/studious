#!/bin/bash
# Quick start script for Unix/Linux/macOS

echo "🚀 Starting Studious - Ultimate Study Companion"
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "✅ Python 3 found"
    python3 dev-server.py
elif command -v python &> /dev/null; then
    echo "✅ Python found"
    python dev-server.py
else
    echo "❌ Python not found. Please install Python 3.x"
    echo "📥 Download from: https://python.org/downloads"
    echo ""
    echo "Alternative: Open index.html directly in your browser"
    echo "📂 File location: $(pwd)/index.html"
fi
