# PMCAS

Performance Marketing & Conversion Audit System

**Work in progress · local consultant workspace · MIT licensed**

PMCAS helps consultants structure a marketing and conversion audit, record evidence and confidence, and turn reviewed findings into recommendations and experiments.

Maintained by [Maged Taha](https://github.com/magedtahaaa). Copyright © 2026 Maged Taha. Original PMCAS code and documentation use the [MIT License](LICENSE). Third-party materials retain their own terms. This is an early development project. See the validation notes and known issues before evaluating it.

## Available workflow

Brand → Audit → Criteria responses → Section scores → Findings → Recommendations → Experiments → Summary/report → CSV/XLSX exports.

The recovered application covers eight audit sections. Scores are directional; completion and confidence are shown separately. No AI service or advertising-platform connection is required for the tested manual workflow. Import helpers and prioritization helpers include placeholders; a complete CSV/Excel intake feature, bilingual UI and hosted multi-user service are not claimed.

## Local setup

Requirements: Node.js 24.x, pnpm 11.25.0, and a dedicated PostgreSQL 16 development database. Docker Compose is an option; its configuration was reviewed but not executed in the recovery test.

1. Install packages: `pnpm install --frozen-lockfile`.
2. Copy `.env.example` to `.env`. Replace both password placeholders with the same local password. Keep `.env` private.
3. If using Docker, run `docker compose up -d`. Otherwise set DATABASE_URL for a new local development database.
4. Run `pnpm db:generate`, then `pnpm exec prisma migrate deploy`. Keep DATABASE_URL configured for build and runtime too.
5. Run `pnpm db:seed` only against a disposable development database. The seed recreates records with fixed demo IDs.
6. Run `pnpm dev` and open http://127.0.0.1:3001.

The seed contains a fictional example brand. Client records, local databases, private archives, actual environment files, dependency folders and build outputs are excluded from the repository.

## Validation and limitations

The recovery baseline was tested on 24 October 2026 with Node 24.22.1 and PostgreSQL 16.14. Type checking, lint, seven regression tests and production build passed. A fictional brand/audit/workflow was created in the browser, persisted to PostgreSQL, and used for 18 page checks, five CSV and six XLSX downloads. Workbooks passed structural ZIP/XML checks; spreadsheet visual compatibility was not fully tested.

```sh
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```

After dependency security updates, the current baseline passed lint, type checking, seven regression tests and production build using Next.js 16.4.3, React 19.3.1 and Prisma 7.10.1. Eighteen pages and eleven exports passed HTTP checks again. A production-mode browser response save displayed success and updated the normalized score from 80 to 60 and back to 80 without a manual reload. The earlier pending-save behavior was not reproduced in that scenario; broader browser/form coverage is still needed. The final registry audit reported no known advisories on the review date; this is not a security guarantee.

For local evaluation, use `pnpm dev`. A production build requires DATABASE_URL to be configured; `pnpm start` serves the built app on the same loopback address. Authentication and tenant isolation have not been verified: keep this app local and use synthetic data. See [known issues](docs/KNOWN_ISSUES.md).

## Project policies

See [contributing](CONTRIBUTING.md), [security](SECURITY.md), [governance](GOVERNANCE.md), [conduct](CODE_OF_CONDUCT.md), and [third-party notices](THIRD_PARTY_NOTICES.md). See the [roadmap](docs/ROADMAP.md) for useful first contributions. Version 0.1.0 is a development baseline; no stable release is claimed.
