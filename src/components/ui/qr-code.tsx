'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Download, Settings, Share2, Info, Scan, Twitter, Facebook, Linkedin, MessageCircle, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QRCodeOptions } from '@/lib/qr-service';
import { QRScanner } from './qr-scanner';
import { scanHistoryStore } from '@/lib/scan-history';
import { ScanHistory } from './scan-history';
import QRCodeLib from 'qrcode';

interface QRCodeProps {
  url: string;
  size?: number;
  showCustomization?: boolean;
  showAnalytics?: boolean;
  onScan?: (result: string) => void;
}

interface QRCodeStats {
  downloads: number;
  scans: number;
  lastScan?: Date;
}

interface ShareOption {
  name: string;
  icon: React.ReactNode;
  shareUrl: (url: string) => string;
  color: string;
}

interface QRCodeInfo {
  version: number;
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
  maskPattern: number;
  segments: number;
}

const shareOptions: ShareOption[] = [
  {
    name: 'Twitter',
    icon: <Twitter className="w-5 h-5" />,
    shareUrl: (url) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`,
    color: 'bg-[#1DA1F2] hover:bg-[#1DA1F2]/90',
  },
  {
    name: 'Facebook',
    icon: <Facebook className="w-5 h-5" />,
    shareUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    color: 'bg-[#1877F2] hover:bg-[#1877F2]/90',
  },
  {
    name: 'LinkedIn',
    icon: <Linkedin className="w-5 h-5" />,
    shareUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    color: 'bg-[#0A66C2] hover:bg-[#0A66C2]/90',
  },
  {
    name: 'WhatsApp',
    icon: <MessageCircle className="w-5 h-5" />,
    shareUrl: (url) => `https://wa.me/?text=${encodeURIComponent(url)}`,
    color: 'bg-[#25D366] hover:bg-[#25D366]/90',
  },
];

export const QRCode: React.FC<QRCodeProps> = ({ 
  url, 
  size = 200, 
  showCustomization = true,
  showAnalytics = true,
  onScan,
}) => {
  const { theme } = useTheme();
  const [qrDataUrl, setQrDataUrl] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showSettings, setShowSettings] = React.useState(false);
  const [showScanner, setShowScanner] = React.useState(false);
  const [showShareOptions, setShowShareOptions] = React.useState(false);
  const [stats, setStats] = React.useState<QRCodeStats>({ downloads: 0, scans: 0 });
  const [qrInfo, setQrInfo] = React.useState<QRCodeInfo | null>(null);
  const [canShare, setCanShare] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const [options, setOptions] = React.useState<QRCodeOptions>({
    errorCorrectionLevel: 'M',
    margin: 1,
    scale: 4,
    quality: 0.92,
  });

  React.useEffect(() => {
    setCanShare('share' in navigator);
  }, []);

  React.useEffect(() => {
    const generateQR = async () => {
      try {
        const dataUrl = await QRCodeLib.toDataURL(url, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };

    generateQR();
  }, [url, size]);

  const downloadQR = React.useCallback(async () => {
    try {
      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          format: 'buffer',
          options: {
            ...options,
            width: size * 2,
            color: {
              dark: theme === 'dark' ? '#ffffff' : '#000000',
              light: theme === 'dark' ? '#000000' : '#ffffff',
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to download QR code');
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = 'qr-code.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      
      // Update stats
      setStats(prev => ({ ...prev, downloads: prev.downloads + 1 }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download QR code');
    }
  }, [url, size, theme, options]);

  const handleShare = async (option: ShareOption) => {
    window.open(option.shareUrl(url), '_blank');
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleScan = async (result: string) => {
    setShowScanner(false);
    
    // Add to history
    await scanHistoryStore.addToHistory({
      url: result,
      scannedAt: new Date(),
      type: 'scan',
    });

    onScan?.(result);
    setStats(prev => ({ ...prev, scans: prev.scans + 1, lastScan: new Date() }));
  };

  if (!qrDataUrl) {
    return <div>Loading QR code...</div>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <img
        src={qrDataUrl}
        alt={`QR code for ${url}`}
        width={size}
        height={size}
        className="rounded-lg shadow-lg"
      />
      <p className="text-sm text-muted-foreground">Scan to visit {url}</p>
    </div>
  );
}; 