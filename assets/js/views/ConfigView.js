class ConfigView {
    constructor() {
        this.navButtons = Utils.getAll('.config-nav-btn');
        this.panels = Utils.getAll('.config-panel');
        this.chunkCountSlider = Utils.get('#chunk-count');
        this.chunkValue = Utils.get('#chunk-value');
        this.pagesPerChunk = Utils.get('#pages-per-chunk');
        this.startPageInput = Utils.get('#start-page');
        this.endPageInput = Utils.get('#end-page');
    }

    bindNavEvents(handler) {
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const panelId = btn.dataset.config;
                this.showPanel(panelId);
                handler(panelId);
            });
        });
    }

    showPanel(panelId) {
        this.navButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.config === panelId));
        this.panels.forEach(panel => panel.classList.toggle('active', panel.id === `${panelId}-config`));
    }

    updateChunkValue(value) {
        this.chunkValue.textContent = `${value} chunks`;
    }

    updatePagesPerChunk(pages) {
        this.pagesPerChunk.textContent = pages;
    }

    setTotalPages(totalPages) {
        this.endPageInput.max = totalPages;
        this.endPageInput.value = totalPages;
    }
}
