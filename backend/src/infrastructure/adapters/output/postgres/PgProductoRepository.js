const Producto = require('../../../../domain/entities/Producto');

class PgProductoRepository {
  constructor(pool) {
    this.pool = pool;
  }

  _aEntidad(row) {
    if (!row) return null;
    return new Producto({
      id: row.id,
      nombre: row.nombre,
      descripcion: row.descripcion,
      precio: parseFloat(row.precio),
      stock: row.stock,
      imagenUrl: row.imagen_url,
    });
  }

  async crear(producto) {
    const { rows } = await this.pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, imagen_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [producto.nombre, producto.descripcion, producto.precio, producto.stock, producto.imagenUrl]
    );
    return this._aEntidad(rows[0]);
  }

  async buscarPorId(id) {
    const { rows } = await this.pool.query('SELECT * FROM productos WHERE id = $1', [id]);
    return this._aEntidad(rows[0]);
  }

  async listar() {
    const { rows } = await this.pool.query('SELECT * FROM productos ORDER BY id');
    return rows.map((r) => this._aEntidad(r));
  }

  async actualizar(id, cambios) {
    const campos = [];
    const valores = [];
    let i = 1;

    if (cambios.nombre) { campos.push(`nombre = $${i++}`); valores.push(cambios.nombre); }
    if (cambios.descripcion !== undefined) { campos.push(`descripcion = $${i++}`); valores.push(cambios.descripcion); }
    if (cambios.precio !== undefined) { campos.push(`precio = $${i++}`); valores.push(cambios.precio); }
    if (cambios.stock !== undefined) { campos.push(`stock = $${i++}`); valores.push(cambios.stock); }
    if (cambios.imagenUrl !== undefined) { campos.push(`imagen_url = $${i++}`); valores.push(cambios.imagenUrl); }
    campos.push(`actualizado_en = NOW()`);

    valores.push(id);
    const { rows } = await this.pool.query(
      `UPDATE productos SET ${campos.join(', ')} WHERE id = $${i} RETURNING *`,
      valores
    );
    return this._aEntidad(rows[0]);
  }

  async actualizarStock(id, nuevoStock) {
    const { rows } = await this.pool.query(
      `UPDATE productos SET stock = $1, actualizado_en = NOW() WHERE id = $2 RETURNING *`,
      [nuevoStock, id]
    );
    return this._aEntidad(rows[0]);
  }

  async eliminar(id) {
    const { rowCount } = await this.pool.query('DELETE FROM productos WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

module.exports = PgProductoRepository;
