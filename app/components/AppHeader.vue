<script setup lang="ts">
import type { SearchResult, TopicSearchResult, LessonSearchResult } from '~/types'

const colorMode = useColorMode()

type ColorMode = 'light' | 'dark' | 'black'
const modes: ColorMode[] = ['light', 'dark', 'black']

const isDark = computed(() => colorMode.value === 'dark')
const isBlack = computed(() => colorMode.value === 'black')

function cycleColorMode(): void {
  const current = colorMode.preference as ColorMode
  const idx = modes.indexOf(current)
  colorMode.preference = modes[(idx + 1) % modes.length] ?? ""
}

const searchQuery = ref('')
const searchOpen = ref(false)
const searchInput = ref<HTMLInputElement | null>(null)
const isSearching = ref(false)
const searchResults = ref<SearchResult[]>([])

const client = useSupabaseClient()
let searchTimeout: ReturnType<typeof setTimeout>

watch(searchQuery, (newQuery) => {
  if (!newQuery.trim()) {
    searchResults.value = []
    isSearching.value = false
    return
  }

  clearTimeout(searchTimeout)
  isSearching.value = true

  searchTimeout = setTimeout(async () => {
    try {
      const q = `%${newQuery}%`
      const [topicsRes, lessonsRes] = await Promise.all([
        client.from('topics').select('id, name, slug').ilike('name', q).limit(4),
        client.from('lessons').select('id, title, topics(name, slug)').ilike('title', q).limit(6)
      ])

      const results: SearchResult[] = []

      if (topicsRes.data) {
        results.push(...topicsRes.data.map((t): TopicSearchResult => ({
          type: 'topic',
          id: t.id as string,
          title: t.name as string,
          slug: t.slug as string,
        })))
      }

      if (lessonsRes.data) {
        results.push(...lessonsRes.data.map((l): LessonSearchResult => ({
          type: 'lesson',
          id: l.id as string,
          title: l.title as string,
          topicSlug: (l.topics as { slug: string } | null)?.slug ?? null,
          topicName: (l.topics as { name: string } | null)?.name ?? null,
        })))
      }

      searchResults.value = results
    } catch(err) {
      console.error(err)
    } finally {
      isSearching.value = false
    }
  }, 300)
})

function openSearch(): void {
  searchOpen.value = true
  nextTick(() => searchInput.value?.focus())
}

function closeSearch(): void {
  searchOpen.value = false
  searchQuery.value = ''
  searchResults.value = []
}

function handleKeydown(e: KeyboardEvent): void {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    openSearch()
  }
  if (e.key === 'Escape') closeSearch()
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))

const route = useRoute()

const user = useSupabaseUser()

const userMenuOpen = ref(false)

async function handleLogout() {
  userMenuOpen.value = false
  await client.auth.signOut()
  navigateTo('/admin')
}

const navLinks: { label: string; href: string }[] = [
  { label: 'Topics', href: '/' },
]
</script>

<template>
  <header class="app-header">
    <div class="header-inner container-wide">
      <!-- Logo -->
      <NuxtLink to="/" class="logo">
        <span class="logo-icon"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 16 16"><path d="M0 0h16v16H0z" fill="none"/><path fill="currentColor" d="m9.854 5.146l1.97 1.97l-.707.707l-1.97-1.97a.5.5 0 0 1 .707-.707M2 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2.011c.044-.002.086-.013.13-.013c.301 0 .591.059.87.148V4a3 3 0 0 0-3-3H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2.009c.007-.116.018-.233.046-.349L6.218 14H4a2 2 0 0 1-2-2m4.854-1.854L4.708 8l2.146-2.146a.5.5 0 0 0-.707-.707l-2.5 2.5a.5.5 0 0 0 0 .707l2.5 2.5a.5.5 0 0 0 .707-.707zm8.598-2.6a1.87 1.87 0 0 0-2.645 0l-4.829 4.829a2.2 2.2 0 0 0-.578 1.021l-.374 1.498a.89.89 0 0 0 1.079 1.079l1.498-.375a2.2 2.2 0 0 0 1.021-.578l4.829-4.829c.73-.73.73-1.914 0-2.645z"/></svg></span>
        <span class="logo-text">Devryte</span>
      </NuxtLink>


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

        <!-- Theme toggle (3-way: light / dark / black) -->
        <button
          class="theme-toggle btn-icon"
          @click="cycleColorMode"
          :aria-label="`Switch color mode (current: ${colorMode.value})`"
          :title="`Current: ${colorMode.value} — click to cycle`"
        >
          <ClientOnly>
            <Transition name="icon-flip" mode="out-in">
              <!-- Sun — light mode -->
              <svg v-if="!isDark && !isBlack" key="light" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="4"/>
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>
              </svg>
              <!-- HalfMoon — dark mode -->
              <svg v-else-if="isDark" key="dark" width="18" height="18" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none" />
                <g fill="none">
                  <path fill="currentColor" d="M2.75 12A9.25 9.25 0 0 0 12 21.25V2.75A9.25 9.25 0 0 0 2.75 12" />
                  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 21.25a9.25 9.25 0 0 0 0-18.5m0 18.5a9.25 9.25 0 0 1 0-18.5m0 18.5V2.75" />
                </g>       
              </svg>
              <!-- Moon — black mode -->
              <svg v-else key="black" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            </Transition>
            
            <template #fallback>
              <!-- Fallback rendered on server to prevent layout shift -->
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 32 32">
                <path d="M0 0h32v32H0z" fill="none" />
                <circle cx="16" cy="16" r="8" fill="currentColor" />
              </svg>
            </template>
          </ClientOnly>
        </button>

        <!-- Auth -->
        <div class="auth-section">
          <div v-if="user" class="user-menu-wrapper">
            <button class="user-avatar-btn" @click="userMenuOpen = !userMenuOpen" aria-label="User Menu" :class="{ active: userMenuOpen }">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </button>
            
            <div v-if="userMenuOpen" class="user-menu-overlay" @click="userMenuOpen = false"></div>
            
            <Transition name="fade-slide">
              <div v-if="userMenuOpen" class="user-menu-dropdown">
                <div class="user-menu-header">
                  <span class="user-email">{{ user.email }}</span>
                </div>
                <button @click="handleLogout" class="user-menu-item danger">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Log Out
                </button>
              </div>
            </Transition>
          </div>
          <NuxtLink v-else to="/admin" class="btn btn-primary btn-sm">
            Log In
          </NuxtLink>
        </div>
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
            <div v-if="isSearching" class="search-empty">Searching...</div>
            <div v-else-if="searchQuery && searchResults.length === 0" class="search-empty">No results found for "{{ searchQuery }}"</div>
            <div v-else-if="searchQuery && searchResults.length > 0" class="results-list">
              <NuxtLink
                v-for="res in searchResults"
                :key="`${res.type}-${res.id}`"
                :to="res.type === 'topic' ? `/topics/${res.slug}` : `/topics/${res.topicSlug}/lessons/${res.id}`"
                class="result-item"
                @click="closeSearch"
              >
                <span class="result-icon">
                  <svg v-if="res.type === 'topic'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                </span>
                <div class="result-info">
                  <span class="result-title">{{ res.title }}</span>
                  <span class="result-type">{{ res.type === 'topic' ? 'Topic' : 'Lesson' }}</span>
                </div>
                <div v-if="res.topicName" class="result-right">
                  <span class="result-badge">{{ res.topicName }}</span>
                </div>
              </NuxtLink>
            </div>
            <p v-else class="search-empty">Start typing to search across all topics and lessons</p>
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

.auth-section {
  display: flex;
  align-items: center;
  margin-left: var(--space-2);
  padding-left: var(--space-4);
  border-left: 1px solid var(--border-subtle);
}

.user-menu-wrapper {
  position: relative;
}

.user-avatar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--border-subtle);
  background: var(--bg-surface-2);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--duration-fast);
}

.user-avatar-btn:hover, .user-avatar-btn.active {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
  border-color: var(--accent-primary);
}

.user-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 90;
}

.user-menu-dropdown {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  width: 220px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  z-index: 100;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.user-menu-header {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--border-subtle);
}

.user-email {
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.user-menu-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: background var(--duration-fast), color var(--duration-fast);
}

.user-menu-item:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.user-menu-item.danger:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

@media (max-width: 600px) {
  .auth-section {
    padding-left: var(--space-2);
  }
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

.results-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.result-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  text-decoration: none;
  border-radius: var(--radius-md);
  transition: background var(--duration-fast);
}
.result-item:hover {
  background: var(--bg-surface-hover);
}
.result-icon {
  color: var(--text-tertiary);
  display: flex;
}
.result-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
}
.result-title {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.result-type {
  color: var(--text-tertiary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.result-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.result-badge {
  font-size: 0.7rem;
  background: var(--bg-surface-2);
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-subtle);
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

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity var(--duration-fast) var(--ease-out), transform var(--duration-fast) var(--ease-out);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
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
