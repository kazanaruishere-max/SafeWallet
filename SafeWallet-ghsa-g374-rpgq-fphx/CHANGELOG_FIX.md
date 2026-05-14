# Changelog - SafeWallet Security & UX Improvements (2026-03-18)

## [Security & Privacy]
- **Robust PII Sanitization**: Refactored `sanitizeAIInput` to use a more comprehensive set of regex patterns for redacting Bank Accounts, Emails, Names, Addresses, SWIFT codes, and IP addresses.
- **Redaction Verification**: Added a Vitest suite to ensure PII is correctly redacted before being sent to external AI (Gemini).
- **Secure Redaction Markers**: Switched from `[REDACTED]` to `___REDACTED___` to prevent collision with actual data patterns and ensure multi-pass sanitization stability.

## [Legal & Compliance]
- **Mandatory Terms Acknowledgment**: Implemented a mandatory checkbox on the Scan and Scam Check Pages. Users must now explicitly acknowledge that the tool is educational and uses third-party AI before uploading data or checking content.
- **Enhanced Legal Disclaimer**: Updated `SecurityDisclosure` with clear warnings about the probabilistic nature of AI and an explicit "Not Financial Advice" statement.
- **Honest Branding**: Renamed "Blockchain Integrity" to "Proof-of-Integrity" to accurately reflect the cryptographic hashing system without misleading users about decentralization.

## [UI/UX]
- **Dynamic Dashboard**: Removed hardcoded dummy values for Savings Rate and Debt-to-Income Ratio. The dashboard now fetches and displays real metrics from the user's latest scan.
- **Improved API Integration**: Updated the Dashboard API and Types to support extended financial metrics.

## [Maintainability]
- **Testing Infrastructure**: Integrated `Vitest` and `@testing-library/react` into the project.
- **Code Quality**: Fixed several critical lint errors, including missing imports and improper variable declarations.
