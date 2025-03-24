import QRCode, { QRCodeToDataURLOptions, QRCodeToBufferOptions, QRCodeSegment } from 'qrcode';

export interface QRCodeOptions {
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
  margin?: number;
  scale?: number;
  width?: number;
  quality?: number;
  color?: {
    dark: string;
    light: string;
  };
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

export interface QRCodeResult {
  qrCode: string;
  info?: {
    version: number;
    errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
    maskPattern: number;
    segments: number;
  };
}

export async function generateQRCode(
  url: string,
  format: 'dataURL' | 'buffer' = 'dataURL',
  options: QRCodeOptions = {}
): Promise<QRCodeResult> {
  const qrOptions = {
    errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    margin: options.margin || 1,
    scale: options.scale || 4,
    width: options.width || 200,
    quality: options.quality || 0.92,
    color: options.color || {
      dark: '#000000',
      light: '#ffffff',
    },
  };

  try {
    let qrCode: string | Buffer;
    
    if (format === 'dataURL') {
      qrCode = await QRCode.toDataURL(url, qrOptions);
    } else {
      qrCode = await QRCode.toBuffer(url, qrOptions);
    }

    // Get QR code information
    const info = await QRCode.create(url, {
      errorCorrectionLevel: qrOptions.errorCorrectionLevel,
    });

    return {
      qrCode: format === 'dataURL' ? qrCode as string : (qrCode as Buffer).toString('base64'),
      info: {
        version: info.version,
        errorCorrectionLevel: info.errorCorrectionLevel,
        maskPattern: info.maskPattern,
        segments: info.segments.length,
      },
    };
  } catch (error) {
    throw new Error('Failed to generate QR code: ' + (error instanceof Error ? error.message : String(error)));
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