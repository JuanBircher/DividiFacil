# Informe de Funcionalidades por Plan de Usuario

Fecha: 14/07/2025

## Checklist de funcionalidades por tipo de plan

### 🟢 Usuario Free

- Crear y unirse a grupos (limitado, ej: 1 grupo activos)  
  Implementado: alta-grupos, unirse-codigo, listado-grupos.  
  Falta: límite de grupos por plan (a controlar)
- Registrar gastos básicos  
  Implementado: alta-gastos
- Ver saldos y deudas  
  Implementado: listado-grupos, dashboard
- Visualizar historial de gastos  
  Implementado: listado-gastos
- Acceso a reportes simples en pantalla (sin exportar)  
  Implementado: dashboard
- Notificaciones básicas (si están habilitadas en el MVP)  
  Implementado: listado-notificaciones
- Acceso a caja común (limitado)  
  Implementado: listado-pagos, alta-pagos.  
  Falta: límite de acceso por plan (a controlar)
- Soporte estándar (FAQ, email)  
  No se detecta componente específico (posible sección de ayuda/FAQ pendiente)


### 🟡 Usuario Premium

- Crear y unirse a grupos ilimitados  
  Implementado, sin límite para Premium.
- Registrar gastos avanzados (categorías, adjuntos, etc.)  
  **Categorías:** Activas y visibles en alta, detalle y listado de gastos.  
  **Adjuntos:** No implementados, no existen campos ni lógica para adjuntar archivos en gastos.
- Ver saldos y deudas  
  Implementado: listado-grupos, dashboard
- Visualizar historial de gastos  
  Implementado: listado-gastos
- Exportar reportes a PDF/Excel  
  ✅ Implementado en listado de gastos para Premium/Pro (botón Exportar, controlado por plan).
- Notificaciones avanzadas (recordatorios, push)  
  Configuración y modelos presentes, funcionalidad activa para todos los usuarios, sin control de acceso por plan.
- Acceso completo a caja común  
  Implementado, sin restricciones para Premium.
- Soporte prioritario (respuesta rápida)  
  No se detecta componente específico, pendiente de desarrollo.
- Personalización de perfil (avatar, datos extra)  
  Avatar: activo para todos los usuarios, sin restricción por plan.  
  Datos extra: revisar si existen y condicionar si corresponde.
- Acceso a estadísticas avanzadas  
  Estadísticas presentes en dashboard, no se diferencian básicas/avanzadas ni se controla por plan.

### 🟣 Usuario Pro

- Todas las funcionalidades de Premium  
  Ver arriba
- Integraciones externas (Google Drive, Dropbox, etc.)  
  No implementado
- Reportes automáticos programados  
  No implementado
- Gestión avanzada de miembros (roles, permisos)  
  No implementado
- Soporte VIP (chat en vivo, atención personalizada)  
  No implementado
- Acceso a funcionalidades beta/early access  
  No implementado
- Panel de administración para grupos grandes  
  No implementado
- Auditoría y logs de actividad  
  No implementado


## Resumen de auditoría

- Las funcionalidades básicas de Free y Premium están implementadas, pero falta aplicar los límites y controles de acceso por plan.
- Las funcionalidades exclusivas de Pro aún no están desarrolladas.
- Exportación de reportes, adjuntos, categorías avanzadas, personalización de perfil y notificaciones avanzadas requieren revisión para confirmar su estado.

## Acciones recomendadas


### Checklist de auditoría de funcionalidades avanzadas

- [x] Adjuntos en gastos: ¿Permite adjuntar archivos? (alta-gastos, detalle-gasto)
- [x] Categorías avanzadas en gastos: ¿Permite seleccionar/crear categorías? (alta-gastos, listado-gastos)
- [x] Exportación de reportes a PDF/Excel: ¿Existe opción de exportar? (listado-gastos, controlado por plan)
- [ ] Estadísticas avanzadas: ¿Se muestran estadísticas adicionales? (dashboard)
- [ ] Avatar y datos extra en perfil: ¿Permite personalización avanzada? (perfil, editar)
- [ ] Notificaciones push y recordatorios: ¿Existen y funcionan? (listado-notificaciones, detalle)

### Pasos para implementar control de acceso por plan

1. **Auditoría técnica**
   - Revisar cada componente del checklist y marcar si la funcionalidad está presente y operativa.
   - Documentar en este informe el estado real de cada funcionalidad avanzada.

2. **Integración de PlanHelperService**
   - Inyectar PlanHelperService en los componentes relevantes.
   - Usar sus métodos (`esFree`, `esPremium`, `esPro`, `tieneAcceso`) para condicionar la visibilidad y habilitación de botones, secciones y acciones.

3. **Aplicar límites y bloqueos**
   - Implementar lógica para limitar acciones según el plan (ej: máximo de grupos, acceso a exportar, adjuntar, etc.).
   - Deshabilitar o esconder opciones no permitidas.

4. **Feedback y upgrade**
   - Mostrar mensajes claros cuando una acción esté restringida.
   - Sugerir el upgrade de plan cuando corresponda.

5. **(Opcional) Crear directivas reutilizables**
   - Para mostrar/ocultar elementos según el plan de usuario en las plantillas.

6. **Documentar avances**
   - Actualizar este informe con cada avance, decisión y funcionalidad cubierta.

7. **Validación y pruebas**
   - Probar todos los casos de uso con usuarios de cada plan.
   - Documentar resultados y ajustar según feedback.

## Siguiente paso

- Analizar el estado actual de la app y marcar qué funcionalidades están implementadas por cada plan.
- Definir el roadmap de desarrollo y monetización.
- Implementar restricciones y controles de acceso según el plan.

---

Este informe servirá como base para validar el producto y definir las próximas implementaciones.
