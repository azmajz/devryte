<script setup lang="ts">
import type { Topic, Collection } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const user = useSupabaseUser()
const client = useSupabaseClient()

// Fetch topic
const { data: topic, pending: topicPending } = await useAsyncData<Topic | null>(`topic-${slug.value}`, async () => {
  const { data } = await client.from('topics').select('*').eq('slug', slug.value).single()
  return data as Topic | null
})

// Fetch collections with lesson counts
const { data: collections, pending: collectionsPending, refresh: refreshCollections } = await useAsyncData<Collection[]>(`collections-${slug.value}`, async () => {
  if (!topic.value) return []
  const { data } = await client
    .from('collections')
    .select('*, lessons(id)')
    .eq('topic_id', topic.value.id)
    .order('order_index', { ascending: true })

  return ((data || []) as any[]).map(c => ({
    ...c,
    lesson_count: Array.isArray(c.lessons) ? c.lessons.length : 0,
    lessons: undefined,
  })) as Collection[]
}, { watch: [topic] })

watchEffect(() => {
  if (slug.value && !topicPending.value && !topic.value) {
    throw createError({ statusCode: 404, statusMessage: 'Topic not found' })
  }
})

useHead(computed(() => ({
  title: topic.value ? `${topic.value.name} — Devryte` : 'Devryte',
  meta: [{ name: 'description', content: topic.value?.description ?? '' }],
})))

// ─── Collection CRUD ────────────────────────────────────────
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const showDeleteModal = ref(false)
const collectionToDelete = ref<Collection | null>(null)
const isDeleting = ref(false)

const form = reactive({
  name: '',
  description: '',
})
const isSubmitting = ref(false)

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  form.name = ''
  form.description = ''
  showModal.value = true
}

function openEditModal(col: Collection) {
  isEditing.value = true
  editingId.value = col.id
  form.name = col.name
  form.description = col.description || ''
  showModal.value = true
}

async function saveCollection(): Promise<void> {
  if (!form.name || !topic.value) return
  isSubmitting.value = true
  try {
    if (isEditing.value && editingId.value) {
      await client.from('collections').update({
        name: form.name,
        description: form.description,
      }).eq('id', editingId.value)
    } else {
      // Place at end
      const maxOrder = collections.value?.length ?? 0
      await client.from('collections').insert({
        topic_id: topic.value.id,
        slug: generateSlug(form.name),
        name: form.name,
        description: form.description,
        order_index: maxOrder,
      })
    }
    showModal.value = false
    await refreshCollections()
  } catch (err) {
    console.error('Failed to save collection', err)
    alert('Failed to save collection')
  } finally {
    isSubmitting.value = false
  }
}

function openDeleteModal(col: Collection) {
  collectionToDelete.value = col
  deleteConfirmText.value = ''
  showDeleteModal.value = true
}

async function executeDeleteCollection(): Promise<void> {
  if (!collectionToDelete.value) return
  isDeleting.value = true
  try {
    await client.from('collections').delete().eq('id', collectionToDelete.value.id)
    await refreshCollections()
    showDeleteModal.value = false
  } catch (err) {
    console.error('Failed to delete collection', err)
    alert('Failed to delete collection')
  } finally {
    isDeleting.value = false
    collectionToDelete.value = null
  }
}

// const totalLessons = computed(() =>
//   (collections.value ?? []).reduce((acc, c) => acc + (c.lesson_count ?? 0), 0)
// )
</script>

<template>
  <div class="topic-page">
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
        <TopicCollectionHeader :stats="{label:'collection', count:collections?.length??0}" :icon=topic.icon :color=topic.color :name=topic.name :desc=topic.description />

        <!-- Collections Section -->
        <section class="collections-section">
          <div class="section-header">
            <h2 class="section-title">Collections</h2>
            <button v-if="user" class="btn btn-primary btn-sm" @click="openAddModal" id="add-collection-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Collection
            </button>
          </div>

          <div v-if="collectionsPending" class="loading-state">Loading collections...</div>
          <div v-else class="collections-list fade-in">
            <div v-if="!collections?.length" class="empty-state">
              <p>No collections yet.{{ user ? ' Create your first one!' : '' }}</p>
            </div>
            <CollectionCard
              v-for="(col, i) in collections"
              :key="col.id"
              :collection="col"
              :topic="topic"
              :index="i"
              :style="{ animationDelay: `${i * 50}ms` }"
              class="fade-in"
              @edit="openEditModal"
              @delete="openDeleteModal"
            />
          </div>
        </section>
      </div>
    </main>

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal-card">
            <div class="modal-header">
              <h3>{{ isEditing ? 'Edit Collection' : 'Add New Collection' }}</h3>
              <button class="btn-icon" @click="showModal = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Collection Name</label>
                <input type="text" class="form-input" v-model="form.name" placeholder="e.g. Core Concepts, Advanced Patterns…" />
              </div>
              <div class="form-group">
                <label class="form-label">Description <span class="optional">(optional)</span></label>
                <textarea class="form-input form-textarea" v-model="form.description" placeholder="What does this collection cover?"></textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" @click="showModal = false" :disabled="isSubmitting">Cancel</button>
              <button class="btn btn-primary" @click="saveCollection" :disabled="isSubmitting || !form.name">
                {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Collection') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Modal -->
    <DeleteModal
      v-model:show="showDeleteModal"
      :item-name="collectionToDelete?.name ?? ''"
      item-type="Collection"
      warning-text="All lessons inside will be permanently deleted."
      :is-deleting="isDeleting"
      @confirm="executeDeleteCollection"
    />
  </div>
</template>

<style scoped>
.topic-page { min-height: 100vh; }

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


/* Collections */
.collections-section {
  padding-bottom: var(--space-20);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.section-title {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-primary);
}

.collections-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
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
  max-width: 480px;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}
.modal-header h3 { font-size: 1.0625rem; font-weight: 700; }
.modal-body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-label { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
.optional { font-weight: 400; color: var(--text-tertiary); }
.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  transition: border-color var(--duration-fast);
  outline: none;
}
.form-input:focus { border-color: var(--accent-primary); box-shadow: var(--shadow-accent); }
.form-input::placeholder { color: var(--text-tertiary); }
.form-textarea { resize: vertical; min-height: 80px; }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

/* Modal transition */
.modal-enter-active, .modal-leave-active { transition: opacity var(--duration-fast) var(--ease-out); }
.modal-enter-active .modal-card, .modal-leave-active .modal-card { transition: transform var(--duration-fast) var(--ease-out); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card { transform: scale(0.95) translateY(8px); }
</style>
