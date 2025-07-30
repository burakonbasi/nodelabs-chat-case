# Nodelabs Chat Case - Real-time Messaging System

A scalable, secure, and performant real-time messaging backend built with Node.js v22, featuring automatic message scheduling, real-time communication, and comprehensive monitoring.

## 🚀 Features

- **Real-time Messaging**: Socket.IO powered instant messaging
- **Authentication**: JWT-based auth with refresh tokens
- **Auto Messaging**: Cron-based automatic message scheduling
- **Message Queue**: RabbitMQ for reliable message delivery
- **Search**: Elasticsearch integration for message search
- **Caching**: Redis for online status and performance
- **Monitoring**: Sentry error tracking and Winston logging
- **API Docs**: Swagger/OpenAPI documentation
- **Security**: Helmet, CORS, rate limiting, input validation

## 📋 Prerequisites

- Node.js v22+
- MongoDB
- Redis
- RabbitMQ
- Elasticsearch (optional)
- Sentry account (optional)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/burakonbasi/nodelabs-chat-case.git
cd nodelabs-chat-case
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration

5. Start services (MongoDB, Redis, RabbitMQ):
```bash
# Using Docker Compose (optional)
docker-compose up -d mongodb redis rabbitmq
```

6. Run the application:
```bash
# Development
npm run dev

# Production
npm start
```

## 🏗️ Project Structure

```
src/
├── config/         # Configuration files
├── controllers/    # Route controllers
├── cron/          # Scheduled jobs
├── middlewares/   # Express middlewares
├── models/        # MongoDB models
├── queues/        # RabbitMQ consumers/producers
├── routes/        # API routes
├── services/      # Business logic
├── sockets/       # Socket.IO handlers
├── swagger/       # API documentation
├── utils/         # Utility functions
├── validators/    # Input validators
├── app.js         # Express app setup
└── server.js      # Server initialization
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/user/list` - List all users
- `GET /api/user/online` - Get online users
- `GET /api/user/online/:userId` - Check user online status

### Messages
- `POST /api/messages/send` - Send message
- `GET /api/messages/conversations` - Get conversations
- `GET /api/messages/conversations/:id` - Get messages
- `GET /api/messages/search` - Search messages
- `PATCH /api/messages/:id/read` - Mark as read

## 🔌 Socket.IO Events

### Client to Server
- `connection` - Authenticate with JWT
- `join_room` - Join conversation room
- `send_message` - Send real-time message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator

### Server to Client
- `message_received` - New message notification
- `message_sent` - Message sent confirmation
- `user_online` - User came online
- `user_offline` - User went offline
- `user_typing` - User is typing
- `error` - Error notification

## ⚙️ Automatic Message System

The system includes three automated processes:

1. **Message Planner (02:00 daily)**
   - Shuffles active users
   - Creates random user pairs
   - Schedules messages for next 24h

2. **Message Queuer (Every minute)**
   - Finds due messages
   - Adds to RabbitMQ queue
   - Marks as queued

3. **Message Consumer (Continuous)**
   - Processes queue messages
   - Creates actual messages
   - Sends via Socket.IO

## 🔒 Security Features

- JWT authentication with refresh tokens
- Password hashing with bcrypt
- Rate limiting on auth endpoints
- Input validation and sanitization
- Helmet.js security headers
- CORS configuration
- MongoDB injection prevention

## 📊 Monitoring & Logging

- **Winston**: File and console logging
- **Sentry**: Error tracking and monitoring
- **Morgan**: HTTP request logging
- **Custom**: Application-level logging

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📚 API Documentation

Access Swagger documentation at:
```
http://localhost:3000/api-docs
```

## 🚀 Deployment

1. Set production environment variables
2. Build the application (if needed)
3. Use PM2 or similar process manager:

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start src/server.js --name nodelabs-chat

# Save PM2 configuration
pm2 save
pm2 startup
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Node.js community
- All contributors
- Open source packages used