import React, { useState } from 'react';
import { Globe, Mail, Bell, Lock, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  status: 'connected' | 'disconnected';
  lastSync?: string;
}
const IntegrationSettingsPage: React.FC = () => {
  const [integrations] = useState<Integration[]>([
    {
      id: 'email',
      name: 'Service de messagerie',
      description: "Configuration SMTP pour l'envoi des emails",
      icon: <Mail className="text-blue-500\" size={24} />,
      status: 'connected',
      lastSync: '2025-05-10T10:30:00',
    },
    {
      id: 'notification',
      name: 'Service de notifications',
      description: 'Configuration des notifications push',
      icon: <Bell className="text-purple-500" size={24} />,
      status: 'connected',
      lastSync: '2025-05-10T10:30:00',
    },
    {
      id: 'auth',
      name: "Service d'authentification",
      description: "Configuration de l'authentification",
      icon: <Lock className="text-green-500\" size={24} />,
      status: 'connected',
      lastSync: '2025-05-10T10:30:00',
    },
  ]);

  const [smtpConfig, setSmtpConfig] = useState({
    host: 'smtp.example.com',
    port: '587',
    username: 'notifications@example.com',
    password: '••••••••••••',
    fromEmail: 'no-reply@example.com',
    fromName: 'TEMI-Construction',
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="space-y-6">
        {/* Liste des intégrations */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Intégrations</h2>

          <div className="space-y-4">
            {integrations.map(integration => (
              <div
                key={integration.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">{integration.icon}</div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-900">{integration.name}</h3>
                    <p className="text-sm text-gray-500">{integration.description}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  {integration.status === 'connected' && (
                    <>
                      <span className="flex items-center text-sm text-gray-500">
                        <RefreshCw size={16} className="mr-1" />
                        {new Date(integration.lastSync!).toLocaleDateString()}
                      </span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Connecté
                      </span>
                    </>
                  )}
                  <Button
                    variant={integration.status === 'connected' ? 'outline' : 'primary'}
                    size="sm"
                  >
                    {integration.status === 'connected' ? 'Configurer' : 'Connecter'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration SMTP */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Configuration SMTP</h2>

          <form className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Input
                label="Serveur SMTP"
                value={smtpConfig.host}
                onChange={e => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
              />

              <Input
                label="Port SMTP"
                value={smtpConfig.port}
                onChange={e => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
              />

              <Input
                label="Nom d'utilisateur"
                value={smtpConfig.username}
                onChange={e => setSmtpConfig({ ...smtpConfig, username: e.target.value })}
              />

              <Input
                label="Mot de passe"
                type="password"
                value={smtpConfig.password}
                onChange={e => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
              />

              <Input
                label="Email d'envoi"
                value={smtpConfig.fromEmail}
                onChange={e => setSmtpConfig({ ...smtpConfig, fromEmail: e.target.value })}
              />

              <Input
                label="Nom d'affichage"
                value={smtpConfig.fromName}
                onChange={e => setSmtpConfig({ ...smtpConfig, fromName: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline">Tester la configuration</Button>
              <Button variant="primary">Enregistrer</Button>
            </div>
          </form>
        </div>

        {/* Webhooks */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Webhooks</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Globe className="text-gray-400" size={24} />
                <div className="ml-4">
                  <h3 className="text-sm font-medium text-gray-900">Webhook de notification</h3>
                  <p className="text-sm text-gray-500">
                    https://api.example.com/webhooks/notifications
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Actif
                </span>
                <Button variant="outline" size="sm">
                  Configurer
                </Button>
              </div>
            </div>

            <Button variant="outline" fullWidth>
              Ajouter un webhook
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettingsPage;
