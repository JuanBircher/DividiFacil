# LoadingSpinnerComponent (app-loading-spinner)

Componente de spinner de carga reutilizable, accesible y personalizable.

## Props principales
- `diameter`, `strokeWidth`, `color`, `message`, `showMessage`, `overlay`, `ariaLabel`, `variant`

## Slots disponibles
- `[spinner-icon]`    - Icono personalizado
- `[spinner-message]` - Mensaje personalizado

## Ejemplo de uso
```html
<app-loading-spinner [overlay]="true" ariaLabel="Cargando datos...">
  <div spinner-icon><mat-icon>hourglass_empty</mat-icon></div>
  <div spinner-message>Cargando información...</div>
</app-loading-spinner>
```

## Accesibilidad
- Usa `role="status"` y `aria-label`.
- Compatible con dark mode.

## Variantes visuales
- Overlay, centered, inline, dark mode, microinteracciones.

---
