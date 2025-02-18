import { NextApiRequest, NextApiResponse } from 'next';
import { generateShortUrl } from '../../lib/url-service';

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
    details?: object;
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
  console.log('Received request:', {
    method: req.method,
    headers: req.headers,
    body: req.body,
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
    
    // Get the base URL from environment or request
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host || 'vlink.vavqo.com';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;
    
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
    console.error('Error creating short URL:', error);

    // Handle specific known errors
    if (error instanceof Error) {
      if (error.message === 'Invalid URL format') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_URL',
            message: 'The provided URL is not valid'
          }
        });
      }
      
      if (error.message === 'Custom code already taken') {
        return res.status(409).json({
          success: false,
          error: {
            code: 'CUSTOM_CODE_TAKEN',
            message: 'The requested custom code is already in use'
          }
        });
      }

      // Log the full error details
      console.error('Detailed error:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while creating the short URL',
        details: process.env.NODE_ENV === 'development' ? { error: error instanceof Error ? error.message : String(error) } : undefined
      }
    });
  }
} 