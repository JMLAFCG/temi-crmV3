import { useEffect, useState } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import ErrorBoundary from './ui/ErrorBoundary';
import { useAuthStore } from './store/authStore';

function App() {
  const [authChecked, setAuthChecked] = useState(false);
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    const initAuth = async () => {
      await checkAuth();
      setAuthChecked(true);
    };
    initAuth();
  }, [checkAuth]);

  if (!authChecked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
