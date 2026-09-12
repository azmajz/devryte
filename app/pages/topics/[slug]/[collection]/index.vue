<script setup lang="ts">
import type { Topic, Collection, Lesson } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const collectionSlug = computed(() => route.params.collection as string)
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

// Fetch lessons ordered by order_index
const { data: lessons, pending: lessonsPending, refresh: refreshLessons } = await useAsyncData<Lesson[]>(
  `lessons-${collectionSlug.value}`,
  async () => {
    if (!collection.value) return []
    const { data } = await client
      .from('lessons')
      .select('*')
      .eq('collection_id', collection.value.id)
      .order('order_index', { ascending: true })
    return (data || []) as Lesson[]
  },
  { watch: [collection] }
)

watchEffect(() => {
  if (slug.value && !topicPending.value && !topic.value) {
    throw createError({ statusCode: 404, statusMessage: 'Topic not found' })
  }
  if (collectionSlug.value && !collectionPending.value && !collection.value && topic.value) {
    throw createError({ statusCode: 404, statusMessage: 'Collection not found' })
  }
})

useHead(computed(() => ({
  title: collection.value && topic.value
    ? `${collection.value.name} — ${topic.value.name} — Devryte`
    : 'Devryte',
  meta: [{ name: 'description', content: collection.value?.description ?? '' }],
})))

const showDeleteModal = ref(false)
const lessonToDelete = ref<Lesson | null>(null)
const isDeleting = ref(false)

function openDeleteModal(lesson: Lesson) {
  lessonToDelete.value = lesson
  showDeleteModal.value = true
}

async function executeDeleteLesson() {
  if (!lessonToDelete.value) return
  isDeleting.value = true
  try {
    await client.from('lessons').delete().eq('id', lessonToDelete.value.id)
    await refreshLessons()
    showDeleteModal.value = false
  } catch (err) {
    console.error(err)
    alert('Failed to delete lesson')
  } finally {
    isDeleting.value = false
    lessonToDelete.value = null
  }
}
</script>

<template>
  <div class="collection-page">
    <main class="page-content" v-if="topic && collection">
      <div class="container">
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
          <span class="bc-item active">{{ collection.name }}</span>
        </nav>

        <!-- Collection Header -->
        <TopicCollectionHeader :stats="{label:'lesson', count:lessons?.length??0}" :icon=topic.icon :color=topic.color :name=collection.name :desc=collection.description />

        <!-- Lessons Section -->
        <section class="lessons-section">
          <div class="lessons-header">
            <h2 class="lessons-title">Lessons</h2>
            <NuxtLink
              v-if="topic && user"
              :to="`/topics/${topic.slug}/${collection.slug}/lessons/new/edit`"
              class="btn btn-primary btn-sm"
              id="add-lesson-btn"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Lesson
            </NuxtLink>
          </div>

          <div v-if="lessonsPending" class="loading-state">Loading lessons...</div>
          <div v-else class="lessons-list">
            <div v-if="!lessons?.length" class="empty-state">
              <p>No lessons yet.{{ user ? ' Add your first one!' : '' }}</p>
            </div>
            <LessonRow
              v-for="(lesson, i) in lessons"
              :key="lesson.id"
              :lesson="lesson"
              :index="i"
              :topic="topic"
              :collection="collection"
              :style="{ animationDelay: `${i * 50}ms` }"
              class="fade-in"
              @delete="openDeleteModal"
            />
          </div>
        </section>
      </div>
    </main>

    <DeleteModal
      v-model:show="showDeleteModal"
      :item-name="lessonToDelete?.title ?? ''"
      item-type="Lesson"
      warning-text="This lesson will be permanently deleted."
      :is-deleting="isDeleting"
      :require-confirm="false"
      @confirm="executeDeleteLesson"
    />
  </div>
</template>

<style scoped>
.collection-page { min-height: 100vh; }

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
.bc-item:hover { color: var(--accent-primary); }
.bc-item.active { color: var(--text-secondary); font-weight: 500; }
.bc-sep { color: var(--text-tertiary); display: flex; align-items: center; }

/* Collection Header */
/* .collection-header {
  padding: var(--space-8) 0;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--space-8);
}

.collection-meta {
  margin-bottom: var(--space-4);
}

.topic-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
}

:deep(.svg-icon-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.svg-icon-wrapper svg) {
  width: 14px !important;
  height: 14px !important;
}

.collection-title-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.collection-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
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

.collection-description {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 60ch;
  line-height: 1.6;
} */

/* Lessons */
.lessons-section { padding-bottom: var(--space-20); }

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

.loading-state {
  padding: var(--space-8) 0;
  text-align: center;
  color: var(--text-tertiary);
}
.empty-state {
  padding: var(--space-12) 0;
  text-align: center;
  color: var(--text-tertiary);
}

@media (max-width: 768px) {
  .collection-header { padding: var(--space-6) 0; }
  .collection-title { font-size: 1.5rem; }
}
</style>
