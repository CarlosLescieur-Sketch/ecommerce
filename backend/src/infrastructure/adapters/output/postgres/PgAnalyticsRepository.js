/**
 * Adaptador de salida: AnalyticsRepositoryAdapter (implementa IAnalyticsRepository).
 * Todas las métricas se calculan con SUM / COUNT / AVG + GROUP BY + filtros de
 * fecha directamente en PostgreSQL, para no traer filas a memoria de Node.js.
 * Los pedidos "cancelado" se excluyen de ventas e ingresos, pero sí cuentan en
 * la distribución de estados.
 */
class PgAnalyticsRepository {
  constructor(pool) {
    this.pool = pool;
  }

  async topProductos({ limite, desde, hasta }) {
    const { rows } = await this.pool.query(
      `SELECT p.id AS producto_id,
              p.nombre,
              SUM(pi.cantidad)::int AS unidades_vendidas,
              SUM(pi.cantidad * pi.precio_unitario) AS monto_recaudado
         FROM pedido_items pi
         JOIN pedidos pe ON pe.id = pi.pedido_id
         JOIN productos p ON p.id = pi.producto_id
        WHERE pe.estado <> 'cancelado'
          AND ($1::timestamp IS NULL OR pe.creado_en >= $1::timestamp)
          AND ($2::timestamp IS NULL OR pe.creado_en < $2::timestamp)
        GROUP BY p.id, p.nombre
        ORDER BY unidades_vendidas DESC, monto_recaudado DESC
        LIMIT $3`,
      [desde, hasta, limite]
    );
    return rows.map((r) => ({
      productoId: r.producto_id,
      nombre: r.nombre,
      unidadesVendidas: r.unidades_vendidas,
      montoRecaudado: parseFloat(r.monto_recaudado),
    }));
  }

  async ingresosPorRango({ desde, hasta, agrupacion }) {
    const { rows } = await this.pool.query(
      `SELECT to_char(date_trunc($3, pe.creado_en), 'YYYY-MM-DD') AS periodo,
              SUM(pe.total) AS ingresos,
              COUNT(*)::int AS pedidos
         FROM pedidos pe
        WHERE pe.estado <> 'cancelado'
          AND ($1::timestamp IS NULL OR pe.creado_en >= $1::timestamp)
          AND ($2::timestamp IS NULL OR pe.creado_en < $2::timestamp)
        GROUP BY periodo
        ORDER BY periodo ASC`,
      [desde, hasta, agrupacion]
    );
    return rows.map((r) => ({
      periodo: r.periodo,
      ingresos: parseFloat(r.ingresos),
      pedidos: r.pedidos,
    }));
  }

  async distribucionEstados({ desde, hasta }) {
    const { rows } = await this.pool.query(
      `SELECT pe.estado::text AS estado, COUNT(*)::int AS cantidad
         FROM pedidos pe
        WHERE ($1::timestamp IS NULL OR pe.creado_en >= $1::timestamp)
          AND ($2::timestamp IS NULL OR pe.creado_en < $2::timestamp)
        GROUP BY pe.estado`,
      [desde, hasta]
    );
    return rows.map((r) => ({ estado: r.estado, cantidad: r.cantidad }));
  }

  async resumenVentas({ desde, hasta }) {
    const { rows } = await this.pool.query(
      `WITH filtrados AS (
         SELECT usuario_id, total
           FROM pedidos pe
          WHERE pe.estado <> 'cancelado'
            AND ($1::timestamp IS NULL OR pe.creado_en >= $1::timestamp)
            AND ($2::timestamp IS NULL OR pe.creado_en < $2::timestamp)
       ),
       gasto_usuario AS (
         SELECT usuario_id, SUM(total) AS total_usuario
           FROM filtrados
          GROUP BY usuario_id
       )
       SELECT (SELECT COALESCE(AVG(total), 0) FROM filtrados)               AS ticket_pedido,
              (SELECT COALESCE(AVG(total_usuario), 0) FROM gasto_usuario)   AS ticket_usuario,
              (SELECT COUNT(*) FROM filtrados)::int                         AS total_pedidos,
              (SELECT COALESCE(SUM(total), 0) FROM filtrados)               AS ingresos_totales`,
      [desde, hasta]
    );
    const r = rows[0];
    return {
      ticketPromedioPedido: parseFloat(r.ticket_pedido),
      ticketPromedioUsuario: parseFloat(r.ticket_usuario),
      totalPedidos: r.total_pedidos,
      ingresosTotales: parseFloat(r.ingresos_totales),
    };
  }
}

module.exports = PgAnalyticsRepository;
