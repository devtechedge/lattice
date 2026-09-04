create table if not exists bookmarks (
  user_id text not null,
  role_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role_id)
);

create table if not exists applications (
  id text primary key,
  user_id text not null,
  role_id text not null,
  name text not null,
  email text not null,
  github text,
  linkedin text,
  telegram text,
  location text,
  cover_letter text not null default '',
  answers_json text not null default '[]',
  stage text not null default 'applied',
  created_at timestamptz not null default now()
);
create index if not exists applications_user_idx on applications (user_id);
create index if not exists applications_role_idx on applications (role_id);

create table if not exists posted_roles (
  id text primary key,
  user_id text,
  payload_json text not null,
  published_at timestamptz not null default now(),
  status text not null default 'open'
);

create table if not exists posted_gigs (
  id text primary key,
  user_id text,
  payload_json text not null,
  published_at timestamptz not null default now()
);

create table if not exists posted_projects (
  id text primary key,
  user_id text,
  payload_json text not null,
  published_at timestamptz not null default now()
);

create table if not exists talent_profiles (
  user_id text primary key,
  payload_json text not null,
  updated_at timestamptz not null default now()
);

create table if not exists contracts (
  id text primary key,
  user_id text not null,
  talent_id text,
  kind text not null,
  source_id text not null,
  payload_json text not null,
  status text not null default 'funded',
  created_at timestamptz not null default now()
);
create index if not exists contracts_user_idx on contracts (user_id);

create table if not exists salary_submissions (
  id text primary key,
  user_id text,
  role_key text not null,
  seniority text,
  region text,
  cash integer not null,
  token_value integer not null default 0,
  equity_value integer not null default 0,
  year integer not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists alerts (
  id text primary key,
  user_id text not null,
  channel text not null,
  filter_json text not null,
  cadence text not null,
  created_at timestamptz not null default now()
);

create table if not exists shortlists (
  user_id text not null,
  talent_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, talent_id)
);

create table if not exists proposals (
  id text primary key,
  user_id text not null,
  project_id text not null,
  note text not null,
  created_at timestamptz not null default now()
);
