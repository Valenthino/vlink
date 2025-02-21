import { NextApiRequest, NextApiResponse } from 'next';
import { generateShortUrl } from '@/lib/url-service';

interface CreateUrlRequest {
  originalUrl: string;
  customCode?: string;
}

interface SuccessResponse {
  success: true;
  data: {
    shortUrl: string;
  };
}

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

type ApiResponse = SuccessResponse | ErrorResponse;

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Log request details
  console.log('API Request:', {
    method: req.method,
    headers: {
      ...req.headers,
      host: req.headers.host,
      'x-forwarded-proto': req.headers['x-forwarded-proto']
    },
    body: req.body,
    env: {
      NODE_ENV: process.env.NODE_ENV,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not Set',
      BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'Not Set'
    }
  });

  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed'
      }
    });
  }

  try {
    const { originalUrl, customCode } = req.body as CreateUrlRequest;

    // Validate request body
    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_URL',
          message: 'Original URL is required'
        }
      });
    }

    // Validate URL format
    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'Please enter a valid URL'
        }
      });
    }

    console.log('Generating short URL for:', originalUrl);
    
    // Generate short URL
    const shortCode = await generateShortUrl(originalUrl, customCode);
    console.log('Generated short code:', shortCode);
    
    // Get the base URL from environment or request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'vlink.vavqo.com';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
    console.log('URL construction:', { protocol, host, baseUrl });
    
    // Construct the full short URL
    const shortUrl = `${baseUrl}/${shortCode}`;
    
    console.log('Generated short URL:', shortUrl);

    return res.status(200).json({
      success: true,
      data: {
        shortUrl
      }
    });

  } catch (error) {
    console.error('Detailed error in /api/create:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      errorName: error instanceof Error ? error.name : undefined,
      requestBody: req.body,
      requestHeaders: req.headers,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not Set',
        BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'Not Set'
      }
    });

    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message === 'Invalid URL format') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'The provided URL is not valid',
            details: { originalError: error.message }
          }
        });
      }
      
      if (error.message === 'Custom code already taken') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CUSTOM_CODE_TAKEN',
            message: 'The requested custom code is already in use',
            details: { originalError: error.message }
          }
        });
      }

      if (error.message.includes('MongoDB')) {
        return res.status(500).json({
          success: false,
          error: {
            code: 'DATABASE_ERROR',
            message: 'Database connection error',
            details: { originalError: error.message }
          }
        });
      }
    }

    // Generic error response with more details
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while creating the short URL',
        details: {
          errorMessage: error instanceof Error ? error.message : String(error),
          errorType: error instanceof Error ? error.name : typeof error,
          timestamp: new Date().toISOString()
        }
      }
    });
  }
} 