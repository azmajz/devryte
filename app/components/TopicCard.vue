<script setup lang="ts">
import type { Topic } from '~/data/sample'

const props = defineProps<{ topic: Topic }>()
</script>

<template>
  <NuxtLink :to="`/topics/${topic.slug}`" class="topic-card">
    <div class="card-top">
      <div class="topic-icon" :style="{ background: topic.color + '1A', color: topic.color }">
        <template v-if="topic.icon && topic.icon.trim().startsWith('<svg')">
          <span class="svg-icon-wrapper" v-html="topic.icon"></span>
        </template>
        <template v-else>
          {{ topic.icon }}
        </template>
      </div>
      <div class="topic-meta">
        <span class="lesson-count">{{ topic.lesson_count || 0 }} lessons</span>
      </div>
    </div>

    <div class="card-body">
      <h3 class="topic-name">{{ topic.name }}</h3>
      <p class="topic-desc">{{ topic.description }}</p>
    </div>

    <div class="card-footer">
      <span class="start-link" :style="{ color: topic.color }">
        Open topic
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </span>
    </div>

    <!-- Accent glow border on hover -->
    <div class="card-glow" :style="{ background: `radial-gradient(circle at 50% 0%, ${topic.color}22 0%, transparent 70%)` }"></div>
  </NuxtLink>
</template>

<style scoped>
.topic-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  text-decoration: none;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--duration-base) var(--ease-out);
}

.topic-card:hover {
  border-color: v-bind('topic.color + "44"');
  transform: translateY(-3px);
  box-shadow: 0 12px 40px v-bind('topic.color + "20"'), var(--shadow-md);
}

.topic-card:hover .card-glow {
  opacity: 1;
}

.card-glow {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity var(--duration-base);
  pointer-events: none;
}

.card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.topic-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 600;
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

.topic-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.lesson-count {
  font-size: 0.8125rem;
  color: var(--text-tertiary);
  background: var(--bg-surface-2);
  padding: 3px 10px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
}

.card-body {
  flex: 1;
}

.topic-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  letter-spacing: -0.02em;
}

.topic-desc {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  line-height: 1.6;
  margin: 0;
}

.card-footer {
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-subtle);
}

.start-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.875rem;
  font-weight: 600;
  transition: gap var(--duration-fast);
}

.topic-card:hover .start-link {
  gap: var(--space-2);
}
</style>
