const Usuario = require('../../../../domain/entities/Usuario');

/**
 * Adaptador de salida: implementa IUsuarioRepository usando PostgreSQL (pg).
 * Traduce entre filas de la tabla `usuarios` y la entidad de dominio Usuario.
 */
class PgUsuarioRepository {
  constructor(pool) {
    this.pool = pool;
  }

  _aEntidad(row) {
    if (!row) return null;
    return new Usuario({
      id: row.id,
      nombre: row.nombre,
      email: row.email,
      passwordHash: row.password_hash,
      rol: row.rol,
    });
  }

  async crear(usuario) {
    const { rows } = await this.pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [usuario.nombre, usuario.email, usuario.passwordHash, usuario.rol]
    );
    return this._aEntidad(rows[0]);
  }

  async buscarPorId(id) {
    const { rows } = await this.pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
    return this._aEntidad(rows[0]);
  }

  async buscarPorEmail(email) {
    const { rows } = await this.pool.query('SELECT * FROM usuarios WHERE email = $1', [
      email.toLowerCase(),
    ]);
    return this._aEntidad(rows[0]);
  }

  async listar() {
    const { rows } = await this.pool.query('SELECT * FROM usuarios ORDER BY id');
    return rows.map((r) => this._aEntidad(r));
  }

  async actualizar(id, cambios) {
    const campos = [];
    const valores = [];
    let i = 1;

    if (cambios.nombre) { campos.push(`nombre = $${i++}`); valores.push(cambios.nombre); }
    if (cambios.email) { campos.push(`email = $${i++}`); valores.push(cambios.email); }
    if (cambios.passwordHash) { campos.push(`password_hash = $${i++}`); valores.push(cambios.passwordHash); }
    if (cambios.rol) { campos.push(`rol = $${i++}`); valores.push(cambios.rol); }
    campos.push(`actualizado_en = NOW()`);

    valores.push(id);
    const { rows } = await this.pool.query(
      `UPDATE usuarios SET ${campos.join(', ')} WHERE id = $${i} RETURNING *`,
      valores
    );
    return this._aEntidad(rows[0]);
  }

  async eliminar(id) {
    const { rowCount } = await this.pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return rowCount > 0;
  }
}

module.exports = PgUsuarioRepository;
