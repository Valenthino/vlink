# Core Functions

[← Back to Main](00-main.md)

## URL Shortening Process
/*
This is the main function that creates short URLs.
It's like taking a long street address and creating a simple nickname for it.

LOGICAL EXPLANATION:
The process follows these steps because:
1. We must validate input before processing
2. We check for duplicates to avoid creating multiple short codes for the same URL
3. We handle custom codes differently from generated ones
4. We ensure uniqueness of generated codes
5. We store metadata for tracking and management
*/

```pseudocode
Function generateShortUrl(originalUrl, customCode = null):
    // First, check if the URL is valid (like making sure an address actually exists)
    // We do this first because there's no point in proceeding with an invalid URL
    If not isValidUrl(originalUrl):
        Return error("Invalid URL format")
    
    // Check if we already have this URL in our system (avoid duplicates)
    // This prevents cluttering the database with duplicate entries
    existingUrl = findInDatabase(originalUrl)
    If existingUrl exists:
        Return existingUrl.shortCode
    
    // Handle custom codes (like choosing your own nickname)
    // Custom codes need special handling because they must be unique
    If customCode is not null:
        If isCustomCodeAvailable(customCode):
            shortCode = customCode
        Else:
            Return error("Custom code already taken")
    Else:
        // Generate a random code if no custom one provided
        // We use a loop to ensure uniqueness
        // The probability of collision is low but possible
        Do:
            shortCode = generateRandomString(6)
        While shortCodeExists(shortCode)
    
    // Create a new record in our database
    // We store all this information for:
    // 1. Future lookups (originalUrl, shortCode)
    // 2. Analytics (clicks, lastAccessed)
    // 3. Management (createdAt, isCustom)
    newUrl = {
        originalUrl: originalUrl,    
        shortCode: shortCode,        
        createdAt: currentTimestamp(), 
        clicks: 0,                   
        lastAccessed: null,          
        isCustom: (customCode != null) 
    }
    
    Save newUrl to database
    Return shortCode
```

## URL Redirection Process
/*
This function handles what happens when someone uses a short URL.
It's like a postal service that knows where to deliver based on a simple address.

LOGICAL EXPLANATION:
The redirection process is designed to:
1. Quickly find and redirect to the target URL
2. Collect usage statistics without slowing down the redirect
3. Handle errors gracefully
4. Track important analytics data
*/

```pseudocode
Function redirectToOriginalUrl(shortCode):
    // Look up the short code in our database
    // This is the first step because we need to know where to redirect
    urlRecord = findUrlByShortCode(shortCode)
    
    // If we can't find it, tell the user
    // We use 404 because it's the standard "not found" error
    If urlRecord not found:
        Return 404 error("Short URL not found")
    
    // Update our statistics
    // We do this before redirecting because:
    // 1. The user doesn't have to wait for stats to update
    // 2. If stats fail, the redirect still works
    Increment urlRecord.clicks           
    Update urlRecord.lastAccessed        
    
    // Keep track of who's using the URL
    // This is done asynchronously to not delay the redirect
    SaveAnalytics({
        shortCodeId: urlRecord._id,      
        clickedAt: currentTimestamp(),   
        userAgent: getCurrentUserAgent(), 
        ipAddress: getClientIP(),        
        referrer: getReferrer()          
    })
    
    // Send the user to their destination
    // We use 301 redirect for:
    // 1. Browser caching
    // 2. SEO benefits
    Return redirect(urlRecord.originalUrl)
``` 