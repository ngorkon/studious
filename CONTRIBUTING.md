# Contributing to Studious

Thank you for your interest in contributing to Studious! We welcome contributions from developers of all skill levels.

## 🚀 Getting Started

### Prerequisites
- Basic knowledge of HTML5, CSS3, and JavaScript (ES6+)
- Familiarity with Git and GitHub
- A modern web browser for testing

### Development Setup
1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/yourusername/studious.git
   cd studious
   ```
3. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Open `index.html` in your browser to test changes

## 📝 How to Contribute

### 🐛 Bug Reports
When filing a bug report, please include:
- Clear description of the issue
- Steps to reproduce the problem
- Expected vs actual behavior
- Browser and version information
- Screenshots if applicable

### ✨ Feature Requests
For new features, please:
- Check if the feature already exists or is planned
- Describe the feature and its benefits
- Provide mockups or examples if possible
- Explain the use case and target users

### 💻 Code Contributions

#### Code Style Guidelines
- **JavaScript**: Use ES6+ features, meaningful variable names, and JSDoc comments
- **CSS**: Follow BEM methodology, use CSS custom properties, maintain responsive design
- **HTML**: Semantic markup, accessibility attributes, proper indentation

#### Example Code Style:
```javascript
/**
 * Calculates optimal study duration based on user patterns
 * @param {Object} userStats - User's historical study data
 * @param {number} targetDuration - Desired session length in minutes
 * @returns {number} Recommended duration in minutes
 */
const calculateOptimalDuration = (userStats, targetDuration) => {
  const avgCompletion = userStats.completionRate || 0.8;
  const adjustedDuration = Math.round(targetDuration * avgCompletion);
  return Math.max(15, Math.min(180, adjustedDuration));
};
```

#### Pull Request Process
1. **Update documentation** if your changes affect user-facing features
2. **Test thoroughly** across different browsers and devices
3. **Follow the existing code patterns** and architecture
4. **Write descriptive commit messages**:
   ```
   feat: add smart break recommendations based on focus patterns
   
   - Analyze user's focus patterns over last 14 sessions
   - Suggest break duration based on session intensity
   - Add visual indicators for recommended break activities
   
   Closes #123
   ```

### 🎯 Areas Where We Need Help

#### High Priority
- [ ] **Mobile App Development**: React Native or Flutter versions
- [ ] **Accessibility Improvements**: Screen reader support, keyboard navigation
- [ ] **Performance Optimization**: Large PDF handling, memory management
- [ ] **Internationalization**: Multi-language support

#### Medium Priority
- [ ] **Advanced Analytics**: Machine learning insights, prediction models
- [ ] **Social Features**: Study groups, progress sharing, challenges
- [ ] **Integration APIs**: Calendar apps, note-taking tools, LMS platforms
- [ ] **Advanced Study Tools**: Mind mapping, concept linking, spaced repetition algorithms

#### Beginner Friendly
- [ ] **UI Improvements**: Icon updates, color schemes, micro-animations
- [ ] **Content Templates**: Study plan templates, goal setting wizards
- [ ] **Documentation**: Tutorials, feature guides, video walkthroughs
- [ ] **Bug Fixes**: Small issues and edge cases

## 🏗️ Project Architecture

### File Structure
```
studious/
├── index.html              # Main application entry
├── assets/
│   ├── css/
│   │   └── styles.css      # Modular CSS with custom properties
│   └── js/
│       └── app.js          # Modular JavaScript architecture
├── docs/                   # Documentation and guides
└── tests/                  # Test files (future)
```

### Key Modules (in app.js)
- **Utils**: Helper functions and utilities
- **Store**: Local storage management
- **Analytics**: Data collection and insights
- **TimeManagement**: Study session and habit tracking
- **RewardSystem**: Gamification and achievements
- **ContentModules**: PDF, Video, Text processing
- **Flashcards**: Card generation and review system
- **Theme**: Dark/light mode management

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Test on Chrome, Firefox, Safari, and Edge
- [ ] Verify responsive design on mobile, tablet, and desktop
- [ ] Check dark/light theme switching
- [ ] Test with various file types and sizes
- [ ] Verify achievement unlocking and notifications
- [ ] Test data persistence across browser sessions

### Accessibility Testing
- [ ] Keyboard navigation works throughout the app
- [ ] Color contrast meets WCAG AA standards
- [ ] Screen reader compatibility
- [ ] Focus indicators are visible
- [ ] Alternative text for images and icons

## 📚 Development Resources

### Learning Materials
- [MDN Web Docs](https://developer.mozilla.org/) - Comprehensive web development reference
- [PDF.js Documentation](https://mozilla.github.io/pdf.js/) - PDF processing library
- [CSS Grid Guide](https://css-tricks.com/snippets/css/complete-guide-grid/) - Layout system
- [JavaScript ES6+ Features](https://github.com/lukehoban/es6features) - Modern JavaScript

### Design Resources
- [Font Awesome Icons](https://fontawesome.com/) - Icon library used in the app
- [Color Palette Tools](https://coolors.co/) - For theme and UI colors
- [Material Design Guidelines](https://material.io/design/) - Design principles

## 🤝 Community Guidelines

### Communication
- Be respectful and inclusive in all interactions
- Provide constructive feedback and suggestions
- Help newcomers and answer questions
- Share knowledge and learning resources

### Code of Conduct
We follow the [Contributor Covenant Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/). By participating, you agree to uphold this code.

## 🎉 Recognition

Contributors will be recognized in:
- README.md acknowledgments section
- Release notes for their contributions
- Special achievements in the app (if applicable)

## 📞 Getting Help

If you need help with development:
- Check existing [Issues](../../issues) for similar questions
- Create a new issue with the "question" label
- Join our community discussions
- Review the documentation and code comments

Thank you for contributing to making studying better for everyone! 🚀📚
