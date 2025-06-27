# 🚀 **EcoSentinel Installation Guide**

This guide provides step-by-step instructions for different types of users to install and run EcoSentinel.

---

## 👥 **Choose Your Installation Method**

- [🚀 Quick Start (5 minutes)](#-quick-start-5-minutes)
- [💻 Developer Setup](#-developer-setup)
- [🏢 Organization Deployment](#-organization-deployment)
- [🐳 Docker Installation](#-docker-installation)
- [☁️ Cloud Deployment](#️-cloud-deployment)

---

## 🚀 **Quick Start (5 minutes)**

**Perfect for: Trying out EcoSentinel quickly**

### **Prerequisites**
- Node.js 18+ ([Download here](https://nodejs.org/))
- Git ([Download here](https://git-scm.com/))

### **Steps**
```bash
# 1. Clone the repository
git clone https://github.com/morningstarxcdcode/ecosentinel.git
cd ecosentinel

# 2. Install dependencies
npm install

# 3. Set up environment (use demo keys)
cp .env.example .env.local

# 4. Start the application
npm run dev

# 5. Open in browser
# http://localhost:3000
```

**🎉 Done! EcoSentinel is running with demo data.**

---

## 💻 **Developer Setup**

**Perfect for: Developers who want to contribute or customize**

### **Prerequisites**
- Node.js 18+ and npm
- Python 3.9+ and pip
- PostgreSQL 13+
- Redis 6+
- Git

### **Step 1: System Dependencies**

**macOS:**
```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install node python postgresql redis git
brew services start postgresql
brew services start redis
```

**Ubuntu/Debian:**
```bash
# Update package list
sudo apt update

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install other dependencies
sudo apt-get install -y python3 python3-pip postgresql postgresql-contrib redis-server git

# Start services
sudo systemctl start postgresql
sudo systemctl start redis-server
sudo systemctl enable postgresql
sudo systemctl enable redis-server
```

**Windows:**
```powershell
# Install using Chocolatey (run as Administrator)
choco install nodejs python postgresql redis-64 git

# Or download individually:
# Node.js: https://nodejs.org/
# Python: https://python.org/
# PostgreSQL: https://postgresql.org/
# Redis: https://redis.io/
```

### **Step 2: Clone and Setup**
```bash
# Clone repository
git clone https://github.com/morningstarxcdcode/ecosentinel.git
cd ecosentinel

# Install Node.js dependencies
npm install

# Install Python dependencies
pip install -r ai/requirements.txt
```

### **Step 3: Database Setup**
```bash
# Create PostgreSQL user and database
sudo -u postgres psql
CREATE USER ecosentinel WITH PASSWORD 'your_password';
CREATE DATABASE ecosentinel OWNER ecosentinel;
GRANT ALL PRIVILEGES ON DATABASE ecosentinel TO ecosentinel;
\q

# Run database migrations
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### **Step 4: Environment Configuration**
```bash
# Copy environment template
cp .env.example .env.local

# Edit with your settings
nano .env.local
```

**Required Configuration:**
```env
# Database
DATABASE_URL=postgresql://ecosentinel:your_password@localhost:5432/ecosentinel
REDIS_URL=redis://localhost:6379

# Get free API keys:
OPENWEATHER_API_KEY=get_from_openweathermap.org
OPENAI_API_KEY=get_from_openai.com

# Generate secure JWT secret
JWT_SECRET=your_super_secure_random_string_here

# App settings
NODE_ENV=development
PORT=3000
API_PORT=8000
AI_SERVICE_PORT=5000
```

### **Step 5: Start Development Environment**
```bash
# Start all services
npm run dev:all

# Or start individually in separate terminals:
npm run dev          # Frontend (port 3000)
npm run server       # API server (port 8000)
npm run ai-service   # AI service (port 5000)
npm run websocket    # WebSocket server (port 8001)
```

### **Step 6: Verify Installation**
- **Frontend**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin
- **API Health**: http://localhost:8000/health
- **WebSocket Stats**: http://localhost:8001/stats

---

## 🏢 **Organization Deployment**

**Perfect for: Organizations wanting to deploy EcoSentinel for their team**

### **Prerequisites**
- Linux server (Ubuntu 20.04+ recommended)
- Domain name (optional)
- SSL certificate (Let's Encrypt recommended)

### **Step 1: Server Preparation**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y curl wget gnupg2 software-properties-common

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Redis
sudo apt install -y redis-server

# Install Nginx (for reverse proxy)
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

### **Step 2: Database Setup**
```bash
# Configure PostgreSQL
sudo -u postgres psql
CREATE USER ecosentinel WITH PASSWORD 'secure_production_password';
CREATE DATABASE ecosentinel OWNER ecosentinel;
GRANT ALL PRIVILEGES ON DATABASE ecosentinel TO ecosentinel;
\q

# Configure Redis (optional security)
sudo nano /etc/redis/redis.conf
# Uncomment: requirepass your_redis_password
sudo systemctl restart redis
```

### **Step 3: Application Deployment**
```bash
# Create application directory
sudo mkdir -p /var/www/ecosentinel
sudo chown $USER:$USER /var/www/ecosentinel

# Clone and setup
cd /var/www/ecosentinel
git clone https://github.com/morningstarxcdcode/ecosentinel.git .
npm install
pip3 install -r ai/requirements.txt

# Build for production
npm run build
```

### **Step 4: Environment Configuration**
```bash
# Create production environment file
sudo nano /var/www/ecosentinel/.env.production

# Add production settings:
NODE_ENV=production
DATABASE_URL=postgresql://ecosentinel:secure_production_password@localhost:5432/ecosentinel
REDIS_URL=redis://localhost:6379
JWT_SECRET=very_secure_production_jwt_secret
PORT=3000
API_PORT=8000
CORS_ORIGIN=https://your-domain.com
```

### **Step 5: Process Management**
```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'ecosentinel-frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      }
    },
    {
      name: 'ecosentinel-api',
      script: 'server/index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8000
      }
    },
    {
      name: 'ecosentinel-websocket',
      script: 'server/websocket-server.js',
      env: {
        NODE_ENV: 'production',
        PORT: 8001
      }
    },
    {
      name: 'ecosentinel-ai',
      script: 'python3',
      args: 'ai/main.py',
      env: {
        PORT: 5000
      }
    }
  ]
};
EOF

# Start applications
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Step 6: Nginx Configuration**
```bash
# Create Nginx configuration
sudo nano /etc/nginx/sites-available/ecosentinel

# Add configuration:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/ecosentinel /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### **Step 7: SSL Certificate (Optional)**
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🐳 **Docker Installation**

**Perfect for: Easy deployment with containers**

### **Prerequisites**
- Docker and Docker Compose
- 4GB+ RAM recommended

### **Step 1: Install Docker**

**Linux:**
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

**macOS:**
```bash
# Install Docker Desktop
brew install --cask docker
# Start Docker Desktop from Applications
```

**Windows:**
```powershell
# Install Docker Desktop
choco install docker-desktop
# Or download from: https://docker.com/products/docker-desktop
```

### **Step 2: Clone and Configure**
```bash
# Clone repository
git clone https://github.com/morningstarxcdcode/ecosentinel.git
cd ecosentinel

# Copy environment file
cp .env.example .env

# Edit environment variables
nano .env
```

### **Step 3: Start with Docker Compose**
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### **Step 4: Access Application**
- **Frontend**: http://localhost:3000
- **Admin**: http://localhost:3000/admin
- **API**: http://localhost:8000
- **Grafana**: http://localhost:3001

### **Docker Management Commands**
```bash
# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# View logs for specific service
docker-compose logs -f app

# Execute commands in container
docker-compose exec app bash

# Update services
docker-compose pull
docker-compose up -d
```

---

## ☁️ **Cloud Deployment**

### **🚀 Vercel (Recommended for Frontend)**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Add your API keys and database URLs
```

### **🌊 DigitalOcean App Platform**

1. Fork the repository on GitHub
2. Connect to DigitalOcean App Platform
3. Configure environment variables
4. Deploy automatically

### **☁️ AWS Deployment**

```bash
# Install AWS CLI
pip install awscli

# Configure AWS credentials
aws configure

# Deploy using AWS Copilot
copilot app init ecosentinel
copilot env init --name production
copilot svc init --name frontend
copilot svc deploy --name frontend --env production
```

### **🔵 Azure Container Instances**

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login and deploy
az login
az container create --resource-group myResourceGroup --name ecosentinel --image your-registry/ecosentinel:latest
```

---

## 🔧 **Troubleshooting**

### **Common Issues**

**Port Already in Use:**
```bash
# Find and kill process
sudo lsof -i :3000
sudo kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**Database Connection Error:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql

# Check connection
psql -h localhost -U ecosentinel -d ecosentinel
```

**Permission Errors:**
```bash
# Fix npm permissions
sudo chown -R $USER:$USER ~/.npm
sudo chown -R $USER:$USER node_modules

# Fix file permissions
sudo chown -R $USER:$USER /var/www/ecosentinel
```

**Memory Issues:**
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

### **Getting Help**

1. **Check Logs:**
   ```bash
   # Application logs
   npm run logs
   
   # Docker logs
   docker-compose logs -f
   
   # System logs
   sudo journalctl -u ecosentinel
   ```

2. **Health Checks:**
   ```bash
   # API health
   curl http://localhost:8000/health
   
   # Database connection
   npm run db:check
   
   # Redis connection
   redis-cli ping
   ```

3. **Support Channels:**
   - 📖 [Documentation](https://github.com/morningstarxcdcode/ecosentinel/wiki)
   - 🐛 [GitHub Issues](https://github.com/morningstarxcdcode/ecosentinel/issues)
   - 💬 [Slack Community](https://stackoverflowteams.com/c/morningstarxcdcode/users/1/)
   - 📧 Email: [morningstar.xcd@gmail.com](mailto:morningstar.xcd@gmail.com)
   - 💼 LinkedIn: [Sourav Rajak](https://www.linkedin.com/in/sourav-rajak-6294682b2/)

---

## ✅ **Post-Installation Checklist**

- [ ] Application starts without errors
- [ ] Database connection working
- [ ] Redis connection working
- [ ] All API endpoints responding
- [ ] WebSocket connection established
- [ ] Admin dashboard accessible
- [ ] Environment variables configured
- [ ] SSL certificate installed (production)
- [ ] Monitoring setup (production)
- [ ] Backup strategy implemented (production)

---

## 🔄 **Updates and Maintenance**

### **Updating EcoSentinel**
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install
pip install -r ai/requirements.txt

# Run database migrations
npm run db:migrate

# Rebuild and restart
npm run build
pm2 restart all  # or docker-compose up -d --build
```

### **Backup Strategy**
```bash
# Database backup
pg_dump ecosentinel > backup_$(date +%Y%m%d).sql

# Application backup
tar -czf ecosentinel_backup_$(date +%Y%m%d).tar.gz /var/www/ecosentinel

# Automated backups (add to crontab)
0 2 * * * /path/to/backup_script.sh
```

---

**🎉 Congratulations! EcoSentinel is now installed and ready to help monitor our planet! 🌍**

For additional help, visit our [documentation](https://github.com/morningstarxcdcode/ecosentinel/wiki) or join our [community](https://discord.gg/ecosentinel).
