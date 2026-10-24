# PMCAS Prisma Notes

The MVP schema uses PostgreSQL and keeps the audit workflow criteria-first:

`Brand -> AuditTemplate -> AuditSection -> AuditCriteria -> AuditResponse -> EvidenceItem -> Finding -> Recommendation -> Experiment`

Imported CSV/Excel rows are intentionally stored as raw JSON in `ImportedRow.rawData`, with optional `normalizedData` for later mapping work. This keeps the MVP flexible while real import patterns emerge.

PMCAS uses Prisma 7 with the PostgreSQL driver adapter, so application code that instantiates Prisma Client should pass `@prisma/adapter-pg`.

Set `DATABASE_URL` before running migrations or seed commands:

```bash
DATABASE_URL="postgresql://user:password@localhost:5432/pmcas?schema=public"
```

Useful commands:

```bash
pnpm db:validate
pnpm db:generate
pnpm db:migrate --name pmcas_mvp_init
pnpm db:seed
```
