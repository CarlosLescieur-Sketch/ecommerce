# Subsistema de Notificaciones (Puertos y Adaptadores)

Al crear un pedido, el sistema registra su estado **pendiente de pago**
(estado `pendiente`) y dispara automáticamente dos correos:

1. **Al cliente**: desglose de su compra (productos, cantidades,
   precios y total) más los datos bancarios/instrucciones para
   completar la transferencia.
2. **A los administradores**: aviso de la llegada del nuevo pedido
   (cliente, total y detalle).

El núcleo del sistema (dominio y aplicación) **no conoce Nodemailer ni
ningún proveedor de correo**: solo depende de un puerto de salida.

## Estructura

```
backend/src/
├── domain/                          Sin cambios: nada de correo aquí.
├── application/
│   ├── ports/output/
│   │   └── NotificationPorts.js     Puerto INotificationSender (contrato)
│   └── usecases/
│       ├── NotificacionPedidoService.js   Construye y envía los mensajes
│       └── PedidoUseCases.js              Dispara el servicio tras crear
└── infrastructure/
    ├── adapters/output/
    │   └── notifications/
    │       ├── NodemailerEmailSender.js   Adaptador SMTP (Nodemailer)
    │       └── ConsoleEmailSender.js      Adaptador consola (dev/demo)
    └── config/
        ├── notifications.js         Datos bancarios + SMTP desde .env
        └── container.js             Elige el adaptador (composition root)
```

## Flujo

```
POST /api/pedidos
      │
      ▼
PedidoUseCases.crear
      │  1. valida stock, congela precios, persiste el pedido
      │  2. notificacionPedido.notificarPedidoCreado(pedido)
      ▼
NotificacionPedidoService          (Aplicación — sin dependencias externas)
      │  arma los mensajes (cliente + administradores)
      ▼
INotificationSender.enviar(...)    (puerto de salida)
      │
      ├──> NodemailerEmailSender   si SMTP_HOST está definido
      └──> ConsoleEmailSender      si no (imprime en la consola del server)
```

Garantías:

- Si el envío falla, el error se registra en consola y **el pedido ya
  creado no se pierde** (`notificarPedidoCreado` nunca lanza).
- Cambiar de proveedor (SendGrid, SES, Mailgun...) = crear otro
  adaptador y apuntarlo en `container.js`. No se toca dominio ni
  aplicación.

## Configuración (`.env`)

| Variable        | Descripción                                             |
|-----------------|---------------------------------------------------------|
| `SMTP_HOST`     | Servidor SMTP. **Vacío = adaptador de consola.**        |
| `SMTP_PORT`     | Puerto (587 por defecto; 465 usa SSL).                  |
| `SMTP_USER`     | Usuario SMTP (opcional si no requiere auth).            |
| `SMTP_PASS`     | Contraseña SMTP.                                        |
| `EMAIL_DESDE`   | Remitente mostrado en el correo.                        |
| `BANCO_NOMBRE`  | Datos bancarios incluidos en el correo de pago pendiente. |
| `BANCO_TITULAR` |                                                        |
| `BANCO_CLABE`   |                                                        |

Si los `BANCO_*` están vacíos se usan valores de ejemplo (config en
`infrastructure/config/notifications.js`).

### Ejemplo con Gmail

1. Activa la verificación en dos pasos de la cuenta y genera una
   **contraseña de aplicación** (no usees la contraseña normal).
2. En `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-correo@gmail.com
SMTP_PASS=tu-contraseña-de-aplicación
EMAIL_DESDE=tu-correo@gmail.com
```

3. Reinicia el backend: a partir de ahí los correos salen con
   Nodemailer en lugar de imprimirse en consola.

## Cómo probarlo

1. Levanta el backend (`npm run dev`). Sin `SMTP_HOST`, los correos se
   imprimen en la consola con el prefijo `[notificacion]`.
2. Crea un pedido desde el frontend (o con `POST /api/pedidos`).
3. Verás en la consola del backend los dos correos: el del cliente con
   el desglose y los datos bancarios, y el de aviso al administrador.
