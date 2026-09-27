import { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';

export default function OrderList({ usuarioId, refreshKey, verTodos }) {
  const [pedidos, setPedidos] = useState([]);

  useEffect(() => {
    if (verTodos) {
      orderService.listarTodos().then(setPedidos);
    } else if (usuarioId) {
      orderService.listarPorUsuario(usuarioId).then(setPedidos);
    }
  }, [usuarioId, refreshKey, verTodos]);

  return (
    <div>
      <h2 className="section-title">{verTodos ? 'Todos los pedidos' : 'Mis pedidos'}</h2>
      {pedidos.length === 0 ? (
        <p className="estado-vacio">
          {verTodos ? 'Aún no hay pedidos registrados.' : 'Todavía no tienes pedidos.'}
        </p>
      ) : (
        <ul className="order-list">
          {pedidos.map((p) => (
            <li key={p.id} className="card order-list__item">
              <span>Pedido #{p.id}{verTodos ? ` — Usuario #${p.usuarioId}` : ''}</span>
              <span className={`badge badge--estado-${p.estado}`}>{p.estado}</span>
              <span className="order-list__total">${p.total.toFixed(2)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}