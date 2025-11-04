import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AppSettings {
  companyName: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string | null;
  theme: string;
  language: string;
  timezone: string;
}

interface AppSettingsStore {
  settings: AppSettings;
  loading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>;
}

export const useAppSettings = create<AppSettingsStore>((set, get) => ({
  settings: {
    companyName: 'TEMI-Construction',
    website: 'https://www.temi-construction.com',
    email: 'contact@temi-construction.com',
    phone: '02 35 77 18 90',
    address: '',
    logoUrl: null,
    theme: 'light',
    language: 'fr',
    timezone: 'Europe/Paris',
  },
  loading: false,
  error: null,

  loadSettings: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .maybeSingle();

      if (error) throw error;

      if (data) {
        set({
          settings: {
            companyName: data.company_name || 'TEMI-Construction',
            website: data.website || 'https://www.temi-construction.com',
            email: data.email || 'contact@temi-construction.com',
            phone: data.phone || '02 35 77 18 90',
            address: data.address || '',
            logoUrl: data.logo_url || null,
            theme: data.theme || 'light',
            language: data.language || 'fr',
            timezone: data.timezone || 'Europe/Paris',
          },
          loading: false,
        });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('Error loading app settings:', err);
      set({ error: 'Failed to load app settings', loading: false });
    }
  },

  updateSettings: async (newSettings: Partial<AppSettings>) => {
    const currentSettings = get().settings;
    const updatedSettings = { ...currentSettings, ...newSettings };

    set({ settings: updatedSettings, loading: true, error: null });

    try {
      const { data: existingData } = await supabase
        .from('app_settings')
        .select('id')
        .maybeSingle();

      const payload = {
        company_name: updatedSettings.companyName,
        website: updatedSettings.website,
        email: updatedSettings.email,
        phone: updatedSettings.phone,
        address: updatedSettings.address,
        logo_url: updatedSettings.logoUrl,
        theme: updatedSettings.theme,
        language: updatedSettings.language,
        timezone: updatedSettings.timezone,
      };

      if (existingData?.id) {
        const { error } = await supabase
          .from('app_settings')
          .update(payload)
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('app_settings')
          .insert([payload]);

        if (error) throw error;
      }

      set({ loading: false });
    } catch (err) {
      console.error('Error updating app settings:', err);
      set({
        error: 'Failed to update app settings',
        loading: false,
        settings: currentSettings
      });
      throw err;
    }
  },
}));
