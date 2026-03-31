# Content Workflow

This project now has one preferred path for publishing practice materials and analytics.

## Goal

Avoid manual one-off production fixes by separating:

- code deployment;
- content import into the database;
- source file delivery into the runtime container.

## Standard flow

1. Add or update source files in `public/`.
2. Add or update the corresponding import script in `scripts/`.
3. Run local validation:
   - `npm run build`
4. Deploy code and static files:
   - `./scripts/deploy-prod.sh`
   - `./scripts/deploy-tender-prod.sh` for the tender host only
5. Import content into production database:
   - `./scripts/run-prod-script.sh scripts/import-fas-decisions-2025.mjs`
   - `./scripts/run-prod-script.sh scripts/import-court-materials.mjs`

## Unified import entrypoint

There is now a shared import entrypoint for content:

- `npm run import:content:fas`
- `npm run import:content:court`
- `npm run import:content:all`

This entrypoint reuses the same runtime helpers for:

- Prisma connection;
- `ONLY_SLUGS` filtering;
- case upsert;
- material upsert.

Older scripts are still valid, but now act as specialized wrappers around the same shared import layer.

## Why this is safer

- `deploy-prod.sh` now targets the active production host by default.
- `deploy-tender-prod.sh` targets the tender host separately.
- `server-deploy.sh` deploys one compose stack at a time, with an explicit project name.
- public and tender now use different compose project names, so one deploy cannot remove the other as an orphan.
- The runtime Docker image now contains the `scripts/` directory, so import scripts can run inside the app container without ad hoc copying tricks.
- `run-prod-script.sh` gives one predictable way to execute a content import on production.

## Rules for new materials

- If a document is a duplicate, do not create a new card.
- If a document is only an intermediate notice, prefer not publishing it as a standalone case.
- If a document is a readable complaint or useful source text, it can become analytics or a practice note, not necessarily a separate case.
- If a file is an image-only scan without reliable text extraction, do not publish it without OCR verification.

## Preferred content split

- `cases` for final FAS practice and strong complaint outcomes.
- `materials` for analytics, court practice, nonpayment evidence, templates, and explanatory content.

## Important note

Do not mix public site content releases with unrelated tender work in the same deployment unless the tender branch is already stable.
