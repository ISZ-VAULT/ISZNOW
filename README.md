# ISZ Now

AI document generation + reseller platform (Next.js 14, Prisma, PostgreSQL, NextAuth).

## Run locally

```bash
npm install
cp .env.example .env          # then edit DATABASE_URL and NEXTAUTH_SECRET
npx prisma generate
npx prisma db push
npx prisma db seed
npm run dev
```

Open http://localhost:3000 (redirects to /ar/login).

## Demo accounts

| Role  | Email             | Password | Notes        |
|-------|-------------------|----------|--------------|
| Admin | admin@isznow.com  | admin123 |              |
| Agent | agent@isznow.com  | agent123 | 1000 points  |

Recharge codes (4000 points each): 123456789012, 234567890123, 345678901234, 456789012345, 567890123456

## Notes
- With no `OPENAI_API_KEY` / `GEMINI_API_KEY`, generation returns mock content.
- "Download PDF" is a placeholder until the Puppeteer phase.
- UI strings are Arabic literals for now; next-intl wiring (ar/fr) comes later. Locale prefix routing (`/ar`, `/fr`) is already handled in `middleware.ts`.
