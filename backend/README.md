# Communication API

A comprehensive multi-tenant communication system built with Node.js, Express, and Prisma. This API provides email, SMS, push notifications, and comment management capabilities.

## Features

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

## Tech Stack

- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT
- **Validation**: Joi
- **Logging**: Winston
- **Email**: Nodemailer
- **SMS**: Twilio, AWS SNS, MessageBird
- **Push Notifications**: Firebase Admin SDK, APNS, FCM

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── src/
│   ├── config/                   # Configuration files
│   │   ├── db.js
│   │   ├── email.js
│   │   ├── sms.js
│   │   └── push.js
│   ├── modules/                  # Feature modules
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Business logic
│   │   ├── repositories/         # Data access layer
│   │   ├── routes/               # Route definitions
│   │   └── validations/          # Validation schemas
│   ├── middlewares/              # Express middlewares
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── validationMiddleware.js
│   ├── utils/                    # Utility functions
│   │   ├── logger.js
│   │   ├── mailer.js
│   │   └── notifier.js
│   ├── app.js                    # Express app configuration
│   └── server.js                 # Server entry point
├── logs/                         # Log files
├── package.json
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd communication/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## Environment Variables

Copy `env.example` to `.env` and configure the following variables:

### Required Variables
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens

### Optional Variables
- `NODE_ENV`: Environment (development/production)
- `PORT`: Server port (default: 3000)
- `RATE_LIMIT_MAX`: Rate limit per IP (default: 100)

### Email Configuration
- `EMAIL_DEFAULT_PROVIDER`: Default email provider
- `SMTP_*`: SMTP configuration
- `GMAIL_*`: Gmail configuration
- `SENDGRID_API_KEY`: SendGrid API key
- `MAILGUN_*`: Mailgun configuration

### SMS Configuration
- `SMS_DEFAULT_PROVIDER`: Default SMS provider
- `TWILIO_*`: Twilio configuration
- `AWS_*`: AWS SNS configuration
- `MESSAGEBIRD_*`: MessageBird configuration

### Push Notification Configuration
- `PUSH_DEFAULT_PROVIDER`: Default push provider
- `FIREBASE_*`: Firebase configuration
- `APNS_*`: Apple Push Notification Service
- `FCM_SERVER_KEY`: Firebase Cloud Messaging

## API Endpoints

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

## Database Schema

The system uses the following main entities:

- **Tenant**: Multi-tenant isolation
- **User**: System users
- **EmailLog**: Email sending logs
- **SmsLog**: SMS sending logs
- **PushNotification**: Push notification records
- **Comment**: User comments
- **Reply**: Comment replies
- **Mention**: User mentions in replies

## Authentication

The API uses JWT-based authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE"
}
```

## Logging

The system uses Winston for logging with different levels:
- `error`: Error logs
- `warn`: Warning logs
- `info`: Information logs
- `debug`: Debug logs (development only)

Logs are written to:
- Console (development)
- `logs/error.log` (error logs)
- `logs/combined.log` (all logs)

## Rate Limiting

The API implements rate limiting to prevent abuse:
- Default: 100 requests per 15 minutes per IP
- Configurable via `RATE_LIMIT_MAX` environment variable

## Development

### Running Tests
```bash
npm test
```

### Database Management
```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Open Prisma Studio
npm run db:studio

# Push schema changes
npm run db:push
```

### Code Quality
- ESLint for code linting
- Prettier for code formatting
- JSDoc for documentation

## Production Deployment

1. **Set production environment variables**
2. **Run database migrations**
3. **Start the server with PM2 or similar process manager**
4. **Set up reverse proxy (Nginx)**
5. **Configure SSL certificates**
6. **Set up monitoring and logging**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For support and questions, please open an issue in the repository.
