class ViewerController {
    constructor(viewerView, contentModel, toastView) {
        this.view = viewerView;
        this.model = contentModel;
        this.toast = toastView;

        this.pdfDoc = null;
        this.currentPageInChunk = 1;
        this.totalPagesInChunk = 0;

        this.bindEvents();
    }

    bindEvents() {
        this.view.nextChunkBtn.addEventListener('click', () => this.changeChunk(1));
        this.view.prevChunkBtn.addEventListener('click', () => this.changeChunk(-1));
        this.view.nextPageBtn.addEventListener('click', () => this.changePage(1));
        this.view.prevPageBtn.addEventListener('click', () => this.changePage(-1));
        this.view.startReadingBtn.addEventListener('click', () => this.startFocusMode());
        
        this.view.chunkNavigation.addEventListener('click', (e) => {
            if (e.target.classList.contains('chunk-btn')) {
                const chunkIndex = parseInt(e.target.dataset.chunk, 10);
                this.goToChunk(chunkIndex);
            }
        });
    }

    async start() {
        if (!this.model.studyChunks || this.model.studyChunks.length === 0) {
            this.toast.show('No content chunks available for viewing.', 'error');
            return;
        }
        
        this.view.show();
        
        const contentType = this.model.contentType;
        if (contentType === 'pdf') {
            if (!this.model.file) {
                this.toast.show('No PDF file selected.', 'error');
                return;
            }
            await this.loadPdf();
        }
        
        this.render();
    }

    async loadPdf() {
        try {
            const arrayBuffer = await this.model.file.arrayBuffer();
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
            this.pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        } catch (error) {
            console.error('Error loading PDF for viewer:', error);
            this.toast.show('Failed to load PDF.', 'error');
        }
    }

    render() {
        const chunkIndex = this.model.currentChunkIndex;
        const chunk = this.model.studyChunks[chunkIndex];
        const contentType = this.model.contentType;
        
        this.view.renderChunkNavigation(this.model.studyChunks, chunkIndex);
        this.view.updateChunkInfo(chunkIndex + 1, this.model.studyChunks.length);
        
        if (contentType === 'pdf') {
            this.totalPagesInChunk = chunk.endPage - chunk.startPage + 1;
            this.currentPageInChunk = 1;
            this.renderPage();
        } else if (contentType === 'video') {
            this.renderVideoChunk(chunk);
        } else if (contentType === 'text') {
            this.renderTextChunk(chunk);
        }
    }

    renderPage() {
        const chunk = this.model.studyChunks[this.model.currentChunkIndex];
        const pageNumber = chunk.startPage + this.currentPageInChunk - 1;

        this.pdfDoc.getPage(pageNumber).then(page => {
            this.view.renderPdfPage(page);
            this.view.updatePageInfo(this.currentPageInChunk, this.totalPagesInChunk);
        });
    }

    renderVideoChunk(chunk) {
        this.view.renderVideoContent(chunk);
        this.view.updatePageInfo(1, 1); // Videos have only one "page" per chunk
    }

    renderTextChunk(chunk) {
        this.view.renderTextContent(chunk);
        this.view.updatePageInfo(1, 1); // Text has only one "page" per chunk
    }

    changeChunk(direction) {
        const success = direction === 1 ? this.model.nextChunk() : this.model.prevChunk();
        if (success) {
            this.render();
        }
    }

    goToChunk(index) {
        this.model.currentChunkIndex = index;
        this.render();
    }

    changePage(direction) {
        const contentType = this.model.contentType;
        
        if (contentType === 'pdf') {
            const newPage = this.currentPageInChunk + direction;
            if (newPage > 0 && newPage <= this.totalPagesInChunk) {
                this.currentPageInChunk = newPage;
                this.renderPage();
            }
        } else {
            // For video and text, page navigation is not applicable
            // Instead, navigate between chunks
            this.changeChunk(direction);
        }
    }

    startFocusMode() {
        this.toast.show('Entering Focus Mode...', 'info');
        this.view.hide();
        const event = new CustomEvent('startFocus', { detail: {
            chunks: this.model.studyChunks,
            currentChunkIndex: this.model.currentChunkIndex
        }});
        document.dispatchEvent(event);
    }
}
