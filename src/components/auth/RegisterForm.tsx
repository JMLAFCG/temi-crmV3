import React, { useState } from 'react';
import type { FC } from 'react';
import { Mail, Lock, User } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuthStore } from '../../store/authStore';

export const RegisterForm: FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const { register, isLoading, error } = useAuthStore();

  const validateForm = () => {
    const newErrors: { email?: string; password?: string; confirmPassword?: string } = {};

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Veuillez confirmer votre mot de passe';
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      await register(email, password);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Créer un compte</h2>
        <p className="mt-2 text-sm text-gray-600">Rejoignez la plateforme TEMI-Construction</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Prénom"
            type="text"
            placeholder="Jean"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            fullWidth
            leftIcon={<User size={18} className="text-gray-500" />}
          />

          <Input
            label="Nom"
            type="text"
            placeholder="Dupont"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            fullWidth
            leftIcon={<User size={18} className="text-gray-500" />}
          />
        </div>

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

        <Input
          label="Confirmer le mot de passe"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          error={errors.confirmPassword}
          fullWidth
          leftIcon={<Lock size={18} className="text-gray-500" />}
        />

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            J'accepte les{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              conditions d'utilisation
            </a>{' '}
            et la{' '}
            <a href="#" className="text-primary-600 hover:text-primary-500">
              politique de confidentialité
            </a>
          </label>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}


        <Button type="submit" variant="primary" isLoading={isLoading} fullWidth>
          Créer mon compte
        </Button>
      </form>
    </div>
  );
};
