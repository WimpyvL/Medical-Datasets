<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1ZtHsvIJbHq0s1A-DMwP7aZlFqhNuO7yg

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Backend API

The `/backend` folder contains a modular Express API designed for microservice-style expansion. It ships with:

- Request validation powered by [Zod](https://github.com/colinhacks/zod)
- Structured error handling middleware
- A PostgreSQL connection pool with environment-driven configuration
- A sample `patients` module that demonstrates how to build feature-focused routers, services, and validation schemas

### Local development

```bash
cd backend
npm install
npm run dev
```

Environment variables are validated on boot. Copy `.env.example` to `.env` to override the defaults if needed.

### Dockerized services

Use the included `docker-compose.yml` to launch the API alongside PostgreSQL and Adminer:

```bash
docker compose up --build
```

Services exposed:

- **API:** http://localhost:4000/api
- **PostgreSQL:** `postgres://postgres:postgres@localhost:5432/medical_datasets`
- **Adminer:** http://localhost:8080 (use the credentials above to log in)

The backend automatically ensures the `patients` table exists on startup and provides `/api/health` and `/api/patients` endpoints as a foundation for future microservices.
