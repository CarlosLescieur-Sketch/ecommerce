/**
 * "Composition root": único lugar donde se conectan los adaptadores
 * concretos (Postgres, bcrypt) con los casos de uso de Aplicación.
 * Esto es lo que hace posible sustituir Postgres por Mongo, o bcrypt
 * por argon2, sin tocar dominio ni aplicación.
 */
const pool = require('./db');

const PgUsuarioRepository = require('../adapters/output/postgres/PgUsuarioRepository');
const PgProductoRepository = require('../adapters/output/postgres/PgProductoRepository');
const PgPedidoRepository = require('../adapters/output/postgres/PgPedidoRepository');
const PgAnalyticsRepository = require('../adapters/output/postgres/PgAnalyticsRepository');
const BcryptPasswordHasher = require('../adapters/output/security/BcryptPasswordHasher');
const NodemailerEmailSender = require('../adapters/output/notifications/NodemailerEmailSender');
const ConsoleEmailSender = require('../adapters/output/notifications/ConsoleEmailSender');

const UsuarioUseCases = require('../../application/usecases/UsuarioUseCases');
const ProductoUseCases = require('../../application/usecases/ProductoUseCases');
const PedidoUseCases = require('../../application/usecases/PedidoUseCases');
const AnalyticsService = require('../../application/usecases/AnalyticsService');
const NotificacionPedidoService = require('../../application/usecases/NotificacionPedidoService');

const UsuarioController = require('../adapters/input/http/controllers/UsuarioController');
const ProductoController = require('../adapters/input/http/controllers/ProductoController');
const PedidoController = require('../adapters/input/http/controllers/PedidoController');
const AnalyticsController = require('../adapters/input/http/controllers/AnalyticsController');
const requireAdmin = require('../adapters/input/http/middlewares/requireAdmin');

// Adaptadores de salida
const usuarioRepository = new PgUsuarioRepository(pool);
const productoRepository = new PgProductoRepository(pool);
const pedidoRepository = new PgPedidoRepository(pool);
const analyticsRepository = new PgAnalyticsRepository(pool);
const passwordHasher = new BcryptPasswordHasher();

// Puerto de salida INotificationSender: el adaptador concreto se elige
// aquí según configuración — con SMTP usa Nodemailer, sin SMTP (demo)
// el de consola. El núcleo (dominio + aplicación) no cambia en ninguno.
const { datosBancarios, smtp } = require('./notifications');
const notificationSender = smtp
  ? new NodemailerEmailSender(smtp)
  : new ConsoleEmailSender();

const notificacionPedidoService = new NotificacionPedidoService({
  notificationSender,
  usuarioRepository,
  productoRepository,
  datosBancarios,
});

// Casos de uso (Aplicación)
const usuarioUseCases = new UsuarioUseCases({ usuarioRepository, passwordHasher });
const productoUseCases = new ProductoUseCases({ productoRepository });
const pedidoUseCases = new PedidoUseCases({
  pedidoRepository,
  productoRepository,
  notificacionPedido: notificacionPedidoService,
});
const analyticsService = new AnalyticsService({ analyticsRepository });

// Adaptadores de entrada
const usuarioController = new UsuarioController(usuarioUseCases);
const productoController = new ProductoController(productoUseCases);
const pedidoController = new PedidoController(pedidoUseCases);
const analyticsController = new AnalyticsController(analyticsService);
const requireAdminMiddleware = requireAdmin(usuarioUseCases);

module.exports = {
  usuarioController,
  productoController,
  pedidoController,
  analyticsController,
  requireAdminMiddleware,
};
