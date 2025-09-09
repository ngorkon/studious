class ThemeView {
    constructor(store) {
        this.store = store;
        this.themeButtons = Utils.getAll('.theme-option');
        this.body = document.body;
        this.currentTheme = this.store.get('theme') || 'light';
        this.applyTheme(this.currentTheme);
        this.bindEvents();
    }

    bindEvents() {
        this.themeButtons.forEach(button => {
            button.addEventListener('click', () => {
                const theme = button.dataset.theme;
                this.applyTheme(theme);
            });
        });
    }

    applyTheme(theme) {
        this.body.classList.remove('light-theme', 'dark-theme', 'sepia-theme');
        this.body.classList.add(`${theme}-theme`);

        this.themeButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.theme === theme);
        });

        this.currentTheme = theme;
        this.store.set('theme', theme);
    }
}

