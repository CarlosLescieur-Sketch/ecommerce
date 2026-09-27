# Diagrama Arquitectónico — Backend Hexagonal

## Vista general de capas

```mermaid
flowchart TB
    subgraph Infraestructura["INFRAESTRUCTURA (Adaptadores)"]
        direction TB
        subgraph Entrada["Adaptadores de Entrada"]
            HTTP["Controladores REST\n(Express: Usuario, Producto, Pedido)"]
        end
        subgraph Salida["Adaptadores de Salida"]
            PG["Repositorios PostgreSQL\n(PgUsuarioRepository, PgProductoRepository, PgPedidoRepository)"]
            BCRYPT["BcryptPasswordHasher"]
        end
    end

    subgraph Aplicacion["APLICACIÓN (Puertos + Casos de Uso)"]
        direction TB
        UC["Casos de Uso\nUsuarioUseCases · ProductoUseCases · PedidoUseCases"]
        PORTS_IN["Puertos de Entrada\n(interfaces que exponen los casos de uso)"]
        PORTS_OUT["Puertos de Salida\nIUsuarioRepository · IProductoRepository\nIPedidoRepository · IPasswordHasher"]
    end

    subgraph Dominio["DOMINIO (núcleo, sin dependencias externas)"]
        direction TB
        ENT["Entidades\nUsuario · Producto · Pedido"]
        RULES["Reglas de negocio\nPasswordPolicy · stock disponible\ncálculo de total"]
    end

    HTTP -->|invoca| PORTS_IN
    PORTS_IN --> UC
    UC --> PORTS_OUT
    PORTS_OUT -.implementado por.-> PG
    PORTS_OUT -.implementado por.-> BCRYPT
    UC --> ENT
    ENT --> RULES

    style Dominio fill:#fef3c7,stroke:#d97706
    style Aplicacion fill:#dbeafe,stroke:#2563eb
    style Infraestructura fill:#dcfce7,stroke:#16a34a
```

## Regla de dependencia (clave de la Arquitectura Hexagonal)

Las flechas de dependencia SIEMPRE apuntan hacia adentro:

```
Infraestructura  →  Aplicación  →  Dominio
```

- **Dominio** no importa nada de `express`, `pg` ni `bcrypt`. Solo contiene las
  entidades (`Usuario`, `Producto`, `Pedido`) y las reglas de negocio puras
  (validación de contraseña, verificación de stock, cálculo de total).
- **Aplicación** define los **puertos** (interfaces) que necesita para
  funcionar — `IUsuarioRepository`, `IPasswordHasher`, etc. — y los **casos
  de uso** que orquestan al Dominio. No sabe si detrás hay PostgreSQL o
  MongoDB.
- **Infraestructura** contiene los **adaptadores** concretos: de entrada
  (controladores HTTP/Express que traducen peticiones REST en llamadas a
  casos de uso) y de salida (repositorios PostgreSQL, el adaptador
  bcrypt). Es la única capa que conoce el "mundo exterior".

## Flujo de una petición (ejemplo: crear pedido)

```mermaid
sequenceDiagram
    participant Cliente as Cliente (React)
    participant Ctrl as PedidoController (adaptador entrada)
    participant UC as PedidoUseCases (aplicación)
    participant Dom as Pedido / Producto (dominio)
    participant Repo as PgPedidoRepository (adaptador salida)
    participant DB as PostgreSQL

    Cliente->>Ctrl: POST /api/pedidos
    Ctrl->>UC: crear({usuarioId, items})
    UC->>Dom: producto.tieneStockPara(cantidad)
    UC->>Dom: new Pedido(...).calcularTotal()
    UC->>Repo: crear(pedido)
    Repo->>DB: INSERT (transacción)
    DB-->>Repo: filas insertadas
    Repo-->>UC: entidad Pedido
    UC-->>Ctrl: entidad Pedido
    Ctrl-->>Cliente: 201 Created (JSON)
```

## Estructura de carpetas del backend

```
backend/src/
├── domain/
│   ├── entities/        Usuario.js, Producto.js, Pedido.js
│   └── services/         PasswordPolicy.js
├── application/
│   ├── ports/
│   │   ├── input/         (contratos que exponen los casos de uso)
│   │   └── output/        RepositoryPorts.js (contratos de repos/hasher)
│   └── usecases/           UsuarioUseCases.js, ProductoUseCases.js, PedidoUseCases.js
└── infrastructure/
    ├── adapters/
    │   ├── input/http/
    │   │   ├── controllers/  UsuarioController.js, ProductoController.js, PedidoController.js
    │   │   └── routes/       usuarioRoutes.js, productoRoutes.js, pedidoRoutes.js
    │   └── output/
    │       ├── postgres/     PgUsuarioRepository.js, PgProductoRepository.js, PgPedidoRepository.js
    │       └── security/     BcryptPasswordHasher.js
    └── config/               db.js, container.js, app.js
```
