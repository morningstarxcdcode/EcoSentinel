#!/bin/bash

# EcoSentinel Security Hardening Script
# This script applies security hardening measures to the system

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   echo -e "${RED}This script should not be run as root for security reasons${NC}"
   exit 1
fi

echo -e "${GREEN}EcoSentinel Security Hardening Script${NC}"
echo "======================================"

# Update system packages
harden_system() {
    echo -e "${BLUE}Updating system packages...${NC}"
    
    if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update && sudo apt-get upgrade -y
        sudo apt-get install -y fail2ban ufw rkhunter chkrootkit
    elif command -v yum >/dev/null 2>&1; then
        sudo yum update -y
        sudo yum install -y fail2ban firewalld rkhunter
    elif command -v brew >/dev/null 2>&1; then
        brew update && brew upgrade
    fi
}

# Configure firewall
setup_firewall() {
    echo -e "${BLUE}Configuring firewall...${NC}"
    
    if command -v ufw >/dev/null 2>&1; then
        sudo ufw --force reset
        sudo ufw default deny incoming
        sudo ufw default allow outgoing
        
        # Allow SSH (change port if needed)
        sudo ufw allow 22/tcp
        
        # Allow HTTP and HTTPS
        sudo ufw allow 80/tcp
        sudo ufw allow 443/tcp
        
        # Allow EcoSentinel specific ports
        sudo ufw allow 3000/tcp  # Next.js dev server
        sudo ufw allow 5432/tcp  # PostgreSQL (restrict to localhost)
        sudo ufw allow 6379/tcp  # Redis (restrict to localhost)
        
        # Enable firewall
        sudo ufw --force enable
        
        echo -e "${GREEN}Firewall configured successfully${NC}"
    fi
}

# Configure fail2ban
setup_fail2ban() {
    echo -e "${BLUE}Configuring fail2ban...${NC}"
    
    if command -v fail2ban-client >/dev/null 2>&1; then
        # Create custom jail for EcoSentinel
        sudo tee /etc/fail2ban/jail.d/ecosentinel.conf > /dev/null <<EOF
[ecosentinel-auth]
enabled = true
port = http,https
filter = ecosentinel-auth
logpath = /var/log/ecosentinel/auth.log
maxretry = 5
bantime = 3600
findtime = 600

[ecosentinel-api]
enabled = true
port = http,https
filter = ecosentinel-api
logpath = /var/log/ecosentinel/api.log
maxretry = 10
bantime = 1800
findtime = 300
EOF

        # Create custom filters
        sudo mkdir -p /etc/fail2ban/filter.d
        
        sudo tee /etc/fail2ban/filter.d/ecosentinel-auth.conf > /dev/null <<EOF
[Definition]
failregex = ^.*Authentication failed for user.*from <HOST>.*$
            ^.*Invalid login attempt from <HOST>.*$
            ^.*Failed authentication from <HOST>.*$
ignoreregex =
EOF

        sudo tee /etc/fail2ban/filter.d/ecosentinel-api.conf > /dev/null <<EOF
[Definition]
failregex = ^.*API rate limit exceeded from <HOST>.*$
            ^.*Unauthorized API access from <HOST>.*$
            ^.*Suspicious API activity from <HOST>.*$
ignoreregex =
EOF

        sudo systemctl restart fail2ban
        echo -e "${GREEN}Fail2ban configured successfully${NC}"
    fi
}

# Secure SSH configuration
secure_ssh() {
    echo -e "${BLUE}Securing SSH configuration...${NC}"
    
    if [[ -f /etc/ssh/sshd_config ]]; then
        # Backup original config
        sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
        
        # Apply security settings
        sudo sed -i 's/#PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
        sudo sed -i 's/#PasswordAuthentication yes/PasswordAuthentication no/' /etc/ssh/sshd_config
        sudo sed -i 's/#PubkeyAuthentication yes/PubkeyAuthentication yes/' /etc/ssh/sshd_config
        sudo sed -i 's/#Protocol 2/Protocol 2/' /etc/ssh/sshd_config
        
        # Add additional security settings
        echo "MaxAuthTries 3" | sudo tee -a /etc/ssh/sshd_config
        echo "ClientAliveInterval 300" | sudo tee -a /etc/ssh/sshd_config
        echo "ClientAliveCountMax 2" | sudo tee -a /etc/ssh/sshd_config
        echo "X11Forwarding no" | sudo tee -a /etc/ssh/sshd_config
        echo "AllowUsers $(whoami)" | sudo tee -a /etc/ssh/sshd_config
        
        sudo systemctl restart sshd
        echo -e "${GREEN}SSH secured successfully${NC}"
    fi
}

# Set up log monitoring
setup_logging() {
    echo -e "${BLUE}Setting up enhanced logging...${NC}"
    
    # Create log directories
    sudo mkdir -p /var/log/ecosentinel
    sudo chown $(whoami):$(whoami) /var/log/ecosentinel
    
    # Configure rsyslog for EcoSentinel
    sudo tee /etc/rsyslog.d/ecosentinel.conf > /dev/null <<EOF
# EcoSentinel logging configuration
local0.*    /var/log/ecosentinel/app.log
local1.*    /var/log/ecosentinel/auth.log
local2.*    /var/log/ecosentinel/api.log
local3.*    /var/log/ecosentinel/security.log
EOF

    sudo systemctl restart rsyslog
    echo -e "${GREEN}Logging configured successfully${NC}"
}

# Secure file permissions
secure_permissions() {
    echo -e "${BLUE}Securing file permissions...${NC}"
    
    # Secure application directory
    find . -type f -name "*.js" -exec chmod 644 {} \;
    find . -type f -name "*.ts" -exec chmod 644 {} \;
    find . -type f -name "*.json" -exec chmod 644 {} \;
    find . -type f -name "*.md" -exec chmod 644 {} \;
    find . -type d -exec chmod 755 {} \;
    
    # Secure scripts
    find ./scripts -type f -name "*.sh" -exec chmod 750 {} \;
    
    # Secure environment files
    find . -name ".env*" -exec chmod 600 {} \; 2>/dev/null || true
    
    # Secure Docker files
    find . -name "Dockerfile*" -exec chmod 644 {} \;
    find . -name "docker-compose*.yml" -exec chmod 644 {} \;
    
    echo -e "${GREEN}File permissions secured${NC}"
}

# Install security tools
install_security_tools() {
    echo -e "${BLUE}Installing security tools...${NC}"
    
    # Install Node.js security tools
    if command -v npm >/dev/null 2>&1; then
        npm install -g npm-audit-resolver
        npm install -g snyk
        npm install --save-dev @types/bcrypt
        npm install --save-dev helmet
        npm install --save-dev express-rate-limit
        npm install --save-dev express-validator
    fi
    
    # Install Python security tools
    if command -v pip3 >/dev/null 2>&1; then
        pip3 install --user bandit safety
    fi
    
    echo -e "${GREEN}Security tools installed${NC}"
}

# Set up automated security scans
setup_security_scans() {
    echo -e "${BLUE}Setting up automated security scans...${NC}"
    
    # Create cron job for security monitoring
    (crontab -l 2>/dev/null; echo "0 */6 * * * /bin/bash $(pwd)/scripts/security-monitor.sh") | crontab -
    
    # Create cron job for dependency updates
    (crontab -l 2>/dev/null; echo "0 2 * * 1 cd $(pwd) && npm audit fix && npm update") | crontab -
    
    # Create cron job for system updates
    (crontab -l 2>/dev/null; echo "0 3 * * 0 sudo apt-get update && sudo apt-get upgrade -y") | crontab -
    
    echo -e "${GREEN}Automated security scans configured${NC}"
}

# Configure system limits
configure_limits() {
    echo -e "${BLUE}Configuring system security limits...${NC}"
    
    # Configure limits.conf
    sudo tee -a /etc/security/limits.conf > /dev/null <<EOF
# EcoSentinel security limits
* soft nofile 65536
* hard nofile 65536
* soft nproc 32768
* hard nproc 32768
EOF

    # Configure sysctl for security
    sudo tee /etc/sysctl.d/99-ecosentinel-security.conf > /dev/null <<EOF
# EcoSentinel security settings
net.ipv4.conf.all.rp_filter = 1
net.ipv4.conf.default.rp_filter = 1
net.ipv4.icmp_echo_ignore_broadcasts = 1
net.ipv4.icmp_ignore_bogus_error_responses = 1
net.ipv4.tcp_syncookies = 1
net.ipv4.conf.all.log_martians = 1
net.ipv4.conf.default.log_martians = 1
net.ipv4.conf.all.accept_source_route = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.default.accept_redirects = 0
net.ipv4.conf.all.secure_redirects = 0
net.ipv4.conf.default.secure_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.send_redirects = 0
EOF

    sudo sysctl -p /etc/sysctl.d/99-ecosentinel-security.conf
    echo -e "${GREEN}System limits configured${NC}"
}

# Main execution
main() {
    echo -e "${GREEN}Starting EcoSentinel Security Hardening...${NC}"
    
    # Ask for confirmation
    read -p "This will modify system configuration. Continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Security hardening cancelled${NC}"
        exit 0
    fi
    
    harden_system
    setup_firewall
    setup_fail2ban
    secure_ssh
    setup_logging
    secure_permissions
    install_security_tools
    setup_security_scans
    configure_limits
    
    echo
    echo -e "${GREEN}✅ EcoSentinel Security Hardening Completed!${NC}"
    echo -e "${YELLOW}Please review the changes and restart your system if required.${NC}"
    echo -e "${BLUE}Security monitoring script will run every 6 hours automatically.${NC}"
}

# Error handling
trap 'echo -e "${RED}Error occurred during hardening${NC}"; exit 1' ERR

# Run main function
main "$@"
