<script setup lang="ts">
import type { Topic, Collection, Lesson, AdjacentLessons, AdjacentLesson } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const collectionSlug = computed(() => route.params.collection as string)
const id = computed(() => route.params.id as string)

const user = useSupabaseUser()
const client = useSupabaseClient()

// Fetch topic
const { data: topic, pending: topicPending } = await useAsyncData<Topic | null>(`topic-${slug.value}`, async () => {
  const { data } = await client.from('topics').select('*').eq('slug', slug.value).single()
  return data as Topic | null
})

// Fetch collection
const { data: collection, pending: collectionPending } = await useAsyncData<Collection | null>(
  `collection-${slug.value}-${collectionSlug.value}`,
  async () => {
    if (!topic.value) return null
    const { data } = await client
      .from('collections')
      .select('*')
      .eq('topic_id', topic.value.id)
      .eq('slug', collectionSlug.value)
      .single()
    return data as Collection | null
  },
  { watch: [topic] }
)

// Fetch lesson
const { data: lesson, pending: lessonPending } = await useAsyncData<Lesson | null>(
  `lesson-${id.value}`,
  async () => {
    const { data } = await client.from('lessons').select('*').eq('id', id.value).single()
    return data as Lesson | null
  }
)

// Fetch adjacent lessons within the same collection
const { data: adjacent } = await useAsyncData<AdjacentLessons | null>(`adjacent-${id.value}`, async () => {
  if (!collection.value) return null
  const { data: allLessons } = await client
    .from('lessons')
    .select('id, title, created_at')
    .eq('collection_id', collection.value.id)
    .order('order_index', { ascending: true })

  if (!allLessons) return null

  const currentIndex = allLessons.findIndex((l: AdjacentLesson) => l.id === id.value)
  if (currentIndex === -1) return null

  return {
    prev: currentIndex > 0 ? allLessons[currentIndex - 1] as AdjacentLesson : null,
    next: currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] as AdjacentLesson : null,
  }
}, { watch: [collection] })

watchEffect(() => {
  if (slug.value && !topicPending.value && !topic.value) {
    throw createError({ statusCode: 404, statusMessage: 'Topic not found' })
  }
  if (collectionSlug.value && !collectionPending.value && !collection.value && topic.value) {
    throw createError({ statusCode: 404, statusMessage: 'Collection not found' })
  }
  if (id.value && !lessonPending.value && !lesson.value) {
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

// TOC visibility — persisted in localStorage (desktop only)
const tocVisible = ref(false)
const isMobile = ref(false)

// Floating TOC button — visible when meta bar has scrolled out of view
const metaBarRef = ref<HTMLElement | null>(null)
const metaBarHidden = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth <= 1100
}

let metaBarObserver: IntersectionObserver | null = null

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)

  const saved = localStorage.getItem('devryte:toc-visible')
  if (saved !== null) tocVisible.value = saved === 'true'

  // Watch the meta bar — no scroll listener needed
  nextTick(() => {
    if (metaBarRef.value) {
      metaBarObserver = new IntersectionObserver(
        ([entry]) => { metaBarHidden.value = !entry?.isIntersecting },
        { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
      )
      metaBarObserver.observe(metaBarRef.value)
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  metaBarObserver?.disconnect()
})

function toggleToc() {
  tocVisible.value = !tocVisible.value
  // Only persist on desktop; mobile drawer is ephemeral
  if (!isMobile.value) {
    localStorage.setItem('devryte:toc-visible', String(tocVisible.value))
  }
}

function closeMobileToc() {
  tocVisible.value = false
}

const lessonBasePath = computed(() =>
  `/topics/${slug.value}/${collectionSlug.value}/lessons/${id.value}`
)
const collectionPath = computed(() =>
  `/topics/${slug.value}/${collectionSlug.value}`
)
const topicPath = computed(() => `/topics/${slug.value}`)
</script>

<template>
  <div class="lesson-page">
    <AppHeader />

    <main class="page-content" v-if="topic && collection && lesson">
      <div class="lesson-container" :class="{ 'toc-hidden': !tocVisible }">
        <!-- Breadcrumb -->
        <nav class="breadcrumb fade-in" aria-label="Breadcrumb">
          <NuxtLink to="/" class="bc-item">Topics</NuxtLink>
          <span class="bc-sep">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
          <NuxtLink :to="topicPath" class="bc-item">{{ topic.name }}</NuxtLink>
          <span class="bc-sep">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
          <NuxtLink :to="collectionPath" class="bc-item">{{ collection.name }}</NuxtLink>
          <span class="bc-sep">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
          <span class="bc-item active">{{ lesson.title }}</span>
        </nav>

        <!-- Lesson Layout -->
        <div class="lesson-layout" :class="{ 'toc-hidden': !tocVisible }">

          <!-- ── Main Content ─────────────────────────────────────── -->
          <article class="lesson-content fade-in">

            <!-- Meta bar -->
            <div ref="metaBarRef" class="lesson-meta-bar">
              <div class="lesson-meta-left">
                <NuxtLink :to="topicPath" class="meta-tag" :style="{ color: topic.color, background: topic.color + '1A' }">
                  <template v-if="topic.icon && topic.icon.trim().startsWith('<svg')">
                    <span class="svg-icon-wrapper" v-html="topic.icon"></span>
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
                <NuxtLink v-if="user" :to="`${lessonBasePath}/edit`" class="btn btn-ghost btn-sm" id="edit-lesson-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </NuxtLink>
              </div>
            </div>

            <!-- Markdown content -->
            <div class="prose-wrap">
              <MarkdownRenderer :content="lesson.content" />
            </div>

            <!-- Prev / Next Navigation -->
            <nav v-if="adjacent" class="lesson-nav">
              <NuxtLink
                v-if="adjacent.prev"
                :to="`${collectionPath}/lessons/${adjacent.prev.id}`"
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
                :to="`${collectionPath}/lessons/${adjacent.next.id}`"
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
              <div v-else class="lesson-nav-spacer"></div>
            </nav>
          </article>

          <!-- ── Table of Contents (desktop sidebar) ─────────── -->
          <Transition name="toc-slide">
            <TableOfContents
              v-if="tocVisible && !isMobile"
              :content="lesson.content"
            />
          </Transition>

          <!-- ── Table of Contents (mobile bottom-sheet) ───────── -->
          <Teleport to="body">
            <Transition name="toc-sheet-transition">
              <TableOfContents
                v-if="tocVisible && isMobile"
                :content="lesson.content"
                :mobile="true"
                @close="closeMobileToc"
              />
            </Transition>
          </Teleport>
        </div>
      </div>
    </main>

    <!-- ── Floating TOC button (appears when meta bar is off-screen) ── -->
    <Teleport to="body">
      <Transition name="fab-pop">
        <button
          v-if="metaBarHidden"
          class="toc-fab"
          :class="{ active: tocVisible }"
          :title="tocVisible ? 'Hide table of contents' : 'Show table of contents'"
          @click="toggleToc"
          id="floating-toc-btn"
          aria-label="Toggle table of contents"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="15" y2="12"/>
            <line x1="3" y1="18" x2="18" y2="18"/>
          </svg>
        </button>
      </Transition>
    </Teleport>

  </div>
</template>

<style scoped>
.lesson-page {
  min-height: 100vh;
}

.svg-icon-wrapper {
  display: flex; 
  align-items: center;
}
:deep(.svg-icon-wrapper svg) {
  width: 34px !important;
  height: 34px !important;
}

/* Outer shell — centred, max-width */
.lesson-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}
.lesson-container.toc-hidden {
  max-width: 900px;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
  padding-top: var(--space-4);
  flex-wrap: wrap;
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
  grid-template-columns: 1fr 240px;
  gap: var(--space-12);
  align-items: flex-start;
  padding-bottom: var(--space-20);
}

.lesson-layout.toc-hidden {
  grid-template-columns: 1fr;
}

/* ── Content column ──────────────────────────────────────── */
.lesson-content {
  min-width: 0;
}

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
  margin-bottom: var(--space-10);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.lesson-meta-left {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  flex-wrap: wrap;
}
.topic-name { color: var(--text-primary); }
.meta-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.meta-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px 4px 6px;
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
  transition: opacity var(--duration-fast);
}

.meta-tag:hover { opacity: 0.85; }

.meta-time,
.meta-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  font-weight: 500;
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
  /* Collapse TOC sidebar column — drawer handles mobile */
  .lesson-layout {
    grid-template-columns: 1fr;
  }
  .lesson-layout:not(.toc-hidden) {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .lesson-container {
    padding: 0 var(--space-4);
  }
}

@media (max-width: 640px) {
  .lesson-nav { grid-template-columns: 1fr; }
  .lesson-meta-bar { flex-direction: column; align-items: flex-start; }
  .meta-actions { align-self: flex-start; }
}

/* ── Mobile TOC sheet transition ─────────────────────────── */
.toc-sheet-transition-enter-active,
.toc-sheet-transition-leave-active {
  transition: none; /* Sheet handles its own animation */
}
.toc-sheet-transition-enter-active :deep(.toc-backdrop),
.toc-sheet-transition-leave-active :deep(.toc-backdrop) {
  transition: opacity var(--duration-base) ease;
}
.toc-sheet-transition-enter-from :deep(.toc-backdrop),
.toc-sheet-transition-leave-to :deep(.toc-backdrop) {
  opacity: 0;
}
</style>

<!-- FAB and its transition are teleported outside the component root,
     so they need a non-scoped block to receive styles. -->
<style>
/* ── Floating TOC button (FAB) ───────────────────────────── */
.toc-fab {
  position: fixed;
  bottom: calc(var(--space-6, 1.5rem) + env(safe-area-inset-bottom, 0px));
  right: var(--space-5, 1.25rem);
  z-index: 150;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 9999px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  color: var(--text-tertiary);
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2), 0 1px 4px rgba(0, 0, 0, 0.12);
  transition: color 120ms ease, background 120ms ease, border-color 120ms ease,
              transform 120ms ease, box-shadow 120ms ease;
}

.toc-fab:hover {
  color: var(--text-primary);
  background: var(--bg-surface-hover);
  border-color: var(--border-color);
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.28);
}

.toc-fab.active {
  color: var(--accent-primary);
  background: var(--accent-glow-soft);
  border-color: var(--accent-primary);
}

/* FAB pop animation */
.fab-pop-enter-active {
  transition: opacity 200ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.fab-pop-leave-active {
  transition: opacity 120ms ease, transform 120ms ease;
}
.fab-pop-enter-from,
.fab-pop-leave-to {
  opacity: 0;
  transform: scale(0.75) translateY(8px);
}
</style>
