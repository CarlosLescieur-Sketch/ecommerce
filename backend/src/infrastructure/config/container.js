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
const BcryptPasswordHasher = require('../adapters/output/security/BcryptPasswordHasher');

const UsuarioUseCases = require('../../application/usecases/UsuarioUseCases');
const ProductoUseCases = require('../../application/usecases/ProductoUseCases');
const PedidoUseCases = require('../../application/usecases/PedidoUseCases');

const UsuarioController = require('../adapters/input/http/controllers/UsuarioController');
const ProductoController = require('../adapters/input/http/controllers/ProductoController');
const PedidoController = require('../adapters/input/http/controllers/PedidoController');

// Adaptadores de salida
const usuarioRepository = new PgUsuarioRepository(pool);
const productoRepository = new PgProductoRepository(pool);
const pedidoRepository = new PgPedidoRepository(pool);
const passwordHasher = new BcryptPasswordHasher();

// Casos de uso (Aplicación)
const usuarioUseCases = new UsuarioUseCases({ usuarioRepository, passwordHasher });
const productoUseCases = new ProductoUseCases({ productoRepository });
const pedidoUseCases = new PedidoUseCases({ pedidoRepository, productoRepository });

// Adaptadores de entrada
const usuarioController = new UsuarioController(usuarioUseCases);
const productoController = new ProductoController(productoUseCases);
const pedidoController = new PedidoController(pedidoUseCases);

module.exports = {
  usuarioController,
  productoController,
  pedidoController,
};
