# LeetCode Study Guide - Cloudflare Backend

This directory contains the Cloudflare Workers backend for the LeetCode Study Guide, providing secure user authentication, progress tracking, and notes synchronization using Cloudflare D1 database.

## Features

- 🔐 **Secure Authentication**: Password hashing with salt, JWT tokens
- 📊 **Progress Tracking**: Cloud-based progress synchronization
- 📝 **Notes Management**: User notes with cloud storage
- 🔄 **Session Management**: Secure JWT-based sessions
- 🌐 **CORS Support**: Cross-origin requests for web app integration
- 🛡️ **Security**: Input validation, SQL injection protection

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │───▶│ Cloudflare      │───▶│ Cloudflare D1   │
│   (GitHub Pages)│    │ Workers API     │    │ Database        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Prerequisites

1. **Cloudflare Account**: Sign up at [cloudflare.com](https://cloudflare.com)
2. **Wrangler CLI**: Install globally
   ```bash
   npm install -g wrangler
   ```
3. **Node.js**: Version 16 or higher

## Quick Start

### 1. Setup and Authentication

```bash
# Clone the repository and navigate to cloudflare directory
cd cloudflare

# Login to Cloudflare
wrangler login

# Install dependencies
npm install
```

### 2. Database Setup

```bash
# Create D1 database
wrangler d1 create leetcode-study-db

# Update wrangler.toml with the database_id from the output above
# Look for [[d1_databases]] section and update database_id

# Run migrations
wrangler d1 migrations apply leetcode-study-db
```

### 3. Environment Configuration

```bash
# Generate and set JWT secret
openssl rand -base64 32
wrangler secret put JWT_SECRET
# Paste the generated secret when prompted
```

### 4. Deploy

```bash
# Deploy to Cloudflare Workers
wrangler deploy

# Or use the automated script
./deploy.sh
```

## API Endpoints

### Authentication

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "string",
  "email": "string", 
  "password": "string"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt_token_here"
}
```

#### POST `/api/auth/login`
Login with existing credentials.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

#### POST `/api/auth/logout`
Logout and invalidate session.

**Headers:** `Authorization: Bearer <token>`

### Progress Management

#### GET `/api/progress`
Get user's problem progress.

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "progress": [
    {
      "problem_id": "two-sum",
      "status": "completed",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### PUT `/api/progress/:problemId`
Update progress for a specific problem.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "completed" // "not-started" | "in-progress" | "completed"
}
```

### Notes Management

#### GET `/api/notes`
Get user's problem notes.

**Headers:** `Authorization: Bearer <token>`

#### PUT `/api/notes/:problemId`
Update notes for a specific problem.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "note_text": "My solution approach..."
}
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    salt TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME,
    is_active BOOLEAN DEFAULT TRUE
);
```

### User Progress Table
```sql
CREATE TABLE user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    problem_id TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('not-started', 'in-progress', 'completed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, problem_id)
);
```

### User Notes Table
```sql
CREATE TABLE user_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    problem_id TEXT NOT NULL,
    note_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    UNIQUE(user_id, problem_id)
);
```

## Development

### Local Development

```bash
# Run locally with hot reload
wrangler dev

# Test with local D1 database
wrangler d1 migrations apply leetcode-study-db --local
wrangler dev --local
```

### Database Management

```bash
# List databases
wrangler d1 list

# Execute SQL commands
wrangler d1 execute leetcode-study-db --command "SELECT * FROM users;"

# Access D1 console
wrangler d1 execute leetcode-study-db --command "SELECT * FROM users;" --json
```

### Monitoring

```bash
# View live logs
wrangler tail

# View specific deployment logs
wrangler tail --format=pretty
```

## Security Considerations

1. **Password Security**: Passwords are hashed using SHA-256 with unique salts
2. **JWT Tokens**: 7-day expiration, stored securely in database sessions
3. **Input Validation**: All inputs are validated and sanitized
4. **SQL Injection Protection**: Prepared statements used throughout
5. **CORS**: Configured for secure cross-origin requests
6. **Session Management**: Active session tracking with logout capability

## Configuration

### Environment Variables

- `JWT_SECRET`: Secret key for JWT token signing (required)
- `ENVIRONMENT`: Deployment environment (development/production)

### wrangler.toml Configuration

```toml
name = "leetcode-study-api"
main = "src/index.js"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "leetcode-study-db"
database_id = "your-database-id-here"
```

## Troubleshooting

### Common Issues

1. **Database ID Missing**: Update `wrangler.toml` with correct `database_id`
2. **JWT Secret Not Set**: Run `wrangler secret put JWT_SECRET`
3. **CORS Errors**: Check that your web app domain is correctly configured
4. **Migration Failures**: Ensure database exists before running migrations

### Debug Commands

```bash
# Check deployment status
wrangler deployments list

# View environment variables
wrangler secret list

# Test database connection
wrangler d1 execute leetcode-study-db --command "SELECT 1;"
```

## Performance

- **Cold Start**: ~50ms typical cold start time
- **Response Time**: <100ms for authenticated requests
- **Concurrent Users**: Scales automatically with Cloudflare Workers
- **Database**: D1 provides low-latency SQLite-compatible storage

## Costs

- **Cloudflare Workers**: 100,000 requests/day free tier
- **D1 Database**: 5GB storage, 25 million reads/month free tier
- **Bandwidth**: Unlimited on Cloudflare's network

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review Cloudflare Workers documentation
3. Check the main project README for web app integration

## License

This project is part of the LeetCode Study Guide and follows the same license terms.
