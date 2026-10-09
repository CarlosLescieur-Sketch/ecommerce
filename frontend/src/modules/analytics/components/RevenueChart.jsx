import { useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';
import { dinero, etiquetaPeriodo } from '../utils/formato';

export default function RevenueChart({ serie, agrupacion }) {
  const [tipo, setTipo] = useState('barras');
  const datos = serie.map((f) => ({
    etiqueta: etiquetaPeriodo(f.periodo, agrupacion),
    ingresos: f.ingresos,
    pedidos: f.pedidos,
  }));

  const ejes = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="#d8ded2" />
      <XAxis dataKey="etiqueta" tick={{ fontSize: 12 }} />
      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v}`} />
      <Tooltip formatter={(v, nombre) => (nombre === 'ingresos' ? [dinero(v), 'Ingresos'] : [v, 'Pedidos'])} />
    </>
  );

  return (
    <div className="card chart-card">
      <div className="chart-card__header">
        <h3>Tendencia de ingresos</h3>
        <div className="filters__chips">
          {['barras', 'líneas'].map((t) => (
            <button
              key={t}
              type="button"
              className={`chip ${tipo === t ? 'chip--activo' : ''}`}
              onClick={() => setTipo(t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {datos.length === 0 ? (
        <p className="estado-vacio">No hay ventas en este rango.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          {tipo === 'barras' ? (
            <BarChart data={datos}>
              {ejes}
              <Bar dataKey="ingresos" fill="#2f6f5e" radius={[6, 6, 0, 0]} />
            </BarChart>
          ) : (
            <LineChart data={datos}>
              {ejes}
              <Line type="monotone" dataKey="ingresos" stroke="#2f6f5e" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
}
