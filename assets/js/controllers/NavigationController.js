class NavigationController {
    constructor() {
        this.currentSection = 'dashboard-section';
        this.init();
    }

    init() {
        this.bindEvents();
        this.showSection(this.currentSection);
    }

    bindEvents() {
        // Navigation button clicks
        document.addEventListener('click', (e) => {
            const navBtn = e.target.closest('.nav-btn');
            if (navBtn) {
                const sectionId = navBtn.dataset.section;
                this.showSection(sectionId);
                this.setActiveNavButton(navBtn);
            }
        });

        // Handle custom events for section changes
        document.addEventListener('showSection', (e) => {
            this.showSection(e.detail.sectionId);
        });
    }

    showSection(sectionId) {
        console.log('Showing section:', sectionId);
        
        // Hide all sections
        this.hideAllSections();
        
        // Show the requested section
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.remove('hidden');
            this.currentSection = sectionId;
            
            // Update active navigation button
            this.setActiveNavButtonBySection(sectionId);
        } else {
            console.warn('Section not found:', sectionId);
        }
    }

    hideAllSections() {
        const sections = [
            'dashboard-section',
            'content-selection',
            'pdf-upload-section',
            'video-upload-section', 
            'text-upload-section',
            'config-section',
            'viewer-section',
            'video-viewer-section',
            'text-viewer-section',
            'reader-section',
            'flashcards-section',
            'timer-section',
            'smart-schedule-section',
            'achievements-modal-section'
        ];

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            if (section) {
                section.classList.add('hidden');
            }
        });
    }

    setActiveNavButton(button) {
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
    }

    setActiveNavButtonBySection(sectionId) {
        // Remove active class from all nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Map sections to nav buttons
        let navSection = sectionId;
        if (sectionId.includes('upload') || sectionId === 'content-selection') {
            navSection = 'content-selection';
        } else if (sectionId.includes('viewer') || sectionId === 'reader-section') {
            navSection = 'content-selection'; // Content viewing is part of content flow
        }
        
        // Add active class to corresponding button
        const navBtn = document.querySelector(`[data-section="${navSection}"]`);
        if (navBtn) {
            navBtn.classList.add('active');
        }
    }

    // Public method to programmatically change sections
    navigateTo(sectionId) {
        this.showSection(sectionId);
    }

    // Get current section
    getCurrentSection() {
        return this.currentSection;
    }
}

// Export for use in other modules
window.NavigationController = NavigationController;
