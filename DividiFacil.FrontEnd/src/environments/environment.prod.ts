export const environment = {
  production: true,
  apiUrl: 'https://http://localhost:62734', // URL de producción
  appName: 'DividiFacil',
  version: '1.0.0',
  
  // Configuraciones específicas de producción
  enableDebugMode: false,
  logLevel: 'error',
  
  // Configuraciones de autenticación
  tokenKey: 'token',
  refreshTokenKey: 'dividifacil_refresh_token',
  
  // Configuraciones de caché
  cacheTimeout: 10 * 60 * 1000, // 10 minutos
  
  // Configuraciones de notificaciones
  notificationTimeout: 3000, // 3 segundos
  
  // Configuraciones de archivos
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  
  // URLs específicas de producción
  websocketUrl: 'wss://api.dividifacil.com/hub/notifications'
};