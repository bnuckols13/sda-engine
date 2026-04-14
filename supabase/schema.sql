-- SDA Analysis Engine — Database Schema
-- Supabase PostgreSQL
-- Studies → Participants → Dreams → Scores

-- ============================================================
-- TABLES
-- ============================================================

create table if not exists studies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  mode        text not null check (mode in ('SDA-SI', 'SDA-TNS')),
  config      jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create table if not exists participants (
  id            uuid primary key default gen_random_uuid(),
  study_id      uuid not null references studies(id) on delete cascade,
  token         text not null unique,
  label         text not null default '',
  consented_at  timestamptz,
  created_at    timestamptz not null default now()
);
create index if not exists idx_participants_token on participants(token);
create index if not exists idx_participants_study on participants(study_id);

create table if not exists dreams (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null references participants(id) on delete cascade,
  sequence_num    integer not null,
  dream_text      text not null,
  word_count      integer not null,
  dream_date      date,
  created_at      timestamptz not null default now(),
  unique(participant_id, sequence_num)
);
create index if not exists idx_dreams_participant on dreams(participant_id);

create table if not exists part_b_scores (
  id          uuid primary key default gen_random_uuid(),
  dream_id    uuid not null references dreams(id) on delete cascade unique,
  responses   jsonb not null,
  -- SI subscales
  agency      integer,
  threat      integer,
  relational  integer,
  continuity  integer,
  -- TNS extension subscales (null in SI mode)
  trauma_agency   integer,
  trauma_threat   integer,
  trauma_impact   integer,
  repetition      integer,
  created_at  timestamptz not null default now()
);

create table if not exists part_a_scores (
  id                      uuid primary key default gen_random_uuid(),
  dream_id                uuid not null references dreams(id) on delete cascade,
  rater_id                text not null,
  ptc_code                text not null,
  ptc_linear              integer not null check (ptc_linear between 1 and 21),
  ego_position            integer check (ego_position between 1 and 5),
  narrative_arc           integer check (narrative_arc between 1 and 5),
  tm_markers              text[] not null default '{}',
  -- TNS extensions (null in SI mode)
  fff_position            integer check (fff_position between 1 and 6),
  threat_specificity      text,
  threat_proximity        text,
  threat_familiarity      text,
  threat_transformation   text,
  repetition_fidelity     integer check (repetition_fidelity between 1 and 5),
  awakening_pattern       text,
  notes                   text default '',
  scored_at               timestamptz not null default now(),
  unique(dream_id, rater_id)
);
create index if not exists idx_part_a_dream on part_a_scores(dream_id);

create table if not exists index_nightmares (
  id              uuid primary key default gen_random_uuid(),
  participant_id  uuid not null references participants(id) on delete cascade unique,
  narrative       text not null,
  onset_date      text,
  frequency       text,
  baseline_ptc    text,
  baseline_fff    integer,
  created_at      timestamptz not null default now()
);

create table if not exists self_codings (
  id          uuid primary key default gen_random_uuid(),
  dream_id    uuid not null references dreams(id) on delete cascade,
  ptc_code    text not null,
  ptc_linear  integer not null check (ptc_linear between 1 and 21),
  tree_path   jsonb,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table studies enable row level security;
alter table participants enable row level security;
alter table dreams enable row level security;
alter table part_b_scores enable row level security;
alter table part_a_scores enable row level security;
alter table index_nightmares enable row level security;
alter table self_codings enable row level security;

-- Authenticated users (clinicians/researchers) get full access
create policy "auth_studies" on studies for all using (auth.role() = 'authenticated');
create policy "auth_participants" on participants for all using (auth.role() = 'authenticated');
create policy "auth_dreams" on dreams for all using (auth.role() = 'authenticated');
create policy "auth_part_b" on part_b_scores for all using (auth.role() = 'authenticated');
create policy "auth_part_a" on part_a_scores for all using (auth.role() = 'authenticated');
create policy "auth_index_nightmares" on index_nightmares for all using (auth.role() = 'authenticated');
create policy "auth_self_codings" on self_codings for all using (auth.role() = 'authenticated');

-- Anon users (participants) access via token header
-- Participants can read their own study info
create policy "anon_studies_read" on studies for select using (
  id in (select study_id from participants where token = current_setting('request.headers', true)::json->>'x-participant-token')
);

-- Participants can read/update their own record
create policy "anon_participants_read" on participants for select using (
  token = current_setting('request.headers', true)::json->>'x-participant-token'
);
create policy "anon_participants_update" on participants for update using (
  token = current_setting('request.headers', true)::json->>'x-participant-token'
);

-- Participants can CRUD their own dreams
create policy "anon_dreams" on dreams for all using (
  participant_id in (select id from participants where token = current_setting('request.headers', true)::json->>'x-participant-token')
);

-- Participants can CRUD their own Part B scores
create policy "anon_part_b" on part_b_scores for all using (
  dream_id in (
    select d.id from dreams d
    join participants p on d.participant_id = p.id
    where p.token = current_setting('request.headers', true)::json->>'x-participant-token'
  )
);

-- Participants can read their own Part A scores (clinician-entered)
create policy "anon_part_a_read" on part_a_scores for select using (
  dream_id in (
    select d.id from dreams d
    join participants p on d.participant_id = p.id
    where p.token = current_setting('request.headers', true)::json->>'x-participant-token'
  )
);

-- Participants can CRUD their own self-codings
create policy "anon_self_codings" on self_codings for all using (
  dream_id in (
    select d.id from dreams d
    join participants p on d.participant_id = p.id
    where p.token = current_setting('request.headers', true)::json->>'x-participant-token'
  )
);

-- Participants can CRUD their own index nightmare
create policy "anon_index_nightmares" on index_nightmares for all using (
  participant_id in (select id from participants where token = current_setting('request.headers', true)::json->>'x-participant-token')
);
