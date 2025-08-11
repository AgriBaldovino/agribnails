# Script para crear índices de Firestore
Write-Host "Creando índices de Firestore..." -ForegroundColor Green

# Verificar que Firebase CLI esté instalado
try {
    $firebaseVersion = firebase --version
    Write-Host "Firebase CLI encontrado: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "Error: Firebase CLI no está instalado o no está en el PATH" -ForegroundColor Red
    Write-Host "Instala Firebase CLI con: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

# Verificar que estés logueado en Firebase
try {
    $currentUser = firebase projects:list
    if ($currentUser -match "agribnails") {
        Write-Host "Proyecto agribnails encontrado" -ForegroundColor Green
    } else {
        Write-Host "No estás logueado en el proyecto agribnails" -ForegroundColor Yellow
        Write-Host "Ejecuta: firebase login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Error al verificar el proyecto de Firebase" -ForegroundColor Red
    exit 1
}

# Crear los índices
Write-Host "Desplegando índices de Firestore..." -ForegroundColor Yellow
try {
    firebase deploy --only firestore:indexes --project agribnails
    Write-Host "¡Índices creados exitosamente!" -ForegroundColor Green
} catch {
    Write-Host "Error al crear los índices" -ForegroundColor Red
    Write-Host "Verifica que tengas permisos de administrador en el proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host "Proceso completado. Los índices pueden tardar varios minutos en estar disponibles." -ForegroundColor Green
