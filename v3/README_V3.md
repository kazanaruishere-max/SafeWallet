# SafeWallet V3: Enterprise Microservices Documentation

## 1. Overview
SafeWallet V3 is a high-performance, secure, and scalable financial analysis platform built using a microservices architecture. It leverages Golang/NestJS for orchestration, Rust for security, and Python for AI/OCR tasks.

## 2. Architecture (C4 Model)
### 2.1 Context Diagram
- **User**: Financial analysts and end-users.
- **SafeWallet**: The system providing OCR and risk analysis.
- **External Systems**: Supabase (Database), Google Gemini (AI), Upstash (Redis).

### 2.2 Container Diagram
- **API Gateway (NestJS)**: Handles Auth, Rate Limiting, and Orchestration.
- **Security Module (Rust)**: Handles Encryption and Integrity.
- **Worker (Python)**: Handles OCR and Data Processing.

## 3. OpenAPI 3.0 Specification
```yaml
openapi: 3.0.0
info:
  title: SafeWallet V3 API
  version: 1.0.0
paths:
  /scan/upload:
    post:
      summary: Upload document for analysis
      security:
        - BearerAuth: []
      requestBody:
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                file:
                  type: string
                  format: binary
                user_id:
                  type: string
      responses:
        '202':
          description: Accepted for processing
        '429':
          description: Rate limit exceeded
```

## 4. Operational Runbook & Security
### 4.1 Deployment
1. Ensure `KUBECONFIG` is set.
2. Run `kubectl apply -f v3/k8s/production/`.
3. Verify HPA: `kubectl get hpa gateway-hpa`.

### 4.2 Incident Response Plan
Detail mengenai prosedur penanganan insiden dapat ditemukan di [INCIDENT_RESPONSE_PLAN.md](./INCIDENT_RESPONSE_PLAN.md).

### 4.3 Security Audit & Compliance
Laporan kepatuhan terhadap standar ISO 27001 dan mitigasi OWASP Top 10 tersedia di [SECURITY_AUDIT_COMPLIANCE.md](./SECURITY_AUDIT_COMPLIANCE.md).

## 5. Security Standards Compliance
- **Zero-Trust**: No internal service is exposed publicly.
- **MFA Required**: Multi-Factor Authentication (TOTP) diwajibkan untuk aksi kritis seperti unggah dokumen.
- **Encryption**: AES-256-GCM (at rest) via Rust Security Module & TLS 1.3 (in-transit).
- **Patch Management**: Automasi pembaruan dependensi via Dependabot.
