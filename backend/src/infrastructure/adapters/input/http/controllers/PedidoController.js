class PedidoController {
  constructor(pedidoUseCases) {
    this.pedidoUseCases = pedidoUseCases;
  }

  crear = async (req, res) => {
    try {
      const pedido = await this.pedidoUseCases.crear(req.body);
      res.status(201).json(pedido.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  obtener = async (req, res) => {
    try {
      const pedido = await this.pedidoUseCases.obtenerPorId(req.params.id);
      res.status(200).json(pedido.toJSON());
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };

  listarPorUsuario = async (req, res) => {
    try {
      const pedidos = await this.pedidoUseCases.listarPorUsuario(req.params.usuarioId);
      res.status(200).json(pedidos.map((p) => p.toJSON()));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  listar = async (req, res) => {
    try {
      const pedidos = await this.pedidoUseCases.listar();
      res.status(200).json(pedidos.map((p) => p.toJSON()));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  actualizarEstado = async (req, res) => {
    try {
      const pedido = await this.pedidoUseCases.actualizarEstado(req.params.id, req.body.estado);
      res.status(200).json(pedido.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  eliminar = async (req, res) => {
    try {
      await this.pedidoUseCases.eliminar(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}

module.exports = PedidoController;
