#!/bin/bash
# Studious - System Cleanup and Optimization Script

echo "🧹 Starting Studious System Cleanup..."

# Remove any temporary files
find . -name "*.tmp" -delete 2>/dev/null
find . -name "*.log" -delete 2>/dev/null
find . -name ".DS_Store" -delete 2>/dev/null

# Check for and remove any duplicate test files
if [ -f "test-integration.js" ] && [ -f "tests/test-main-app-console.js" ]; then
    echo "📁 Removing duplicate test files..."
    rm -f "test-integration.js"
fi

# Ensure proper file permissions
chmod +x start.sh
chmod +x config/*.bat 2>/dev/null
chmod +x tests/*.bat 2>/dev/null

# Validate critical files exist
echo "🔍 Validating critical files..."

CRITICAL_FILES=(
    "index.html"
    "assets/js/controllers/AppController.js"
    "assets/js/models/LocalLLMProvider.js"
    "assets/js/models/AIFlashcardGenerator.js"
    "assets/js/controllers/SmartScheduleController.js"
    "assets/css/styles.css"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ Missing: $file"
    fi
done

# Count files in each directory
echo ""
echo "📊 Project Statistics:"
echo "Controllers: $(ls -1 assets/js/controllers/*.js 2>/dev/null | wc -l)"
echo "Models: $(ls -1 assets/js/models/*.js 2>/dev/null | wc -l)"
echo "Views: $(ls -1 assets/js/views/*.js 2>/dev/null | wc -l)"
echo "Tests: $(ls -1 tests/* 2>/dev/null | wc -l)"
echo "Documentation: $(ls -1 docs/* 2>/dev/null | wc -l)"

# Check for Ollama server
echo ""
echo "🔗 Checking Ollama server..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama server is running"
    
    # Check for llama3.2:3b model
    if curl -s http://localhost:11434/api/tags | grep -q "llama3.2:3b"; then
        echo "✅ llama3.2:3b model available"
    else
        echo "⚠️ llama3.2:3b model not found - run: ollama pull llama3.2:3b"
    fi
else
    echo "❌ Ollama server not running - run: ollama serve"
fi

echo ""
echo "🎉 Cleanup complete! System ready for use."
echo "🚀 To start: Open index.html in your browser or run the development server"
