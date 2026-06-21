<template>
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMailStore } from '../stores/mail'
import iconImg from '../assets/icon.png'

const router = useRouter()
const store = useMailStore()
const search = ref('')
const colors = ['#1976D2', '#388E3C', '#D32F2F', '#F57C00', '#7B1FA2', '#0097A7', '#C2185B', '#455A64']

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

function openEmail(id: string) { router.push(`/mail/${id}`) }
function compose() { router.push('/compose') }
function refresh() {
  if (store.currentView === 'starred') store.fetchStarred()
  else if (store.currentView === 'all') store.fetchAllMail()
  else if (store.currentMailboxId) store.fetchEmails(store.currentMailboxId)
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
