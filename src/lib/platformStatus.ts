// src/lib/platformStatus.ts

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

  /**
   * Ping public via REST sur la table app_settings
   * (évite /auth/v1/health qui renvoie 401).
   */
  private async checkHealth(): Promise<PlatformStatus> {
    try {
      const url  = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

      if (!url || !anon) {
        // Vars manquantes => statu "dégradé" plutôt qu'offline
        return 'degraded';
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Lecture publique très légère
      const res = await fetch(`${url}/rest/v1/app_settings?select=id&limit=1`, {
        signal: controller.signal,
        headers: {
          apikey: anon,
          Authorization: `Bearer ${anon}`,
        },
      });

      clearTimeout(timeoutId);

      if (res.ok) return 'operational';
      return 'degraded';
    } catch {
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
    this.listeners.forEach((listener) => listener(info));
  }

  private startMonitoring() {
    this.performCheck();
    this.checkInterval = setInterval(() => {
      this.performCheck();
    }, 60_000); // toutes les 60s
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
      operational: { label: 'Opérationnel',  indicator: '🟢' },
      degraded:    { label: 'Perturbations', indicator: '🟡' },
      offline:     { label: 'Hors-ligne',    indicator: '🔴' },
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

