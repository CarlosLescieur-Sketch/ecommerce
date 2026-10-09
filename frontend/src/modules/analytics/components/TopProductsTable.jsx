import { dinero } from '../utils/formato';

export default function TopProductsTable({ productos, limite, onLimite }) {
  return (
    <div className="card chart-card">
      <div className="chart-card__header">
        <h3>Productos con mayor rotación</h3>
        <label className="field filters__top">
          <span>Mostrar</span>
          <select value={limite} onChange={(e) => onLimite(Number(e.target.value))}>
            <option value={5}>Top 5</option>
            <option value={10}>Top 10</option>
          </select>
        </label>
      </div>

      {productos.length === 0 ? (
        <p className="estado-vacio">Sin ventas de productos en este rango.</p>
      ) : (
        <div className="tabla-scroll">
          <table className="tabla">
            <thead>
              <tr>
                <th>#</th>
                <th>Producto</th>
                <th className="num">Unidades</th>
                <th className="num">Monto recaudado</th>
              </tr>
            </thead>
            <tbody>
              {productos.map((p, i) => (
                <tr key={p.productoId}>
                  <td>{i + 1}</td>
                  <td>{p.nombre}</td>
                  <td className="num">{p.unidadesVendidas}</td>
                  <td className="num">{dinero(p.montoRecaudado)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
