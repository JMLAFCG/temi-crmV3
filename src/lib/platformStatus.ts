import { supabase } from './supabase';

export type PlatformStatus = 'operational' | 'degraded' | 'offline';

export interface StatusInfo {
  status: PlatformStatus;
  label: string;
  indicator: string;
  lastChecked: Date;
}

class PlatformStatusMonitor {
  private status: PlatformStatus = 'operational';
  private lastChecked: Date = new Date();
  private listeners: Set<(status: StatusInfo) => void> = new Set();
  private checkInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.startMonitoring();
  }

  private async checkHealth(): Promise<PlatformStatus> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${supabase.supabaseUrl}/auth/v1/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return 'operational';
      } else if (response.status >= 500) {
        return 'degraded';
      } else {
        return 'operational';
      }
    } catch (error) {
      return 'offline';
    }
  }

  private async performCheck() {
    const newStatus = await this.checkHealth();
    const changed = newStatus !== this.status;

    this.status = newStatus;
    this.lastChecked = new Date();

    if (changed || this.listeners.size > 0) {
      this.notifyListeners();
    }
  }

  private notifyListeners() {
    const info = this.getStatusInfo();
    this.listeners.forEach(listener => listener(info));
  }

  private startMonitoring() {
    this.performCheck();

    this.checkInterval = setInterval(() => {
      this.performCheck();
    }, 60000);
  }

  public subscribe(callback: (status: StatusInfo) => void): () => void {
    this.listeners.add(callback);
    callback(this.getStatusInfo());

    return () => {
      this.listeners.delete(callback);
    };
  }

  public getStatusInfo(): StatusInfo {
    const statusMap: Record<PlatformStatus, { label: string; indicator: string }> = {
      operational: { label: 'Opérationnel', indicator: '🟢' },
      degraded: { label: 'Perturbations', indicator: '🔴' },
      offline: { label: 'Hors-ligne', indicator: '⚪' },
    };

    const info = statusMap[this.status];

    return {
      status: this.status,
      label: info.label,
      indicator: info.indicator,
      lastChecked: this.lastChecked,
    };
  }

  public stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.listeners.clear();
  }
}

export const platformStatusMonitor = new PlatformStatusMonitor();
