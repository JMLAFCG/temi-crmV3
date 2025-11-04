import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Globe, Phone, MapPin, FileText, Bell, Save } from 'lucide-react';
import { useAppSettings } from '../../store/appSettingsStore';
const SettingsPage: React.FC = () => {
  const { settings, loading, updateSettings } = useAppSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [generalSettings, setGeneralSettings] = useState({
    companyName: settings.companyName,
    website: settings.website,
    email: settings.email,
    phone: settings.phone,
    address: settings.address,
  });

  useEffect(() => {
    setGeneralSettings({
      companyName: settings.companyName,
      website: settings.website,
      email: settings.email,
      phone: settings.phone,
      address: settings.address,
    });
  }, [settings]);

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

        {saveMessage && (
          <div className={`p-4 rounded-lg ${
            saveMessage.includes('succès') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}>
            {saveMessage}
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            variant="outline"
            onClick={() => {
              setGeneralSettings({
                companyName: settings.companyName,
                website: settings.website,
                email: settings.email,
                phone: settings.phone,
                address: settings.address,
              });
              setSaveMessage('');
            }}
          >
            Annuler les modifications
          </Button>
          <Button
            variant="primary"
            onClick={async () => {
              setIsSaving(true);
              setSaveMessage('');
              try {
                await updateSettings(generalSettings);
                setSaveMessage('✓ Paramètres enregistrés avec succès');
                setTimeout(() => setSaveMessage(''), 3000);
              } catch (error) {
                console.error('Error saving settings:', error);
                setSaveMessage('✗ Erreur lors de l\'enregistrement');
              } finally {
                setIsSaving(false);
              }
            }}
            disabled={isSaving || loading}
          >
            {isSaving ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Enregistrement...
              </span>
            ) : (
              <span className="flex items-center">
                <Save size={16} className="mr-2" />
                Enregistrer les paramètres
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
