<script setup lang="ts">
import type { Topic } from '~/types'

const client = useSupabaseClient()
const { data: topics, pending } = await useAsyncData<Topic[]>('topics', async () => {
  const { data } = await client.from('topics').select('*, lessons(id)').order('name', { ascending: true })
  return (data || []).map(t => ({
    ...t,
    lesson_count: (t.lessons as { id: string }[] | null)?.length ?? 0,
  })) as Topic[]
})

const { data: totalReadTime } = await useAsyncData<number>('totalReadTime', async () => {
  const { data } = await client.from('lessons').select('read_time')
  return (data || []).reduce((sum: number, lesson: { read_time: number | null }) => sum + (lesson.read_time || 0), 0)
})

useHead({
  title: 'Devryte — Your Personal Learning Space',
  meta: [{ name: 'description', content: 'Organize your learning journey with topics, lessons, and notes.' }],
})

// ── Cursor glow ───────────────────────────────────────────────
const cursorX = ref(-999)
const cursorY = ref(-999)
const glowVisible = ref(false)

function onMouseMove(e: MouseEvent): void {
  cursorX.value = e.clientX
  cursorY.value = e.clientY
  if (!glowVisible.value) glowVisible.value = true
}

onMounted(() => window.addEventListener('mousemove', onMouseMove, { passive: true }))
onUnmounted(() => window.removeEventListener('mousemove', onMouseMove))
</script>

<template>
  <div class="home-page">
    <!-- Cursor glow overlay -->
    <div
      v-if="glowVisible"
      class="cursor-glow"
      :style="{
        left: cursorX + 'px',
        top: cursorY + 'px',
      }"
      aria-hidden="true"
    />

    <AppHeader />

    <main class="page-content">
      <div class="container">
        <!-- Hero Section -->
        <section class="hero fade-in">
          <div class="hero-text">
            <div class="hero-badge">
              <span class="badge-dot"></span>
              Personal learning space
            </div>
            <h1 class="hero-title">
              Everything you're
              <span class="hero-accent">learning</span>,
              organized.
            </h1>
            <p class="hero-subtitle">
              Your topics, lessons, and notes — all in one place.
              No noise, just focused learning.
            </p>
          </div>

          <div class="hero-stats">
            <div class="stat">
              <span class="stat-value">{{ topics?.length || 0 }}</span>
              <span class="stat-label">Topics</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">{{ (topics || []).reduce((a, t) => a + Number(t.lesson_count || 0), 0) }}</span>
              <span class="stat-label">Lessons</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">{{ totalReadTime || 0 }}</span>
              <span class="stat-label">Min of content</span>
            </div>
          </div>
        </section>

        <!-- Topics Section -->
        <section class="topics-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Your Topics</h2>
              <p class="section-sub">Select a topic to explore your lessons</p>
            </div>
            <NuxtLink to="/topics" class="btn btn-primary" id="manage-topics-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              Manage Topics
            </NuxtLink>
          </div>

          <div v-if="pending" class="loading-state">Loading topics...</div>
          <div v-else class="topics-grid">
            <TopicCard
              v-for="(topic, i) in topics"
              :key="topic.id"
              :topic="topic"
              :style="{ animationDelay: `${i * 60}ms` }"
              class="fade-in"
            />
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg-base);
  position: relative;
  isolation: isolate;
}

/* ── Cursor glow ───────────────────────────────────────────── */
.cursor-glow {
  pointer-events: none;
  position: fixed;
  z-index: 0;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  background: radial-gradient(
    circle at center,
    var(--accent-glow) 0%,
    transparent 70%
  );
  transition: opacity 400ms ease;
  will-change: left, top;
  /* GPU-composited movement via JS inline style — no CSS transition on position
     to avoid lag; instead we use requestAnimationFrame in the browser */
}

@media (hover: none) {
  /* Touch devices — hide the glow */
  .cursor-glow { display: none; }
}

/* Hero */
.hero {
  padding: var(--space-12) 0 var(--space-8);
}

.hero-text {
  max-width: 680px;
  margin-bottom: var(--space-8);
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--accent-primary);
  background: var(--accent-glow-soft);
  border: 1px solid var(--border-color);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-5);
  letter-spacing: 0.02em;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--accent-primary);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.25rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
  color: var(--text-primary);
  margin-bottom: var(--space-4);
}

.hero-accent {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.65;
  margin: 0;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: var(--space-6);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: var(--border-subtle);
}

/* Topics section */
.topics-section {
  padding-bottom: var(--space-20);
}

.section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

.section-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
  margin-bottom: var(--space-1);
}

.section-sub {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin: 0;
}

.topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-5);
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
  max-width: 460px;
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

@media (max-width: 768px) {
  .hero {
    padding: var(--space-8) 0 var(--space-6);
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .hero-stats {
    gap: var(--space-4);
  }
}
</style>
