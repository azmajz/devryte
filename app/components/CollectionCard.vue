<script setup lang="ts">
import type { Collection, Topic } from '~/types'

const props = defineProps<{
  collection: Collection
  topic: Topic
  index: number
}>()

const emit = defineEmits<{
  edit: [collection: Collection]
  delete: [collection: Collection]
}>()

const user = useSupabaseUser()
</script>

<template>
  <div class="collection-card">
    <NuxtLink :to="`/topics/${topic.slug}/${collection.slug}`" class="collection-link">
      <div class="collection-order">{{ String(index + 1).padStart(2, '0') }}</div>
      <div class="collection-body">
        <div class="collection-top">
          <h3 class="collection-name">{{ collection.name }}</h3>
          <span class="collection-badge">
            {{ collection.lesson_count ?? 0 }} lesson{{ (collection.lesson_count ?? 0) !== 1 ? 's' : '' }}
          </span>
        </div>
        <p v-if="collection.description" class="collection-description">{{ collection.description }}</p>
      </div>
      <svg class="collection-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M5 12h14M12 5l7 7-7 7"/>
      </svg>
    </NuxtLink>

    <div v-if="user" class="collection-actions">
      <button class="btn-icon" title="Edit Collection" @click.prevent="emit('edit', collection)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      </button>
      <button class="btn-icon danger" title="Delete Collection" @click.prevent="emit('delete', collection)">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
.collection-card {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: var(--bg-surface);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-lg);
  transition: border-color var(--duration-fast), box-shadow var(--duration-fast);
  overflow: hidden;
}

.collection-card:hover {
  border-color: var(--border-color);
  box-shadow: var(--shadow-sm);
}

.collection-link {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  flex: 1;
  padding: var(--space-4) var(--space-5);
  text-decoration: none;
  min-width: 0;
}

.collection-order {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-tertiary);
  font-family: var(--font-mono);
  flex-shrink: 0;
  width: 28px;
}

.collection-body {
  flex: 1;
  min-width: 0;
}

.collection-top {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.collection-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  transition: color var(--duration-fast);
}

.collection-link:hover .collection-name {
  color: var(--accent-primary);
}

.collection-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 2px var(--space-2);
  background: var(--bg-surface-2);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  color: var(--text-tertiary);
  white-space: nowrap;
}

.collection-description {
  font-size: 0.875rem;
  color: var(--text-tertiary);
  margin-top: var(--space-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.collection-arrow {
  color: var(--text-tertiary);
  flex-shrink: 0;
  transition: transform var(--duration-fast), color var(--duration-fast);
}

.collection-link:hover .collection-arrow {
  transform: translateX(3px);
  color: var(--accent-primary);
}

.collection-actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding-right: var(--space-4);
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .collection-link {
    padding: var(--space-3) var(--space-4);
  }
  .collection-description {
    display: none;
  }
}
</style>
