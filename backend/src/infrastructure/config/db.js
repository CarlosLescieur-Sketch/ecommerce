const { Pool } = require('pg');
const path = require('path');

// Se apunta explícitamente al .env dentro de backend/, para que la
// conexión funcione sin importar desde qué carpeta se ejecute el comando
// (ej. "cd backend && npm run dev" vs ejecutarlo desde la raíz del repo).
require('dotenv').config({ path: path.join(__dirname, '../../../.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'ecommerce_db',
});

module.exports = pool;