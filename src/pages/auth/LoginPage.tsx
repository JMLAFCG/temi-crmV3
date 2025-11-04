import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../../components/ui/Logo';
import SafeLink from '../../components/common/SafeLink';
import { testSupabaseConnection, supabaseConfigState } from '../../lib/supabase';

function LoginPage() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const isPreview = window.location.hostname.includes('-git-') ||
                    (window.location.hostname.includes('vercel.app') &&
                     !window.location.hostname.startsWith('temi-crm'));

  const showPreviewWarning = isPreview && !supabaseConfigState.isValid;
  const isDev = import.meta.env.DEV || import.meta.env.MODE !== 'production';

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testSupabaseConnection();
    setTestResult(result.success ? `✅ ${result.message}` : `❌ ${result.message}`);
    setTesting(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {showPreviewWarning && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 px-4 py-3 z-50">
          <div className="max-w-4xl mx-auto">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ ENV Preview incomplet :</strong> Définis VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans Vercel (Production & Preview).
            </p>
          </div>
        </div>
      )}

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
          {!supabaseConfigState.isValid && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">
                Configuration Supabase invalide. Vérifiez vos variables d'environnement.
              </p>
            </div>
          )}

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

          {isDev && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleTestConnection}
                disabled={testing}
                className="w-full flex justify-center py-2 px-4 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                {testing ? 'Test en cours...' : 'Tester connexion Supabase'}
              </button>
              {testResult && (
                <p className="mt-2 text-sm text-center text-gray-700">
                  {testResult}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
