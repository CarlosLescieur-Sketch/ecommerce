const Pedido = require('../../domain/entities/Pedido');

/**
 * Orquesta la creación de pedidos: valida stock (regla de dominio de Producto),
 * congela precios unitarios y delega el cálculo de total a la entidad Pedido.
 * Depende de productoRepository, pedidoRepository y notificacionPedido
 * (servicio de aplicación con sus propios puertos), todos inyectados.
 */
class PedidoUseCases {
  constructor({ pedidoRepository, productoRepository, notificacionPedido }) {
    this.pedidoRepository = pedidoRepository;
    this.productoRepository = productoRepository;
    this.notificacionPedido = notificacionPedido;
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

    const pedidoCreado = await this.pedidoRepository.crear(pedido);

    // Dispara las notificaciones (correo al cliente con desglose y
    // datos bancarios + aviso a los administradores). El servicio
    // garantiza que nunca lanza: un fallo de correo no pierde el pedido.
    await this.notificacionPedido.notificarPedidoCreado(pedidoCreado);

    return pedidoCreado;
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
    const pedido = await this.pedidoRepository.buscarPorId(id);
    if (!pedido) {
      throw new Error('Pedido no encontrado');
    }

    // La regla de transición (qué estados son alcanzables desde cuál)
    // vive en el dominio; aquí solo se orquesta.
    pedido.cambiarEstado(estado);

    // Cancelar un pedido devuelve al catálogo el stock que se
    // reservó al crearlo.
    if (estado === 'cancelado') {
      for (const item of pedido.items) {
        const producto = await this.productoRepository.buscarPorId(item.productoId);
        if (producto) {
          producto.reponerStock(item.cantidad);
          await this.productoRepository.actualizarStock(producto.id, producto.stock);
        }
      }
    }

    return this.pedidoRepository.actualizarEstado(id, estado);
  }

  async eliminar(id) {
    return this.pedidoRepository.eliminar(id);
  }
}

module.exports = PedidoUseCases;
