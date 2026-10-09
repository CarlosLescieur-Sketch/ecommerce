const FECHA_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Convierte "YYYY-MM-DD" en un límite de fecha para SQL.
// "hasta" se vuelve exclusivo al día siguiente, así el día final queda incluido.
function parseDesde(valor) {
  if (!valor) return null;
  if (!FECHA_REGEX.test(valor)) throw new Error('Formato de fecha inválido (usa YYYY-MM-DD)');
  return valor;
}

function parseHasta(valor) {
  const fecha = parseDesde(valor);
  if (!fecha) return null;
  const d = new Date(`${fecha}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

class AnalyticsController {
  constructor(analyticsService) {
    this.analyticsService = analyticsService;
  }

  _rango(req) {
    const desde = parseDesde(req.query.desde);
    const hasta = parseHasta(req.query.hasta);
    return { desde, hasta };
  }

  topProductos = async (req, res) => {
    try {
      const { desde, hasta } = this._rango(req);
      const data = await this.analyticsService.obtenerTopProductos({
        limite: req.query.limite,
        desde,
        hasta,
      });
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  ingresos = async (req, res) => {
    try {
      const { desde, hasta } = this._rango(req);
      const data = await this.analyticsService.obtenerIngresosPorRango({
        desde,
        hasta,
        agrupacion: req.query.agrupacion || 'day',
      });
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  estados = async (req, res) => {
    try {
      const { desde, hasta } = this._rango(req);
      const data = await this.analyticsService.obtenerDistribucionEstados({ desde, hasta });
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  ticketPromedio = async (req, res) => {
    try {
      const { desde, hasta } = this._rango(req);
      const data = await this.analyticsService.obtenerTicketPromedio({ desde, hasta });
      res.status(200).json(data);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}

module.exports = AnalyticsController;
