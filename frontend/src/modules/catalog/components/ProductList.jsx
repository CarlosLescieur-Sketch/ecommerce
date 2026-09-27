import { useEffect, useState } from 'react';
import { productService } from '../services/productService';
import { SERVER_URL } from '../../../shared/api/httpClient';

function urlImagen(imagenUrl) {
  if (!imagenUrl) return null;
  return `${SERVER_URL}${imagenUrl}`;
}

export default function ProductList({ refreshKey, esAdmin, onCambio }) {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    setCargando(true);
    productService.listar().then((data) => {
      setProductos(data);
      setCargando(false);
    });
  }, [refreshKey]);

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    await productService.eliminar(id);
    onCambio?.();
  };

  if (cargando) return <p className="estado-vacio">Cargando productos...</p>;
  if (productos.length === 0) return <p className="estado-vacio">Aún no hay productos en el catálogo.</p>;

  return (
    <div>
      <h2 className="section-title">Catálogo</h2>
      <div className="product-grid">
        {productos.map((p) => (
          <article key={p.id} className="card product-card">
            {urlImagen(p.imagenUrl) ? (
              <img src={urlImagen(p.imagenUrl)} alt={p.nombre} className="product-card__img" />
            ) : (
              <div className="product-card__img product-card__img--empty">Sin imagen</div>
            )}
            <div className="product-card__body">
              <h3 className="product-card__nombre">{p.nombre}</h3>
              {p.descripcion && <p className="product-card__desc">{p.descripcion}</p>}
              <div className="product-card__footer">
                <span className="product-card__precio">${p.precio.toFixed(2)}</span>
                <span className={`badge ${p.stock > 0 ? 'badge--ok' : 'badge--agotado'}`}>
                  {p.stock > 0 ? `Stock: ${p.stock}` : 'Agotado'}
                </span>
              </div>
              {esAdmin && (
                <button
                  type="button"
                  className="btn btn--secondary"
                  style={{ marginTop: 8 }}
                  onClick={() => handleEliminar(p.id)}
                >
                  Eliminar
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}