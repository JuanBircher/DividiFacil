# Documentación de componentes de test (Angular)

Estos componentes permiten probar endpoints y flujos principales de la app sin afectar la experiencia de usuario final. Son útiles para debugging, QA y validación de integraciones.

## auth-test.component.ts
- Prueba el login de usuario con email y password.
- Muestra el resultado de la autenticación y el token JWT recibido.
- Permite inspeccionar la información decodificada del token.

## grupos-test.component.ts
- Permite probar la obtención de grupos del usuario y la creación de un grupo de prueba.
- Muestra la lista de grupos y el resultado de la última operación.

## dashboard-test.component.ts
- Permite probar la carga de estadísticas globales (grupos, gastos, montos).
- Incluye integración con servicios de gastos, grupos, balances y notificaciones.
- Útil para validar la agregación de datos y la visualización de KPIs.

## gastos-test.component.ts
- Permite probar la obtención de gastos recientes y saldos de grupo.
- Muestra los resultados de las operaciones y el estado de carga.
- Útil para validar la integración de gastos y la lógica de saldos.

---

**Recomendación:**
- Mantener estos componentes fuera del build de producción.
- Usar solo en entornos de desarrollo o QA.
- Documentar cualquier endpoint o flujo nuevo que se agregue a estos tests.
