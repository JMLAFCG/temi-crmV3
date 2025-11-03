import React from 'react';
import { ValidationQueue } from '../../components/import/ValidationQueue';
import { useAuthStore } from '../../store/authStore';

const ValidationPage: React.FC = () => {
  const { user } = useAuthStore();

  const canValidate = user?.role && ['admin', 'manager'].includes(user.role);

  if (!canValidate) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <p className="text-lg text-gray-600">
            Seuls les managers et administrateurs peuvent valider les imports
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ValidationQueue />
    </div>
  );
};

export default ValidationPage;
