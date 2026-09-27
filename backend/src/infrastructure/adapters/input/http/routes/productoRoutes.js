const { Router } = require('express');
const { upload } = require('../middlewares/uploadMiddleware');

function productoRoutes(productoController) {
  const router = Router();

  router.post('/', upload.single('imagen'), productoController.crear);
  router.get('/', productoController.listar);
  router.get('/:id', productoController.obtener);
  router.put('/:id', upload.single('imagen'), productoController.actualizar);
  router.delete('/:id', productoController.eliminar);

  return router;
}

module.exports = productoRoutes;
