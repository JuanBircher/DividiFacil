# Documentación de funcionalidades limitadas por plan y flujo de upgrade

## Funcionalidades limitadas por plan

### 1. Límite de pagos para usuarios Free
- **Restricción:** Los usuarios con plan Free solo pueden crear hasta 10 pagos.
- **Comportamiento:**
  - Al intentar crear un pago adicional, se muestra un mensaje de feedback y un botón para mejorar el plan (upgrade).
  - El botón de upgrade aparece automáticamente cuando se supera el límite.
- **Referencia:** Implementado en `ListadoPagosComponent` usando `PlanHelperService` y feedback con `MatSnackBar`.

### 2. Exportación de reportes (actualmente solo gastos de grupo)
- **Restricción:** Solo usuarios Premium o Pro pueden exportar reportes.
- **Comportamiento:**
  - El botón de exportar solo es visible y funcional para usuarios Premium/Pro.
  - Si un usuario Free intenta exportar, se muestra un mensaje y un botón para mejorar el plan.
- **Reportes exportables:**
  - **Gastos de grupo:** Permite descargar todos los gastos de un grupo en formato Excel para análisis, respaldo o compartir con miembros.
  - **Balances, pagos, otros:** Actualmente NO cuentan con exportación avanzada. Si se requiere, debe implementarse tanto en backend (endpoint que genere el archivo) como en frontend (botón y lógica de descarga).
- **Referencia:** Implementado en `ListadoGastosComponent` usando `PlanHelperService` y feedback con `MatSnackBar`.

### 3. Adjuntos y notificaciones push
- **Restricción:** Solo usuarios Premium/Pro pueden usar adjuntos y recibir notificaciones push.
- **Comportamiento:**
  - Los botones o acciones relacionadas solo aparecen para usuarios con acceso.
  - Si un usuario Free intenta acceder, se muestra feedback y opción de upgrade.
- **Referencia:** Debe implementarse en los componentes reales correspondientes usando el helper y feedback.

## Flujo de upgrade
- Cuando un usuario Free intenta acceder a una funcionalidad restringida:
  1. Se muestra un mensaje de feedback indicando la restricción y la ventaja de mejorar el plan.
  2. Se ofrece un botón "Mejorar" que navega a la página de upgrade (`/upgrade`).
  3. El helper `PlanHelperService` centraliza la lógica de acceso y debe usarse en todos los componentes con restricciones.

## Buenas prácticas
- **Siempre usar `PlanHelperService`** para verificar acceso a funcionalidades restringidas.
- **Mostrar feedback claro y opción de upgrade** en todos los componentes afectados.
- **No inventar componentes:** aplicar solo en componentes reales existentes.
- **Ejemplo de uso:**
  ```typescript
  if (!planHelper.tieneAcceso(usuario, 'exportar')) {
    snackBar.open('Funcionalidad solo para Premium/Pro', 'Mejorar', { duration: 5000 })
      .onAction().subscribe(() => router.navigate(['/upgrade']));
    return;
  }
  ```

---

**Esta lógica debe repetirse en todos los features sujetos a restricciones por plan: pagos, exportación, adjuntos, notificaciones, etc.**

## ¿Qué faltaría para exportar balances, pagos y otros reportes?
- **Backend:**
  - Falta implementar endpoints que generen y devuelvan archivos (Excel/PDF) con los datos de balances y pagos.
  - Se requiere lógica de filtrado, agrupado y formato adecuado para cada tipo de reporte.
- **Frontend:**
  - Falta agregar botones de exportar en los componentes de balances y pagos.
  - Falta consumir los futuros endpoints y gestionar la descarga del archivo.
  - Se deberá aplicar el mismo control de acceso por plan y feedback de upgrade.
- **Documentación:**
  - Especificar para cada reporte su utilidad y alcance cuando se implemente.

> **Nota:** Actualmente, solo el reporte de gastos de grupo es exportable. La exportación de balances y pagos es una mejora pendiente y aún no está implementada en backend ni frontend.
