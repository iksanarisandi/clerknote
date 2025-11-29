// Delete Note Serverless Function
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
        'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
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

    // Only allow DELETE requests
    if (event.httpMethod !== 'DELETE') {
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
        const { id } = body;
        
        if (!id || isNaN(id)) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Valid note ID is required' })
            };
        }

        // Initialize database
        const db = initDB();
        const client = await db.connect();

        try {
            // First, check if the note exists and belongs to the user
            const checkQuery = `
                SELECT id FROM notes
                WHERE id = $1 AND user_id = $2
            `;
            
            const checkResult = await client.query(checkQuery, [id, tokenData.userId]);
            
            if (checkResult.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Note not found or access denied' })
                };
            }

            // Delete the note
            const deleteQuery = `
                DELETE FROM notes
                WHERE id = $1 AND user_id = $2
                RETURNING id
            `;
            
            const result = await client.query(deleteQuery, [id, tokenData.userId]);
            
            if (result.rows.length === 0) {
                return {
                    statusCode: 404,
                    headers,
                    body: JSON.stringify({ error: 'Note not found or access denied' })
                };
            }

            return {
                statusCode: 200,
                headers,
                body: JSON.stringify({
                    success: true,
                    message: 'Note deleted successfully',
                    deletedId: id
                })
            };

        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error deleting note:', error);
        
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