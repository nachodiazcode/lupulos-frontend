#!/bin/bash

echo "🚀 Deploying Lúpulos Frontend..."

# Ir al directorio del frontend
cd /var/www/lupulos-frontend

# Cargar variables de entorno
export $(cat .env.production | grep -v '^#' | xargs)

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Build de producción
echo "🔧 Generando build..."
npm run build

# Iniciar con PM2
echo "♻️ Iniciando Frontend con PM2..."
pm2 delete lupulos-frontend
pm2 start npm --name "lupulos-frontend" -- run start

# Guardar configuración de PM2
pm2 save

echo "✅ Frontend desplegado correctamente!"
