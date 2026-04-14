# Integrations

## Internal API
- Frontend calls the backend via `axios`:
  - `http://localhost:4000/api/records?page=${page}`
- Backend exposes a simple paginated REST endpoint:
  - `GET /api/records`
- Backend returns JSON with `page`, `recordsPerPage`, `totalRecords`, and `data`.

## UI / Component Integrations
- AG Grid integration for data table rendering
- Custom cell renderer for actions (`MenuCell`)
- React portal integration for overlay UI (`Snackbar` and menu dropdown)

## Middleware / Runtime
- Express + CORS support to allow the frontend to access the backend during local development

## External services
- No external third-party APIs or remote services are integrated yet
- All data is currently mocked in-memory inside `/backend/server.ts`
