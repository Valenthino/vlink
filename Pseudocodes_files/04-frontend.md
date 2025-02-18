# Frontend Components

[← Back to Main](00-main.md)

/*
These are the parts of our website that users can see and interact with.
Think of them as the rooms in a house, each with its own purpose.

LOGICAL EXPLANATION:
We separate frontend components because:
1. Each component has a specific responsibility
2. Makes the code more maintainable and reusable
3. Allows for independent testing and debugging
4. Enables better state management
*/

## Main Page Component
/*
This is our homepage where users can create short URLs.
Like a form at a post office where you fill in where you want your mail to go.

LOGICAL EXPLANATION:
The main page needs to:
1. Provide a simple interface for URL shortening
2. Handle both basic and custom short codes
3. Show clear feedback about the process
4. Display results in a user-friendly way
*/

```pseudocode
Component MainPage:
    State: // Information we need to keep track of
        originalUrl: string          // The URL user wants to shorten
        customCode: string           // Optional custom short code
        shortUrl: string            // The resulting short URL
        error: string               // Any error messages
        isLoading: boolean          // Whether we're processing
    
    // What happens when the user submits the form
    Function handleSubmit():
        Set isLoading to true       // Show we're working
        Clear error                 // Remove any old error messages
        
        // Send the request to our server
        Response = API.post("/api/create", {
            originalUrl: originalUrl,
            customCode: customCode
        })
        
        // Handle the response
        If Response.success:
            Set shortUrl to Response.shortUrl  // Show the new short URL
        Else:
            Set error to Response.error        // Show what went wrong
        
        Set isLoading to false      // We're done processing
    
    // What users see on the page
    Render:
        Form with:
            - URL input field               // Where users paste their long URL
            - Optional custom code input    // Where they can request a specific short code
            - Submit button                 // To start the process
            - Loading indicator            // Shows when we're working
            - Error message (if any)       // Shows if something went wrong
            - Generated short URL display  // Shows the result
```

## Redirect Page Component
/*
LOGICAL EXPLANATION:
The redirect page is simple but critical:
1. It handles the actual URL redirection
2. Shows appropriate error messages if something goes wrong
3. Provides a smooth user experience during redirection
4. Minimizes the time between clicking and redirecting
*/

```pseudocode
Component RedirectPage:
    Props:
        shortCode: string           // The code from the URL
    
    OnMount:                        // When the page loads
        Response = API.get("/api/[shortCode]")
        
        If Response.success:
            Redirect to Response.originalUrl  // Send user to destination
        Else:
            Show error page                   // Display friendly error message
```

## Component Interactions
/*
LOGICAL EXPLANATION:
Our components work together in this way:
1. Main Page -> Creates short URLs and displays results
2. Redirect Page -> Handles the actual redirection
3. Both components use shared:
   - API calls for consistency
   - Error handling for uniform experience
   - Loading states for user feedback
*/ 