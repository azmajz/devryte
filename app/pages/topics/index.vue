<script setup lang="ts">
import type { Topic } from '~/types'

const client = useSupabaseClient()
const user = useSupabaseUser()

// Fetch all topics
const { data: topics, pending, refresh } = await useAsyncData<Topic[]>('manage-topics', async () => {
  const { data } = await client.from('topics').select('*').order('name', { ascending: true })
  return (data || []) as Topic[]
})

useHead(computed(() => ({
  title: user.value ? 'Manage Topics — Devryte' : 'Topics — Devryte',
})))

// Modal state
const showModal = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

// Delete Modal state
const showDeleteModal = ref(false)
const topicToDelete = ref<Topic | null>(null)
const deleteConfirmationText = ref('')
const isDeleting = ref(false)

// Form state
const form = reactive({
  name: '',
  description: '',
  icon: '📚',
  color: '#818cf8',
})

const isSubmitting = ref(false)

function openAddModal() {
  isEditing.value = false
  editingId.value = null
  form.name = ''
  form.description = ''
  form.icon = '📚'
  form.color = '#818cf8'
  showModal.value = true
}

function openEditModal(topic: Topic): void {
  isEditing.value = true
  editingId.value = topic.id
  form.name = topic.name
  form.description = topic.description || ''
  form.icon = topic.icon || '📚'
  form.color = topic.color || '#818cf8'
  showModal.value = true
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

async function saveTopic(): Promise<void> {
  if (!form.name) return
  isSubmitting.value = true
  
  try {
    if (isEditing.value && editingId.value) {
      await client.from('topics').update({
        name: form.name,
        description: form.description,
        icon: form.icon,
        color: form.color,
      }).eq('id', editingId.value)
    } else {
      await client.from('topics').insert({
        slug: generateSlug(form.name),
        name: form.name,
        description: form.description,
        icon: form.icon,
        color: form.color,
      })
    }
    
    showModal.value = false
    await refresh()
  } catch (err) {
    console.error('Failed to save topic', err)
    alert('Failed to save topic')
  } finally {
    isSubmitting.value = false
  }
}

function openDeleteModal(topic: Topic) {
  topicToDelete.value = topic
  deleteConfirmationText.value = ''
  showDeleteModal.value = true
}

async function executeDeleteTopic(): Promise<void> {
  if (!topicToDelete.value || deleteConfirmationText.value !== topicToDelete.value.name) return
  isDeleting.value = true
  
  try {
    await client.from('topics').delete().eq('id', topicToDelete.value.id)
    await refresh()
    showDeleteModal.value = false
  } catch (err) {
    console.error('Failed to delete topic', err)
    alert('Failed to delete topic')
  } finally {
    isDeleting.value = false
    topicToDelete.value = null
  }
}
</script>

<template>
  <div class="manage-topics-page">
    <AppHeader />

    <main class="page-content">
      <div class="container">
        <!-- Breadcrumb -->
        <nav class="breadcrumb fade-in" aria-label="Breadcrumb">
          <NuxtLink to="/" class="bc-item">Home</NuxtLink>
          <span class="bc-sep">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </span>
          <span class="bc-item active">{{ user ? 'Manage Topics' : 'Topics' }}</span>
        </nav>

        <header class="page-header fade-in">
          <div>
            <h1 class="page-title">{{ user ? 'Manage Topics' : 'Topics' }}</h1>
            <p class="page-subtitle">{{ user ? 'Add, edit, or remove your learning categories.' : 'Browse your learning categories.' }}</p>
          </div>
          <button v-if="user" class="btn btn-primary" @click="openAddModal">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Topic
          </button>
        </header>

        <div v-if="pending" class="loading-state">Loading...</div>
        
        <div v-else class="topics-list fade-in">
          <div v-if="topics?.length === 0" class="empty-state">
            <p>No topics found. Create your first one!</p>
          </div>
          
          <div v-for="topic in topics" :key="topic.id" class="topic-row">
            <NuxtLink :to="`/topics/${topic.slug}`" class="topic-info">
              <div class="topic-icon-small" :style="{ background: topic.color + '1A', color: topic.color }">
                <template v-if="topic.icon && topic.icon.trim().startsWith('<svg')">
                  <span class="svg-icon-wrapper" v-html="topic.icon"></span>
                </template>
                <template v-else>
                  {{ topic.icon }}
                </template>
              </div>
              <div>
                <h3 class="topic-name">{{ topic.name }}</h3>
                <p class="topic-slug">/{{ topic.slug }}</p>
              </div>
            </NuxtLink>
            
            <div v-if="user" class="topic-actions">
              <button class="btn-icon" title="Edit Topic" @click="openEditModal(topic)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
              </button>
              <button class="btn-icon danger" title="Delete Topic" @click="openDeleteModal(topic)">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  <path d="M10 11v6M14 11v6"/>
                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
          <div class="modal-card">
            <div class="modal-header">
              <h3>{{ isEditing ? 'Edit Topic' : 'Add New Topic' }}</h3>
              <button class="btn-icon" @click="showModal = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Topic Name</label>
                <input type="text" class="form-input" v-model="form.name" placeholder="e.g. Rust, TypeScript, Docker…" />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-input form-textarea" v-model="form.description" placeholder="What will you learn in this topic?"></textarea>
              </div>
              <div class="form-group-row">
                <div class="form-group">
                  <label class="form-label">Icon (Emoji or SVG)</label>
                  <input type="text" class="form-input" v-model="form.icon" placeholder="🚀 or <svg>..." />
                </div>
                <div class="form-group">
                  <label class="form-label">Color</label>
                  <div class="color-input-wrapper">
                    <input type="color" class="color-picker" v-model="form.color" />
                    <input type="text" class="form-input color-text" v-model="form.color" placeholder="#818cf8" />
                  </div>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" @click="showModal = false" :disabled="isSubmitting">Cancel</button>
              <button class="btn btn-primary" @click="saveTopic" :disabled="isSubmitting">
                {{ isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Topic') }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDeleteModal && topicToDelete" class="modal-overlay" @click.self="showDeleteModal = false">
          <div class="modal-card">
            <div class="modal-header">
              <h3 >Delete Topic</h3>
              <button class="btn-icon" @click="showDeleteModal = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <p style="color: var(--text-secondary); margin-bottom: var(--space-2); line-height: 1.5;">
                Are you sure you want to delete <strong>{{ topicToDelete.name }}</strong>? All lessons inside will be permanently deleted. This action cannot be undone.
              </p>
              <div class="form-group">
                <label class="form-label">Please type <strong>{{ topicToDelete.name }}</strong> to confirm.</label>
                <input type="text" class="form-input" v-model="deleteConfirmationText" :placeholder="topicToDelete.name" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" @click="showDeleteModal = false" :disabled="isDeleting">Cancel</button>
              <button 
                class="btn" 
                style="background: #ef4444; color: white; border: none; opacity: 1;"
                :style="deleteConfirmationText !== topicToDelete.name || isDeleting ? 'opacity: 0.5; cursor: not-allowed;' : ''"
                :disabled="deleteConfirmationText !== topicToDelete.name || isDeleting"
                @click="executeDeleteTopic"
              >
                {{ isDeleting ? 'Deleting...' : 'Delete Topic' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.manage-topics-page {
  min-height: 100vh;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-6);
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

/* Header */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}

.page-title {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  margin-bottom: var(--space-1);
}

.page-subtitle {
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

/* List */
.topics-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-bottom: var(--space-12);
}

.topic-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  transition: border-color var(--duration-fast);
}

.topic-row:hover {
  border-color: var(--border-color);
}

.topic-info {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  text-decoration: none;
  min-width: 0;
}

.topic-icon-small {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
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

.topic-name {
  font-size: 1.0625rem;
  font-weight: 600;
  color: var(--text-primary);
}

.topic-slug {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

.topic-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
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

.modal-header h3 {
  font-size: 1.0625rem;
  font-weight: 700;
}

.modal-body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
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
  transition: border-color var(--duration-fast);
  outline: none;
}

.form-input:focus {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-accent);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

/* ─── Mobile Adjustments ─── */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
  .topic-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-4);
  }
  .topic-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

.form-group-row {
  display: flex;
  gap: var(--space-4);
}

.form-group-row .form-group {
  flex: 1;
}

.color-input-wrapper {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.color-picker {
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  background: none;
  cursor: pointer;
  flex-shrink: 0;
}

.color-picker::-webkit-color-swatch-wrapper {
  padding: 0;
}
.color-picker::-webkit-color-swatch {
  border: none;
  border-radius: calc(var(--radius-md) - 1px);
}
.color-picker::-moz-color-swatch {
  border: none;
  border-radius: calc(var(--radius-md) - 1px);
}

.color-text {
  font-family: var(--font-mono);
  text-transform: uppercase;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

/* Modal transition */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}
.modal-enter-active .modal-card,
.modal-leave-active .modal-card {
  transition: transform var(--duration-fast) var(--ease-out);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .modal-card {
  transform: scale(0.95) translateY(8px);
}
</style>
