const Usuario = require('../../domain/entities/Usuario');
const { validarPassword } = require('../../domain/services/PasswordPolicy');

/**
 * Casos de uso de Usuario (puerto de entrada).
 * Depende únicamente de ABSTRACCIONES inyectadas por constructor:
 * usuarioRepository (puerto de salida) y passwordHasher (puerto de salida).
 * No importa pg ni bcrypt directamente -> eso es Infraestructura.
 */
class UsuarioUseCases {
  constructor({ usuarioRepository, passwordHasher }) {
    this.usuarioRepository = usuarioRepository;
    this.passwordHasher = passwordHasher;
  }

  async registrar({ nombre, email, password, rol }) {
    const existente = await this.usuarioRepository.buscarPorEmail(email);
    if (existente) {
      throw new Error('Ya existe un usuario con ese email');
    }

    validarPassword(password);
    const passwordHash = await this.passwordHasher.hash(password);

    const usuario = new Usuario({ nombre, email, passwordHash, rol });
    return this.usuarioRepository.crear(usuario);
  }

  async autenticar({ email, password }) {
    const usuario = await this.usuarioRepository.buscarPorEmail(email);
    if (!usuario) {
      throw new Error('Credenciales inválidas');
    }
    const coincide = await this.passwordHasher.comparar(password, usuario.passwordHash);
    if (!coincide) {
      throw new Error('Credenciales inválidas');
    }
    return usuario;
  }

  async obtenerPorId(id) {
    const usuario = await this.usuarioRepository.buscarPorId(id);
    if (!usuario) throw new Error('Usuario no encontrado');
    return usuario;
  }

  async listar() {
    return this.usuarioRepository.listar();
  }

  async actualizar(id, cambios) {
    if (cambios.password) {
      validarPassword(cambios.password);
      cambios.passwordHash = await this.passwordHasher.hash(cambios.password);
      delete cambios.password;
    }
    return this.usuarioRepository.actualizar(id, cambios);
  }

  async eliminar(id) {
    return this.usuarioRepository.eliminar(id);
  }
}

module.exports = UsuarioUseCases;
