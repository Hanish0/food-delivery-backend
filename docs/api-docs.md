# Food Delivery API Documentation

## Overview

This API provides endpoints for a food delivery application with three microservices:
- User Service (Port 3001)
- Restaurant Service (Port 3002) 
- Delivery Service (Port 3003)

## Authentication

Currently, no authentication is required. In production, implement JWT or session-based authentication.

## Error Responses

All endpoints return errors in the following format:
```json
{
  "error": "Error message description"
}
```

Common HTTP status codes:
- `400` - Bad Request (validation errors)
- `404` - Resource not found
- `409` - Conflict (duplicate data)
- `500` - Internal server error

## Rate Limiting

All endpoints are rate-limited to 100 requests per 15-minute window per IP address.

## User Service API

### Health Check
- **GET** `/health`
- Returns service status

### Users
- **POST** `/api/users`
- Create a new user
- Body: `{ name, email, phone, address }`

- **GET** `/api/users/:id`
- Get user by ID

### Restaurants
- **GET** `/api/restaurants/available`
- Get all restaurants currently online and within operating hours
- Returns restaurants with their menu items

- **GET** `/api/restaurants/:id/menu`
- Get menu for specific restaurant

### Orders
- **POST** `/api/orders`
- Place a new order
- Body: `{ user_id, restaurant_id, delivery_address, items: [{ menu_item_id, quantity }] }`

- **GET** `/api/orders/user/:user_id`
- Get all orders for a user

### Ratings
- **POST** `/api/ratings`
- Submit rating for completed order
- Body: `{ user_id, order_id, restaurant_rating?, delivery_agent_rating?, restaurant_review?, delivery_review? }`

## Restaurant Service API

### Restaurants
- **POST** `/api/restaurants`
- Create new restaurant
- Body: `{ name, address, phone, email, opening_time, closing_time }`

- **GET** `/api/restaurants/:id`
- Get restaurant details

- **PATCH** `/api/restaurants/:id/status`
- Update online/offline status
- Body: `{ is_online: boolean }`

### Menu Management
- **POST** `/api/menu`
- Add menu item
- Body: `{ restaurant_id, name, description?, price, category }`

- **PATCH** `/api/menu/:id`
- Update menu item
- Body: `{ name?, description?, price?, is_available?, category? }`

- **GET** `/api/menu/restaurant/:restaurant_id`
- Get all menu items for restaurant

### Order Management
- **GET** `/api/orders/restaurant/:restaurant_id`
- Get orders for restaurant
- Query: `?status=pending` (optional)

- **PATCH** `/api/orders/:id/status`
- Update order status
- Body: `{ status: 'accepted'|'rejected'|'preparing'|'ready', restaurant_id }`
- Note: Accepting an order automatically assigns an available delivery agent

## Delivery Service API

### Delivery Agents
- **POST** `/api/agents`
- Create delivery agent
- Body: `{ name, phone, email, current_location? }`

- **GET** `/api/agents/:id`
- Get agent details

- **PATCH** `/api/agents/:id/availability`
- Update availability status
- Body: `{ is_available: boolean }`

- **PATCH** `/api/agents/:id/location`
- Update current location
- Body: `{ current_location: string }`

### Delivery Management
- **GET** `/api/deliveries/agent/:agent_id`
- Get deliveries assigned to agent
- Query: `?status=ready` (optional)

- **PATCH** `/api/deliveries/:order_id/status`
- Update delivery status
- Body: `{ status: 'picked_up'|'delivered', delivery_agent_id }`
- Note: Marking as 'delivered' makes the agent available again

## Order Status Flow

1. `pending` - Order placed by user
2. `accepted` - Restaurant accepts (agent auto-assigned)
3. `rejected` - Restaurant rejects
4. `preparing` - Restaurant preparing food
5. `ready` - Food ready for pickup
6. `picked_up` - Agent picked up order
7. `delivered` - Order delivered to customer

## Sample Workflow

1. Create user, restaurant, delivery agent
2. Add menu items to restaurant
3. User browses available restaurants
4. User places order
5. Restaurant accepts order (agent auto-assigned)
6. Restaurant updates status: preparing → ready
7. Agent updates status: picked_up → delivered
8. User submits rating

## Testing

Use the provided Postman collection for comprehensive API testing. The collection includes:
- Individual endpoint tests
- Complete workflow examples
- Environment variables for easy configuration

For load testing, use the included `scripts/load-test.js` script.