
*   Strict TypeScript with `noImplicitAny: true` and ESLint rule `@typescript-eslint/no-explicit-any: "error"`.
*   Consistent folder layout: `docs/`, `scripts/`, `frontend/`, `backend/`.
*   `shadcn/ui` is mandatory for core UI components.
*   No copy/pasting component implementations from external libraries.
*   All Markdown documentation in `docs/`.
*   All automation/developer scripts in `scripts/`.
*   All frontend UI primitives and wrappers in `src/components/ui/`.
*   `data-mcp` or `data-test` attributes for Playwright selectors.
*   Avoid inline styles, use Tailwind tokens.
*   Design system documented in `docs/design-system.md`.
*   Light/Dark mode support with `data-theme` attribute and CSS variables.
*   Structured logging in JSON format.
*   Audit logs for admin actions.
