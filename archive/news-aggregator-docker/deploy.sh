#!/bin/bash

# News Aggregator Deployment Script
# Supports multiple deployment platforms with zero monthly costs

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}  Match News Aggregator v1 - Deployment Script${NC}"
    echo -e "${BLUE}  🚀 Zero Monthly Costs, Maximum Value!${NC}"
    echo -e "${BLUE}================================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️ $1${NC}"
}

check_dependencies() {
    print_info "Checking dependencies..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed. Please install curl first."
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

setup_environment() {
    print_info "Setting up environment..."
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_info "Creating .env file from template..."
        cp .env.example .env
        print_warning "Please edit .env file with your actual configuration values"
        print_info "At minimum, set your MONGODB_CONNECTION_STRING"
        
        # Ask if user wants to edit now
        read -p "Do you want to edit .env file now? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    else
        print_success ".env file already exists"
    fi
    
    # Create necessary directories
    mkdir -p logs cache
    print_success "Created logs and cache directories"
}

validate_env() {
    print_info "Validating environment configuration..."
    
    # Check if MongoDB connection string is set
    if ! grep -q "^MONGODB_CONNECTION_STRING=mongodb" .env; then
        print_error "MongoDB connection string is not configured in .env file"
        print_info "Please set MONGODB_CONNECTION_STRING in .env file"
        exit 1
    fi
    
    print_success "Environment validation passed"
}

deploy_docker() {
    print_info "Deploying with Docker Compose..."
    
    # Build and start containers
    docker-compose build
    docker-compose up -d
    
    # Wait for service to be ready
    print_info "Waiting for service to be ready..."
    sleep 10
    
    # Health check
    if curl -f http://localhost:8000/api/v1/health > /dev/null 2>&1; then
        print_success "Service is running and healthy!"
        print_info "API available at: http://localhost:8000"
        print_info "Health check: http://localhost:8000/api/v1/health"
        print_info "API docs: http://localhost:8000/docs"
    else
        print_error "Service health check failed"
        print_info "Check logs with: docker-compose logs news-aggregator"
        exit 1
    fi
}

deploy_fly() {
    print_info "Deploying to Fly.io..."
    
    # Check if flyctl is installed
    if ! command -v flyctl &> /dev/null; then
        print_error "flyctl is not installed. Installing..."
        curl -L https://fly.io/install.sh | sh
        export PATH="$HOME/.fly/bin:$PATH"
    fi
    
    # Login check
    if ! flyctl auth whoami &> /dev/null; then
        print_info "Please login to Fly.io"
        flyctl auth login
    fi
    
    # Deploy
    if [ -f fly.toml ]; then
        print_info "Using existing fly.toml configuration"
        flyctl deploy
    else
        print_info "Creating new Fly.io app"
        flyctl launch --copy-config
        flyctl deploy
    fi
    
    # Set secrets
    print_info "Setting up secrets..."
    
    # Read MongoDB connection string from .env
    MONGODB_CONNECTION_STRING=$(grep "^MONGODB_CONNECTION_STRING=" .env | cut -d '=' -f2-)
    if [ -n "$MONGODB_CONNECTION_STRING" ]; then
        flyctl secrets set MONGODB_CONNECTION_STRING="$MONGODB_CONNECTION_STRING"
    fi
    
    # Set other optional secrets
    for secret in REDDIT_CLIENT_ID REDDIT_CLIENT_SECRET GUARDIAN_API_KEY NEWSDATA_API_KEY CURRENTS_API_KEY; do
        value=$(grep "^$secret=" .env | cut -d '=' -f2-)
        if [ -n "$value" ] && [ "$value" != "your_${secret,,}" ]; then
            flyctl secrets set "$secret=$value"
        fi
    done
    
    print_success "Deployment to Fly.io completed!"
    
    # Get app URL
    APP_URL=$(flyctl info --json | jq -r '.Hostname')
    if [ -n "$APP_URL" ]; then
        print_info "Your app is available at: https://$APP_URL"
        print_info "Health check: https://$APP_URL/api/v1/health"
    fi
}

deploy_railway() {
    print_info "Deployment to Railway.app..."
    print_info "To deploy to Railway:"
    print_info "1. Go to https://railway.app/"
    print_info "2. Connect your GitHub repository"
    print_info "3. Railway will automatically detect railway.json and deploy"
    print_info "4. Set environment variables in Railway dashboard:"
    
    # Show required environment variables
    echo "   - MONGODB_CONNECTION_STRING"
    echo "   - REDDIT_CLIENT_ID (optional)"
    echo "   - REDDIT_CLIENT_SECRET (optional)"
    echo "   - GUARDIAN_API_KEY (optional)"
    echo "   - NEWSDATA_API_KEY (optional)"
    echo "   - CURRENTS_API_KEY (optional)"
    
    print_success "Railway deployment instructions provided"
}

deploy_render() {
    print_info "Deployment to Render.com..."
    print_info "To deploy to Render:"
    print_info "1. Go to https://render.com/"
    print_info "2. Connect your GitHub repository"
    print_info "3. Render will automatically detect render.yaml and deploy"
    print_info "4. Set environment variables in Render dashboard (same as Railway)"
    
    print_success "Render deployment instructions provided"
}

test_deployment() {
    print_info "Testing deployment..."
    
    # Ask for the URL
    read -p "Enter your deployment URL (e.g., https://your-app.fly.dev): " APP_URL
    
    if [ -z "$APP_URL" ]; then
        print_warning "No URL provided, skipping tests"
        return
    fi
    
    # Health check
    print_info "Testing health endpoint..."
    if curl -f "$APP_URL/api/v1/health" > /dev/null 2>&1; then
        print_success "Health check passed"
    else
        print_error "Health check failed"
        return
    fi
    
    # Test API endpoints
    print_info "Testing API endpoints..."
    
    # Test aggregation trigger
    print_info "Testing aggregation trigger..."
    curl -X POST "$APP_URL/api/v1/matches/test-match/aggregate" \
        -H "Content-Type: application/json" \
        -d '{
            "home_team": "Manchester United",
            "away_team": "Liverpool",
            "match_date": "2024-03-15T15:00:00Z"
        }' \
        -w "\nHTTP Status: %{http_code}\n" \
        -s
    
    # Wait a bit for aggregation
    sleep 5
    
    # Test news retrieval
    print_info "Testing news retrieval..."
    curl -s "$APP_URL/api/v1/matches/test-match/news?limit=5" | jq '.article_count' 2>/dev/null || echo "Could not parse JSON response"
    
    print_success "Basic API tests completed"
}

show_menu() {
    echo
    print_info "Choose deployment method:"
    echo "1) Docker Compose (local)"
    echo "2) Fly.io (free cloud)"
    echo "3) Railway.app (free cloud)"
    echo "4) Render.com (free cloud)"
    echo "5) Test existing deployment"
    echo "6) Exit"
    echo
}

main() {
    print_header
    
    # Change to script directory
    cd "$(dirname "$0")"
    
    # Check dependencies
    check_dependencies
    
    # Setup environment
    setup_environment
    
    # Validate configuration
    validate_env
    
    # Show menu
    while true; do
        show_menu
        read -p "Enter your choice (1-6): " -n 1 -r
        echo
        
        case $REPLY in
            1)
                deploy_docker
                ;;
            2)
                deploy_fly
                ;;
            3)
                deploy_railway
                ;;
            4)
                deploy_render
                ;;
            5)
                test_deployment
                ;;
            6)
                print_info "Goodbye!"
                exit 0
                ;;
            *)
                print_error "Invalid option. Please choose 1-6."
                ;;
        esac
        
        echo
        read -p "Press Enter to continue..."
    done
}

# Run main function
main "$@"