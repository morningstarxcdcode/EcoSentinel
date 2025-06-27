#!/bin/bash

# EcoSentinel Setup Script
# This script helps users set up EcoSentinel quickly and easily

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to get OS
get_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        echo "linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "windows"
    else
        echo "unknown"
    fi
}

# Main setup function
main() {
    print_header "🌍 EcoSentinel Setup Script"
    echo "This script will help you set up EcoSentinel on your system."
    echo ""

    # Detect OS
    OS=$(get_os)
    print_status "Detected OS: $OS"

    # Check prerequisites
    print_header "📋 Checking Prerequisites..."
    
    # Check Node.js
    if command_exists node; then
        NODE_VERSION=$(node --version)
        print_status "Node.js found: $NODE_VERSION"
        
        # Check if version is 18 or higher
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warning "Node.js version 18+ is recommended. Current: $NODE_VERSION"
        fi
    else
        print_error "Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
        exit 1
    fi

    # Check npm
    if command_exists npm; then
        NPM_VERSION=$(npm --version)
        print_status "npm found: $NPM_VERSION"
    else
        print_error "npm not found. Please install npm."
        exit 1
    fi

    # Check Python
    if command_exists python3; then
        PYTHON_VERSION=$(python3 --version)
        print_status "Python found: $PYTHON_VERSION"
    else
        print_warning "Python 3.9+ not found. AI features may not work."
    fi

    # Check Git
    if command_exists git; then
        print_status "Git found"
    else
        print_error "Git not found. Please install Git."
        exit 1
    fi

    # Install dependencies
    print_header "📦 Installing Dependencies..."
    
    print_status "Installing Node.js dependencies..."
    npm install
    
    if [ $? -eq 0 ]; then
        print_status "Node.js dependencies installed successfully"
    else
        print_error "Failed to install Node.js dependencies"
        exit 1
    fi

    # Install Python dependencies if Python is available
    if command_exists python3 && command_exists pip3; then
        print_status "Installing Python dependencies..."
        pip3 install -r ai/requirements.txt
        
        if [ $? -eq 0 ]; then
            print_status "Python dependencies installed successfully"
        else
            print_warning "Failed to install Python dependencies. AI features may not work."
        fi
    fi

    # Setup environment file
    print_header "⚙️ Setting up Environment..."
    
    if [ ! -f .env.local ]; then
        print_status "Creating environment file..."
        cp .env.example .env.local
        print_status "Environment file created at .env.local"
        print_warning "Please edit .env.local with your API keys and configuration"
    else
        print_status "Environment file already exists"
    fi

    # Check for database
    print_header "🗄️ Database Setup..."
    
    if command_exists psql; then
        print_status "PostgreSQL found"
        
        read -p "Do you want to create the database now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Creating database..."
            
            # Try to create database
            createdb ecosentinel 2>/dev/null || print_warning "Database may already exist or you may need to configure PostgreSQL"
            
            print_status "Running database migrations..."
            npm run db:migrate 2>/dev/null || print_warning "Database migrations failed. Please check your database configuration."
        fi
    else
        print_warning "PostgreSQL not found. You'll need to install and configure PostgreSQL for full functionality."
        print_status "For demo purposes, you can still run the application with mock data."
    fi

    # Check for Redis
    if command_exists redis-cli; then
        print_status "Redis found"
    else
        print_warning "Redis not found. Caching features will be disabled."
    fi

    # Build the application
    print_header "🔨 Building Application..."
    
    print_status "Building EcoSentinel..."
    npm run build
    
    if [ $? -eq 0 ]; then
        print_status "Build completed successfully"
    else
        print_error "Build failed. Please check the error messages above."
        exit 1
    fi

    # Final instructions
    print_header "🎉 Setup Complete!"
    echo ""
    print_status "EcoSentinel has been set up successfully!"
    echo ""
    echo "Next steps:"
    echo "1. Edit .env.local with your API keys"
    echo "2. Start the development server: npm run dev"
    echo "3. Open http://localhost:3000 in your browser"
    echo ""
    echo "For production deployment:"
    echo "1. Configure your production environment"
    echo "2. Run: npm run build && npm start"
    echo ""
    echo "For Docker deployment:"
    echo "1. Run: docker-compose up -d"
    echo ""
    print_status "Documentation: https://github.com/your-username/ecosentinel/wiki"
    print_status "Support: https://discord.gg/ecosentinel"
    echo ""
    print_header "🌱 Thank you for helping monitor our planet!"
}

# Run main function
main "$@"
