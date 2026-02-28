#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing system dependencies..."
sudo apt-get update && sudo apt-get install -y build-essential git curl python3 ffmpeg

echo "==> Installing Node.js via nvm..."
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm install --lts
nvm use --lts

echo "==> Installing Yarn..."
npm install -g yarn

echo "==> Installing PM2..."
npm install -g pm2

echo "==> Creating ~/app directory..."
[ ! -d "$HOME/app" ] && mkdir "$HOME/app"
cd ~/app

echo "==> Cloning poster repository..."
git clone https://github.com/wavvdev/poster.git
cd poster

echo "==> Installing dependencies..."
yarn install

pm2 start yarn --name "poster" -- start

echo "==> Done. Versions:"
node -v
yarn -v
pm2 -v
