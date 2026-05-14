# Requirements Document

## Introduction

SafeWallet is a Next.js 16 application currently deployed on Vercel using serverless functions. This feature adds Google Cloud Run as a second deployment option to provide better control, cost optimization, and multi-cloud strategy. The Cloud Run deployment will run alongside the existing Vercel deployment, both sharing the same external services (Supabase PostgreSQL, Google Gemini API, Upstash Redis).

The Cloud Run deployment will containerize the Next.js application using Docker, implement CI/CD via GitHub Actions, and provide infrastructure-as-code for reproducible deployments. This deployment option is intended for staging, testing, or as an alternative production environment.

## Glossary

- **SafeWallet_App**: The Next.js 16 application using App Router architecture
- **Cloud_Run_Service**: Google Cloud Run managed container service
- **Vercel_Deployment**: The existing production deployment on Vercel platform
- **Container_Image**: Docker image containing the SafeWallet application
- **Cloud_Build**: Google Cloud Build service for CI/CD pipelines
- **Secret_Manager**: Google Cloud Secret Manager for storing sensitive configuration
- **GitHub_Actions**: CI/CD automation platform integrated with the repository
- **Standalone_Build**: Next.js output mode that creates a self-contained server bundle
- **External_Services**: Shared services including Supabase, Gemini API, and Upstash Redis
- **Deployment_Pipeline**: Automated workflow that builds and deploys the application
- **Health_Check**: HTTP endpoint that verifies service availability
- **Autoscaling**: Automatic adjustment of container instances based on traffic
- **Cloud_Logging**: Google Cloud's centralized logging service
- **Cloud_Monitoring**: Google Cloud's metrics and alerting service
- **Rollback**: Process of reverting to a previous working deployment

## Requirements

### Requirement 1: Docker Containerization

**User Story:** As a DevOps engineer, I want to containerize the SafeWallet Next.js application, so that it can run consistently on Google Cloud Run.

#### Acceptance Criteria

1. THE Container_Image SHALL use the existing Dockerfile with standalone output mode
2. THE Container_Image SHALL include all necessary dependencies from package.json
3. THE Container_Image SHALL expose port 3000 for HTTP traffic
4. THE Container_Image SHALL run as a non-root user (nextjs:nodejs)
5. WHEN the Container_Image is built, THE build process SHALL complete without errors
6. THE Container_Image SHALL be optimized using multi-stage builds to minimize size
7. THE Container_Image SHALL include only production dependencies in the final stage
8. THE .dockerignore file SHALL exclude development files, .git, .next, and .env files

### Requirement 2: Environment Variable Management

**User Story:** As a developer, I want environment variables to be securely managed and compatible with both Vercel and Cloud Run, so that the application works correctly in both environments.

#### Acceptance Criteria

1. THE Cloud_Run_Service SHALL accept environment variables for all required configuration
2. THE Cloud_Run_Service SHALL support the same environment variables as Vercel_Deployment
3. WHEN sensitive credentials are needed, THE Deployment_Pipeline SHALL retrieve them from Secret_Manager
4. THE SafeWallet_App SHALL function identically with environment variables from either platform
5. THE deployment configuration SHALL include NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, OPENROUTER_API_KEY, UPSTASH_REDIS_REST_URL, and UPSTASH_REDIS_REST_TOKEN
6. WHERE Sentry monitoring is enabled, THE Cloud_Run_Service SHALL include NEXT_PUBLIC_SENTRY_DSN and SENTRY_AUTH_TOKEN
7. THE Cloud_Run_Service SHALL set NODE_ENV to production
8. THE Cloud_Run_Service SHALL set NEXT_TELEMETRY_DISABLED to 1

### Requirement 3: Cloud Run Service Configuration

**User Story:** As a DevOps engineer, I want to configure Cloud Run service parameters, so that the application runs efficiently and cost-effectively.

#### Acceptance Criteria

1. THE Cloud_Run_Service SHALL allocate 1 CPU and 512Mi memory as default resources
2. THE Cloud_Run_Service SHALL set minimum instances to 0 for cost optimization
3. THE Cloud_Run_Service SHALL set maximum instances to 10 to prevent runaway costs
4. THE Cloud_Run_Service SHALL configure request timeout to 300 seconds
5. THE Cloud_Run_Service SHALL enable HTTP/2 and gRPC support
6. THE Cloud_Run_Service SHALL allow unauthenticated access for public endpoints
7. WHEN traffic increases, THE Cloud_Run_Service SHALL automatically scale up to maximum instances
8. WHEN traffic decreases, THE Cloud_Run_Service SHALL automatically scale down to minimum instances
9. THE Cloud_Run_Service SHALL use the latest Container_Image tag for deployments
10. THE Cloud_Run_Service SHALL be deployed in a configurable region (default: us-central1)

### Requirement 4: CI/CD Pipeline with GitHub Actions

**User Story:** As a developer, I want automated deployment to Cloud Run when code is pushed, so that changes are deployed quickly and consistently.

#### Acceptance Criteria

1. WHEN code is pushed to the gcloud-deploy branch, THE Deployment_Pipeline SHALL trigger automatically
2. THE Deployment_Pipeline SHALL authenticate with Google Cloud using Workload Identity Federation
3. THE Deployment_Pipeline SHALL build the Container_Image using Cloud Build
4. THE Deployment_Pipeline SHALL tag the Container_Image with the git commit SHA
5. THE Deployment_Pipeline SHALL push the Container_Image to Google Artifact Registry
6. THE Deployment_Pipeline SHALL deploy the Container_Image to Cloud_Run_Service
7. WHEN the deployment succeeds, THE Deployment_Pipeline SHALL output the service URL
8. IF the deployment fails, THEN THE Deployment_Pipeline SHALL exit with a non-zero status code and preserve the previous deployment
9. THE Deployment_Pipeline SHALL support manual triggering via workflow_dispatch
10. THE Deployment_Pipeline SHALL complete within 10 minutes under normal conditions

### Requirement 5: Infrastructure as Code

**User Story:** As a DevOps engineer, I want deployment scripts and configuration files, so that I can reproduce the Cloud Run setup consistently.

#### Acceptance Criteria

1. THE deployment configuration SHALL include a cloudbuild.yaml file for Cloud Build
2. THE deployment configuration SHALL include a deploy.sh script for manual deployments
3. THE deployment configuration SHALL include a setup-gcloud.sh script for initial Google Cloud setup
4. THE deploy.sh script SHALL accept parameters for project ID, region, and service name
5. THE setup-gcloud.sh script SHALL enable required Google Cloud APIs (Cloud Run, Cloud Build, Artifact Registry, Secret Manager)
6. THE setup-gcloud.sh script SHALL create an Artifact Registry repository for Container_Images
7. THE setup-gcloud.sh script SHALL configure Workload Identity Federation for GitHub Actions
8. THE deployment scripts SHALL validate required environment variables before execution
9. THE deployment scripts SHALL provide clear error messages when prerequisites are missing
10. THE deployment configuration SHALL be documented in a DEPLOYMENT.md file

### Requirement 6: Health Checks and Monitoring

**User Story:** As a DevOps engineer, I want health checks and monitoring configured, so that I can detect and respond to service issues.

#### Acceptance Criteria

1. THE SafeWallet_App SHALL expose a /api/health endpoint that returns HTTP 200 when healthy
2. THE Health_Check endpoint SHALL verify database connectivity to Supabase
3. THE Health_Check endpoint SHALL verify Redis connectivity to Upstash
4. THE Health_Check endpoint SHALL return HTTP 503 when critical dependencies are unavailable
5. THE Cloud_Run_Service SHALL use the /api/health endpoint for startup and liveness probes
6. THE Cloud_Run_Service SHALL send logs to Cloud_Logging automatically
7. THE Cloud_Run_Service SHALL expose metrics to Cloud_Monitoring automatically
8. WHERE monitoring is configured, THE Cloud_Run_Service SHALL track request count, latency, and error rate
9. THE Cloud_Run_Service SHALL retain logs for 30 days by default
10. THE deployment documentation SHALL include instructions for setting up Cloud Monitoring alerts

### Requirement 7: Rollback and Deployment Safety

**User Story:** As a DevOps engineer, I want the ability to rollback failed deployments, so that I can quickly restore service when issues occur.

#### Acceptance Criteria

1. THE Cloud_Run_Service SHALL retain the previous 10 revisions for Rollback
2. WHEN a deployment fails health checks, THE Cloud_Run_Service SHALL not route traffic to the new revision
3. THE Deployment_Pipeline SHALL support a rollback workflow that reverts to the previous revision
4. THE rollback workflow SHALL complete within 2 minutes
5. THE rollback workflow SHALL accept a revision number or default to the previous revision
6. WHEN a Rollback is performed, THE Cloud_Run_Service SHALL route 100% of traffic to the target revision
7. THE deployment scripts SHALL include a rollback.sh script for manual rollbacks
8. THE rollback.sh script SHALL list available revisions before performing the rollback
9. THE rollback.sh script SHALL confirm the rollback action before execution
10. THE Cloud_Run_Service SHALL preserve environment variables and configuration during Rollback

### Requirement 8: Cost Optimization

**User Story:** As a product owner, I want the Cloud Run deployment to be cost-effective, so that we minimize infrastructure expenses.

#### Acceptance Criteria

1. THE Cloud_Run_Service SHALL scale to zero instances when idle to minimize costs
2. THE Cloud_Run_Service SHALL use the minimum viable CPU and memory allocation
3. THE Container_Image SHALL be smaller than 500MB to reduce storage and transfer costs
4. THE Deployment_Pipeline SHALL use Cloud Build's free tier (120 build-minutes per day)
5. THE Cloud_Run_Service SHALL use request-based pricing (pay only for actual usage)
6. THE deployment documentation SHALL include cost estimation guidelines
7. THE Cloud_Run_Service SHALL set concurrency to 80 requests per container instance
8. WHERE traffic patterns are predictable, THE deployment documentation SHALL recommend minimum instance settings
9. THE Cloud_Run_Service SHALL use the default Cloud Run service account to avoid additional IAM costs
10. THE deployment configuration SHALL avoid premium features unless explicitly required

### Requirement 9: Dual Deployment Compatibility

**User Story:** As a developer, I want both Vercel and Cloud Run deployments to coexist, so that I can use either platform without conflicts.

#### Acceptance Criteria

1. THE SafeWallet_App SHALL function identically on both Vercel_Deployment and Cloud_Run_Service
2. THE SafeWallet_App SHALL not include platform-specific code or dependencies
3. THE External_Services SHALL be shared between both deployments without conflicts
4. THE deployment configuration SHALL not modify files used by Vercel_Deployment
5. THE Cloud_Run_Service SHALL use a different domain or subdomain than Vercel_Deployment
6. THE GitHub_Actions workflow for Cloud Run SHALL not interfere with Vercel's automatic deployments
7. THE Container_Image build SHALL use the same next.config.ts as Vercel_Deployment
8. THE Cloud_Run_Service SHALL respect the same security headers configured in next.config.ts
9. WHERE custom domains are used, THE deployment documentation SHALL explain DNS configuration for both platforms
10. THE SafeWallet_App SHALL detect the deployment platform via environment variables if needed

### Requirement 10: Documentation and Developer Experience

**User Story:** As a developer, I want comprehensive documentation for Cloud Run deployment, so that I can deploy and maintain the service confidently.

#### Acceptance Criteria

1. THE deployment documentation SHALL include a step-by-step setup guide for Google Cloud
2. THE deployment documentation SHALL include prerequisites (Google Cloud account, gcloud CLI, permissions)
3. THE deployment documentation SHALL include instructions for initial deployment
4. THE deployment documentation SHALL include instructions for updating the deployment
5. THE deployment documentation SHALL include instructions for rollback procedures
6. THE deployment documentation SHALL include troubleshooting common issues
7. THE deployment documentation SHALL include cost estimation and optimization tips
8. THE deployment documentation SHALL include monitoring and logging access instructions
9. THE deployment documentation SHALL include a comparison table between Vercel and Cloud Run deployments
10. THE deployment documentation SHALL include instructions for setting up GitHub Actions secrets
11. THE deployment documentation SHALL be written in English and Indonesian (bilingual)
12. THE deployment scripts SHALL include inline comments explaining each step
