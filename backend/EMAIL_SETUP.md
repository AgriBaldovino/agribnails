# 📧 Configuración de Notificaciones por Email

## 🚀 Pasos para configurar las notificaciones automáticas

### 1. Instalar dependencias
```bash
cd backend
npm install nodemailer @types/nodemailer
```

### 2. Configurar Gmail para aplicaciones

#### Paso 1: Activar verificación en 2 pasos
- Ve a tu cuenta de Google
- Seguridad → Verificación en 2 pasos → ACTIVAR

#### Paso 2: Generar contraseña de aplicación
- Seguridad → Verificación en 2 pasos → Contraseñas de aplicación
- Selecciona "Otra (nombre personalizado)"
- Escribe "Sistema de Reservas"
- Copia la contraseña generada (16 caracteres)

### 3. Configurar variables de entorno

Crea o edita el archivo `.env` en la carpeta `backend`:

```env
# Configuración de Email (Gmail)
GMAIL_USER=tu-email@gmail.com
GMAIL_APP_PASSWORD=tu-contraseña-de-16-caracteres
ADMIN_EMAIL=admin@tulocal.com
```

**Ejemplo:**
```env
GMAIL_USER=miempresa@gmail.com
GMAIL_APP_PASSWORD=abcd efgh ijkl mnop
ADMIN_EMAIL=miempresa@gmail.com
```

### 4. Reiniciar el servidor
```bash
npm run dev
```

## ✅ ¿Cómo funciona?

1. **Cuando se crea una reserva** → Se envía automáticamente un email al admin
2. **El email incluye:**
   - Nombre y apellido del cliente
   - DNI
   - Fecha y hora del turno
   - Servicio solicitado
   - Diseño profesional y responsive

## 🎨 Personalización

### Cambiar información del negocio
Edita `src/services/emailService.ts` y modifica:
- Dirección del local
- Número de teléfono
- Email de contacto
- Colores y estilos

### Agregar más destinatarios
En el archivo `.env` puedes agregar:
```env
ADMIN_EMAIL=admin@tulocal.com,otro@tulocal.com
```

## 🔧 Endpoints disponibles

- `POST /api/notifications/admin` - Notificación al admin
- `POST /api/notifications/client` - Confirmación al cliente
- `POST /api/notifications/both` - Ambas notificaciones

## 🚨 Solución de problemas

### Error: "Invalid login"
- Verifica que la verificación en 2 pasos esté activada
- Usa la contraseña de aplicación, NO tu contraseña normal

### Error: "Less secure app access"
- Las contraseñas de aplicación son seguras
- No necesitas activar "Acceso de aplicaciones menos seguras"

### No llegan los emails
- Revisa la carpeta de spam
- Verifica que las variables de entorno estén correctas
- Revisa los logs del servidor

## 📱 Próximos pasos (opcionales)

1. **Notificaciones por WhatsApp** usando Twilio
2. **Plantillas de email personalizadas** por servicio
3. **Recordatorios automáticos** 24h antes del turno
4. **Confirmaciones de asistencia** por email

## 🎯 ¡Listo!

Después de seguir estos pasos, cada vez que alguien haga una reserva recibirás un email automático con todos los detalles. ¡No más perderte reservas! 🎉
