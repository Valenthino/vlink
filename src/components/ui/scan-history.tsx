'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Trash2, ExternalLink, Clock, QrCode, X } from 'lucide-react';
import type { ScanHistoryItem } from '@/lib/scan-history';
import { scanHistoryStore } from '@/lib/scan-history';

interface ScanHistoryProps {
  onSelect?: (url: string) => void;
}

export function ScanHistory({ onSelect }: ScanHistoryProps) {
  const [history, setHistory] = React.useState<ScanHistoryItem[]>([]);
  const [showHistory, setShowHistory] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const loadHistory = React.useCallback(async () => {
    try {
      setLoading(true);
      const items = await scanHistoryStore.getHistory();
      setHistory(items);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClearHistory = async () => {
    try {
      await scanHistoryStore.clearHistory();
      setHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  const handleRemoveItem = async (id: string) => {
    try {
      await scanHistoryStore.removeFromHistory(id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleString();
  };

  const formatUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname + (u.pathname !== '/' ? u.pathname : '');
    } catch {
      return url;
    }
  };

  React.useEffect(() => {
    if (showHistory) {
      loadHistory();
    }
  }, [showHistory, loadHistory]);

  return (
    <div className="relative">
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors"
      >
        <History className="w-5 h-5" />
        <span>History</span>
      </button>

      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full mt-2 left-0 right-0 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg overflow-hidden z-50"
          >
            <div className="p-4 max-h-[60vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Scan History</h3>
                <button
                  onClick={handleClearHistory}
                  className="flex items-center gap-2 px-3 py-1 text-sm bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Clear All</span>
                </button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <QrCode className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No scan history yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-3 p-3 bg-background/50 hover:bg-background rounded-lg group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <span className={item.type === 'scan' ? 'text-blue-500' : 'text-green-500'}>
                            {item.type === 'scan' ? 'Scanned' : 'Generated'}
                          </span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(item.scannedAt)}
                          </span>
                        </div>
                        <p className="text-sm truncate">{formatUrl(item.url)}</p>
                      </div>

                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => window.open(item.url, '_blank')}
                          className="p-1 hover:bg-primary/10 rounded-md transition-colors"
                          title="Open URL"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                        {onSelect && (
                          <button
                            onClick={() => onSelect(item.url)}
                            className="p-1 hover:bg-primary/10 rounded-md transition-colors"
                            title="Use this URL"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1 hover:bg-destructive/10 text-destructive rounded-md transition-colors"
                          title="Remove from history"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 