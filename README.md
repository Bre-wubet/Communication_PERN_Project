# Communication System

A comprehensive full-stack communication platform built with Node.js, Express, React, and Vite. This system provides email, SMS, push notifications, and comment management capabilities with a modern web interface.

## 🚀 Features

### Backend API
- **Email Management**: Send emails via multiple providers (SMTP, Gmail, SendGrid, Mailgun)
- **SMS Management**: Send SMS via Twilio, AWS SNS, and MessageBird
- **Push Notifications**: Send push notifications via Firebase, APNS, and FCM
- **Comment System**: Full-featured commenting system with replies and mentions
- **Multi-tenant Architecture**: Isolated data per tenant
- **Authentication & Authorization**: JWT-based authentication with role-based access
- **Rate Limiting**: Built-in rate limiting for API protection
- **Comprehensive Logging**: Winston-based logging with multiple levels
- **Input Validation**: Joi-based request validation
- **Error Handling**: Centralized error handling with proper HTTP status codes

### Frontend Application
- **Modern React Interface**: Built with React 19 and Vite for optimal performance
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **State Management**: Zustand for efficient state management
- **Dashboard**: Comprehensive dashboard for managing all communication channels
- **Real-time Updates**: Live updates for notifications and comments
- **Authentication UI**: Secure login and user management interface

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **Email**: Nodemailer
- **SMS**: Twilio, AWS SNS, MessageBird
- **Push Notifications**: Firebase Admin SDK, APNS, FCM

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **HTTP Client**: Fetch API
- **Linting**: ESLint
- **TypeScript**: Type definitions for React

## 📁 Project Structure

```
communication/
├── backend/                          # Backend API
│   ├── prisma/
│   │   ├── schema.prisma             # Database schema
│   │   └── migrations/               # Database migrations
│   ├── src/
│   │   ├── config/                   # Configuration files
│   │   │   ├── db.js
│   │   │   ├── email.js
│   │   │   ├── sms.js
│   │   │   └── push.js
│   │   ├── modules/                  # Feature modules
│   │   │   ├── controllers/          # Request handlers
│   │   │   ├── services/             # Business logic
│   │   │   ├── repositories/         # Data access layer
│   │   │   ├── routes/               # Route definitions
│   │   │   └── validations/          # Validation schemas
│   │   ├── middlewares/              # Express middlewares
│   │   ├── utils/                    # Utility functions
│   │   ├── app.js                    # Express app configuration
│   │   └── server.js                 # Server entry point
│   ├── logs/                         # Log files
│   ├── package.json
│   └── README.md
├── frontend/                         # Frontend Application
│   ├── src/
│   │   ├── components/               # React components
│   │   │   ├── Header.jsx
│   │   │   └── Protected.jsx
│   │   ├── pages/                    # Page components
│   │   │   ├── Comments.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Emails.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Push.jsx
│   │   │   └── Sms.jsx
│   │   ├── stores/                   # Zustand stores
│   │   │   ├── auth.js
│   │   │   ├── comments.js
│   │   │   ├── emails.js
│   │   │   ├── push.js
│   │   │   └── sms.js
│   │   ├── routes/                   # Route definitions
│   │   ├── App.jsx                   # Main App component
│   │   └── main.jsx                  # Application entry point
│   ├── public/                       # Static assets
│   ├── package.json
│   └── README.md
└── README.md                         # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd communication
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   
   # Copy environment variables
   cp env.example .env
   # Edit .env with your configuration
   
   # Set up the database
   npm run db:generate
   npm run db:migrate
   ```

3. **Frontend Setup**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start Development Servers**
   
   **Backend (Terminal 1):**
   ```bash
   cd backend
   npm run dev
   ```
   
   **Frontend (Terminal 2):**
   ```bash
   cd frontend
   npm run dev
   ```

5. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - API Health Check: http://localhost:3000/health

## ⚙️ Configuration

### Backend Environment Variables

Copy `backend/env.example` to `backend/.env` and configure:

#### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens

#### Optional Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)
- `RATE_LIMIT_MAX`: Rate limit per IP (default: 100)

#### Email Configuration
- `EMAIL_DEFAULT_PROVIDER`: Default email provider
- `SMTP_*`: SMTP configuration
- `GMAIL_*`: Gmail configuration
- `SENDGRID_API_KEY`: SendGrid API key
- `MAILGUN_*`: Mailgun configuration

#### SMS Configuration
- `SMS_DEFAULT_PROVIDER`: Default SMS provider
- `TWILIO_*`: Twilio configuration
- `AWS_*`: AWS SNS configuration
- `MESSAGEBIRD_*`: MessageBird configuration

#### Push Notification Configuration
- `PUSH_DEFAULT_PROVIDER`: Default push provider
- `FIREBASE_*`: Firebase configuration
- `APNS_*`: Apple Push Notification Service
- `FCM_SERVER_KEY`: Firebase Cloud Messaging

## 📚 API Documentation

### Authentication
Include JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Health Check
- `GET /health` - Service health status

### Email Management
- `POST /api/emails/send` - Send single email
- `POST /api/emails/send-bulk` - Send bulk emails
- `POST /api/emails/send-templated` - Send templated email
- `GET /api/emails/logs` - Get email logs
- `GET /api/emails/statistics` - Get email statistics

### SMS Management
- `POST /api/sms/send` - Send single SMS
- `POST /api/sms/send-bulk` - Send bulk SMS
- `GET /api/sms/logs` - Get SMS logs
- `GET /api/sms/statistics` - Get SMS statistics

### Push Notifications
- `POST /api/push/send` - Send push notification
- `POST /api/push/send-bulk` - Send bulk push notifications
- `POST /api/push/send-to-topic` - Send to topic
- `GET /api/push/notifications` - Get notifications
- `PATCH /api/push/notifications/:id/read` - Mark as read

### Comments
- `POST /api/comments` - Create comment
- `GET /api/comments` - Get comments
- `POST /api/comments/:id/replies` - Create reply
- `GET /api/comments/search` - Search comments

## 🗄️ Database Schema

The system uses the following main entities:

- **Tenant**: Multi-tenant isolation
- **User**: System users
- **EmailLog**: Email sending logs
- **SmsLog**: SMS sending logs
- **PushNotification**: Push notification records
- **Comment**: User comments
- **Reply**: Comment replies
- **Mention**: User mentions in replies

## 🎨 Frontend Features

### Pages
- **Dashboard**: Overview of all communication channels
- **Login**: User authentication interface
- **Emails**: Email management and sending
- **SMS**: SMS management and sending
- **Push**: Push notification management
- **Comments**: Comment system interface

### State Management
- **Auth Store**: User authentication state
- **Email Store**: Email management state
- **SMS Store**: SMS management state
- **Push Store**: Push notification state
- **Comments Store**: Comment system state

## 🔧 Development

### Backend Development
```bash
cd backend

# Run tests
npm test

# Database management
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Run migrations
npm run db:studio      # Open Prisma Studio
npm run db:push        # Push schema changes

# Development server
npm run dev
```

### Frontend Development
```bash
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

### Code Quality
- **ESLint**: Code linting for both backend and frontend
- **Prettier**: Code formatting
- **JSDoc**: Documentation for functions and components

## 🚀 Production Deployment

### Backend Deployment
1. Set production environment variables
2. Run database migrations
3. Start the server with PM2 or similar process manager
4. Set up reverse proxy (Nginx)
5. Configure SSL certificates
6. Set up monitoring and logging

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your web server
3. Configure your web server to serve the React app
4. Set up proper caching headers

### Docker Deployment (Optional)
```dockerfile
# Backend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run db:generate
EXPOSE 3000
CMD ["npm", "start"]
```

## 📊 Monitoring & Logging

### Backend Logging
The system uses Winston for logging with different levels:
- `error`: Error logs
- `warn`: Warning logs
- `info`: Information logs
- `debug`: Debug logs (development only)

Logs are written to:
- Console (development)
- `logs/error.log` (error logs)
- `logs/combined.log` (all logs)

### Rate Limiting
The API implements rate limiting to prevent abuse:
- Default: 100 requests per 15 minutes per IP
- Configurable via `RATE_LIMIT_MAX` environment variable

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Open an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Version History

- **v1.0.0**: Initial release with full communication system
  - Backend API with email, SMS, push notifications, and comments
  - React frontend with modern UI
  - Multi-tenant architecture
  - JWT authentication
  - Comprehensive logging and error handling

---

**Built with ❤️ using Node.js, Express, React, and Vite**
