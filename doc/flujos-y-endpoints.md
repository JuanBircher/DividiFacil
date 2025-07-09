# DividiFácil – Flujos ideales y mapa de rutas/endpoints

## Flujos ideales de usuario

### 1. Registro e inicio de sesión
- **POST /api/auth/registro**: Registro de usuario.
- **POST /api/auth/login**: Login con email y contraseña.
- **POST /api/auth/external-login**: Login externo (Google, etc).

### 2. Gestión de grupos
- **GET /api/grupos**: Listar grupos del usuario.
- **POST /api/grupos**: Crear grupo.
- **GET /api/grupos/{id}**: Detalle de grupo.
- **PUT /api/grupos/{id}**: Editar grupo.
- **POST /api/grupos/{id}/miembros**: Unirse/aceptar invitación.
- **DELETE /api/grupos/{id}/miembros/{idMiembro}**: Salir o eliminar miembro.

### 3. Gastos
- **GET /api/gastos/grupo/{idGrupo}**: Listar gastos de grupo.
- **POST /api/gastos**: Crear gasto.
- **GET /api/gastos/{idGasto}**: Detalle de gasto.
- **PUT /api/gastos/{idGasto}**: Editar gasto.
- **DELETE /api/gastos/{idGasto}**: Eliminar gasto.

### 4. Pagos
- **GET /api/pagos/grupo/{idGrupo}**: Listar pagos de grupo.
- **POST /api/pagos**: Crear pago.
- **GET /api/pagos/{idPago}**: Detalle de pago.

### 5. Balances
- **GET /api/balance/grupo/{idGrupo}**: Balance detallado de grupo.
- **GET /api/balance/grupo/{idGrupo}/simplificado**: Deudas simplificadas.
- **GET /api/balance/usuario**: Balance global del usuario.

### 6. Notificaciones
- **GET /api/notificaciones/pendientes**: Notificaciones pendientes del usuario.
- **PUT /api/notificaciones/{id}/marcar-enviada**: Marcar como leída.
- **GET /api/notificaciones/grupo/{idGrupo}**: Notificaciones de grupo.

### 7. Recordatorios
- **GET /api/recordatorios**: Todos los recordatorios del usuario.
- **GET /api/recordatorios/pendientes**: Recordatorios próximos.

---

## Mapa de rutas frontend (Angular)

- `/auth/login` – Login
- `/auth/register` – Registro
- `/dashboard` – Resumen general
- `/grupos` – Listado de grupos
- `/grupos/alta` – Alta de grupo
- `/grupos/unirse` – Unirse a grupo
- `/grupos/:idGrupo` – Detalle de grupo
- `/grupos/:idGrupo/editar` – Editar grupo
- `/grupos/:idGrupo/configuraciones` – Configuración de grupo
- `/gastos` – Listado de gastos
- `/gastos/alta` – Alta de gasto
- `/gastos/:idGasto` – Detalle de gasto
- `/gastos/:idGasto/editar` – Editar gasto
- `/pagos` – Listado de pagos
- `/pagos/alta` – Alta de pago
- `/pagos/:idPago` – Detalle de pago
- `/balances/grupo/:idGrupo` – Balance de grupo
- `/balances/usuario` – Balance de usuario
- `/notificaciones` – Panel de notificaciones
- `/caja` – Caja común
- `/perfil` – Perfil de usuario

---

## Notas
- Todos los endpoints requieren autenticación JWT salvo registro/login.
- Los flujos ideales consideran validaciones de permisos y feedback visual en cada paso.
- El frontend consume los endpoints de backend de forma consistente y reactiva.
