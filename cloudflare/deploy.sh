#!/bin/bash

# Cloudflare Workers and D1 Deployment Script
# This script sets up and deploys the LeetCode Study Guide backend

set -e

echo "🚀 Starting Cloudflare Workers and D1 deployment..."

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    echo "❌ Wrangler CLI not found. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in
if ! wrangler whoami &> /dev/null; then
    echo "🔐 Please log in to Cloudflare first:"
    echo "wrangler login"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create D1 database if it doesn't exist
echo "🗄️ Setting up D1 database..."
if ! wrangler d1 list | grep -q "leetcode-study-db"; then
    echo "Creating new D1 database..."
    wrangler d1 create leetcode-study-db
    echo "✅ Database created successfully!"
    echo ""
    echo "⚠️  IMPORTANT: Please update your wrangler.toml file with the database_id from above!"
    echo "   Look for the [[d1_databases]] section and update the database_id field."
    echo ""
    read -p "Press Enter after updating wrangler.toml to continue..."
else
    echo "✅ Database already exists"
fi

# Run migrations
echo "🔄 Running database migrations..."
wrangler d1 migrations apply leetcode-study-db

# Generate JWT secret if not set
if ! grep -q "JWT_SECRET" .env 2>/dev/null; then
    echo "🔑 Generating JWT secret..."
    JWT_SECRET=$(openssl rand -base64 32)
    echo "JWT_SECRET=\"$JWT_SECRET\"" >> .env
    echo "✅ JWT secret generated and saved to .env"
    echo ""
    echo "⚠️  IMPORTANT: Please add this secret to your Cloudflare Workers environment:"
    echo "   wrangler secret put JWT_SECRET"
    echo "   Then paste the secret: $JWT_SECRET"
    echo ""
    read -p "Press Enter after setting the JWT_SECRET to continue..."
fi

# Deploy to Cloudflare Workers
echo "🚀 Deploying to Cloudflare Workers..."
wrangler deploy

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Your Worker is now deployed and accessible at the URL shown above"
echo "2. Update the apiBaseUrl in web/auth.js with your Worker URL"
echo "3. Test the authentication system"
echo "4. Deploy your web interface to GitHub Pages or your preferred hosting"
echo ""
echo "🔧 Useful commands:"
echo "  wrangler tail                    # View live logs"
echo "  wrangler d1 execute leetcode-study-db --command 'SELECT * FROM users;'  # Query database"
echo "  wrangler dev                     # Run locally for development"
echo ""
