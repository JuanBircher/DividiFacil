export const environment = {
  production: false,
  apiUrl: 'http://localhost:62734',
  appName: 'DividiFacil',
  version: '1.0.0',
  
  // Configuraciones específicas de desarrollo
  enableDebugMode: true,
  logLevel: 'debug',
  
  // Configuraciones de autenticación
  tokenKey: 'token',
  refreshTokenKey: 'dividifacil_refresh_token',
  
  // Configuraciones de caché
  cacheTimeout: 5 * 60 * 1000, // 5 minutos
  
  // Configuraciones de notificaciones
  notificationTimeout: 5000, // 5 segundos
  
  // Configuraciones de archivos
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  
  // URLs específicas de desarrollo
  websocketUrl: 'ws://localhost:62734/hub/notifications'
};