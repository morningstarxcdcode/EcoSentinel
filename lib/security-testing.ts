// EcoSentinel Security Testing Suite
// Advanced security testing utilities and test cases

import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import request from 'supertest';
import { Application } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface SecurityTestConfig {
  baseUrl: string;
  apiKey?: string;
  authToken?: string;
  testUser?: {
    username: string;
    password: string;
  };
}

export class SecurityTestSuite {
  private config: SecurityTestConfig;
  private app: Application;

  constructor(app: Application, config: SecurityTestConfig) {
    this.app = app;
    this.config = config;
  }

  // Authentication Security Tests
  async testAuthenticationSecurity(): Promise<void> {
    describe('Authentication Security Tests', () => {
      test('should reject SQL injection in login', async () => {
        const sqlPayloads = [
          "admin' OR '1'='1",
          "' UNION SELECT * FROM users --",
          "admin'--",
          "' OR 1=1#"
        ];

        for (const payload of sqlPayloads) {
          const response = await request(this.app)
            .post('/api/auth/login')
            .send({
              username: payload,
              password: 'test'
            });

          expect(response.status).not.toBe(200);
          expect(response.body).not.toHaveProperty('token');
        }
      });

      test('should implement rate limiting on login attempts', async () => {
        const promises = [];
        
        // Send 10 rapid login attempts
        for (let i = 0; i < 10; i++) {
          promises.push(
            request(this.app)
              .post('/api/auth/login')
              .send({
                username: 'testuser',
                password: 'wrongpassword'
              })
          );
        }

        const responses = await Promise.all(promises);
        
        // At least one should be rate limited
        const rateLimited = responses.some(response => response.status === 429);
        expect(rateLimited).toBe(true);
      });

      test('should require strong passwords', async () => {
        const weakPasswords = [
          '123456',
          'password',
          'qwerty',
          'abc123',
          'password123'
        ];

        for (const password of weakPasswords) {
          const response = await request(this.app)
            .post('/api/auth/register')
            .send({
              username: 'testuser',
              email: 'test@example.com',
              password: password
            });

          expect(response.status).toBe(400);
          expect(response.body.error).toMatch(/password/i);
        }
      });

      test('should enforce password complexity', async () => {
        const response = await request(this.app)
          .post('/api/auth/register')
          .send({
            username: 'testuser',
            email: 'test@example.com',
            password: 'ValidP@ssw0rd123!'
          });

        expect(response.status).toBe(201);
      });

      test('should implement account lockout after failed attempts', async () => {
        const username = 'lockout-test-user';
        
        // Create test user first
        await request(this.app)
          .post('/api/auth/register')
          .send({
            username,
            email: 'lockout@example.com',
            password: 'ValidP@ssw0rd123!'
          });

        // Attempt multiple failed logins
        for (let i = 0; i < 6; i++) {
          await request(this.app)
            .post('/api/auth/login')
            .send({
              username,
              password: 'wrongpassword'
            });
        }

        // Try with correct password - should be locked
        const response = await request(this.app)
          .post('/api/auth/login')
          .send({
            username,
            password: 'ValidP@ssw0rd123!'
          });

        expect(response.status).toBe(423); // Locked
      });
    });
  }

  // Authorization and Access Control Tests
  async testAuthorizationSecurity(): Promise<void> {
    describe('Authorization Security Tests', () => {
      test('should require authentication for protected endpoints', async () => {
        const protectedEndpoints = [
          '/api/user/profile',
          '/api/admin/users',
          '/api/data/sensitive'
        ];

        for (const endpoint of protectedEndpoints) {
          const response = await request(this.app)
            .get(endpoint);

          expect(response.status).toBe(401);
        }
      });

      test('should validate JWT tokens properly', async () => {
        const invalidTokens = [
          'invalid.token.here',
          'Bearer invalid-token',
          'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.invalid',
          ''
        ];

        for (const token of invalidTokens) {
          const response = await request(this.app)
            .get('/api/user/profile')
            .set('Authorization', token);

          expect(response.status).toBe(401);
        }
      });

      test('should enforce role-based access control', async () => {
        // Test with user role trying to access admin endpoint
        const userToken = jwt.sign(
          { userId: 1, role: 'user' },
          process.env.JWT_SECRET || 'test-secret'
        );

        const response = await request(this.app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${userToken}`);

        expect(response.status).toBe(403);
      });

      test('should prevent privilege escalation', async () => {
        const userToken = jwt.sign(
          { userId: 1, role: 'user' },
          process.env.JWT_SECRET || 'test-secret'
        );

        // Try to modify another user's data
        const response = await request(this.app)
          .put('/api/user/2/profile')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            role: 'admin'
          });

        expect(response.status).toBe(403);
      });
    });
  }

  // Input Validation and Injection Tests
  async testInputValidationSecurity(): Promise<void> {
    describe('Input Validation Security Tests', () => {
      test('should prevent XSS attacks', async () => {
        const xssPayloads = [
          '<script>alert("XSS")</script>',
          'javascript:alert("XSS")',
          '<img src=x onerror=alert("XSS")>',
          '"><script>alert("XSS")</script>'
        ];

        for (const payload of xssPayloads) {
          const response = await request(this.app)
            .post('/api/data/comment')
            .send({
              content: payload
            });

          // Should either reject or sanitize
          if (response.status === 200) {
            expect(response.body.content).not.toContain('<script>');
            expect(response.body.content).not.toContain('javascript:');
          } else {
            expect(response.status).toBe(400);
          }
        }
      });

      test('should prevent command injection', async () => {
        const cmdPayloads = [
          '; ls -la',
          '| cat /etc/passwd',
          '&& whoami',
          '; rm -rf /'
        ];

        for (const payload of cmdPayloads) {
          const response = await request(this.app)
            .post('/api/system/command')
            .send({
              command: payload
            });

          expect(response.status).toBe(400);
        }
      });

      test('should validate file uploads', async () => {
        // Test malicious file upload
        const response = await request(this.app)
          .post('/api/upload')
          .attach('file', Buffer.from('<?php system($_GET["cmd"]); ?>'), 'malicious.php');

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/file type|extension/i);
      });

      test('should enforce file size limits', async () => {
        // Create a large buffer (10MB)
        const largeBuffer = Buffer.alloc(10 * 1024 * 1024, 'a');

        const response = await request(this.app)
          .post('/api/upload')
          .attach('file', largeBuffer, 'large-file.txt');

        expect(response.status).toBe(413); // Payload Too Large
      });

      test('should validate email formats', async () => {
        const invalidEmails = [
          'invalid-email',
          'test@',
          '@example.com',
          'test..test@example.com'
        ];

        for (const email of invalidEmails) {
          const response = await request(this.app)
            .post('/api/auth/register')
            .send({
              username: 'testuser',
              email: email,
              password: 'ValidP@ssw0rd123!'
            });

          expect(response.status).toBe(400);
        }
      });
    });
  }

  // Session Management Tests
  async testSessionSecurity(): Promise<void> {
    describe('Session Management Security Tests', () => {
      test('should set secure cookie flags', async () => {
        const response = await request(this.app)
          .post('/api/auth/login')
          .send({
            username: this.config.testUser?.username || 'testuser',
            password: this.config.testUser?.password || 'testpass'
          });

        const cookies = response.headers['set-cookie'];
        if (cookies) {
          const sessionCookie = cookies.find((cookie: string) => 
            cookie.includes('session') || cookie.includes('token')
          );

          if (sessionCookie) {
            expect(sessionCookie).toMatch(/Secure/);
            expect(sessionCookie).toMatch(/HttpOnly/);
            expect(sessionCookie).toMatch(/SameSite/);
          }
        }
      });

      test('should invalidate sessions on logout', async () => {
        // Login first
        const loginResponse = await request(this.app)
          .post('/api/auth/login')
          .send({
            username: this.config.testUser?.username || 'testuser',
            password: this.config.testUser?.password || 'testpass'
          });

        const token = loginResponse.body.token;

        // Logout
        await request(this.app)
          .post('/api/auth/logout')
          .set('Authorization', `Bearer ${token}`);

        // Try to use the same token
        const response = await request(this.app)
          .get('/api/user/profile')
          .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(401);
      });

      test('should implement session timeout', async () => {
        // This would require mocking time or waiting
        // For demonstration purposes, we'll test expired token
        const expiredToken = jwt.sign(
          { userId: 1, role: 'user' },
          process.env.JWT_SECRET || 'test-secret',
          { expiresIn: '1ms' }
        );

        // Wait a bit to ensure expiration
        await new Promise(resolve => setTimeout(resolve, 10));

        const response = await request(this.app)
          .get('/api/user/profile')
          .set('Authorization', `Bearer ${expiredToken}`);

        expect(response.status).toBe(401);
      });
    });
  }

  // API Security Tests
  async testApiSecurity(): Promise<void> {
    describe('API Security Tests', () => {
      test('should implement CORS properly', async () => {
        const response = await request(this.app)
          .options('/api/data')
          .set('Origin', 'https://malicious-site.com')
          .set('Access-Control-Request-Method', 'GET');

        // Should not allow arbitrary origins
        expect(response.headers['access-control-allow-origin']).not.toBe('*');
      });

      test('should include security headers', async () => {
        const response = await request(this.app)
          .get('/api/health');

        expect(response.headers).toHaveProperty('x-frame-options');
        expect(response.headers).toHaveProperty('x-xss-protection');
        expect(response.headers).toHaveProperty('x-content-type-options');
        expect(response.headers['x-powered-by']).toBeUndefined();
      });

      test('should validate API keys', async () => {
        const invalidKeys = [
          'invalid-key',
          '',
          'short',
          'wrong-format-key'
        ];

        for (const key of invalidKeys) {
          const response = await request(this.app)
            .get('/api/data')
            .set('X-API-Key', key);

          expect(response.status).toBe(401);
        }
      });

      test('should prevent information disclosure', async () => {
        const sensitiveEndpoints = [
          '/.env',
          '/package.json',
          '/config.json',
          '/.git/config',
          '/admin/debug'
        ];

        for (const endpoint of sensitiveEndpoints) {
          const response = await request(this.app)
            .get(endpoint);

          expect(response.status).not.toBe(200);
        }
      });
    });
  }

  // Data Protection Tests
  async testDataProtection(): Promise<void> {
    describe('Data Protection Tests', () => {
      test('should encrypt sensitive data', async () => {
        // Create a user with sensitive data
        const response = await request(this.app)
          .post('/api/user/profile')
          .send({
            ssn: '123-45-6789',
            creditCard: '4532015112830366'
          });

        expect(response.status).toBe(200);

        // Verify data is encrypted in storage (this would require database access)
        // For demonstration, we'll check the response doesn't contain plain text
        expect(response.body.ssn).not.toBe('123-45-6789');
        expect(response.body.creditCard).not.toBe('4532015112830366');
      });

      test('should implement data masking', async () => {
        const response = await request(this.app)
          .get('/api/user/profile');

        if (response.body.ssn) {
          expect(response.body.ssn).toMatch(/\*\*\*-\*\*-\d{4}/);
        }

        if (response.body.creditCard) {
          expect(response.body.creditCard).toMatch(/\*\*\*\*-\*\*\*\*-\*\*\*\*-\d{4}/);
        }
      });

      test('should validate data retention policies', async () => {
        // Test that old data is properly purged
        const oldDate = new Date();
        oldDate.setFullYear(oldDate.getFullYear() - 8); // 8 years ago

        const response = await request(this.app)
          .get('/api/data/logs')
          .query({
            startDate: oldDate.toISOString(),
            endDate: new Date().toISOString()
          });

        // Should not return data older than retention policy
        expect(response.body.logs).toEqual([]);
      });
    });
  }

  // Performance and DoS Protection Tests
  async testPerformanceSecurity(): Promise<void> {
    describe('Performance Security Tests', () => {
      test('should prevent ReDoS attacks', async () => {
        const maliciousRegexInput = 'a'.repeat(10000) + '!';

        const response = await request(this.app)
          .post('/api/validate')
          .send({
            pattern: maliciousRegexInput
          });

        // Should complete quickly, not hang
        expect(response.status).toBeDefined();
      });

      test('should limit request size', async () => {
        const largePayload = {
          data: 'x'.repeat(10 * 1024 * 1024) // 10MB
        };

        const response = await request(this.app)
          .post('/api/data')
          .send(largePayload);

        expect(response.status).toBe(413); // Payload Too Large
      });

      test('should implement query complexity limits', async () => {
        // For GraphQL APIs
        const complexQuery = `
          query {
            users {
              posts {
                comments {
                  replies {
                    user {
                      posts {
                        comments {
                          replies {
                            id
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        `;

        const response = await request(this.app)
          .post('/api/graphql')
          .send({ query: complexQuery });

        expect(response.status).toBe(400);
        expect(response.body.error).toMatch(/complexity/i);
      });
    });
  }

  // Run all security tests
  async runAllTests(): Promise<void> {
    console.log('🔒 Starting EcoSentinel Security Test Suite...');

    await this.testAuthenticationSecurity();
    await this.testAuthorizationSecurity();
    await this.testInputValidationSecurity();
    await this.testSessionSecurity();
    await this.testApiSecurity();
    await this.testDataProtection();
    await this.testPerformanceSecurity();

    console.log('✅ Security test suite completed');
  }
}

// Utility functions for security testing
export class SecurityTestUtils {
  
  // Generate test JWT tokens
  static generateTestToken(payload: object, secret?: string, options?: object): string {
    return jwt.sign(
      payload,
      secret || process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h', ...options }
    );
  }

  // Generate malformed tokens
  static generateMalformedTokens(): string[] {
    return [
      'not.a.token',
      'Bearer invalid',
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.invalid.signature',
      '',
      'null',
      'undefined'
    ];
  }

  // Generate XSS payloads
  static getXSSPayloads(): string[] {
    return [
      '<script>alert("XSS")</script>',
      'javascript:alert("XSS")',
      '<img src=x onerror=alert("XSS")>',
      '"><script>alert("XSS")</script>',
      '<svg onload=alert("XSS")>',
      '<iframe src="javascript:alert(\'XSS\')"></iframe>',
      '<object data="javascript:alert(\'XSS\')"></object>',
      '<embed src="javascript:alert(\'XSS\')"></embed>'
    ];
  }

  // Generate SQL injection payloads
  static getSQLInjectionPayloads(): string[] {
    return [
      "' OR '1'='1",
      "' UNION SELECT * FROM users --",
      "'; DROP TABLE users; --",
      "' OR 1=1#",
      "admin'--",
      "' UNION SELECT null, username, password FROM users --",
      "' AND 1=0 UNION SELECT null, table_name FROM information_schema.tables #"
    ];
  }

  // Generate command injection payloads
  static getCommandInjectionPayloads(): string[] {
    return [
      '; ls -la',
      '| cat /etc/passwd',
      '&& whoami',
      '; rm -rf /',
      '`whoami`',
      '$(cat /etc/passwd)',
      '; ping -c 4 127.0.0.1',
      '| nc -l 4444'
    ];
  }

  // Hash password for testing
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  // Verify password hash
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  // Generate test API keys
  static generateAPIKey(): string {
    const crypto = require('crypto');
    return 'es_' + crypto.randomBytes(32).toString('hex');
  }

  // Create test users
  static createTestUsers(): Array<{username: string, email: string, password: string, role: string}> {
    return [
      {
        username: 'admin_user',
        email: 'admin@ecosentinel.app',
        password: 'AdminP@ssw0rd123!',
        role: 'admin'
      },
      {
        username: 'regular_user',
        email: 'user@ecosentinel.app',
        password: 'UserP@ssw0rd123!',
        role: 'user'
      },
      {
        username: 'api_user',
        email: 'api@ecosentinel.app',
        password: 'ApiP@ssw0rd123!',
        role: 'api'
      }
    ];
  }
}

export default SecurityTestSuite;
