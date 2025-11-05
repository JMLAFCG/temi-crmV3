import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Mail, Phone, User, FileText, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useRegistrationRequestStore } from '../../store/registrationRequestStore';

const JoinNetworkPage: React.FC = () => {
  const navigate = useNavigate();
  const { createRequest, loading } = useRegistrationRequestStore();
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    company_name: '',
    siret: '',
    requested_role: 'mandataire' as 'mandataire' | 'apporteur' | 'partner_company',
    motivation: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const roleOptions = [
    {
      value: 'mandataire',
      label: 'Mandataire',
      description: 'Je souhaite devenir mandataire et prospecter pour le réseau',
    },
    {
      value: 'apporteur',
      label: "Apporteur d'affaires",
      description: "J'apporte des opportunités commerciales",
    },
    {
      value: 'partner_company',
      label: 'Entreprise partenaire',
      description: 'Mon entreprise souhaite rejoindre le réseau',
    },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email valide requis';
    }
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Prénom requis';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nom requis';
    }
    if (formData.requested_role === 'partner_company' && !formData.company_name.trim()) {
      newErrors.company_name = 'Nom de l\'entreprise requis pour les entreprises partenaires';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      await createRequest(formData);
      setSubmitted(true);
    } catch (err) {
      alert('Erreur lors de l\'envoi de votre demande. Veuillez réessayer.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
          <p className="text-gray-600 mb-6">
            Votre demande pour rejoindre notre réseau a été transmise avec succès. Notre équipe va l'examiner et vous
            contactera dans les plus brefs délais.
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Vous recevrez un email de confirmation à <strong>{formData.email}</strong>
          </p>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Retour à la connexion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rejoignez notre réseau</h1>
          <p className="text-gray-600">
            Remplissez ce formulaire pour demander à rejoindre notre réseau professionnel
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Type de profil</h3>
            <div className="space-y-3">
              {roleOptions.map(option => (
                <label
                  key={option.value}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.requested_role === option.value
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="requested_role"
                    value={option.value}
                    checked={formData.requested_role === option.value}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        requested_role: e.target.value as 'mandataire' | 'apporteur' | 'partner_company',
                      })
                    }
                    className="sr-only"
                  />
                  <div className="flex items-start">
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded-full border-2 mr-3 mt-0.5 flex items-center justify-center ${
                        formData.requested_role === option.value
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}
                    >
                      {formData.requested_role === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom <span className="text-red-500">*</span>
              </label>
              <Input
                leftIcon={<User size={16} />}
                value={formData.first_name}
                onChange={e => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Jean"
                error={errors.first_name}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom <span className="text-red-500">*</span>
              </label>
              <Input
                leftIcon={<User size={16} />}
                value={formData.last_name}
                onChange={e => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Dupont"
                error={errors.last_name}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              type="email"
              leftIcon={<Mail size={16} />}
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="jean.dupont@example.com"
              error={errors.email}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <Input
              type="tel"
              leftIcon={<Phone size={16} />}
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="06 12 34 56 78"
            />
          </div>

          {formData.requested_role === 'partner_company' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l'entreprise <span className="text-red-500">*</span>
                </label>
                <Input
                  leftIcon={<Building size={16} />}
                  value={formData.company_name}
                  onChange={e => setFormData({ ...formData, company_name: e.target.value })}
                  placeholder="Ma Société SARL"
                  error={errors.company_name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
                <Input
                  leftIcon={<FileText size={16} />}
                  value={formData.siret}
                  onChange={e => setFormData({ ...formData, siret: e.target.value })}
                  placeholder="123 456 789 00012"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message de motivation
            </label>
            <textarea
              value={formData.motivation}
              onChange={e => setFormData({ ...formData, motivation: e.target.value })}
              placeholder="Expliquez pourquoi vous souhaitez rejoindre notre réseau..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
          </div>

          <div className="flex gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/login')} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-1">
              {loading ? 'Envoi en cours...' : 'Envoyer ma demande'}
            </Button>
          </div>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          En soumettant ce formulaire, vous acceptez que vos données soient traitées pour l'examen de votre candidature.
        </p>
      </div>
    </div>
  );
};

export default JoinNetworkPage;
