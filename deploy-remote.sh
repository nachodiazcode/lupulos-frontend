#!/bin/bash

echo "🚀 Deploying Lúpulos Frontend locally..."

# 📁 Ir al directorio del proyecto
cd /Users/ignaciodiaz/Documents/proyectos/lupulos-api/lupulos-frontend || {
  echo "❌ Project directory not found. Aborting..."
  exit 1
}

# 🌍 Cargar variables de entorno locales
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
else
  echo "⚠️ .env.local file not found. Skipping environment loading..."
fi

# 📦 Instalar dependencias
echo "📦 Installing dependencies..."
npm install || {
  echo "❌ Failed to install dependencies"
  exit 1
}

# 🔧 Build de producción local
echo "🔧 Building project..."
npm run build || {
  echo "❌ Build failed"
  exit 1
}

# 🚀 Ejecutar con PM2
echo "♻️ Starting local frontend with PM2..."
pm2 delete lupulos-frontend-local || true
pm2 start npm --name "lupulos-frontend-local" -- run start

# 💾 Guardar estado de PM2
pm2 save

echo "✅ Lúpulos Frontend is running locally with success!"
