const { Router } = require('express');

function pedidoRoutes(pedidoController) {
  const router = Router();

  router.post('/', pedidoController.crear);
  router.get('/', pedidoController.listar);
  router.get('/:id', pedidoController.obtener);
  router.get('/usuario/:usuarioId', pedidoController.listarPorUsuario);
  router.patch('/:id/estado', pedidoController.actualizarEstado);
  router.delete('/:id', pedidoController.eliminar);

  return router;
}

module.exports = pedidoRoutes;
