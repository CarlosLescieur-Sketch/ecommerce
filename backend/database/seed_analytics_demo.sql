-- Datos de DEMOSTRACIÓN para el dashboard de analíticas (opcional).
-- Requiere al menos 1 usuario y 1 producto ya creados desde la app.
-- Genera 60 pedidos repartidos en los últimos 45 días, con estados variados.
-- psql -U <usuario> -d ecommerce_db -h localhost -f database/seed_analytics_demo.sql

DO $$
DECLARE
  v_pedido_id   INTEGER;
  v_usuario_id  INTEGER;
  v_producto    RECORD;
  v_fecha       TIMESTAMP;
  v_estado      estado_pedido;
  v_estados     estado_pedido[] := ARRAY['pendiente','pagado','pagado','pagado','enviado','enviado','cancelado']::estado_pedido[];
  v_total       NUMERIC(10,2);
  v_cantidad    INTEGER;
  i INTEGER;
  j INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM usuarios) = 0 OR (SELECT COUNT(*) FROM productos) = 0 THEN
    RAISE EXCEPTION 'Primero crea al menos 1 usuario y 1 producto desde la aplicación';
  END IF;

  FOR i IN 1..60 LOOP
    SELECT id INTO v_usuario_id FROM usuarios ORDER BY random() LIMIT 1;
    v_fecha  := NOW() - (random() * 45) * INTERVAL '1 day';
    v_estado := v_estados[1 + floor(random() * array_length(v_estados, 1))::int];
    v_total  := 0;

    INSERT INTO pedidos (usuario_id, estado, total, creado_en, actualizado_en)
    VALUES (v_usuario_id, v_estado, 0, v_fecha, v_fecha)
    RETURNING id INTO v_pedido_id;

    FOR j IN 1..(1 + floor(random() * 3)::int) LOOP
      SELECT id, precio INTO v_producto FROM productos ORDER BY random() LIMIT 1;
      v_cantidad := 1 + floor(random() * 4)::int;
      INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
      VALUES (v_pedido_id, v_producto.id, v_cantidad, v_producto.precio);
      v_total := v_total + v_cantidad * v_producto.precio;
    END LOOP;

    UPDATE pedidos SET total = v_total WHERE id = v_pedido_id;
  END LOOP;
END $$;
