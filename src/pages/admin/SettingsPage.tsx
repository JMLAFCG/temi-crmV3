import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Globe, Phone, MapPin, FileText, Bell, Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const SettingsPage: React.FC = () => {
  const { theme, setTheme, currentTheme } = useTheme();
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'TEMI-Construction',
    website: 'https://www.temi-construction.com',
    email: 'contact@temi-construction.com',
    phone: '02 35 77 18 90',
    address: '17 Rue du Moulin Potel, 27400 Acquigny',
  });

  const [emailSettings, setEmailSettings] = useState({
    smtpHost: 'smtp.example.com',
    smtpPort: '587',
    smtpUser: 'notifications@temi-construction.fr',
    smtpPassword: '••••••••••••',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    documentReminders: true,
    projectUpdates: true,
    securityAlerts: true,
  });

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h1>

      <div className="space-y-6">
        {/* Paramètres généraux */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Paramètres généraux</h2>
          <div className="grid grid-cols-1 gap-6">
            <Input
              label="Nom de l'entreprise"
              value={generalSettings.companyName}
              onChange={e =>
                setGeneralSettings({ ...generalSettings, companyName: e.target.value })
              }
              leftIcon={<FileText size={18} className="text-gray-500" />}
            />

            <Input
              label="Site web"
              value={generalSettings.website}
              onChange={e => setGeneralSettings({ ...generalSettings, website: e.target.value })}
              leftIcon={<Globe size={18} className="text-gray-500" />}
            />

            <Input
              label="Email"
              type="email"
              value={generalSettings.email}
              onChange={e => setGeneralSettings({ ...generalSettings, email: e.target.value })}
              leftIcon={<Mail size={18} className="text-gray-500" />}
            />

            <Input
              label="Téléphone"
              value={generalSettings.phone}
              onChange={e => setGeneralSettings({ ...generalSettings, phone: e.target.value })}
              leftIcon={<Phone size={18} className="text-gray-500" />}
            />

            <Input
              label="Adresse"
              value={generalSettings.address}
              onChange={e => setGeneralSettings({ ...generalSettings, address: e.target.value })}
              leftIcon={<MapPin size={18} className="text-gray-500" />}
            />
          </div>
        </div>

        {/* Préférences */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Préférences</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thème</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    theme === 'light'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Sun size={24} className="mb-2" />
                  <span className="text-sm font-medium">Clair</span>
                </button>

                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Moon size={24} className="mb-2" />
                  <span className="text-sm font-medium">Sombre</span>
                </button>

                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-lg transition-all ${
                    theme === 'system'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <Monitor size={24} className="mb-2" />
                  <span className="text-sm font-medium">Automatique</span>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {theme === 'system'
                  ? 'Le thème s\'adapte automatiquement aux préférences de votre système'
                  : `Thème ${theme === 'light' ? 'clair' : 'sombre'} appliqué`}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="fr">Français</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fuseau horaire</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="Europe/Paris">Europe/Paris (GMT+1)</option>
                <option value="Europe/London">Europe/London (GMT+0)</option>
                <option value="America/New_York">America/New York (GMT-5)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configuration des notifications */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell size={20} className="text-gray-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Notifications par email</p>
                  <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
                </div>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={notificationSettings.emailNotifications}
                  onChange={e =>
                    setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: e.target.checked,
                    })
                  }
                  id="email-notifications"
                />
                <label
                  htmlFor="email-notifications"
                  className={`absolute cursor-pointer inset-0 rounded-full transition ${
                    notificationSettings.emailNotifications ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform transform bg-white ${
                      notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell size={20} className="text-gray-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Notifications SMS</p>
                  <p className="text-sm text-gray-500">Recevoir les notifications par SMS</p>
                </div>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={notificationSettings.smsNotifications}
                  onChange={e =>
                    setNotificationSettings({
                      ...notificationSettings,
                      smsNotifications: e.target.checked,
                    })
                  }
                  id="sms-notifications"
                />
                <label
                  htmlFor="sms-notifications"
                  className={`absolute cursor-pointer inset-0 rounded-full transition ${
                    notificationSettings.smsNotifications ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform transform bg-white ${
                      notificationSettings.smsNotifications ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </label>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bell size={20} className="text-gray-500 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Rappels de documents</p>
                  <p className="text-sm text-gray-500">
                    Notifications pour les documents expirants
                  </p>
                </div>
              </div>
              <div className="relative inline-block w-12 h-6">
                <input
                  type="checkbox"
                  className="hidden"
                  checked={notificationSettings.documentReminders}
                  onChange={e =>
                    setNotificationSettings({
                      ...notificationSettings,
                      documentReminders: e.target.checked,
                    })
                  }
                  id="document-reminders"
                />
                <label
                  htmlFor="document-reminders"
                  className={`absolute cursor-pointer inset-0 rounded-full transition ${
                    notificationSettings.documentReminders ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`absolute left-1 top-1 w-4 h-4 rounded-full transition-transform transform bg-white ${
                      notificationSettings.documentReminders ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration SMTP */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Configuration SMTP</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Serveur SMTP"
              value={emailSettings.smtpHost}
              onChange={e => setEmailSettings({ ...emailSettings, smtpHost: e.target.value })}
            />

            <Input
              label="Port SMTP"
              value={emailSettings.smtpPort}
              onChange={e => setEmailSettings({ ...emailSettings, smtpPort: e.target.value })}
            />

            <Input
              label="Utilisateur SMTP"
              value={emailSettings.smtpUser}
              onChange={e => setEmailSettings({ ...emailSettings, smtpUser: e.target.value })}
            />

            <Input
              label="Mot de passe SMTP"
              type="password"
              value={emailSettings.smtpPassword}
              onChange={e => setEmailSettings({ ...emailSettings, smtpPassword: e.target.value })}
            />
          </div>

          <div className="mt-4">
            <Button variant="outline">Tester la configuration</Button>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline">Annuler les modifications</Button>
          <Button variant="primary">Enregistrer les paramètres</Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
