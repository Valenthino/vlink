export interface ScanHistoryItem {
  id: string;
  url: string;
  scannedAt: Date;
  type: 'scan' | 'generate';
  metadata?: {
    title?: string;
    description?: string;
    errorCorrectionLevel?: string;
    version?: number;
  };
}

class ScanHistoryStore {
  private static instance: ScanHistoryStore;
  private readonly STORAGE_KEY = 'qr-scan-history';
  private readonly MAX_HISTORY_ITEMS = 50;

  private constructor() {}

  static getInstance(): ScanHistoryStore {
    if (!ScanHistoryStore.instance) {
      ScanHistoryStore.instance = new ScanHistoryStore();
    }
    return ScanHistoryStore.instance;
  }

  async getHistory(): Promise<ScanHistoryItem[]> {
    if (typeof window === 'undefined') return [];
    
    try {
      const history = localStorage.getItem(this.STORAGE_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error reading scan history:', error);
      return [];
    }
  }

  async addToHistory(item: Omit<ScanHistoryItem, 'id'>): Promise<void> {
    try {
      const history = await this.getHistory();
      const newItem: ScanHistoryItem = {
        ...item,
        id: crypto.randomUUID(),
      };

      // Add new item to the beginning of the array
      history.unshift(newItem);

      // Keep only the most recent items
      const trimmedHistory = history.slice(0, this.MAX_HISTORY_ITEMS);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (error) {
      console.error('Error adding to scan history:', error);
    }
  }

  async clearHistory(): Promise<void> {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing scan history:', error);
    }
  }

  async removeFromHistory(id: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const updatedHistory = history.filter(item => item.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error removing from scan history:', error);
    }
  }
}

export const scanHistoryStore = ScanHistoryStore.getInstance(); 