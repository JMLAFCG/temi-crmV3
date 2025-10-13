import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../../components/ui/Logo';
import SafeLink from '../../components/common/SafeLink';
import { safeNavigate } from '../../lib/safeNavigate';

function RegisterPage() {
  const { user, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !isLoading) {
      safeNavigate(navigate, 'dashboard');
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-center">
            <Logo size="xl" variant="full" />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">Rejoignez TEMI-Construction</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <RegisterForm />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Déjà un compte ?</span>
              </div>
            </div>

            <div className="mt-6">
              <SafeLink route="login">
                <div className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  Se connecter
                </div>
              </SafeLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
