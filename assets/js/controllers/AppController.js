class AppController {
    constructor() {
        this.store = Store;
        this.toastView = new ToastView();
        window.toastView = this.toastView; // Make globally available
        this.modalView = new ModalView();
        this.themeView = new ThemeView(this.store);
        
        this.analyticsModel = new AnalyticsModel(this.store);
        this.dashboardView = new DashboardView();
        
        this.timerModel = new TimerModel(this.store);
        this.timerView = new TimerView();

        this.contentModel = new ContentModel(this.store);
        this.contentView = new ContentView();

        this.flashcardModel = new FlashcardModel(this.store);
        this.flashcardView = new FlashcardView();

        this.configModel = new ConfigModel(this.store);
        this.configView = new ConfigView();

        this.quoteModel = new QuoteModel();
        this.rewardSystem = new RewardSystem(this.store);

        this.readerView = new ReaderView();
        this.viewerView = new ViewerView();

        this.initializeControllers();
        
        // Initialize AI components
        this.initializeAI();
        
        // Initialize navigation after all controllers
        this.navigationController = new NavigationController();
        this.dashboardView.updateStats(this.analyticsModel.getStats());
        this.updateQuote();

        // Initialize AI features
        this.initializeAIFeatures();

        document.addEventListener('fileSelected', (e) => this.handleFileSelected(e.detail.file));
        document.addEventListener('startStudy', (e) => this.startStudySession(e.detail));
        document.addEventListener('sessionComplete', () => this.handleSessionComplete());
    }

    initializeAIFeatures() {
        try {
            // Make AI generator globally available
            if (typeof AIFlashcardGenerator !== 'undefined') {
                window.aiFlashcardGenerator = new AIFlashcardGenerator();
                console.log('AI Flashcard Generator initialized successfully');
                
                // Notify other components that AI is available
                document.dispatchEvent(new CustomEvent('aiInitialized', {
                    detail: { generator: window.aiFlashcardGenerator }
                }));
            } else {
                console.warn('AIFlashcardGenerator not available');
            }
        } catch (error) {
            console.error('Failed to initialize AI features:', error);
        }
    }

    initializeAI() {
        console.log('Initializing AI components...');
        
        // Test AI integration on startup
        setTimeout(() => {
            this.testAIIntegration();
        }, 2000); // Give some time for everything to load
    }

    async testAIIntegration() {
        console.log('Testing AI integration...');
        
        try {
            // Test LocalLLMProvider
            if (typeof LocalLLMProvider !== 'undefined') {
                const provider = new LocalLLMProvider();
                console.log('LocalLLMProvider created successfully');
                
                // Test a simple generation
                const testResult = await provider.generateResponse('Test prompt: Say hello');
                console.log('AI test response:', testResult);
                
                this.toastView.show('AI integration test successful!', 'success');
            } else {
                console.warn('LocalLLMProvider not available');
                this.toastView.show('AI components not found', 'warning');
            }
        } catch (error) {
            console.error('AI integration test failed:', error);
            this.toastView.show('AI integration test failed: ' + error.message, 'error');
        }
    }

    initializeControllers() {
        this.timerController = new TimerController(this.timerModel, this.timerView, this.toastView);
        this.contentController = new ContentController(this.contentModel, this.contentView, this.toastView, this.configModel);
        this.flashcardController = new FlashcardController(this.flashcardModel, this.flashcardView, this.toastView);
        this.configController = new ConfigController(this.configModel, this.configView, this.contentModel, this.toastView);
        this.readerController = new ReaderController(this.readerView, this.timerModel, this.quoteModel, this.contentModel, this.toastView);
        this.viewerController = new ViewerController(this.viewerView, this.contentModel, this.toastView);
        this.achievementController = new AchievementController();
        
        // Add event listener for starting viewer
        document.addEventListener('startViewer', () => {
            this.viewerController.start();
        });
    }

    updateQuote() {
// ... existing code ...
        if (quoteElement && authorElement) {
            quoteElement.textContent = quote.text;
            authorElement.textContent = `- ${quote.author}`;
        }
    }

    handleFileSelected(file) {
// ... existing code ...
        if (this.contentModel.contentType === 'pdf') {
            this.configController.setPdfInfo(file);
        }
    }

    startStudySession(detail) {
        this.contentModel.setChunks(detail.chunks);
        const timerDuration = this.timerModel.totalSeconds / 60; // get duration in minutes
        this.readerController.startSession({ duration: timerDuration });
    }

    handleSessionComplete() {
        this.rewardSystem.addPoints(50); // Award 50 points for completing a session
        this.toastView.show('You earned 50 points!', 'success');
        this.analyticsModel.updateStudyTime(this.timerModel.totalSeconds / 60);
        this.dashboardView.updateStats(this.analyticsModel.getStats());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.app = new AppController();
    console.log('Study Companion App initialized successfully!');
});

