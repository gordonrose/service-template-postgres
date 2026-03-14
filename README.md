# Service Template

Reusable TypeScript service template with a platform-owned Express runtime.

## Included in 0003A

- single application entry point
- platform router registry
- health endpoint
- metrics endpoint
- empty v1 feature registry router
- strict TypeScript build
- Vitest runtime configured to pass when no tests exist yet

## Commands

```bash
npm ci
npm run build
npm run test
npm start
```

Default Runtime
HOST=0.0.0.0
PORT=3000
NODE_ENV=development

Endpoints
GET /health
GET /metrics

Feature Integration
No business features are created in 0003A.
Future feature router mounting must occur only through:
src/routes/v1/features.ts
