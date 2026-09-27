/**
 * Entidad de dominio: Producto
 */
class Producto {
  constructor({ id = null, nombre, descripcion = '', precio, stock = 0, imagenUrl = null }) {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre del producto es obligatorio');
    }
    if (typeof precio !== 'number' || precio < 0) {
      throw new Error('El precio debe ser un número mayor o igual a 0');
    }
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error('El stock debe ser un entero mayor o igual a 0');
    }

    this.id = id;
    this.nombre = nombre.trim();
    this.descripcion = descripcion;
    this.precio = precio;
    this.stock = stock;
    this.imagenUrl = imagenUrl;
  }

  // Regla de negocio: verifica si hay stock suficiente para una cantidad pedida.
  tieneStockPara(cantidad) {
    return this.stock >= cantidad;
  }

  // Regla de negocio: descuenta stock; lanza error si no alcanza.
  descontarStock(cantidad) {
    if (!this.tieneStockPara(cantidad)) {
      throw new Error(`Stock insuficiente para el producto "${this.nombre}"`);
    }
    this.stock -= cantidad;
  }

  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      descripcion: this.descripcion,
      precio: this.precio,
      stock: this.stock,
      imagenUrl: this.imagenUrl,
    };
  }
}

module.exports = Producto;
