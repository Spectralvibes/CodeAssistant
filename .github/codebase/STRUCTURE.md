# Codebase Structure

## Root layout
- `/frontend` — React client app
- `/backend` — Express API server
- `/codebase` — generated codebase documentation
- `/run-flow.sh` — workspace helper script
- `/.github` — prompts and workflow definitions

## Frontend structure
- `/frontend/package.json` — CRA package config and scripts
- `/frontend/public` — static public assets
- `/frontend/src/App.tsx` — main application entry component
- `/frontend/src/api.ts` — Axios API client wrapper
- `/frontend/src/components/DataTable.tsx` — main table UI and pagination logic
- `/frontend/src/components/MenuCell.tsx` — dropdown action cell renderer
- `/frontend/src/components/Snackbar.tsx` — transient notification portal
- `/frontend/src/setupTests.ts` — Jest DOM test setup

## Backend structure
- `/backend/package.json` — backend package config
- `/backend/server.ts` — Express server and mock data API
- `/backend/tsconfig.json` — TypeScript compiler settings for backend

## Notable missing structure
- No root-level `package.json` managing both frontend and backend together
- No dedicated shared config or workspace tooling such as pnpm workspaces or npm workspaces
- No test files or E2E test structure present yet
