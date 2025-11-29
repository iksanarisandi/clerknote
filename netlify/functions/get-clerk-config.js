// Get Clerk Configuration Serverless Function
exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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
        // Return Clerk configuration from environment variables
        const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY;
        
        if (!publishableKey) {
            return {
                statusCode: 500,
                headers,
                body: JSON.stringify({ 
                    error: 'Clerk publishable key not configured',
                    message: 'Please set VITE_CLERK_PUBLISHABLE_KEY in environment variables'
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                publishableKey: publishableKey
            })
        };

    } catch (error) {
        console.error('Error getting Clerk config:', error);
        
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