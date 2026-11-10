# VANTIQ

**Intelligence That Converts.**

*AI · Leads · Business Intelligence*

---

## Overview

VANTIQ is a comprehensive AI-powered lead generation and business intelligence platform designed to help businesses discover, qualify, manage, and convert leads at scale. Built with cutting-edge technology and premium design, VANTIQ combines intelligent lead acquisition, advanced CRM capabilities, and multi-model AI assistance in one unified platform.

### Core Features

- **🎯 AI-Powered Lead Generation** - Discover qualified leads across multiple sources (Apollo, Apify, manual import, landing pages)
- **🤖 Multi-Model AI Assistant** - Integrated Qwen, Grok, and NVIDIA Nemotron with intelligent fallback
- **💼 Lead Management CRM** - Complete pipeline management with 21 statuses and rich activity tracking
- **🏢 Buyer Portal** - Authorized buyer management with lead distribution and acceptance workflows
- **💰 Commission Protection System** - Immutable lead attribution, distribution receipts, and financial tracking
- **📊 Advanced Analytics** - Real-time dashboards with custom filters and exportable reports
- **🔄 Lead Deduplication** - Intelligent duplicate detection using normalized identifiers
- **✅ Consent Management** - DPDP-compliant consent tracking with withdrawal support
- **📱 Mobile-First Design** - Responsive web interface and native Android application
- **⚡ Scalable Architecture** - Designed to handle 1,000+ leads per day

---

## Technology Stack

### Mobile & Web
- **React Native** with Expo for cross-platform mobile development
- **Next.js** with React for responsive web application
- **TypeScript** for type-safe development
- **Tailwind CSS** for premium styling
- **TanStack Query** for state management
- **Zustand** for client-side state

### Backend
- **NestJS** with Node.js for scalable API
- **PostgreSQL** for relational data
- **Redis** for caching and job queues
- **BullMQ** for background job processing
- **Prisma ORM** for database management

### Infrastructure
- **Microsoft Azure** for hosting
- **Azure App Service** for application deployment
- **Azure PostgreSQL** for managed database
- **Azure Blob Storage** for file storage
- **Docker** for containerization
- **CI/CD** for automated deployment

---

## Project Structure

```
vantiq/
├── apps/
│   ├── mobile/           # React Native + Expo application
│   │   ├── app/          # Expo Router file-based routing
│   │   ├── src/          # Components, hooks, services
│   │   └── eas.json      # Expo EAS configuration
│   │
│   ├── web/              # Next.js web application
│   │   ├── app/          # App router pages
│   │   ├── components/   # Reusable components
│   │   └── public/       # Static assets
│   │
│   └── backend/          # NestJS backend
│       ├── src/
│       │   ├── modules/  # Feature modules
│       │   ├── database/ # Prisma configuration
│       │   └── main.ts   # Entry point
│       └── prisma/       # Database schema and migrations
│
├── packages/
│   └── shared/          # Shared types and utilities
│
├── infrastructure/      # Azure and Docker configs
└── docs/               # Documentation

```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Redis 6+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd vantiq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   cd apps/backend
   npx prisma migrate dev
   npx prisma db push
   ```

5. **Start development servers**
   ```bash
   npm run dev
   ```

---

## Configuration

### Required Environment Variables

**Clerk Authentication:**
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**AI Models:**
- `AZURE_AI_ENDPOINT` and `AZURE_AI_API_KEY` (Qwen)
- `GROK_API_KEY` (Fallback)
- `NVIDIA_API_KEY` (Fallback)

**Integrations:**
- `APOLLO_API_KEY` (Lead acquisition)
- `APIFY_API_KEY` (Data extraction)

**Database & Cache:**
- `DATABASE_URL` (PostgreSQL)
- `REDIS_URL` (Redis)

**Storage:**
- `AZURE_STORAGE_ACCOUNT_NAME`
- `AZURE_STORAGE_ACCOUNT_KEY`

---

## API Documentation

API documentation is available at `/api` when the backend is running.

### Authentication
All protected endpoints require a JWT token in the `Authorization` header:
```
Authorization: Bearer <token>
```

### Key Endpoints

**Authentication:**
- `POST /api/v1/auth/validate` - Validate and create user
- `GET /api/v1/auth/me` - Get current user

**Leads:**
- `GET /api/v1/leads` - List leads
- `POST /api/v1/leads` - Create lead
- `GET /api/v1/leads/:id` - Get lead details
- `PUT /api/v1/leads/:id` - Update lead

**Dashboard:**
- `GET /api/v1/dashboard/metrics` - Get dashboard metrics

---

## Database Schema

The application uses a comprehensive PostgreSQL schema with:

- **Users & Authentication** - User profiles and role-based access control
- **Projects & Conversations** - AI workspace management
- **Leads** - Core lead data with identifiers, consent, and activity tracking
- **Campaigns** - Lead generation campaigns with targeting
- **Buyers** - Buyer profiles, products, and agreements
- **Distributions** - Lead assignments to buyers with acceptance tracking
- **Applications & Disbursements** - Application status and loan disbursement tracking
- **Commission System** - Immutable commission ledger with dispute management
- **Integrations** - External service connections and job tracking
- **Audit & Activity** - Complete audit trail for compliance

---

## Features in Detail

### Lead Generation Engine

**Acquisition Sources:**
1. Apollo.io - B2B company and contact discovery
2. Apify - Web scraping and data extraction
3. DuckDuckGo - Public business research
4. Manual Import - CSV, XLSX, Google Sheets
5. Landing Pages - Direct consumer loan applications

**Qualification System:**
- Configurable lead scoring (0-100 points)
- Automatic status assignment (Hot, Warm, Cold, Unqualified)
- AI-assisted qualification explanations

**Deduplication:**
- Phone number normalization
- Email normalization
- Cross-campaign duplicate detection
- Master lead identity tracking

### Commission Protection

**Unique Lead Attribution:**
- Every lead receives a unique VANTIQ ID
- Immutable acquisition timestamp and source
- Encrypted lead fingerprinting

**Distribution Receipt:**
- Timestamped distribution records
- Agreement version tracking
- Consent reference preservation

**Commission Ledger:**
- Fixed and percentage-based commissions
- Payment tracking (Expected → Approved → Received)
- Automatic dispute detection
- Precise decimal arithmetic for money

### AI Assistant

The integrated AI assistant supports:
- Business and market research
- Lead qualification analysis
- Campaign optimization
- Outreach message generation
- Document and spreadsheet analysis
- Code generation for integrations

**Model Configuration:**
- Primary: Azure AI Qwen deployment
- Secondary: Grok API
- Fallback: NVIDIA Nemotron

---

## Security & Compliance

VANTIQ implements comprehensive security measures:

- **Authentication:** Clerk OAuth with JWT tokens
- **Authorization:** Role-based access control (RBAC)
- **Data Protection:** Encryption at rest and in transit
- **Compliance:** DPDP consent management, audit trails
- **Secrets:** Environment-based configuration, no hardcoded secrets
- **API Security:** Rate limiting, input validation, CORS

---

## Development

### Running Tests
```bash
npm run test
```

### Building for Production
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Android APK Generation
```bash
cd apps/mobile
eas build --platform android
```

---

## Deployment

### Azure Deployment

1. **Create Azure resources:**
   - Azure App Service
   - Azure PostgreSQL
   - Azure Blob Storage
   - Redis Cache

2. **Configure deployment:**
   - Update `infrastructure/azure/config.yml`
   - Set environment variables in Azure portal

3. **Deploy:**
   ```bash
   az webapp deployment source config-zip --resource-group <rg> --name <app-name> --src app.zip
   ```

---

## Contributing

Contributions are welcome! Please:

1. Create a feature branch
2. Make your changes
3. Write tests for new functionality
4. Submit a pull request

---

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

## License

VANTIQ is proprietary software. All rights reserved.

---

**VANTIQ: Intelligence That Converts.**
