import React, { useState } from 'react';
import { Mail, Globe, Phone, MapPin, Building } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sauvegarder les paramètres
      await new Promise(resolve => setTimeout(resolve, 1000));
      // Simuler la sauvegarde
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Paramètres généraux</h2>

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
              <Button type="button" variant="outline" onClick={() => {}} disabled={loading}>
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
