-- Ejecutar solo si la base de datos ya existía antes de agregar
-- soporte de imágenes a productos.
-- psql -U <usuario> -d ecommerce_db -f database/migration_add_imagen.sql

ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url VARCHAR(255);
