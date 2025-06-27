#!/bin/bash

# EcoSentinel Advanced Security Testing Suite
# Comprehensive security testing and penetration testing automation

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
RESULTS_DIR="$PROJECT_ROOT/security-test-results"
TIMESTAMP=$(date '+%Y%m%d_%H%M%S')
TEST_REPORT="$RESULTS_DIR/security_test_report_$TIMESTAMP.json"

# Test targets
TARGET_URL="${TARGET_URL:-http://localhost:3000}"
API_URL="${API_URL:-http://localhost:3000/api}"

# Create results directory
mkdir -p "$RESULTS_DIR"

# Initialize test report
init_test_report() {
    cat > "$TEST_REPORT" <<EOF
{
  "test_suite": "EcoSentinel Security Testing",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "target_url": "$TARGET_URL",
  "api_url": "$API_URL",
  "tests": {},
  "summary": {
    "total_tests": 0,
    "passed": 0,
    "failed": 0,
    "warnings": 0
  }
}
EOF
}

# Logging functions
log_test() {
    local test_name="$1"
    local status="$2"
    local details="$3"
    local severity="${4:-info}"
    
    echo -e "${BLUE}[TEST]${NC} $test_name: ${status^^}"
    
    # Update JSON report
    jq --arg test "$test_name" \
       --arg status "$status" \
       --arg details "$details" \
       --arg severity "$severity" \
       --arg timestamp "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
       '.tests[$test] = {
         "status": $status,
         "details": $details,
         "severity": $severity,
         "timestamp": $timestamp
       }' "$TEST_REPORT" > "$TEST_REPORT.tmp" && mv "$TEST_REPORT.tmp" "$TEST_REPORT"
}

# Test 1: SSL/TLS Security
test_ssl_security() {
    echo -e "${PURPLE}Testing SSL/TLS Security...${NC}"
    
    local domain="localhost"
    local port="3000"
    
    # Test SSL configuration
    if command -v testssl.sh >/dev/null 2>&1; then
        local ssl_results
        ssl_results=$(testssl.sh --quiet --jsonfile-pretty "$RESULTS_DIR/ssl_test_$TIMESTAMP.json" "$domain:$port" 2>/dev/null || echo "SSL test failed")
        
        if [[ "$ssl_results" == *"SSL test failed"* ]]; then
            log_test "SSL_Configuration" "failed" "SSL/TLS testing failed - service may not be running with HTTPS" "high"
        else
            log_test "SSL_Configuration" "passed" "SSL/TLS configuration tested successfully" "info"
        fi
    else
        # Manual SSL check using openssl
        if echo | openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | grep -q "CONNECTED"; then
            local cipher_strength
            cipher_strength=$(echo | openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | grep "Cipher" | head -1)
            log_test "SSL_Manual_Check" "passed" "SSL connection successful: $cipher_strength" "info"
        else
            log_test "SSL_Manual_Check" "warning" "HTTPS not available on standard port 443" "medium"
        fi
    fi
}

# Test 2: Authentication Security
test_authentication_security() {
    echo -e "${PURPLE}Testing Authentication Security...${NC}"
    
    # Test login endpoint with common attacks
    local login_endpoint="$API_URL/auth/login"
    
    # SQL Injection test
    local sql_payloads=(
        "admin' OR '1'='1"
        "' UNION SELECT * FROM users --"
        "admin'--"
        "' OR 1=1#"
    )
    
    for payload in "${sql_payloads[@]}"; do
        local response
        response=$(curl -s -o /dev/null -w "%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"$payload\",\"password\":\"test\"}" \
            "$login_endpoint" 2>/dev/null || echo "000")
        
        if [[ "$response" == "200" ]]; then
            log_test "SQL_Injection_Protection" "failed" "Possible SQL injection vulnerability detected with payload: $payload" "critical"
            return
        fi
    done
    
    log_test "SQL_Injection_Protection" "passed" "SQL injection protection working correctly" "info"
    
    # Brute force protection test
    echo -e "${CYAN}Testing brute force protection...${NC}"
    local failed_attempts=0
    
    for i in {1..10}; do
        local response
        response=$(curl -s -o /dev/null -w "%{http_code}" \
            -X POST \
            -H "Content-Type: application/json" \
            -d "{\"username\":\"testuser\",\"password\":\"wrongpassword$i\"}" \
            "$login_endpoint" 2>/dev/null || echo "000")
        
        if [[ "$response" == "429" ]]; then
            log_test "Brute_Force_Protection" "passed" "Rate limiting activated after $i attempts" "info"
            return
        fi
        
        ((failed_attempts++))
        sleep 1
    done
    
    if [[ $failed_attempts -eq 10 ]]; then
        log_test "Brute_Force_Protection" "failed" "No rate limiting detected after 10 failed attempts" "high"
    fi
}

# Test 3: API Security
test_api_security() {
    echo -e "${PURPLE}Testing API Security...${NC}"
    
    # Test for sensitive information disclosure
    local sensitive_endpoints=(
        "/.env"
        "/config"
        "/admin"
        "/debug"
        "/api/keys"
        "/api/config"
        "/.git/config"
        "/package.json"
        "/node_modules"
    )
    
    local exposed_endpoints=()
    
    for endpoint in "${sensitive_endpoints[@]}"; do
        local response
        response=$(curl -s -o /dev/null -w "%{http_code}" "$TARGET_URL$endpoint" 2>/dev/null || echo "000")
        
        if [[ "$response" == "200" ]]; then
            exposed_endpoints+=("$endpoint")
        fi
    done
    
    if [[ ${#exposed_endpoints[@]} -gt 0 ]]; then
        log_test "Sensitive_Endpoints" "failed" "Exposed sensitive endpoints: ${exposed_endpoints[*]}" "critical"
    else
        log_test "Sensitive_Endpoints" "passed" "No sensitive endpoints exposed" "info"
    fi
    
    # Test CORS configuration
    local cors_response
    cors_response=$(curl -s -H "Origin: https://malicious-site.com" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: X-Requested-With" \
        -X OPTIONS "$API_URL/data" 2>/dev/null || echo "")
    
    if [[ "$cors_response" == *"Access-Control-Allow-Origin: *"* ]]; then
        log_test "CORS_Configuration" "failed" "Overly permissive CORS policy detected" "medium"
    else
        log_test "CORS_Configuration" "passed" "CORS policy properly configured" "info"
    fi
}

# Test 4: Input Validation
test_input_validation() {
    echo -e "${PURPLE}Testing Input Validation...${NC}"
    
    # XSS payloads
    local xss_payloads=(
        "<script>alert('XSS')</script>"
        "javascript:alert('XSS')"
        "<img src=x onerror=alert('XSS')>"
        "';alert('XSS');//"
    )
    
    local data_endpoint="$API_URL/data"
    
    for payload in "${xss_payloads[@]}"; do
        local response
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "{\"data\":\"$payload\"}" \
            "$data_endpoint" 2>/dev/null || echo "")
        
        if [[ "$response" == *"$payload"* ]] && [[ "$response" != *"&lt;script&gt;"* ]]; then
            log_test "XSS_Protection" "failed" "Possible XSS vulnerability with payload: $payload" "high"
            return
        fi
    done
    
    log_test "XSS_Protection" "passed" "XSS protection working correctly" "info"
    
    # Command injection test
    local cmd_payloads=(
        "; ls -la"
        "| cat /etc/passwd"
        "&& whoami"
        "; cat /etc/shadow"
    )
    
    for payload in "${cmd_payloads[@]}"; do
        local response
        response=$(curl -s -X POST \
            -H "Content-Type: application/json" \
            -d "{\"command\":\"$payload\"}" \
            "$API_URL/execute" 2>/dev/null || echo "")
        
        if [[ "$response" == *"root:"* ]] || [[ "$response" == *"bin:"* ]]; then
            log_test "Command_Injection_Protection" "failed" "Possible command injection vulnerability" "critical"
            return
        fi
    done
    
    log_test "Command_Injection_Protection" "passed" "Command injection protection working" "info"
}

# Test 5: Session Management
test_session_management() {
    echo -e "${PURPLE}Testing Session Management...${NC}"
    
    # Test for secure session cookies
    local login_response
    login_response=$(curl -s -i -X POST \
        -H "Content-Type: application/json" \
        -d '{"username":"testuser","password":"testpass"}' \
        "$API_URL/auth/login" 2>/dev/null || echo "")
    
    # Check for secure cookie flags
    if [[ "$login_response" == *"Set-Cookie"* ]]; then
        if [[ "$login_response" == *"Secure"* ]] && [[ "$login_response" == *"HttpOnly"* ]]; then
            log_test "Session_Cookie_Security" "passed" "Session cookies have security flags" "info"
        else
            local missing_flags=()
            [[ "$login_response" != *"Secure"* ]] && missing_flags+=("Secure")
            [[ "$login_response" != *"HttpOnly"* ]] && missing_flags+=("HttpOnly")
            [[ "$login_response" != *"SameSite"* ]] && missing_flags+=("SameSite")
            
            log_test "Session_Cookie_Security" "failed" "Missing cookie security flags: ${missing_flags[*]}" "medium"
        fi
    else
        log_test "Session_Cookie_Security" "warning" "No session cookies detected in login response" "low"
    fi
}

# Test 6: Rate Limiting
test_rate_limiting() {
    echo -e "${PURPLE}Testing Rate Limiting...${NC}"
    
    local test_endpoint="$API_URL/data"
    local requests_sent=0
    local rate_limited=false
    
    # Send rapid requests to test rate limiting
    for i in {1..50}; do
        local response
        response=$(curl -s -o /dev/null -w "%{http_code}" "$test_endpoint" 2>/dev/null || echo "000")
        
        ((requests_sent++))
        
        if [[ "$response" == "429" ]]; then
            rate_limited=true
            break
        fi
        
        # Small delay to avoid overwhelming the server
        sleep 0.1
    done
    
    if [[ "$rate_limited" == true ]]; then
        log_test "Rate_Limiting" "passed" "Rate limiting activated after $requests_sent requests" "info"
    else
        log_test "Rate_Limiting" "failed" "No rate limiting detected after $requests_sent requests" "medium"
    fi
}

# Test 7: Security Headers
test_security_headers() {
    echo -e "${PURPLE}Testing Security Headers...${NC}"
    
    local headers_response
    headers_response=$(curl -s -I "$TARGET_URL" 2>/dev/null || echo "")
    
    local required_headers=(
        "X-Frame-Options"
        "X-XSS-Protection"
        "X-Content-Type-Options"
        "Strict-Transport-Security"
        "Content-Security-Policy"
        "Referrer-Policy"
    )
    
    local missing_headers=()
    
    for header in "${required_headers[@]}"; do
        if [[ "$headers_response" != *"$header"* ]]; then
            missing_headers+=("$header")
        fi
    done
    
    if [[ ${#missing_headers[@]} -eq 0 ]]; then
        log_test "Security_Headers" "passed" "All required security headers present" "info"
    else
        log_test "Security_Headers" "failed" "Missing security headers: ${missing_headers[*]}" "medium"
    fi
    
    # Check for information disclosure headers
    local disclosure_headers=(
        "Server:"
        "X-Powered-By:"
        "X-AspNet-Version:"
        "X-AspNetMvc-Version:"
    )
    
    local found_disclosure=()
    
    for header in "${disclosure_headers[@]}"; do
        if [[ "$headers_response" == *"$header"* ]]; then
            found_disclosure+=("$header")
        fi
    done
    
    if [[ ${#found_disclosure[@]} -gt 0 ]]; then
        log_test "Information_Disclosure" "warning" "Information disclosure headers found: ${found_disclosure[*]}" "low"
    else
        log_test "Information_Disclosure" "passed" "No information disclosure headers found" "info"
    fi
}

# Test 8: Dependency Security
test_dependency_security() {
    echo -e "${PURPLE}Testing Dependency Security...${NC}"
    
    cd "$PROJECT_ROOT"
    
    # NPM audit
    if command -v npm >/dev/null 2>&1 && [[ -f "package.json" ]]; then
        local npm_audit
        npm_audit=$(npm audit --json 2>/dev/null || echo '{"vulnerabilities":{}}')
        
        local vuln_count
        vuln_count=$(echo "$npm_audit" | jq '.metadata.vulnerabilities.total // 0' 2>/dev/null || echo "0")
        
        if [[ "$vuln_count" -gt 0 ]]; then
            local critical_vulns
            critical_vulns=$(echo "$npm_audit" | jq '.metadata.vulnerabilities.critical // 0' 2>/dev/null || echo "0")
            
            if [[ "$critical_vulns" -gt 0 ]]; then
                log_test "NPM_Dependencies" "failed" "Critical vulnerabilities found: $critical_vulns" "critical"
            else
                log_test "NPM_Dependencies" "warning" "Vulnerabilities found: $vuln_count" "medium"
            fi
        else
            log_test "NPM_Dependencies" "passed" "No known vulnerabilities in NPM dependencies" "info"
        fi
        
        # Save detailed audit results
        echo "$npm_audit" > "$RESULTS_DIR/npm_audit_$TIMESTAMP.json"
    fi
    
    # Python dependency check
    if command -v pip >/dev/null 2>&1 && [[ -f "requirements.txt" ]]; then
        if command -v safety >/dev/null 2>&1; then
            local safety_output
            safety_output=$(safety check --json 2>/dev/null || echo "[]")
            
            local vuln_count
            vuln_count=$(echo "$safety_output" | jq 'length' 2>/dev/null || echo "0")
            
            if [[ "$vuln_count" -gt 0 ]]; then
                log_test "Python_Dependencies" "failed" "Python vulnerabilities found: $vuln_count" "high"
            else
                log_test "Python_Dependencies" "passed" "No known vulnerabilities in Python dependencies" "info"
            fi
            
            echo "$safety_output" > "$RESULTS_DIR/python_safety_$TIMESTAMP.json"
        fi
    fi
}

# Test 9: Container Security
test_container_security() {
    echo -e "${PURPLE}Testing Container Security...${NC}"
    
    if command -v docker >/dev/null 2>&1; then
        # Check for privileged containers
        local privileged_containers
        privileged_containers=$(docker ps --filter "status=running" --format "{{.Names}}" --filter "privileged=true" 2>/dev/null | wc -l)
        
        if [[ "$privileged_containers" -gt 0 ]]; then
            log_test "Container_Privileges" "failed" "Privileged containers detected: $privileged_containers" "high"
        else
            log_test "Container_Privileges" "passed" "No privileged containers detected" "info"
        fi
        
        # Check for containers running as root
        local containers
        containers=$(docker ps --format "{{.Names}}" 2>/dev/null || echo "")
        
        local root_containers=0
        
        for container in $containers; do
            local user_info
            user_info=$(docker exec "$container" whoami 2>/dev/null || echo "unknown")
            
            if [[ "$user_info" == "root" ]]; then
                ((root_containers++))
            fi
        done
        
        if [[ "$root_containers" -gt 0 ]]; then
            log_test "Container_Root_User" "warning" "Containers running as root: $root_containers" "medium"
        else
            log_test "Container_Root_User" "passed" "No containers running as root" "info"
        fi
        
        # Docker image vulnerability scan
        if command -v trivy >/dev/null 2>&1; then
            local image_name="ecosentinel:latest"
            
            if docker images | grep -q "$image_name"; then
                local trivy_results
                trivy_results=$(trivy image --format json "$image_name" 2>/dev/null || echo '{"Results":[]}')
                
                echo "$trivy_results" > "$RESULTS_DIR/trivy_scan_$TIMESTAMP.json"
                
                local critical_vulns
                critical_vulns=$(echo "$trivy_results" | jq '[.Results[]?.Vulnerabilities[]? | select(.Severity=="CRITICAL")] | length' 2>/dev/null || echo "0")
                
                if [[ "$critical_vulns" -gt 0 ]]; then
                    log_test "Container_Image_Vulns" "failed" "Critical vulnerabilities in container image: $critical_vulns" "critical"
                else
                    log_test "Container_Image_Vulns" "passed" "No critical vulnerabilities in container image" "info"
                fi
            fi
        fi
    else
        log_test "Container_Security" "skipped" "Docker not available for container security testing" "info"
    fi
}

# Test 10: Environment Security
test_environment_security() {
    echo -e "${PURPLE}Testing Environment Security...${NC}"
    
    cd "$PROJECT_ROOT"
    
    # Check for exposed environment files
    local env_files=(
        ".env"
        ".env.local"
        ".env.production"
        ".env.development"
        "config/secrets.json"
        "config/database.yml"
    )
    
    local exposed_files=()
    
    for file in "${env_files[@]}"; do
        if [[ -f "$file" ]]; then
            local file_perms
            file_perms=$(stat -c "%a" "$file" 2>/dev/null || stat -f "%Lp" "$file" 2>/dev/null || echo "unknown")
            
            if [[ "$file_perms" != "600" ]] && [[ "$file_perms" != "unknown" ]]; then
                exposed_files+=("$file:$file_perms")
            fi
        fi
    done
    
    if [[ ${#exposed_files[@]} -gt 0 ]]; then
        log_test "Environment_File_Permissions" "failed" "Insecure file permissions: ${exposed_files[*]}" "medium"
    else
        log_test "Environment_File_Permissions" "passed" "Environment files have secure permissions" "info"
    fi
    
    # Check for hardcoded secrets
    local secret_patterns=(
        "password.*=.*"
        "api_key.*=.*"
        "secret.*=.*"
        "token.*=.*"
        "private_key.*=.*"
    )
    
    local found_secrets=()
    
    for pattern in "${secret_patterns[@]}"; do
        local matches
        matches=$(grep -r -i "$pattern" . --include="*.js" --include="*.ts" --include="*.json" --exclude-dir=node_modules --exclude-dir=.git 2>/dev/null || echo "")
        
        if [[ -n "$matches" ]]; then
            found_secrets+=("$pattern")
        fi
    done
    
    if [[ ${#found_secrets[@]} -gt 0 ]]; then
        log_test "Hardcoded_Secrets" "failed" "Potential hardcoded secrets found: ${found_secrets[*]}" "high"
    else
        log_test "Hardcoded_Secrets" "passed" "No hardcoded secrets detected" "info"
    fi
}

# Generate final report
generate_final_report() {
    echo -e "${GREEN}Generating final security test report...${NC}"
    
    # Update summary in JSON report
    local total_tests passed_tests failed_tests warning_tests
    total_tests=$(jq '.tests | length' "$TEST_REPORT")
    passed_tests=$(jq '[.tests[] | select(.status=="passed")] | length' "$TEST_REPORT")
    failed_tests=$(jq '[.tests[] | select(.status=="failed")] | length' "$TEST_REPORT")
    warning_tests=$(jq '[.tests[] | select(.status=="warning")] | length' "$TEST_REPORT")
    
    jq --arg total "$total_tests" \
       --arg passed "$passed_tests" \
       --arg failed "$failed_tests" \
       --arg warnings "$warning_tests" \
       '.summary = {
         "total_tests": ($total | tonumber),
         "passed": ($passed | tonumber),
         "failed": ($failed | tonumber),
         "warnings": ($warnings | tonumber)
       }' "$TEST_REPORT" > "$TEST_REPORT.tmp" && mv "$TEST_REPORT.tmp" "$TEST_REPORT"
    
    # Generate HTML report
    local html_report="$RESULTS_DIR/security_test_report_$TIMESTAMP.html"
    
    cat > "$html_report" <<EOF
<!DOCTYPE html>
<html>
<head>
    <title>EcoSentinel Security Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #2c3e50; color: white; padding: 20px; border-radius: 5px; }
        .summary { display: flex; gap: 20px; margin: 20px 0; }
        .metric { background: #ecf0f1; padding: 15px; border-radius: 5px; text-align: center; }
        .passed { color: #27ae60; }
        .failed { color: #e74c3c; }
        .warning { color: #f39c12; }
        .test-result { margin: 10px 0; padding: 10px; border-left: 4px solid #bdc3c7; }
        .test-result.passed { border-left-color: #27ae60; }
        .test-result.failed { border-left-color: #e74c3c; }
        .test-result.warning { border-left-color: #f39c12; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔒 EcoSentinel Security Test Report</h1>
        <p>Generated on: $(date)</p>
        <p>Target: $TARGET_URL</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <h3>Total Tests</h3>
            <div style="font-size: 24px; font-weight: bold;">$total_tests</div>
        </div>
        <div class="metric">
            <h3 class="passed">Passed</h3>
            <div style="font-size: 24px; font-weight: bold;">$passed_tests</div>
        </div>
        <div class="metric">
            <h3 class="failed">Failed</h3>
            <div style="font-size: 24px; font-weight: bold;">$failed_tests</div>
        </div>
        <div class="metric">
            <h3 class="warning">Warnings</h3>
            <div style="font-size: 24px; font-weight: bold;">$warning_tests</div>
        </div>
    </div>
    
    <h2>Test Results</h2>
    <div id="test-results">
EOF

    # Add test results to HTML
    jq -r '.tests | to_entries[] | "\(.key)|\(.value.status)|\(.value.details)|\(.value.severity)"' "$TEST_REPORT" | while IFS='|' read -r test_name status details severity; do
        cat >> "$html_report" <<EOF
        <div class="test-result $status">
            <h3>$test_name</h3>
            <p><strong>Status:</strong> <span class="$status">${status^^}</span></p>
            <p><strong>Details:</strong> $details</p>
            <p><strong>Severity:</strong> $severity</p>
        </div>
EOF
    done
    
    cat >> "$html_report" <<EOF
    </div>
</body>
</html>
EOF

    echo -e "${GREEN}✅ Security test completed!${NC}"
    echo -e "${BLUE}JSON Report: $TEST_REPORT${NC}"
    echo -e "${BLUE}HTML Report: $html_report${NC}"
    echo -e "${YELLOW}Test Results Directory: $RESULTS_DIR${NC}"
}

# Main execution
main() {
    echo -e "${GREEN}🔒 EcoSentinel Advanced Security Testing Suite${NC}"
    echo "=============================================="
    
    init_test_report
    
    # Check if target is accessible
    if ! curl -s --connect-timeout 5 "$TARGET_URL" >/dev/null 2>&1; then
        echo -e "${RED}Warning: Target URL $TARGET_URL is not accessible${NC}"
        echo -e "${YELLOW}Some tests may fail or be skipped${NC}"
    fi
    
    # Run security tests
    test_ssl_security
    test_authentication_security
    test_api_security
    test_input_validation
    test_session_management
    test_rate_limiting
    test_security_headers
    test_dependency_security
    test_container_security
    test_environment_security
    
    generate_final_report
}

# Error handling
trap 'echo -e "${RED}Error occurred during security testing${NC}"; exit 1' ERR

# Check dependencies
check_dependencies() {
    local missing_tools=()
    
    if ! command -v jq >/dev/null 2>&1; then
        missing_tools+=("jq")
    fi
    
    if ! command -v curl >/dev/null 2>&1; then
        missing_tools+=("curl")
    fi
    
    if [[ ${#missing_tools[@]} -gt 0 ]]; then
        echo -e "${RED}Missing required tools: ${missing_tools[*]}${NC}"
        echo -e "${YELLOW}Please install missing tools and try again${NC}"
        exit 1
    fi
}

# Run dependency check and main function
check_dependencies
main "$@"
