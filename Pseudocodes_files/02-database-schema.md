# Database Schema

[← Back to Main](00-main.md)

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

## URL Collection Schema
```mongodb
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
```

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

## Analytics Collection Schema
```mongodb
// Stores detailed information about how URLs are being used
{
  _id: ObjectId,                    // Unique identifier for analytics record
  shortCodeId: ObjectId,            // Links to the shortened URL
  clickedAt: Timestamp,             // When the URL was accessed
  userAgent: String,                // Browser/device information
  ipAddress: String,                // User's IP address (for geographic data)
  referrer: String                  // Where the user came from
}
```

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