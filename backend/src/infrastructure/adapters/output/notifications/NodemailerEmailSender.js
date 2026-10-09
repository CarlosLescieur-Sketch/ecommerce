const nodemailer = require('nodemailer');

/**
 * Adaptador de salida: implementa INotificationSender con Nodemailer.
 * Es el ÚNICO punto del sistema que conoce la librería de terceros
 * (nodemailer) y el servidor SMTP concreto; si mañana se usa otro
 * proveedor (SendGrid, SES, ...), solo se sustituye esta clase.
 *
 * Recibe las opciones del transport de Nodemailer + el remitente, que
 * el composition root (container.js) arma a partir de la configuración.
 */
class NodemailerEmailSender {
  constructor({ opcionesTransporte, desde }) {
    this.desde = desde;
    this.transporter = nodemailer.createTransport(opcionesTransporte);
  }

  async enviar({ para, asunto, texto, html }) {
    await this.transporter.sendMail({
      from: this.desde,
      to: para,
      subject: asunto,
      text: texto,
      html,
    });
  }
}

module.exports = NodemailerEmailSender;
