const Pedido = require('../../../../domain/entities/Pedido');

class PgPedidoRepository {
  constructor(pool) {
    this.pool = pool;
  }

  _aEntidad(row, items) {
    if (!row) return null;
    return new Pedido({
      id: row.id,
      usuarioId: row.usuario_id,
      estado: row.estado,
      total: parseFloat(row.total),
      items: items.map((it) => ({
        productoId: it.producto_id,
        cantidad: it.cantidad,
        precioUnitario: parseFloat(it.precio_unitario),
      })),
    });
  }

  async crear(pedido) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const { rows: pedidoRows } = await client.query(
        `INSERT INTO pedidos (usuario_id, estado, total)
         VALUES ($1, $2, $3) RETURNING *`,
        [pedido.usuarioId, pedido.estado, pedido.total]
      );
      const pedidoId = pedidoRows[0].id;

      const itemsInsertados = [];
      for (const item of pedido.items) {
        const { rows } = await client.query(
          `INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
           VALUES ($1, $2, $3, $4) RETURNING *`,
          [pedidoId, item.productoId, item.cantidad, item.precioUnitario]
        );
        itemsInsertados.push(rows[0]);
      }

      await client.query('COMMIT');
      return this._aEntidad(pedidoRows[0], itemsInsertados);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async buscarPorId(id) {
    const { rows: pedidoRows } = await this.pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (!pedidoRows[0]) return null;
    const { rows: itemRows } = await this.pool.query(
      'SELECT * FROM pedido_items WHERE pedido_id = $1',
      [id]
    );
    return this._aEntidad(pedidoRows[0], itemRows);
  }

  async _hidratarLista(pedidoRows) {
    const pedidos = [];
    for (const row of pedidoRows) {
      const { rows: itemRows } = await this.pool.query(
        'SELECT * FROM pedido_items WHERE pedido_id = $1',
        [row.id]
      );
      pedidos.push(this._aEntidad(row, itemRows));
    }
    return pedidos;
  }

  async listarPorUsuario(usuarioId) {
    const { rows } = await this.pool.query(
      'SELECT * FROM pedidos WHERE usuario_id = $1 ORDER BY id DESC',
      [usuarioId]
    );
    return this._hidratarLista(rows);
  }

  async listar() {
    const { rows } = await this.pool.query('SELECT * FROM pedidos ORDER BY id DESC');
    return this._hidratarLista(rows);
  }

  async actualizarEstado(id, estado) {
    const { rows } = await this.pool.query(
      `UPDATE pedidos SET estado = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *`,
      [estado, id]
    );
    if (!rows[0]) return null;
    const { rows: itemRows } = await this.pool.query(
      'SELECT * FROM pedido_items WHERE pedido_id = $1',
      [id]
    );
    return this._aEntidad(rows[0], itemRows);
  }

  async eliminar(id) {
    const { rowCount } = await this.pool.query('DELETE FROM pedidos WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

module.exports = PgPedidoRepository;
