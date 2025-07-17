export const environment = {
  production: false,
  apiUrl: 'http://localhost:62734',
  appName: 'DividiFacil',
  version: '1.0.0',
  firebase: {
    apiKey: 'AIzaSyAnp4dlsJ0AHz_pV7fXnb59Fw_sOkgH76o',
    authDomain: 'dividifacil.firebaseapp.com',
    projectId: 'dividifacil',
    storageBucket: 'dividifacil.firebasestorage.app',
    messagingSenderId: '573246144216',
    appId: '1:573246144216:web:a135d13eb08966481821ad',
    vapidKey: 'BEU9htYE0QmQd8MbOuQMqd0OnRqvja2Z663SF7aDdtm4maYbaQQ80iN_r2QVF5YkfDnVjZzvo7_HIEnQnn7Ivm4'
    },
  
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