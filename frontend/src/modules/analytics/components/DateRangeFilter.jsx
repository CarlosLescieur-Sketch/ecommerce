import { useState } from 'react';
import { calcularRango } from '../utils/formato';

const PRESETS = [
  { id: '7d', label: 'Últimos 7 días' },
  { id: '30d', label: 'Últimos 30 días' },
  { id: 'mes', label: 'Este mes' },
  { id: 'custom', label: 'Rango personalizado' },
];

export default function DateRangeFilter({ rango, agrupacion, onRango, onAgrupacion }) {
  const [preset, setPreset] = useState('30d');
  const [custom, setCustom] = useState({ desde: '', hasta: '' });
  const [error, setError] = useState('');

  const elegirPreset = (id) => {
    setPreset(id);
    setError('');
    if (id !== 'custom') onRango(calcularRango(id));
  };

  const cambiarCustom = (campo, valor) => {
    const nuevo = { ...custom, [campo]: valor };
    setCustom(nuevo);
    if (nuevo.desde && nuevo.hasta) {
      if (nuevo.desde > nuevo.hasta) {
        setError('La fecha inicial no puede ser posterior a la final');
        return;
      }
      setError('');
      onRango(nuevo);
    }
  };

  return (
    <div className="card filters">
      <div className="filters__chips">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            className={`chip ${preset === p.id ? 'chip--activo' : ''}`}
            onClick={() => elegirPreset(p.id)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {preset === 'custom' && (
        <div className="field-row filters__custom">
          <label className="field">
            <span>Desde</span>
            <input type="date" value={custom.desde} onChange={(e) => cambiarCustom('desde', e.target.value)} />
          </label>
          <label className="field">
            <span>Hasta</span>
            <input type="date" value={custom.hasta} onChange={(e) => cambiarCustom('hasta', e.target.value)} />
          </label>
        </div>
      )}

      <label className="field filters__agrupar">
        <span>Agrupar ingresos por</span>
        <select value={agrupacion} onChange={(e) => onAgrupacion(e.target.value)}>
          <option value="day">Día</option>
          <option value="week">Semana</option>
          <option value="month">Mes</option>
        </select>
      </label>

      {error && <p className="form__error">{error}</p>}
      {rango && !error && (
        <p className="filters__rango">Mostrando del {rango.desde} al {rango.hasta}</p>
      )}
    </div>
  );
}
