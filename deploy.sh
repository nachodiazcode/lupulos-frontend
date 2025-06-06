#!/bin/bash

echo "🚀 Conectando al servidor remoto..."
ssh root@64.23.255.101 << 'EOF'
  cd /var/www/lupulos-frontend || exit

  echo "📥 Haciendo git pull..."
  git pull origin main

  echo "📦 Instalando dependencias..."
  npm install

  echo "🛠️  Compilando producción (Next.js export)..."
  npm run build

  echo "🔁 Reiniciando API con PM2..."
  pm2 restart lupulos-api

  echo "🌀 Reiniciando Nginx..."
  sudo systemctl restart nginx

  echo "✅ ¡Despliegue completo!"
EOF
