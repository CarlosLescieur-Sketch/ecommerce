import { useEffect, useState } from 'react';
import { orderService } from '../services/orderService';

// Transiciones permitidas (coinciden con la regla de dominio del backend):
// pendiente → pagado → enviado; cancelar es válido hasta antes de enviar.
const SIGUIENTE_ESTADO = {
  pendiente: 'pagado',
  pagado: 'enviado',
};

const ETIQUETA_SIGUIENTE = {
  pagado: 'Marcar pagado',
  enviado: 'Marcar enviado',
};

export default function OrderList({ usuarioId, refreshKey, verTodos, esAdmin, onCambio }) {
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState('');
  const [procesandoId, setProcesandoId] = useState(null);

  useEffect(() => {
    if (verTodos) {
      orderService.listarTodos().then(setPedidos);
    } else if (usuarioId) {
      orderService.listarPorUsuario(usuarioId).then(setPedidos);
    }
  }, [usuarioId, refreshKey, verTodos]);

  const procesar = async (pedido, nuevoEstado) => {
    setError('');
    setProcesandoId(pedido.id);
    try {
      await orderService.actualizarEstado(pedido.id, nuevoEstado);
      onCambio?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar el pedido');
    } finally {
      setProcesandoId(null);
    }
  };

  const cancelar = (pedido) => {
    if (window.confirm(`¿Cancelar el pedido #${pedido.id}?`)) {
      procesar(pedido, 'cancelado');
    }
  };

  const renderizarAcciones = (p) => {
    const ocupado = procesandoId === p.id;
    const acciones = [];

    // Administrador: avanza el pedido al siguiente estado.
    if (esAdmin && SIGUIENTE_ESTADO[p.estado]) {
      const siguiente = SIGUIENTE_ESTADO[p.estado];
      acciones.push(
        <button
          key={siguiente}
          type="button"
          className="btn btn--primary btn--small"
          disabled={ocupado}
          onClick={() => procesar(p, siguiente)}
        >
          {ETIQUETA_SIGUIENTE[siguiente]}
        </button>
      );
    }

    // Dueño (o administrador): puede cancelar mientras el pedido
    // no esté enviado ni cancelado.
    const puedeCancelar = !!SIGUIENTE_ESTADO[p.estado] && (esAdmin || p.usuarioId === usuarioId);
    if (puedeCancelar) {
      acciones.push(
        <button
          key="cancelar"
          type="button"
          className="btn btn--secondary btn--small"
          disabled={ocupado}
          onClick={() => cancelar(p)}
        >
          Cancelar
        </button>
      );
    }

    return acciones;
  };

  return (
    <div>
      <h2 className="section-title">{verTodos ? 'Todos los pedidos' : 'Mis pedidos'}</h2>
      {error && <p className="form__error">{error}</p>}
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
              {renderizarAcciones(p)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
