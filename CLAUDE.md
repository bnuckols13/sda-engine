# SDA Analysis Engine

Web application for Structural Dream Analysis research. Participants record dreams, clinicians score them, researchers analyze study-level data.

## Architecture

Three entry points, one repo:
- `participant/` — Vanilla HTML/JS, mobile-first, token-based access (no login)
- `scoring/` — Pure JS scoring engine (shared by both apps)
- `dashboard/` — React + Vite + TypeScript for clinician scoring + researcher dashboards

## Tech Stack

- **Participant app**: Vanilla HTML/JS, zero dependencies, Supabase CDN client
- **Dashboard**: React 18, Vite, TypeScript, Recharts, React Router
- **Backend**: Supabase PostgreSQL (instance: oxabwsnqfqeyrpgjwnde)
- **Deployment**: Vercel (/ → participant, /dashboard → React build)
- **Design**: Inter font, warm clinical palette (#FAFAF7 cream, #4A5568 slate)

## Data Model

studies → participants (token-based) → dreams → part_b_scores + part_a_scores (multi-rater)

## Scoring System

Roesler's 6-pattern typology with 21 sub-types, linearized 1-21:
- Type 1: No dream ego (1 code)
- Type 2: Threatened (2.1-2.5, maps to freeze-flight-fight)
- Type 3: Performance demand (3.1-3.3)
- Type 4: Mobility (4.1-4.5)
- Type 5: Social interaction (5.1-5.3)
- Type 6: Autonomy (6.1-6.4)

Part B self-report: 8 items (SDA-SI) or 14 items (SDA-TNS)
Series analysis: Spearman rank correlation of PTC over dream sequence

## Local Dev

Participant app: `npx serve participant/` or any static server
Dashboard: `cd dashboard && npm run dev`

Participant app works without Supabase (localStorage fallback) when SUPABASE_ANON_KEY is empty.
Use `?t=test` in URL for local development.
