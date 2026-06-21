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
        <div class="pa-4 pb-0 pl-6 d-flex align-center">
          <v-img :src="iconImg" height="32" max-width="32" class="mr-3" alt="Dakbox"></v-img>
          <span class="text-h6 font-weight-bold text-white tracking-tight">DakBox</span>
        </div>
        <div class="pa-4 drawer-header">
          <div class="d-flex align-center ga-3">
            <v-avatar color="primary" size="44" style="cursor: pointer" @click="showProfileDialog = true">
              <v-img v-if="profilePicture" :src="profilePicture" cover />
              <span v-else class="text-white text-uppercase font-weight-bold text-subtitle-1">
                {{ (profileName || username).charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
            <div class="text-truncate" style="cursor: pointer" @click="showProfileDialog = true">
              <div class="text-subtitle-2 font-weight-bold text-white leading-tight text-truncate" title="Click to edit profile">
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
          :active="store.currentView === 'mailbox' && store.currentMailboxId === mb.id"
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
          :active="store.currentView === 'starred'"
          @click="store.fetchStarred()"
          class="rounded-lg"
        />
        <v-list-item
          prepend-icon="mdi-clock-outline"
          title="Snoozed"
          :active="store.currentView === 'snoozed'"
          @click="store.showView('snoozed', 'Snoozed')"
          class="rounded-lg"
        />
        <v-list-item
          prepend-icon="mdi-bookmark-outline"
          title="Important"
          :active="store.currentView === 'important'"
          @click="store.showView('important', 'Important')"
          class="rounded-lg"
        />
        <v-list-item
          prepend-icon="mdi-calendar-clock"
          title="Scheduled"
          :active="store.currentView === 'scheduled'"
          @click="store.showView('scheduled', 'Scheduled')"
          class="rounded-lg"
        />
        <v-list-item
          prepend-icon="mdi-email-multiple-outline"
          title="All Mail"
          :active="store.currentView === 'all'"
          @click="store.fetchAllMail()"
          class="rounded-lg"
        />
      </v-list>

      <template #append>
        <v-divider class="opacity-50" />
        <v-list density="comfortable" nav class="px-2 py-2">
          <v-list-item
            prepend-icon="mdi-shield-account-outline"
            title="Admin Panel"
            :href="adminUrl"
            target="_blank"
            class="rounded-lg"
          />
          <v-list-item
            prepend-icon="mdi-cog-outline"
            title="Settings"
            :active="store.currentView === 'settings'"
            @click="openSettings"
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
          
          <!-- Admin Panel Component (Removed, now links externally) -->

          <!-- Header/Toolbar inside the Card -->
          <div v-if="store.currentView !== 'admin'" class="d-flex align-center px-6 py-4 border-bottom card-toolbar">
            <v-app-bar-nav-icon v-if="$vuetify.display.mobile" @click="store.drawer = !store.drawer" class="mr-2" />
            <div class="text-h6 font-weight-bold text-white">
              {{ store.currentLabel }}
            </div>
            
            <v-spacer />
            
            <!-- Search bar -->
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              placeholder="Search emails..."
              hide-details
              density="compact"
              variant="solo"
              flat
              class="mx-2 search-bar"
              style="max-width: 280px"
              clearable
            />

            <!-- Refresh button -->
            <v-btn icon size="small" color="medium-emphasis" class="mr-2" @click="refresh">
              <v-icon>mdi-refresh</v-icon>
            </v-btn>

            <!-- Compose button (for quick access if mobile) -->
            <v-btn
              v-if="$vuetify.display.mobile"
              color="primary"
              variant="flat"
              icon="mdi-pencil"
              size="small"
              @click="compose"
            />
          </div>

          <!-- Email list container -->
          <div v-if="store.currentView !== 'admin'" class="flex-grow-1 overflow-y-auto">
            <v-progress-linear v-if="store.loading" indeterminate color="primary" height="2" />
            
            <template v-if="store.currentView === 'snoozed' && !filteredEmails.length && !store.loading">
              <div class="text-center py-16">
                <v-icon size="48" class="mb-3 text-medium-emphasis">mdi-clock-outline</v-icon>
                <div class="text-body-1 text-medium-emphasis">No snoozed emails</div>
              </div>
            </template>
            <template v-else-if="store.currentView === 'important' && !filteredEmails.length && !store.loading">
              <div class="text-center py-16">
                <v-icon size="48" class="mb-3 text-medium-emphasis">mdi-bookmark-outline</v-icon>
                <div class="text-body-1 text-medium-emphasis">No important emails</div>
              </div>
            </template>
            <template v-else-if="store.currentView === 'scheduled' && !filteredEmails.length && !store.loading">
              <div class="text-center py-16">
                <v-icon size="48" class="mb-3 text-medium-emphasis">mdi-calendar-clock</v-icon>
                <div class="text-body-1 text-medium-emphasis">No scheduled emails</div>
              </div>
            </template>
            
            <v-list v-else lines="two" bg-color="transparent" class="py-0">
              <template v-for="(email, i) in filteredEmails" :key="email.id">
                <v-divider v-if="i > 0" class="opacity-10" />
                <v-list-item
                  :value="email.id"
                  @click="openEmail(email.id)"
                  class="email-item py-3 px-6"
                >
                  <template #prepend>
                    <v-avatar :color="colors[Math.abs(hashStr(email.from?.[0]?.email || '')) % colors.length]" size="40" class="mr-4">
                      <span class="text-white text-uppercase font-weight-bold text-subtitle-2">
                        {{ (email.from?.[0]?.name || email.from?.[0]?.email || '?').charAt(0).toUpperCase() }}
                      </span>
                    </v-avatar>
                  </template>

                  <v-list-item-title class="d-flex align-center">
                    <span class="text-subtitle-2 font-weight-bold text-white text-truncate">
                      {{ email.from?.[0]?.name || email.from?.[0]?.email || 'Unknown' }}
                    </span>
                    <v-spacer />
                    <v-icon
                      v-if="email.keywords?.$flagged"
                      size="small"
                      color="warning"
                      class="mr-2"
                      @click.stop="store.toggleStar(email.id)"
                    >mdi-star</v-icon>
                    <v-icon
                      v-else
                      size="small"
                      color="medium-emphasis"
                      class="mr-2 star-icon-hover"
                      @click.stop="store.toggleStar(email.id)"
                    >mdi-star-outline</v-icon>
                    <span class="text-caption text-medium-emphasis text-no-wrap">
                      {{ formatTime(email.receivedAt) }}
                    </span>
                  </v-list-item-title>

                  <v-list-item-subtitle class="d-flex flex-column mt-1">
                    <span class="text-body-2 font-weight-medium text-white text-truncate mb-05">{{ email.subject || '(No subject)' }}</span>
                    <span class="text-caption text-medium-emphasis text-truncate">{{ email.preview || '' }}</span>
                  </v-list-item-subtitle>
                </v-list-item>
              </template>

              <div v-if="!filteredEmails.length && !store.loading" class="text-center py-16">
                <v-icon size="48" class="mb-3 text-medium-emphasis">mdi-inbox-outline</v-icon>
                <div class="text-body-1 text-medium-emphasis">No emails yet</div>
              </div>
            </v-list>
          </div>
        </v-card>
      </v-container>
    </v-main>
    <!-- Profile Dialog -->
    <v-dialog v-model="showProfileDialog" max-width="400">
      <v-card class="bg-canvas rounded-xl border border-opacity-10" elevation="10">
        <v-card-title class="text-white font-weight-bold pt-6 px-6">Edit Profile</v-card-title>
        <v-card-text class="px-6 pt-2">
          <div class="d-flex justify-center mb-6">
            <v-avatar color="primary" size="80" class="elevation-4">
              <v-img v-if="profilePicture" :src="profilePicture" cover />
              <span v-else class="text-white text-h4 font-weight-bold text-uppercase">
                {{ (profileName || username).charAt(0).toUpperCase() }}
              </span>
            </v-avatar>
          </div>
          <v-text-field v-model="profileName" label="Display Name" variant="underlined" color="primary" class="mb-2" hide-details="auto" />
          <v-text-field v-model="profilePicture" label="Profile Picture URL" variant="underlined" color="primary" placeholder="https://example.com/avatar.png" hide-details="auto" />
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0 mt-4">
          <v-spacer />
          <v-btn variant="text" color="medium-emphasis" class="text-none font-weight-bold mr-2" @click="showProfileDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" class="text-none font-weight-bold rounded-lg px-6" @click="saveProfile">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMailStore } from '../stores/mail'
import iconImg from '../assets/icon.png'

const router = useRouter()
const store = useMailStore()
const search = ref('')
const adminUrl = import.meta.env.VITE_STALWART_URL + '/admin'
const colors = ['#1976D2', '#388E3C', '#D32F2F', '#F57C00', '#7B1FA2', '#0097A7', '#C2185B', '#455A64']
const username = ref('admin')
const emailAddress = ref('admin@localhost')
const profileName = ref('')
const profilePicture = ref('')
const showProfileDialog = ref(false)

onMounted(() => {
  store.fetchMailboxes()
  const saved = localStorage.getItem('jmap_username')
  if (saved) {
    username.value = saved
    emailAddress.value = saved.includes('@') ? saved : `${saved}@localhost`
  }
  profileName.value = localStorage.getItem('jmap_profileName') || ''
  profilePicture.value = localStorage.getItem('jmap_profilePicture') || ''
})

function saveProfile() {
  localStorage.setItem('jmap_profileName', profileName.value)
  localStorage.setItem('jmap_profilePicture', profilePicture.value)
  showProfileDialog.value = false
}

const filteredEmails = computed(() => {
  if (!search.value) return store.emails
  const q = search.value.toLowerCase()
  return store.emails.filter(e =>
    (e.from?.[0]?.name || e.from?.[0]?.email || '').toLowerCase().includes(q) ||
    (e.subject || '').toLowerCase().includes(q) ||
    (e.preview || '').toLowerCase().includes(q)
  )
})

function hashStr(s: string) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = s.charCodeAt(i) + ((h << 5) - h)
  return Math.abs(h)
}

function selectMailbox(id: string) {
  store.fetchEmails(id)
  if (store.drawer && window.innerWidth < 960) store.drawer = false
}

function openEmail(id: string) { router.push(`/mail/${id}`) }
function compose() { router.push('/compose') }
function openSettings() { router.push('/settings') }
function refresh() {
  if (store.currentView === 'starred') store.fetchStarred()
  else if (store.currentView === 'all') store.fetchAllMail()
  else if (store.currentMailboxId) store.fetchEmails(store.currentMailboxId)
}
function logout() {
  ;['jmap_basic', 'jmap_accountId', 'jmap_username', 'jmap_known_ids', 'jmap_initial_state'].forEach(k => localStorage.removeItem(k))
  router.push('/login')
}

function formatTime(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  if (diff < 86400000 && d.getDate() === now.getDate()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  if (diff < 604800000) return d.toLocaleDateString([], { weekday: 'short' })
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
}
</script>

<style scoped>
.email-item {
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
}
.email-item:hover {
  background: rgba(255, 255, 255, 0.02) !important;
  border-left-color: rgba(var(--v-theme-primary), 0.5) !important;
}
.star-icon-hover {
  opacity: 0.3;
  transition: opacity 0.2s;
}
.email-item:hover .star-icon-hover {
  opacity: 1;
}
.mb-05 {
  margin-bottom: 2px;
}
</style>
