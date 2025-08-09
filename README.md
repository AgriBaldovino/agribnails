# 🎯 Descuentos App

Una aplicación moderna de descuentos construida con **Vue 3**, **Vuetify**, **Firebase** y **Express**.

## 🚀 Tecnologías Utilizadas

### Frontend
- **Vue 3** - Framework progresivo de JavaScript
- **Vuetify 3** - Framework de componentes Material Design
- **Vue Router** - Enrutamiento oficial de Vue
- **Pinia** - Store de estado para Vue
- **TypeScript** - Tipado estático
- **Vite** - Build tool moderno y rápido

### Backend
- **Express.js** - Framework web para Node.js
- **Firebase Admin** - SDK de Firebase para servidores
- **TypeScript** - Tipado estático
- **CORS** - Middleware para CORS
- **Helmet** - Middleware de seguridad
- **Morgan** - Logger de requests HTTP

### Base de Datos
- **Firebase Firestore** - Base de datos NoSQL en la nube

## 📁 Estructura del Proyecto

```
descuentos/
├── frontend/          # Aplicación Vue 3 + Vuetify
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── stores/
│   │   ├── router/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Servidor Express + Firebase
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── types/
│   ├── package.json
│   └── tsconfig.json
├── shared/            # Tipos y utilidades compartidas
└── package.json       # Scripts del proyecto completo
```

## 🛠️ Instalación y Configuración

### Prerrequisitos
- **Node.js** (versión 18 o superior)
- **npm** o **yarn**
- **Cuenta de Firebase** (opcional para desarrollo)

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd descuentos
```

### 2. Instalar dependencias
```bash
# Instalar todas las dependencias del proyecto
npm run setup

# O instalar por separado:
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 3. Configurar Firebase (Opcional para desarrollo)

Si quieres usar Firebase en producción:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto
3. Habilita Firestore Database
4. Ve a Project Settings > Service Accounts
5. Genera una nueva clave privada
6. Copia el contenido del archivo JSON

### 4. Configurar variables de entorno

#### Backend
Copia el archivo de ejemplo y configura las variables:

```bash
cd backend
cp env.example .env
```

Edita el archivo `.env`:
```env
# Configuración del servidor
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Firebase Configuration (opcional para desarrollo)
FIREBASE_PROJECT_ID=tu-proyecto-firebase
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

#### Frontend (Opcional)
Si quieres configurar Firebase en el frontend:

```bash
cd frontend
cp .env.example .env
```

## 🚀 Ejecutar el Proyecto

### Desarrollo
```bash
# Ejecutar frontend y backend simultáneamente
npm run dev

# O ejecutar por separado:
npm run dev:frontend  # Puerto 3000
npm run dev:backend   # Puerto 5000
```

### Producción
```bash
# Construir ambos proyectos
npm run build

# Ejecutar en producción
cd backend && npm start
```

## 📱 Funcionalidades

### Frontend
- ✅ **Página de inicio** con navegación principal
- ✅ **Lista de descuentos** con filtros y búsqueda
- ✅ **Categorías** de productos
- ✅ **Perfil de usuario** con formulario editable
- ✅ **Diseño responsive** con Vuetify
- ✅ **Navegación** con Vue Router

### Backend
- ✅ **API REST** completa para descuentos, categorías y usuarios
- ✅ **Integración con Firebase** Firestore
- ✅ **Middleware de seguridad** (CORS, Helmet, Rate Limiting)
- ✅ **Manejo de errores** centralizado
- ✅ **Logging** de requests
- ✅ **Datos mock** para desarrollo sin Firebase

## 🔧 Scripts Disponibles

### Scripts Principales
```bash
npm run dev              # Ejecutar frontend y backend en desarrollo
npm run build            # Construir ambos proyectos
npm run setup            # Instalar todas las dependencias
```

### Scripts del Frontend
```bash
npm run dev:frontend     # Ejecutar solo el frontend
npm run build:frontend   # Construir solo el frontend
```

### Scripts del Backend
```bash
npm run dev:backend      # Ejecutar solo el backend
npm run build:backend    # Construir solo el backend
```

## 🌐 URLs de Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📚 Endpoints de la API

### Descuentos
- `GET /api/descuentos` - Obtener todos los descuentos
- `GET /api/descuentos/:id` - Obtener descuento por ID
- `POST /api/descuentos` - Crear nuevo descuento
- `PUT /api/descuentos/:id` - Actualizar descuento
- `DELETE /api/descuentos/:id` - Eliminar descuento

### Categorías
- `GET /api/categorias` - Obtener todas las categorías
- `GET /api/categorias/:id` - Obtener categoría por ID
- `POST /api/categorias` - Crear nueva categoría
- `PUT /api/categorias/:id` - Actualizar categoría
- `DELETE /api/categorias/:id` - Eliminar categoría

### Usuarios
- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/perfil` - Obtener perfil del usuario actual
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `POST /api/usuarios` - Crear nuevo usuario
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

## 🔒 Seguridad

- **CORS** configurado para el frontend
- **Helmet** para headers de seguridad
- **Rate Limiting** para prevenir spam
- **Validación de datos** con Joi
- **Manejo de errores** centralizado

## 🧪 Desarrollo

### Sin Firebase
El proyecto funciona completamente con datos mock para desarrollo. No necesitas configurar Firebase para empezar a desarrollar.

### Con Firebase
1. Configura las variables de entorno
2. El backend automáticamente usará Firebase Firestore
3. Los datos se sincronizarán en tiempo real

## 📝 Próximas Mejoras

- [ ] **Autenticación** con Firebase Auth
- [ ] **Notificaciones push** para nuevos descuentos
- [ ] **Filtros avanzados** por precio, categoría, fecha
- [ ] **Sistema de favoritos** para usuarios
- [ ] **Panel de administración** para gestionar descuentos
- [ ] **Tests unitarios** y de integración
- [ ] **Docker** para containerización
- [ ] **CI/CD** con GitHub Actions

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Busca en los issues existentes
3. Crea un nuevo issue con detalles del problema

---

**¡Disfruta desarrollando con Vue 3, Vuetify y Firebase! 🚀** 