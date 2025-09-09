class ConfigModel {
    constructor(store) {
        this.store = store;
        this.config = this.store.get('studyConfig') || {
            studyGoal: '',
            studyMode: 'focus',
            difficulty: 'easy',
            pageRange: { start: 1, end: null },
            chunkCount: 4,
            videoChunkMode: 'equal',
            videoChunkCount: 5,
            manualTimestamps: '',
            textChunkMode: 'paragraph',
            readingSpeed: 250,
            theme: 'light',
            breakReminders: true,
            progressNotifications: true,
            goalReminders: false,
            focusSounds: 'none'
        };
    }

    get(key) {
        return this.config[key];
    }

    set(key, value) {
        this.config[key] = value;
        this.save();
    }

    save() {
        this.store.set('studyConfig', this.config);
    }
}
