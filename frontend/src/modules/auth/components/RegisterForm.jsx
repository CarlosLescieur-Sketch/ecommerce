import { useState } from 'react';
import { authService } from '../services/authService';

export default function RegisterForm({ onRegistroExitoso }) {
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const usuario = await authService.registrar(form);
      onRegistroExitoso(usuario);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrar usuario');
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2 className="form__title">Crear cuenta</h2>
      <label className="field">
        <span>Nombre</span>
        <input name="nombre" placeholder="Tu nombre" value={form.nombre} onChange={handleChange} required />
      </label>
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" placeholder="tucorreo@ejemplo.com" value={form.email} onChange={handleChange} required />
      </label>
      <label className="field">
        <span>Contraseña</span>
        <input name="password" type="password" placeholder="Mínimo 8 caracteres" value={form.password} onChange={handleChange} required />
      </label>
      {error && <p className="form__error">{error}</p>}
      <button type="submit" className="btn btn--secondary">Registrarme</button>
    </form>
  );
}
