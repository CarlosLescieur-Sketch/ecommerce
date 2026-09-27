const Producto = require('../../domain/entities/Producto');

class ProductoUseCases {
  constructor({ productoRepository }) {
    this.productoRepository = productoRepository;
  }

  async crear({ nombre, descripcion, precio, stock, imagenUrl }) {
    const producto = new Producto({ nombre, descripcion, precio, stock, imagenUrl });
    return this.productoRepository.crear(producto);
  }

  async obtenerPorId(id) {
    const producto = await this.productoRepository.buscarPorId(id);
    if (!producto) throw new Error('Producto no encontrado');
    return producto;
  }

  async listar() {
    return this.productoRepository.listar();
  }

  async actualizar(id, cambios) {
    return this.productoRepository.actualizar(id, cambios);
  }

  async eliminar(id) {
    return this.productoRepository.eliminar(id);
  }
}

module.exports = ProductoUseCases;
