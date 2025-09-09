class ContentModel {
    constructor(store) {
        this.store = store;
        this.contentType = 'pdf'; // 'pdf', 'video', 'text'
        this.file = null;
        this.fileInfo = null;
        this.videoData = null; // For video content
        this.textData = null;  // For text content
        this.recentFiles = this.store.get('recentFiles') || [];
        this.studyChunks = [];
        this.currentChunkIndex = 0;
    }

    setContentType(type) {
        this.contentType = type;
    }

    setFile(file) {
        this.file = file;
        this.fileInfo = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified
        };
        this.addRecentFile(this.fileInfo);
    }

    addRecentFile(fileInfo) {
        // Avoid duplicates
        this.recentFiles = this.recentFiles.filter(f => f.name !== fileInfo.name);
        this.recentFiles.unshift(fileInfo);
        if (this.recentFiles.length > 5) {
            this.recentFiles.pop();
        }
        this.store.set('recentFiles', this.recentFiles);
    }

    setChunks(chunks) {
        this.studyChunks = chunks;
        this.currentChunkIndex = 0;
    }

    nextChunk() {
        if (this.currentChunkIndex < this.studyChunks.length - 1) {
            this.currentChunkIndex++;
            return true;
        }
        return false;
    }

    prevChunk() {
        if (this.currentChunkIndex > 0) {
            this.currentChunkIndex--;
            return true;
        }
        return false;
    }
}

