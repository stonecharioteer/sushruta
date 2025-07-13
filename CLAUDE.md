## Workflow Memories

- Always update claude.md before making changes so that you can track what you're doing in case you run out of tokens.
- Always update claude.md, and readme.md
- Always use hadolint to lint dockerfiles, and if you know any other linter for docker-compose, use that.
- IMPORTANT you MUST use linters and formatters for all code.
- IMPORTANT always save the gameplan to claude.md so you can resume from it.

## Project: Sushruta - Self-Hosted Medicine Tracker

### Project Overview
Building a family pill-tracker application with:
- Backend: Express.js + TypeScript + SQLite (PostgreSQL migration path)
- Frontend: React + TypeScript + Tailwind CSS (responsive)
- Testing: Comprehensive test suites (Jest + Vitest)
- Architecture: MVC pattern + 12-factor app methodology
- Deployment: Docker Compose (ports 5415 backend, 5416 frontend)

### Features
- Family member management (humans and pets)
- Medication and prescription tracking
- Daily schedule and intake logging
- Compliance reporting
- Mobile-first responsive design

### Detailed Implementation Plan

#### Architecture Overview
- **Backend**: Express.js + TypeScript + SQLite → PostgreSQL migration path
- **Frontend**: React + TypeScript + Tailwind CSS (mobile-first responsive)
- **Testing**: Comprehensive test suites (Jest + Vitest) with 80%+ coverage
- **Architecture**: Strict MVC pattern + 12-factor app methodology
- **Deployment**: Docker Compose (ports 5415 backend, 5416 frontend)

#### Database Schema
```sql
-- Family members (humans and pets)
family_members: id(uuid), name, type(enum), date_of_birth, created_at, updated_at

-- Available medications
medications: id(uuid), name, dosage, frequency, instructions, created_at, updated_at

-- Prescribed medications to family members
prescriptions: id(uuid), family_member_id, medication_id, start_date, end_date, 
              active, created_at, updated_at

-- Medication intake logs
medication_logs: id(uuid), prescription_id, scheduled_time, taken_time, 
                status(enum), notes, created_at
```

#### Backend MVC Structure
```
backend/src/
├── models/           # TypeORM entities (M)
├── views/            # Response formatters/serializers (V)
├── controllers/      # Request handlers (C)
├── services/         # Business logic layer
├── middleware/       # Auth, validation, error handling
├── routes/           # Route definitions
├── config/           # 12-factor app configuration
├── utils/            # Helper functions
└── tests/
    ├── unit/         # Service/utility tests
    ├── integration/  # API endpoint tests
    └── fixtures/     # Test data
```

#### Key Features
1. **Family Management**: Add/edit humans and pets with validation
2. **Medication Management**: CRUD operations with dosage and frequency tracking
3. **Prescription Tracking**: Assign medications with start/end dates and schedules
4. **Daily Schedule**: Mobile-friendly medication timeline view
5. **Intake Logging**: Track taken/missed/skipped doses with timestamps
6. **Compliance Reports**: Analytics dashboard with export functionality
7. **Responsive UI**: Tailwind CSS optimized for mobile and desktop

#### Files Created ✅
**Project Structure:**
- `.env.example` - Environment configuration template
- `docker-compose.yml` - Development environment
- `docker-compose.test.yml` - Testing environment
- `.gitignore` - Updated with database and Docker entries

**Backend Foundation:**
- `backend/package.json` - Dependencies and scripts
- `backend/tsconfig.json` - TypeScript configuration with path mapping
- `backend/jest.config.js` - Testing configuration with 80% coverage
- `backend/.eslintrc.js` - Code quality rules
- `backend/Dockerfile` - Multi-stage build (dev/test/prod)

**Configuration (12-Factor):**
- `backend/src/config/index.ts` - Environment validation with Joi
- `backend/src/config/database.ts` - TypeORM DataSource configuration
- `backend/src/config/logger.ts` - Winston structured logging

**Models (M in MVC):**
- `backend/src/models/FamilyMember.ts` - Family member entity with enum types
- `backend/src/models/Medication.ts` - Medication entity with validation
- `backend/src/models/Prescription.ts` - Prescription relationships
- `backend/src/models/MedicationLog.ts` - Intake logging with status enum
- `backend/src/models/index.ts` - Model exports

**Middleware:**
- `backend/src/middleware/errorHandler.ts` - Global error handling with AppError class
- `backend/src/middleware/validation.ts` - Request validation wrapper
- `backend/src/middleware/requestLogger.ts` - Structured request logging

**Utilities:**
- `backend/src/utils/validationSchemas.ts` - Joi schemas for all endpoints

#### Next Steps to Complete
**Backend (MVC Architecture):**
- [ ] Create services layer (business logic)
- [ ] Create views layer (response formatters)
- [ ] Create controllers (request handlers)
- [ ] Create routes (endpoint definitions)
- [ ] Create main app.ts file
- [ ] Write comprehensive test suite
- [ ] Test Docker build

**Frontend:**
- [ ] Initialize React + TypeScript + Tailwind
- [ ] Create responsive UI components
- [ ] Implement state management with React Query
- [ ] Add frontend test suite
- [ ] Test integration with backend

**Final Integration:**
- [ ] End-to-end testing
- [ ] Documentation and README updates
- [ ] Performance optimization

### Progress Tracking
- [COMPLETED] Update CLAUDE.md with project plan and progress tracking
- [COMPLETED] Setup project structure (backend and frontend directories)
- [COMPLETED] Update .gitignore with additional entries
- [COMPLETED] Create Docker Compose configuration
- [COMPLETED] Initialize backend with Express.js + TypeScript + TypeORM
- [IN PROGRESS] Implement MVC architecture and 12-factor config
- [COMPLETED] Create database models and migrations
- [PENDING] Implement backend API endpoints with validation
- [PENDING] Add comprehensive backend test suite
- [PENDING] Initialize frontend with React + TypeScript + Tailwind
- [PENDING] Create responsive UI components
- [PENDING] Implement frontend features and state management
- [PENDING] Add frontend test suite
- [PENDING] Test complete application with Docker Compose

### Current Status
**Backend: 95% Complete**
- ✅ Project structure and Docker configuration
- ✅ TypeScript, ESLint, Jest configuration with working build pipeline
- ✅ 12-factor app configuration system with environment validation
- ✅ TypeORM models with proper relationships and enums
- ✅ Middleware for error handling, validation, and logging
- ✅ Joi validation schemas for all endpoints
- ✅ Complete MVC architecture implemented:
  - **Services Layer**: Business logic for all entities with proper error handling
  - **Views Layer**: Response formatters with consistent API structure
  - **Controllers Layer**: Request handlers with validation and error handling
  - **Routes Layer**: RESTful API endpoints with proper middleware
- ✅ Main app.ts with Express server, database initialization, and graceful shutdown
- ✅ Comprehensive linting with ESLint and successful TypeScript compilation
- 🔄 Currently need: Backend test suite

**Blockers Resolved:**
- ✅ Generated package-lock.json (Docker build working)
- ✅ Fixed Jest configuration issues
- ✅ ESLint properly configured and all code linted
- ✅ TypeScript compilation successful

**Linting Status:**
✅ All code now passes comprehensive linting:
- hadolint for Dockerfile
- yamllint for docker-compose files
- ESLint for TypeScript code
- TypeScript compiler with strict checking

**Major Backend Features Implemented:**
- Complete CRUD operations for Family Members, Medications, Prescriptions, and Medication Logs
- Advanced features: daily schedule, compliance statistics, search functionality
- Health check endpoints for monitoring (health, readiness, liveness)
- Robust error handling and request logging
- Type-safe API with comprehensive validation

**API Endpoints Available:**
- `/api/family-members` - Family member management
- `/api/medications` - Medication management with search
- `/api/prescriptions` - Prescription tracking with filtering
- `/api/medication-logs` - Intake logging with compliance stats
- `/health`, `/ready`, `/live` - Health monitoring endpoints

**Ready to Continue:**
Backend is nearly complete with full MVC architecture. Next step is to add comprehensive test suite, then move to frontend development with React + TypeScript + Tailwind CSS.