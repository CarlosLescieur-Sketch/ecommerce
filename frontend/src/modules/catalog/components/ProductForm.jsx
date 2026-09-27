import { useState, useEffect } from 'react';
import { productService } from '../services/productService';

const FORM_VACIO = { nombre: '', descripcion: '', precio: '', stock: '' };

export default function ProductForm({ onCreado }) {
  const [form, setForm] = useState(FORM_VACIO);
  const [imagen, setImagen] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Libera la URL de previsualización al desmontar o al cambiar de imagen.
  useEffect(() => {
    if (!imagen) return undefined;
    const url = URL.createObjectURL(imagen);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imagen]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImagenChange = (e) => {
    const archivo = e.target.files?.[0] || null;
    setImagen(archivo);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const producto = await productService.crear({
        ...form,
        precio: parseFloat(form.precio),
        stock: parseInt(form.stock, 10),
        imagen: imagen || undefined,
      });
      onCreado(producto);
      setForm(FORM_VACIO);
      setImagen(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear producto');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit}>
      <h3 className="form__title">Nuevo producto</h3>

      <div className="form__grid">
        <div className="form__fields">
          <label className="field">
            <span>Nombre</span>
            <input name="nombre" placeholder="Nombre del producto" value={form.nombre} onChange={handleChange} required />
          </label>

          <label className="field">
            <span>Descripción</span>
            <textarea name="descripcion" placeholder="Descripción breve" value={form.descripcion} onChange={handleChange} rows={2} />
          </label>

          <div className="field-row">
            <label className="field">
              <span>Precio</span>
              <input name="precio" type="number" step="0.01" min="0" placeholder="0.00" value={form.precio} onChange={handleChange} required />
            </label>
            <label className="field">
              <span>Stock</span>
              <input name="stock" type="number" min="0" placeholder="0" value={form.stock} onChange={handleChange} required />
            </label>
          </div>

          <label className="field">
            <span>Imagen</span>
            <input type="file" accept="image/png, image/jpeg, image/webp, image/gif" onChange={handleImagenChange} />
          </label>
        </div>

        <div className="form__preview">
          {previewUrl ? (
            <img src={previewUrl} alt="Vista previa" className="preview-img" />
          ) : (
            <div className="preview-img preview-img--empty">Sin imagen</div>
          )}
        </div>
      </div>

      {error && <p className="form__error">{error}</p>}

      <button type="submit" className="btn btn--primary" disabled={enviando}>
        {enviando ? 'Guardando...' : 'Guardar producto'}
      </button>
    </form>
  );
}
