class ContentView {
    constructor() {
        this.contentSelection = Utils.get('#content-selection');
        this.uploadSection = Utils.get('#upload-section');
        this.videoUploadSection = Utils.get('#video-upload-section');
        this.textUploadSection = Utils.get('#text-upload-section');
        this.configSection = Utils.get('#config-section');
        this.viewerSection = Utils.get('#viewer-section');

        this.contentOptions = Utils.getAll('.content-option-card');
        this.dropArea = Utils.get('#drop-area');
        this.fileInput = Utils.get('#file-input');
        this.browseBtn = Utils.get('#browse-btn');
        this.fileInfo = Utils.get('#file-info');
        this.fileName = Utils.get('.file-name');
        this.fileSize = Utils.get('.file-size');
        this.removeFileBtn = Utils.get('#remove-file');
        
        this.recentFilesContainer = Utils.get('#recent-tab');
    }

    selectContentOption(selectedType) {
        this.contentOptions.forEach(opt => {
            opt.classList.toggle('selected', opt.id === `select-${selectedType}`);
        });

        this.uploadSection.classList.toggle('hidden', selectedType !== 'pdf');
        this.videoUploadSection.classList.toggle('hidden', selectedType !== 'video');
        this.textUploadSection.classList.toggle('hidden', selectedType !== 'text');
    }

    showFileInfo(file) {
        this.fileName.textContent = file.name;
        this.fileSize.textContent = `${(file.size / 1024 / 1024).toFixed(2)} MB`;
        this.fileInfo.classList.remove('hidden');
        this.dropArea.classList.add('hidden');
    }

    hideFileInfo() {
        this.fileInfo.classList.add('hidden');
        this.dropArea.classList.remove('hidden');
    }
    
    showConfig() {
        this.uploadSection.classList.add('hidden');
        this.videoUploadSection.classList.add('hidden');
        this.textUploadSection.classList.add('hidden');
        this.configSection.classList.remove('hidden');
    }

    renderRecentFiles(files) {
        if (files.length === 0) {
            this.recentFilesContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>No recent documents. Upload a PDF to get started.</p>
                </div>`;
            return;
        }

        this.recentFilesContainer.innerHTML = files.map(file => `
            <div class="recent-file-item" data-filename="${file.name}">
                <i class="fas fa-file-pdf"></i>
                <span>${file.name}</span>
            </div>
        `).join('');
    }
}

