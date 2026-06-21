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
      <router-view></router-view>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMailStore } from '../stores/mail'
import iconImg from '../assets/icon.png'

const router = useRouter()
const store = useMailStore()
const adminUrl = import.meta.env.VITE_STALWART_URL + '/admin'
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

function selectMailbox(id: string) {
  store.fetchEmails(id)
  if (router.currentRoute.value.path !== '/inbox') {
    router.push('/inbox')
  }
  if (store.drawer && window.innerWidth < 960) store.drawer = false
}

function compose() { router.push('/compose') }
function openSettings() { router.push('/settings') }
function logout() {
  ;['jmap_basic', 'jmap_accountId', 'jmap_username', 'jmap_known_ids', 'jmap_initial_state'].forEach(k => localStorage.removeItem(k))
  router.push('/login')
}
</script>

<style scoped>
.tracking-tight {
  letter-spacing: -0.025em;
}
.compose-btn {
  letter-spacing: 0.02em;
}
</style>
