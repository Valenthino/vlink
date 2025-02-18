import { NextRequest, NextResponse } from 'next/server';
import { generateQRCode, generateQRCodeBuffer, getQRCodeInfo } from '@/lib/qr-service';

export async function POST(req: NextRequest) {
  try {
    const { url, format = 'dataURL', options = {} } = await req.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!['dataURL', 'buffer'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Must be either "dataURL" or "buffer"' },
        { status: 400 }
      );
    }

    // Get QR code info
    const info = getQRCodeInfo(url);

    // Generate QR code
    const qrCode = format === 'dataURL'
      ? await generateQRCode(url, options)
      : await generateQRCodeBuffer(url, options);

    // For buffer format, return as attachment
    if (format === 'buffer') {
      return new NextResponse(qrCode, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': 'attachment; filename="qr-code.png"',
          'Cache-Control': 'public, max-age=31536000',
        },
      });
    }

    // For dataURL format, return JSON with QR code and info
    return NextResponse.json({
      qrCode,
      info: {
        version: info.version,
        errorCorrectionLevel: info.errorCorrectionLevel,
        maskPattern: info.maskPattern,
        segments: info.segments,
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
} 