export interface ScanHistoryItem {
  url: string;
  scannedAt: Date;
  type: 'scan' | 'generate';
  metadata?: {
    errorCorrectionLevel?: string;
    version?: number;
  };
}

class ScanHistoryStore {
  private readonly STORAGE_KEY = 'qr-scan-history';
  private readonly MAX_HISTORY_ITEMS = 50;

  async getHistory(): Promise<ScanHistoryItem[]> {
    if (typeof window === 'undefined') return [];
    
    try {
      const history = localStorage.getItem(this.STORAGE_KEY);
      if (!history) return [];

      return JSON.parse(history).map((item: any) => ({
        ...item,
        scannedAt: new Date(item.scannedAt),
      }));
    } catch (error) {
      console.error('Error reading scan history:', error);
      return [];
    }
  }

  async addToHistory(item: ScanHistoryItem): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      const history = await this.getHistory();
      const newHistory = [
        {
          ...item,
          scannedAt: item.scannedAt.toISOString(),
        },
        ...history,
      ].slice(0, this.MAX_HISTORY_ITEMS);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error adding to scan history:', error);
    }
  }

  async clearHistory(): Promise<void> {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing scan history:', error);
    }
  }
}

export const scanHistoryStore = new ScanHistoryStore(); 