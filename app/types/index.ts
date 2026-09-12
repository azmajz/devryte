// ============================================================
// Devryte — Shared Types (mirrors Supabase DB schema)
// 3-Level: Topic → Collection → Lesson
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
  /** Computed/joined: total lesson count across all collections */
  lesson_count?: number
  /** Computed/joined: number of collections */
  collection_count?: number
}

export interface Collection {
  id: string
  topic_id: string
  slug: string
  name: string
  description: string | null
  order_index: number
  created_at: string | null
  /** Computed/joined from `lessons(id)` */
  lesson_count?: number
}

export interface Lesson {
  id: string
  collection_id: string
  title: string
  slug: string
  order_index: number
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
  name: string
  slug: string
}

export interface LessonSearchResult {
  type: 'lesson'
  id: string
  title: string
  topicSlug: string | null
  topicName: string | null
  collectionSlug: string | null
  collectionName: string | null
}

export type SearchResult = TopicSearchResult | LessonSearchResult
