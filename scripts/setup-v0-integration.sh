#!/bin/bash

# Setup script for v0.dev integration
# This script sets up the component structure and installs dependencies

set -e

echo "🚀 Setting up v0.dev integration..."

cd "$(dirname "$0")/../apps/web"

# Create component directories
echo "📁 Creating component directories..."
mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/product
mkdir -p components/category
mkdir -p components/search

# Install shadcn/ui dependencies
echo "📦 Installing shadcn/ui dependencies..."
npm install @radix-ui/react-accordion \
  @radix-ui/react-dialog \
  @radix-ui/react-dropdown-menu \
  @radix-ui/react-select \
  @radix-ui/react-tabs \
  @radix-ui/react-toast \
  @radix-ui/react-checkbox \
  @radix-ui/react-slider \
  lucide-react \
  clsx \
  tailwind-merge

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review docs/v0-integration-guide.md"
echo "2. Copy your v0.dev components to the components/ directory"
echo "3. Follow the integration checklist in the guide"
echo ""
echo "To add shadcn/ui components, run:"
echo "  npx shadcn-ui@latest add [component-name]"

