const multer = require('multer');
const path = require('path');
const fs = require('fs');

/**
 * Adaptador de entrada: middleware HTTP que recibe el archivo de imagen
 * de un producto (multipart/form-data, campo "imagen") y lo guarda en
 * disco dentro de backend/uploads. El controlador se encarga de
 * construir la URL pública y pasarla al caso de uso — este middleware
 * solo sabe de archivos, no de Producto ni de reglas de negocio.
 */
const UPLOADS_DIR = path.join(__dirname, '../../../../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const sufijo = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `producto-${sufijo}${ext}`);
  },
});

const TIPOS_PERMITIDOS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function filtroArchivo(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!TIPOS_PERMITIDOS.includes(ext)) {
    return cb(new Error('Formato de imagen no permitido (usa jpg, png, webp o gif)'));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter: filtroArchivo,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = { upload, UPLOADS_DIR };
