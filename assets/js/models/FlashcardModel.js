class FlashcardModel {
    constructor(store) {
        this.store = store;
        this.flashcards = [];
        this.currentCardIndex = 0;
        this.loadSavedCards();
    }

    loadSavedCards() {
        const savedCards = this.store.get('flashcards') || [];
        this.flashcards = savedCards;
        this.currentCardIndex = 0;
    }

    saveCards() {
        this.store.set('flashcards', this.flashcards);
    }

    generateFromText(text, numCards = 5) {
        // A simple (naive) way to generate flashcards.
        // In a real app, this would use a more sophisticated NLP approach.
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
        const potentialCards = sentences.filter(s => s.length > 20 && s.length < 150);
        
        const newCards = potentialCards.slice(0, numCards).map((sentence, index) => {
            const parts = sentence.split(' ');
            const splitPoint = Math.floor(parts.length / 2);
            const question = parts.slice(0, splitPoint).join(' ') + '...';
            const answer = '...' + parts.slice(splitPoint).join(' ');
            
            return {
                id: Date.now() + index,
                question: question,
                answer: answer,
                difficulty: 'new', // 'easy', 'medium', 'hard'
                type: 'recall',
                aiGenerated: false,
                createdAt: new Date().toISOString(),
                performance: {
                    attempts: 0,
                    correct: 0,
                    averageResponseTime: 0,
                    lastReviewed: null,
                    masteryLevel: 0
                }
            };
        });
        
        this.flashcards = [...this.flashcards, ...newCards];
        this.currentCardIndex = this.flashcards.length - newCards.length;
        this.saveCards();
        
        return newCards;
    }

    addCard(card) {
        // Add a single card (typically from AI generation)
        const newCard = {
            id: card.id || Date.now() + Math.random(),
            question: card.question,
            answer: card.answer,
            difficulty: card.difficulty || 3,
            type: card.type || 'recall',
            hint: card.hint || null,
            explanation: card.explanation || null,
            tags: card.tags || [],
            aiGenerated: card.aiGenerated || false,
            metadata: card.metadata || {},
            createdAt: new Date().toISOString(),
            performance: card.performance || {
                attempts: 0,
                correct: 0,
                averageResponseTime: 0,
                lastReviewed: null,
                masteryLevel: 0,
                difficulty_adjustment: 0
            },
            spacedRepetitionData: {
                interval: 1,
                repetition: 0,
                easeFactor: 2.5,
                nextReview: new Date()
            }
        };
        
        this.flashcards.push(newCard);
        this.saveCards();
        return newCard;
    }

    addCards(cards) {
        // Add multiple cards at once
        const addedCards = cards.map(card => this.addCard(card));
        return addedCards;
    }

    removeCard(cardId) {
        const index = this.flashcards.findIndex(card => card.id === cardId);
        if (index !== -1) {
            this.flashcards.splice(index, 1);
            
            // Adjust current index if necessary
            if (this.currentCardIndex >= this.flashcards.length) {
                this.currentCardIndex = Math.max(0, this.flashcards.length - 1);
            }
            
            this.saveCards();
            return true;
        }
        return false;
    }

    updateCard(cardId, updates) {
        const card = this.flashcards.find(c => c.id === cardId);
        if (card) {
            Object.assign(card, updates);
            this.saveCards();
            return card;
        }
        return null;
    }

    getCurrentCard() {
        return this.flashcards[this.currentCardIndex];
    }

    nextCard() {
        if (this.currentCardIndex < this.flashcards.length - 1) {
            this.currentCardIndex++;
            return true;
        }
        return false;
    }

    prevCard() {
        if (this.currentCardIndex > 0) {
            this.currentCardIndex--;
            return true;
        }
        return false;
    }

    setCardDifficulty(difficulty) {
        const card = this.getCurrentCard();
        if (card) {
            card.difficulty = difficulty;
            
            // Update performance tracking
            this.recordCardPerformance(card, difficulty);
            this.saveCards();
        }
    }

    recordCardPerformance(card, difficulty) {
        if (!card.performance) {
            card.performance = {
                attempts: 0,
                correct: 0,
                averageResponseTime: 0,
                lastReviewed: null,
                masteryLevel: 0
            };
        }
        
        card.performance.attempts++;
        card.performance.lastReviewed = new Date().toISOString();
        
        // Update correctness based on difficulty
        if (difficulty === 'easy') {
            card.performance.correct++;
            card.performance.masteryLevel = Math.min(5, card.performance.masteryLevel + 0.5);
        } else if (difficulty === 'medium') {
            card.performance.masteryLevel = Math.max(0, card.performance.masteryLevel - 0.1);
        } else {
            card.performance.masteryLevel = Math.max(0, card.performance.masteryLevel - 0.3);
        }
        
        // Update spaced repetition data
        this.updateSpacedRepetition(card, difficulty);
    }

    updateSpacedRepetition(card, difficulty) {
        if (!card.spacedRepetitionData) {
            card.spacedRepetitionData = {
                interval: 1,
                repetition: 0,
                easeFactor: 2.5,
                nextReview: new Date()
            };
        }
        
        const srs = card.spacedRepetitionData;
        
        if (difficulty === 'easy') {
            srs.repetition++;
            srs.easeFactor = Math.max(1.3, srs.easeFactor + 0.1);
            
            if (srs.repetition === 1) {
                srs.interval = 1;
            } else if (srs.repetition === 2) {
                srs.interval = 6;
            } else {
                srs.interval = Math.round(srs.interval * srs.easeFactor);
            }
        } else {
            srs.repetition = 0;
            srs.interval = 1;
            srs.easeFactor = Math.max(1.3, srs.easeFactor - 0.2);
        }
        
        // Calculate next review date
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + srs.interval);
        srs.nextReview = nextReview;
    }

    getCardsDueForReview() {
        const now = new Date();
        return this.flashcards.filter(card => {
            if (!card.spacedRepetitionData) return true;
            return new Date(card.spacedRepetitionData.nextReview) <= now;
        });
    }

    getCardsByDifficulty(difficulty) {
        return this.flashcards.filter(card => card.difficulty === difficulty);
    }

    getAIGeneratedCards() {
        return this.flashcards.filter(card => card.aiGenerated);
    }

    getCardsByType(type) {
        return this.flashcards.filter(card => card.type === type);
    }

    getCardsByTag(tag) {
        return this.flashcards.filter(card => 
            card.tags && card.tags.includes(tag)
        );
    }

    searchCards(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.flashcards.filter(card => 
            card.question.toLowerCase().includes(lowercaseQuery) ||
            card.answer.toLowerCase().includes(lowercaseQuery) ||
            (card.tags && card.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery)))
        );
    }

    getPerformanceStats() {
        const totalCards = this.flashcards.length;
        const aiCards = this.getAIGeneratedCards().length;
        
        const performanceData = this.flashcards.reduce((acc, card) => {
            if (card.performance && card.performance.attempts > 0) {
                acc.totalAttempts += card.performance.attempts;
                acc.totalCorrect += card.performance.correct;
                acc.cardsWithData++;
            }
            return acc;
        }, { totalAttempts: 0, totalCorrect: 0, cardsWithData: 0 });
        
        const averageAccuracy = performanceData.cardsWithData > 0 
            ? (performanceData.totalCorrect / performanceData.totalAttempts) * 100 
            : 0;
        
        return {
            totalCards,
            aiCards,
            traditionalCards: totalCards - aiCards,
            averageAccuracy: Math.round(averageAccuracy),
            cardsWithPerformanceData: performanceData.cardsWithData,
            cardsDueForReview: this.getCardsDueForReview().length
        };
    }

    shuffle() {
        for (let i = this.flashcards.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.flashcards[i], this.flashcards[j]] = [this.flashcards[j], this.flashcards[i]];
        }
        this.currentCardIndex = 0;
        this.saveCards();
    }

    clearAllCards() {
        this.flashcards = [];
        this.currentCardIndex = 0;
        this.saveCards();
    }

    exportCards() {
        // Export cards to JSON for backup or sharing
        return {
            cards: this.flashcards,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    importCards(exportData) {
        // Import cards from JSON
        if (exportData.cards && Array.isArray(exportData.cards)) {
            this.flashcards = [...this.flashcards, ...exportData.cards];
            this.saveCards();
            return exportData.cards.length;
        }
        return 0;
    }
}

