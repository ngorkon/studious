class ConfigController {
    constructor(configModel, configView, contentModel, toastView) {
        this.model = configModel;
        this.view = configView;
        this.contentModel = contentModel;
        this.toast = toastView;

        this.bindEvents();
        this.updateViewFromModel();
    }

    bindEvents() {
        this.view.bindNavEvents((panelId) => console.log(`Switched to ${panelId} config`));

        // General
        Utils.get('#study-goal').addEventListener('input', (e) => this.model.set('studyGoal', e.target.value));
        Utils.get('#study-mode').addEventListener('change', (e) => this.model.set('studyMode', e.target.value));
        Utils.getAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.model.set('difficulty', e.target.value));
        });

        // Chunking
        this.view.chunkCountSlider.addEventListener('input', (e) => this.handleChunkCountChange(e.target.value));
        this.view.startPageInput.addEventListener('change', (e) => this.handlePageRangeChange());
        this.view.endPageInput.addEventListener('change', (e) => this.handlePageRangeChange());
    }

    updateViewFromModel() {
        const config = this.model.config;
        Utils.get('#study-goal').value = config.studyGoal;
        Utils.get('#study-mode').value = config.studyMode;
        Utils.get(`input[name="difficulty"][value="${config.difficulty}"]`).checked = true;
        
        this.view.chunkCountSlider.value = config.chunkCount;
        this.view.updateChunkValue(config.chunkCount);
        
        this.view.startPageInput.value = config.pageRange.start;
        if (config.pageRange.end) {
            this.view.endPageInput.value = config.pageRange.end;
        }
    }

    handleChunkCountChange(value) {
        this.model.set('chunkCount', parseInt(value, 10));
        this.view.updateChunkValue(value);
        this.calculatePagesPerChunk();
    }

    handlePageRangeChange() {
        const start = parseInt(this.view.startPageInput.value, 10);
        const end = parseInt(this.view.endPageInput.value, 10);
        if (start > 0 && end > 0 && start <= end) {
            this.model.set('pageRange', { start, end });
            this.calculatePagesPerChunk();
        }
    }
    
    async setPdfInfo(file) {
        try {
            const pdf = await this.getPdfDocument(file);
            this.view.setTotalPages(pdf.numPages);
            this.model.set('pageRange', { start: 1, end: pdf.numPages });
            this.calculatePagesPerChunk();
        } catch (error) {
            this.toast.show('Could not read PDF metadata.', 'error');
        }
    }

    calculatePagesPerChunk() {
        const range = this.model.get('pageRange');
        const chunkCount = this.model.get('chunkCount');
        if (range.end) {
            const totalPages = range.end - range.start + 1;
            const pagesPer = Math.ceil(totalPages / chunkCount);
            this.view.updatePagesPerChunk(pagesPer);
        }
    }

    async getPdfDocument(file) {
        const arrayBuffer = await file.arrayBuffer();
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        return pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    }
}
