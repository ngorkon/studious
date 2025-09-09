class FlashcardView {
    constructor() {
        this.section = Utils.get('#flashcards-section');
        this.flashcard = Utils.get('#flashcard');
        this.front = Utils.get('.flashcard-front h3');
        this.back = Utils.get('.flashcard-back h3');
        this.progress = Utils.get('#flashcard-progress');
        this.knownCount = Utils.get('#known-count');
        this.practiceCount = Utils.get('#practice-count');
        this.remainingCount = Utils.get('#remaining-count');
        
        this.enhanceFlashcardDisplay();
    }

    show() {
        this.section.classList.remove('hidden');
    }

    hide() {
        this.section.classList.add('hidden');
    }

    renderCard(card, index, total) {
        if (card) {
            this.front.textContent = card.question;
            this.back.textContent = card.answer;
            this.progress.textContent = `${index + 1}/${total}`;
            
            // Enhanced rendering for AI-generated cards
            this.renderEnhancedCard(card);
            this.flipToFront();
        }
    }

    renderEnhancedCard(card) {
        // Clear previous enhancements
        this.clearEnhancements();
        
        if (card.aiGenerated || card.metadata) {
            this.addAIEnhancements(card);
        }
        
        // Add difficulty indicator
        this.addDifficultyIndicator(card);
        
        // Add card type indicator
        this.addTypeIndicator(card);
    }

    addAIEnhancements(card) {
        const flashcardContainer = this.flashcard;
        
        // Add AI badge
        const aiBadge = document.createElement('div');
        aiBadge.className = 'ai-badge';
        aiBadge.innerHTML = '<i class="fas fa-robot"></i> AI';
        flashcardContainer.appendChild(aiBadge);
        
        // Add hint button if hint exists
        if (card.hint) {
            this.addHintButton(card.hint);
        }
        
        // Add explanation button if explanation exists
        if (card.explanation) {
            this.addExplanationButton(card.explanation);
        }
        
        // Add mnemonic if available
        if (card.mnemonic) {
            this.addMnemonicDisplay(card.mnemonic);
        }
        
        // Add visual aids suggestions
        if (card.metadata && card.metadata.visualAids) {
            this.addVisualAidsButton(card.metadata.visualAids);
        }
        
        // Add study techniques suggestions
        if (card.metadata && card.metadata.studyTechniques) {
            this.addStudyTechniquesButton(card.metadata.studyTechniques);
        }
    }

    addHintButton(hint) {
        const hintBtn = document.createElement('button');
        hintBtn.className = 'card-enhancement-btn hint-btn';
        hintBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Hint';
        hintBtn.onclick = () => this.showHint(hint);
        
        const frontCard = this.flashcard.querySelector('.flashcard-front');
        frontCard.appendChild(hintBtn);
    }

    addExplanationButton(explanation) {
        const explainBtn = document.createElement('button');
        explainBtn.className = 'card-enhancement-btn explanation-btn';
        explainBtn.innerHTML = '<i class="fas fa-info-circle"></i> Explain';
        explainBtn.onclick = () => this.showExplanation(explanation);
        
        const backCard = this.flashcard.querySelector('.flashcard-back');
        backCard.appendChild(explainBtn);
    }

    addMnemonicDisplay(mnemonic) {
        const mnemonicDiv = document.createElement('div');
        mnemonicDiv.className = 'mnemonic-display';
        mnemonicDiv.innerHTML = `
            <div class="mnemonic-header">
                <i class="fas fa-brain"></i> Memory Aid
            </div>
            <div class="mnemonic-content">${mnemonic}</div>
        `;
        
        const backCard = this.flashcard.querySelector('.flashcard-back');
        backCard.appendChild(mnemonicDiv);
    }

    addDifficultyIndicator(card) {
        const difficultyDiv = document.createElement('div');
        difficultyDiv.className = `difficulty-indicator difficulty-${card.difficulty || 3}`;
        
        const stars = Array(5).fill().map((_, i) => 
            i < (card.difficulty || 3) ? '★' : '☆'
        ).join('');
        
        difficultyDiv.innerHTML = `<span class="difficulty-stars">${stars}</span>`;
        this.flashcard.appendChild(difficultyDiv);
    }

    addTypeIndicator(card) {
        if (card.type && card.type !== 'recall') {
            const typeDiv = document.createElement('div');
            typeDiv.className = `type-indicator type-${card.type}`;
            
            const typeLabels = {
                'concept': 'Concept',
                'application': 'Application', 
                'critical': 'Critical Thinking',
                'problem': 'Problem Solving'
            };
            
            typeDiv.textContent = typeLabels[card.type] || card.type;
            this.flashcard.appendChild(typeDiv);
        }
    }

    addVisualAidsButton(visualAids) {
        const visualBtn = document.createElement('button');
        visualBtn.className = 'card-enhancement-btn visual-aids-btn';
        visualBtn.innerHTML = '<i class="fas fa-image"></i> Visual Aids';
        visualBtn.onclick = () => this.showVisualAids(visualAids);
        
        const frontCard = this.flashcard.querySelector('.flashcard-front');
        frontCard.appendChild(visualBtn);
    }

    addStudyTechniquesButton(techniques) {
        const techniquesBtn = document.createElement('button');
        techniquesBtn.className = 'card-enhancement-btn techniques-btn';
        techniquesBtn.innerHTML = '<i class="fas fa-graduation-cap"></i> Study Tips';
        techniquesBtn.onclick = () => this.showStudyTechniques(techniques);
        
        const backCard = this.flashcard.querySelector('.flashcard-back');
        backCard.appendChild(techniquesBtn);
    }

    showHint(hint) {
        this.showEnhancementModal('Hint', hint, 'fas fa-lightbulb');
    }

    showExplanation(explanation) {
        this.showEnhancementModal('Detailed Explanation', explanation, 'fas fa-info-circle');
    }

    showVisualAids(visualAids) {
        const content = `
            <div class="visual-aids-content">
                <p>Recommended visual learning aids for this concept:</p>
                <ul>
                    ${visualAids.map(aid => `<li><i class="fas fa-check"></i> ${aid}</li>`).join('')}
                </ul>
                <p><small>Try creating these visual aids to enhance your understanding!</small></p>
            </div>
        `;
        this.showEnhancementModal('Visual Learning Aids', content, 'fas fa-image');
    }

    showStudyTechniques(techniques) {
        const content = `
            <div class="study-techniques-content">
                <p>Recommended study techniques for this card:</p>
                <ul>
                    ${techniques.map(technique => `<li><i class="fas fa-check"></i> ${technique}</li>`).join('')}
                </ul>
                <p><small>Experiment with these techniques to find what works best for you!</small></p>
            </div>
        `;
        this.showEnhancementModal('Study Techniques', content, 'fas fa-graduation-cap');
    }

    showEnhancementModal(title, content, icon) {
        const modal = document.createElement('div');
        modal.className = 'modal enhancement-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="${icon}"></i> ${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                <div class="modal-footer">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">Got it!</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (modal.parentNode) {
                modal.remove();
            }
        }, 10000);
    }

    clearEnhancements() {
        // Remove previous enhancement elements
        const enhancements = this.flashcard.querySelectorAll('.ai-badge, .card-enhancement-btn, .mnemonic-display, .difficulty-indicator, .type-indicator');
        enhancements.forEach(element => element.remove());
    }

    enhanceFlashcardDisplay() {
        // Add AI-powered controls to the flashcard interface
        this.addAIControls();
    }

    addAIControls() {
        const flashcardsSection = this.section;
        
        // Check if AI controls already exist
        if (flashcardsSection.querySelector('.ai-controls')) {
            return;
        }
        
        // Create AI controls container
        const aiControls = document.createElement('div');
        aiControls.className = 'ai-controls';
        aiControls.innerHTML = `
            <div class="ai-control-group">
                <button id="ai-generate-flashcards" class="btn btn-ai">
                    <i class="fas fa-robot"></i> AI Generate
                </button>
                <button id="smart-review-flashcards" class="btn btn-ai">
                    <i class="fas fa-brain"></i> Smart Review
                </button>
                <button id="auto-generate-from-content" class="btn btn-ai">
                    <i class="fas fa-magic"></i> Auto Generate
                </button>
                <button id="ai-flashcard-settings" class="btn btn-outline">
                    <i class="fas fa-cog"></i> AI Settings
                </button>
            </div>
        `;
        
        // Insert AI controls before the flashcard display
        const flashcardDisplay = flashcardsSection.querySelector('.flashcard-display');
        if (flashcardDisplay) {
            flashcardsSection.insertBefore(aiControls, flashcardDisplay);
        } else {
            flashcardsSection.appendChild(aiControls);
        }
    }

    updateStats(stats) {
        this.knownCount.textContent = stats.known;
        this.practiceCount.textContent = stats.practice;
        this.remainingCount.textContent = stats.remaining;
        
        // Add AI-generated stats if available
        this.updateAIStats(stats);
    }

    updateAIStats(stats) {
        // Create or update AI statistics display
        let aiStatsContainer = this.section.querySelector('.ai-stats-container');
        
        if (!aiStatsContainer) {
            aiStatsContainer = document.createElement('div');
            aiStatsContainer.className = 'ai-stats-container';
            
            const statsContainer = this.section.querySelector('.flashcard-stats');
            if (statsContainer) {
                statsContainer.appendChild(aiStatsContainer);
            }
        }
        
        // Calculate AI-specific statistics
        const aiGeneratedCount = stats.aiGenerated || 0;
        const totalCards = stats.known + stats.practice + stats.remaining;
        const aiPercentage = totalCards > 0 ? Math.round((aiGeneratedCount / totalCards) * 100) : 0;
        
        aiStatsContainer.innerHTML = `
            <div class="ai-stat-item">
                <i class="fas fa-robot"></i>
                <span class="ai-stat-label">AI Generated:</span>
                <span class="ai-stat-value">${aiGeneratedCount} (${aiPercentage}%)</span>
            </div>
        `;
    }

    flip() {
        this.flashcard.classList.toggle('flipped');
    }

    flipToFront() {
        this.flashcard.classList.remove('flipped');
    }
}

