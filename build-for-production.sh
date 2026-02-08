#!/bin/bash

echo "🚀 Building Frontend for Production..."
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building..."
npm run build

echo "✅ Build complete! Build artifacts are in frontend/build/"
echo ""
echo "📤 Next steps:"
echo "1. Deploy to Netlify:"
echo "   - Go to netlify.com and sign in"
echo "   - Drag and drop the 'frontend/build' folder"
echo "   - Or use GitHub integration (recommended)"
echo ""
echo "2. Or deploy using Netlify CLI:"
echo "   npm install -g netlify-cli"
echo "   netlify deploy --prod --dir=frontend/build"
