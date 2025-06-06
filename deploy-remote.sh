#!/bin/bash

echo "🚀 Conectando al servidor remoto..."

ssh -tt root@64.23.255.101 << 'EOF'
  echo "📁 Entrando al directorio del frontend..."
  cd /var/www/lupulos-frontend

  echo "🔄 Haciendo git pull..."
  git pull origin main

  echo "📦 Instalando dependencias..."
  npm install

  echo "🔧 Generando build de producción..."
  npm run build

  echo "♻️ Reiniciando Frontend con PM2..."
  pm2 delete lupulos-frontend || true
  pm2 start npm --name "lupulos-frontend" -- run start

  echo "💾 Guardando configuración de PM2..."
  pm2 save

  echo "✅ ¡Deploy completado en el servidor remoto!"
EOF
