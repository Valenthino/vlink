'use client';

import React from 'react';
import { useTheme } from 'next-themes';
import { Download, Settings, Share2, Info, Scan, Twitter, Facebook, Linkedin, MessageCircle, Copy, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { QRCodeOptions } from '@/lib/qr-service';
import { QRScanner } from './qr-scanner';
import { scanHistoryStore } from '@/lib/scan-history';
import { ScanHistory } from './scan-history';

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

export function QRCode({ 
  url, 
  size = 200, 
  showCustomization = true,
  showAnalytics = true,
  onScan,
}: QRCodeProps) {
  const { theme } = useTheme();
  const [qrCode, setQrCode] = React.useState<string | null>(null);
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

  const generateQR = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/qr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          format: 'dataURL',
          options: {
            ...options,
            width: size,
            color: {
              dark: theme === 'dark' ? '#ffffff' : '#000000',
              light: theme === 'dark' ? '#000000' : '#ffffff',
            },
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate QR code');
      }

      const data = await response.json();
      setQrCode(data.qrCode);
      if (data.info) {
        setQrInfo(data.info);
      }

      // Add to history
      await scanHistoryStore.addToHistory({
        url,
        scannedAt: new Date(),
        type: 'generate',
        metadata: {
          errorCorrectionLevel: data.info?.errorCorrectionLevel,
          version: data.info?.version,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  }, [url, size, theme, options]);

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

  React.useEffect(() => {
    generateQR();
  }, [generateQR]);

  if (error) {
    return (
      <div className="text-destructive text-sm">{error}</div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        {showScanner ? (
          <QRScanner
            onScan={handleScan}
            onError={(error) => setError(error)}
          />
        ) : (
          <>
            <div className="relative group">
              {loading ? (
                <div 
                  className="w-[200px] h-[200px] bg-card/50 rounded-lg animate-pulse flex items-center justify-center"
                  style={{ width: size, height: size }}
                >
                  <span className="text-muted-foreground">Generating...</span>
                </div>
              ) : qrCode && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <img
                    src={qrCode}
                    alt="QR Code"
                    width={size}
                    height={size}
                    className="rounded-lg"
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 rounded-lg opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <button
                      onClick={downloadQR}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      title="Download QR Code"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => setShowShareOptions(!showShareOptions)}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                    {onScan && (
                      <button
                        onClick={() => setShowScanner(true)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Scan QR Code"
                      >
                        <Scan className="w-5 h-5 text-white" />
                      </button>
                    )}
                    {showCustomization && (
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                        title="Customize QR Code"
                      >
                        <Settings className="w-5 h-5 text-white" />
                      </button>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </div>
            <ScanHistory onSelect={onScan} />
          </>
        )}
      </div>

      <AnimatePresence>
        {showShareOptions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 bg-card/50 p-4 rounded-lg"
          >
            <div className="flex flex-wrap gap-2">
              {shareOptions.map((option) => (
                <button
                  key={option.name}
                  onClick={() => handleShare(option)}
                  className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${option.color}`}
                >
                  {option.icon}
                  <span>{option.name}</span>
                </button>
              ))}
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                <span>{copied ? 'Copied!' : 'Copy URL'}</span>
              </button>
            </div>
          </motion.div>
        )}

        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4 bg-card/50 p-4 rounded-lg"
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Error Correction Level</label>
              <select
                value={options.errorCorrectionLevel}
                onChange={(e) => setOptions(prev => ({ ...prev, errorCorrectionLevel: e.target.value as 'L' | 'M' | 'Q' | 'H' }))}
                className="w-full p-2 bg-background border border-border rounded-md"
              >
                <option value="L">Low (7%)</option>
                <option value="M">Medium (15%)</option>
                <option value="Q">Quartile (25%)</option>
                <option value="H">High (30%)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Margin</label>
              <input
                type="range"
                min="0"
                max="4"
                step="1"
                value={options.margin}
                onChange={(e) => setOptions(prev => ({ ...prev, margin: Number(e.target.value) }))}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Scale</label>
              <input
                type="range"
                min="1"
                max="8"
                step="1"
                value={options.scale}
                onChange={(e) => setOptions(prev => ({ ...prev, scale: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          </motion.div>
        )}

        {showAnalytics && qrInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4 text-sm text-muted-foreground"
          >
            <div className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              <span>{stats.downloads}</span>
            </div>
            <div className="flex items-center gap-1">
              <Info className="w-4 h-4" />
              <span>v{qrInfo.version}</span>
            </div>
            <div>
              <span>ECC: {qrInfo.errorCorrectionLevel}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 