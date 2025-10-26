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

### Dataset ingestion module

The new datasets module centralizes ingestion for every data source exposed in the UI. On startup it:

- Ensures the `dataset_sources`, `dataset_snapshots`, and `dataset_items` tables exist.
- Registers connector classes for each `DataSource` entry (REST pagers for DailyMed, ClinicalTrials.gov, etc., and ZIP + TSV handling for the FDA Orange Book).
- Exposes API routes for orchestration:
  - `GET /api/datasets` – list registered sources with their latest snapshot metadata.
  - `GET /api/datasets/:source/latest` – fetch the most recent snapshot for a source.
  - `POST /api/datasets/:source/ingest` – trigger ingestion manually.
- Starts an optional cron-based scheduler controlled via environment variables.

Key environment variables:

| Variable | Purpose |
| --- | --- |
| `DATASET_STORAGE_DIR` | Directory for persisted snapshot artifacts (defaults to `./storage/datasets`). |
| `DATASET_TEMP_DIR` | Working directory for streaming and extraction (defaults to `./storage/tmp`). |
| `DATASET_MAX_RETRIES` / `DATASET_RETRY_BACKOFF_MS` | Configure retry attempts and backoff delays. |
| `DATASET_CRON_EXPRESSION` | Cron expression controlling background ingestion (defaults to nightly). |
| `DATASET_SCHEDULED_SOURCES` | Comma-separated list of sources to ingest automatically (e.g. `DailyMed,ClinicalTrials.gov`). |
| `DATASET_<SOURCE>_BASE_URL` / `DATASET_<SOURCE>_DOWNLOAD_URL` / `DATASET_<SOURCE>_API_KEY` | Override defaults or supply credentials for specific connectors. |

> **Tip:** Source keys are normalized to uppercase snake case (e.g. `DailyMed` → `DATASET_DAILYMED_BASE_URL`).
