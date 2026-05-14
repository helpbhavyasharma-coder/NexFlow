import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [form, setForm] = useState({ email: 'bhavya@nexflow.dev', password: 'password123' });
  async function submit(event) { event.preventDefault(); await login(form); navigate('/'); }
  return <AuthShell title="Login to NexFlow" subtitle="Coordinate team work in realtime."><form onSubmit={submit} className="space-y-4"><Input placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><Input type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /><Button className="w-full">Login</Button><p className="text-center text-sm">No account? <Link className="text-cyan-400" to="/register">Register</Link></p></form></AuthShell>;
}

function AuthShell({ title, subtitle, children }) {
  return <div className="grid min-h-screen place-items-center bg-[radial-gradient(circle,#22d3ee33,transparent_35%)] p-4"><motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="glass w-full max-w-md rounded-[2rem] p-8"><h1 className="text-3xl font-black">{title}</h1><p className="mb-8 mt-2 text-slate-500 dark:text-slate-300">{subtitle}</p>{children}</motion.div></div>;
}
