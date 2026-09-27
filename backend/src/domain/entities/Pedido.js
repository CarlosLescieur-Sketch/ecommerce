/**
 * Entidad de dominio: Pedido
 * items: [{ productoId, cantidad, precioUnitario }]
 */
const ESTADOS_VALIDOS = ['pendiente', 'pagado', 'enviado', 'cancelado'];

class Pedido {
  constructor({ id = null, usuarioId, items = [], estado = 'pendiente', total = 0 }) {
    if (!usuarioId) {
      throw new Error('El pedido requiere un usuarioId');
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('El pedido debe contener al menos un item');
    }
    if (!ESTADOS_VALIDOS.includes(estado)) {
      throw new Error('Estado de pedido inválido');
    }

    items.forEach((item) => {
      if (!item.productoId || !item.cantidad || item.cantidad <= 0) {
        throw new Error('Cada item requiere productoId y cantidad > 0');
      }
    });

    this.id = id;
    this.usuarioId = usuarioId;
    this.items = items;
    this.estado = estado;
    this.total = total;
  }

  // Regla de negocio: calcula el total a partir de cantidad * precioUnitario.
  calcularTotal() {
    this.total = this.items.reduce(
      (acumulado, item) => acumulado + item.cantidad * item.precioUnitario,
      0
    );
    return this.total;
  }

  cambiarEstado(nuevoEstado) {
    if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
      throw new Error('Estado de pedido inválido');
    }
    this.estado = nuevoEstado;
  }

  toJSON() {
    return {
      id: this.id,
      usuarioId: this.usuarioId,
      items: this.items,
      estado: this.estado,
      total: this.total,
    };
  }
}

module.exports = Pedido;
