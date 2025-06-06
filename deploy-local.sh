#!/bin/bash

echo "🚀 Deploying Lúpulos Frontend..."

# ✅ Ir al directorio del frontend
cd /var/www/lupulos-frontend || {
  echo "❌ No se pudo acceder a /var/www/lupulos-frontend"
  exit 1
}

# 📁 Mostrar en qué ruta estamos (debug útil)
echo "📂 Ubicación actual: $(pwd)"

# ✅ Cargar variables de entorno
if [ -f .env.production ]; then
  export $(cat .env.production | grep -v '^#' | xargs)
else
  echo "⚠️ No se encontró .env.production. Abortando..."
  exit 1
fi

# ✅ Instalar dependencias
echo "📦 Instalando dependencias..."
npm install || {
  echo "❌ Error al instalar dependencias"
  exit 1
}

# ✅ Generar build de producción
echo "🔧 Generando build..."
npm run build || {
  echo "❌ Error al generar el build"
  exit 1
}

# ✅ Iniciar con PM2
echo "♻️ Iniciando Frontend con PM2..."
pm2 delete lupulos-frontend || true
pm2 start npm --name "lupulos-frontend" -- run start

# ✅ Guardar configuración de PM2
pm2 save

echo "✅ Frontend desplegado correctamente!"
