const AGRUPACIONES_VALIDAS = ['day', 'week', 'month'];

/**
 * Caso de uso / puerto de entrada: AnalyticsService.
 * Orquesta las métricas del dashboard. Depende solo del puerto de salida
 * analyticsRepository (inyectado), nunca de pg ni de Express.
 * La base de datos hace las agregaciones; aquí solo se valida la entrada
 * y se calculan porcentajes sobre resultados ya agregados.
 */
class AnalyticsService {
  constructor({ analyticsRepository }) {
    this.analyticsRepository = analyticsRepository;
  }

  _validarRango(desde, hasta) {
    if (desde && hasta && desde > hasta) {
      throw new Error('El rango de fechas es inválido: "desde" es posterior a "hasta"');
    }
  }

  // Top N de productos por unidades vendidas (y monto recaudado)
  async obtenerTopProductos({ limite = 10, desde = null, hasta = null } = {}) {
    this._validarRango(desde, hasta);
    const limiteSeguro = Math.min(Math.max(parseInt(limite, 10) || 10, 1), 50);
    return this.analyticsRepository.topProductos({ limite: limiteSeguro, desde, hasta });
  }

  // Ingresos agrupados por día, semana o mes dentro del rango
  async obtenerIngresosPorRango({ desde = null, hasta = null, agrupacion = 'day' } = {}) {
    this._validarRango(desde, hasta);
    if (!AGRUPACIONES_VALIDAS.includes(agrupacion)) {
      throw new Error('Agrupación inválida (usa day, week o month)');
    }
    const serie = await this.analyticsRepository.ingresosPorRango({ desde, hasta, agrupacion });
    const ingresosTotales = serie.reduce((acc, fila) => acc + fila.ingresos, 0);
    return { agrupacion, ingresosTotales, serie };
  }

  // Conteo y porcentaje de pedidos por estado
  async obtenerDistribucionEstados({ desde = null, hasta = null } = {}) {
    this._validarRango(desde, hasta);
    const filas = await this.analyticsRepository.distribucionEstados({ desde, hasta });
    const total = filas.reduce((acc, f) => acc + f.cantidad, 0);
    const porEstado = new Map(filas.map((f) => [f.estado, f.cantidad]));

    // Se devuelven siempre los 4 estados, aunque alguno tenga 0 pedidos
    const distribucion = ['pendiente', 'pagado', 'enviado', 'cancelado'].map((estado) => {
      const cantidad = porEstado.get(estado) || 0;
      return {
        estado,
        cantidad,
        porcentaje: total > 0 ? Math.round((cantidad / total) * 1000) / 10 : 0,
      };
    });
    return { totalPedidos: total, distribucion };
  }

  // Ticket promedio por pedido y por usuario, más ingresos totales del rango
  async obtenerTicketPromedio({ desde = null, hasta = null } = {}) {
    this._validarRango(desde, hasta);
    return this.analyticsRepository.resumenVentas({ desde, hasta });
  }
}

module.exports = AnalyticsService;
