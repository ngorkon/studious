class ModalView {
    constructor() {
        this.modal = null;
    }

    show(title, content, actions = '') {
        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay';
        this.modal.innerHTML = `
            <div class="modal">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content">${content}</div>
                <div class="modal-actions">${actions}</div>
            </div>
        `;
        document.body.appendChild(this.modal);

        const closeButton = this.modal.querySelector('.modal-close');
        closeButton.addEventListener('click', () => this.hide());
    }

    hide() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }
}

