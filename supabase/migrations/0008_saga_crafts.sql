-- 0008_saga_crafts
--
-- Replaces the twelve original crafts with ten UI pieces rebuilt from Saga
-- (github.com/RoshanMuhammedR/KB-ULT), each a self-contained page under
-- public/crafts/ with its capture in public/craft/.
--
-- Craft rows now carry a `slug`, so a craft set can be synced from a file like
-- this one: re-running it updates the rows by slug instead of duplicating them.
-- Rows made in the studio keep a null slug and are left alone.
--
-- Descriptions and tags come from the craft brief written against the Saga
-- code; nothing here is a metric or a claim about usage.

alter table public.craft_items add column if not exists slug text;
create unique index if not exists craft_items_slug_key on public.craft_items (slug);

-- The original twelve, matched by the demo each one opened.
delete from public.craft_items
where slug is null
  and href in (
    '/crafts/01-job-queue/index.html', '/crafts/02-token-bucket/index.html',
    '/crafts/03-vector-search/index.html', '/crafts/04-hash-ring/index.html',
    '/crafts/05-lru-cache/index.html', '/crafts/06-permission-resolver/index.html',
    '/crafts/07-workflow-canvas/index.html', '/crafts/08-command-palette/index.html',
    '/crafts/09-magnetic-dock/index.html', '/crafts/10-citation-reader/index.html',
    '/crafts/11-deploy-replay/index.html', '/crafts/12-activity-heatmap/index.html'
  );

-- `x, y, w, h` only matter to the manual-layout mode; the infinite board lays
-- tiles out from `sort` and `aspect` (1.6 for the wide captures, 1 for square).
insert into public.craft_items
  (slug, title, caption, href, image_url, x, y, w, h,
   description, tags, year, source_url, aspect, sort, published)
values
  ('streaming-answer', 'Streaming answer', '01 · Streaming answer',
   '/crafts/01-streaming-answer/index.html', '/craft/01-streaming-answer.webp', 280, 200, 408, 255,
   'A question streams into a cited answer: live stage labels, shimmer skeleton, caret, then sources and checks.',
   '{Streaming,"State machine",Chat}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1.6, 1, true),

  ('retrieval-terminal', 'Retrieval terminal', '02 · Retrieval terminal',
   '/crafts/02-retrieval-terminal/index.html', '/craft/02-retrieval-terminal.webp', 748, 150, 408, 255,
   'A looping readout: a question types itself, a meter fills, passages rank in with scrambled names and scores.',
   '{Timeline,"Text scramble",Loop}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1.6, 2, true),

  ('citation-jump', 'Citation jump', '03 · Citation jump',
   '/crafts/03-citation-jump/index.html', '/craft/03-citation-jump.webp', 1216, 210, 408, 255,
   'Click a cited passage to open its source with the exact passage highlighted, then step through citations.',
   '{Master–detail,"Document viewer",Navigation}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1.6, 3, true),

  ('drag-to-chat', 'Drag to chat', '04 · Drag to chat',
   '/crafts/04-drag-to-chat/index.html', '/craft/04-drag-to-chat.webp', 1684, 150, 408, 255,
   'Drag a knowledge-base card onto the Chat tab or composer to attach it; hovering the tab opens chat.',
   '{"Drag and drop","Drop targets",State}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1.6, 4, true),

  ('slice-sweep', 'Slice sweep', '05 · Slice sweep',
   '/crafts/05-slice-sweep/index.html', '/craft/05-slice-sweep.webp', 280, 520, 408, 255,
   'A list where each row floods with the accent in 37 thin slices on hover and drains to the right on leave.',
   '{Hover,Stagger}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1.6, 5, true),

  ('edge-glow-card', 'Edge-glow card', '06 · Edge-glow card',
   '/crafts/06-edge-glow-card/index.html', '/craft/06-edge-glow-card.webp', 748, 470, 395, 395,
   'A dashed card whose lit edge turns to face the pointer, over a grid whose gutters glow where you move.',
   '{"Pointer tracking","Conic gradient",SVG}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1, 6, true),

  ('upload-and-ingest', 'Upload and ingest', '07 · Upload and ingest',
   '/crafts/07-upload-and-ingest/index.html', '/craft/07-upload-and-ingest.webp', 1216, 530, 395, 395,
   'Pick a source type, drop files, and watch each one move through reading, splitting and indexing.',
   '{Dropzone,Progress,"Async states"}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1, 7, true),

  ('spark-loader', 'Spark loader', '08 · Spark loader',
   '/crafts/08-spark-loader/index.html', '/craft/08-spark-loader.webp', 1684, 470, 395, 395,
   'Labels scramble in, corner pins flicker, the spark fills from below, then its four petals fold to the centre.',
   '{Intro,"SVG mask",Timeline}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1, 8, true),

  ('menu-reveal', 'Menu reveal', '09 · Menu reveal',
   '/crafts/09-menu-reveal/index.html', '/craft/09-menu-reveal.webp', 280, 840, 395, 395,
   'Hamburger morphs to a close mark while a dashed card scales from its corner and lines rise behind masks.',
   '{Menu,Morph,Stagger}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1, 9, true),

  ('section-rail', 'Section rail', '10 · Section rail',
   '/crafts/10-section-rail/index.html', '/craft/10-section-rail.webp', 748, 930, 395, 395,
   'A scroll-spy rail: each segment fills as you read, labels slide out on hover, the current name scrambles in.',
   '{Scroll-spy,Progress,Navigation}', 2026, 'https://github.com/RoshanMuhammedR/KB-ULT', 1, 10, true)
on conflict (slug) do update set
  title = excluded.title, caption = excluded.caption, href = excluded.href,
  image_url = excluded.image_url, x = excluded.x, y = excluded.y, w = excluded.w, h = excluded.h,
  description = excluded.description, tags = excluded.tags, year = excluded.year,
  source_url = excluded.source_url, aspect = excluded.aspect, sort = excluded.sort,
  published = excluded.published;

notify pgrst, 'reload schema';
