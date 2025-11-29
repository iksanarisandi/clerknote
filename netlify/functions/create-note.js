// Create Note Serverless Function
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

// Create notes table if it doesn't exist
const createTableIfNotExists = async (client) => {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS notes (
            id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
        CREATE INDEX IF NOT EXISTS idx_notes_created_at ON notes(created_at DESC);
    `;
    
    await client.query(createTableQuery);
};

// Main handler function
exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
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

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
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

        // Parse request body
        let body;
        try {
            body = JSON.parse(event.body);
        } catch (error) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Invalid JSON body' })
            };
        }

        // Validate input
        const { title, content, userId } = body;
        
        if (!title || !title.trim()) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Title is required' })
            };
        }

        if (!userId || userId !== tokenData.userId) {
            return {
                statusCode: 403,
                headers,
                body: JSON.stringify({ error: 'User ID mismatch' })
            };
        }

        // Initialize database
        const db = initDB();
        const client = await db.connect();

        try {
            // Create table if it doesn't exist
            await createTableIfNotExists(client);

            // Insert new note
            const insertQuery = `
                INSERT INTO notes (user_id, title, content)
                VALUES ($1, $2, $3)
                RETURNING id, user_id, title, content, created_at, updated_at
            `;
            
            const values = [userId, title.trim(), content ? content.trim() : ''];
            const result = await client.query(insertQuery, values);
            
            const newNote = result.rows[0];

            return {
                statusCode: 201,
                headers,
                body: JSON.stringify({
                    success: true,
                    note: {
                        id: newNote.id,
                        user_id: newNote.user_id,
                        title: newNote.title,
                        content: newNote.content,
                        created_at: newNote.created_at,
                        updated_at: newNote.updated_at
                    }
                })
            };

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error creating note:', error);
        
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