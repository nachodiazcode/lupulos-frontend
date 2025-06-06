#!/bin/bash

echo "🚀 Deploying Lúpulos Frontend..."

# 📁 Ir al directorio correcto
cd /var/www/lupulos-frontend || {
  echo "❌ Directory /var/www/lupulos-frontend not found"
  exit 1
}

echo "📂 Current path: $(pwd)"

# ✅ Cargar variables de entorno
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
else
  echo "⚠️ .env.production not found, continuing without it..."
fi

# 📦 Instalar dependencias
echo "📦 Installing dependencies..."
npm install || {
  echo "❌ npm install failed"
  exit 1
}

# 🔧 Build de producción
echo "🔧 Building project..."
npm run build || {
  echo "❌ Build failed"
  exit 1
}

# ♻️ Iniciar con PM2
echo "♻️ Restarting with PM2..."
pm2 delete lupulos-frontend || true
pm2 start npm --name "lupulos-frontend" -- run start

# 💾 Guardar estado
pm2 save

echo "✅ Deployment successful!"
