/**
 * Puerto de SALIDA: INotificationSender
 * Contrato que el servicio de aplicación NotificacionPedidoService
 * necesita para notificar eventos (ej. un nuevo pedido) sin conocer el
 * medio de entrega: la infraestructura decide si el envío es real
 * (Nodemailer + SMTP), de prueba (consola) o cualquier otro proveedor.
 *
 * enviar({ para, asunto, texto, html })
 *   para:   string | string[]   destinatario(s)
 *   asunto: string
 *   texto:  string              versión en texto plano (siempre presente)
 *   html:   string?             versión HTML opcional
 *   -> Promise<void>            rechaza si el envío falla
 *
 * Adaptadores que lo implementan:
 *   infrastructure/adapters/output/notifications/NodemailerEmailSender.js
 *   infrastructure/adapters/output/notifications/ConsoleEmailSender.js
 */
module.exports = {};
