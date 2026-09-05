// ============================================================
// Devryte — Shared Types (mirrors Supabase DB schema)
// ============================================================

// ─── Core DB Entities ────────────────────────────────────────

export interface Topic {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
  color: string | null
  created_at: string | null
  /** Computed/joined from `lessons(id)` in index.vue query */
  lesson_count?: number
}

export interface Lesson {
  id: string
  topic_id: string
  title: string
  slug: string
  read_time: number
  content: string | null
  updated_at: string | null
  created_at: string | null
}

// ─── Derived / Partial Shapes ────────────────────────────────

/** Lightweight lesson row used for prev/next navigation */
export interface AdjacentLesson {
  id: string
  title: string
  created_at: string | null
}

export interface AdjacentLessons {
  prev: AdjacentLesson | null
  next: AdjacentLesson | null
}

// ─── Search ──────────────────────────────────────────────────

export interface TopicSearchResult {
  type: 'topic'
  id: string
  title: string
  slug: string
}

export interface LessonSearchResult {
  type: 'lesson'
  id: string
  title: string
  topicSlug: string | null
  topicName: string | null
}

export type SearchResult = TopicSearchResult | LessonSearchResult
