# Sushruta Medicine Tracker - Justfile
# Set default shell to bash
set shell := ["bash", "-c"]

# Default recipe
default:
    @just --list

# Demo command - launches the complete application stack
demo:
    #!/usr/bin/env bash
    set -euo pipefail
    
    echo "🏥 Starting Sushruta Medicine Tracker Demo..."
    echo ""
    
    # Check if Docker is running
    if ! docker info >/dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker and try again."
        exit 1
    fi
    
    # Stop any existing containers
    echo "🛑 Stopping any existing containers..."
    docker compose down --remove-orphans || true
    
    # Build and start the application
    echo "🔨 Building and starting application containers..."
    docker compose up --build -d
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to start..."
    sleep 10
    
    # Check service health
    echo "🔍 Checking service health..."
    
    # Wait for backend to be healthy
    echo "   Checking backend health..."
    max_attempts=30
    attempt=1
    while [ $attempt -le $max_attempts ]; do
        if curl -sf http://localhost:5415/health >/dev/null 2>&1; then
            echo "   ✅ Backend is healthy"
            break
        fi
        if [ $attempt -eq $max_attempts ]; then
            echo "   ❌ Backend failed to start after $max_attempts attempts"
            echo "   📋 Backend logs:"
            docker compose logs backend --tail=10
            exit 1
        fi
        echo "   ⏳ Attempt $attempt/$max_attempts - waiting for backend..."
        sleep 2
        ((attempt++))
    done
    
    # Check frontend
    echo "   Checking frontend..."
    if curl -sf http://localhost:5416 >/dev/null 2>&1; then
        echo "   ✅ Frontend is healthy"
    else
        echo "   ❌ Frontend is not responding"
        echo "   📋 Frontend logs:"
        docker compose logs frontend --tail=10
        exit 1
    fi
    
    # Show container status
    echo ""
    echo "📊 Container Status:"
    docker compose ps
    
    echo ""
    echo "🎉 Sushruta Medicine Tracker Demo is ready!"
    echo ""
    echo "📱 Application URLs:"
    echo "   Frontend:    http://localhost:5416"
    echo "   Backend API: http://localhost:5415"
    echo "   Health:      http://localhost:5415/health"
    echo ""
    echo "🐘 Database:"
    echo "   PostgreSQL:  localhost:5432"
    echo "   Username:    sushruta"
    echo "   Password:    sushruta_dev_password"
    echo "   Database:    sushruta"
    echo ""
    echo "🏥 About Sushruta:"
    echo "   Named after the ancient Indian physician and surgeon,"
    echo "   this application helps families track medication for"
    echo "   both humans and pets with scheduling and compliance."
    echo ""
    echo "⚡ Quick Start:"
    echo "   1. Open http://localhost:5416 in your browser"
    echo "   2. Add family members"
    echo "   3. Add medications to your inventory"
    echo "   4. Create prescriptions linking medications to family members"
    echo "   5. Track daily medication schedules and compliance"
    echo ""
    echo "🛑 To stop the demo:"
    echo "   just stop"

# Stop all services
stop:
    #!/usr/bin/env bash
    echo "🛑 Stopping Sushruta Medicine Tracker..."
    docker compose down
    echo "✅ All services stopped"

# View logs for all services
logs:
    docker compose logs -f

# View logs for a specific service
logs-service service:
    docker compose logs -f {{service}}

# Show status of all containers
status:
    docker compose ps

# Restart all services
restart:
    #!/usr/bin/env bash
    echo "🔄 Restarting Sushruta Medicine Tracker..."
    docker compose restart
    echo "✅ All services restarted"

# Clean up everything (containers, volumes, images)
clean:
    #!/usr/bin/env bash
    echo "🧹 Cleaning up Sushruta Medicine Tracker..."
    docker compose down --remove-orphans --volumes
    docker system prune -f
    echo "✅ Cleanup complete"

# Run tests
test:
    #!/usr/bin/env bash
    echo "🧪 Running Sushruta tests..."
    docker compose -f docker-compose.test.yml build
    docker compose -f docker-compose.test.yml up --abort-on-container-exit
    docker compose -f docker-compose.test.yml down

# Run backend tests only
test-backend:
    docker compose -f docker-compose.test.yml run --rm backend-test

# Run frontend tests only
test-frontend:
    docker compose -f docker-compose.test.yml run --rm frontend-test

# Run end-to-end tests (requires running application)
test-e2e:
    #!/usr/bin/env bash
    echo "🎭 Running end-to-end tests..."
    cd frontend
    npm run test:e2e

# Run linting
lint:
    #!/usr/bin/env bash
    echo "🔍 Running linting..."
    echo "Backend linting:"
    docker compose -f docker-compose.test.yml run --rm backend-test npm run lint
    echo "Frontend linting:"
    docker compose -f docker-compose.test.yml run --rm frontend-test npm run lint

# Build all images
build:
    docker compose build

# Open application in browser (macOS/Linux)
open:
    #!/usr/bin/env bash
    if command -v open >/dev/null 2>&1; then
        open http://localhost:5416
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open http://localhost:5416
    else
        echo "Please open http://localhost:5416 in your browser"
    fi

# Show application info
info:
    #!/usr/bin/env bash
    echo "🏥 Sushruta Medicine Tracker"
    echo ""
    echo "📖 Description:"
    echo "   Self-hosted family medicine tracker for humans and pets"
    echo "   Named after Sushruta, the ancient Indian physician and surgeon"
    echo ""
    echo "🛠️  Technology Stack:"
    echo "   Backend:  Express.js + TypeScript + PostgreSQL"
    echo "   Frontend: React + TypeScript + Tailwind CSS"
    echo "   Deploy:   Docker + Docker Compose"
    echo ""
    echo "🎯 Features:"
    echo "   • Family member management (humans and pets)"
    echo "   • Medication inventory tracking"
    echo "   • Prescription management"
    echo "   • Daily medication scheduling"
    echo "   • Compliance reporting and statistics"
    echo "   • Responsive mobile-friendly interface"
    echo ""
    echo "🔧 Commands:"
    echo "   just demo     - Start the complete demo"
    echo "   just stop     - Stop all services"
    echo "   just test     - Run all tests"
    echo "   just clean    - Clean up everything"
    echo "   just logs     - View all logs"
    echo "   just status   - Show container status"

# Help command
help:
    @just --list