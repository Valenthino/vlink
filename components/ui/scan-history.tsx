'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Trash2, QrCode, Copy, Check } from 'lucide-react';
import type { ScanHistoryItem } from '@/lib/scan-history';
import { scanHistoryStore } from '@/lib/scan-history';

interface ScanHistoryProps {
  onSelect?: (url: string) => void;
}

export function ScanHistory({ onSelect }: ScanHistoryProps) {
  const [history, setHistory] = React.useState<ScanHistoryItem[]>([]);
  const [copied, setCopied] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    const items = await scanHistoryStore.getHistory();
    setHistory(items);
  }

  async function clearHistory() {
    await scanHistoryStore.clearHistory();
    setHistory([]);
  }

  async function copyToClipboard(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }

  if (history.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <QrCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No scan history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Scan History</h3>
        <button
          onClick={clearHistory}
          className="text-destructive hover:text-destructive/80 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-2">
        <AnimatePresence>
          {history.map((item) => (
            <motion.div
              key={item.scannedAt.toISOString()}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center justify-between p-2 rounded-lg bg-card hover:bg-card/80 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="text-muted-foreground">
                  {item.type === 'scan' ? (
                    <QrCode className="w-4 h-4" />
                  ) : (
                    <Clock className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium truncate max-w-[200px]">
                    {item.url}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(item.scannedAt).toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(item.url)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {copied === item.url ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                {onSelect && (
                  <button
                    onClick={() => onSelect(item.url)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 