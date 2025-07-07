# CardComponent (app-card)

Componente de tarjeta visual reutilizable y accesible, con soporte para slots avanzados, variantes visuales, estados y dark mode.

## Props principales
- `title`, `subtitle`, `icon`, `iconColor`, `value`, `loading`, `clickable`, `showAction`, `actionText`, `actionIcon`, `cardClass`
- `variant`: 'default' | 'elevated' | 'flat'
- `color`: 'default' | 'primary' | 'accent' | 'warn'
- `size`: 'sm' | 'md' | 'lg'
- `state`: 'default' | 'error' | 'empty' | 'success'
- `ariaLabel`: string

## Slots disponibles
- `[card-header]`    - Header personalizado
- `[card-error]`     - Estado error
- `[card-empty]`     - Estado vacío
- `[card-success]`   - Estado success
- `[card-loading]`   - Estado loading
- `[card-actions]`   - Acciones personalizadas
- (default)          - Contenido principal

## Ejemplo de uso
```html
<app-card title="Mi tarjeta" [loading]="isLoading" state="error">
  <div card-header>Header personalizado</div>
  <div card-error>¡Ups! Algo salió mal.</div>
  <div card-empty>No hay datos.</div>
  <div card-success>¡Todo ok!</div>
  <div card-loading><app-loading-spinner></app-loading-spinner></div>
  <div>Contenido principal</div>
  <div card-actions><button mat-button>Acción extra</button></div>
</app-card>
```

## Accesibilidad
- Usa `role="region"` y `aria-label`.
- Soporta navegación por teclado y contraste en dark mode.

## Variantes visuales
- Elevación, color, tamaño, estados visuales y microinteracciones.

---
