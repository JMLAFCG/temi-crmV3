import React, { useState } from 'react';
import type { FC } from 'react';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../store/authStore';

export const LoginForm: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const { login, isLoading, error } = useAuthStore();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      newErrors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetEmail) {
      return;
    }

    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      return;
    }

    setResetLoading(true);

    try {
      // Simuler l'envoi d'email de réinitialisation
      await new Promise(resolve => setTimeout(resolve, 2000));
      setResetSent(true);
    } catch (error) {
      console.error("Erreur lors de l'envoi de l'email de réinitialisation:", error);
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      await login(email, password);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Mot de passe oublié ?</h2>
          <p className="mt-2 text-sm text-gray-600">
            Saisissez votre adresse email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {resetSent ? (
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-green-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">Email envoyé !</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    Un lien de réinitialisation a été envoyé à <strong>{resetEmail}</strong>.
                    Vérifiez votre boîte de réception et vos spams.
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              label="Adresse email"
              type="email"
              placeholder="votre@email.com"
              value={resetEmail}
              onChange={e => setResetEmail(e.target.value)}
              fullWidth
              leftIcon={<Mail size={18} className="text-gray-500" />}
              required
            />

            <Button type="submit" variant="primary" isLoading={resetLoading} fullWidth>
              Envoyer le lien de réinitialisation
            </Button>
          </form>
        )}

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setShowForgotPassword(false);
              setResetSent(false);
              setResetEmail('');
            }}
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Connexion</h2>
        <p className="mt-2 text-sm text-gray-600">Accédez à votre espace TEMI-Construction</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Adresse email"
          type="email"
          placeholder="votre@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={errors.email}
          fullWidth
          leftIcon={<Mail size={18} className="text-gray-500" />}
        />

        <Input
          label="Mot de passe"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={errors.password}
          fullWidth
          leftIcon={<Lock size={18} className="text-gray-500" />}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Se souvenir de moi
            </label>
          </div>

          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-primary-600 hover:text-primary-500"
            data-testid="forgot-password-link"
          >
            Mot de passe oublié ?
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}


        <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
          Se connecter
        </Button>
      </form>
    </div>
  );
};
