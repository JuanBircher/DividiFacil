# SkeletonLoaderComponent (app-skeleton-loader)

Componente de skeleton loader reutilizable, accesible y personalizable.

## Props principales
- `type`: 'card' | 'list' | 'text'
- `count`: cantidad de skeletons
- `height`: alto de cada skeleton
- `color`: 'default' | 'dark'
- `variant`: 'default' | 'rounded'

## Slots disponibles
- `[skeleton-custom]` - Skeleton personalizado

## Ejemplo de uso
```html
<app-skeleton-loader type="list" [count]="5" color="dark">
  <div skeleton-custom>Mi skeleton custom</div>
</app-skeleton-loader>
```

## Accesibilidad
- Usa `aria-busy` y `aria-hidden`.
- Compatible con dark mode.

## Variantes visuales
- Card, list, text, dark mode, rounded, custom.

---
