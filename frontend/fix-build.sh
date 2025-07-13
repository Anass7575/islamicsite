#!/bin/bash

echo "=== Fixing Al-Hidaya Frontend Build Issues ==="
echo ""

# 1. Clean all caches
echo "1. Cleaning caches..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .eslintcache

# 2. Check for problematic CSS
echo ""
echo "2. Checking CSS files..."
if grep -r "border-border" app/ components/ styles/ 2>/dev/null | grep -v node_modules; then
    echo "Found references to border-border, please fix manually"
else
    echo "No problematic CSS references found ✓"
fi

# 3. Verify package.json
echo ""
echo "3. Verifying package.json..."
if [ -f "package.json" ]; then
    echo "package.json exists ✓"
else
    echo "package.json missing!"
fi

# 4. Install dependencies
echo ""
echo "4. Installing dependencies..."
npm install

# 5. Try to build
echo ""
echo "5. Attempting build..."
npm run build

echo ""
echo "=== Fix complete ==="
echo ""
echo "Next steps:"
echo "1. Run: npm run dev"
echo "2. Check http://localhost:3000"