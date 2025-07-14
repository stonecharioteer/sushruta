# Sushruta - Self-Hosted Medicine Tracker

A family-friendly pill tracking application for managing medication schedules for humans and pets.

> **Named after [Sushruta](https://en.wikipedia.org/wiki/Sushruta)**, the ancient Indian physician and surgeon often called the "Father of Surgery" and "Father of Plastic Surgery." His contributions to medicine and surgical techniques continue to influence modern healthcare practices.

## Features

- 👨‍👩‍👧‍👦 **Family Management**: Track medications for all family members
- 🧬 **Gender & Species Tracking**: Visual icons for gender (male/female) and required pet species (cat/dog)
- 💊 **Medication Management**: Complete CRUD operations for medications with dosage tracking
- 📋 **Prescription Tracking**: Assign medications with schedules and active periods
- 📱 **Mobile-First Design**: Responsive UI optimized for mobile and desktop
- 📊 **Compliance Reporting**: Track intake history and missed doses
- 🔄 **Daily Schedule**: Visual timeline of medication schedules
- 🎨 **Beautiful Icons**: Fun SVG icons representing family member attributes
- 🐳 **Docker Ready**: Easy deployment with Docker Compose

## Tech Stack

- **Backend**: Express.js + TypeScript + PostgreSQL
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: PostgreSQL with TypeORM (SQLite fallback available)
- **Testing**: Jest (backend) + Vitest (frontend) + Playwright (E2E)
- **Architecture**: MVC pattern + 12-factor app methodology
- **DevOps**: Docker Compose + Just commands

## Gallery

![Dashboard](./docs/images/dashboard.png)
_Dashboard_
![Family Members](./docs/images/family-members.png)
_Family Members_
![Medication Page](./docs/images/medications.png)
_Medications_
![Prescriptions Page](./docs/images/prescriptions.png)
_Prescriptions_
![Schedule Page](./docs/images/schedule.png)
_Schedule_
![About Page](./docs/images/about.png)
_About_

## Quick Start

### Prerequisites

- Docker and Docker Compose
- [Just](https://github.com/casey/just) command runner (recommended)
- Node.js 18+ (for local development)

### Super Quick Demo

```bash
# Clone the repository
git clone <repository-url>
cd sushruta

# Start the complete demo (includes health checks and setup)
just demo

# Open the application (automatically opens browser)
just open
```

### Development Setup

1. **Clone and setup environment**:

   ```bash
   git clone <repository-url>
   cd sushruta
   cp .env.example .env
   ```

2. **Start with Just commands** (recommended):

   ```bash
   # Start complete demo with health checks
   just demo

   # View logs
   just logs

   # Check status
   just status

   # Run tests
   just test

   # Stop services
   just stop
   ```

3. **Or start with Docker Compose directly**:

   ```bash
   # Start all services (backend on :5415, frontend on :5416)
   docker compose up -d

   # View logs
   docker compose logs -f
   ```

4. **Local development** (optional):

   ```bash
   # Backend
   cd backend
   npm install
   npm run dev  # Starts on :3000

   # Frontend (in new terminal)
   cd frontend
   npm install
   npm run dev  # Starts on :3000
   ```

### Ports

- **Backend API**: `http://localhost:5415`
- **Frontend UI**: `http://localhost:5416`
- **PostgreSQL** (ready for migration): `localhost:5432`

## Development Status

🎉 **Feature Complete - Ready for Production**

### ✅ Completed

- **Backend**: Complete Express.js + TypeScript + PostgreSQL implementation
- **Frontend**: React + TypeScript + Tailwind CSS responsive UI
- **Database**: PostgreSQL with TypeORM, proper entity relationships
- **Testing**: Comprehensive test suites (Jest, Vitest, Playwright E2E)
- **Architecture**: Full MVC pattern with Services, Views, Controllers, Routes
- **Features**:
  - Family member management (humans and pets)
  - Medication inventory and prescription tracking
  - Daily medication schedules and compliance reporting
  - Mobile-first responsive design
- **DevOps**: Docker Compose setup with hot-reload development environment
- **Documentation**: Complete API documentation and user workflows
- **Quality**: ESLint, TypeScript, comprehensive validation

### 🔄 Current Branch: feat/pet-types

This branch includes pet type support and represents the complete initial implementation ready for production use.

### 🚀 Ready for Production

The application is feature-complete with all core functionality implemented and tested. Ready for deployment and real-world usage.

## Database Schema

```sql
-- Family members
family_members: id(uuid), name, type(enum), date_of_birth, gender(enum), species(enum),
                created_at, updated_at

-- Available medications
medications: id(uuid), name, dosage, frequency, instructions, created_at, updated_at

-- Prescribed medications to family members
prescriptions: id(uuid), family_member_id, medication_id, start_date, end_date,
              active, created_at, updated_at

-- Medication intake logs
medication_logs: id(uuid), prescription_id, scheduled_time, taken_time,
                status(enum), notes, created_at
```

### Enums

- **type**: `human`, `pet`
- **gender**: `male`, `female` (optional)
- **species**: `cat`, `dog` (required for pets)
- **status**: `pending`, `taken`, `missed`, `skipped`

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
# Application
NODE_ENV=development
PORT=3000

# Database (SQLite for development)
DATABASE_URL=sqlite:./database.sqlite
DATABASE_TYPE=sqlite

# For PostgreSQL migration:
# DATABASE_URL=postgresql://username:password@localhost:5432/sushruta
# DATABASE_TYPE=postgres

# Logging and Security
LOG_LEVEL=info
CORS_ORIGINS=http://localhost:5416
API_RATE_LIMIT=100
```

## Testing

```bash
# Run all tests (recommended)
just test

# Run specific test suites
just test-backend     # Backend unit + integration tests
just test-frontend    # Frontend unit tests
just test-e2e         # End-to-end tests with Playwright

# Run tests manually
cd backend && npm test           # Backend tests
cd frontend && npm test          # Frontend tests
cd frontend && npm run test:e2e  # E2E tests

# Run with coverage
cd backend && npm run test:coverage
cd frontend && npm run test:coverage
```

## Database Configuration

The application uses PostgreSQL by default with Docker Compose. For development with SQLite:

1. Update environment variables:

   ```bash
   DATABASE_TYPE=sqlite
   DATABASE_URL=sqlite:./database.sqlite
   ```

2. Restart the application:
   ```bash
   docker compose down
   docker compose up -d
   ```

For production PostgreSQL deployment, the Docker Compose setup includes a PostgreSQL service ready to use.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the established patterns
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details
