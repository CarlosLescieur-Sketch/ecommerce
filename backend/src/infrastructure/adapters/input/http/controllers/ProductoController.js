class ProductoController {
  constructor(productoUseCases) {
    this.productoUseCases = productoUseCases;
  }

  crear = async (req, res) => {
    try {
      const datos = {
        nombre: req.body.nombre,
        descripcion: req.body.descripcion,
        precio: parseFloat(req.body.precio),
        stock: parseInt(req.body.stock, 10),
      };
      if (req.file) {
        datos.imagenUrl = `/uploads/${req.file.filename}`;
      }
      const producto = await this.productoUseCases.crear(datos);
      res.status(201).json(producto.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  obtener = async (req, res) => {
    try {
      const producto = await this.productoUseCases.obtenerPorId(req.params.id);
      res.status(200).json(producto.toJSON());
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  };

  listar = async (req, res) => {
    try {
      const productos = await this.productoUseCases.listar();
      res.status(200).json(productos.map((p) => p.toJSON()));
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  actualizar = async (req, res) => {
    try {
      const cambios = { ...req.body };
      if (cambios.precio !== undefined) cambios.precio = parseFloat(cambios.precio);
      if (cambios.stock !== undefined) cambios.stock = parseInt(cambios.stock, 10);
      if (req.file) {
        cambios.imagenUrl = `/uploads/${req.file.filename}`;
      }
      const producto = await this.productoUseCases.actualizar(req.params.id, cambios);
      res.status(200).json(producto.toJSON());
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  eliminar = async (req, res) => {
    try {
      await this.productoUseCases.eliminar(req.params.id);
      res.status(204).send();
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}

module.exports = ProductoController;
