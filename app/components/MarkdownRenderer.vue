<script setup lang="ts">
import { marked } from 'marked'
import hljs from 'highlight.js'

// Configure marked once at module level (not inside computed to avoid accumulation)
let isConfigured = false
function configureMarked() {
  if (isConfigured) return
  isConfigured = true
  marked.use({
    gfm: true,
    breaks: true,
    renderer: {
      code({ text, lang }: { text: string; lang?: string }) {
        const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext'
        const highlighted = hljs.highlight(text, { language }).value
        return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`
      },
      heading({ text, depth }: { text: string; depth: number }) {
        const id = text
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
        return `<h${depth} id="${id}">${text}</h${depth}>\n`
      },
    },
  })
}

const props = defineProps<{
  content: string
}>()

const renderedHtml = computed(() => {
  configureMarked()
  return marked(props.content) as string
})
</script>

<template>
  <div class="prose markdown-body" v-html="renderedHtml" />
</template>

<style scoped>
.markdown-body {
  animation: fade-in var(--duration-slow) var(--ease-out) both;
}
</style>
