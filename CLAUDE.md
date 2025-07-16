## Workflow Memories

- Always update claude.md before making changes so that you can track what you're doing in case you run out of tokens.
- Always update claude.md, and readme.md
- Always use hadolint to lint dockerfiles, and if you know any other linter for docker-compose, use that.
- IMPORTANT you MUST use linters and formatters for all code.
- IMPORTANT always save the gameplan to gameplan.md so you can resume from it.
- IMPORTANT YOU MUST RUN LINTERS TO SEE IF THE CODE IS RIGHT BEFORE YOU COMMIT.
- You must follow the test plan you create.
- When creating tests to test a feature, ensure these are saved to the right folder for tests and written in a way that they can be run automatically. This shouldn't be temporary hacks written to some scripts in /tmp or elsewhere. And the results of the tests must not be written to git history. All tests must be replicable, so ensure that you write the tests in a TDD-inspired way (but don't be pedantic about that).
- You must add any new behaviour to the automated tests. Backend specific changes should first go to the backend tests, and then they should be tested e2e in the frontend as well. Using curl to test is not good, use testing frameworks for this.
- You must run tests always before pushing code.

## Project: Sushruta - Self-Hosted Medicine Tracker

### Project Overview
Building a family pill-tracker application with:
- Backend: Express.js + TypeScript + PostgreSQL (with SQLite support)
- Frontend: React + TypeScript + Tailwind CSS (responsive)
- Testing: Comprehensive test suites (Jest + Vitest + Playwright E2E)
- Architecture: MVC pattern + 12-factor app methodology
- Deployment: Docker Compose (ports 5415 backend, 5416 frontend)

### Current Status
- **COMPLETED**: Full-stack implementation with comprehensive features
- **COMPLETED**: Pet and human member type support in models and frontend
- **COMPLETED**: Complete API endpoints for family members, medications, prescriptions, logs
- **COMPLETED**: React frontend with responsive design and forms
- **COMPLETED**: Docker Compose setup with PostgreSQL and hot-reload dev environment
- **COMPLETED**: Comprehensive testing suite (unit, integration, e2e)
- **COMPLETED**: Justfile with demo commands and project management
- **COMPLETED**: Full medication tracking workflow from creation to daily schedules
- **COMPLETED**: Prescription cache invalidation bug fix (Issue #6)

### Key Features
- Family member management (humans and pets with gender/species fields)
- Medication inventory with comprehensive tracking
- Prescription management with pause/unpause functionality
- Daily medication schedule generation with real-time updates
- Compliance tracking and reporting
- Responsive mobile-first UI with SVG icons
- PostgreSQL database with proper relationships
- Comprehensive validation and error handling

### Database Architecture
- PostgreSQL as primary database (with SQLite fallback)
- TypeORM for database operations
- Proper entity relationships and validation
- UUID primary keys for all entities

### Testing Strategy
- Backend: Jest with supertest for API integration tests
- Frontend: Vitest for unit tests
- E2E: Playwright for comprehensive user workflow testing
- Test coverage tracking enabled

### Development Tools
- ESLint for code linting (both frontend and backend)
- TypeScript for type safety
- Prettier for code formatting
- Docker for consistent development environment
- Justfile for project management commands

### Key Commands
- `just demo` - Launch complete application stack
- `just test` - Run all tests (unit + integration + e2e)
- `just lint` - Run linting for both frontend and backend
- `just clean` - Clean up Docker containers and volumes

### Project Status
The project is **production-ready** with full functionality, comprehensive testing, and documentation. Recent work completed the prescription cache invalidation bug fix with comprehensive test coverage.

### File Organization
- **GAMEPLAN.md**: Implementation details, bug fixes, and completed features
- **CLAUDE.md**: Workflow memories and core project information
- **README.md**: User-facing documentation and setup instructions