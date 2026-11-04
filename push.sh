#!/bin/bash
set -e
cd "$(dirname "$0")"
echo "🚀 PrologStudio GitHub'a aktarılıyor..."
git push -u origin main
echo "✅ Başarıyla yüklendi: https://github.com/Ryubio/prolog-studio"
