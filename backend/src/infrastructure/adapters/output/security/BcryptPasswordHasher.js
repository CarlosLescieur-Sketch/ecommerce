const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Adaptador de salida que implementa el puerto IPasswordHasher.
 * Es el ÚNICO lugar del sistema que sabe que se usa bcrypt.
 * Si mañana cambiamos a argon2, solo se toca este archivo.
 */
class BcryptPasswordHasher {
  async hash(passwordPlano) {
    return bcrypt.hash(passwordPlano, SALT_ROUNDS);
  }

  async comparar(passwordPlano, passwordHash) {
    return bcrypt.compare(passwordPlano, passwordHash);
  }
}

module.exports = BcryptPasswordHasher;
