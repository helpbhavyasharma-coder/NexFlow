import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore.js';

export function ProtectedRoute({ children }) {
  const token = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const sessionReady = useAuthStore((state) => state.sessionReady);
  if (!sessionReady) return <div className="grid h-screen place-items-center bg-slate-950 text-white">Loading NexFlow...</div>;
  return token || refreshToken ? children : <Navigate to="/login" replace />;
}
