import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../../components/ui/Logo';
import SafeLink from '../../components/common/SafeLink';

function LoginPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="text-center">
            <Logo size="xl" variant="full" />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-gray-600">Bienvenue sur TEMI-Construction</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <LoginForm />

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Pas encore de compte ?</span>
              </div>
            </div>

            <div className="mt-6">
              <SafeLink route="register">
                <div className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                  Créer un compte
                </div>
              </SafeLink>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default LoginPage;
