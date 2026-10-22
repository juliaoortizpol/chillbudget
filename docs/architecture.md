# Frontend architecture

React 19 + TypeScript, built with Vite; React Router owns navigation.
Tailwind CSS and shared UI components provide styling. src/main.ts mounts App.
src/features groups auth, dashboard, budget, accounts and transactions.
src/components contains shared layout/sidebar and UI. src/hooks contains shared
hooks. @/ resolves to src in Vite and TypeScript.

src/hooks/useFetch.ts reads VITE_API_URL (fallback /api), adds the jwt_token
localStorage value as a Bearer token, decodes JSON/text responses and throws
on unsuccessful HTTP responses. Feature hooks manage loading/error/data state.
Inspect actual backend DTOs before changing frontend request/response types.

## Local integration
npm run dev starts Vite, normally on port 5173. vite.config.ts proxies /api
to http://localhost:3000, stripping /api. Set VITE_API_URL=/api for local development.
Production hosting must provide an API URL or reverse proxy; vite preview is
a static build preview and is not proof of production API connectivity.
VITE_ configuration is embedded into client code and must contain no secrets.

## Current gaps
Vitest provides unit/component tests in jsdom; integrated browser/API coverage
still requires separate verification.
The route tree itself is not evidence of authorization enforcement.
Mock data remains in the source; QA must record whether it used API data or mocks.
