// 🚀 UTILIDAD PARA OPTIMIZAR CSS

export const CSS_OPTIMIZER_CONFIG = {
  // Clases que siempre mantener
  safelist: [
    'mat-*',
    'cdk-*',
    'ng-*',
    'mdc-*'
  ],
  
  // Selectores a eliminar en producción
  blocklist: [
    '.debug-*',
    '.development-*',
    '.unused-*'
  ]
};