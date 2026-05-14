import { lazy, useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { ProtectedRoute } from './routes/ProtectedRoute.jsx';
import { useAuthStore } from './store/authStore.js';
import { useThemeStore } from './store/themeStore.js';

const Dashboard = lazy(() => import('./pages/Dashboard.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));

export default function App() {
  const applyTheme = useThemeStore((state) => state.applyTheme);
  const hydrateSocket = useAuthStore((state) => state.hydrateSocket);
  useEffect(() => { applyTheme(); hydrateSocket(); }, []);
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
