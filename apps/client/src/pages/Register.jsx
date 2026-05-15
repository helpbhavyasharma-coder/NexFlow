import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button.jsx';
import { Input } from '../components/ui/Input.jsx';
import { useAuthStore } from '../store/authStore.js';

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((state) => state.register);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  async function submit(event) { event.preventDefault(); await register(form); navigate('/'); }
  return <div className="grid min-h-screen place-items-center p-4"><form onSubmit={submit} autoComplete="off" className="glass w-full max-w-md space-y-4 rounded-[2rem] p-8"><h1 className="text-3xl font-black">Create account</h1><Input placeholder="Username" autoComplete="off" name="nexflow-register-name" onChange={(event) => setForm({ ...form, username: event.target.value })} /><Input placeholder="Email" autoComplete="off" name="nexflow-register-email" onChange={(event) => setForm({ ...form, email: event.target.value })} /><Input type="password" placeholder="Password" autoComplete="new-password" name="nexflow-register-password" onChange={(event) => setForm({ ...form, password: event.target.value })} /><Button className="w-full">Register</Button><p className="text-center text-sm">Already registered? <Link className="text-cyan-400" to="/login">Login</Link></p></form></div>;
}
