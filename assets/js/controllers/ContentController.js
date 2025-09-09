class ContentController {
    constructor(contentModel, contentView, toastView, configModel) {
        this.model = contentModel;
        this.view = contentView;
        this.toast = toastView;
        this.config = configModel;
        
        this.init();
    }

    init() {
        this.bindEvents();
    }

    bindEvents() {
        // Bind file input change event
        const fileInput = document.getElementById('file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileSelect(e.target.files);
            });
        }

        // Bind other content-related events
        document.addEventListener('textContentReady', this.handleTextContent.bind(this));
        document.addEventListener('videoContentReady', this.handleVideoContent.bind(this));
    }

    handleFileSelect(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                this.model.setFile(file);
                this.view.showFileInfo(file);
                this.view.renderRecentFiles(this.model.recentFiles);
                this.view.showConfig();
                
                // Process PDF and emit events for AI integration
                this.processPDFForAI(file);
                
                // Notify AppController
                const event = new CustomEvent('fileSelected', { detail: { file } });
                document.dispatchEvent(event);

            } else {
                this.toast.show('Please select a PDF file.', 'error');
            }
        }
    }

    async processPDFForAI(file) {
        try {
            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                const typedarray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                
                let fullText = '';
                const pages = [];
                
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    pages.push(pageText);
                    fullText += pageText + '\n';
                }
                
                // Emit events for AI flashcard generation
                const pdfData = {
                    filename: file.name,
                    text: fullText,
                    pages: pages,
                    pageCount: pdf.numPages,
                    title: this.extractTitleFromContent(fullText)
                };
                
                // Notify AI system
                document.dispatchEvent(new CustomEvent('pdfProcessed', { 
                    detail: pdfData 
                }));
                
                document.dispatchEvent(new CustomEvent('contentLoaded', { 
                    detail: {
                        type: 'pdf',
                        content: fullText,
                        metadata: pdfData
                    }
                }));
                
                console.log('PDF processed for AI:', pdfData);
            };
            
            fileReader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error processing PDF for AI:', error);
        }
    }

    extractTitleFromContent(text) {
        // Simple title extraction - take first meaningful line
        const lines = text.split('\n').filter(line => line.trim().length > 0);
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.length > 5 && trimmed.length < 100) {
                return trimmed;
            }
        }
        return 'PDF Document';
    }

    handleTextContent(event) {
        const { content, metadata } = event.detail;
        
        // Emit event for AI integration
        document.dispatchEvent(new CustomEvent('textContentReady', { 
            detail: { content, metadata } 
        }));
        
        console.log('Text content ready for AI:', { content: content.substring(0, 100) + '...', metadata });
    }

    handleVideoContent(event) {
        const { content, metadata } = event.detail;
        
        // Emit event for AI integration
        document.dispatchEvent(new CustomEvent('videoContentReady', { 
            detail: { content, metadata } 
        }));
        
        console.log('Video content ready for AI:', { content: content.substring(0, 100) + '...', metadata });
    }

    selectContentType(type) {
        console.log('Selecting content type:', type);
        this.model.setContentType(type);
        this.view.selectContentOption(type);
        
        // Navigate to the content upload section
        if (window.app && window.app.navigationController) {
            window.app.navigationController.navigateTo('content-selection');
        }
        
        // Hide all upload sections
        const pdfSection = document.getElementById('pdf-upload-section');
        const videoSection = document.getElementById('video-upload-section');
        const textSection = document.getElementById('text-upload-section');
        const uploadSection = document.getElementById('upload-section');
        
        [pdfSection, videoSection, textSection, uploadSection].forEach(section => {
            if (section) section.classList.add('hidden');
        });
        
        // Show the selected section
        if (type === 'pdf' && pdfSection) {
            pdfSection.classList.remove('hidden');
        } else if (type === 'video' && videoSection) {
            videoSection.classList.remove('hidden');
        } else if (type === 'text' && textSection) {
            textSection.classList.remove('hidden');
        }
        
        // Make sure content-selection is visible
        const contentSelection = document.getElementById('content-selection');
        if (contentSelection) {
            contentSelection.classList.remove('hidden');
        }
    }

    handleFileSelect(files) {
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                this.model.setFile(file);
                this.view.showFileInfo(file);
                this.view.renderRecentFiles(this.model.recentFiles);
                this.view.showConfig();
                
                // Process PDF and emit events for AI integration
                this.processPDFForAI(file);
                
                // Notify AppController
                const event = new CustomEvent('fileSelected', { detail: { file } });
                document.dispatchEvent(event);

            } else {
                this.toast.show('Please select a PDF file.', 'error');
            }
        }
    }

    handleDragOver(e) {
// ... existing code ...
        e.preventDefault();
        e.stopPropagation();
        this.view.dropArea.classList.add('active');
    }

    handleDragLeave(e) {
// ... existing code ...
        e.preventDefault();
        e.stopPropagation();
        this.view.dropArea.classList.remove('active');
    }

    handleDrop(e) {
// ... existing code ...
        e.preventDefault();
        e.stopPropagation();
        this.view.dropArea.classList.remove('active');
        const files = e.dataTransfer.files;
        this.handleFileSelect(files);
    }
    
    removeFile() {
// ... existing code ...
        this.model.setFile(null);
        this.view.hideFileInfo();
    }

    startStudySession() {
        const contentType = this.model.contentType;
        
        if (contentType === 'pdf') {
            if (!this.model.file) {
                this.toast.show('Please select a PDF file first.', 'warning');
                return;
            }
            this.processPDFChunks();
        } else if (contentType === 'video') {
            if (!this.model.videoData) {
                this.toast.show('Please process a video first.', 'warning');
                return;
            }
            this.processVideoChunks();
        } else if (contentType === 'text') {
            if (!this.model.textData) {
                this.toast.show('Please process text content first.', 'warning');
                return;
            }
            this.processTextChunks();
        }
    }

    processPDFChunks() {
        const { start, end } = this.config.get('pageRange');
        const chunkCount = this.config.get('chunkCount');
        const totalPages = end - start + 1;
        const pagesPerChunk = Math.ceil(totalPages / chunkCount);

        const chunks = [];
        for (let i = 0; i < chunkCount; i++) {
            const chunkStart = start + (i * pagesPerChunk);
            const chunkEnd = Math.min(chunkStart + pagesPerChunk - 1, end);
            chunks.push({ 
                type: 'pdf',
                startPage: chunkStart, 
                endPage: chunkEnd,
                title: `Pages ${chunkStart}-${chunkEnd}`
            });
            if (chunkEnd === end) break;
        }

        this.model.setChunks(chunks);
        this.startViewer();
    }

    processVideo() {
        const videoUrl = document.getElementById('video-url').value.trim();
        const videoTitle = document.getElementById('video-title').value.trim();
        const minutes = parseInt(document.getElementById('video-minutes').value) || 0;
        const seconds = parseInt(document.getElementById('video-seconds').value) || 0;

        if (!videoUrl) {
            this.toast.show('Please enter a video URL.', 'warning');
            return;
        }

        const totalSeconds = (minutes * 60) + seconds;
        if (totalSeconds <= 0) {
            this.toast.show('Please enter a valid duration.', 'warning');
            return;
        }

        // Store video data
        this.model.videoData = {
            url: videoUrl,
            title: videoTitle || 'Untitled Video',
            duration: totalSeconds
        };

        // Generate mock transcript for AI processing (in real app, this would be from actual video processing)
        const mockTranscript = this.generateMockTranscript(videoTitle);
        
        // Emit events for AI flashcard generation
        const videoData = {
            title: this.model.videoData.title,
            duration: totalSeconds,
            transcript: mockTranscript,
            url: videoUrl
        };
        
        document.dispatchEvent(new CustomEvent('videoTranscriptReady', { 
            detail: videoData 
        }));
        
        document.dispatchEvent(new CustomEvent('contentLoaded', { 
            detail: {
                type: 'video',
                content: mockTranscript,
                metadata: videoData
            }
        }));

        this.toast.show('Video processed successfully! You can now generate study chunks or AI flashcards.', 'success');
        
        // Show config section for chunking
        this.view.showConfig();
    }

    generateMockTranscript(title) {
        // Generate a realistic transcript based on title for demonstration
        const topics = title.toLowerCase().split(' ');
        const transcriptTemplates = {
            'science': `Welcome to this ${title}. Today we'll explore fundamental concepts and principles. The scientific method involves observation, hypothesis formation, and experimental testing. Key theories include molecular biology, quantum mechanics, and thermodynamics. Understanding these concepts is crucial for advanced study.`,
            'history': `In this lecture on ${title}, we examine historical events and their significance. Important dates, key figures, and social movements shaped our world. We'll analyze primary sources, understand cause and effect relationships, and explore different historical perspectives.`,
            'math': `This ${title} session covers mathematical concepts and problem-solving techniques. We'll work through equations, proofs, and practical applications. Understanding functions, derivatives, and statistical analysis is essential for mathematical literacy.`,
            'literature': `Today's discussion on ${title} explores themes, characters, and literary devices. We'll analyze symbolism, narrative structure, and cultural context. Understanding different literary movements and author techniques enhances reading comprehension.`
        };
        
        // Simple subject detection and template selection
        for (const [subject, template] of Object.entries(transcriptTemplates)) {
            if (topics.some(topic => template.toLowerCase().includes(topic))) {
                return template;
            }
        }
        
        return `This video on ${title} provides comprehensive coverage of the subject matter. The content includes key concepts, practical examples, and detailed explanations to enhance understanding and learning outcomes.`;
    }

    processVideoChunks() {
        const chunkCount = this.config.get('chunkCount');
        const totalDuration = this.model.videoData.duration;
        const chunkDuration = Math.ceil(totalDuration / chunkCount);

        const chunks = [];
        for (let i = 0; i < chunkCount; i++) {
            const startTime = i * chunkDuration;
            const endTime = Math.min(startTime + chunkDuration, totalDuration);
            
            chunks.push({
                type: 'video',
                startTime: startTime,
                endTime: endTime,
                title: `Segment ${i + 1} (${this.formatTime(startTime)} - ${this.formatTime(endTime)})`,
                url: this.model.videoData.url
            });
            
            if (endTime >= totalDuration) break;
        }

        this.model.setChunks(chunks);
        this.startViewer();
    }

    processText() {
        const textTitle = document.getElementById('text-title').value.trim();
        const textContent = document.getElementById('text-content').value.trim();

        if (!textContent) {
            this.toast.show('Please enter some text content.', 'warning');
            return;
        }

        // Store text data
        this.model.textData = {
            title: textTitle || 'Untitled Text',
            content: textContent,
            wordCount: textContent.split(/\s+/).filter(word => word.length > 0).length
        };

        // Emit events for AI flashcard generation
        const textData = {
            title: this.model.textData.title,
            content: textContent,
            wordCount: this.model.textData.wordCount,
            source: 'user_input'
        };
        
        document.dispatchEvent(new CustomEvent('textContentReady', { 
            detail: textData 
        }));
        
        document.dispatchEvent(new CustomEvent('contentLoaded', { 
            detail: {
                type: 'text',
                content: textContent,
                metadata: textData
            }
        }));

        this.toast.show('Text processed successfully! You can now generate study chunks or AI flashcards.', 'success');
        
        // Show config section for chunking
        this.view.showConfig();
    }

    processTextChunks() {
        const chunkCount = this.config.get('chunkCount');
        const content = this.model.textData.content;
        const words = content.split(/\s+/).filter(word => word.length > 0);
        const wordsPerChunk = Math.ceil(words.length / chunkCount);

        const chunks = [];
        for (let i = 0; i < chunkCount; i++) {
            const startIndex = i * wordsPerChunk;
            const endIndex = Math.min(startIndex + wordsPerChunk, words.length);
            const chunkWords = words.slice(startIndex, endIndex);
            
            chunks.push({
                type: 'text',
                content: chunkWords.join(' '),
                title: `Chunk ${i + 1} (${chunkWords.length} words)`,
                wordCount: chunkWords.length
            });
            
            if (endIndex >= words.length) break;
        }

        this.model.setChunks(chunks);
        this.startViewer();
    }

    updateTextStats() {
        const textContent = document.getElementById('text-content');
        const wordCountEl = document.getElementById('word-count');
        const charCountEl = document.getElementById('char-count');
        const readingTimeEl = document.getElementById('reading-time');

        if (textContent && wordCountEl && charCountEl && readingTimeEl) {
            const text = textContent.value;
            const words = text.split(/\s+/).filter(word => word.length > 0);
            const wordCount = words.length;
            const charCount = text.length;
            const readingTime = Math.ceil(wordCount / 200); // Average reading speed

            wordCountEl.textContent = `${wordCount} words`;
            charCountEl.textContent = `${charCount} characters`;
            readingTimeEl.textContent = `~${readingTime} min read`;
        }
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    startViewer() {
        const event = new CustomEvent('startViewer');
        document.dispatchEvent(event);
        
        // Hide sections
        this.view.configSection.classList.add('hidden');
        this.view.contentSelection.classList.add('hidden');
        this.view.uploadSection.classList.add('hidden');
        
        // Hide content type sections
        const pdfSection = document.getElementById('pdf-upload-section');
        const videoSection = document.getElementById('video-upload-section');
        const textSection = document.getElementById('text-upload-section');
        
        [pdfSection, videoSection, textSection].forEach(section => {
            if (section) section.classList.add('hidden');
        });
    }
}

