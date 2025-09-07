# 📚 Studious - Ultimate Study Companion

> Transform your studying experience with gamified learning, advanced time management, and intelligent content processing.

![Studious Dashboard](https://img.shields.io/badge/Status-Ready-brightgreen) ![Version](https://img.shields.io/badge/Version-2.0.0-blue) ![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🎯 **Multi-Format Content Support**
- **PDF Processing**: Upload and study PDF documents with intelligent chunking
- **Video Integration**: Watch and learn from video content with synchronized note-taking
- **Text Analysis**: Process and analyze text documents for focused studying
- **Smart Content Extraction**: Automatic text extraction and content analysis

### 🧠 **Intelligent Flashcards**
- **Auto-Generation**: Create flashcards automatically from your study content
- **Content-Aware**: Generates relevant questions and answers from PDFs and text
- **Interactive Learning**: Spaced repetition system for optimal memory retention
- **Progress Tracking**: Monitor your flashcard performance and accuracy

### ⏱️ **Advanced Time Management**
- **Smart Pomodoro Timer**: Customizable focus sessions with intelligent break suggestions
- **Habit Tracking**: Monitor study consistency and build lasting habits
- **Analytics Dashboard**: Comprehensive study pattern analysis
- **Optimal Scheduling**: AI-powered recommendations for peak performance times
- **Session Insights**: Detailed analytics on focus, productivity, and completion rates

### 🏆 **Gamified Reward System**
- **35+ Achievements**: Unlock achievements across 8 categories (Starter, Habit, Focus, Milestone, Creative, Seasonal, Legendary, Secret)
- **XP & Leveling**: Earn experience points and level up through consistent studying
- **Streak Rewards**: Daily streak bonuses and milestone celebrations
- **Rarity System**: Common, Rare, Epic, Legendary, and Secret achievement tiers
- **Beautiful Celebrations**: Animated achievement notifications with visual effects

### 📊 **Comprehensive Analytics**
- **Study Patterns**: Track your optimal study times and duration preferences
- **Progress Visualization**: Beautiful charts and progress indicators
- **Performance Metrics**: Completion rates, focus scores, and consistency measurements
- **Time Insights**: Deep analysis of study habits and productivity patterns
- **Goal Tracking**: Set and monitor daily, weekly, and monthly study goals

### 🎨 **Modern User Experience**
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Dark/Light Themes**: Switch between themes for comfortable studying
- **Intuitive Navigation**: Clean, organized interface for distraction-free learning
- **Real-time Sync**: Live updates across all components and features
- **Accessibility**: Keyboard navigation and screen reader support

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser!

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/studious.git
   cd studious
   ```

2. **Open the application:**
   - Simply open `index.html` in your web browser
   - Or use a local server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

3. **Start studying!**
   - Upload your first study material (PDF, video, or text)
   - Configure your study preferences
   - Begin your first focus session

## 📖 How to Use

### 1. **Getting Started**
- Launch the app and you'll see the modern dashboard
- Upload your study material using the intuitive upload interface
- Choose from PDF, video, or text content

### 2. **Study Session Setup**
- Configure your session duration (default: 25 minutes Pomodoro)
- Set break times and study goals
- Choose focus mode or relaxed studying
- Enable notifications for session transitions

### 3. **Content Interaction**
- **PDFs**: Navigate pages, highlight text, take notes
- **Videos**: Control playback, timestamp notes, loop sections
- **Text**: Highlight key passages, create summaries
- Generate flashcards automatically from any content

### 4. **Flashcard Learning**
- Review auto-generated flashcards from your content
- Rate your confidence on each card
- Track accuracy and improvement over time
- Use spaced repetition for optimal retention

### 5. **Progress Tracking**
- Monitor daily study streaks
- View comprehensive analytics in the dashboard
- Track XP, levels, and achievement progress
- Analyze your optimal study patterns

## 🏗️ Project Structure

```
studious/
├── index.html              # Main application entry point
├── assets/
│   ├── css/
│   │   └── styles.css      # Complete styling system
│   └── js/
│       └── app.js          # Core application logic
├── README.md               # This file
└── LICENSE                 # MIT License
```

## 🛠️ Technical Details

### Architecture
- **Frontend**: Vanilla JavaScript ES6+, HTML5, CSS3
- **Storage**: Browser LocalStorage for data persistence
- **PDF Processing**: PDF.js library for document rendering
- **Responsive**: CSS Grid and Flexbox for modern layouts
- **Performance**: Optimized for smooth 60fps animations

### Key Components
- **Utils**: Utility functions and helpers
- **Store**: Local storage management system
- **Analytics**: Comprehensive tracking and insights
- **TimeManagement**: Advanced scheduling and habit tracking
- **RewardSystem**: Gamification and achievement system
- **PDF/Video/Text Modules**: Content processing engines
- **Flashcards**: Intelligent card generation and review
- **Theme Manager**: Dark/light mode switching

### Browser Compatibility
- ✅ Chrome 88+
- ✅ Firefox 85+
- ✅ Safari 14+
- ✅ Edge 88+

## 🎯 Achievement Categories

### 🌱 **Starter Achievements**
- First Steps, Quick Learner, Getting Serious

### 🔄 **Habit Building**
- Early Bird, Night Owl, Weekend Warrior, Consistency Master, Habit Architect

### 🎯 **Focus Mastery**
- Focus Rookie, Focus Master, Flow State, Deep Dive, Laser Focus

### 🏅 **Milestones**
- Perfect Week, Streak Warrior, Centurion, Time Master, Marathon Runner, Scholar

### 🎨 **Creative**
- Bookworm, Flash Master, Content Creator, Knowledge Synthesizer, Precision Expert

### 🌺 **Seasonal**
- New Year Resolution, Spring Renewal, Summer Scholar, Autumn Wisdom, Winter Perseverance

### 👑 **Legendary**
- Dedication Incarnate (365-day streak), Knowledge Titan (10,000 XP), Time Lord (1,000 hours)

### 🤫 **Secret**
- Hidden achievements for special behaviors and patterns

## 📈 Analytics & Insights

The app provides comprehensive analytics including:
- **Study Time Tracking**: Total time, daily averages, weekly patterns
- **Session Analysis**: Completion rates, focus scores, interruption tracking
- **Habit Metrics**: Consistency scores, streak analysis, optimal timing
- **Content Insights**: Pages read, flashcards created, material diversity
- **Performance Trends**: Progress over time, goal achievement, improvement areas

## 🎨 Customization

### Themes
- **Light Theme**: Clean, minimal design for daytime studying
- **Dark Theme**: Eye-friendly dark mode for evening sessions
- **Auto-switching**: Adapts to system preferences

### Study Modes
- **Focus Mode**: Distraction-free environment with minimal UI
- **Relaxed Mode**: Full interface with all features accessible
- **Break Mode**: Gentle reminders and progress celebration

## 🔒 Privacy & Data

- **Local Storage Only**: All data stays on your device
- **No External Servers**: Complete privacy and offline functionality
- **Export Capability**: Export your study data anytime
- **No Tracking**: Zero analytics or user tracking

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow existing code style and structure
- Add comments for complex functionality
- Test thoroughly across different browsers
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **PDF.js** - Mozilla's PDF rendering library
- **Font Awesome** - Beautiful icons throughout the app
- **Modern CSS** - Inspiration from contemporary design systems
- **Study Community** - Feedback and feature suggestions

## 📞 Support

If you encounter any issues or have suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Contributing guidelines are in the repository

## 🚧 Roadmap

### Upcoming Features
- [ ] Study group collaboration
- [ ] Advanced note-taking with markdown
- [ ] Cloud sync capabilities
- [ ] Mobile app versions
- [ ] AI-powered study recommendations
- [ ] Integration with popular learning platforms

---

**Made with ❤️ for students everywhere. Happy studying!** 📚✨
