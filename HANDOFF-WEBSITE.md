# SDA Dream Journal → briannuckols.com Handoff

## Context

The SDA Analysis Engine (`~/sda-engine`) is a research instrument built on Prof. Dr. Christian Roesler's Structural Dream Analysis (6-pattern typology, 21 sub-types measuring dream ego agency). It has two faces:

1. **Research instrument** — token-based participant app + clinician scoring dashboard + study-level analytics. Live at `sda-engine.vercel.app`. Supabase backend pending setup.
2. **Consumer lead magnet** (this handoff) — a free dream journal on briannuckols.com that captures emails and feeds the person spine.

The research instrument is complete. This document hands off what the website agent needs to build the consumer version and the hub-and-spoke content model around dream analysis.

---

## What to Build: Consumer Dream Journal Lead Magnet

### The Product

A free, email-gated "Dream Pattern Tracker" at `/resources/dream-journal` on briannuckols.com. After entering their email, the user gets access to a standalone dream journal that:

- Records dreams (text entry with prompt)
- Completes the 8-item Part B self-report (agency, threat, relational subscales)
- Walks through the guided PTC decision tree to self-classify dream structure
- Shows a trajectory chart of their agency scores over time
- Gives a plain-language interpretation of their dream patterns

This is the `participant/` app from `~/sda-engine` repackaged as a consumer tool. The scoring engine, decision tree, Part B items, and trajectory chart already exist.

### Architecture

**Option A (recommended): Embed the existing app.** The participant app at `~/sda-engine/participant/` is already vanilla HTML/JS with localStorage persistence. Iframe it or copy the files into `~/briannuckols-site/public/dream-journal/` and serve directly. The consumer version needs:

- Remove the consent screen (replace with email gate)
- Remove references to "study" and "participant" — rebrand as "Your Dream Pattern Tracker"
- Add warm interpretive text (like client-reflections.js in assessment-ui)
- Consumer-friendly PTC interpretation: instead of clinical codes, show plain language ("Your dream self is becoming more active and capable over time")
- Keep localStorage persistence (no Supabase for the consumer version — privacy-first)
- Email captured through the existing email-signup edge function → person spine

**Option B: Link to the deployed app.** Point `/resources/dream-journal` at `sda-engine.vercel.app/participant/index.html?t=public&mode=consumer`. The app already has a localStorage fallback. Less work but less integrated.

### Key Files to Copy/Adapt from sda-engine

| Source | Consumer Adaptation |
|--------|-------------------|
| `participant/index.html` | Remove consent screen, add email gate, rebrand |
| `participant/app.js` | Remove Supabase calls, keep localStorage, add interpretive text |
| `participant/style.css` | Match briannuckols.com design (Newsreader + Inter, #FAFAFA bg) |
| `scoring/sda-scoring-data.js` | Use as-is (21 PTC codes, Part B items, subscales) |
| `scoring/sda-scoring-engine.js` | Use as-is (scorePartB, linearizePTC, countWords) |
| `scoring/sda-statistics.js` | Use as-is (ptcTrajectory, firstLastDifference) |
| `scoring/decision-tree-data.js` | Use as-is (PTC decision tree) |

### Consumer Interpretation Layer (new file needed)

Create `dream-reflections.js` (same pattern as `~/assessment-ui/client-reflections.js`). Maps scores to warm, non-clinical language:

```javascript
const DREAM_REFLECTIONS = {
  trajectory: {
    positive: "Your dreams are showing a pattern of increasing agency — your dream self is becoming more active, more capable of making choices, and more engaged with others. This often parallels growth in waking life.",
    flat: "Your dream patterns are relatively stable. This isn't good or bad — it means your inner landscape is consistent right now.",
    negative: "Your recent dreams show your dream self in more challenging situations than earlier ones. This can happen during periods of stress or transition.",
  },
  patterns: {
    1: { label: "The Observer", desc: "Your dream self tends to watch rather than participate. You're processing things from a distance." },
    2: { label: "The Survivor", desc: "Your dreams often involve facing threats or challenges. Your inner world is working through something that feels overwhelming." },
    3: { label: "The Performer", desc: "Your dreams frequently involve tasks, tests, or expectations from others. You may be processing questions about competence or external demands." },
    4: { label: "The Traveler", desc: "Your dreams are full of movement — trying to get somewhere, finding your way. You're actively pursuing something in your inner life." },
    5: { label: "The Connector", desc: "Your dreams center on relationships — reaching out to others, seeking connection. Your inner world is oriented toward relating." },
    6: { label: "The Independent", desc: "Your dreams show a strong, self-sufficient dream self — content alone, helping others, acting from abundance." },
  },
};
```

### Email Gate Integration

Use the same pattern as `/resources/arfid-checklist.astro`:

1. User enters email on the landing page
2. Email sent to Supabase `email-signup` edge function with `context: 'dream-journal'` and `source: 'dream_tool'`
3. On success, the gate opens and the dream journal loads
4. The email is stored in localStorage so returning visitors bypass the gate
5. Person enters the person spine with a new context tag for dream analysis interest

### CTA Strategy

- **In the dream journal**: After 3+ dreams recorded, show a soft CTA: "Want to explore what your dreams are telling you? Brian Nuckols works with dreams in therapy. [Book a consultation]"
- **On the landing page**: Position as a self-discovery tool, not a clinical instrument. "Your dreams have structure. Track them. See the patterns."
- **Blog post CTAs**: All dream-related blog posts should link to `/resources/dream-journal` as the contextual callout

---

## Hub-and-Spoke Content Model: Dream Analysis

### The Hub Page

Create `/dream-analysis` (or `/dreams`) as a pillar page. This is the central authority page that all spoke content links back to.

**Hub page structure:**
- H1: "Understanding Your Dreams: A Structural Approach"
- What dreams actually are (empirical, not mystical — cite Roesler's research)
- The six dream patterns (consumer-friendly version of the typology)
- How dream structure changes during therapy
- The Dream Pattern Tracker tool (link to `/resources/dream-journal`)
- Links to all spoke posts
- Email signup with dream-journal context
- JSON-LD: Article schema with FAQ

### Spoke Posts (Blog Posts)

Each spoke targets a specific long-tail keyword and links back to the hub. Mix informative and depth voices per the alternation rule.

| # | Title | Voice | SEO Target | STDC Stage |
|---|-------|-------|------------|------------|
| 1 | "What Do Recurring Dreams Mean?" | informative | "recurring dreams meaning" | See |
| 2 | "Why You Keep Having the Same Nightmare" | depth | "same nightmare every night" | Think |
| 3 | "What Your Anxiety Dreams Are Actually About" | informative | "anxiety dreams meaning" | See |
| 4 | "Dreams About Being Chased: Your Psyche Is Trying to Tell You Something" | depth | "dreams about being chased meaning" | Think |
| 5 | "Why You Dream About Failing Tests (Even Years After School)" | informative | "test dreams meaning" | See |
| 6 | "Dreams After Trauma: What Changes and What It Means" | informative | "dreams after trauma" | Think |
| 7 | "Can You Use Your Dreams in Therapy?" | informative | "dreamwork in therapy" | Do |
| 8 | "What Does It Mean When You Can't Move in a Dream?" | informative | "can't move in dream meaning" | See |
| 9 | "Your Dreams Know What You're Avoiding" | depth | "dreams and avoidance" | Think |
| 10 | "How Dream Patterns Change During Therapy" | depth | "dreams during therapy" | Think |

**CTA mapping for all dream posts:**
- Contextual callout: Dream Pattern Tracker (`/resources/dream-journal`)
- End CTA: `book_consult` (for depth posts) or `try_dream_journal` (for informative posts)
- Topic tag: `dreams`

### Spoke Post Template (Frontmatter)

```yaml
---
title: "What Do Recurring Dreams Mean?"
description: "Recurring dreams aren't random. Research shows they reflect unresolved patterns in your inner life. Here's what the structure of your recurring dreams reveals."
pubDate: 2026-04-15
topic: dreams
voice: informative
cta: try_dream_journal
seo_target: "recurring dreams meaning"
stage: see
faq:
  - q: "Why do I keep having the same dream?"
    a: "Recurring dreams typically reflect unresolved psychological patterns..."
  - q: "Are recurring dreams a sign of something wrong?"
    a: "Not necessarily. Research shows that recurring dream patterns..."
  - q: "Can therapy help with recurring dreams?"
    a: "Yes. Studies show that dream patterns change measurably during successful therapy..."
---
```

### Content Callout Component Update

The `ContentCallout.astro` component needs a new topic branch:

```
if topic === 'dreams':
  callout = Dream Pattern Tracker link (/resources/dream-journal)
  text = "Track your own dream patterns with this free tool based on clinical dream research."
```

### Internal Linking Strategy

```
Hub: /dream-analysis (or /dreams)
  ├── Spoke 1: /blog/recurring-dreams-meaning → links back to hub
  ├── Spoke 2: /blog/same-nightmare-every-night → links back to hub
  ├── Spoke 3: /blog/anxiety-dreams-meaning → links back to hub
  ├── ...
  └── Lead Magnet: /resources/dream-journal → linked from hub + all spokes
```

Every spoke post includes:
- Link to the hub page in the first 2 paragraphs
- Link to the dream journal tool in the contextual callout
- Link to 2-3 related spoke posts in the "Related" section
- Link back to hub in the closing paragraph

The hub page links to every spoke post, organized by theme (recurring dreams, anxiety dreams, trauma dreams, therapy + dreams).

---

## Person Spine Integration

When someone enters their email on the dream journal:

1. `email-signup` edge function creates/deduplicates in `people` table
2. `context: 'dream-journal'` stored in `journey_notes`
3. `source: 'dream_tool'` tracks attribution
4. Welcome email sent via Resend (could be dream-specific welcome: "Your Dream Pattern Tracker is ready")
5. 3-day nudge: instead of PRI nudge, send a "Have you recorded your first dream yet?" nudge
6. After 5+ dreams logged: email with "Your dream patterns suggest you might benefit from exploring this in therapy" + book_consult link

This creates a new funnel:
```
Dream blog post (See) → Dream journal tool (Think/Do) → Consultation booking (Care)
```

---

## Study Setup (Remaining Steps)

After the consumer version is live, finish the research study setup:

1. **Run Supabase migration**: `~/sda-engine/supabase/schema.sql` against the existing Supabase instance
2. **Set environment variables**: `VITE_SUPABASE_ANON_KEY` in Vercel for the sda-engine project
3. **Update participant app**: Set `SUPABASE_ANON_KEY` constant in `~/sda-engine/participant/app.js`
4. **Create first study**: INSERT into `studies` table (name, mode SDA-SI or SDA-TNS)
5. **Generate participant tokens**: INSERT into `participants` table with unique tokens
6. **Share participant links**: `sda-engine.vercel.app/participant/index.html?t={token}`
7. **Score dreams**: Use the dashboard at `sda-engine.vercel.app/dashboard/`
8. **Export data**: CSV export from study dashboard for R/SPSS analysis

The consumer dream journal and the research instrument share the same scoring engine but different data backends (localStorage vs Supabase). A participant who starts with the consumer version and later enters a study gets a fresh research-grade data collection through the study link.

---

## File Reference

| File | Location | Purpose |
|------|----------|---------|
| SDA scoring engine | `~/sda-engine/scoring/` | 4 JS files: data, engine, statistics, decision tree |
| Participant app | `~/sda-engine/participant/` | 3 files: HTML, JS, CSS (copy + adapt for consumer) |
| Research dashboard | `~/sda-engine/dashboard/` | React+Vite clinician/researcher interface |
| Supabase schema | `~/sda-engine/supabase/schema.sql` | 7 tables for research data |
| Instruments (HTML) | `~/Desktop/sda-instrument-development/` | Paper forms, operationalization manual, literature synthesis |
| briannuckols.com | `~/briannuckols-site/` | Astro site, blog, resources, email capture |
| Transformation engine | `~/transformation-engine/` | Supabase edge functions, person spine |

---

## Sequence for the Website Agent

1. Copy scoring engine files to `~/briannuckols-site/public/dream-journal/scoring/`
2. Copy and adapt participant app to `~/briannuckols-site/public/dream-journal/`
3. Create `dream-reflections.js` with consumer-friendly interpretations
4. Create `/resources/dream-journal.astro` landing page with email gate
5. Create `/dream-analysis.astro` hub page
6. Write spoke posts 1-3 (start with highest-volume SEO targets)
7. Update `ContentCallout.astro` with `dreams` topic branch
8. Update `content.config.ts` if needed for new topic
9. Deploy and verify email capture flows through to person spine
