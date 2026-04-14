# Current Concerns

## Architecture and workspace
- No root workspace config; frontend and backend are managed separately
- Running the app requires two dev servers and no documented proxy or start script

## Networking and environment
- API base URL is hardcoded to `http://localhost:4000` in `/frontend/src/api.ts`
- CORS is enabled for local dev, but production cross-origin behavior is not defined

## Resilience and error handling
- No user-facing error states for network failures or empty results
- Pagination state is stored locally and not synchronized with route state

## Testing and quality
- No actual tests exist yet, despite test setup support in the frontend
- No backend tests or CI/test automation are present

## Maintainability
- In-memory mock data in `/backend/server.ts` is not persisted or configurable
- The frontend/backend split lacks shared contracts or DTO definitions
- Global styles and build/deploy guidance are absent
