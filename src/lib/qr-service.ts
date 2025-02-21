import QRCode, { QRCodeToDataURLOptions, QRCodeToBufferOptions, QRCodeSegment } from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  quality?: number;
  scale?: number;
}

export interface QRCodeAnalytics {
  generatedAt: Date;
  downloadCount: number;
  scannedCount: number;
  lastScanned?: Date;
}

export interface QRCodeInfo {
  version: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  maskPattern: number;
  segments: number;
}

export async function generateQR(url: string, options: QRCodeOptions = {}) {
  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: options.width || 200,
      margin: options.margin || 2,
      color: {
        dark: options.color?.dark || '#000000',
        light: options.color?.light || '#FFFFFF',
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    });

    return qrDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function generateQRCodeBuffer(url: string, options: QRCodeOptions = {}) {
  const defaultOptions: QRCodeToBufferOptions = {
    width: 400,
    margin: 1,
    color: {
      dark: '#000000',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
    quality: 0.92,
    scale: 4,
    ...options,
  };

  try {
    const buffer = await QRCode.toBuffer(url, defaultOptions);
    return buffer;
  } catch (error) {
    console.error('Error generating QR code buffer:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function getQRCodeInfo(url: string): QRCodeInfo {
  try {
    const segments = QRCode.create(url, { errorCorrectionLevel: 'M' });
    const errorLevel = String(segments.errorCorrectionLevel || 'M') as 'L' | 'M' | 'Q' | 'H';
    
    return {
      version: segments.version || 0,
      errorCorrectionLevel: errorLevel,
      maskPattern: segments.maskPattern || 0,
      segments: segments.segments?.length || 0,
    };
  } catch (error) {
    console.error('Error getting QR code info:', error);
    return {
      version: 0,
      errorCorrectionLevel: 'M',
      maskPattern: 0,
      segments: 0,
    };
  }
} 