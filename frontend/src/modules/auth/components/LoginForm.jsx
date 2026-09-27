import { useState } from 'react';
import { authService } from '../services/authService';

export default function LoginForm({ onLoginExitoso }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const usuario = await authService.login(form);
      onLoginExitoso(usuario);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2 className="form__title">Iniciar sesión</h2>
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" placeholder="tucorreo@ejemplo.com" value={form.email} onChange={handleChange} required />
      </label>
      <label className="field">
        <span>Contraseña</span>
        <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handleChange} required />
      </label>
      {error && <p className="form__error">{error}</p>}
      <button type="submit" className="btn btn--primary">Entrar</button>
    </form>
  );
}
