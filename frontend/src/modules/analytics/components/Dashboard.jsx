import { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';
import { calcularRango } from '../utils/formato';
import DateRangeFilter from './DateRangeFilter';
import MetricCards from './MetricCards';
import RevenueChart from './RevenueChart';
import OrderStatusChart from './OrderStatusChart';
import TopProductsTable from './TopProductsTable';

export default function Dashboard({ usuarioId }) {
  const [rango, setRango] = useState(calcularRango('30d'));
  const [agrupacion, setAgrupacion] = useState('day');
  const [limite, setLimite] = useState(5);
  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rango) return;
    let vigente = true;
    setCargando(true);
    setError('');

    Promise.all([
      analyticsService.ticketPromedio(usuarioId, rango),
      analyticsService.ingresos(usuarioId, { ...rango, agrupacion }),
      analyticsService.estados(usuarioId, rango),
      analyticsService.topProductos(usuarioId, { ...rango, limite }),
    ])
      .then(([resumen, ingresos, estados, top]) => {
        if (vigente) setDatos({ resumen, ingresos, estados, top });
      })
      .catch((err) => {
        if (vigente) setError(err.response?.data?.error || 'No se pudieron cargar las métricas');
      })
      .finally(() => vigente && setCargando(false));

    return () => { vigente = false; };
  }, [usuarioId, rango, agrupacion, limite]);

  return (
    <div className="dashboard">
      <h2 className="section-title">Panel de control</h2>

      <DateRangeFilter
        rango={rango}
        agrupacion={agrupacion}
        onRango={setRango}
        onAgrupacion={setAgrupacion}
      />

      {error && <p className="form__error">{error}</p>}
      {cargando && !datos && <p className="estado-vacio">Cargando métricas...</p>}

      {datos && (
        <div className={cargando ? 'dashboard__contenido dashboard__contenido--cargando' : 'dashboard__contenido'}>
          <MetricCards resumen={datos.resumen} />
          <RevenueChart serie={datos.ingresos.serie} agrupacion={datos.ingresos.agrupacion} />
          <div className="dashboard__fila">
            <OrderStatusChart
              distribucion={datos.estados.distribucion}
              totalPedidos={datos.estados.totalPedidos}
            />
            <TopProductsTable productos={datos.top} limite={limite} onLimite={setLimite} />
          </div>
        </div>
      )}
    </div>
  );
}
