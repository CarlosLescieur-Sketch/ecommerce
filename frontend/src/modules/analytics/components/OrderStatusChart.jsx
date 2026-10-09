import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORES = {
  pendiente: '#b8720a',
  pagado: '#2f6f5e',
  enviado: '#3d6b8f',
  cancelado: '#9a3b3b',
};

const NOMBRES = { pendiente: 'Pendiente', pagado: 'Pagado', enviado: 'Enviado', cancelado: 'Cancelado' };

export default function OrderStatusChart({ distribucion, totalPedidos }) {
  const datos = distribucion
    .filter((d) => d.cantidad > 0)
    .map((d) => ({ ...d, nombre: NOMBRES[d.estado] }));

  return (
    <div className="card chart-card">
      <div className="chart-card__header">
        <h3>Estado de los pedidos</h3>
        <span className="metric__label">{totalPedidos} en total</span>
      </div>

      {datos.length === 0 ? (
        <p className="estado-vacio">No hay pedidos en este rango.</p>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie data={datos} dataKey="cantidad" nameKey="nombre" innerRadius={55} outerRadius={90} paddingAngle={2}>
                {datos.map((d) => <Cell key={d.estado} fill={COLORES[d.estado]} />)}
              </Pie>
              <Tooltip formatter={(v, n, item) => [`${v} (${item.payload.porcentaje}%)`, n]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <ul className="estado-lista">
            {distribucion.map((d) => (
              <li key={d.estado}>
                <span className="estado-lista__punto" style={{ background: COLORES[d.estado] }} />
                <span>{NOMBRES[d.estado]}</span>
                <span className="estado-lista__valor">{d.cantidad} · {d.porcentaje}%</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
