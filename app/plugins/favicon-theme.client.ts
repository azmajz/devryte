/**
 * favicon-theme.client.ts
 *
 * Keeps the browser-tab favicon in sync with the active color mode.
 * Runs client-side only (Nuxt auto-detects the `.client` suffix).
 *
 * Favicons live in /public/ and are named:
 *   favicon-light.svg  · favicon-dark.svg  · favicon-black.svg
 */

type AppColorMode = 'light' | 'dark' | 'black'

const SUPPORTED_MODES: AppColorMode[] = ['light', 'dark', 'black']
const FAVICON_REL = 'icon'
const FAVICON_TYPE = 'image/svg+xml'

function getFaviconHref(mode: string): string {
  const safe: AppColorMode = (SUPPORTED_MODES as string[]).includes(mode)
    ? (mode as AppColorMode)
    : 'dark'
  return `/favicon-${safe}.svg`
}

function applyFavicon(mode: string): void {
  // Remove all existing SVG favicon links to avoid duplicates
  document
    .querySelectorAll<HTMLLinkElement>(`link[rel="${FAVICON_REL}"][type="${FAVICON_TYPE}"]`)
    .forEach((el) => el.remove())

  const link = document.createElement('link')
  link.rel = FAVICON_REL
  link.type = FAVICON_TYPE
  link.href = getFaviconHref(mode)
  document.head.appendChild(link)
}

export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()

  // Apply immediately on first load
  applyFavicon(colorMode.value)

  // Stay in sync whenever the user switches themes
  watch(() => colorMode.value, applyFavicon)
})
