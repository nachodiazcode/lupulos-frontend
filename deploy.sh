#!/bin/bash

echo "🚀 Conectando al servidor remoto..."
ssh root@64.23.255.101 << 'EOF'
  cd /var/www/lupulos-frontend || exit

  echo "📥 Haciendo git pull..."
  git pull origin main

  echo "📦 Instalando dependencias..."
  npm install

  echo "🛠️  Compilando producción..."
  npm run build

  echo "📤 Exportando sitio estático..."
  npm run export

  echo "🔁 Reiniciando PM2 (API)..."
  pm2 restart lupulosapp

  echo "🌀 Reiniciando Nginx..."
  sudo systemctl restart nginx

  echo "✅ ¡Despliegue completo!"
EOF
