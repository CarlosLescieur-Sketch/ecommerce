/**
 * Puerto de SALIDA: IAnalyticsRepository
 * Contrato que el caso de uso AnalyticsService necesita. La infraestructura
 * (PgAnalyticsRepository) lo implementa con consultas SQL agregadas, de modo
 * que el cálculo pesado ocurre en la base de datos y no en memoria de Node.
 *
 * topProductos({ limite, desde, hasta })
 *   -> [{ productoId, nombre, unidadesVendidas, montoRecaudado }]
 * ingresosPorRango({ desde, hasta, agrupacion })   // agrupacion: day | week | month
 *   -> [{ periodo, ingresos, pedidos }]
 * distribucionEstados({ desde, hasta })
 *   -> [{ estado, cantidad }]
 * resumenVentas({ desde, hasta })
 *   -> { ticketPromedioPedido, ticketPromedioUsuario, totalPedidos, ingresosTotales }
 */
module.exports = {};
