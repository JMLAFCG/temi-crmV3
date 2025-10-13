import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Mail, Globe, Phone, MapPin, FileText, Bell } from 'lucide-react';
const SettingsPage: React.FC = () => {
  const [generalSettings, setGeneralSettings] = useState({
    companyName: 'TEMI-Construction',
    website: 'https://temi-construction.fr',
    email: 'contact@temi-construction.fr',
    phone: '01 23 45 67 89',
    address: '123 Rue de la Construction, 75001 Paris',
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
