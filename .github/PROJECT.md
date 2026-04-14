# React Data Grid & Express API

## What This Is
A lightweight dual-package React/TypeScript application demonstrating a paginated data table UI with AG Grid and a TypeScript Express backend serving mocked paginated records.

## Why This Matters
- Provides a clean frontend/backend integration example for pagination and API-driven data display.
- Surfaces real maintenance needs: environment configuration, error handling, testing, and workspace structure.
- Creates a clear path for improving UX, reliability, and developer experience.

## Scope
### Included
- `/frontend` — Create React App frontend with AG Grid, Axios, and custom portals for menu/snackbar UI.
- `/backend` — Express + TypeScript backend serving a paginated mock JSON API at `/api/records`.
- `.github/codebase/` — Codebase documentation and mapping for planning and execution.
- Root planning artifacts for future roadmap and phase execution.

### Out of Scope
- Persistent database or production data storage
- Authentication, authorization, or user accounts
- Full deployment pipeline in the first phase

## Core Value
Deliver a reliable local demo of a paginated data table experience with a maintainable frontend/backend structure and an explicit path to testing and production readiness.

## Key Decisions
- The frontend and backend remain separate npm packages for this phase.
- Codebase mapping is stored in `.github/codebase/`.
- The backend data source is currently in-memory mock records in `/backend/server.ts`.
- The frontend backend URL is configured in `/frontend/src/api.ts` and should be refactored to use environment-driven configuration.

## Success Metrics
- [ ] Frontend displays paginated records from the backend.
- [ ] Local development can start both frontend and backend reliably.
- [ ] Codebase documentation exists in `.github/codebase/`.
- [ ] Basic testing scaffolding is added for frontend and backend.
- [ ] Root planning files are present and ready for phase-based execution.
