<script setup lang="ts">
import { Marked } from 'marked'
import hljs from 'highlight.js'

const props = defineProps<{
  content: string
  /** Optional default language for code blocks with no explicit lang tag */
  language?: string | null
}>()

// Mutable variable the renderer closure reads — set before every parse call.
// This avoids recreating the Marked instance on every computed re-evaluation.
let fallbackLang = 'plaintext'

const instance = new Marked({
  gfm: true,
  breaks: true,
  renderer: {
    code({ text, lang }: { text: string; lang?: string }) {
      const language = lang && hljs.getLanguage(lang) ? lang : fallbackLang
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

const renderedHtml = computed(() => {
  fallbackLang = props.language && hljs.getLanguage(props.language)
    ? props.language
    : 'plaintext'
  return instance.parse(props.content) as string
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
