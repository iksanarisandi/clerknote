// Clerk Authentication Module
class AuthManager {
    constructor() {
        this.clerk = null;
        this.user = null;
        this.isInitialized = false;
    }

    // Get publishable key from server
    async getPublishableKeyFromServer() {
        try {
            const response = await fetch('/.netlify/functions/get-clerk-config');
            const data = await response.json();
            
            if (data.success) {
                return data.publishableKey;
            } else {
                throw new Error(data.error || 'Failed to get Clerk config');
            }
        } catch (error) {
            console.error('Error getting Clerk config from server:', error);
            // Fallback to hardcoded key if server is unavailable
            return 'pk_test_bmF0aW9uYWwtcGFudGhlci05MC5jbGVyay5hY2NvdW50cy5kZXYk';
        }
    }

    // Initialize Clerk
    async initialize() {
        try {
            // Wait for Clerk to be available from CDN
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds timeout
            
            while (typeof Clerk === 'undefined' && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (typeof Clerk === 'undefined') {
                throw new Error('Clerk library failed to load from CDN');
            }
            
            // Get publishable key from server instead of hardcoded value
            const publishableKey = await this.getPublishableKeyFromServer();
            
            if (!publishableKey || publishableKey === 'your_clerk_publishable_key_here') {
                throw new Error('Clerk publishable key is not configured. Please set VITE_CLERK_PUBLISHABLE_KEY in Netlify environment variables.');
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