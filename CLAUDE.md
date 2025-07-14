## Workflow Memories

- Always update claude.md before making changes so that you can track what you're doing in case you run out of tokens.
- Always update claude.md, and readme.md
- Always use hadolint to lint dockerfiles, and if you know any other linter for docker-compose, use that.
- IMPORTANT you MUST use linters and formatters for all code.
- IMPORTANT always save the gameplan to claude.md so you can resume from it.
- IMPORTANT YOU MUST RUN LINTERS TO SEE IF THE CODE IS RIGHT BEFORE YOU COMMIT.

## Project Debugging Memories

**RESOLVED Issues:**
- ✅ The add family member page says "page not found" - Fixed by creating missing form components
- ✅ The family members page shows an error when no one is added to it - Fixed with proper error handling
- ✅ Prescription creation causing 500 errors - Fixed PrescriptionService to return with relations loaded
- ✅ Prescription form medication dropdown not showing medications - Fixed React Query v4 syntax and API calls
- ✅ Schedule page showing empty when prescriptions exist - Fixed to show active prescriptions instead of medication logs
- ✅ Medication preselection not working from URL parameters - Added useSearchParams support

**Key Architectural Decisions:**
- Schedule page now shows active prescriptions directly rather than waiting for medication logs
- Prescription form supports medication preselection via ?medicationId=xyz URL parameter
- Development environment supports hot-reload via docker-compose.dev.yml
- Date handling in backend views supports both Date objects and strings for PostgreSQL compatibility

## Project: Sushruta - Self-Hosted Medicine Tracker

### Project Overview
Building a family pill-tracker application with:
- Backend: Express.js + TypeScript + SQLite (PostgreSQL migration path)
- Frontend: React + TypeScript + Tailwind CSS (responsive)
- Testing: Comprehensive test suites (Jest + Vitest)
- Architecture: MVC pattern + 12-factor app methodology
- Deployment: Docker Compose (ports 5415 backend, 5416 frontend)

[... rest of the file remains unchanged ...]