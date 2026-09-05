<script setup lang="ts">
import type { Topic, Lesson, AdjacentLessons, AdjacentLesson } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const id = computed(() => route.params.id as string)

const client = useSupabaseClient()
const { data: topic, pending: topicPending } = await useAsyncData<Topic | null>(`topic-${slug.value}`, async () => {
  const { data } = await client.from('topics').select('*').eq('slug', slug.value).single()
  return data as Topic | null
})

const { data: lesson, pending: lessonPending } = await useAsyncData<Lesson | null>(`lesson-${id.value}`, async () => {
  const { data } = await client.from('lessons').select('*').eq('id', id.value).single()
  return data as Lesson | null
})

const { data: adjacent } = await useAsyncData<AdjacentLessons | null>(`adjacent-${id.value}`, async () => {
  if (!topic.value) return null
  const { data: allLessons } = await client.from('lessons')
    .select('id, title, created_at')
    .eq('topic_id', topic.value.id)
    .order('created_at', { ascending: true })

  if (!allLessons) return null

  const currentIndex = allLessons.findIndex((l: AdjacentLesson) => l.id === id.value)
  if (currentIndex === -1) return null

  return {
    prev: currentIndex > 0 ? allLessons[currentIndex - 1] as AdjacentLesson : null,
    next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] as AdjacentLesson : null
  }
}, {
  watch: [topic]
})

watchEffect(() => {
  if (slug.value && id.value && !topicPending.value && !lessonPending.value && (!topic.value || !lesson.value)) {
    throw createError({ statusCode: 404, statusMessage: 'Lesson not found' })
  }
})

useHead(computed(() => ({
  title: lesson.value && topic.value
    ? `${lesson.value.title} — ${topic.value.name} — Devryte`
    : 'Devryte',
  meta: [{
    name: 'description',
    content: lesson.value && topic.value
      ? `Learn ${lesson.value.title} in the ${topic.value.name} topic.`
      : '',
  }],
})))

// TOC visibility — persisted in localStorage
const tocVisible = ref(false)

onMounted(() => {
  const saved = localStorage.getItem('devryte:toc-visible')
  if (saved !== null) tocVisible.value = saved === 'true'
})

function toggleToc() {
  tocVisible.value = !tocVisible.value
  localStorage.setItem('devryte:toc-visible', String(tocVisible.value))
}
</script>

<template>
  <div class="lesson-page">
    <AppHeader />

    <main class="page-content" v-if="topic && lesson">
      <div class="lesson-outer">
        <!-- Breadcrumb -->
        <nav :class="['breadcrumb fade-in', !tocVisible && 'toc-hidden']" aria-label="Breadcrumb">
          <NuxtLink to="/" class="bc-item">Topics</NuxtLink>
          <span class="bc-sep">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
          <NuxtLink :to="`/topics/${topic.slug}`" class="bc-item">{{ topic.name }}</NuxtLink>
          <span class="bc-sep">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
          <span class="bc-item active">{{ lesson.title }}</span>
        </nav>

        <!-- Lesson Layout -->
        <div class="lesson-layout" :class="{ 'toc-hidden': !tocVisible }">

          <!-- ── Main Content ───────────────────────────────── -->
          <article class="lesson-content fade-in">

            <!-- Meta bar -->
            <div class="lesson-meta-bar">
              <div class="lesson-meta-left">
                <NuxtLink :to="`/topics/${topic.slug}`" class="meta-tag" :style="{ color: topic.color, background: topic.color + '1A' }">
                  <template v-if="topic.icon && topic.icon.trim().startsWith('<svg')">
                    <span class="svg-icon-wrapper" style="display: flex; align-items: center;" v-html="topic.icon"></span>
                  </template>
                  <template v-else>
                    <span style="font-size: 1.2em;">{{ topic.icon }}</span>
                  </template>
                  <span class="topic-name" style="margin-left: 6px;">{{ topic.name }}</span>
                </NuxtLink>
                <span class="meta-time">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ lesson.read_time }} min read
                </span>
                <span class="meta-date">Updated {{ lesson.updated_at ? new Date(lesson.updated_at).toLocaleDateString() : '' }}</span>
              </div>

              <div class="meta-actions">
                <!-- TOC Toggle -->
                <button
                  class="btn-icon toc-toggle"
                  :class="{ active: tocVisible }"
                  :title="tocVisible ? 'Hide table of contents' : 'Show table of contents'"
                  @click="toggleToc"
                  id="toggle-toc-btn"
                  aria-label="Toggle table of contents"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <line x1="3" y1="12" x2="15" y2="12"/>
                    <line x1="3" y1="18" x2="18" y2="18"/>
                  </svg>
                </button>

                <!-- Edit -->
                <NuxtLink :to="`/topics/${topic.slug}/lessons/${lesson.id}/edit`" class="btn btn-ghost btn-sm" id="edit-lesson-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </NuxtLink>
              </div>
            </div>

            <!-- Markdown content — centered with max-width -->
            <div class="prose-wrap">
              <MarkdownRenderer :content="lesson.content" />
            </div>

            <!-- Prev / Next Navigation -->
            <nav v-if="adjacent" class="lesson-nav">
              <NuxtLink
                v-if="adjacent.prev"
                :to="`/topics/${topic.slug}/lessons/${adjacent.prev.id}`"
                class="lesson-nav-btn prev"
                id="prev-lesson-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 12H5M12 5l-7 7 7 7"/>
                </svg>
                <div class="nav-btn-text">
                  <span class="nav-direction">Previous</span>
                  <span class="nav-title">{{ adjacent.prev.title }}</span>
                </div>
              </NuxtLink>
              <div v-else class="lesson-nav-spacer"></div>

              <NuxtLink
                v-if="adjacent.next"
                :to="`/topics/${topic.slug}/lessons/${adjacent.next.id}`"
                class="lesson-nav-btn next"
                id="next-lesson-btn"
              >
                <div class="nav-btn-text">
                  <span class="nav-direction">Next</span>
                  <span class="nav-title">{{ adjacent.next.title }}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
            </nav>
          </article>

          <!-- ── Table of Contents ──────────────────────────── -->
          <Transition name="toc-slide">
            <TableOfContents v-if="tocVisible" :content="lesson.content" />
          </Transition>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lesson-page {
  min-height: 100vh;
}

/* Outer shell — centred, max-width */
.lesson-outer {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

/* Breadcrumb */

.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  padding-top: var(--space-4);
  flex-wrap: wrap;
  max-width: 768px;
  margin-left: auto;
  margin-right: auto;
}

.bc-item {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--duration-fast);
  white-space: nowrap;
}

.bc-item:hover { color: var(--accent-primary); }

.bc-item.active {
  color: var(--text-secondary);
  font-weight: 500;
  max-width: 30ch;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bc-sep {
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
}

/* ── Layout ──────────────────────────────────────────────── */
.lesson-layout {
  display: grid;
  /* content col (fluid, max ~760px) + TOC col (240px) */
  grid-template-columns: 1fr 240px;
  gap: var(--space-12);
  align-items: flex-start;
  padding-bottom: var(--space-20);
}

/* When TOC is hidden, content spans full width and is centred */
.lesson-layout.toc-hidden {
  grid-template-columns: 1fr;
}

/* ── Content column ──────────────────────────────────────── */
.lesson-content {
  min-width: 0;
}

/* Centre prose within the content column */
.prose-wrap {
  max-width: 768px;
  margin: 0 auto;
}

/* ── Meta bar ────────────────────────────────────────────── */
.lesson-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
  max-width: 768px;
  margin-left: auto;
  margin-right: auto;
}

.lesson-meta-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}
.topic-name {
  color: var(--text-primary);
}
.meta-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: var(--radius-full);
  font-size: 0.78125rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.meta-time,
.meta-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

/* ── TOC toggle button ───────────────────────────────────── */
.toc-toggle {
  color: var(--text-tertiary);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: var(--space-2);
  transition: all var(--duration-fast);
}

.toc-toggle:hover {
  color: var(--text-primary);
  background: var(--bg-surface-hover);
  border-color: var(--border-subtle);
}

.toc-toggle.active {
  color: var(--accent-primary);
  background: var(--accent-glow-soft);
  border-color: var(--border-color);
}

/* ── Prev/Next nav ───────────────────────────────────────── */
.lesson-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-12);
  padding-top: var(--space-8);
  border-top: 1px solid var(--border-subtle);
  max-width: 760px;
  margin-left: auto;
  margin-right: auto;
}

.toc-hidden .lesson-nav {
  max-width: 820px;
}

.lesson-nav-btn {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--duration-base) var(--ease-out);
}

.lesson-nav-btn:hover {
  border-color: var(--accent-primary);
  background: var(--accent-glow-soft);
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  color: var(--text-primary);
}

.lesson-nav-btn svg {
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: color var(--duration-fast);
}

.lesson-nav-btn:hover svg { color: var(--accent-primary); }
.lesson-nav-btn.next { flex-direction: row-reverse; }

.nav-btn-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.lesson-nav-btn.next .nav-btn-text { align-items: flex-end; }

.nav-direction {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 600;
}

.nav-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 24ch;
}

.lesson-nav-spacer {}

/* ── TOC slide transition ────────────────────────────────── */
.toc-slide-enter-active,
.toc-slide-leave-active {
  transition: opacity var(--duration-base) var(--ease-out),
              transform var(--duration-base) var(--ease-out);
}
.toc-slide-enter-from,
.toc-slide-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

/* ── Responsive ──────────────────────────────────────────── */
@media (max-width: 1100px) {
  .lesson-layout {
    grid-template-columns: 1fr;
  }
  /* On narrow screens the TOC toggle hides the sidebar only */
}

@media (max-width: 768px) {
  .lesson-outer {
    padding: 0 var(--space-4);
  }
}

@media (max-width: 640px) {
  .lesson-nav { grid-template-columns: 1fr; }
  .lesson-meta-bar { flex-direction: column; align-items: flex-start; }
  .meta-actions { align-self: flex-start; }
}
</style>
