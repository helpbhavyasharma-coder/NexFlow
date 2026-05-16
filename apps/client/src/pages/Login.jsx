import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthExperience } from '../components/auth/AuthExperience.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: '', password: '' });
  async function submit(event) { event.preventDefault(); await login(form); navigate('/'); }
  return (
    <AuthExperience mode="login" title="Welcome back" subtitle="Login to monitor your tasks, chat with your team and keep the work moving.">
      <form onSubmit={submit} className="space-y-4" autoComplete="off">
        <Input placeholder="Email" value={form.email} autoComplete="off" name="nexflow-login-email" onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <Input type="password" placeholder="Password" value={form.password} autoComplete="new-password" name="nexflow-login-password" onChange={(event) => setForm({ ...form, password: event.target.value })} />
        <Button className="w-full py-3 text-base">Login</Button>
      </form>
    </AuthExperience>
  );
}
