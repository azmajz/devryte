<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

// Redirect if already logged in
watchEffect(() => {
  if (user.value) {
    router.push('/')
  }
})

async function handleAuth() {
  if (!email.value || !password.value) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }
  
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    // watchEffect will redirect to '/'
  } catch (err: any) {
    errorMessage.value = err.message || 'An error occurred during authentication.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="page-content login-page">
    <div class="login-container">
      <!-- Decorational background elements for premium feel -->
      <div class="glow-blob blob-1"></div>
      <div class="glow-blob blob-2"></div>

      <div class="card login-card fade-in">
        <div class="login-header">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 16 16"><path d="M0 0h16v16H0z" fill="none"/><path fill="currentColor" d="m9.854 5.146l1.97 1.97l-.707.707l-1.97-1.97a.5.5 0 0 1 .707-.707M2 12V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2.011c.044-.002.086-.013.13-.013c.301 0 .591.059.87.148V4a3 3 0 0 0-3-3H4a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h2.009c.007-.116.018-.233.046-.349L6.218 14H4a2 2 0 0 1-2-2m4.854-1.854L4.708 8l2.146-2.146a.5.5 0 0 0-.707-.707l-2.5 2.5a.5.5 0 0 0 0 .707l2.5 2.5a.5.5 0 0 0 .707-.707zm8.598-2.6a1.87 1.87 0 0 0-2.645 0l-4.829 4.829a2.2 2.2 0 0 0-.578 1.021l-.374 1.498a.89.89 0 0 0 1.079 1.079l1.498-.375a2.2 2.2 0 0 0 1.021-.578l4.829-4.829c.73-.73.73-1.914 0-2.645z"/></svg>
          </div>
          <h1>Welcome Admin</h1>
          <p>Sign in to the <span class="platform-name">Devryte</span> admin dashboard to manage topics, lessons, and platform content.</p>
        </div>

        <form @submit.prevent="handleAuth" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input 
                id="email" 
                v-model="email" 
                type="email" 
                placeholder="you@example.com" 
                required 
                :disabled="isLoading"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input 
                id="password" 
                v-model="password" 
                :type="showPassword ? 'text' : 'password'" 
                placeholder="••••••••" 
                required 
                :disabled="isLoading"
              />
              <button 
                type="button" 
                class="password-toggle" 
                @click="showPassword = !showPassword"
                title="Toggle password visibility"
              >
                <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div v-if="errorMessage" class="alert alert-error">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="alert alert-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            {{ successMessage }}
          </div>

          <button type="submit" class="btn btn-primary btn-submit" :disabled="isLoading">
            <span v-if="isLoading" class="spinner"></span>
            <span v-else>Sign In</span>
          </button>
        </form>

        <div class="login-footer">
          <p> Don't have an account? <NuxtLink class="toggle-mode-btn" to="/" ;type="button">Go back to Home</NuxtLink></p>
        </div>

      </div>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: var(--space-8) var(--space-4);
  position: relative;
  overflow: hidden;
}

.login-container {
  width: 100%;
  max-width: 440px;
  position: relative;
  z-index: 10;
}

.platform-name {
  color: var(--accent-primary);
  font-weight: bold;
}

/* Atmospheric glowing blobs */
.glow-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  z-index: -1;
  opacity: 0.6;
  animation: float 10s infinite ease-in-out alternate;
}

.blob-1 {
  width: 300px;
  height: 300px;
  background: var(--accent-glow);
  top: -100px;
  right: -100px;
}

.blob-2 {
  width: 250px;
  height: 250px;
  background: rgba(167, 139, 250, 0.15);
  bottom: -50px;
  left: -100px;
  animation-delay: -5s;
}

@keyframes float {
  0% { transform: translate(0, 0) scale(1); }
  100% { transform: translate(-30px, 30px) scale(1.1); }
}

.login-card {
  padding: var(--space-8);
  background: var(--bg-surface);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  border-radius: var(--radius-xl);
}

.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
}

.logo-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  background: var(--accent-glow-soft);
  color: var(--accent-primary);
  margin-bottom: var(--space-5);
  border: 1px solid var(--border-color);
}

.login-header h1 {
  font-size: 1.75rem;
  margin-bottom: var(--space-2);
}

.login-header p {
  color: var(--text-secondary);
  font-size: 0.9375rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: var(--space-3);
  color: var(--text-tertiary);
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: var(--space-3) calc(var(--space-3) * 2 + 18px) var(--space-3) calc(var(--space-3) * 2 + 18px);
  background: var(--bg-base);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-family: var(--font-sans);
  font-size: 0.9375rem;
  transition: all var(--duration-fast);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--accent-primary);
  background: var(--bg-surface);
  box-shadow: 0 0 0 3px var(--accent-glow-soft);
}

.input-wrapper input::placeholder {
  color: var(--text-tertiary);
}

.input-wrapper input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.password-toggle {
  position: absolute;
  right: var(--space-3);
  background: transparent;
  border: none;
  color: var(--text-tertiary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  transition: color var(--duration-fast), background var(--duration-fast);
}

.password-toggle:hover {
  color: var(--text-primary);
  background: var(--bg-surface-2);
}

.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
  line-height: 1.4;
}

.alert svg {
  flex-shrink: 0;
  margin-top: 2px;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.alert-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.btn-submit {
  width: 100%;
  justify-content: center;
  padding: var(--space-3);
  font-size: 1rem;
  margin-top: var(--space-2);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.login-footer {
  margin-top: var(--space-6);
  text-align: center;
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.toggle-mode-btn {
  background: none;
  border: none;
  color: var(--accent-primary);
  font-weight: 600;
  font-family: inherit;
  font-size: inherit;
  cursor: pointer;
  padding: 0;
  margin-left: var(--space-1);
}

.toggle-mode-btn:hover {
  text-decoration: underline;
  color: var(--accent-primary-hover);
}

@media (max-width: 480px) {
  .login-card {
    padding: var(--space-6) var(--space-5);
  }
}
</style>
