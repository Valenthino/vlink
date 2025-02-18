# API Endpoints

[← Back to Main](00-main.md)

/*
LOGICAL EXPLANATION:
Our API endpoints are designed to:
1. Provide clear, RESTful interfaces
2. Handle all URL shortening operations
3. Follow standard HTTP conventions
4. Return consistent response formats
*/

## Create Short URL
```pseudocode
POST /api/create
Request Body: {
    originalUrl: string,            // The URL to shorten
    customCode?: string            // Optional custom short code
}
Response: {
    success: boolean,              // Whether the operation succeeded
    shortUrl?: string,            // The generated short URL (if successful)
    error?: string                // Error message (if failed)
}

LOGICAL EXPLANATION:
1. Uses POST because we're creating a new resource
2. Accepts optional customCode for flexibility
3. Returns both success status and data/error
4. Provides clear error messages for better UX
```

## Redirect to Original URL
```pseudocode
GET /[shortCode]
Response:
    - 301 Redirect to original URL  // Permanent redirect for caching
    - 404 if short code not found   // Standard not found response

LOGICAL EXPLANATION:
1. Uses GET for simple URL access
2. Returns 301 for:
   - Browser caching
   - SEO benefits
   - Faster subsequent visits
3. Uses 404 for missing URLs:
   - Standard HTTP practice
   - Clear error for users
   - Easy for other systems to understand
```

## API Response Format
/*
LOGICAL EXPLANATION:
We standardize our API responses for:
1. Consistent error handling
2. Easy client-side processing
3. Clear success/failure indication
4. Detailed error messages when needed
*/

```pseudocode
Success Response: {
    success: true,
    data: {
        // Endpoint-specific data
    }
}

Error Response: {
    success: false,
    error: {
        code: string,              // Error code for programmatic handling
        message: string,           // Human-readable error message
        details?: object           // Additional error details if needed
    }
}
``` 