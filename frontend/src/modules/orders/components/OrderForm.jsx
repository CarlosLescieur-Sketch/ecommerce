import { useEffect, useState } from 'react';
import { productService } from '../../catalog/services/productService';
import { orderService } from '../services/orderService';

export default function OrderForm({ usuarioId, onPedidoCreado }) {
  const [productos, setProductos] = useState([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState(1);
  const [carrito, setCarrito] = useState([]); // [{ productoId, nombre, cantidad, precio }]
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    productService.listar().then((data) => {
      setProductos(data);
      if (data.length > 0) setProductoId(String(data[0].id));
    });
  }, []);

  const productoSeleccionado = productos.find((p) => String(p.id) === productoId);

  const agregarAlCarrito = (e) => {
    e.preventDefault();
    setError('');
    if (!productoSeleccionado) return;

    const cantidadNum = parseInt(cantidad, 10);
    if (cantidadNum <= 0) {
      setError('La cantidad debe ser mayor a 0');
      return;
    }
    if (cantidadNum > productoSeleccionado.stock) {
      setError(`Solo hay ${productoSeleccionado.stock} unidades de "${productoSeleccionado.nombre}"`);
      return;
    }

    setCarrito((prev) => {
      const existente = prev.find((item) => item.productoId === productoSeleccionado.id);
      if (existente) {
        return prev.map((item) =>
          item.productoId === productoSeleccionado.id
            ? { ...item, cantidad: item.cantidad + cantidadNum }
            : item
        );
      }
      return [
        ...prev,
        {
          productoId: productoSeleccionado.id,
          nombre: productoSeleccionado.nombre,
          precio: productoSeleccionado.precio,
          cantidad: cantidadNum,
        },
      ];
    });
    setCantidad(1);
  };

  const quitarDelCarrito = (productoId) => {
    setCarrito((prev) => prev.filter((item) => item.productoId !== productoId));
  };

  const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const confirmarPedido = async () => {
    setError('');
    setEnviando(true);
    try {
      await orderService.crear({
        usuarioId,
        items: carrito.map((item) => ({ productoId: item.productoId, cantidad: item.cantidad })),
      });
      setCarrito([]);
      onPedidoCreado();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear el pedido');
    } finally {
      setEnviando(false);
    }
  };

  if (productos.length === 0) {
    return <p className="estado-vacio">Agrega productos al catálogo para poder armar un pedido.</p>;
  }

  return (
    <div className="card form">
      <h3 className="form__title">Nuevo pedido</h3>

      <form className="field-row" onSubmit={agregarAlCarrito} style={{ alignItems: 'flex-end' }}>
        <label className="field" style={{ flex: 2 }}>
          <span>Producto</span>
          <select value={productoId} onChange={(e) => setProductoId(e.target.value)}>
            {productos.map((p) => (
              <option key={p.id} value={p.id} disabled={p.stock === 0}>
                {p.nombre} — ${p.precio.toFixed(2)} {p.stock === 0 ? '(agotado)' : `(stock: ${p.stock})`}
              </option>
            ))}
          </select>
        </label>
        <label className="field" style={{ flex: 1 }}>
          <span>Cantidad</span>
          <input
            type="number"
            min="1"
            value={cantidad}
            onChange={(e) => setCantidad(e.target.value)}
          />
        </label>
        <button type="submit" className="btn btn--secondary">Agregar</button>
      </form>

      {carrito.length > 0 && (
        <ul className="order-list" style={{ marginTop: 8 }}>
          {carrito.map((item) => (
            <li key={item.productoId} className="card order-list__item">
              <span>{item.nombre} × {item.cantidad}</span>
              <span className="order-list__total">${(item.precio * item.cantidad).toFixed(2)}</span>
              <button
                type="button"
                className="btn btn--secondary"
                style={{ padding: '4px 12px' }}
                onClick={() => quitarDelCarrito(item.productoId)}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="form__error">{error}</p>}

      {carrito.length > 0 && (
        <div className="field-row" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <span className="product-card__precio">Total: ${total.toFixed(2)}</span>
          <button
            type="button"
            className="btn btn--primary"
            disabled={enviando}
            onClick={confirmarPedido}
          >
            {enviando ? 'Confirmando...' : 'Confirmar pedido'}
          </button>
        </div>
      )}
    </div>
  );
}
