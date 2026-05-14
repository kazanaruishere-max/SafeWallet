# Security Policy

## Supported Versions

SafeWallet ensures that the latest main build on the Vercel deployment is continually monitored for security vulnerabilities. We prioritize the security of instances holding personally identifiable information (PII) and highly sensitive financial metadata.

| Version | Supported          |
| ------- | ------------------ |
| v0.1.0+ | :white_check_mark: |
| < v0.1.0| :x:                |

## Reporting a Vulnerability

Security is a core pillar of the SafeWallet application, especially given the strict Anti-Money Laundering (AML) / Personal Data Protection (PDP) constraints. If you have discovered an issue that may affect the platform's security, please adhere to the coordinated vulnerability disclosure protocol.

1. **Do not** file a public issue on GitHub for security vulnerabilities.
2. Please send an email to `security@safewallet.id` (or the direct project lead) with the details. Include:
  - Description of the vulnerability or loophole.
  - Required environments to replicate.
  - Step-by-step instructions to reproduce the vulnerability.
  - Possible severity or threat payload based on the CWSS/CVSS standard point scale.

### Threat Model Constraints (Zero-Trust)
As defined in our Architecture:
- We do not store raw PDF transaction files. Magic byte validation is enforced. Any vulnerability leading to a bypass of the `app/api/scan/route.ts` magic byte checker is treated as **P0 (Critical)**.
- Supabase Row-Level-Security bypasses logic that allows user `A` to delete/read/update user `B`'s `scan_history` is treated as **P0 (Critical)**.
- Content Security Policy (CSP) bypasses (e.g. valid XSS payload injection via Telegram bot integration or description form inputs) are treated as **P1 (High)**.

### Response Time
We will acknowledge receipt of your vulnerability report within 72 hours and strive to send you regular updates about our progress. If the vulnerability is accepted, we will coordinate a rapid patch deployment to the `main` Vercel production branch immediately, followed by an incident report via GitHub Advisories.
