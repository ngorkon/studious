class ReaderView {
    constructor() {
        this.section = Utils.get('#reader-section');
        this.timerDisplay = Utils.get('#reader-timer');
        this.quoteText = Utils.get('#motivational-quote');
        this.quoteAuthor = Utils.get('#quote-author');
        this.contentContainer = Utils.get('#reader-pdf-container'); // Assuming PDF for now
        this.pdfViewer = Utils.get('#reader-pdf');
        this.pageInfo = Utils.get('#reader-page-info');
        this.exitButton = Utils.get('#exit-reader');
        this.nextButton = Utils.get('#reader-next');
        this.prevButton = Utils.get('#reader-prev');
    }

    show() {
        document.body.classList.add('in-focus-mode');
        this.section.classList.remove('hidden');
    }

    hide() {
        document.body.classList.remove('in-focus-mode');
        this.section.classList.add('hidden');
    }

    updateTimer(formattedTime) {
        this.timerDisplay.textContent = formattedTime;
    }

    updateQuote(quote) {
        this.quoteText.textContent = quote.text;
        this.quoteAuthor.textContent = `- ${quote.author}`;
    }

    renderPage(page) {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        this.pdfViewer.innerHTML = '';
        this.pdfViewer.appendChild(canvas);

        page.render({ canvasContext: context, viewport: viewport });
    }

    updatePageInfo(currentPage, totalPages) {
        this.pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    }
}
