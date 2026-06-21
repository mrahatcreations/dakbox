<template>
  <v-layout style="height: 100vh">
    <v-navigation-drawer
      v-model="store.drawer"
      :temporary="$vuetify.display.mobile"
      :permanent="!$vuetify.display.mobile"
      width="280"
    >
      <template #prepend>
        <div class="pa-4 drawer-header">
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" size="44" style="cursor: pointer" @click="router.push('/')">
              <v-img v-if="profilePicture" :src="profilePicture" cover />
              <span v-else class="text-white text-uppercase font-weight-bold text-subtitle-1">
                {{ (profileName || username).charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            <div class="text-truncate" style="cursor: pointer" @click="router.push('/')">
              <div class="text-subtitle-2 font-weight-bold text-white leading-tight text-truncate" title="Go to Inbox to edit profile">
                {{ profileName || username }}
              </div>
              <div class="text-caption text-medium-emphasis text-truncate">{{ emailAddress }}</div>
            </div>
          </div>
        </div>
      </template>

      <v-list density="comfortable" nav class="px-2 py-4">
        <v-list-item
          prepend-icon="mdi-arrow-left"
          title="Back to Inbox"
          @click="$router.push('/inbox')"
          class="rounded-lg"
        />
      </v-list>
    </v-navigation-drawer>

    <v-main class="bg-canvas d-flex flex-column">
      <v-container fluid class="pa-4 pa-sm-6 d-flex flex-column flex-grow-1" style="height: 100%; overflow: hidden">
        <v-card class="flex-grow-1 d-flex flex-column mail-card" elevation="0">
          
          <!-- Header/Toolbar inside the Card -->
          <div class="d-flex align-center px-6 py-4 border-bottom card-toolbar">
            <v-app-bar-nav-icon v-if="$vuetify.display.mobile" @click="store.drawer = !store.drawer" class="mr-2" />
            <h2 class="text-h6 font-weight-bold text-white mb-0">Settings</h2>
          </div>

          <!-- Scrollable Settings Container -->
          <div class="flex-grow-1 overflow-y-auto px-6 py-6">
            <v-container class="pa-0" style="max-width: 640px; margin: 0 auto">
              <v-card class="mb-6 bg-transparent border-0" elevation="0">
                <div class="text-subtitle-1 font-weight-bold text-white mb-3">Account Details</div>
                <v-card class="pa-4 rounded-lg bg-surface border-all" style="background: rgba(255, 255, 255, 0.02) !important; border: 1px solid rgba(255, 255, 255, 0.06)">
                  <div class="text-body-1 text-white mb-2">
                    <span class="text-medium-emphasis mr-2">Username:</span>
                    <strong>{{ username }}</strong>
                  </div>
                  <div class="text-body-1 text-white">
                    <span class="text-medium-emphasis mr-2">Email Address:</span>
                    <strong>{{ emailAddress }}</strong>
                  </div>
                </v-card>
              </v-card>

              <v-card class="mb-6 bg-transparent border-0" elevation="0">
                <div class="text-subtitle-1 font-weight-bold text-white mb-3">Interface Theme</div>
                <v-card class="pa-4 rounded-lg bg-surface border-all" style="background: rgba(255, 255, 255, 0.02) !important; border: 1px solid rgba(255, 255, 255, 0.06)">
                  <v-select
                    :model-value="$vuetify.theme.current.dark ? 'dark' : 'light'"
                    :items="['dark', 'light']"
                    label="Theme"
                    hide-details
                    variant="outlined"
                    @update:model-value="setTheme"
                  />
                </v-card>
              </v-card>

              <template v-if="hasDevAccess">
                <v-card class="mb-6 bg-transparent border-0" elevation="0">
                  <div class="text-subtitle-1 font-weight-bold text-white mb-3">Mail Server Information</div>
                  <v-card class="pa-4 rounded-lg bg-surface border-all" style="background: rgba(255, 255, 255, 0.02) !important; border: 1px solid rgba(255, 255, 255, 0.06)">
                    <div class="text-body-1 text-white mb-2">
                      <span class="text-medium-emphasis mr-2">JMAP Endpoint:</span>
                      <code>{{ jmapUrl }}</code>
                    </div>
                    <div class="text-body-1 text-white">
                      <span class="text-medium-emphasis mr-2">Primary Account ID:</span>
                      <code>{{ accountId }}</code>
                    </div>
                  </v-card>
                </v-card>

                <v-card class="mb-6 bg-transparent border-0" elevation="0">
                  <div class="text-subtitle-1 font-weight-bold text-white mb-3">Developer API & SMTP Integration</div>
                  <v-card class="pa-4 rounded-lg bg-surface border-all" style="background: rgba(255, 255, 255, 0.02) !important; border: 1px solid rgba(255, 255, 255, 0.06)">
                    
                    <div class="text-subtitle-2 font-weight-bold text-white mb-2">SMTP Connection Details</div>
                    <v-row class="mb-4">
                      <v-col cols="12" sm="6" md="3">
                        <div class="text-body-2 text-medium-emphasis">SMTP Host</div>
                        <code class="d-block mt-1">{{ hostname }}</code>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <div class="text-body-2 text-medium-emphasis">SMTP Port</div>
                        <code class="d-block mt-1">587</code>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <div class="text-body-2 text-medium-emphasis">Username</div>
                        <code class="d-block mt-1">{{ username }}</code>
                      </v-col>
                      <v-col cols="12" sm="6" md="3">
                        <div class="text-body-2 text-medium-emphasis">Password</div>
                        <code class="d-block mt-1 text-medium-emphasis" style="background: transparent;">Your Password</code>
                      </v-col>
                    </v-row>

                    <v-divider class="mb-4 opacity-10" />
                    
                    <div class="text-subtitle-2 font-weight-bold text-white mb-2">Environment Variables (.env) <span class="text-caption text-medium-emphasis ml-1">(PHP/Laravel/Node)</span></div>
                    <v-card color="#0a0d16" class="pa-4 rounded-lg mb-6" style="border: 1px solid rgba(255, 255, 255, 0.06); overflow-x: auto;">
                      <pre><code class="text-caption" style="color: #a9b7c6; background: transparent; padding: 0;">MAIL_MAILER=smtp
MAIL_HOST={{ hostname }}
MAIL_PORT=587
MAIL_USERNAME={{ username }}
MAIL_PASSWORD=YOUR_PASSWORD
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="{{ emailAddress }}"
MAIL_FROM_NAME="{{ profileName || 'App OTP Support' }}"</code></pre>
                    </v-card>
                    
                    <div class="text-subtitle-2 font-weight-bold text-white mb-2">Node.js (Nodemailer) Example</div>
                    <v-card color="#0a0d16" class="pa-4 rounded-lg" style="border: 1px solid rgba(255, 255, 255, 0.06); overflow-x: auto;">
                      <pre><code class="text-caption" style="color: #a9b7c6; background: transparent; padding: 0;">const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  host: "{{ hostname }}",
  port: 587,
  secure: false, // TLS via STARTTLS
  auth: {
    user: "{{ username }}",
    pass: "YOUR_PASSWORD",
  },
  tls: { rejectUnauthorized: false } // Required for self-signed certs
});

transporter.sendMail({
  from: '"{{ profileName || 'App Notifications' }}" &lt;{{ emailAddress }}&gt;',
  to: "user@example.com",
  subject: "Your OTP Code",
  text: "Your One-Time Password is: 123456",
}).then(info =&gt; console.log("Email sent: %s", info.messageId));</code></pre>
                    </v-card>
                  </v-card>
                </v-card>
              </template>
            </v-container>
          </div>
        </v-card>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTheme } from 'vuetify'
import { useMailStore } from '../stores/mail'

const router = useRouter()
const store = useMailStore()
const theme = useTheme()
const jmapUrl = import.meta.env.VITE_JMAP_URL || '(default/nginx-proxy)'
const accountId = localStorage.getItem('jmap_accountId') || '—'

const username = ref(localStorage.getItem('jmap_username') || 'admin')
const emailAddress = ref(username.value.includes('@') ? username.value : `${username.value}@localhost`)
const profileName = ref(localStorage.getItem('jmap_profileName') || '')
const profilePicture = ref(localStorage.getItem('jmap_profilePicture') || '')
const hostname = window.location.hostname
const hasDevAccess = ref(false)

import { adminService } from '../services/admin'
import { onMounted } from 'vue'

onMounted(async () => {
  if (localStorage.getItem(`dev_access_${emailAddress.value}`) === 'true') {
    hasDevAccess.value = true
  } else {
    try {
      const users = await adminService.getUsers()
      const currentUser = users.find(u => u.email === emailAddress.value || u.name === username.value)
      if (currentUser && currentUser.role === 'superadmin') {
        hasDevAccess.value = true
      }
    } catch (e) {
      if (username.value === 'superadmin' || username.value === 'admin') {
         hasDevAccess.value = username.value === 'superadmin'
      }
    }
  }
})

function setTheme(val: string) {
  theme.global.name.value = val
}
</script>

<style scoped>
code {
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
}
</style>
