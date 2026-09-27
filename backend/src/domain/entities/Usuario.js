/**
 * Entidad de dominio: Usuario
 * No conoce Express, ni PostgreSQL, ni bcrypt.
 * passwordHash ya viene calculado; el dominio nunca ve la contraseña en claro
 * más allá de esta clase (ver domain/services/PasswordPolicy.js).
 */
class Usuario {
  constructor({ id = null, nombre, email, passwordHash, rol = 'cliente' }) {
    if (!nombre || nombre.trim().length === 0) {
      throw new Error('El nombre del usuario es obligatorio');
    }
    if (!email || !Usuario.emailValido(email)) {
      throw new Error('El email del usuario no es válido');
    }
    if (!passwordHash) {
      throw new Error('El usuario requiere un passwordHash');
    }
    if (!['cliente', 'administrador'].includes(rol)) {
      throw new Error('Rol de usuario inválido');
    }

    this.id = id;
    this.nombre = nombre.trim();
    this.email = email.trim().toLowerCase();
    this.passwordHash = passwordHash;
    this.rol = rol;
  }

  static emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Nunca serializar passwordHash hacia afuera del sistema.
  toPublicJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      rol: this.rol,
    };
  }
}

module.exports = Usuario;
