class FlashcardController {
    constructor(flashcardModel, flashcardView, toastView) {
        this.model = flashcardModel;
        this.view = flashcardView;
        this.toast = toastView;
        this.aiGenerator = null;

        this.bindEvents();
        this.initializeAIGenerator();
    }

    initializeAIGenerator() {
        // Initialize AI Flashcard Generator
        try {
            this.aiGenerator = new AIFlashcardGenerator();
            console.log('AI Flashcard Generator initialized successfully');
        } catch (error) {
            console.error('Failed to initialize AI Flashcard Generator:', error);
        }
    }

    bindEvents() {
        Utils.get('#create-flashcards').addEventListener('click', () => this.createFlashcards());
        Utils.get('#exit-flashcards').addEventListener('click', () => this.exit());

        // Traditional flashcard controls
        Utils.get('#flashcard-flip').addEventListener('click', () => this.view.flip());
        Utils.get('#flashcard-next').addEventListener('click', () => this.next());
        Utils.get('#flashcard-prev').addEventListener('click', () => this.prev());
        Utils.get('#shuffle-cards').addEventListener('click', () => this.shuffle());

        // Difficulty controls
        Utils.get('#know-card').addEventListener('click', () => this.setDifficulty('easy'));
        Utils.get('#partial-know-card').addEventListener('click', () => this.setDifficulty('medium'));
        Utils.get('#dont-know-card').addEventListener('click', () => this.setDifficulty('hard'));

        // AI-powered features
        const aiGenerateBtn = Utils.get('#ai-generate-flashcards');
        if (aiGenerateBtn) {
            aiGenerateBtn.addEventListener('click', () => this.showAIGenerator());
        }

        const smartReviewBtn = Utils.get('#smart-review-flashcards');
        if (smartReviewBtn) {
            smartReviewBtn.addEventListener('click', () => this.startSmartReview());
        }

        const aiSettingsBtn = Utils.get('#ai-flashcard-settings');
        if (aiSettingsBtn) {
            aiSettingsBtn.addEventListener('click', () => this.showAISettings());
        }

        // Auto-generate from current content
        const autoGenerateBtn = Utils.get('#auto-generate-from-content');
        if (autoGenerateBtn) {
            autoGenerateBtn.addEventListener('click', () => this.autoGenerateFromCurrentContent());
        }
    }

    createFlashcards() {
        // Check if we have current content to use
        const currentContent = this.getCurrentContent();
        
        if (currentContent && currentContent.trim().length > 50) {
            // Ask user if they want to use AI or traditional generation
            this.showGenerationChoice(currentContent);
        } else {
            // Fall back to sample text for traditional generation
            const sampleText = "The quick brown fox jumps over the lazy dog. The five boxing wizards jump quickly. Pack my box with five dozen liquor jugs. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";
            this.generateTraditionalCards(sampleText);
        }
    }

    getCurrentContent() {
        // Get content from the current content model
        if (window.app && window.app.contentModel) {
            const contentModel = window.app.contentModel;
            
            // Try to get content from various sources
            if (contentModel.currentContent) {
                if (contentModel.currentContent.type === 'pdf' && contentModel.currentContent.text) {
                    return contentModel.currentContent.text.join(' ');
                } else if (contentModel.currentContent.type === 'text' && contentModel.currentContent.content) {
                    return contentModel.currentContent.content;
                } else if (contentModel.currentContent.type === 'video' && contentModel.currentContent.transcript) {
                    return contentModel.currentContent.transcript;
                }
            }
        }
        
        // Check if there's text in viewer
        const viewerContent = Utils.get('#viewer-content');
        if (viewerContent && viewerContent.textContent.trim().length > 50) {
            return viewerContent.textContent;
        }
        
        return null;
    }

    showGenerationChoice(content) {
        const modal = this.createGenerationChoiceModal(content);
        document.body.appendChild(modal);
    }

    createGenerationChoiceModal(content) {
        const modal = document.createElement('div');
        modal.className = 'modal generation-choice-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-magic"></i> Choose Flashcard Generation Method</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="generation-options">
                        <div class="generation-option ai-option" data-method="ai">
                            <div class="option-icon">
                                <i class="fas fa-robot"></i>
                            </div>
                            <h3>AI-Powered Generation</h3>
                            <p>Generate intelligent, contextual flashcards using advanced AI models. Includes explanations, mnemonics, and adaptive difficulty.</p>
                            <ul class="features-list">
                                <li><i class="fas fa-check"></i> Context-aware questions</li>
                                <li><i class="fas fa-check"></i> Multiple question types</li>
                                <li><i class="fas fa-check"></i> Memory techniques</li>
                                <li><i class="fas fa-check"></i> Adaptive difficulty</li>
                                <li><i class="fas fa-check"></i> Learning analytics</li>
                            </ul>
                            <div class="option-badge premium">Premium Feature</div>
                        </div>
                        
                        <div class="generation-option traditional-option" data-method="traditional">
                            <div class="option-icon">
                                <i class="fas fa-list-alt"></i>
                            </div>
                            <h3>Traditional Generation</h3>
                            <p>Quick and simple flashcard generation based on sentence extraction and keyword identification.</p>
                            <ul class="features-list">
                                <li><i class="fas fa-check"></i> Fast generation</li>
                                <li><i class="fas fa-check"></i> Basic Q&A format</li>
                                <li><i class="fas fa-check"></i> No setup required</li>
                            </ul>
                            <div class="option-badge free">Free</div>
                        </div>
                    </div>
                    
                    <div class="content-preview">
                        <h4>Content Preview:</h4>
                        <div class="content-sample">${content.substring(0, 200)}...</div>
                        <div class="content-stats">
                            <span>${content.split(' ').length} words</span>
                            <span>~${Math.ceil(content.split(' ').length / 20)} potential cards</span>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancel</button>
                </div>
            </div>
        `;
        
        // Bind option selection
        modal.querySelectorAll('.generation-option').forEach(option => {
            option.addEventListener('click', () => {
                const method = option.dataset.method;
                modal.remove();
                
                if (method === 'ai') {
                    this.showAIGenerator();
                } else {
                    this.generateTraditionalCards(content);
                }
            });
        });
        
        return modal;
    }

    generateTraditionalCards(content) {
        const cards = this.model.generateFromText(content);
        if (cards.length > 0) {
            this.view.show();
            this.updateView();
            this.toast.show(`${cards.length} flashcards created using traditional method.`, 'success');
        } else {
            this.toast.show('Could not generate flashcards from the content.', 'warning');
        }
    }

    showAIGenerator() {
        if (this.aiGenerator) {
            this.aiGenerator.showAIGeneratorModal();
        } else {
            this.toast.show('AI Generator not available. Please check your configuration.', 'error');
        }
    }

    startSmartReview() {
        if (this.aiGenerator) {
            this.aiGenerator.startSmartReview();
        } else {
            this.toast.show('Smart Review requires AI features to be enabled.', 'warning');
        }
    }

    showAISettings() {
        if (this.aiGenerator) {
            // Show AI settings in a modal
            const modal = this.createAISettingsModal();
            document.body.appendChild(modal);
        } else {
            this.toast.show('AI settings not available.', 'error');
        }
    }

    autoGenerateFromCurrentContent() {
        const content = this.getCurrentContent();
        
        if (!content || content.trim().length < 50) {
            this.toast.show('No sufficient content available for generation. Please load a document first.', 'warning');
            return;
        }

        if (this.aiGenerator) {
            // Quick AI generation with default settings
            const options = {
                contentType: 'text',
                difficulty: 'intermediate',
                cardCount: 10,
                subject: 'general',
                preferredModel: 'openai'
            };

            this.aiGenerator.generateFlashcardsFromContent(content, options)
                .then(flashcards => {
                    this.toast.show(`Generated ${flashcards.length} AI flashcards from current content!`, 'success');
                })
                .catch(error => {
                    console.error('Auto-generation error:', error);
                    this.toast.show('Failed to auto-generate flashcards. Try manual generation.', 'error');
                });
        } else {
            // Fall back to traditional generation
            this.generateTraditionalCards(content);
        }
    }

    createAISettingsModal() {
        const modal = document.createElement('div');
        modal.className = 'modal ai-settings-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-cog"></i> AI Flashcard Settings</h2>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="modal-body">
                    <div class="settings-section">
                        <h3>Default Generation Settings</h3>
                        
                        <div class="setting-group">
                            <label>Preferred AI Model:</label>
                            <select id="default-ai-model">
                                <option value="openai">GPT-3.5/4 (OpenAI)</option>
                                <option value="anthropic">Claude (Anthropic)</option>
                                <option value="google">Gemini (Google)</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>Default Difficulty:</label>
                            <select id="default-difficulty">
                                <option value="beginner">Beginner</option>
                                <option value="intermediate" selected>Intermediate</option>
                                <option value="advanced">Advanced</option>
                            </select>
                        </div>
                        
                        <div class="setting-group">
                            <label>Default Card Count:</label>
                            <input type="range" id="default-card-count" min="5" max="50" value="15" step="5">
                            <span class="range-value">15 cards</span>
                        </div>
                        
                        <div class="setting-group">
                            <label>Auto-detect Subject:</label>
                            <input type="checkbox" id="auto-detect-subject" checked>
                            <small>Automatically detect subject matter from content</small>
                        </div>
                        
                        <div class="setting-group">
                            <label>Include Explanations:</label>
                            <input type="checkbox" id="include-explanations" checked>
                            <small>Add detailed explanations to answers</small>
                        </div>
                        
                        <div class="setting-group">
                            <label>Generate Mnemonics:</label>
                            <input type="checkbox" id="generate-mnemonics" checked>
                            <small>Create memory aids for complex concepts</small>
                        </div>
                    </div>
                    
                    <div class="settings-section">
                        <h3>Learning Analytics</h3>
                        
                        <div class="analytics-preview">
                            <div class="stat-card">
                                <div class="stat-value">${this.model.flashcards.length}</div>
                                <div class="stat-label">Total Cards</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${this.model.flashcards.filter(c => c.aiGenerated).length}</div>
                                <div class="stat-label">AI Generated</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value">${this.calculateAveragePerformance()}%</div>
                                <div class="stat-label">Avg Performance</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="modal-footer">
                    <button class="btn btn-outline" onclick="this.closest('.modal').remove()">Cancel</button>
                    <button class="btn btn-primary" id="save-ai-settings">Save Settings</button>
                </div>
            </div>
        `;
        
        // Bind save settings
        const saveBtn = modal.querySelector('#save-ai-settings');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveAISettings(modal);
                modal.remove();
            });
        }
        
        return modal;
    }

    saveAISettings(modal) {
        const settings = {
            preferredModel: modal.querySelector('#default-ai-model').value,
            defaultDifficulty: modal.querySelector('#default-difficulty').value,
            cardCount: parseInt(modal.querySelector('#default-card-count').value),
            autoDetectSubject: modal.querySelector('#auto-detect-subject').checked,
            includeExplanations: modal.querySelector('#include-explanations').checked,
            generateMnemonics: modal.querySelector('#generate-mnemonics').checked
        };
        
        localStorage.setItem('ai_flashcard_preferences', JSON.stringify(settings));
        this.toast.show('AI settings saved successfully!', 'success');
    }

    calculateAveragePerformance() {
        const cardsWithPerformance = this.model.flashcards.filter(c => c.performance && c.performance.attempts > 0);
        if (cardsWithPerformance.length === 0) return 0;
        
        const totalPerformance = cardsWithPerformance.reduce((sum, card) => {
            return sum + (card.performance.correct / card.performance.attempts);
        }, 0);
        
        return Math.round((totalPerformance / cardsWithPerformance.length) * 100);
    }

    updateView() {
        const card = this.model.getCurrentCard();
        this.view.renderCard(card, this.model.currentCardIndex, this.model.flashcards.length);
        this.updateStats();
    }

    next() {
        if (this.model.nextCard()) {
            this.updateView();
        } else {
            this.toast.show("You've reached the end of the deck!", 'info');
        }
    }

    prev() {
        if (this.model.prevCard()) {
            this.updateView();
        }
    }

    shuffle() {
        this.model.shuffle();
        this.updateView();
        this.toast.show('Cards shuffled.', 'info');
    }

    setDifficulty(level) {
        this.model.setCardDifficulty(level);
        this.updateStats();
        this.next();
    }

    updateStats() {
        const stats = {
            known: this.model.flashcards.filter(c => c.difficulty === 'easy').length,
            practice: this.model.flashcards.filter(c => c.difficulty === 'medium' || c.difficulty === 'hard').length,
            remaining: this.model.flashcards.filter(c => c.difficulty === 'new').length
        };
        this.view.updateStats(stats);
    }

    exit() {
        this.view.hide();
        // You might want to show the viewer section again
        Utils.get('#viewer-section').classList.remove('hidden');
    }
}

