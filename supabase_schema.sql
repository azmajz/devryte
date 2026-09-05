-- ==========================================
-- Devryte Supabase Schema & Seed Data
-- ==========================================

-- 1. Create Tables
-- Note: Using snake_case for column names, which is standard for PostgreSQL.
-- You may need to update your frontend TS models/components to match these names
-- (e.g., accentColor -> accent_color, readTime -> read_time) or map them in the client.

CREATE TABLE public.topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID not null references auth.users(id),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID not null references auth.users(id),
    topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    read_time INT NOT NULL DEFAULT 0,
    content TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(topic_id, slug)
);

-- 2. Enable Row Level Security (RLS)
-- By default, allowing public read access for a learning platform.
-- You can restrict this later if you add user authentication.
ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on topics" 
ON public.topics FOR SELECT USING (true);

CREATE POLICY "Allow public read access on lessons" 
ON public.lessons FOR SELECT USING (true);

-- 3. Insert Seed Data
-- We store the generated UUIDs in variables (or just hardcode known UUIDs for seeding) 
-- so we can link lessons to their respective topics.

-- Seed Topics
INSERT INTO public.topics (id, slug, name, description, icon, color)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'csharp', 'C#', 'Modern, type-safe, object-oriented language for .NET development. From fundamentals to advanced patterns.', '⚡', '#7c3aed'),
  ('22222222-2222-2222-2222-222222222222', 'javascript', 'JavaScript', 'The language of the web. Closures, event loops, promises, and modern ES features.', '🟡', '#d97706'),
  ('33333333-3333-3333-3333-333333333333', 'nuxt', 'Nuxt', 'The intuitive Vue framework. File-based routing, server-side rendering, and full-stack capabilities.', '💚', '#059669'),
  ('44444444-4444-4444-4444-444444444444', 'postgresql', 'PostgreSQL', 'The world''s most advanced open-source relational database. Queries, indexes, and performance tuning.', '🐘', '#0369a1')
ON CONFLICT (id) DO NOTHING;

-- Seed Lessons
INSERT INTO public.lessons (topic_id, title, slug, read_time, updated_at, content)
VALUES 
  -- C# Lessons
  ('11111111-1111-1111-1111-111111111111', 'Object-Oriented Programming', 'oop', 8, '2026-08-28T00:00:00Z', '# Object-Oriented Programming in C#\n\nDummy markdown content for OOP. Update this later!'),
  ('11111111-1111-1111-1111-111111111111', 'LINQ — Language Integrated Query', 'linq', 10, '2026-08-30T00:00:00Z', '# LINQ\n\nDummy markdown content for LINQ. Update this later!'),
  ('11111111-1111-1111-1111-111111111111', 'Async/Await & Task Programming', 'async-await', 9, '2026-09-01T00:00:00Z', '# Async/Await\n\nDummy markdown content for Async/Await. Update this later!'),
  ('11111111-1111-1111-1111-111111111111', 'Records, Pattern Matching & Modern C#', 'modern-csharp', 7, '2026-09-02T00:00:00Z', '# Modern C#\n\nDummy markdown content for Modern C#. Update this later!'),
  
  -- JavaScript Lessons
  ('22222222-2222-2222-2222-222222222222', 'Closures & Scope', 'closures', 6, '2026-08-25T00:00:00Z', '# Closures & Scope\n\nDummy markdown content for Closures. Update this later!'),
  ('22222222-2222-2222-2222-222222222222', 'Promises & Async/Await', 'promises', 7, '2026-08-26T00:00:00Z', '# Promises\n\nDummy markdown content for Promises. Update this later!'),
  ('22222222-2222-2222-2222-222222222222', 'The Event Loop', 'event-loop', 5, '2026-08-27T00:00:00Z', '# The Event Loop\n\nDummy markdown content for the Event Loop. Update this later!'),

  -- Nuxt Lessons
  ('33333333-3333-3333-3333-333333333333', 'File-Based Routing', 'routing', 5, '2026-09-01T00:00:00Z', '# Routing\n\nDummy markdown content for Routing. Update this later!'),
  ('33333333-3333-3333-3333-333333333333', 'Data Fetching with useFetch', 'data-fetching', 6, '2026-09-02T00:00:00Z', '# Data Fetching\n\nDummy markdown content for Data Fetching. Update this later!'),

  -- PostgreSQL Lessons
  ('44444444-4444-4444-4444-444444444444', 'Window Functions', 'window-functions', 9, '2026-08-29T00:00:00Z', '# Window Functions\n\nDummy markdown content for Window Functions. Update this later!'),
  ('44444444-4444-4444-4444-444444444444', 'Indexes & Query Performance', 'indexes', 8, '2026-08-31T00:00:00Z', '# Indexes\n\nDummy markdown content for Indexes. Update this later!')
ON CONFLICT (topic_id, slug) DO NOTHING;

-- 4. Create View for Topic with Lesson Count
-- In Supabase, if you query this view instead of the `topics` table, 
-- you'll get the `lesson_count` automatically calculated.
]