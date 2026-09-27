const express = require('express');
const cors = require('cors');
const path = require('path');

const { usuarioController, productoController, pedidoController } = require('./container');
const { UPLOADS_DIR } = require('../adapters/input/http/middlewares/uploadMiddleware');

const usuarioRoutes = require('../adapters/input/http/routes/usuarioRoutes');
const productoRoutes = require('../adapters/input/http/routes/productoRoutes');
const pedidoRoutes = require('../adapters/input/http/routes/pedidoRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Sirve las imágenes subidas de productos: http://localhost:3000/uploads/<archivo>
app.use('/uploads', express.static(UPLOADS_DIR));

app.use('/api/usuarios', usuarioRoutes(usuarioController));
app.use('/api/productos', productoRoutes(productoController));
app.use('/api/pedidos', pedidoRoutes(pedidoController));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Manejador de errores genérico
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;
