// Read Notes Serverless Function
const { Pool } = require('pg');

// Database connection pool
let pool;

// Initialize database connection
const initDB = () => {
    if (!pool) {
        pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
    }
    return pool;
};

// Verify Clerk token
const verifyClerkToken = async (token) => {
    try {
        // Import Clerk SDK
        const { Clerk } = require('@clerk/clerk-sdk-node');
        
        // Initialize Clerk with secret key
        const clerk = new Clerk({
            secretKey: process.env.CLERK_SECRET_KEY
        });
        
        // Verify the session token
        const session = await clerk.sessions.verifySession(token);
        
        if (session && session.userId) {
            return {
                userId: session.userId,
                isValid: true
            };
        }
        
        return { isValid: false };
    } catch (error) {
        console.error('Token verification failed:', error);
        return { isValid: false };
    }
};

// Main handler function
exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow GET requests
    if (event.httpMethod !== 'GET') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        // Get authorization header
        const authHeader = event.headers.authorization || event.headers.Authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Authorization header required' })
            };
        }

        const token = authHeader.substring(7);
        
        // Verify token
        const tokenData = await verifyClerkToken(token);
        if (!tokenData.isValid) {
            return {
                statusCode: 401,
                headers,
                body: JSON.stringify({ error: 'Invalid token' })
            };
        }

        // Initialize database
        const db = initDB();
        const client = await db.connect();

        try {
            // Query to get all notes for the user, ordered by creation date (newest first)
            const query = `
                SELECT id, user_id, title, content, created_at, updated_at
                FROM notes
                WHERE user_id = $1
                ORDER BY created_at DESC
            `;
            
            const result = await client.query(query, [tokenData.userId]);
            
            const notes = result.rows.map(row => ({
                id: row.id,
                user_id: row.user_id,
                title: row.title,
                content: row.content,
                created_at: row.created_at,
                updated_at: row.updated_at
            }));

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    notes: notes,
                    count: notes.length
                })
            };

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error reading notes:', error);
        
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                error: 'Internal server error',
                message: error.message 
            })
        };
    }
};