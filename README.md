# Sushruta - Self-Hosted Medicine Tracker

A family-friendly pill tracking application for managing medication schedules for humans and pets.

## Features

- 👨‍👩‍👧‍👦 **Family Management**: Track medications for all family members (humans and pets)
- 💊 **Medication Management**: Complete CRUD operations for medications with dosage tracking
- 📋 **Prescription Tracking**: Assign medications with schedules and active periods
- 📱 **Mobile-First Design**: Responsive UI optimized for mobile and desktop
- 📊 **Compliance Reporting**: Track intake history and missed doses
- 🔄 **Daily Schedule**: Visual timeline of medication schedules
- 🐳 **Docker Ready**: Easy deployment with Docker Compose

## Tech Stack

- **Backend**: Express.js + TypeScript + SQLite (PostgreSQL ready)
- **Frontend**: React + TypeScript + Tailwind CSS
- **Database**: SQLite with TypeORM (easy PostgreSQL migration)
- **Testing**: Jest (backend) + Vitest (frontend)
- **Architecture**: MVC pattern + 12-factor app methodology

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)

### Development Setup

1. **Clone and setup environment**:
   ```bash
   git clone <repository-url>
   cd sushruta
   cp .env.example .env
   ```

2. **Start with Docker Compose**:
   ```bash
   # Start all services (backend on :5415, frontend on :5416)
   docker-compose up -d
   
   # View logs
   docker-compose logs -f
   ```

3. **Local development** (optional):
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

🚧 **Currently In Development** 

### ✅ Completed
- Project structure and Docker configuration
- Backend foundation with Express.js + TypeScript + TypeORM
- Database models for family members, medications, prescriptions, and logs
- 12-factor app configuration with environment validation
- Middleware for error handling, validation, and logging
- Comprehensive validation schemas

### 🔄 In Progress
- MVC architecture completion (Services, Views, Controllers, Routes)
- Backend API endpoints implementation
- Comprehensive test suite

### 📋 Planned
- React frontend with Tailwind CSS
- Responsive UI components
- Frontend testing suite
- End-to-end integration testing

## Database Schema

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
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests (when implemented)
cd frontend
npm test

# Run all tests with Docker
docker-compose -f docker-compose.test.yml up
```

## Migration from SQLite to PostgreSQL

When ready to deploy:

1. Update environment variables:
   ```bash
   DATABASE_TYPE=postgres
   DATABASE_URL=postgresql://username:password@host:5432/sushruta
   ```

2. Restart the application:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make changes following the established patterns
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details
