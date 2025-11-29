// Clerk Authentication Module
class AuthManager {
    constructor() {
        this.clerk = null;
        this.user = null;
        this.isInitialized = false;
    }

    // Initialize Clerk
    async initialize() {
        try {
            // Initialize Clerk with your publishable key
            // For local development, use the key directly
            // For production, use environment variable or hardcoded key
            const publishableKey = 'pk_test_bmF0aW9uYWwtcGFudGhlci05MC5jbGVyay5hY2NvdW50cy5kZXYk';
            if (!publishableKey) {
                throw new Error('Clerk publishable key not found');
            }
            this.clerk = new Clerk(publishableKey);
            await this.clerk.load();
            
            this.isInitialized = true;
            console.log('Clerk initialized successfully');
            
            // Set up auth state listener
            this.setupAuthListener();
            
            // Check initial auth state
            await this.checkAuthState();
            
        } catch (error) {
            console.error('Failed to initialize Clerk:', error);
            this.showError('Gagal menginisialisasi autentikasi');
        }
    }

    // Set up authentication state listener
    setupAuthListener() {
        this.clerk.addListener((event) => {
            console.log('Auth event:', event);
            this.checkAuthState();
        });
    }

    // Check current authentication state
    async checkAuthState() {
        if (!this.isInitialized) return;

        try {
            if (this.clerk.user) {
                // User is signed in
                this.user = this.clerk.user;
                await this.onSignIn();
            } else {
                // User is signed out
                this.user = null;
                this.onSignOut();
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            this.showError('Gagal memeriksa status autentikasi');
        }
    }

    // Handle successful sign in
    async onSignIn() {
        console.log('User signed in:', this.user.id);
        
        // Hide login state, show dashboard
        document.getElementById('login-state').classList.add('hidden');
        document.getElementById('dashboard-state').classList.remove('hidden');
        
        // Mount user button
        this.mountUserButton();
        
        // Load user's notes
        if (window.notesManager) {
            await window.notesManager.loadNotes();
        }
        
        // Show success message
        this.showSuccess('Login berhasil!');
    }

    // Handle sign out
    onSignOut() {
        console.log('User signed out');
        
        // Show login state, hide dashboard
        document.getElementById('login-state').classList.remove('hidden');
        document.getElementById('dashboard-state').classList.add('hidden');
        
        // Clear notes
        if (window.notesManager) {
            window.notesManager.clearNotes();
        }
        
        // Show sign in component
        this.mountSignIn();
    }

    // Mount sign in component
    mountSignIn() {
        const signInContainer = document.getElementById('clerk-sign-in');
        if (signInContainer && this.clerk) {
            this.clerk.mountSignIn(signInContainer, {
                redirectUrl: window.location.href
            });
        }
    }

    // Mount user button
    mountUserButton() {
        const userButtonContainer = document.getElementById('clerk-user-button');
        if (userButtonContainer && this.clerk && this.user) {
            this.clerk.mountUserButton(userButtonContainer, {
                afterSignOutUrl: window.location.href
            });
        }
    }

    // Get authentication token for API calls
    async getToken() {
        if (!this.user) {
            throw new Error('User not authenticated');
        }
        
        try {
            return await this.clerk.session.getToken();
        } catch (error) {
            console.error('Failed to get auth token:', error);
            throw new Error('Gagal mendapatkan token autentikasi');
        }
    }

    // Get current user info
    getCurrentUser() {
        if (!this.user) return null;
        
        return {
            id: this.user.id,
            email: this.user.primaryEmailAddress?.emailAddress,
            name: this.user.fullName || this.user.username,
            imageUrl: this.user.imageUrl
        };
    }

    // Show loading state
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }

    // Hide loading state
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    // Show error message
    showError(message) {
        console.error('Error:', message);
        // You can implement a toast notification system here
        alert(`Error: ${message}`);
    }

    // Show success message
    showSuccess(message) {
        console.log('Success:', message);
        // You can implement a toast notification system here
        alert(`Success: ${message}`);
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.user !== null;
    }

    // Sign out user
    async signOut() {
        if (this.clerk) {
            try {
                await this.clerk.signOut();
            } catch (error) {
                console.error('Sign out error:', error);
                this.showError('Gagal logout');
            }
        }
    }
}

// Create global auth manager instance
window.authManager = new AuthManager();

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    await window.authManager.initialize();
});