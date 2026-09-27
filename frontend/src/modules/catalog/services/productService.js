import httpClient from '../../../shared/api/httpClient';

// Convierte { nombre, descripcion, precio, stock, imagen(File) } en FormData
// para que el backend (multer) reciba el archivo junto con los demás campos.
function aFormData(producto) {
  const formData = new FormData();
  Object.entries(producto).forEach(([clave, valor]) => {
    if (valor !== undefined && valor !== null) {
      formData.append(clave, valor);
    }
  });
  return formData;
}

export const productService = {
  listar: () => httpClient.get('/productos').then((r) => r.data),
  obtener: (id) => httpClient.get(`/productos/${id}`).then((r) => r.data),
  crear: (producto) => httpClient.post('/productos', aFormData(producto)).then((r) => r.data),
  actualizar: (id, cambios) =>
    httpClient.put(`/productos/${id}`, aFormData(cambios)).then((r) => r.data),
  eliminar: (id) => httpClient.delete(`/productos/${id}`),
};
