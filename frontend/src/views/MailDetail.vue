<template>
  <v-layout style="height: 100vh">
    <!-- Sidebar / Drawer -->
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

      <div class="px-4 py-4">
        <v-btn
          color="primary"
          block
          prepend-icon="mdi-pencil-outline"
          variant="flat"
          rounded="pill"
          size="large"
          class="compose-btn"
          @click="compose"
        >
          Compose
        </v-btn>
      </div>

      <v-list density="comfortable" nav class="px-2">
        <v-list-item
          v-for="mb in store.mailboxes"
          :key="mb.id"
          :prepend-icon="store.getMailboxIcon(mb)"
          :title="mb.name"
          :active="false"
          @click="selectMailbox(mb.id)"
          class="rounded-lg mb-1"
        >
          <template #append>
            <v-chip v-if="mb.unreadEmails && mb.unreadEmails > 0" size="x-small" color="primary" variant="flat">
              {{ mb.unreadEmails > 99 ? '99+' : mb.unreadEmails }}
            </v-chip>
          </template>
        </v-list-item>
      </v-list>

      <v-divider class="my-2 opacity-50" />
      
      <v-list density="comfortable" nav class="px-2">
        <v-list-item
          prepend-icon="mdi-star-outline"
          title="Starred"
          @click="navigateToView('starred', 'Starred')"
          class="rounded-lg"
        />
        <v-list-item
          prepend-icon="mdi-clock-outline"
          title="Snoozed"
          @click="navigateToView('snoozed', 'Snoozed')"
          class="rounded-lg"
        />
        <v-list-item
          prepend-icon="mdi-bookmark-outline"
          title="Important"
          @click="navigateToView('important', 'Important')"
          class="rounded-lg"
        />
        <v-list-item
          prepend-icon="mdi-calendar-clock"
          title="Scheduled"
          @click="navigateToView('scheduled', 'Scheduled')"
          class="rounded-lg"
        />
        <v-list-item
          prepend-icon="mdi-email-multiple-outline"
          title="All Mail"
          @click="navigateToView('all', 'All Mail')"
          class="rounded-lg"
        />
      </v-list>

      <template #append>
        <v-divider class="opacity-50" />
        <v-list density="comfortable" nav class="px-2 py-2">
          <v-list-item
            prepend-icon="mdi-cog-outline"
            title="Settings"
            @click="router.push('/settings')"
            class="rounded-lg"
          />
          <v-list-item prepend-icon="mdi-logout" title="Logout" @click="logout" class="rounded-lg" />
        </v-list>
      </template>
    </v-navigation-drawer>

    <!-- Main Content Area -->
    <v-main class="bg-canvas d-flex flex-column">
      <v-container fluid class="pa-4 pa-sm-6 d-flex flex-column flex-grow-1" style="height: 100%; overflow: hidden">
        <v-card class="flex-grow-1 d-flex flex-column mail-card" elevation="0">
          
          <!-- Header/Toolbar inside the Card -->
          <div class="d-flex align-center px-6 py-4 border-bottom card-toolbar">
            <v-btn icon variant="text" color="white" class="mr-2" @click="$router.back()">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <v-toolbar-title class="text-h6 font-weight-bold text-white text-truncate pl-0">
              {{ email?.subject || 'Email Details' }}
            </v-toolbar-title>
            
            <v-spacer />
            
            <v-btn icon variant="text" class="mr-1" @click="toggleStar">
              <v-icon :color="email?.keywords?.$flagged ? 'warning' : 'medium-emphasis'">
                {{ email?.keywords?.$flagged ? 'mdi-star' : 'mdi-star-outline' }}
              </v-icon>
            </v-btn>
            
            <v-btn icon variant="text" color="medium-emphasis" @click="deleteEmail" :loading="deleting">
              <v-icon>mdi-delete-outline</v-icon>
            </v-btn>
          </div>

          <!-- Detail Content -->
          <div class="flex-grow-1 overflow-y-auto px-6 py-6">
            <v-container v-if="email" class="pa-0" style="max-width: 720px; margin: 0 auto">
              <div class="d-flex align-center ga-3 mb-6">
                <v-avatar :color="avatarColor" size="48">
                  <span class="text-white text-h6 font-weight-medium">{{ avatarInitial }}</span>
                </v-avatar>
                <div class="flex-grow-1 min-width-0">
                  <div class="text-subtitle-1 font-weight-bold text-white text-truncate leading-tight">
                    {{ email.from?.[0]?.name || email.from?.[0]?.email || 'Unknown' }}
                  </div>
                  <div class="text-caption text-medium-emphasis text-truncate mt-1">
                    to {{ email.to?.[0]?.name || email.to?.[0]?.email || 'Unknown' }}
                  </div>
                </div>
                <div class="text-caption text-medium-emphasis text-no-wrap font-weight-medium">
                  {{ formatDate(email.receivedAt) }}
                </div>
              </div>

              <div class="text-h5 font-weight-bold text-white mb-6">{{ email.subject || '(No subject)' }}</div>

              <v-divider class="mb-6 opacity-50" />

              <div class="text-body-1 email-body text-white mb-6" v-html="emailBody" />

              <v-divider class="my-6 opacity-50" />

              <div class="d-flex ga-3">
                <v-btn variant="outlined" color="primary" prepend-icon="mdi-reply" class="rounded-pill" @click="reply">
                  Reply
                </v-btn>
                <v-btn variant="outlined" color="medium-emphasis" prepend-icon="mdi-forward" class="rounded-pill" @click="forward">
                  Forward
                </v-btn>
              </div>
            </v-container>

            <div v-else-if="loading" class="text-center py-16">
              <v-progress-circular indeterminate color="primary" size="48" />
            </div>
          </div>
        </v-card>
      </v-container>
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jmap } from '../services/jmap'
import { useMailStore } from '../stores/mail'

const route = useRoute()
const router = useRouter()
const store = useMailStore()
const email = ref<any>(null)
const loading = ref(true)
const deleting = ref(false)

const colors = ['#1976D2', '#388E3C', '#D32F2F', '#F57C00', '#7B1FA2', '#0097A7', '#C2185B', '#455A64']

const username = ref(localStorage.getItem('jmap_username') || 'admin')
const emailAddress = ref(username.value.includes('@') ? username.value : `${username.value}@localhost`)
const profileName = ref('')
const profilePicture = ref('')

const avatarInitial = computed(() => (email.value?.from?.[0]?.name || email.value?.from?.[0]?.email || '?').charAt(0).toUpperCase())

const avatarColor = computed(() => {
  const str = email.value?.from?.[0]?.email || ''
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return colors[Math.abs(hash) % colors.length]
})

const emailBody = computed(() => {
  if (!email.value) return ''
  const parts = email.value.bodyValues || {}
  
  // Try HTML body first
  const htmlPart = email.value.htmlBody?.[0]?.partId
  if (htmlPart && parts[htmlPart]) return parts[htmlPart].value
  
  // Fallback to text body
  const textPart = email.value.textBody?.[0]?.partId
  if (textPart && parts[textPart]) return parts[textPart].value?.replace(/\n/g, '<br>')
  
  return ''
})

const emailBodyText = computed(() => {
  if (!email.value) return ''
  const parts = email.value.bodyValues || {}
  
  const textPart = email.value.textBody?.[0]?.partId
  if (textPart && parts[textPart]) return textPart && parts[textPart].value
  
  const htmlPart = email.value.htmlBody?.[0]?.partId
  if (htmlPart && parts[htmlPart]) {
    // Basic HTML tag stripping
    return parts[htmlPart].value.replace(/<[^>]*>/g, '')
  }
  return ''
})

onMounted(async () => {
  profileName.value = localStorage.getItem('jmap_profileName') || ''
  profilePicture.value = localStorage.getItem('jmap_profilePicture') || ''
  try {
    const res = await jmap.getEmail(route.params.id as string)
    email.value = res?.list?.[0]
  } finally {
    loading.value = false
  }
})

// Sidebar actions
function selectMailbox(id: string) {
  store.fetchEmails(id)
  router.push('/inbox')
  if (store.drawer && window.innerWidth < 960) store.drawer = false
}

function navigateToView(view: any, label: string) {
  if (view === 'starred') store.fetchStarred()
  else if (view === 'all') store.fetchAllMail()
  else store.showView(view, label)
  router.push('/inbox')
}

function compose() {
  router.push('/compose')
}

function logout() {
  localStorage.removeItem('jmap_basic')
  localStorage.removeItem('jmap_accountId')
  localStorage.removeItem('jmap_username')
  router.push('/login')
}

async function toggleStar() {
  if (!email.value) return
  await store.toggleStar(email.value.id, email.value)
}

async function deleteEmail() {
  if (!email.value || !confirm('Are you sure you want to delete this email?')) return
  deleting.value = true
  try {
    await store.moveToTrash(email.value.id)
    router.push('/inbox')
  } catch (err: any) {
    alert(err.message || 'Failed to delete email')
  } finally {
    deleting.value = false
  }
}

function reply() {
  if (!email.value) return
  const toParam = email.value.from?.[0]?.email || ''
  const subjectParam = `Re: ${email.value.subject || ''}`
  const dateFormatted = formatDate(email.value.receivedAt)
  const fromName = email.value.from?.[0]?.name || email.value.from?.[0]?.email || 'sender'
  const bodyParam = `\n\nOn ${dateFormatted}, ${fromName} wrote:\n> ${emailBodyText.value.replace(/\n/g, '\n> ')}`
  
  router.push({
    path: '/compose',
    query: {
      to: toParam,
      subject: subjectParam,
      body: bodyParam
    }
  })
}

function forward() {
  if (!email.value) return
  const subjectParam = `Fwd: ${email.value.subject || ''}`
  const dateFormatted = formatDate(email.value.receivedAt)
  const fromName = email.value.from?.[0]?.name || ''
  const fromEmail = email.value.from?.[0]?.email || ''
  const toEmail = email.value.to?.[0]?.email || ''
  const bodyParam = `\n\n---------- Forwarded message ---------\nFrom: ${fromName} <${fromEmail}>\nDate: ${dateFormatted}\nSubject: ${email.value.subject}\nTo: ${toEmail}\n\n${emailBodyText.value}`
  
  router.push({
    path: '/compose',
    query: {
      subject: subjectParam,
      body: bodyParam
    }
  })
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.email-body {
  line-height: 1.8;
  word-break: break-word;
  opacity: 0.95;
}
@media (max-width: 600px) {
  .email-body { font-size: 0.9375rem; }
}
</style>
