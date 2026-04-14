# Code Conventions

## Language and syntax
- TypeScript is used in both frontend and backend packages
- React functional components with hooks are the standard UI pattern
- Minimal React abstractions; most components are small and purpose-driven

## Styling
- Mostly CRA default styles plus inline style objects in components
- AG Grid theme styles are imported directly in `DataTable.tsx`

## Component patterns
- `DataTable` handles data fetching, table config, and pagination controls
- `MenuCell` renders a dropdown menu inside AG Grid using a custom cell renderer
- `Snackbar` leverages `createPortal` to show overlays outside the normal DOM hierarchy

## Architecture conventions
- Frontend and backend are separate runtimes with explicit HTTP integration
- Backend currently returns static/mock data rather than persisting state
- No shared TypeScript types between client and server currently

## Naming and file placement
- Component files use PascalCase names matching exported components
- API client lives in `/frontend/src/api.ts`
- Server entrypoint is `/backend/server.ts`
