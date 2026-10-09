const path = require('path');

// Mismo criterio que db.js: se apunta explícitamente al .env dentro de
// backend/ para que la configuración funcione desde cualquier carpeta.
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

/**
 * Configuración del subsistema de notificaciones (Infraestructura),
 * consumida por el composition root (container.js).
 *
 * - datosBancarios: datos que viajan dentro del correo "pendiente de
 *   pago"; se pueden sobreescribir desde .env.
 * - smtp: si SMTP_HOST no está definido queda en null y el container
 *   elige el adaptador de consola (dev / demostración).
 */
const datosBancarios = {
  banco: process.env.BANCO_NOMBRE || 'Mi Banco',
  titular: process.env.BANCO_TITULAR || 'Ecommerce Demo',
  clabe: process.env.BANCO_CLABE || '0000 0000 0000 0000 00',
};

// Google muestra las contraseñas de aplicación con espacios
// ("abcd efgh ijkl mnop"), pero el servidor SMTP las espera sin
// espacios: si coincide con ese patrón se limpian. Contraseñas
// normales (con otros caracteres) no se tocan.
function passwordLimpia(pass = '') {
  return /^[A-Za-z]{4}( [A-Za-z]{4}){3}$/.test(pass) ? pass.replace(/ /g, '') : pass;
}

const smtp = process.env.SMTP_HOST
  ? {
      opcionesTransporte: {
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587', 10),
        secure: String(process.env.SMTP_PORT) === '465',
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: passwordLimpia(process.env.SMTP_PASS) }
          : undefined,
      },
      desde: process.env.EMAIL_DESDE || 'no-responder@ecommerce.local',
    }
  : null;

module.exports = { datosBancarios, smtp };
