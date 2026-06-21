<template>
  <div class="login-wrapper d-flex align-center justify-center">
    <v-card width="420" class="login-card pa-8" theme="dark">
      <v-card-title class="text-center px-0 pb-6 pt-4">
        <v-img src="/src/assets/logo.png" height="64" class="mb-4 mx-auto" alt="Dakbox Logo"></v-img>
        <p class="text-subtitle-2 text-medium-emphasis">Sign in to access your secure inbox</p>
      </v-card-title>
      
      <v-card-text class="px-0">
        <v-alert v-if="error" type="error" variant="tonal" closable class="mb-5 rounded-lg">{{ error }}</v-alert>
        
        <v-text-field
          v-model="username"
          label="Username / Email"
          placeholder="admin@localhost"
          prepend-inner-icon="mdi-account-outline"
          class="mb-4"
          hide-details="auto"
          autofocus
        />
        <v-text-field
          v-model="password"
          label="Password"
          prepend-inner-icon="mdi-lock-outline"
          type="password"
          hide-details="auto"
          class="mb-6"
          @keyup.enter="login"
        />
      </v-card-text>
      
      <v-card-actions class="px-0 pb-2 flex-column">
        <v-btn
          color="primary"
          block
          size="large"
          variant="flat"
          :loading="loading"
          class="login-btn py-3 mb-4"
          @click="login"
        >
          Sign In <v-icon end class="ml-1">mdi-arrow-right</v-icon>
        </v-btn>
        
        <div class="text-center w-100 mt-2">
          <span class="text-caption text-medium-emphasis">First time setting up?</span>
          <v-btn
            variant="text"
            size="small"
            color="primary"
            class="text-none ml-1 px-2"
            :href="adminUrl"
            target="_blank"
          >
            Create Master Admin
          </v-btn>
        </div>
      </v-card-actions>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { jmap } from '../services/jmap'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const adminUrl = import.meta.env.VITE_STALWART_URL + '/admin'

async function login() {
  if (!username.value.trim() || !password.value) {
    error.value = 'Please enter both username and password.'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const token = await jmap.login(username.value, password.value)
    localStorage.setItem('jmap_token', token)
    router.push('/inbox')
  } catch (e: any) {
    error.value = e.message || 'Login failed. Please check your credentials.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  width: 100vw;
  background: #0d1117;
}

.login-card {
  border-radius: 16px !important;
  background: rgba(18, 24, 38, 0.8) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.3) !important;
}
.login-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.3) !important;
}

.tracking-tight {
  letter-spacing: -0.025em;
}

.login-btn {
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: none;
  height: auto !important;
}
</style>
