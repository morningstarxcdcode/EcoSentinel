#!/bin/bash

# EcoSentinel Security Automation Script
# This script performs comprehensive security checks and monitoring

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
LOG_FILE="/var/log/ecosentinel-security.log"
ALERT_EMAIL="morningstar.xcd@gmail.com"
SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Alert function
send_alert() {
    local severity="$1"
    local message="$2"
    
    log "[$severity] $message"
    
    # Send email alert
    if command -v mail >/dev/null 2>&1; then
        echo "$message" | mail -s "EcoSentinel Security Alert - $severity" "$ALERT_EMAIL"
    fi
    
    # Send Slack alert
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚨 EcoSentinel Security Alert - $severity: $message\"}" \
            "$SLACK_WEBHOOK_URL"
    fi
}

# Check for unauthorized access attempts
check_auth_failures() {
    echo -e "${BLUE}Checking authentication failures...${NC}"
    
    local failed_attempts
    failed_attempts=$(journalctl --since "1 hour ago" | grep -c "authentication failure" || true)
    
    if [[ $failed_attempts -gt 10 ]]; then
        send_alert "HIGH" "High number of authentication failures detected: $failed_attempts in the last hour"
    elif [[ $failed_attempts -gt 5 ]]; then
        send_alert "MEDIUM" "Moderate authentication failures detected: $failed_attempts in the last hour"
    fi
    
    log "Authentication failures in last hour: $failed_attempts"
}

# Check system resources
check_resources() {
    echo -e "${BLUE}Checking system resources...${NC}"
    
    # CPU usage
    local cpu_usage
    cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
    
    if (( $(echo "$cpu_usage > 90" | bc -l) )); then
        send_alert "HIGH" "High CPU usage detected: ${cpu_usage}%"
    fi
    
    # Memory usage
    local mem_usage
    mem_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    
    if (( $(echo "$mem_usage > 90" | bc -l) )); then
        send_alert "HIGH" "High memory usage detected: ${mem_usage}%"
    fi
    
    # Disk usage
    local disk_usage
    disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [[ $disk_usage -gt 90 ]]; then
        send_alert "HIGH" "High disk usage detected: ${disk_usage}%"
    fi
    
    log "System resources - CPU: ${cpu_usage}%, Memory: ${mem_usage}%, Disk: ${disk_usage}%"
}

# Check for suspicious network activity
check_network() {
    echo -e "${BLUE}Checking network activity...${NC}"
    
    # Check for unusual outbound connections
    local suspicious_connections
    suspicious_connections=$(netstat -an | grep -E "ESTABLISHED.*:(22|23|3389|5900)" | wc -l)
    
    if [[ $suspicious_connections -gt 5 ]]; then
        send_alert "MEDIUM" "Suspicious network connections detected: $suspicious_connections"
    fi
    
    # Check for port scans
    local port_scans
    port_scans=$(journalctl --since "1 hour ago" | grep -c "port.*scan" || true)
    
    if [[ $port_scans -gt 0 ]]; then
        send_alert "HIGH" "Port scan activity detected: $port_scans attempts"
    fi
    
    log "Network security check completed"
}

# Check Docker containers security
check_containers() {
    echo -e "${BLUE}Checking Docker container security...${NC}"
    
    if command -v docker >/dev/null 2>&1; then
        # Check for containers running as root
        local root_containers
        root_containers=$(docker ps --format "table {{.Names}}\t{{.Image}}" --filter "label=security.privileged=false" | wc -l)
        
        # Check for containers with privileged access
        local privileged_containers
        privileged_containers=$(docker ps --filter "label=security.privileged=true" --format "{{.Names}}" | wc -l)
        
        if [[ $privileged_containers -gt 0 ]]; then
            send_alert "MEDIUM" "Privileged containers detected: $privileged_containers"
        fi
        
        # Check for outdated images
        local outdated_images
        outdated_images=$(docker images --format "{{.Repository}}:{{.Tag}}" | grep -v "latest" | wc -l)
        
        log "Container security - Root containers: $root_containers, Privileged: $privileged_containers, Outdated images: $outdated_images"
    fi
}

# Check SSL/TLS certificates
check_certificates() {
    echo -e "${BLUE}Checking SSL/TLS certificates...${NC}"
    
    local domains=("ecosentinel.app" "api.ecosentinel.app")
    
    for domain in "${domains[@]}"; do
        if command -v openssl >/dev/null 2>&1; then
            local expiry_date
            expiry_date=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates | grep "notAfter" | cut -d= -f2)
            
            local expiry_epoch
            expiry_epoch=$(date -d "$expiry_date" +%s)
            local current_epoch
            current_epoch=$(date +%s)
            local days_until_expiry
            days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
            
            if [[ $days_until_expiry -lt 30 ]]; then
                send_alert "HIGH" "SSL certificate for $domain expires in $days_until_expiry days"
            elif [[ $days_until_expiry -lt 60 ]]; then
                send_alert "MEDIUM" "SSL certificate for $domain expires in $days_until_expiry days"
            fi
            
            log "SSL certificate for $domain expires in $days_until_expiry days"
        fi
    done
}

# Check for malware and suspicious files
check_malware() {
    echo -e "${BLUE}Checking for malware and suspicious files...${NC}"
    
    # Check for suspicious file modifications
    local suspicious_files
    suspicious_files=$(find /etc /usr/bin /usr/sbin -type f -mtime -1 2>/dev/null | wc -l)
    
    if [[ $suspicious_files -gt 10 ]]; then
        send_alert "MEDIUM" "Suspicious file modifications detected: $suspicious_files files modified in critical directories"
    fi
    
    # Check for unusual processes
    local suspicious_processes
    suspicious_processes=$(ps aux | grep -E "(nc|netcat|nmap|masscan|zmap)" | grep -v grep | wc -l)
    
    if [[ $suspicious_processes -gt 0 ]]; then
        send_alert "HIGH" "Suspicious processes detected: $suspicious_processes"
    fi
    
    log "Malware check completed - Suspicious files: $suspicious_files, Suspicious processes: $suspicious_processes"
}

# Check database security
check_database() {
    echo -e "${BLUE}Checking database security...${NC}"
    
    # Check PostgreSQL configuration
    if command -v psql >/dev/null 2>&1; then
        # Check for SSL enforcement
        local ssl_status
        ssl_status=$(psql -t -c "SHOW ssl;" 2>/dev/null | tr -d ' ' || echo "unknown")
        
        if [[ "$ssl_status" != "on" ]]; then
            send_alert "HIGH" "PostgreSQL SSL is not enabled"
        fi
        
        # Check for weak passwords (if accessible)
        local weak_passwords
        weak_passwords=$(psql -t -c "SELECT count(*) FROM pg_user WHERE passwd IS NULL OR passwd = '';" 2>/dev/null || echo "0")
        
        if [[ $weak_passwords -gt 0 ]]; then
            send_alert "CRITICAL" "Database users with weak/empty passwords detected: $weak_passwords"
        fi
        
        log "Database security check completed - SSL: $ssl_status, Weak passwords: $weak_passwords"
    fi
}

# Check API security
check_api_security() {
    echo -e "${BLUE}Checking API security...${NC}"
    
    # Check for API rate limiting
    local api_endpoints=("http://localhost:3000/api/health" "http://localhost:3000/api/data")
    
    for endpoint in "${api_endpoints[@]}"; do
        local response_code
        response_code=$(curl -s -o /dev/null -w "%{http_code}" "$endpoint" || echo "000")
        
        if [[ "$response_code" == "000" ]]; then
            send_alert "HIGH" "API endpoint $endpoint is not responding"
        fi
    done
    
    # Check for exposed sensitive endpoints
    local sensitive_endpoints
    sensitive_endpoints=$(curl -s "http://localhost:3000/.env" | wc -l)
    
    if [[ $sensitive_endpoints -gt 0 ]]; then
        send_alert "CRITICAL" "Sensitive files exposed via web server"
    fi
    
    log "API security check completed"
}

# Main execution
main() {
    echo -e "${GREEN}Starting EcoSentinel Security Check...${NC}"
    log "Security automation script started"
    
    check_auth_failures
    check_resources
    check_network
    check_containers
    check_certificates
    check_malware
    check_database
    check_api_security
    
    echo -e "${GREEN}Security check completed successfully!${NC}"
    log "Security automation script completed"
}

# Error handling
trap 'echo -e "${RED}Error occurred during security check${NC}"; log "ERROR: Security script failed"; exit 1' ERR

# Run main function
main "$@"
