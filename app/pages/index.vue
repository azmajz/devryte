<script setup lang="ts">
import type { Topic } from '~/types'

const client = useSupabaseClient()
const user = useSupabaseUser()
const { data: topics, pending } = await useAsyncData<Topic[]>('topics', async () => {
  const { data } = await client.from('topics').select('*, collections(id)').order('name', { ascending: true })
  return (data || []).map(t => ({
    ...t,
    collection_count: (t.collections as { id: string }[] | null)?.length ?? 0,
  })) as Topic[]
})

useHead({
  title: 'Devryte — Your Personal Learning Space',
  meta: [{ name: 'description', content: 'Organize your learning journey with topics, lessons, and notes.' }],
})
</script>

<template>
  <div class="home-page">
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
        </section>

        <!-- Topics Section -->
        <section class="topics-section">
          <div class="section-header">
            <div>
              <h2 class="section-title">Your Topics</h2>
              <p class="section-sub">Select a topic to explore your lessons</p>
            </div>
            <NuxtLink to="/topics" class="btn btn-primary" id="manage-topics-btn">
              <svg v-if="user" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
              {{ user ? 'Manage Topics' : 'View Topics' }}
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
}

/* Hero */
.hero {
  padding: var(--space-12) 0 var(--space-8);
}

.hero-text {
  max-width: 680px;
  margin-bottom: 0;
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

@media (max-width: 768px) {
  .hero {
    padding: var(--space-8) 0 var(--space-6);
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
