# Studious - Project Structure

## 📁 Root Directory
```
studious/
├── assets/                 # Static assets (CSS, JS, images)
│   ├── css/
│   │   └── styles.css     # Main stylesheet
│   └── js/
│       ├── controllers/   # UI controllers
│       ├── models/        # Business logic & data models
│       └── views/         # View components
├── config/                # Configuration files
│   ├── setup-local-llm.bat
│   └── ...
├── docs/                  # Documentation
│   ├── AI_FLASHCARD_DOCUMENTATION.md
│   ├── AI_SMART_SCHEDULING_DOCS.md
│   ├── API_SETUP_GUIDE.html
│   ├── CONTRIBUTING.md
│   ├── DEV_SERVER_GUIDE.md
│   ├── ENV_SETUP_GUIDE.md
│   ├── ERROR_MANAGEMENT_SUMMARY.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── LOCAL_LLM_INTEGRATION.md
│   ├── LOCAL_LLM_SETUP.md
│   └── VALIDATION_COMPLETE.md
├── tests/                 # Test files
│   ├── test-ai-integration.html
│   ├── test-complete-system.html
│   ├── test-local-llm.bat
│   ├── test-local-llm.html
│   ├── test-main-app-console.js
│   └── test-smart-schedule.html
├── .env.example          # Environment configuration template
├── .gitignore           # Git ignore rules
├── dev-server.py        # Development server
├── index.html           # Main application entry point
├── LICENSE              # MIT License
├── package.json         # Node.js dependencies
├── README.md            # Project documentation
├── start.bat            # Windows startup script
└── start.sh             # Unix startup script
```

## 🧠 Core AI Models
- **LocalLLMProvider.js** - Ollama LLM integration (llama3.2:3b)
- **AIFlashcardGenerator.js** - AI-powered flashcard generation
- **AISmartScheduler.js** - Intelligent scheduling system
- **UserLearningProfile.js** - Learning pattern analysis
- **BiorhythmAnalyzer.js** - Optimal study time detection
- **ScheduleOptimizer.js** - Mathematical schedule optimization
- **ContextAwareScheduling.js** - Adaptive scheduling

## 🎛️ Controllers
- **AppController.js** - Main application controller
- **SmartScheduleController.js** - Schedule management UI
- **FlashcardController.js** - Flashcard interface
- **TimerController.js** - Study timer management
- **NavigationController.js** - App navigation

## 📊 Data Models
- **Store.js** - Data persistence
- **ConfigModel.js** - Configuration management
- **ContentModel.js** - Content processing
- **AnalyticsModel.js** - Usage analytics
- **RewardSystem.js** - Gamification system

## 🎨 Views
- **DashboardView.js** - Main dashboard
- **FlashcardView.js** - Flashcard display
- **TimerView.js** - Study timer interface
- **ThemeView.js** - UI themes
- **ModalView.js** - Modal dialogs

## 🧪 Testing
- **test-complete-system.html** - Full system integration test
- **test-ai-integration.html** - AI features test
- **test-smart-schedule.html** - Scheduling system test
- **test-main-app-console.js** - Console-based tests

## 🔧 Key Features
1. **AI-Powered Flashcard Generation** - Automatic flashcard creation from content
2. **Smart Scheduling System** - Biorhythm-aware study scheduling
3. **Local LLM Integration** - Privacy-focused AI using Ollama
4. **Adaptive Learning** - Personalized learning pattern analysis
5. **Real-time Optimization** - Dynamic schedule adjustments
6. **Multi-modal Content Support** - PDF, text, and video processing
7. **Spaced Repetition** - Memory-optimized review scheduling
8. **Performance Analytics** - Detailed learning metrics

## 🚀 Getting Started
1. Start Ollama server: `ollama serve`
2. Ensure llama3.2:3b model is available: `ollama pull llama3.2:3b`
3. Open `index.html` in browser or run development server
4. Use test files in `/tests/` directory to verify functionality

## 📈 System Status
- ✅ All syntax errors fixed
- ✅ File structure organized
- ✅ AI integration working with llama3.2:3b
- ✅ Smart scheduling operational
- ✅ Comprehensive testing suite available
- ✅ Documentation complete

## 🎯 Next Steps
- Run comprehensive tests to verify all features
- Fine-tune AI prompts for better results
- Add more advanced learning analytics
- Implement collaborative features
- Enhance mobile responsiveness
