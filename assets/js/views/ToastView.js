class ToastView {
    constructor() {
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);
    }

    show(message, type = 'info', duration = 3000) {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const iconClass = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle'
        }[type];

        toast.innerHTML = `
            <i class="fas ${iconClass}"></i>
            <p>${message}</p>
            <button class="toast-close">&times;</button>
        `;

        this.container.appendChild(toast);

        const closeButton = toast.querySelector('.toast-close');
        closeButton.addEventListener('click', () => this.hide(toast));

        setTimeout(() => this.hide(toast), duration);
    }

    hide(toast) {
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => toast.remove());
    }
}

