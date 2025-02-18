# URL Shortener System Design & Pseudocode

## System Architecture
/*
This section outlines the fundamental building blocks of our application.
Think of it as the blueprint of how different parts of our system will work together.

LOGICAL EXPLANATION:
We separate our system into distinct components because:
1. It makes the system easier to maintain and update
2. Different teams can work on different parts simultaneously
3. If one part fails, the others can still function
4. We can scale different parts independently based on load
*/

### Tech Stack
/*
These are the main technologies we'll use to build our application:
- Next.js: A React framework that helps us build both frontend and backend
- TypeScript: Adds type safety to JavaScript, helping catch errors early
- MongoDB: A database that stores data in a format similar to JSON
- Tailwind CSS: A utility-first CSS framework for styling
- Docker: Helps package our application for easy deployment

LOGICAL EXPLANATION:
We chose these technologies because:
1. Next.js: Provides server-side rendering and API routes in one framework
2. TypeScript: Catches errors before they reach production
3. MongoDB: Flexible schema for rapid development and easy scaling
4. Tailwind: Faster styling without writing custom CSS
5. Docker: Ensures consistent deployment across different environments
*/

### Database Schema
/*
The database schema defines how our data will be structured in MongoDB.
Think of it as creating organized containers for different types of information.

LOGICAL EXPLANATION:
We structure our data this way because:
1. We need to track both the original and shortened URLs
2. We want to collect analytics to understand usage patterns
3. We need to support custom short codes
4. We want to track QR code usage separately
*/

```mongodb
// URL Collection Schema
// This is the main storage structure for our shortened URLs
{
  _id: ObjectId,                    // Unique identifier for each record
  originalUrl: String,              // The full URL that was shortened
  shortCode: String,                // The generated short code (e.g., "abc123")
  createdAt: Timestamp,             // When the short URL was created
  clicks: Number,                   // How many times the URL was accessed
  lastAccessed: Timestamp,          // When the URL was last clicked
  isCustom: Boolean,                // Whether the user provided their own short code
  userId: String,                   // Optional: Links URLs to specific users
  qrCode: {                         // Information about the generated QR code
    imageUrl: String,               // Where the QR code image is stored
    generatedAt: Timestamp,         // When the QR code was created
    downloadCount: Number           // How many times the QR code was downloaded
  }
}

/*
LOGICAL EXPLANATION for each field:
1. _id: MongoDB requires a unique identifier for each record
2. originalUrl: We need to store the destination URL
3. shortCode: The key for quick lookups when redirecting
4. createdAt: Helps with analytics and cleanup of old URLs
5. clicks: Tracks popularity and usage
6. lastAccessed: Helps identify inactive links
7. isCustom: Different handling for custom vs. generated codes
8. userId: Enables user-specific features and management
9. qrCode: Separate object for QR-specific data
*/

// Analytics Collection Schema
// Stores detailed information about how URLs are being used
{
  _id: ObjectId,                    // Unique identifier for analytics record
  shortCodeId: ObjectId,            // Links to the shortened URL
  clickedAt: Timestamp,             // When the URL was accessed
  userAgent: String,                // Browser/device information
  ipAddress: String,                // User's IP address (for geographic data)
  referrer: String                  // Where the user came from
}

/*
LOGICAL EXPLANATION for Analytics:
1. We separate analytics from URL data because:
   - Analytics data grows much faster than URL data
   - We can purge old analytics without affecting URLs
   - Allows for efficient querying of either dataset
2. We track these specific fields because:
   - They help understand user behavior
   - Enable geographic analysis
   - Help detect abuse
   - Provide insights for business decisions
*/
```

## Core Functions Pseudocode

### 1. URL Shortening Process
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

### 2. URL Redirection Process
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

### 3. Frontend Components
/*
These are the parts of our website that users can see and interact with.
Think of them as the rooms in a house, each with its own purpose.
*/

#### Main Page Component
/*
This is our homepage where users can create short URLs.
Like a form at a post office where you fill in where you want your mail to go.
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

#### Redirect Page Component
```pseudocode
Component RedirectPage:
    Props:
        shortCode: string
    
    OnMount:
        Response = API.get("/api/[shortCode]")
        
        If Response.success:
            Redirect to Response.originalUrl
        Else:
            Show error page
```

## API Endpoints

### 1. Create Short URL
```pseudocode
POST /api/create
Request Body: {
    originalUrl: string,
    customCode?: string
}
Response: {
    success: boolean,
    shortUrl?: string,
    error?: string
}
```

### 2. Redirect to Original URL
```pseudocode
GET /[shortCode]
Response:
    - 301 Redirect to original URL
    - 404 if short code not found
```

## Error Handling

```pseudocode
Function handleErrors(error):
    Switch error.type:
        Case "INVALID_URL":
            Return "Please enter a valid URL"
        Case "CUSTOM_CODE_TAKEN":
            Return "This custom code is already in use"
        Case "URL_NOT_FOUND":
            Return "Short URL not found"
        Case "DATABASE_ERROR":
            Log error to monitoring system
            Return "Internal server error"
        Default:
            Log error to monitoring system
            Return "An unexpected error occurred"
```

## Security Measures
/*
This section helps keep our application safe and prevents misuse.
Think of it as having security guards and safety checks in place.
*/

```pseudocode
Function validateAndSanitizeInput(input):
    // Make sure URLs are real and safe
    If not isValidUrl(input.originalUrl):
        Return error("Invalid URL")
    
    // Make sure custom codes are acceptable
    If input.customCode exists:
        If not isValidCustomCode(input.customCode):
            Return error("Invalid custom code format")
    
    // Clean the URLs to prevent security issues
    sanitizedUrl = sanitizeUrl(input.originalUrl)
    
    Return {
        originalUrl: sanitizedUrl,
        customCode: input.customCode
    }
```

## Rate Limiting

```pseudocode
Function rateLimit(request):
    clientIP = getClientIP(request)
    
    currentRequests = getRateLimit(clientIP)
    If currentRequests > MAX_REQUESTS_PER_MINUTE:
        Return error("Rate limit exceeded")
    
    incrementRateLimit(clientIP)
    Return true
```

## Monitoring and Analytics
/*
This helps us understand how people are using our service.
Like having security cameras and counters in a store.
*/

```pseudocode
Function trackMetrics():
    // Keep track of important information
    Monitor:
        - URL creation rate              // How many URLs are being created
        - Redirect response time         // How fast our service is
        - Error rates                    // What's going wrong
        - Database performance           // How well our storage is working
        - Popular URLs                   // Which links are used most
        - Peak usage times              // When our service is busiest
    
    // Alert us if something's wrong
    If errorRate > threshold or responseTime > maxLatency:
        TriggerAlert(details)
```

## QR Code Generation and Management

### QR Code Generation Process
/*
This section handles creating QR codes for our short URLs.
Think of it as creating a digital barcode that phones can scan to visit the URL.
*/

```pseudocode
Function generateQRCode(shortUrl):
    // Make sure the URL is valid before making a QR code
    If not isValidShortUrl(shortUrl):
        Return error("Invalid short URL")
    
    // Set up how we want the QR code to look
    qrOptions = {
        errorCorrectionLevel: 'H',      // How well it handles damage
        margin: 1,                      // Space around the code
        color: {
            dark: '#000000',            // Color of the dots
            light: '#ffffff'            // Background color
        },
        width: 300,                     // Size of the QR code
        height: 300
    }
    
    // Create the actual QR code image
    qrCodeData = GenerateQRCodeImage(shortUrl, qrOptions)
    
    // Save the image somewhere we can access it
    qrImageUrl = SaveQRCodeToStorage(qrCodeData)
    
    // Update our database with the QR code information
    UpdateUrlRecord(shortUrl, {
        qrCode: {
            imageUrl: qrImageUrl,           // Where to find the image
            generatedAt: currentTimestamp(), // When we made it
            downloadCount: 0                 // How many times it's been downloaded
        }
    })
    
    Return {
        success: true,
        qrCodeUrl: qrImageUrl
    }
```

### QR Code API Endpoints
```pseudocode
// Generate QR Code
POST /api/qr/generate
Request Body: {
    shortCode: string
}
Response: {
    success: boolean,
    qrCodeUrl?: string,
    error?: string
}

// Download QR Code
GET /api/qr/download/{shortCode}
Response:
    - 200 with QR code image
    - 404 if not found
```

### Frontend QR Code Component
```pseudocode
Component QRCodeSection:
    Props:
        shortUrl: string
    
    State:
        qrCodeUrl: string
        isGenerating: boolean
        error: string
    
    Function generateQR():
        Set isGenerating to true
        
        Response = API.post("/api/qr/generate", {
            shortCode: extractShortCode(shortUrl)
        })
        
        If Response.success:
            Set qrCodeUrl to Response.qrCodeUrl
        Else:
            Set error to Response.error
        
        Set isGenerating to false
    
    Function downloadQR():
        Increment QR code download counter
        Trigger browser download for QR image
    
    Render:
        Container with:
            - QR Code preview (if generated)
            - Generate QR button
            - Download QR button (if generated)
            - Loading indicator
            - Error message (if any)
```

### QR Code Styling Options
```pseudocode
Function customizeQRCode(options):
    // Customization options
    customOptions = {
        // Logo options
        logo: {
            image: string (URL/Base64),
            width: number,
            height: number,
            position: 'center'
        },
        
        // Style options
        style: {
            shape: 'square' | 'circle' | 'rounded',
            color: {
                primary: string (hex),
                background: string (hex)
            },
            gradient: {
                type: 'linear' | 'radial',
                colors: string[] (hex),
                rotation: number
            }
        },
        
        // Size and format
        size: number,
        format: 'PNG' | 'SVG' | 'JPG',
        errorCorrection: 'L' | 'M' | 'Q' | 'H'
    }
    
    Return GenerateCustomQRCode(options)
```

### QR Code Analytics
```pseudocode
Function trackQRCodeMetrics():
    // Track QR code usage
    Monitor:
        - Generation frequency
        - Download count
        - Scan success rate
        - Most popular QR codes
        - Device types scanning QR codes
    
    // Store QR analytics
    SaveQRAnalytics({
        shortCodeId: ObjectId,
        action: 'generate' | 'download' | 'scan',
        timestamp: currentTimestamp(),
        deviceInfo: getUserDeviceInfo(),
        successful: boolean
    })
```
