-- Lab 5 schema: paste into Supabase SQL editor and click Run.
-- Project: https://supabase.com/dashboard/project/ukhmbhxinpfuovmixmja/sql
-- After running, open each table > shield icon > toggle RLS OFF (lab manual says this is fine).

-- =========================
-- Component B: checkouts
-- =========================
create table if not exists public.checkouts (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  item text not null,
  checked_out_at timestamptz not null default now(),
  due_at timestamptz not null,
  returned_at timestamptz
);

insert into public.checkouts (student_name, item, checked_out_at, due_at, returned_at) values
  ('Ada Lovelace',     'Sony A7III camera',           now() - interval '14 days', now() - interval '7 days', null),
  ('Grace Hopper',     'Rode wireless mic kit',       now() - interval '10 days', now() - interval '3 days', null),
  ('Alan Turing',      'MacBook Pro 14"',             now() - interval '21 days', now() - interval '7 days', now() - interval '6 days'),
  ('Katherine Johnson','Tripod (Manfrotto 055)',      now() - interval '5 days',  now() + interval '2 days', null),
  ('Linus Torvalds',   'Headphones (Sony WH-1000XM5)',now() - interval '2 days',  now() + interval '5 days', null),
  ('Margaret Hamilton','HDMI cable + adapter set',    now() - interval '30 days', now() - interval '20 days', now() - interval '18 days'),
  ('Hedy Lamarr',      'Lavalier mic',                now() - interval '8 days',  now() - interval '1 day',  null),
  ('Tim Berners-Lee',  'GoPro Hero 11',               now() - interval '3 days',  now() + interval '4 days', null);

-- =========================
-- Component E: events
-- =========================
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category text not null check (category in ('lecture','workshop','career','social')),
  starts_at timestamptz not null,
  location text
);

insert into public.events (title, description, category, starts_at, location) values
  ('Guest Lecture: Robotics in Manufacturing', 'Industry talk from a Boeing engineer.',                 'lecture',  now() + interval '2 days',  'GIX 240'),
  ('Workshop: Intro to Figma',                  'Hands-on UI design fundamentals.',                      'workshop', now() + interval '4 days',  'GIX 350'),
  ('Career Panel: Product Management',          'Three PMs from Microsoft, Amazon, and a startup.',      'career',   now() + interval '6 days',  'GIX Atrium'),
  ('Friday Social: Board Games',                'Drop in for board games and snacks.',                   'social',   now() + interval '7 days',  'GIX 3rd Floor Lounge'),
  ('Workshop: Soldering 101',                   'Learn to solder through-hole components.',              'workshop', now() + interval '9 days',  'Maker Space'),
  ('Guest Lecture: AI Ethics',                  'Visiting professor on responsible AI deployment.',      'lecture',  now() + interval '11 days', 'GIX 240'),
  ('Career Panel: UX Research',                 'Researchers from Google and Meta share their paths.',   'career',   now() + interval '13 days', 'GIX 350'),
  ('Coffee & Code',                             'Casual morning meetup; bring whatever you''re building.','social',   now() + interval '14 days', 'GIX Cafe');
