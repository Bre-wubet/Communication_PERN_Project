# Setup Instructions

This guide will help you set up the communication system and resolve the 401 Unauthorized errors.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database
3. **npm** or **yarn**

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit the `.env` file and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A secure secret key for JWT tokens
   - `JWT_REFRESH_SECRET`: A secure secret key for refresh tokens

4. **Set up the database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   ```

5. **Create initial data (tenant and admin user):**
   ```bash
   npm run setup
   ```

6. **Start the backend server:**
   ```bash
   npm run dev
   ```

The backend will be running on `http://localhost:3000`

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend development server:**
   ```bash
   npm run dev
   ```

The frontend will be running on `http://localhost:5173`

## Login Credentials

After running the setup script, you can login with:

- **Email:** `admin@example.com`
- **Role:** `admin`

## Troubleshooting

### 401 Unauthorized Errors

If you're still getting 401 errors:

1. **Check if the backend is running** on port 3000
2. **Verify the database connection** in your `.env` file
3. **Make sure you've run the setup script** to create the initial user
4. **Check browser console** for any CORS or network errors
5. **Clear browser storage** and try logging in again

### Database Issues

If you encounter database issues:

1. **Check PostgreSQL is running**
2. **Verify the DATABASE_URL** in your `.env` file
3. **Run migrations again:**
   ```bash
   npm run db:migrate
   ```

### CORS Issues

If you see CORS errors, make sure your `.env` file includes:

```
ALLOWED_ORIGINS="http://localhost:3000,http://localhost:5173"
```

## API Endpoints

Once set up, you can access:

- **Health Check:** `GET http://localhost:3000/health`
- **Email Logs:** `GET http://localhost:3000/api/emails/logs` (requires authentication)
- **Send Email:** `POST http://localhost:3000/api/emails/send` (requires authentication)

## Next Steps

1. **Login** with the admin credentials
2. **Test email functionality** by sending a test email
3. **Explore other features** like SMS, Push notifications, and Comments
4. **Create additional users** through the API or database

## Support

If you encounter any issues, check the logs in the `backend/logs/` directory for more detailed error information.
