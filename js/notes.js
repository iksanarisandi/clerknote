// Notes Management Module
class NotesManager {
    constructor() {
        this.notes = [];
        this.isLoading = false;
        this.baseUrl = '/.netlify/functions';
    }

    // Load all notes for the current user
    async loadNotes() {
        if (!window.authManager.isAuthenticated()) {
            console.warn('User not authenticated');
            return;
        }

        this.showLoading();
        
        try {
            const token = await window.authManager.getToken();
            const response = await fetch(`${this.baseUrl}/read-notes`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            this.notes = data.notes || [];
            this.renderNotes();
            
        } catch (error) {
            console.error('Failed to load notes:', error);
            this.showError('Gagal memuat catatan');
        } finally {
            this.hideLoading();
        }
    }

    // Create a new note
    async createNote(title, content) {
        if (!window.authManager.isAuthenticated()) {
            this.showError('Anda harus login terlebih dahulu');
            return;
        }

        this.showLoading();
        
        try {
            const token = await window.authManager.getToken();
            const user = window.authManager.getCurrentUser();
            
            const response = await fetch(`${this.baseUrl}/create-note`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: title.trim(),
                    content: content.trim(),
                    userId: user.id
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Add new note to the list
            this.notes.unshift(data.note);
            this.renderNotes();
            
            // Clear form
            document.getElementById('create-note-form').reset();
            
            this.showSuccess('Catatan berhasil dibuat');
            
        } catch (error) {
            console.error('Failed to create note:', error);
            this.showError('Gagal membuat catatan');
        } finally {
            this.hideLoading();
        }
    }

    // Update an existing note
    async updateNote(id, title, content) {
        if (!window.authManager.isAuthenticated()) {
            this.showError('Anda harus login terlebih dahulu');
            return;
        }

        this.showLoading();
        
        try {
            const token = await window.authManager.getToken();
            
            const response = await fetch(`${this.baseUrl}/update-note`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id,
                    title: title.trim(),
                    content: content.trim()
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Update note in the list
            const index = this.notes.findIndex(note => note.id === id);
            if (index !== -1) {
                this.notes[index] = data.note;
                this.renderNotes();
            }
            
            this.closeEditModal();
            this.showSuccess('Catatan berhasil diupdate');
            
        } catch (error) {
            console.error('Failed to update note:', error);
            this.showError('Gagal mengupdate catatan');
        } finally {
            this.hideLoading();
        }
    }

    // Delete a note
    async deleteNote(id) {
        if (!window.authManager.isAuthenticated()) {
            this.showError('Anda harus login terlebih dahulu');
            return;
        }

        // Show confirmation dialog
        if (!confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
            return;
        }

        this.showLoading();
        
        try {
            const token = await window.authManager.getToken();
            
            const response = await fetch(`${this.baseUrl}/delete-note`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: id
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Remove note from the list
            this.notes = this.notes.filter(note => note.id !== id);
            this.renderNotes();
            
            this.showSuccess('Catatan berhasil dihapus');
            
        } catch (error) {
            console.error('Failed to delete note:', error);
            this.showError('Gagal menghapus catatan');
        } finally {
            this.hideLoading();
        }
    }

    // Render notes in the UI
    renderNotes() {
        const container = document.getElementById('notes-container');
        
        if (this.notes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Belum ada catatan. Buat catatan pertama Anda!</p>
                </div>
            `;
            return;
        }

        const notesHTML = this.notes.map(note => this.createNoteCard(note)).join('');
        container.innerHTML = notesHTML;
        
        // Add event listeners to note cards
        this.attachNoteEventListeners();
    }

    // Create HTML for a note card
    createNoteCard(note) {
        const createdDate = new Date(note.created_at).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });

        const contentPreview = note.content.length > 150 
            ? note.content.substring(0, 150) + '...' 
            : note.content;

        return `
            <div class="note-card" data-note-id="${note.id}">
                <h3 class="note-card-title">${this.escapeHtml(note.title)}</h3>
                <p class="note-card-content">${this.escapeHtml(contentPreview)}</p>
                <div class="note-card-meta">
                    <span>${createdDate}</span>
                    <div class="note-card-actions">
                        <button class="btn btn-small btn-primary edit-note" data-note-id="${note.id}">
                            Edit
                        </button>
                        <button class="btn btn-small btn-danger delete-note" data-note-id="${note.id}">
                            Hapus
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Attach event listeners to note cards
    attachNoteEventListeners() {
        // Edit buttons
        document.querySelectorAll('.edit-note').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = parseInt(e.target.dataset.noteId);
                this.openEditModal(noteId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-note').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const noteId = parseInt(e.target.dataset.noteId);
                this.deleteNote(noteId);
            });
        });

        // Note card click (for viewing full note)
        document.querySelectorAll('.note-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.classList.contains('btn')) return;
                const noteId = parseInt(e.currentTarget.dataset.noteId);
                this.viewNote(noteId);
            });
        });
    }

    // Open edit modal for a note
    openEditModal(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        document.getElementById('edit-note-id').value = note.id;
        document.getElementById('edit-note-title').value = note.title;
        document.getElementById('edit-note-content').value = note.content;
        
        document.getElementById('note-modal').classList.remove('hidden');
    }

    // Close edit modal
    closeEditModal() {
        document.getElementById('note-modal').classList.add('hidden');
        document.getElementById('edit-note-form').reset();
    }

    // View full note (can be extended for a detailed view)
    viewNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;
        
        // For now, just open edit modal
        this.openEditModal(noteId);
    }

    // Clear all notes from UI
    clearNotes() {
        this.notes = [];
        this.renderNotes();
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Show loading state
    showLoading() {
        this.isLoading = true;
        document.getElementById('loading').classList.remove('hidden');
    }

    // Hide loading state
    hideLoading() {
        this.isLoading = false;
        document.getElementById('loading').classList.add('hidden');
    }

    // Show error message
    showError(message) {
        console.error('Error:', message);
        alert(`Error: ${message}`);
    }

    // Show success message
    showSuccess(message) {
        console.log('Success:', message);
        alert(`Success: ${message}`);
    }
}

// Create global notes manager instance
window.notesManager = new NotesManager();