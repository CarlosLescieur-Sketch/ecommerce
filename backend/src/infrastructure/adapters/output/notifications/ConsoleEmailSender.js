/**
 * Adaptador de salida: implementa INotificationSender imprimiendo el
 * correo en la consola del servidor. Se usa en desarrollo y cuando no
 * hay SMTP configurado: demuestra que el núcleo no depende de ningún
 * proveedor de correo (mismo contrato, otro medio).
 */
class ConsoleEmailSender {
  async enviar({ para, asunto, texto }) {
    console.log(`[notificacion] to: ${Array.isArray(para) ? para.join(', ') : para}`);
    console.log(`[notificacion] asunto: ${asunto}`);
    console.log(texto.split('\n').map((linea) => `[notificacion]   ${linea}`).join('\n'));
    console.log('[notificacion] --------------------------------');
  }
}

module.exports = ConsoleEmailSender;
