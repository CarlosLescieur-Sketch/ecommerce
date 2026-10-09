/**
 * Servicio de aplicación: prepara y envía las notificaciones que se
 * disparan al crear un pedido.
 *
 * - Al cliente: desglose de su compra + datos bancarios/instrucciones
 *   para completar el pago (el pedido queda "pendiente de pago").
 * - A los administradores: aviso de la llegada del nuevo pedido.
 *
 * Depende solo de abstracciones inyectadas por constructor:
 *   notificationSender  -> INotificationSender  (puerto de salida)
 *   usuarioRepository   -> IUsuarioRepository   (puerto de salida)
 *   productoRepository  -> IProductoRepository  (puerto de salida)
 *   datosBancarios      -> configuración simple (composition root)
 * Nada de Nodemailer ni proveedores de correo: eso vive en los
 * adaptadores de infraestructura.
 *
 * Garantía: notificarPedidoCreado() nunca lanza error; si un envío
 * falla se registra en consola y el pedido ya persistido no se pierde.
 */
class NotificacionPedidoService {
  constructor({ notificationSender, usuarioRepository, productoRepository, datosBancarios }) {
    this.notificationSender = notificationSender;
    this.usuarioRepository = usuarioRepository;
    this.productoRepository = productoRepository;
    this.datosBancarios = datosBancarios;
  }

  async notificarPedidoCreado(pedido) {
    try {
      const cliente = await this.usuarioRepository.buscarPorId(pedido.usuarioId);
      const administradores = await this.usuarioRepository.listarPorRol('administrador');
      const items = await this._resolverItems(pedido);

      const mensajes = [];
      if (cliente) {
        mensajes.push(this._mensajeCliente(pedido, cliente, items));
      }
      for (const admin of administradores) {
        mensajes.push(this._mensajeAdministrador(pedido, admin, cliente, items));
      }

      for (const mensaje of mensajes) {
        try {
          await this.notificationSender.enviar(mensaje);
          console.log(
            `[notificaciones] enviado a ${Array.isArray(mensaje.para) ? mensaje.para.join(', ') : mensaje.para}: "${mensaje.asunto}"`
          );
        } catch (error) {
          console.error(`[notificaciones] no se pudo enviar "${mensaje.asunto}": ${error.message}`);
        }
      }
    } catch (error) {
      console.error(`[notificaciones] fallo al notificar el pedido #${pedido.id}: ${error.message}`);
    }
  }

  // Los items del pedido guardan productoId/cantidad/precioUnitario;
  // aquí se resuelve el nombre para el desglose.
  async _resolverItems(pedido) {
    const items = [];
    for (const item of pedido.items) {
      const producto = await this.productoRepository.buscarPorId(item.productoId);
      items.push({
        nombre: producto ? producto.nombre : `Producto #${item.productoId}`,
        cantidad: item.cantidad,
        precioUnitario: item.precioUnitario,
        subtotal: item.cantidad * item.precioUnitario,
      });
    }
    return items;
  }

  _mensajeCliente(pedido, cliente, items) {
    const { banco, titular, clabe } = this.datosBancarios;
    const lineas = items
      .map(
        (i) =>
          `  ${i.cantidad} x ${i.nombre} — $${i.subtotal.toFixed(2)} (c/u $${i.precioUnitario.toFixed(2)})`
      )
      .join('\n');

    const texto = [
      `Hola ${cliente.nombre}:`,
      '',
      `Recibimos tu pedido #${pedido.id}. Estado actual: pendiente de pago.`,
      '',
      'Para completar la compra, realiza la transferencia con estos datos:',
      '',
      `  Banco:    ${banco}`,
      `  Titular:  ${titular}`,
      `  CLABE:    ${clabe}`,
      `  Concepto: Pedido #${pedido.id}`,
      '',
      'Desglose de tu compra:',
      lineas,
      '',
      `Total a pagar: $${pedido.total.toFixed(2)}`,
      '',
      'Cuando validemos el pago, tu pedido pasará a "pagado" y será enviado.',
      '',
      '¡Gracias por tu compra!',
    ].join('\n');

    return {
      para: cliente.email,
      asunto: `Pedido #${pedido.id} — pendiente de pago`,
      texto,
      html: this._htmlCliente(pedido, cliente, items),
    };
  }

  _mensajeAdministrador(pedido, admin, cliente, items) {
    const lineas = items
      .map((i) => `  ${i.cantidad} x ${i.nombre} — $${i.subtotal.toFixed(2)}`)
      .join('\n');

    const texto = [
      'Se registró un nuevo pedido en la plataforma.',
      '',
      `  Pedido:  #${pedido.id}`,
      `  Cliente: ${cliente ? `${cliente.nombre} <${cliente.email}>` : `#${pedido.usuarioId}`}`,
      '  Estado:  pendiente de pago',
      `  Total:   $${pedido.total.toFixed(2)}`,
      '',
      'Detalle:',
      lineas,
      '',
      'El cliente ya fue notificado con el desglose y los datos bancarios.',
    ].join('\n');

    return {
      para: admin.email,
      asunto: `Nuevo pedido #${pedido.id} — $${pedido.total.toFixed(2)}`,
      texto,
      html: this._htmlAdministrador(pedido, admin, cliente, items),
    };
  }

  _tablaHtml(items) {
    const filas = items
      .map(
        (i) =>
          `<tr><td>${this._esc(i.nombre)}</td><td align="center">${i.cantidad}</td>` +
          `<td align="right">$${i.precioUnitario.toFixed(2)}</td><td align="right">$${i.subtotal.toFixed(2)}</td></tr>`
      )
      .join('');
    return (
      '<table cellpadding="6" cellspacing="0" border="1" style="border-collapse: collapse; border-color: #d8ded2;">' +
      '<tr><th>Producto</th><th>Cantidad</th><th>P. unitario</th><th>Subtotal</th></tr>' +
      filas +
      '</table>'
    );
  }

  _htmlCliente(pedido, cliente, items) {
    const { banco, titular, clabe } = this.datosBancarios;
    return (
      '<div style="font-family: Arial, sans-serif; color: #1e2a22;">' +
      `<h2>Pedido #${pedido.id}</h2>` +
      `<p>Hola ${this._esc(cliente.nombre)},</p>` +
      '<p>Recibimos tu pedido. Estado actual: <strong>pendiente de pago</strong>.</p>' +
      '<p>Para completar la compra, realiza la transferencia con estos datos:</p>' +
      '<ul>' +
      `<li><strong>Banco:</strong> ${this._esc(banco)}</li>` +
      `<li><strong>Titular:</strong> ${this._esc(titular)}</li>` +
      `<li><strong>CLABE:</strong> ${this._esc(clabe)}</li>` +
      `<li><strong>Concepto:</strong> Pedido #${pedido.id}</li>` +
      '</ul>' +
      '<p><strong>Desglose de tu compra</strong></p>' +
      this._tablaHtml(items) +
      `<p><strong>Total a pagar: $${pedido.total.toFixed(2)}</strong></p>` +
      '<p>Cuando validemos el pago, tu pedido pasará a "pagado" y será enviado.</p>' +
      '<p>¡Gracias por tu compra!</p>' +
      '</div>'
    );
  }

  _htmlAdministrador(pedido, admin, cliente, items) {
    return (
      '<div style="font-family: Arial, sans-serif; color: #1e2a22;">' +
      `<h2>Nuevo pedido #${pedido.id}</h2>` +
      `<p>Hola ${this._esc(admin.nombre)},</p>` +
      '<p>Se registró un nuevo pedido en la plataforma.</p>' +
      '<ul>' +
      `<li><strong>Cliente:</strong> ${
        cliente ? `${this._esc(cliente.nombre)} (${this._esc(cliente.email)})` : `#${pedido.usuarioId}`
      }</li>` +
      '<li><strong>Estado:</strong> pendiente de pago</li>' +
      `<li><strong>Total:</strong> $${pedido.total.toFixed(2)}</li>` +
      '</ul>' +
      '<p><strong>Detalle</strong></p>' +
      this._tablaHtml(items) +
      '</div>'
    );
  }

  _esc(valor) {
    return String(valor)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}

module.exports = NotificacionPedidoService;
