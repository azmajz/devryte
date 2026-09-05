<script setup lang="ts">
import type { Lesson, Topic } from '~/types'

const props = defineProps<{
  lesson: Lesson
  index: number
  topic: Topic
}>()

const emit = defineEmits<{
  edit: [lesson: Lesson]
  delete: [lesson: Lesson]
}>()
</script>

<template>
  <div class="lesson-row">
    <NuxtLink :to="`/topics/${topic.slug}/lessons/${lesson.id}`" class="lesson-link">
      <span class="lesson-number">{{ String(index + 1).padStart(2, '0') }}</span>
      <div class="lesson-info">
        <span class="lesson-title">{{ lesson.title }}</span>
        <span class="lesson-meta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {{ lesson.read_time }} min read
        </span>
      </div>
    </NuxtLink>

    <div class="lesson-actions">
      <span class="updated-at">{{ lesson.updated_at ? new Date(lesson.updated_at).toLocaleDateString() : '' }}</span>
      <NuxtLink :to="`/topics/${topic.slug}/lessons/${lesson.id}/edit`" class="btn-icon" title="Edit lesson">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </NuxtLink>
      <button class="btn-icon danger" title="Delete lesson" @click.prevent="emit('delete', lesson)">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6M14 11v6"/>
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.lesson-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-md);
  border: 1px solid transparent;
  transition: all var(--duration-fast);
}

.lesson-row:hover {
  background: var(--bg-surface-hover);
  border-color: var(--border-subtle);
}

.lesson-link {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex: 1;
  text-decoration: none;
  min-width: 0;
}

.lesson-number {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  flex-shrink: 0;
  width: 28px;
}

.lesson-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.lesson-title {
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--duration-fast);
}

.lesson-row:hover .lesson-title {
  color: var(--accent-primary);
}

.lesson-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  color: var(--text-tertiary);
}

.lesson-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

.updated-at {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-right: var(--space-2);
}

@media (max-width: 600px) {
  .updated-at {
    display: none;
  }
}
</style>
