# redlizard-template

CLI to scaffold **Next.js 16 + TypeScript + Supabase** projects with end-to-end
security and Claude Code tooling (MCP + Skills) preconfigured.

## Usage (once published)

```bash
npx redlizard-template my-app
# or interactive mode, no argument:
npx redlizard-template
```

The CLI asks for the package manager, the CI/CD platform, and whether to install
dependencies and initialize git. It then leaves the project ready, printing the
next steps on screen.

## What it generates

A project with:

- **SSR auth** (`@supabase/ssr`) with session refresh in `proxy.ts` (Next 16).
- JWT validation on the server with `getClaims()` (never `getSession()`).
- Separate clients: browser, server (RLS) and admin (`server-only`, bypasses RLS).
- **Typed, validated env vars** with Zod, splitting client/server.
- **RLS deny-by-default** with an example migration + profile trigger.
- **CSP and security headers** in `next.config.ts`.
- **Protected routes** in two layers (proxy + layout that re-validates).
- **`.mcp.json`** with the Supabase MCP (read-only) and a security **Skill**
  under `.claude/skills/supabase-security/`, plus a `CLAUDE.md`.
- A **CI pipeline** for the platform you pick (GitHub Actions, Bitbucket
  Pipelines or GitLab CI) that deploys migrations per environment.

## Package structure

```
redlizard-template/
├── src/index.ts            # CLI logic (prompts + scaffolding)
├── template/               # the project that gets copied and parameterized
│   └── _ci-presets/        # CI files per platform (only the chosen one is kept)
└── tsup.config.ts          # build to dist/ (ESM)
```

Template files prefixed with `_` are renamed on generation
(`_package.json` → `package.json`, `_gitignore` → `.gitignore`,
`_env.example` → `.env.example`, `_mcp.json` → `.mcp.json`). The `{{PROJECT_NAME}}`
placeholder is replaced with the chosen name. The `_ci-presets/` folder holds the
pipelines for each CI platform; the CLI copies the selected one into place and
discards the rest.

## Flags

- `--yes` / `-y` — non-interactive mode (defaults: npm, GitHub Actions, no install/git).
- `--ci=<github|bitbucket|gitlab|none>` — pick the CI platform without prompting.

## Development

```bash
npm install
npm run build                       # compile src/ → dist/
node dist/index.js test-app --yes   # generate a test project
```

## Publishing to npm

```bash
npm login                # once per machine
npm run build
npm publish              # public (unscoped name)
```

To publish a new version, bump the number first:

```bash
npm version patch        # 0.1.0 -> 0.1.1
npm publish
```
