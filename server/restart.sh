#!/usr/bin/env bash
set -euo pipefail

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

nvm use 22


cd /home/$USER/snapsafe/server

git fetch --all --prune
git pull --ff-only

pkill -f node || true

DB_FILE="e2ee.db"
if [ -f "$DB_FILE" ]; then
  rm -f "$DB_FILE"
fi

nohup pnpm start >> /home/$USER/server.cron.log 2>&1
