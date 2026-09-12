<script setup lang="ts">
const props = defineProps<{
    icon: string | null
    color: string | null
    name: string,
    desc : string|null
    stats: {label:string, count?:number}
}>()
</script>

<template>
  <header class="topic-header fade-in">
    <div class="topic-identity">
      <div class="topic-icon-large" :style="{ background: color + '1A', color: color }">
        <template v-if="icon && icon.trim().startsWith('<svg')">
          <span class="svg-icon-wrapper" v-html="icon"></span>
        </template>
        <template v-else>
          {{ icon }}
        </template>
      </div>
      <div>
        <h1 class="topic-title">{{ name }}</h1>
        <p  class="topic-description">{{ desc }}</p>
      </div>
    </div>

    <div class="topic-header-stats">
      <div class="stat-pill">
        <svg  v-if="stats.label=='collection'"  width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
          <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
        <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
        </svg>
        {{ stats.count ?? 0 }} {{stats.label}}{{ stats.count !== 1 ? 's' : '' }}
      </div>
    </div>
  </header>
</template>

<style scoped>
/* Topic Header */
.topic-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-6);
  padding: var(--space-8) 0;
  border-bottom: 1px solid var(--border-subtle);
  margin-bottom: var(--space-8);
}

.topic-identity {
  display: flex;
  align-items: flex-start;
  gap: var(--space-5);
}

.topic-icon-large {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  flex-shrink: 0;
}
:deep(.svg-icon-wrapper) {
  display: flex;
  align-items: center;
  justify-content: center;
}
:deep(.svg-icon-wrapper svg) {
  width: 52px !important;
  height: 52px !important;
}

.topic-title {
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-bottom: var(--space-2);
}
.topic-description {
  font-size: 1rem;
  color: var(--text-secondary);
  max-width: 55ch;
  margin: 0;
  line-height: 1.6;
}

.topic-header-stats {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-secondary);
}
@media (max-width: 768px) {
  .topic-header { flex-direction: column; padding: var(--space-6) 0; }
  .topic-identity { flex-direction: column; gap: var(--space-4); }
  .topic-icon-large { width: 48px; height: 48px; font-size: 1.5rem; }
  .topic-title { font-size: 1.5rem; }
  .topic-header-stats { flex-wrap: wrap; }
}
</style>