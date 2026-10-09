import { dinero } from '../utils/formato';

export default function MetricCards({ resumen }) {
  const items = [
    { label: 'Ingresos totales', valor: dinero(resumen.ingresosTotales) },
    { label: 'Pedidos (sin cancelados)', valor: resumen.totalPedidos },
    { label: 'Ticket promedio por pedido', valor: dinero(resumen.ticketPromedioPedido) },
    { label: 'Ticket promedio por usuario', valor: dinero(resumen.ticketPromedioUsuario) },
  ];
  return (
    <div className="metric-grid">
      {items.map((m) => (
        <div key={m.label} className="card metric">
          <span className="metric__label">{m.label}</span>
          <span className="metric__valor">{m.valor}</span>
        </div>
      ))}
    </div>
  );
}
