import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthExperience } from '../components/auth/AuthExperience.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  async function submit(event) { event.preventDefault(); await register(form); navigate('/'); }
  return (
    <AuthExperience mode="register" title="Create account" subtitle="Start your NexFlow workspace and invite your team into a realtime task system.">
      <form onSubmit={submit} autoComplete="off" className="space-y-4">
        <Input placeholder="Username" autoComplete="off" name="nexflow-register-name" onChange={(event) => setForm({ ...form, username: event.target.value })} />
        <Input placeholder="Email" autoComplete="off" name="nexflow-register-email" onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <Input type="password" placeholder="Password" autoComplete="new-password" name="nexflow-register-password" onChange={(event) => setForm({ ...form, password: event.target.value })} />
        <Button className="w-full py-3 text-base">Register</Button>
      </form>
    </AuthExperience>
  );
}
