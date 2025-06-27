#!/bin/bash

# 🧪 EcoSentinel CI Fix Verification Script
# This script verifies that the husky CI error has been resolved

echo "🔍 EcoSentinel CI Fix Verification"
echo "=================================="
echo ""

# Check if husky is in devDependencies
echo "1️⃣ Checking if husky is in devDependencies..."
if grep -q '"husky"' package.json; then
    HUSKY_VERSION=$(grep '"husky"' package.json | cut -d'"' -f4)
    echo "✅ Husky found: $HUSKY_VERSION"
else
    echo "❌ Husky not found in package.json"
    exit 1
fi

# Check if prepare script exists (should be removed)
echo ""
echo "2️⃣ Checking if deprecated prepare script exists..."
if grep -q '"prepare".*husky' package.json; then
    echo "❌ Found deprecated prepare script with husky"
    grep '"prepare"' package.json
    echo "   This should be removed to prevent CI errors"
    exit 1
else
    echo "✅ No deprecated husky prepare script found"
fi

# Test npm ci installation
echo ""
echo "3️⃣ Testing npm ci installation..."
rm -rf node_modules package-lock.json 2>/dev/null
if HUSKY=0 npm ci --legacy-peer-deps --silent; then
    echo "✅ npm ci completed successfully"
else
    echo "❌ npm ci failed"
    exit 1
fi

# Test that husky is available after installation
echo ""
echo "4️⃣ Testing husky availability..."
if npx husky --version >/dev/null 2>&1; then
    INSTALLED_VERSION=$(npx husky --version)
    echo "✅ Husky available: $INSTALLED_VERSION"
else
    echo "⚠️  Husky not available via npx (this is OK in CI)"
fi

# Check workflow files for HUSKY=0
echo ""
echo "5️⃣ Checking CI workflows for HUSKY=0..."
WORKFLOW_COUNT=0
for workflow in .github/workflows/*.yml; do
    if grep -q "HUSKY.*0" "$workflow"; then
        echo "✅ $workflow has HUSKY=0"
        ((WORKFLOW_COUNT++))
    fi
done

if [ $WORKFLOW_COUNT -eq 0 ]; then
    echo "⚠️  No workflows found with HUSKY=0 (should be added to main CI workflows)"
fi

# Test build process
echo ""
echo "6️⃣ Testing build process..."
if npm run build >/dev/null 2>&1; then
    echo "✅ Build completed successfully"
else
    echo "❌ Build failed"
    exit 1
fi

# Test lint process
echo ""
echo "7️⃣ Testing lint process..."
if npm run lint >/dev/null 2>&1; then
    echo "✅ Lint completed successfully"
else
    echo "⚠️  Lint issues found (this is OK for verification)"
fi

echo ""
echo "🎉 CI Fix Verification Complete!"
echo "================================"
echo ""
echo "✅ Husky is properly installed as devDependency"
echo "✅ No deprecated prepare scripts found"
echo "✅ npm ci works without husky errors"
echo "✅ Build process works correctly"
echo ""
echo "🚀 GitHub Actions should now run successfully!"
echo ""
echo "Next steps:"
echo "- Push these changes to GitHub"
echo "- Check GitHub Actions workflows run without errors"
echo "- Verify GitHub Pages deployment works"
echo ""
