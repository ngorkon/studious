class ViewerView {
    constructor() {
        this.section = Utils.get('#viewer-section');
        this.title = Utils.get('#viewer-title');
        this.pdfViewer = Utils.get('#pdf-viewer');
        this.pageInfo = Utils.get('#page-info');
        this.chunkInfo = Utils.get('#chunk-info');
        this.chunkNavigation = Utils.get('#chunk-navigation');
        this.nextChunkBtn = Utils.get('#next-chunk');
        this.prevChunkBtn = Utils.get('#prev-chunk');
        this.nextPageBtn = Utils.get('#next-page');
        this.prevPageBtn = Utils.get('#prev-page');
        this.startReadingBtn = Utils.get('#start-reading');
        this.createFlashcardsBtn = Utils.get('#create-flashcards');
    }

    show() {
        this.section.classList.remove('hidden');
    }

    hide() {
        this.section.classList.add('hidden');
    }

    renderPdfPage(page) {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        this.pdfViewer.innerHTML = '';
        this.pdfViewer.appendChild(canvas);

        return page.render({ canvasContext: context, viewport: viewport }).promise;
    }

    renderVideoContent(chunk) {
        const videoHtml = `
            <div class="video-content">
                <div class="video-header">
                    <h3>${chunk.title}</h3>
                    <div class="video-time-info">
                        <span>Start: ${this.formatTime(chunk.startTime)}</span>
                        <span>End: ${this.formatTime(chunk.endTime)}</span>
                    </div>
                </div>
                <div class="video-container">
                    <iframe width="100%" height="400" 
                            src="${this.getEmbedUrl(chunk.url)}&start=${chunk.startTime}&end=${chunk.endTime}" 
                            frameborder="0" allowfullscreen>
                    </iframe>
                </div>
                <div class="video-instructions">
                    <p><i class="fas fa-info-circle"></i> This video segment runs from ${this.formatTime(chunk.startTime)} to ${this.formatTime(chunk.endTime)}.</p>
                    <p>Focus on the content in this time range for your study session.</p>
                </div>
            </div>
        `;
        this.pdfViewer.innerHTML = videoHtml;
    }

    renderTextContent(chunk) {
        const textHtml = `
            <div class="text-content">
                <div class="text-header">
                    <h3>${chunk.title}</h3>
                    <div class="text-stats">
                        <span><i class="fas fa-file-text"></i> ${chunk.wordCount} words</span>
                        <span><i class="fas fa-clock"></i> ~${Math.ceil(chunk.wordCount / 200)} min read</span>
                    </div>
                </div>
                <div class="text-container">
                    <div class="text-content-body">
                        ${this.formatTextContent(chunk.content)}
                    </div>
                </div>
                <div class="text-instructions">
                    <p><i class="fas fa-info-circle"></i> Focus on reading and understanding this text segment.</p>
                    <p>Take notes or create flashcards for key concepts.</p>
                </div>
            </div>
        `;
        this.pdfViewer.innerHTML = textHtml;
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    getEmbedUrl(url) {
        // Convert YouTube URLs to embed format
        if (url.includes('youtube.com/watch')) {
            const videoId = url.split('v=')[1]?.split('&')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('youtu.be/')) {
            const videoId = url.split('youtu.be/')[1]?.split('?')[0];
            return `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes('vimeo.com/')) {
            const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
            return `https://player.vimeo.com/video/${videoId}`;
        }
        // For other URLs, return as-is (might be direct video links)
        return url;
    }

    formatTextContent(content) {
        // Split content into paragraphs and format
        return content
            .split('\n\n')
            .map(paragraph => `<p>${paragraph.trim()}</p>`)
            .join('');
    }

    updateChunkInfo(current, total) {
        this.chunkInfo.textContent = `Chunk ${current} of ${total}`;
    }

    updatePageInfo(current, total) {
        this.pageInfo.textContent = `Page ${current} of ${total}`;
    }

    renderChunkNavigation(chunks, currentChunkIndex) {
        this.chunkNavigation.innerHTML = chunks.map((chunk, index) => `
            <button class="btn btn-sm chunk-btn ${index === currentChunkIndex ? 'active' : ''}" data-chunk="${index}">
                Chunk ${index + 1}
            </button>
        `).join('');
    }
}
