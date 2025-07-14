# Manual Completo de Usuario y Documentación - DividiFácil

---

## Índice
1. Introducción
2. Guía rápida de uso
3. Flujos principales (con ejemplos)
4. Preguntas frecuentes (FAQ)
5. Instalación y despliegue
6. Diagrama de arquitectura
7. Diagrama de base de datos (ERD)
8. Contacto y soporte

---

## 1. Introducción
DividiFácil es una plataforma para gestionar grupos, gastos compartidos, pagos y recordatorios de manera sencilla y colaborativa.

---

## 2. Guía rápida de uso
- **Iniciar sesión:**
  - Email: prueba@test.com
  - Contraseña: (proporcionada por el admin)
- **Ver grupos:** "Viaje a Bariloche", "Cumpleaños Sofía".
- **Agregar gastos/pagos:** Desde la sección de cada grupo.
- **Ver deudas y movimientos:** En la sección correspondiente de cada grupo.
- **Notificaciones y recordatorios:** Accesibles desde el menú superior.

---

## 3. Flujos principales (con ejemplos)
### Crear grupo
1. Ir a "Grupos" > "Crear grupo".
2. Completar nombre, descripción y agregar miembros (ejemplo: María López, Carlos Gómez).

### Registrar gasto
1. Dentro de un grupo, ir a "Gastos" > "Agregar gasto".
2. Ejemplo: "Alquiler de cabaña", $12.000, pagado por Juan Prueba.

### Registrar pago
1. Ir a "Deudas" o "Pagos" > "Registrar pago".
2. Seleccionar destinatario, monto y adjuntar comprobante si es necesario.

### Ver notificaciones y recordatorios
- Haz clic en la campana o accede a la sección "Recordatorios".

---

## 4. Preguntas frecuentes (FAQ)
- **¿Cómo recupero mi contraseña?**
  - Usa la opción "Olvidé mi contraseña" en la pantalla de login.
- **¿Puedo eliminar un grupo?**
  - Solo el administrador puede eliminarlo desde la configuración del grupo.
- **¿Cómo agrego un nuevo miembro?**
  - Desde la vista del grupo, opción "Agregar miembro".

---

## 5. Instalación y despliegue
### Requisitos
- .NET 6+, Node.js 18+, SQL Server

### Pasos
1. Clona el repositorio.
2. Restaura la base y ejecuta los scripts de carga y validación:
   - `ejecutar_carga_pruebas.ps1` (PowerShell)
3. Levanta el backend:
   - `cd DividiFacil.Backend/DividiFacil.API`
   - `dotnet run`
4. Levanta el frontend:
   - `cd DividiFacil.FrontEnd`
   - `npm install && npm start`

---

## 6. Diagrama de arquitectura

```
[Usuario]
   |
[Frontend Angular] <--> [Backend .NET API] <--> [SQL Server]
```
- El frontend consume la API REST del backend.
- El backend gestiona lógica, seguridad y acceso a datos.
- La base SQL almacena usuarios, grupos, gastos, pagos, etc.

---

## 7. Diagrama de base de datos (ERD simplificado)

```
[Usuarios]---< [MiembrosGrupo] >---[Grupos]
     |                |               |
     |                |               +---< [CajasComunes]
     |                |               +---< [Gastos] >---< [DetallesGasto]
     |                |               +---< [Pagos]
     |                |               +---< [Notificaciones]
     |                |               +---< [Recordatorios]
     |                +---< [Pagos]
     |                +---< [DetallesGasto]
     +---< [ConfiguracionesNotificaciones]
     +---< [MovimientosCaja]
```

---

## 8. Contacto y soporte
- Para dudas técnicas o problemas, contacta a: soporte@dividifacil.com
- Consulta la documentación técnica en la carpeta `/doc` del proyecto.

---

**¡Gracias por usar DividiFácil!**
