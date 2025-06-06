#!/bin/bash

echo "🚀 Desplegando Lúpulos Frontend localmente..."

# Cargar variables de entorno
export $(cat .env.local | grep -v '^#' | xargs)

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Generar build local
echo "🔧 Generando build..."
npm run build

# Iniciar con PM2
echo "♻️ Iniciando Frontend con PM2 local..."
pm2 delete lupulos-frontend-local || true
pm2 start npm --name "lupulos-frontend-local" -- run start

# Guardar proceso en PM2
pm2 save

echo "✅ Frontend local corriendo con éxito!"
