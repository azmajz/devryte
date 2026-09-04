<script setup lang="ts">
interface TocItem {
  id: string
  text: string
  level: number
}

const props = defineProps<{
  content: string
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

function setupObservers() {
  // Tear down existing observers
  cleanups.forEach(fn => fn())
  cleanups = []

  nextTick(() => {
    tocItems.value.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (!el) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
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

function scrollTo(id: string) {
  if (!import.meta.client) return
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    activeId.value = id
  }
}
</script>

<template>
  <aside v-if="tocItems.length > 0" class="toc-sidebar">
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
</template>

<style scoped>
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
</style>
