'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, QrCode } from 'lucide-react';
import { QRCode } from '@/components/ui/qr-code';

export default function Home() {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShortUrl('');
    setLoading(true);
    setShowQR(false);

    try {
      const response = await fetch('/api/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl: url,
          customCode: customCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error.message);
      }

      setShortUrl(data.data.shortUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-block p-3 rounded-2xl bg-primary/10 mb-4"
          >
            <Link2 className="w-8 h-8 text-primary" />
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500"
          >
            VLink
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl text-muted-foreground"
          >
            Shorten your links with style
          </motion.p>
        </div>

        {/* URL Shortener Form */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/50 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-border"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="url" className="block text-sm font-medium text-foreground">
                Enter your URL
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                required
                className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-foreground"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="customCode" className="block text-sm font-medium text-foreground">
                Custom short code (optional)
              </label>
              <input
                type="text"
                id="customCode"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
                placeholder="e.g., my-link"
                className="w-full px-4 py-3 bg-background/50 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors text-foreground"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Shortening...
                </span>
              ) : 'Shorten URL'}
            </button>
          </form>
        </motion.div>

        {/* Results */}
        {shortUrl && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 backdrop-blur-lg rounded-2xl p-6 space-y-4 border border-green-500/30"
          >
            <h3 className="text-lg font-medium text-green-400">URL Shortened Successfully!</h3>
            <div className="flex items-center space-x-4">
              <input
                type="text"
                readOnly
                value={shortUrl}
                className="flex-1 px-4 py-3 bg-background/50 border border-green-500/30 rounded-lg text-foreground"
              />
              <button
                onClick={handleCopy}
                className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors relative overflow-hidden"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={() => setShowQR(!showQR)}
                className="p-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors"
                title="Generate QR Code"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>

            {/* QR Code */}
            {showQR && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-center pt-4"
              >
                <QRCode url={shortUrl} />
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-destructive/10 text-destructive-foreground rounded-2xl p-6 border border-destructive/30"
          >
            <p>{error}</p>
          </motion.div>
        )}

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground">
          <p>Built with Next.js and MongoDB</p>
        </footer>
      </motion.div>
    </main>
  );
} 