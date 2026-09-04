<script setup lang="ts">
import { getTopicBySlug, getLessonById, getAdjacentLessons } from '~/data/sample'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const id = computed(() => route.params.id as string)

const topic = computed(() => getTopicBySlug(slug.value))
const lesson = computed(() => topic.value ? getLessonById(topic.value, id.value) : undefined)
const adjacent = computed(() => topic.value && lesson.value ? getAdjacentLessons(topic.value, id.value) : null)

watchEffect(() => {
  if (slug.value && id.value && (!topic.value || !lesson.value)) {
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
</script>

<template>
  <div class="lesson-page">
    <AppHeader />

    <main class="page-content" v-if="topic && lesson">
      <div class="container-wide">
        <!-- Breadcrumb -->
        <nav class="breadcrumb fade-in" aria-label="Breadcrumb">
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
        <div class="lesson-layout">
          <!-- Main Content -->
          <article class="lesson-content fade-in">
            <!-- Lesson meta bar -->
            <div class="lesson-meta-bar">
              <div class="lesson-meta-left">
                <span class="meta-tag" :style="{ color: topic.color, background: topic.accentColor }">
                  {{ topic.name }}
                </span>
                <span class="meta-time">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ lesson.readTime }} min read
                </span>
                <span class="meta-date">Updated {{ lesson.updatedAt }}</span>
              </div>
              <NuxtLink :to="`/topics/${topic.slug}/lessons/${lesson.id}/edit`" class="btn btn-ghost btn-sm" id="edit-lesson-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                Edit
              </NuxtLink>
            </div>

            <!-- Markdown -->
            <MarkdownRenderer :content="lesson.content" />

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

          <!-- Table of Contents -->
          <TableOfContents :content="lesson.content" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.lesson-page {
  min-height: 100vh;
}

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

.lesson-layout {
  display: flex;
  gap: var(--space-12);
  align-items: flex-start;
  padding-bottom: var(--space-20);
}

.lesson-content {
  flex: 1;
  min-width: 0;
}

.lesson-meta-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}

.lesson-meta-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
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

.lesson-nav {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
  margin-top: var(--space-12);
  padding-top: var(--space-8);
  border-top: 1px solid var(--border-subtle);
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

@media (max-width: 1024px) {
  .lesson-layout { flex-direction: column; }
}

@media (max-width: 640px) {
  .lesson-nav { grid-template-columns: 1fr; }
  .lesson-meta-bar { flex-direction: column; align-items: flex-start; }
}
</style>
