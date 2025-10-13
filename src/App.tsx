import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from './router';
import ErrorBoundary from './ui/ErrorBoundary';
import { useAuthStore } from './store/authStore';

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
}

export default App;
