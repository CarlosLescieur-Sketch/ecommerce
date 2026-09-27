const Pedido = require('../../domain/entities/Pedido');

/**
 * Orquesta la creación de pedidos: valida stock (regla de dominio de Producto),
 * congela precios unitarios y delega el cálculo de total a la entidad Pedido.
 * Depende de productoRepository y pedidoRepository, ambos inyectados.
 */
class PedidoUseCases {
  constructor({ pedidoRepository, productoRepository }) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
  }

  async crear({ usuarioId, items }) {
    // items entrante: [{ productoId, cantidad }]
    const itemsConPrecio = [];

    for (const item of items) {
      const producto = await this.productoRepository.buscarPorId(item.productoId);
      if (!producto) {
        throw new Error(`Producto ${item.productoId} no encontrado`);
      }
      if (!producto.tieneStockPara(item.cantidad)) {
        throw new Error(`Stock insuficiente para "${producto.nombre}"`);
      }
      itemsConPrecio.push({
        productoId: producto.id,
        cantidad: item.cantidad,
        precioUnitario: producto.precio,
      });
    }

    const pedido = new Pedido({ usuarioId, items: itemsConPrecio });
    pedido.calcularTotal();

    // Descontar stock de cada producto (transacción real delegada al adaptador de BD).
    for (const item of itemsConPrecio) {
      const producto = await this.productoRepository.buscarPorId(item.productoId);
      producto.descontarStock(item.cantidad);
      await this.productoRepository.actualizarStock(producto.id, producto.stock);
    }

    return this.pedidoRepository.crear(pedido);
  }

  async obtenerPorId(id) {
    const pedido = await this.pedidoRepository.buscarPorId(id);
    if (!pedido) throw new Error('Pedido no encontrado');
    return pedido;
  }

  async listarPorUsuario(usuarioId) {
    return this.pedidoRepository.listarPorUsuario(usuarioId);
  }

  async listar() {
    return this.pedidoRepository.listar();
  }

  async actualizarEstado(id, estado) {
    return this.pedidoRepository.actualizarEstado(id, estado);
  }

  async eliminar(id) {
    return this.pedidoRepository.eliminar(id);
  }
}

module.exports = PedidoUseCases;
