# Architecture Overview

## High-level architecture
- This workspace is a two-part application:
  - `/frontend` — React client application built with Create React App
  - `/backend` — Express-based TypeScript server providing mock API data

## Frontend
- Single-page application rendering a paginated AG Grid table
- Core components:
  - `App.tsx` — root UI shell
  - `DataTable.tsx` — loads paged data, configures AG Grid, and renders pagination controls
  - `MenuCell.tsx` — custom action cell menu inside the grid
  - `Snackbar.tsx` — temporary overlay notifications using React portals
- Client state is managed with React hooks (`useState`, `useEffect`)

## Backend
- Express app listening on port `4000`
- Serves a single API route:
  - `GET /api/records`
- Data is generated in-memory on startup and paginated in the endpoint

## Data flow
1. User loads the frontend in the browser.
2. `DataTable` requests page data from the backend.
3. Backend returns mock record data and total count.
4. Frontend displays rows in AG Grid and updates pagination state.
5. Actions in the row menu trigger UI notification messages.

## Deployment considerations
- Frontend and backend are currently separate npm packages without a shared root workspace manager
- There is no reverse proxy or production deployment pipeline documented in the current repo
- Local dev requires running both the CRA frontend server and the Express backend server separately
