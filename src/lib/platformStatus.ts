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

  constructor() { this.startMonitoring(); }

  private async checkHealth(): Promise<PlatformStatus> {
    try {
      const url  = import.meta.env.VITE_SUPABASE_URL as string | undefined;
      const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
      if (!url || !anon) return 'degraded';

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(`${url}/rest/v1/app_settings?select=id&limit=1`, {
        signal: controller.signal,
        headers: { apikey: anon, Authorization: `Bearer ${anon}` },
      });

      clearTimeout(timeoutId);
      return res.ok ? 'operational' : 'degraded';
    } catch {
      return 'offline';
    }
  }

  private async performCheck() {
    const next = await this.checkHealth();
    const changed = next !== this.status;
    this.status = next;
    this.lastChecked = new Date();
    if (changed || this.listeners.size > 0) this.notifyListeners();
  }

  private notifyListeners() {
    const info = this.getStatusInfo();
    this.listeners.forEach(l => l(info));
  }

  private startMonitoring() {
    this.performCheck();
    this.checkInterval = setInterval(() => this.performCheck(), 60_000);
  }

  public subscribe(cb: (s: StatusInfo) => void) {
    this.listeners.add(cb);
    cb(this.getStatusInfo());
    return () => { this.listeners.delete(cb); };
  }

  public getStatusInfo(): StatusInfo {
    const map: Record<PlatformStatus, { label: string; indicator: string }> = {
      operational: { label: 'Opérationnel',  indicator: '🟢' },
      degraded:    { label: 'Perturbations', indicator: '🟡' },
      offline:     { label: 'Hors-ligne',    indicator: '🔴' },
    };
    const info = map[this.status];
    return { status: this.status, label: info.label, indicator: info.indicator, lastChecked: this.lastChecked };
  }

  public stop() {
    if (this.checkInterval) { clearInterval(this.checkInterval); this.checkInterval = null; }
    this.listeners.clear();
  }
}

export const platformStatusMonitor = new PlatformStatusMonitor();
