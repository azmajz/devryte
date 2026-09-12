<script setup lang="ts">
import { ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  show: boolean
  title?: string
  itemName: string
  itemType?: string
  warningText?: string
  isDeleting?: boolean
  requireConfirm?: boolean
}>(), {
  requireConfirm: true
})

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
  (e: 'confirm'): void
}>()

const deleteConfirmText = ref('')

watch(() => props.show, (newVal) => {
  if (newVal) {
    deleteConfirmText.value = ''
  }
})

function close() {
  if (!props.isDeleting) {
    emit('update:show', false)
  }
}

function confirm() {
  if (props.requireConfirm && deleteConfirmText.value !== props.itemName) {
    return
  }
  if (!props.isDeleting) {
    emit('confirm')
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="show" class="modal-overlay" @click.self="close">
        <div class="modal-card">
          <div class="modal-header">
            <h3>{{ title || `Delete ${itemType || 'Item'}` }}</h3>
            <button class="btn-icon" @click="close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="modal-body">
            <p style="color: var(--text-secondary); margin-bottom: var(--space-2); line-height: 1.5;">
              Are you sure you want to delete <strong>{{ itemName }}</strong>? <span v-if="warningText">{{ warningText }}</span> This cannot be undone.
            </p>
            <div v-if="requireConfirm" class="form-group">
              <label class="form-label">Type <strong>{{ itemName }}</strong> to confirm.</label>
              <input type="text" class="form-input" v-model="deleteConfirmText" :placeholder="itemName" @keyup.enter="confirm" />
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="close" :disabled="isDeleting">Cancel</button>
            <button
              class="btn"
              style="background: #ef4444; color: white; border: none;"
              :style="(requireConfirm && deleteConfirmText !== itemName) || isDeleting ? 'opacity: 0.5; cursor: not-allowed;' : ''"
              :disabled="(requireConfirm && deleteConfirmText !== itemName) || isDeleting"
              @click="confirm"
            >
              {{ isDeleting ? 'Deleting...' : `Delete ${itemType || 'Item'}` }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
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
  max-width: 480px;
  overflow: hidden;
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--border-subtle);
}
.modal-header h3 { font-size: 1.0625rem; font-weight: 700; }
.modal-body {
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}
.form-group { display: flex; flex-direction: column; gap: var(--space-2); }
.form-label { font-size: 0.875rem; font-weight: 600; color: var(--text-primary); }
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
.form-input:focus { border-color: var(--accent-primary); box-shadow: var(--shadow-accent); }
.form-input::placeholder { color: var(--text-tertiary); }
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--border-subtle);
}

/* Modal transition */
.modal-enter-active, .modal-leave-active { transition: opacity var(--duration-fast) var(--ease-out); }
.modal-enter-active .modal-card, .modal-leave-active .modal-card { transition: transform var(--duration-fast) var(--ease-out); }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal-card { transform: scale(0.95) translateY(8px); }
</style>
