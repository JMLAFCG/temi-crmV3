import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import ErrorBoundary from './ui/ErrorBoundary';
import { useAuthStore } from './store/authStore';
import { useAppSettings } from './store/appSettingsStore';

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);
  const loadSettings = useAppSettings(state => state.loadSettings);

  useEffect(() => {
    checkAuth();
    loadSettings();
  }, [checkAuth, loadSettings]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
