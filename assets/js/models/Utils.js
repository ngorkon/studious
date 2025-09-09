class Utils {
    static debounce(func, delay) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    static get(selector, parent = document) {
        return parent.querySelector(selector);
    }

    static getAll(selector, parent = document) {
        return [...parent.querySelectorAll(selector)];
    }
}

