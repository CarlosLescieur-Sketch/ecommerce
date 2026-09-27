/**
 * Adaptador de entrada HTTP. Traduce req/res de Express a llamadas
 * de los casos de uso, y nunca expone passwordHash en las respuestas.
 */
class UsuarioController {
  constructor(usuarioUseCases) {
    this.usuarioUseCases = usuarioUseCases;
  }

  registrar = async (req, res) => {
    try {
      const usuario = await this.usuarioUseCases.registrar(req.body);
      res.status(201).json(usuario.toPublicJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const usuario = await this.usuarioUseCases.autenticar({ email, password });
      res.status(200).json(usuario.toPublicJSON());
    } catch (error) {
      res.status(401).json({ error: error.message });
    }
  };

  obtener = async (req, res) => {
    try {
      const usuario = await this.usuarioUseCases.obtenerPorId(req.params.id);
      res.status(200).json(usuario.toPublicJSON());
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };

  listar = async (req, res) => {
    try {
      const usuarios = await this.usuarioUseCases.listar();
      res.status(200).json(usuarios.map((u) => u.toPublicJSON()));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  actualizar = async (req, res) => {
    try {
      const usuario = await this.usuarioUseCases.actualizar(req.params.id, req.body);
      res.status(200).json(usuario.toPublicJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  eliminar = async (req, res) => {
    try {
      await this.usuarioUseCases.eliminar(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}

module.exports = UsuarioController;
