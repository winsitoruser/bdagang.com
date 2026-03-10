# 🐳 Docker Deployment Guide

This guide will help you deploy the **Bedagang Retail Platform** using Docker Compose.

## 🚀 Quick Start

1. **Configure Environment Variables**
   Create a `.env` file in the root directory (you can copy from `.env.example`).
   ```bash
   cp .env.example .env
   ```
   Ensure you set `NEXTAUTH_SECRET` and other production values.

2. **Build and Start**
   ```bash
   docker-compose up -d --build
   ```

3. **Access the Applications**
   - **Store/Main App:** [http://localhost:3001](http://localhost:3001)
   - **Admin Panel:** [http://localhost:3002](http://localhost:3002)
   - **Database:** `localhost:5432`

## 🏗️ Architecture

- **`db`**: PostgreSQL 15 database.
- **`store`**: Next.js main application (Root).
- **`admin`**: Next.js administrative panel (`/admin-panel`).

## 🛠️ Common Operations

### View Logs
```bash
docker-compose logs -f
```

### Run Database Migrations
To run migrations inside the running `store` container:
```bash
docker-compose exec store npm run db:migrate
```

### Create a Super User
```bash
docker-compose exec store node scripts/create-super-user.js
```

### Stop the System
```bash
docker-compose down
```

## 📝 Notes
- **Persistence:** Database data is stored in the `postgres_data` Docker volume.
- **Uploads:** Files uploaded via the store are persisted in the `store_uploads` volume.
- **Standalone Mode:** The images are built using Next.js "standalone" mode for minimal size (~150MB instead of ~1GB).
