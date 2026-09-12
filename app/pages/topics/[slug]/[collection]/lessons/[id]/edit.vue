<script setup lang="ts">
import type { Topic, Collection, Lesson } from '~/types'

const route = useRoute()
const slug = computed(() => route.params.slug as string)
const collectionSlug = computed(() => route.params.collection as string)
const id = computed(() => route.params.id as string)
const isNew = computed(() => id.value === 'new')

const client = useSupabaseClient()

// Fetch topic
const { data: topic, pending: topicPending } = await useAsyncData<Topic | null>(`topic-${slug.value}`, async () => {
  const { data } = await client.from('topics').select('*').eq('slug', slug.value).single()
  return data as Topic | null
})

// Fetch collection
const { data: collection, pending: collectionPending } = await useAsyncData<Collection | null>(
  `collection-edit-${slug.value}-${collectionSlug.value}`,
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

// Fetch existing lesson (if editing)
const { data: existingLesson, pending: lessonPending } = await useAsyncData<Lesson | null>(`edit-lesson-${id.value}`, async () => {
  if (isNew.value) return null
  const { data } = await client.from('lessons').select('*').eq('id', id.value).single()
  return data as Lesson | null
})

watchEffect(() => {
  if (slug.value && !topicPending.value && !topic.value) {
    throw createError({ statusCode: 404, statusMessage: 'Topic not found' })
  }
  if (collectionSlug.value && !collectionPending.value && !collection.value && topic.value) {
    throw createError({ statusCode: 404, statusMessage: 'Collection not found' })
  }
})

const lessonTitle = ref('')
const lessonContent = ref('')
const initialized = ref(false)

// Initialize once the computed values are ready
watchEffect(() => {
  if (!initialized.value && !topicPending.value && !lessonPending.value) {
    if (isNew.value) {
      lessonTitle.value = ''
      lessonContent.value = `# Lesson Title\n\nStart writing your lesson here...\n\n## Introduction\n\nDescribe the topic...\n\n## Code Example\n\n\`\`\`javascript\n// Your code here\nconsole.log("Hello, World!");\n\`\`\`\n\n## Summary\n\nWrap up the key points.\n`
      initialized.value = true
    } else if (existingLesson.value) {
      lessonTitle.value = existingLesson.value.title
      lessonContent.value = existingLesson.value.content ?? ''
      initialized.value = true
    }
  }
})

const isSaving = ref(false)

function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
}

async function saveLesson(): Promise<void> {
  if (!lessonTitle.value || !lessonContent.value || !collection.value) {
    alert('Title and content are required')
    return
  }

  isSaving.value = true
  try {
    const calculatedSlug = generateSlug(lessonTitle.value)
    const readTime = Math.max(1, Math.ceil(lessonContent.value.length / 800))
    const collectionPath = `/topics/${topic.value!.slug}/${collection.value.slug}`

    if (isNew.value) {
      // Get max order_index in this collection
      const { data: maxOrderData } = await client
        .from('lessons')
        .select('order_index')
        .eq('collection_id', collection.value.id)
        .order('order_index', { ascending: false })
        .limit(1)
      const nextOrder = maxOrderData?.[0]?.order_index != null ? maxOrderData[0].order_index + 1 : 0

      const { data, error } = await client.from('lessons').insert({
        title: lessonTitle.value,
        content: lessonContent.value,
        slug: calculatedSlug,
        collection_id: collection.value.id,
        topic_id: topic.value!.id,
        order_index: nextOrder,
        read_time: readTime,
      }).select().single()

      if (error) throw error
      navigateTo(`${collectionPath}/lessons/${data.id}`)
    } else {
      const { error } = await client.from('lessons').update({
        title: lessonTitle.value,
        content: lessonContent.value,
        slug: calculatedSlug,
        topic_id: topic.value!.id,
        read_time: readTime,
        updated_at: new Date().toISOString(),
      }).eq('id', id.value)

      if (error) throw error
      navigateTo(`${collectionPath}/lessons/${id.value}`)
    }
  } catch (err) {
    console.error(err)
    alert('Failed to save lesson')
  } finally {
    isSaving.value = false
  }
}

const activeTab = ref<'write' | 'preview'>('write')
const isSplit = ref(true)
const previewHtml = ref('')

useHead(computed(() => ({
  title: `${isNew.value ? 'New Lesson' : `Edit: ${existingLesson.value?.title ?? ''}`} — Devryte`,
})))

// Render preview using marked
async function renderPreview(): Promise<void> {
  const { marked } = await import('marked')
  const hljs = (await import('highlight.js')).default

  marked.use({
    gfm: true,
    renderer: {
      code({ text, lang }: { text: string; lang?: string }) {
        const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
        const highlighted = hljs.highlight(text, { language }).value
        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
      },
    },
  })

  previewHtml.value = marked(lessonContent.value) as string
}

// Auto-render preview with debounce
let debounceTimer: ReturnType<typeof setTimeout>
watch(lessonContent, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(renderPreview, 400)
}, { immediate: true })

// Tab keyboard shortcut
function handleEditorTab(e: KeyboardEvent): void {
  if (e.key === 'Tab') {
    e.preventDefault()
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd
    lessonContent.value = lessonContent.value.substring(0, start) + '  ' + lessonContent.value.substring(end)
    nextTick(() => {
      target.selectionStart = target.selectionEnd = start + 2
    })
  }
}

// ── Scroll sync ───────────────────────────────────────────────
const editorEl  = ref<HTMLTextAreaElement | null>(null)
const previewEl = ref<HTMLDivElement | null>(null)
let isSyncing = false

function onEditorScroll(): void {
  if (isSyncing || !editorEl.value || !previewEl.value) return
  isSyncing = true
  const editor  = editorEl.value
  const preview = previewEl.value
  const ratio = editor.scrollTop / (editor.scrollHeight - editor.clientHeight || 1)
  preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight)
  requestAnimationFrame(() => { isSyncing = false })
}

function onPreviewScroll(): void {
  if (isSyncing || !editorEl.value || !previewEl.value) return
  isSyncing = true
  const editor  = editorEl.value
  const preview = previewEl.value
  const ratio = preview.scrollTop / (preview.scrollHeight - preview.clientHeight || 1)
  editor.scrollTop = ratio * (editor.scrollHeight - editor.clientHeight)
  requestAnimationFrame(() => { isSyncing = false })
}
</script>

<template>
  <!-- Full-height editor layout — NO page-content wrapper to avoid double padding -->
  <div v-if="topic && collection" class="edit-root">
    <AppHeader />

    <div class="edit-shell">
      <!-- Top Bar -->
      <div class="edit-topbar">
        <div class="topbar-left">
          <!-- Breadcrumb -->
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <NuxtLink to="/" class="bc-item">Topics</NuxtLink>
            <span class="bc-sep">›</span>
            <NuxtLink :to="`/topics/${topic.slug}`" class="bc-item">{{ topic.name }}</NuxtLink>
            <span class="bc-sep">›</span>
            <NuxtLink :to="`/topics/${topic.slug}/${collection.slug}`" class="bc-item">{{ collection.name }}</NuxtLink>
            <span class="bc-sep">›</span>
            <span class="bc-item active">{{ isNew ? 'New Lesson' : 'Edit Lesson' }}</span>
          </nav>
        </div>

        <div class="topbar-right">
          <!-- View toggles -->
          <div class="view-toggle" role="group" aria-label="Editor view">
            <button
              class="view-btn"
              :class="{ active: isSplit }"
              @click="isSplit = true"
              title="Split view"
              id="toggle-split-btn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <line x1="12" y1="3" x2="12" y2="21"/>
              </svg>
              Split
            </button>
            <button
              class="view-btn"
              :class="{ active: !isSplit && activeTab === 'write' }"
              @click="isSplit = false; activeTab = 'write'"
              title="Editor only"
              id="toggle-editor-btn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Write
            </button>
            <button
              class="view-btn"
              :class="{ active: !isSplit && activeTab === 'preview' }"
              @click="isSplit = false; activeTab = 'preview'"
              title="Preview only"
              id="toggle-preview-btn"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Preview
            </button>
          </div>

          <!-- Actions -->
          <NuxtLink
            :to="isNew ? `/topics/${topic.slug}/${collection.slug}` : `/topics/${topic.slug}/${collection.slug}/lessons/${id}`"
            class="btn btn-ghost btn-sm"
            id="cancel-btn"
          >
            Cancel
          </NuxtLink>
          <button class="btn btn-primary btn-sm" id="save-btn" @click="saveLesson" :disabled="isSaving">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <!-- Title Input -->
      <div class="title-bar">
        <input
          v-model="lessonTitle"
          type="text"
          class="title-input"
          placeholder="Lesson title…"
          id="lesson-title-input"
        />
      </div>

      <!-- Editor Area -->
      <div class="editor-area" :class="{ split: isSplit }">
        <!-- Write Panel -->
        <div
          class="editor-panel"
          :class="{ hidden: !isSplit && activeTab === 'preview' }"
        >
          <div class="panel-header">
            <span class="panel-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              Markdown
            </span>
            <span class="char-count">{{ lessonContent.length }} chars</span>
          </div>
          <textarea
            ref="editorEl"
            v-model="lessonContent"
            class="editor-textarea"
            placeholder="Write your lesson in Markdown..."
            spellcheck="false"
            @keydown="handleEditorTab"
            @scroll="onEditorScroll"
            id="lesson-content-textarea"
          ></textarea>
        </div>

        <!-- Preview Panel -->
        <div
          class="preview-panel"
          :class="{ hidden: !isSplit && activeTab === 'write' }"
        >
          <div class="panel-header">
            <span class="panel-label">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              Preview
            </span>
          </div>
          <div
            ref="previewEl"
            class="preview-content prose"
            v-html="previewHtml"
            @scroll="onPreviewScroll"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Root wraps the entire viewport */
.edit-root {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* edit-shell sits below the fixed 64px header */
.edit-shell {
  display: flex;
  flex-direction: column;
  padding-top: 64px;
  height: 100vh;
  overflow: hidden;
}

/* Top bar */
.edit-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-surface);
  flex-shrink: 0;
}

.topbar-left {
  flex: 1;
  min-width: 0;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.bc-item {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  text-decoration: none;
  transition: color var(--duration-fast);
}

.bc-item:hover { color: var(--accent-primary); }
.bc-item.active { color: var(--text-secondary); font-weight: 500; }
.bc-sep { color: var(--text-tertiary); font-size: 0.75rem; }

/* View toggle */
.view-toggle {
  display: flex;
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: 2px;
  gap: 2px;
}

.view-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px var(--space-3);
  background: none;
  border: none;
  border-radius: calc(var(--radius-md) - 2px);
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  cursor: pointer;
  font-family: var(--font-sans);
  font-weight: 500;
  transition: all var(--duration-fast);
}

.view-btn:hover {
  color: var(--text-secondary);
  background: var(--bg-surface-hover);
}

.view-btn.active {
  background: var(--bg-surface);
  color: var(--text-primary);
  box-shadow: var(--shadow-sm);
}

/* Title bar */
.title-bar {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
  background: var(--bg-base);
  flex-shrink: 0;
}

.title-input {
  width: 100%;
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-sans);
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.title-input::placeholder {
  color: var(--text-tertiary);
}

/* Editor area — takes remaining height */
.editor-area {
  display: flex;
  flex: 1;
  overflow: hidden;
  min-height: 0;
}

.editor-area.split .editor-panel,
.editor-area.split .preview-panel {
  width: 50%;
}

.hidden {
  display: none !important;
}

/* Panels */
.editor-panel,
.preview-panel {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.editor-panel {
  border-right: 1px solid var(--border-subtle);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-2) var(--space-4);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.panel-label {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.78125rem;
  font-weight: 600;
  color: var(--text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.char-count {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
}

/* Textarea */
.editor-textarea {
  flex: 1;
  width: 100%;
  background: var(--bg-base);
  border: none;
  outline: none;
  padding: var(--space-6);
  font-family: var(--font-mono);
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.75;
  resize: none;
  overflow-y: auto;
}

.editor-textarea::placeholder {
  color: var(--text-tertiary);
}

/* Preview */
.preview-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6) var(--space-8);
  background: var(--bg-base);
  max-width: none;
}

@media (max-width: 768px) {
  .editor-area.split {
    flex-direction: column;
  }
  .editor-area.split .editor-panel,
  .editor-area.split .preview-panel {
    width: 100%;
    height: 50%;
  }
  .editor-panel {
    border-right: none;
    border-bottom: 1px solid var(--border-subtle);
  }
  .topbar-right {
    gap: var(--space-1);
  }
  .view-toggle {
    display: none;
  }
}
</style>
