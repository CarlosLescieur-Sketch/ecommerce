const { Router } = require('express');

// Todas las rutas de analíticas quedan protegidas con requireAdmin.
function analyticsRoutes(analyticsController, requireAdminMiddleware) {
  const router = Router();

  router.use(requireAdminMiddleware);

  router.get('/top-productos', analyticsController.topProductos);
  router.get('/ingresos', analyticsController.ingresos);
  router.get('/estados', analyticsController.estados);
  router.get('/ticket-promedio', analyticsController.ticketPromedio);

  return router;
}

module.exports = analyticsRoutes;
