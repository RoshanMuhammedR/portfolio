-- 0007_seed_projects_and_craft
--
-- Moves the nine projects in content/projects.ts, plus the Konnectify
-- internship, into the table, and fills in the craft metadata the hover card
-- reads. Everything here is already on the site; nothing is invented.
--
-- `glow` stays null: the tuned gradients live in content/glows.ts, keyed by
-- slug, and the column is only for overriding one of them.
--
-- `sort` reproduces the Home mosaic as it is authored today. `home_layout` on
-- the first project of a row sets that row's shape.

insert into public.projects
  (slug, title, subtitle, tags, kind, live_url, repo_url, image_url, image_position,
   show_on_home, show_on_works, home_layout, sort, published)
values
  -- On Works only: there is no screenshot, and Home opens on work that has one.
  ('konnectify', 'Konnectify', 'Software Development Intern',
   '{Internship,Full-stack}', 'experience',
   null, null, null, 'center top',
   false, true, null, 0, true),

  ('saga', 'Saga', 'Agentic RAG knowledge base',
   '{RAG,FastAPI,pgvector}', 'project',
   'https://saga.dedyn.io/', 'https://github.com/RoshanMuhammedR/KB-ULT',
   '/work/saga.webp', 'center',
   true, true, 'full', 1, true),

  ('ai-trip-planner', 'AI Trip Planner', 'Contextual itinerary engine',
   '{React,Gemini,"Places API"}', 'project',
   'https://ai-trip-planner-rho-orcin.vercel.app/', 'https://github.com/RoshanMuhammedR/AI_Trip_Planner',
   '/work/ai-trip-planner.webp', 'center 58%',
   true, true, 'full', 2, true),

  ('sniplink', 'Sniplink', 'URL shortener with cached redirects',
   '{"Java 21","Spring Boot",Redis}', 'project',
   'https://sniplink.dedyn.io/', 'https://github.com/RoshanMuhammedR/sniplink',
   '/work/sniplink.webp', 'center 12%',
   true, true, 'aside', 3, true),

  ('vps-stack', 'vps-stack', 'Scale-to-zero hosting on one VPS',
   '{Docker,Caddy,Python}', 'project',
   'https://github.com/RoshanMuhammedR/vps-stack', 'https://github.com/RoshanMuhammedR/vps-stack',
   null, 'center top',
   true, true, null, 4, true),

  ('ai-resume-analyzer', 'Resume Analyzer', 'Résumé-to-job fit analysis',
   '{"Next.js","Claude API"}', 'project',
   'https://ai-resume-analyzer-blond-pi.vercel.app/', 'https://github.com/RoshanMuhammedR/ai-resume-analyzer',
   '/work/ai-resume-analyzer.webp', 'center top',
   true, true, 'pair', 5, true),

  ('youtube-chat', 'YouTube Chat', 'Chat with a video, jump to the cited moment',
   '{FastAPI,LangChain,Extension}', 'project',
   'https://github.com/RoshanMuhammedR/Youtube-Chat', 'https://github.com/RoshanMuhammedR/Youtube-Chat',
   null, 'center top',
   true, true, null, 6, true),

  ('lumyn', 'Lumyn', 'AI website creator',
   '{"Next.js",NestJS,Prisma}', 'project',
   'https://github.com/RoshanMuhammedR/lumyn', 'https://github.com/RoshanMuhammedR/lumyn',
   null, 'center top',
   true, true, 'aside-flipped', 7, true),

  ('monotask', 'MonoTask', 'MERN task manager',
   '{MongoDB,Express,React}', 'project',
   'https://to-do-mern-y0qk.onrender.com/', 'https://github.com/RoshanMuhammedR/To-Do_MERN',
   '/work/monotask.webp', 'center',
   true, true, null, 8, true),

  -- On Works but not in the Home mosaic, which is authored as five rows.
  ('truthmesh', 'TruthMesh', 'Crowdsourced news verification · hackathon',
   '{Python,Streamlit}', 'project',
   'https://github.com/RoshanMuhammedR/TruthMesh_ZenMinds', 'https://github.com/RoshanMuhammedR/TruthMesh_ZenMinds',
   null, 'center top',
   false, true, null, 9, true)
on conflict (slug) do nothing;

-- ---------------------------------------------------------------- craft ----
-- Descriptions are the one-line summaries from the crafts repo README; the
-- aspect ratios are the captures' own. `source_url` stays null because the
-- repository is local and has not been pushed.
update public.craft_items as c
set description = v.description,
    tags        = v.tags,
    year        = 2026,
    aspect      = v.aspect,
    sort        = v.sort
from (values
  ('/crafts/01-job-queue/index.html',
   'Producers enqueue jobs, workers drain them, failures retry and land in a dead-letter lane after three attempts.',
   '{Queues,Retries,Workers}'::text[], 1.6::real, 1),
  ('/crafts/02-token-bucket/index.html',
   'A rate limiter refilling at a fixed rate; requests without a token get a 429.',
   '{"Rate limiting",Algorithms}'::text[], 1.6::real, 2),
  ('/crafts/03-vector-search/index.html',
   'Top-k retrieval over embedded chunks — move the query, watch the ranking change.',
   '{Embeddings,Retrieval,RAG}'::text[], 1.6::real, 3),
  ('/crafts/04-hash-ring/index.html',
   'Consistent hashing with virtual nodes; adding a server only moves one arc of keys.',
   '{"Consistent hashing",Sharding}'::text[], 1.0::real, 4),
  ('/crafts/05-lru-cache/index.html',
   'Hits move to the front, misses evict the back, under Zipf-shaped traffic.',
   '{Caching,Eviction}'::text[], 1.6::real, 5),
  ('/crafts/06-permission-resolver/index.html',
   'User override, then team policy, then role — with the trace for any cell.',
   '{RBAC,Authorisation}'::text[], 1.6::real, 6),
  ('/crafts/07-workflow-canvas/index.html',
   'A node graph with draggable nodes and wires that follow.',
   '{Canvas,Graphs,Interaction}'::text[], 1.6::real, 7),
  ('/crafts/08-command-palette/index.html',
   'Fuzzy matching with word-start bonuses, grouped and keyboard-first.',
   '{"Fuzzy search",Keyboard}'::text[], 1.0::real, 8),
  ('/crafts/09-magnetic-dock/index.html',
   'Cosine-falloff magnification and a springy launch.',
   '{Motion,Interaction}'::text[], 1.0::real, 9),
  ('/crafts/10-citation-reader/index.html',
   'Every claim in an answer linked to the source chunk it came from.',
   '{RAG,Citations}'::text[], 1.6::real, 10),
  ('/crafts/11-deploy-replay/index.html',
   'A replay of vps-stack''s one-command bring-up.',
   '{Deploys,Docker}'::text[], 1.0::real, 11),
  ('/crafts/12-activity-heatmap/index.html',
   'A year-long calendar heatmap over seeded sample data.',
   '{Dataviz,Calendars}'::text[], 1.6::real, 12)
) as v(href, description, tags, aspect, sort)
where c.href = v.href;
