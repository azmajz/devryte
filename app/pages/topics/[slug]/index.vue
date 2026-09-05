<script setup lang="ts">
import type { Topic, Lesson } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)

const client = useSupabaseClient()
const { data: topic, pending: topicPending } = await useAsyncData<Topic | null>(`topic-${slug.value}`, async () => {
  const { data } = await client.from('topics').select('*').eq('slug', slug.value).single()
  return data as Topic | null
})

const { data: lessons, pending: lessonsPending, refresh: refreshLessons } = await useAsyncData<Lesson[]>(`lessons-${slug.value}`, async () => {
  if (!topic.value) return []
  const { data } = await client.from('lessons').select('*').eq('topic_id', topic.value.id).order('created_at', { ascending: true })
  return (data || []) as Lesson[]
}, {
  watch: [topic]
})

async function handleDeleteLesson(lesson: Lesson) {
  if (!confirm(`Are you sure you want to delete lesson "${lesson.title}"?`)) return
  try {
    await client.from('lessons').delete().eq('id', lesson.id)
    await refreshLessons()
  } catch(err) {
    console.error(err)
    alert('Failed to delete lesson')
  }
}

watchEffect(() => {
  if (slug.value && !topicPending.value && !topic.value) {
    throw createError({ statusCode: 404, statusMessage: 'Topic not found' })
  }
})

useHead(computed(() => ({
  title: topic.value ? `${topic.value.name} — Devryte` : 'Devryte',
  meta: [{ name: 'description', content: topic.value?.description ?? '' }],
})))

</script>

<template>
  <div class="topic-page">
    <AppHeader />

    <main class="page-content" v-if="topic">
      <div class="container">
        <!-- Breadcrumb -->
        <nav class="breadcrumb fade-in" aria-label="Breadcrumb">
          <NuxtLink to="/" class="bc-item">Topics</NuxtLink>
          <span class="bc-sep">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
          <span class="bc-item active">{{ topic.name }}</span>
        </nav>

        <!-- Topic Header -->
        <header class="topic-header fade-in">
          <div class="topic-identity">
            <div class="topic-icon-large" :style="{ background: topic.color + '1A', color: topic.color }">
              <template v-if="topic.icon && topic.icon.trim().startsWith('<svg')">
                <span class="svg-icon-wrapper" v-html="topic.icon"></span>
              </template>
              <template v-else>
                {{ topic.icon }}
              </template>
            </div>
            <div>
              <h1 class="topic-title">{{ topic.name }}</h1>
              <p class="topic-description">{{ topic.description }}</p>
            </div>
          </div>

          <div class="topic-header-actions">
            <span class="lesson-badge">{{ lessons?.length || 0 }} lessons</span>
          </div>
        </header>

        <!-- Lessons Section -->
        <section class="lessons-section">
          <div class="lessons-header">
            <h2 class="lessons-title">Lessons</h2>
            <NuxtLink v-if="topic" :to="`/topics/${topic.slug}/lessons/new/edit`" class="btn btn-primary btn-sm" id="add-lesson-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Lesson
            </NuxtLink>
          </div>

          <div v-if="lessonsPending" class="loading-state">Loading lessons...</div>
          <div v-else class="lessons-list">
            <LessonRow
              v-for="(lesson, i) in lessons"
              :key="lesson.id"
              :lesson="lesson"
              :index="i"
              :topic="topic"
              :style="{ animationDelay: `${i * 50}ms` }"
              class="fade-in"
              @delete="handleDeleteLesson"
            />
          </div>
        </section>
      </div>
    </main>

  </div>
</template>

<style scoped>
.topic-page {
  min-height: 100vh;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
  padding-top: var(--space-4);
}

.bc-item {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--duration-fast);
}

.bc-item:hover {
  color: var(--accent-primary);
}

.bc-item.active {
  color: var(--text-secondary);
  font-weight: 500;
}

.bc-sep {
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
}

/* Topic Header */
.topic-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-8) 0;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--space-8);
}

.topic-identity {
  display: flex;
  align-items: flex-start;
  gap: var(--space-5);
}

.topic-icon-large {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}

:deep(.svg-icon-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.svg-icon-wrapper svg) {
  width: 1em;
  height: 1em;
}

.topic-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: var(--space-2);
}

.topic-description {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 55ch;
  margin: 0;
  line-height: 1.6;
}

.topic-header-actions {
  flex-shrink: 0;
}

.lesson-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-4);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
}

/* Lessons */
.lessons-section {
  padding-bottom: var(--space-20);
}

.lessons-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.lessons-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-primary);
}

.lessons-list {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  overflow: hidden;
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

.modal-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  width: 100%;
  max-width: 440px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}

.modal-header h3 {
  font-size: 1.0625rem;
  font-weight: 700;
}

.modal-body {
  padding: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  outline: none;
  transition: border-color var(--duration-fast);
}

.form-input:focus {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-accent);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-fast);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .topic-header {
    flex-direction: column;
  }
  .topic-identity {
    flex-direction: column;
  }
}
</style>
