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

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
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

    // Check if originalUrl is provided
    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_URL',
          message: 'Original URL is required'
        }
      });
    }

    // Generate short URL
    const shortCode = await generateShortUrl(originalUrl, customCode);

    // Construct the full short URL
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || `https://${req.headers.host}`}/${shortCode}`;

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
    }

    // Generic error response
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    });
  }
} 