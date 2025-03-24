import { NextRequest, NextResponse } from 'next/server';
import { generateQRCode } from '@/lib/qr-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, format, options } = body;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const result = await generateQRCode(url, format, options);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error generating QR code:', error);
    return NextResponse.json(
      { error: 'Failed to generate QR code' },
      { status: 500 }
    );
  }
} 