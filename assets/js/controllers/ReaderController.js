class ReaderController {
    constructor(readerView, timerModel, quoteModel, contentModel, toastView) {
        this.view = readerView;
        this.timer = timerModel;
        this.quoteModel = quoteModel;
        this.contentModel = contentModel;
        this.toast = toastView;

        this.pdfDoc = null;
        this.currentPage = 1;
        this.totalPages = 0;

        this.bindEvents();
    }

    bindEvents() {
        this.view.exitButton.addEventListener('click', () => this.exitSession());
        this.view.nextButton.addEventListener('click', () => this.nextPage());
        this.view.prevButton.addEventListener('click', () => this.prevPage());

        this.timer.onTick = (time) => this.view.updateTimer(Utils.formatTime(time));
        this.timer.onComplete = () => this.handleSessionComplete();
    }

    async startSession(config) {
        this.view.show();
        this.view.updateQuote(this.quoteModel.getRandomQuote());

        this.timer.setDuration(config.duration);
        this.timer.start();

        if (this.contentModel.contentType === 'pdf' && this.contentModel.file) {
            await this.loadPdf(this.contentModel.file);
        }
        
        // Hide other sections
        Utils.getAll('main > section:not(#reader-section)').forEach(s => s.classList.add('hidden'));
    }

    async loadPdf(file) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            this.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            
            this.currentPage = this.contentModel.studyChunks[this.contentModel.currentChunkIndex].startPage;
            this.renderCurrentPage();
        } catch (error) {
            console.error('Error loading PDF:', error);
            this.toast.show('Failed to load PDF for study session.', 'error');
            this.exitSession();
        }
    }

    renderCurrentPage() {
        this.pdfDoc.getPage(this.currentPage).then(page => {
            const currentChunk = this.contentModel.studyChunks[this.contentModel.currentChunkIndex];
            this.totalPages = (currentChunk.endPage - currentChunk.startPage) + 1;
            const pageInChunk = this.currentPage - currentChunk.startPage + 1;

            this.view.renderPage(page);
            this.view.updatePageInfo(pageInChunk, this.totalPages);
        });
    }

    nextPage() {
        const currentChunk = this.contentModel.studyChunks[this.contentModel.currentChunkIndex];
        if (this.currentPage < currentChunk.endPage) {
            this.currentPage++;
            this.renderCurrentPage();
        } else {
            this.toast.show("You've reached the end of this chunk.", 'info');
        }
    }

    prevPage() {
        const currentChunk = this.contentModel.studyChunks[this.contentModel.currentChunkIndex];
        if (this.currentPage > currentChunk.startPage) {
            this.currentPage--;
            this.renderCurrentPage();
        }
    }

    exitSession() {
        this.timer.stop();
        this.view.hide();
        // Show the main sections again
        Utils.get('#dashboard-section').classList.remove('hidden');
        Utils.get('#content-selection').classList.remove('hidden');
        Utils.get('#upload-section').classList.remove('hidden');
    }

    handleSessionComplete() {
        this.toast.show("Study session complete! Great work.", 'success');
        // Trigger reward system
        const event = new CustomEvent('sessionComplete');
        document.dispatchEvent(event);
        this.exitSession();
    }
}
