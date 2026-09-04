<script setup lang="ts">
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

function toggleColorMode() {
  colorMode.preference = isDark.value ? 'light' : 'dark'
}

const searchQuery = ref('')
const searchOpen = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)

function openSearch() {
  searchOpen.value = true
  nextTick(() => searchInput.value?.focus())
}

function closeSearch() {
  searchOpen.value = false
  searchQuery.value = ''
}

function handleKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  }
  if (e.key === 'Escape') closeSearch()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

const route = useRoute()

const navLinks = [
  { label: 'Topics', href: '/' },
]
</script>

<template>
  <header class="app-header">
    <div class="header-inner container-wide">
      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <span class="logo-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 16 16"><path d="M0 0h16v16H0z" fill="none"/><path fill="#6366f1" d="m9.854 5.146l1.97 1.97l-.707.707l-1.97-1.97a.5.5 0 0 1 .707-.707M2 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2.011c.044-.002.086-.013.13-.013c.301 0 .591.059.87.148V4a3 3 0 0 0-3-3H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2.009c.007-.116.018-.233.046-.349L6.218 14H4a2 2 0 0 1-2-2m4.854-1.854L4.708 8l2.146-2.146a.5.5 0 0 0-.707-.707l-2.5 2.5a.5.5 0 0 0 0 .707l2.5 2.5a.5.5 0 0 0 .707-.707zm8.598-2.6a1.87 1.87 0 0 0-2.645 0l-4.829 4.829a2.2 2.2 0 0 0-.578 1.021l-.374 1.498a.89.89 0 0 0 1.079 1.079l1.498-.375a2.2 2.2 0 0 0 1.021-.578l4.829-4.829c.73-.73.73-1.914 0-2.645z"/></svg></span>
        <span class="logo-text">Devryte</span>
      </NuxtLink>

      <!-- Nav -->
      <nav class="header-nav">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.href"
          :to="link.href"
          class="nav-link"
          :class="{ active: route.path === link.href }"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <!-- Actions -->
      <div class="header-actions">
        <!-- Search trigger -->
        <button class="search-trigger" @click="openSearch" aria-label="Search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <span class="search-hint">Search</span>
          <kbd class="search-kbd">⌘K</kbd>
        </button>

        <!-- Theme toggle -->
        <button class="theme-toggle btn-icon" @click="toggleColorMode" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'">
          <Transition name="icon-flip" mode="out-in">
            <svg v-if="isDark" key="sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
            </svg>
            <svg v-else key="moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
          </Transition>
        </button>
      </div>
    </div>
  </header>

  <!-- Search Modal -->
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="searchOpen" class="search-overlay" @click.self="closeSearch">
        <div class="search-modal">
          <div class="search-input-wrap">
            <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref="searchInput"
              v-model="searchQuery"
              type="text"
              placeholder="Search topics, lessons..."
              class="search-input"
            />
            <button class="search-close" @click="closeSearch">Esc</button>
          </div>
          <div class="search-results">
            <p class="search-empty">Start typing to search across all topics and lessons</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: 64px;
  background: var(--header-bg);
  backdrop-filter: blur(16px) saturate(180%);
  -webkit-backdrop-filter: blur(16px) saturate(180%);
  border-bottom: 1px solid var(--border-subtle);
}

.header-inner {
  display: flex;
  align-items: center;
  gap: var(--space-6);
  height: 100%;
}

/* Logo */
.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  flex-shrink: 0;
}
.logo-icon {
  font-size: 1.25rem;
  color: var(--accent-primary);
  line-height: 1;
}
.logo-text {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.03em;
}

/* Nav */
.header-nav {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}
.nav-link {
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--duration-fast);
}
.nav-link:hover {
  color: var(--text-primary);
  background: var(--bg-surface-hover);
}
.nav-link.active {
  color: var(--accent-primary);
  background: var(--accent-glow-soft);
}

/* Search trigger */
.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.search-trigger {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-tertiary);
  font-family: var(--font-sans);
  font-size: 0.8125rem;
  cursor: pointer;
  transition: all var(--duration-fast);
}
.search-trigger:hover {
  border-color: var(--border-color);
  color: var(--text-secondary);
  background: var(--bg-surface-hover);
}

.search-hint {
  min-width: 3rem;
}

.search-kbd {
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 1px 5px;
  font-size: 0.75rem;
  font-family: var(--font-mono);
  color: var(--text-tertiary);
}

/* Theme toggle */
.theme-toggle {
  color: var(--text-secondary);
}

/* Search modal */
.search-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.search-modal {
  width: 100%;
  max-width: 580px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.search-input-wrap {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-subtle);
}

.search-icon {
  color: var(--text-tertiary);
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--text-primary);
  placeholder-color: var(--text-tertiary);
}
.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-close {
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  padding: 2px 8px;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  cursor: pointer;
}

.search-results {
  padding: var(--space-4) var(--space-5);
}

.search-empty {
  color: var(--text-tertiary);
  font-size: 0.875rem;
  text-align: center;
  padding: var(--space-4) 0;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out);
}
.modal-enter-active .search-modal,
.modal-leave-active .search-modal {
  transition: transform var(--duration-fast) var(--ease-out);
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from .search-modal {
  transform: scale(0.95) translateY(-8px);
}

.icon-flip-enter-active,
.icon-flip-leave-active {
  transition: all 200ms var(--ease-out);
}
.icon-flip-enter-from {
  opacity: 0;
  transform: rotate(-90deg) scale(0.7);
}
.icon-flip-leave-to {
  opacity: 0;
  transform: rotate(90deg) scale(0.7);
}

@media (max-width: 600px) {
  .search-hint,
  .search-kbd {
    display: none;
  }
  .header-nav {
    display: none;
  }
}
</style>
