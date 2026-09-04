<script setup lang="ts">
import { topics } from '~/data/sample'

useHead({
  title: 'Devryte — Your Personal Learning Space',
  meta: [{ name: 'description', content: 'Organize your learning journey with topics, lessons, and notes.' }],
})

const showAddModal = ref(false)
</script>

<template>
  <div class="home-page">
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
              <span class="stat-value">{{ topics.length }}</span>
              <span class="stat-label">Topics</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">{{ topics.reduce((a, t) => a + t.lessonCount, 0) }}</span>
              <span class="stat-label">Lessons</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat">
              <span class="stat-value">{{ topics.reduce((a, t) => a + t.lessons.reduce((b, l) => b + l.readTime, 0), 0) }}</span>
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
            <button class="btn btn-primary" @click="showAddModal = true" id="add-topic-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Topic
            </button>
          </div>

          <div class="topics-grid">
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

    <!-- Add Topic Modal (visual only) -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
          <div class="modal-card">
            <div class="modal-header">
              <h3>Add New Topic</h3>
              <button class="btn-icon" @click="showAddModal = false">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label class="form-label">Topic Name</label>
                <input type="text" class="form-input" placeholder="e.g. Rust, TypeScript, Docker…" id="topic-name-input" />
              </div>
              <div class="form-group">
                <label class="form-label">Description</label>
                <textarea class="form-input form-textarea" placeholder="What will you learn in this topic?" id="topic-desc-input"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Icon (emoji)</label>
                <input type="text" class="form-input" placeholder="🚀" id="topic-icon-input" />
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-ghost" @click="showAddModal = false">Cancel</button>
              <button class="btn btn-primary" @click="showAddModal = false" id="create-topic-btn">Create Topic</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  background: var(--bg-base);
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
