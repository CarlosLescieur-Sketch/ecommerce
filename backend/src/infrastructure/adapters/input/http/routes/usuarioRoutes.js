const { Router } = require('express');

function usuarioRoutes(usuarioController) {
  const router = Router();

  router.post('/registro', usuarioController.registrar);
  router.post('/login', usuarioController.login);
  router.get('/', usuarioController.listar);
  router.get('/:id', usuarioController.obtener);
  router.put('/:id', usuarioController.actualizar);
  router.delete('/:id', usuarioController.eliminar);

  return router;
}

module.exports = usuarioRoutes;
