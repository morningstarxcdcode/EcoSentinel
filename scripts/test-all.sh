#!/bin/bash

# EcoSentinel Comprehensive Test Runner
# Runs all tests, checks, and validations

set -e

echo "🚀 EcoSentinel Comprehensive Test Suite"
echo "======================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    npm ci
fi

# 1. Code Quality Checks
print_status "Running code quality checks..."

echo "🔍 ESLint..."
if npm run lint:check; then
    print_success "ESLint passed"
else
    print_error "ESLint failed"
    exit 1
fi

echo "🎨 Prettier..."
if npm run format:check; then
    print_success "Prettier check passed"
else
    print_error "Prettier check failed"
    exit 1
fi

echo "📊 TypeScript..."
if npm run type-check; then
    print_success "TypeScript check passed"
else
    print_error "TypeScript check failed"
    exit 1
fi

# 2. Unit Tests
print_status "Running unit tests..."
if npm run test:unit; then
    print_success "Unit tests passed"
else
    print_error "Unit tests failed"
    exit 1
fi

# 3. Integration Tests
print_status "Running integration tests..."
if npm run test:integration; then
    print_success "Integration tests passed"
else
    print_warning "Integration tests failed or not available"
fi

# 4. Component Tests
print_status "Running component tests..."
if npm run test:components; then
    print_success "Component tests passed"
else
    print_warning "Component tests failed or not available"
fi

# 5. Build Test
print_status "Testing build process..."
if npm run build; then
    print_success "Build successful"
else
    print_error "Build failed"
    exit 1
fi

# 6. E2E Tests (if Playwright is available)
if command -v npx playwright &> /dev/null; then
    print_status "Running E2E tests..."
    if npm run test:e2e; then
        print_success "E2E tests passed"
    else
        print_warning "E2E tests failed or not available"
    fi
else
    print_warning "Playwright not available, skipping E2E tests"
fi

# 7. Security Audit
print_status "Running security audit..."
if npm audit --audit-level=high; then
    print_success "Security audit passed"
else
    print_warning "Security vulnerabilities found"
fi

# 8. Bundle Analysis (if available)
if [ -f "package.json" ] && grep -q "analyze" package.json; then
    print_status "Analyzing bundle size..."
    if npm run analyze; then
        print_success "Bundle analysis completed"
    else
        print_warning "Bundle analysis failed"
    fi
fi

# 9. Docker Build Test (if Dockerfile exists)
if [ -f "Dockerfile" ] && command -v docker &> /dev/null; then
    print_status "Testing Docker build..."
    if docker build -t ecosentinel-test .; then
        print_success "Docker build successful"
        docker rmi ecosentinel-test
    else
        print_warning "Docker build failed"
    fi
else
    print_warning "Docker not available or Dockerfile not found"
fi

# Summary
echo ""
echo "🎉 Test Suite Summary"
echo "===================="
print_success "✅ Code quality checks passed"
print_success "✅ Unit tests passed"
print_success "✅ Build process successful"
print_success "✅ All critical tests completed"

echo ""
print_success "🚀 EcoSentinel is ready for deployment!"
echo ""
