# Prosperify Landing

Next.js landing site for Prosperify. The app uses the App Router, server route handlers for Workspace-backed content and meeting scheduling, and local i18next JSON resources.

## Commands

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run build
```

Workspace-backed blog, team, jobs, and calendar calls require OAuth client credentials registered in the workspace API.

Create an OAuth application in the workspace API with `client_credentials` grant and scopes: `posts`, `jobs`, `meetings`. Then set:

```bash
WORKSPACE_API_URL=http://localhost:3100/v1
LANDING_OAUTH_CLIENT_ID=<oauth client id>
LANDING_OAUTH_CLIENT_SECRET=<oauth client secret>
```

## Structure

- `src/app`: route files, layout, metadata, global CSS, and route handlers.
- `src/features/landing`: landing page sections and page composition.
- `src/features/contact`: contact form UI.
- `src/features/legal`: legal page content.
- `src/components/ui`: reusable UI primitives.
- `src/components/shared`: reusable landing helpers.
- `src/locales`: translation resources.
- `public/assets`: public brand and partner assets.

## Naming

Use kebab-case for file and folder names. Keep `src/app` route files framework-shaped, and place reusable implementation details under `features`, `components/ui`, or `components/shared`.
