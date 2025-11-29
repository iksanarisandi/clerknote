// Main Application Module
class App {
    constructor() {
        this.isInitialized = false;
    }

    // Initialize the application
    async initialize() {
        try {
            console.log('Initializing application...');
            
            // Wait for auth manager to be ready
            if (!window.authManager) {
                throw new Error('Auth manager not available');
            }

            // Set up event listeners
            this.setupEventListeners();
            
            // Set up modal handlers
            this.setupModalHandlers();
            
            this.isInitialized = true;
            console.log('Application initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize application:', error);
            this.showError('Gagal menginisialisasi aplikasi');
        }
    }

    // Set up event listeners
    setupEventListeners() {
        // Create note form
        const createForm = document.getElementById('create-note-form');
        if (createForm) {
            createForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleCreateNote(e);
            });
        }

        // Edit note form
        const editForm = document.getElementById('edit-note-form');
        if (editForm) {
            editForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditNote(e);
            });
        }

        // Handle keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Handle window resize for responsive behavior
        window.addEventListener('resize', () => {
            this.handleResize();
        });

        // Handle visibility change (for auto-save functionality)
        document.addEventListener('visibilitychange', () => {
            this.handleVisibilityChange();
        });
    }

    // Set up modal handlers
    setupModalHandlers() {
        const modal = document.getElementById('note-modal');
        const closeBtn = document.querySelector('.modal-close');
        const cancelBtn = document.querySelector('.modal-cancel');

        // Close modal when clicking close button
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close modal when clicking cancel button
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeModal();
            });
        }

        // Close modal when clicking outside modal content
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeModal();
                }
            });
        }

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
                this.closeModal();
            }
        });
    }

    // Handle create note form submission
    async handleCreateNote(e) {
        e.preventDefault();
        
        if (!window.authManager.isAuthenticated()) {
            this.showError('Anda harus login terlebih dahulu');
            return;
        }

        const title = document.getElementById('note-title').value;
        const content = document.getElementById('note-content').value;

        if (!title.trim() || !content.trim()) {
            this.showError('Judul dan isi catatan tidak boleh kosong');
            return;
        }

        if (window.notesManager) {
            await window.notesManager.createNote(title, content);
        }
    }

    // Handle edit note form submission
    async handleEditNote(e) {
        e.preventDefault();
        
        if (!window.authManager.isAuthenticated()) {
            this.showError('Anda harus login terlebih dahulu');
            return;
        }

        const id = parseInt(document.getElementById('edit-note-id').value);
        const title = document.getElementById('edit-note-title').value;
        const content = document.getElementById('edit-note-content').value;

        if (!title.trim() || !content.trim()) {
            this.showError('Judul dan isi catatan tidak boleh kosong');
            return;
        }

        if (window.notesManager) {
            await window.notesManager.updateNote(id, title, content);
        }
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + N for new note
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            this.focusCreateForm();
        }

        // Ctrl/Cmd + S for save (when in edit mode)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (!document.getElementById('note-modal').classList.contains('hidden')) {
                document.getElementById('edit-note-form').dispatchEvent(new Event('submit'));
            }
        }

        // Escape to close modal
        if (e.key === 'Escape') {
            this.closeModal();
        }
    }

    // Focus on create note form
    focusCreateForm() {
        const titleInput = document.getElementById('note-title');
        if (titleInput && !titleInput.disabled) {
            titleInput.focus();
        }
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('note-modal');
        if (modal) {
            modal.classList.add('hidden');
            // Clear form
            document.getElementById('edit-note-form').reset();
        }
    }

    // Handle window resize
    handleResize() {
        // You can add responsive behavior here if needed
        // For example, adjust modal size, hide/show elements, etc.
    }

    // Handle visibility change (for auto-save)
    handleVisibilityChange() {
        if (document.hidden) {
            // Page is hidden, could implement auto-save here
            console.log('Page hidden - could auto-save');
        } else {
            // Page is visible again
            console.log('Page visible');
        }
    }

    // Show loading state
    showLoading(message = 'Loading...') {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.querySelector('p').textContent = message;
            loading.classList.remove('hidden');
        }
    }

    // Hide loading state
    hideLoading() {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.classList.add('hidden');
        }
    }

    // Show error message
    showError(message) {
        console.error('Error:', message);
        alert(`Error: ${message}`);
        
        // You can implement a better notification system here
        // For example, a toast notification that auto-dismisses
    }

    // Show success message
    showSuccess(message) {
        console.log('Success:', message);
        alert(`Success: ${message}`);
        
        // You can implement a better notification system here
        // For example, a toast notification that auto-dismisses
    }

    // Handle application errors
    handleError(error, context = '') {
        console.error(`Error in ${context}:`, error);
        
        let message = 'Terjadi kesalahan';
        if (error.message) {
            message = error.message;
        } else if (typeof error === 'string') {
            message = error;
        }
        
        this.showError(message);
    }

    // Cleanup function
    cleanup() {
        // Remove event listeners
        // Clear intervals/timeouts
        // Reset state
        console.log('Cleaning up application...');
    }
}

// Create global app instance
window.app = new App();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit for other modules to initialize
    setTimeout(async () => {
        await window.app.initialize();
    }, 100);
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.cleanup();
    }
});

// Handle errors globally
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.app) {
        window.app.handleError(e.error, 'Global error handler');
    }
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (window.app) {
        window.app.handleError(e.reason, 'Unhandled promise rejection');
    }
});