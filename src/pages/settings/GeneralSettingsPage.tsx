import React, { useState, useEffect } from 'react';
import { Mail, Globe, Phone, MapPin, Building } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { supabase } from '../../lib/supabase';
const GeneralSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    companyName: 'TEMI-Construction',
    website: 'https://temi-construction.fr',
    email: 'contact@temi-construction.fr',
    phone: '01 23 45 67 89',
    address: '123 Rue de la Construction, 75001 Paris',
    logo: null as string | null,
    theme: 'light',
    language: 'fr',
    timezone: 'Europe/Paris',
  });

  const [loading, setLoading] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // Vérifier l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Utilisateur actuel:', user?.id, user?.email);

      // Vérifier le rôle de l'utilisateur
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        console.log('Rôle utilisateur:', userData?.role);
      }

      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .maybeSingle();

      console.log('Paramètres chargés:', { data, error });

      if (error) throw error;

      if (data) {
        setSettingsId(data.id);
        setSettings({
          companyName: data.company_name || '',
          website: data.website || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          logo: data.logo_url || null,
          theme: data.theme || 'light',
          language: data.language || 'fr',
          timezone: data.timezone || 'Europe/Paris',
        });
      }
    } catch (err) {
      console.error('Erreur lors du chargement des paramètres:', err);
      setError('Impossible de charger les paramètres');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const settingsData = {
        company_name: settings.companyName,
        website: settings.website,
        email: settings.email,
        phone: settings.phone,
        address: settings.address,
        logo_url: settings.logo,
        theme: settings.theme,
        language: settings.language,
        timezone: settings.timezone,
        updated_at: new Date().toISOString(),
      };

      if (settingsId) {
        console.log('Tentative de mise à jour des paramètres avec ID:', settingsId);
        const { data, error: updateError } = await supabase
          .from('app_settings')
          .update(settingsData)
          .eq('id', settingsId)
          .select();

        console.log('Résultat de la mise à jour:', { data, error: updateError });

        if (updateError) {
          console.error('Erreur UPDATE:', updateError);
          throw updateError;
        }
      } else {
        console.log('Tentative de création de nouveaux paramètres');
        const { data: newData, error: insertError } = await supabase
          .from('app_settings')
          .insert([settingsData])
          .select()
          .single();

        console.log('Résultat de l\'insertion:', { data: newData, error: insertError });

        if (insertError) {
          console.error('Erreur INSERT:', insertError);
          throw insertError;
        }
        if (newData) setSettingsId(newData.id);
      }

      setSuccess('Paramètres enregistrés avec succès');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde des paramètres:', err);
      const errorMessage = err?.message || 'Erreur lors de la sauvegarde des paramètres';
      setError(`Erreur: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Paramètres généraux</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <Input
                label="Nom de l'entreprise"
                value={settings.companyName}
                onChange={e => setSettings({ ...settings, companyName: e.target.value })}
                leftIcon={<Building size={18} className="text-gray-500" />}
              />

              <Input
                label="Site web"
                value={settings.website}
                onChange={e => setSettings({ ...settings, website: e.target.value })}
                leftIcon={<Globe size={18} className="text-gray-500" />}
              />

              <Input
                label="Email"
                type="email"
                value={settings.email}
                onChange={e => setSettings({ ...settings, email: e.target.value })}
                leftIcon={<Mail size={18} className="text-gray-500" />}
              />

              <Input
                label="Téléphone"
                value={settings.phone}
                onChange={e => setSettings({ ...settings, phone: e.target.value })}
                leftIcon={<Phone size={18} className="text-gray-500" />}
              />

              <Input
                label="Adresse"
                value={settings.address}
                onChange={e => setSettings({ ...settings, address: e.target.value })}
                leftIcon={<MapPin size={18} className="text-gray-500" />}
              />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900">Préférences</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thème</label>
                  <select
                    value={settings.theme}
                    onChange={e => setSettings({ ...settings, theme: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="light">Clair</option>
                    <option value="dark">Sombre</option>
                    <option value="system">Système</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Langue</label>
                  <select
                    value={settings.language}
                    onChange={e => setSettings({ ...settings, language: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fuseau horaire
                  </label>
                  <select
                    value={settings.timezone}
                    onChange={e => setSettings({ ...settings, timezone: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  >
                    <option value="Europe/Paris">Europe/Paris</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={loadSettings}
                disabled={loading}
              >
                Annuler
              </Button>
              <Button type="submit" variant="primary" isLoading={loading}>
                Enregistrer les modifications
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettingsPage;
