# Food Delivery Backend

A microservices-based food delivery application backend built with TypeScript, Express, and PostgreSQL.

## Architecture

The system consists of three microservices:

1. **User Service** (Port 3001)
   - User management
   - Restaurant listing
   - Order placement
   - Rating system

2. **Restaurant Service** (Port 3002)
   - Restaurant management
   - Menu management
   - Order processing
   - Delivery agent assignment

3. **Delivery Service** (Port 3003)
   - Delivery agent management
   - Delivery status updates

## Local Development Setup

Choose one of the following approaches based on your preference:

### Option 1: Docker Setup (Recommended - Easier)

**Prerequisites:**
- Docker and Docker Compose
- Git

**Steps:**
1. Clone the repository:
```bash
git clone <your-repo-url>
cd food-delivery-backend
```

2. Set up environment variables:
```bash
cp .env.example .env
# The default values in .env work perfectly for Docker setup
```

3. Start all services with Docker:
```bash
# This will start PostgreSQL + all 3 microservices
docker-compose --env-file .env up --build
```



**Access the services:**
- User Service: http://localhost:3001
- Restaurant Service: http://localhost:3002  
- Delivery Service: http://localhost:3003
- PostgreSQL: localhost:5432

### Option 2: Manual Setup (Without Docker)

**Prerequisites:**
- Node.js 18+
- PostgreSQL 15+ installed locally
- Git

**Steps:**
1. Clone the repository:
```bash
git clone <your-repo-url>
cd food-delivery-backend
```

2. Set up PostgreSQL database:
```bash
# Create database (using psql or pgAdmin)
createdb food_delivery

# Or using psql
psql -U postgres -c "CREATE DATABASE food_delivery;"
```

3. Run database migrations:
```bash
# Connect to your database and run the migration
psql -U postgres -d food_delivery -f migrations/init.sql
```

4. Install dependencies for all services:
```bash
# Install root dependencies
npm install

# Install service dependencies
cd user-service && npm install && cd ..
cd restaurant-service && npm install && cd ..
cd delivery-service && npm install && cd ..
```

5. Set up environment variables:
```bash
cp .env.example .env
# Edit .env file and update DATABASE_URL to match your local PostgreSQL:
# DATABASE_URL=postgresql://postgres:your_password@localhost:5432/food_delivery
```

6. Start each service in separate terminals:
```bash
# Terminal 1 - User Service
cd user-service && npm run dev

# Terminal 2 - Restaurant Service  
cd restaurant-service && npm run dev

# Terminal 3 - Delivery Service
cd delivery-service && npm run dev
```

**Access the services:**
- User Service: http://localhost:3001
- Restaurant Service: http://localhost:3002
- Delivery Service: http://localhost:3003





## API Endpoints

### User Service (3001)

#### Users
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user

#### Restaurants
- `GET /api/restaurants/available` - Get available restaurants
- `GET /api/restaurants/:id/menu` - Get restaurant menu

#### Orders
- `POST /api/orders` - Place order
- `GET /api/orders/user/:user_id` - Get user orders

#### Ratings
- `POST /api/ratings` - Submit rating

### Restaurant Service (3002)

#### Restaurants
- `POST /api/restaurants` - Create restaurant
- `GET /api/restaurants/:id` - Get restaurant
- `PATCH /api/restaurants/:id/status` - Update online status

#### Menu
- `POST /api/menu` - Add menu item
- `PATCH /api/menu/:id` - Update menu item
- `GET /api/menu/restaurant/:restaurant_id` - Get restaurant menu

#### Orders
- `GET /api/orders/restaurant/:restaurant_id` - Get restaurant orders
- `PATCH /api/orders/:id/status` - Update order status

### Delivery Service (3003)

#### Agents
- `POST /api/agents` - Create delivery agent
- `GET /api/agents/:id` - Get agent details
- `PATCH /api/agents/:id/availability` - Update availability
- `PATCH /api/agents/:id/location` - Update location

#### Deliveries
- `GET /api/deliveries/agent/:agent_id` - Get agent deliveries
- `PATCH /api/deliveries/:order_id/status` - Update delivery status

## Deployment

The application supports multiple deployment methods:

### 1. Render (Cloud PaaS) - Recommended for Production

The application is configured for one-click deployment on Render using `render.yaml`.

#### Prerequisites
- GitHub/GitLab repository
- Render account

#### Deployment Steps
1. Push your code to a Git repository
2. Connect your repository to Render
3. Render will automatically detect `render.yaml` and deploy all services
4. Database migrations run automatically on first startup

#### Production Environment Variables (Add in Render Dashboard)
```bash
# Critical - Generate a strong secret
JWT_SECRET=your-super-secure-production-jwt-secret-at-least-32-characters-long

# Optional - Adjust for production load
RATE_LIMIT_MAX_REQUESTS=1000
DB_POOL_MAX=20
LOG_LEVEL=warn
```


### 2. Docker Compose (Self-hosted)

For VPS or dedicated server deployment.

#### Production Deployment
```bash
# Clone repository
git clone <your-repo>
cd food-delivery-backend

# Set up environment
cp .env.example .env
# Edit .env with production values

# Deploy with production compose (migrations run automatically)
docker-compose -f docker-compose.prod.yml --env-file .env up --build -d
```

**Note**: Database migrations run automatically when PostgreSQL container starts for the first time.

#### Development Deployment
```bash
# Migrations run automatically on first startup
docker-compose --env-file .env up --build
```

### 3. Kubernetes

Kubernetes manifests are available in the `k8s/` directory.

```bash
# Apply all manifests (migrations run automatically)
kubectl apply -f k8s/

# Check deployment status
kubectl get pods -n food-delivery
```

**Note**: Database migrations are handled automatically through init containers or PostgreSQL's docker-entrypoint-initdb.d mechanism.

### Environment Variables

The application uses environment variables for configuration:

#### Core Variables
- `DATABASE_URL` - PostgreSQL connection string
- `NODE_ENV` - Environment (development/production)
- `PORT` - Service port (auto-configured in containers)
- `JWT_SECRET` - Secret key for JWT tokens (**MUST change in production**)

#### Service Communication
- `USER_SERVICE_URL` - User service endpoint
- `RESTAURANT_SERVICE_URL` - Restaurant service endpoint  
- `DELIVERY_SERVICE_URL` - Delivery service endpoint
- `USER_SERVICE_PORT` - User service port (default: 3001)
- `RESTAURANT_SERVICE_PORT` - Restaurant service port (default: 3002)
- `DELIVERY_SERVICE_PORT` - Delivery service port (default: 3003)

#### Performance & Security
- `RATE_LIMIT_WINDOW_MS` - Rate limiting window (default: 900000ms)
- `RATE_LIMIT_MAX_REQUESTS` - Max requests per window (default: 100)
- `DB_POOL_MIN` - Minimum database connections (default: 2)
- `DB_POOL_MAX` - Maximum database connections (default: 10)
- `LOG_LEVEL` - Logging level (default: info)

#### Database Configuration
- `POSTGRES_PASSWORD` - PostgreSQL password (for Docker deployments)

### How Database Migrations Work

The application handles database migrations automatically across all deployment methods:

#### Docker Deployments
- PostgreSQL containers use `docker-entrypoint-initdb.d/` mechanism
- `migrations/init.sql` is automatically mounted and executed on first startup
- No manual intervention required

#### Render Deployment
- Managed PostgreSQL database is created automatically
- Database schema and sample data are initialized through the application startup process
- First service to connect runs the migration automatically

#### Kubernetes Deployment
- Init containers or PostgreSQL's auto-initialization handles migrations
- Database is ready before application services start



## Database Schema

The system uses PostgreSQL with the following main tables:
- `users` - User information
- `restaurants` - Restaurant details
- `menu_items` - Restaurant menu items
- `delivery_agents` - Delivery agent information
- `orders` - Order details
- `order_items` - Order line items
- `ratings` - User ratings and reviews



## Project Structure

```
food-delivery-backend/
├── user-service/           # User management service
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── restaurant-service/     # Restaurant management service
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── delivery-service/       # Delivery management service
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── shared/                 # Shared utilities and types
│   ├── database.ts
│   ├── config.ts
│   └── types.ts
├── migrations/             # Database migrations
│   └── init.sql
├── k8s/                   # Kubernetes manifests
├── scripts/               # Utility scripts
├── docs/                  # API documentation
├── docker-compose.yml     # Development setup
├── docker-compose.prod.yml # Production setup
├── render.yaml           # Render deployment config
└── README.md
```

## Testing

The project includes various testing utilities:

```bash
# Test database connection
node scripts/check-db.js

# Test API endpoints
node scripts/test-endpoints.js

# Load testing
node scripts/load-test.js
```

## Monitoring and Logs

### Development
```bash
# View logs for all services
docker-compose logs -f

# View logs for specific service
docker-compose logs -f user-service
```

### Production (Docker)
```bash
# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Monitor resource usage
docker stats
```

### Render
- Access logs through Render dashboard
- Built-in monitoring and alerting
- Automatic log retention