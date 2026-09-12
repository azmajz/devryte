<script setup lang="ts">
interface TocItem {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  content: string
  mobile?: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

// Parse headings from markdown content (safe on SSR — pure string ops)
const tocItems = computed<TocItem[]>(() => {
  const headingRegex = /^(#{1,3})\s+(.+)$/gm
  const items: TocItem[] = []
  let match

  while ((match = headingRegex.exec(props.content)) !== null) {
    const level = match[1].length
    const text = match[2].replace(/\*\*/g, '').replace(/`/g, '')
    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
    items.push({ id, text, level })
  }

  return items
})

const activeId = ref('')

// ─── Scroll spy — client-only ─────────────────────────────────
// All DOM/observer logic lives inside onMounted to avoid SSR crashes
let cleanups: (() => void)[] = []

function setupObservers(): void {
  // Tear down existing observers
  cleanups.forEach(fn => fn())
  cleanups = []

  nextTick(() => {
    tocItems.value.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            activeId.value = id
          }
        },
        { threshold: 0.3, rootMargin: '-80px 0px -55% 0px' }
      )
      observer.observe(el)
      cleanups.push(() => observer.disconnect())
    })
  })
}

onMounted(() => {
  setupObservers()
  // Re-setup when content changes (client-side navigation)
  watch(() => props.content, setupObservers)
})

onUnmounted(() => {
  cleanups.forEach(fn => fn())
})

function scrollTo(id: string): void {
  if (!import.meta.client) return
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
    // On mobile close the drawer after navigating
    if (props.mobile) emit('close')
  }
}
</script>

<template>
  <!-- ── Desktop: sticky sidebar ─────────────────────────────── -->
  <aside v-if="!mobile && tocItems.length > 0" class="toc-sidebar">
    <div class="toc-inner">
      <p class="toc-label">On this page</p>
      <nav class="toc-nav">
        <button
          v-for="item in tocItems"
          :key="item.id"
          class="toc-item"
          :class="[
            `toc-level-${item.level}`,
            { active: activeId === item.id }
          ]"
          @click="scrollTo(item.id)"
        >
          {{ item.text }}
        </button>
      </nav>
    </div>
  </aside>

  <!-- ── Mobile: bottom-sheet drawer ────────────────────────── -->
  <template v-if="mobile && tocItems.length > 0">
    <!-- Backdrop -->
    <div class="toc-backdrop" @click="emit('close')" />

    <!-- Sheet -->
    <div class="toc-sheet" role="dialog" aria-modal="true" aria-label="Table of contents">
      <!-- Handle + header -->
      <div class="toc-sheet-header">
        <div class="toc-sheet-handle" />
        <p class="toc-label">On this page</p>
        <button class="toc-sheet-close" @click="emit('close')" aria-label="Close table of contents">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <!-- Nav list -->
      <nav class="toc-nav toc-nav-sheet">
        <button
          v-for="item in tocItems"
          :key="item.id"
          class="toc-item"
          :class="[
            `toc-level-${item.level}`,
            { active: activeId === item.id }
          ]"
          @click="scrollTo(item.id)"
        >
          {{ item.text }}
        </button>
      </nav>
    </div>
  </template>
</template>

<style scoped>
/* ── Desktop sidebar ──────────────────────────────────────── */
.toc-sidebar {
  position: sticky;
  top: 88px;
  width: 240px;
  flex-shrink: 0;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
}

.toc-inner {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.toc-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-tertiary);
  margin: 0;
  padding: 0 var(--space-3);
}

.toc-nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  border-left: 2px solid var(--border-subtle);
}

.toc-item {
  display: block;
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: var(--space-1) var(--space-3);
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--duration-fast);
  border-left: 2px solid transparent;
  margin-left: -2px;
  line-height: 1.5;
  font-family: var(--font-sans);
  border-radius: 0;
}

.toc-item:hover {
  color: var(--text-primary);
  background: var(--bg-surface-2);
}

.toc-item.active {
  color: var(--accent-primary);
  border-left-color: var(--accent-primary);
  background: var(--accent-glow-soft);
  font-weight: 500;
}

.toc-level-1 {
  font-weight: 600;
}

.toc-level-2 {
  padding-left: calc(var(--space-3) + var(--space-2));
}

.toc-level-3 {
  padding-left: calc(var(--space-3) + var(--space-4));
  font-size: 0.78125rem;
}

/* Scrollbar for TOC */
.toc-sidebar::-webkit-scrollbar {
  width: 3px;
}

/* ── Mobile bottom-sheet ──────────────────────────────────── */
.toc-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  z-index: 200;
  animation: backdrop-in var(--duration-base, 200ms) ease;
}

@keyframes backdrop-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

.toc-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 201;
  background: var(--bg-surface);
  border-top: 1px solid var(--border-subtle);
  border-radius: 20px 20px 0 0;
  padding: var(--space-4) var(--space-5) calc(var(--space-6) + env(safe-area-inset-bottom));
  max-height: 72vh;
  overflow-y: auto;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.25);
  animation: sheet-up var(--duration-base, 220ms) cubic-bezier(0.32, 0.72, 0, 1);
}

@keyframes sheet-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}

.toc-sheet-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  position: relative;
}

.toc-sheet-handle {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--border-color, #444);
}

.toc-sheet-close {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface-hover);
  color: var(--text-tertiary);
  cursor: pointer;
  transition: all var(--duration-fast);
  flex-shrink: 0;
}

.toc-sheet-close:hover {
  color: var(--text-primary);
  background: var(--bg-surface-2);
}

/* Sheet nav — no left border rule, items are full-width */
.toc-nav-sheet {
  border-left: none;
  gap: 4px;
}

.toc-nav-sheet .toc-item {
  border-left: none;
  margin-left: 0;
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: 0.875rem;
}

.toc-nav-sheet .toc-level-2 {
  padding-left: calc(var(--space-3) + var(--space-3));
}

.toc-nav-sheet .toc-level-3 {
  padding-left: calc(var(--space-3) + var(--space-5));
  font-size: 0.8125rem;
}

.toc-nav-sheet .toc-item.active {
  border-left: none;
  border-radius: var(--radius-md);
}

/* Sheet scrollbar */
.toc-sheet::-webkit-scrollbar {
  width: 3px;
}
</style>
