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
          disabled
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
            <v-app-bar-nav-icon v-if="$vuetify.display.mobile" @click="store.drawer = !store.drawer" class="mr-2" />
            <div class="text-h6 font-weight-bold text-white">
              {{ isScheduled ? 'Schedule Message' : 'New Message' }}
            </div>
            
            <v-spacer />
            
            <!-- Template Selection Button -->
            <v-menu transition="slide-y-transition">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  variant="outlined"
                  color="primary"
                  rounded="pill"
                  class="mr-3 px-4 compose-header-btn"
                  prepend-icon="mdi-file-document-template-outline"
                >
                  Use Template
                </v-btn>
              </template>
              <v-list bg-color="#121620" class="border border-opacity-10 rounded-lg">
                <v-list-item
                  v-for="(tpl, idx) in templates"
                  :key="idx"
                  @click="applyTemplate(tpl)"
                  class="py-2"
                >
                  <template #prepend>
                    <v-icon color="primary" class="mr-2">{{ tpl.icon }}</v-icon>
                  </template>
                  <v-list-item-title class="text-white">{{ tpl.name }}</v-list-item-title>
                  <v-list-item-subtitle class="text-medium-emphasis">{{ tpl.desc }}</v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-menu>

            <!-- Send Action Button -->
            <v-btn-group rounded="pill" color="primary" variant="flat">
              <v-btn :loading="sending" class="px-5" @click="send">
                <v-icon start class="mr-1">
                  {{ isScheduled ? 'mdi-calendar-clock' : 'mdi-send-outline' }}
                </v-icon>
                {{ isScheduled ? 'Schedule' : 'Send' }}
              </v-btn>
              <v-menu transition="slide-y-transition">
                <template #activator="{ props }">
                  <v-btn v-bind="props" icon="mdi-menu-down" class="px-0" style="min-width: 36px" />
                </template>
                <v-list bg-color="#121620" class="border border-opacity-10 rounded-lg">
                  <v-list-item @click="send" class="py-2">
                    <template #prepend><v-icon class="mr-2">mdi-send-outline</v-icon></template>
                    <v-list-item-title class="text-white">Send Now</v-list-item-title>
                  </v-list-item>
                  <v-list-item @click="openScheduler" class="py-2">
                    <template #prepend><v-icon class="mr-2">mdi-calendar-clock</v-icon></template>
                    <v-list-item-title class="text-white">Send Later...</v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-btn-group>
          </div>

          <!-- Form fields and editor area -->
          <div class="flex-grow-1 overflow-y-auto px-6 py-6">
            <v-container class="pa-0" style="max-width: 800px; margin: 0 auto">
              <v-alert v-if="error" type="error" variant="tonal" closable class="mb-4 rounded-lg" @click:close="error = ''">
                {{ error }}
              </v-alert>
              <v-alert v-if="sent" type="success" variant="tonal" closable class="mb-4 rounded-lg">
                {{ isScheduled ? 'Email scheduled successfully!' : 'Email sent successfully!' }}
              </v-alert>

              <!-- Scheduled Indicator Bar -->
              <v-alert v-if="isScheduled && scheduledTime" type="info" variant="tonal" closable class="mb-4 rounded-lg" @click:close="cancelSchedule">
                <div class="d-flex align-center justify-space-between">
                  <span>Scheduled to send on <strong>{{ formatScheduleTime(scheduledTime) }}</strong></span>
                  <v-btn size="x-small" variant="text" color="primary" class="ml-4 font-weight-bold" @click="cancelSchedule">Cancel Schedule</v-btn>
                </div>
              </v-alert>

              <!-- Recipient Field (Vuetify Underlined) -->
              <v-text-field
                v-model="to"
                label="To"
                variant="underlined"
                placeholder="recipient@example.com"
                class="mb-2"
                hide-details="auto"
              >
                <template #append>
                  <v-btn size="small" variant="text" class="text-caption px-1 font-weight-bold" @click="showCc = !showCc">Cc</v-btn>
                  <v-btn size="small" variant="text" class="text-caption px-1 font-weight-bold" @click="showBcc = !showBcc">Bcc</v-btn>
                </template>
              </v-text-field>

              <!-- CC Field -->
              <v-text-field
                v-if="showCc"
                v-model="cc"
                label="Cc"
                variant="underlined"
                placeholder="cc@example.com"
                class="mb-2"
                hide-details="auto"
              />

              <!-- BCC Field -->
              <v-text-field
                v-if="showBcc"
                v-model="bcc"
                label="Bcc"
                variant="underlined"
                placeholder="bcc@example.com"
                class="mb-2"
                hide-details="auto"
              />

              <!-- Subject Field -->
              <v-text-field
                v-model="subject"
                label="Subject"
                variant="underlined"
                placeholder="Enter subject line"
                class="mb-4"
                hide-details="auto"
              />

              <!-- Editor Options (Priority, HTML Preview) -->
              <div class="d-flex align-center ga-4 mb-4">
                <v-chip
                  size="small"
                  :color="isHighPriority ? 'error' : 'medium-emphasis'"
                  variant="outlined"
                  class="px-3"
                  @click="isHighPriority = !isHighPriority"
                >
                  <v-icon start size="14">
                    {{ isHighPriority ? 'mdi-alert-circle' : 'mdi-alert-circle-outline' }}
                  </v-icon>
                  High Priority
                </v-chip>

                <v-chip
                  size="small"
                  :color="isHtmlMode ? 'success' : 'medium-emphasis'"
                  variant="outlined"
                  class="px-3"
                  @click="isHtmlMode = !isHtmlMode"
                >
                  <v-icon start size="14">mdi-code-braces</v-icon>
                  HTML Editor
                </v-chip>
              </div>

              <!-- Unified Premium Editor Box -->
              <div class="editor-container mt-4">
                <!-- Formatting & Action Toolbar -->
                <div class="d-flex align-center editor-toolbar">
                  <!-- Text Formatting Icons -->
                  <div class="d-flex align-center ga-1 mr-4">
                    <v-btn icon size="small" variant="text" color="medium-emphasis" @click="insertText('**BoldText**')">
                      <v-icon size="20">mdi-format-bold</v-icon>
                    </v-btn>
                    <v-btn icon size="small" variant="text" color="medium-emphasis" @click="insertText('*ItalicText*')">
                      <v-icon size="20">mdi-format-italic</v-icon>
                    </v-btn>
                    <v-btn icon size="small" variant="text" color="medium-emphasis" @click="insertText('<u>UnderlineText</u>')">
                      <v-icon size="20">mdi-format-underline</v-icon>
                    </v-btn>
                    <v-btn icon size="small" variant="text" color="medium-emphasis" @click="insertText('[Link Title](https://example.com)')">
                      <v-icon size="20">mdi-link-variant</v-icon>
                    </v-btn>
                    <v-btn icon size="small" variant="text" color="medium-emphasis" @click="insertText('```\ncode block\n```')">
                      <v-icon size="20">mdi-code-tags</v-icon>
                    </v-btn>
                  </div>

                  <v-divider vertical class="mx-2 opacity-30" style="height: 24px" />

                  <!-- Attachment Trigger Button -->
                  <v-btn icon size="small" variant="text" color="medium-emphasis" @click="triggerFilePicker">
                    <v-icon size="20">mdi-paperclip</v-icon>
                  </v-btn>
                  <input
                    type="file"
                    ref="fileInput"
                    multiple
                    class="d-none"
                    @change="handleFileSelected"
                  />

                  <v-spacer />

                  <!-- Delete/Discard Button -->
                  <v-btn icon size="small" variant="text" color="error" @click="close">
                    <v-icon size="20">mdi-trash-can-outline</v-icon>
                  </v-btn>
                </div>

                <!-- Textarea for Email Body (Vuetify Plain) -->
                <v-textarea
                  v-model="body"
                  variant="plain"
                  placeholder="Write your email here..."
                  hide-details
                  auto-grow
                  rows="12"
                  class="message-textarea mt-1"
                />

                <!-- Attachment List inside Editor Box -->
                <div v-if="attachments.length > 0" class="px-4 pb-4 pt-3 border-top-dashed">
                  <div class="text-caption text-medium-emphasis mb-2 font-weight-bold">
                    Attachments ({{ attachments.length }})
                  </div>
                  <div class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-for="(file, idx) in attachments"
                      :key="idx"
                      closable
                      variant="flat"
                      bg-color="rgba(255, 255, 255, 0.05)"
                      color="white"
                      size="small"
                      class="rounded-lg"
                      @click:close="removeAttachment(idx)"
                    >
                      <v-icon start size="14" color="primary">mdi-file-outline</v-icon>
                      {{ file.name }}
                      <span class="text-caption text-medium-emphasis ml-2">({{ file.size }})</span>
                    </v-chip>
                  </div>
                </div>
              </div>
            </v-container>
          </div>
        </v-card>
      </v-container>
    </v-main>

    <!-- Custom Scheduler Dialog -->
    <v-dialog v-model="showScheduler" max-width="360">
      <v-card bg-color="#121620" class="border border-opacity-10 rounded-xl pa-5 text-white">
        <v-card-title class="px-0 pt-0 text-h6 font-weight-bold d-flex align-center ga-2">
          <v-icon color="primary">mdi-calendar-clock</v-icon> Schedule Send
        </v-card-title>
        <v-card-text class="px-0 py-4">
          <p class="text-caption text-medium-emphasis mb-4">Choose when you want this message to be sent:</p>
          <v-list bg-color="transparent" class="pa-0">
            <v-list-item @click="scheduleForMinutes(15)" class="rounded-lg mb-1 bg-white bg-opacity-05">
              <v-list-item-title class="text-white text-body-2">In 15 minutes</v-list-item-title>
            </v-list-item>
            <v-list-item @click="scheduleForHours(1)" class="rounded-lg mb-1 bg-white bg-opacity-05">
              <v-list-item-title class="text-white text-body-2">In 1 hour</v-list-item-title>
            </v-list-item>
            <v-list-item @click="scheduleForTomorrow()" class="rounded-lg mb-1 bg-white bg-opacity-05">
              <v-list-item-title class="text-white text-body-2">Tomorrow morning (8:00 AM)</v-list-item-title>
            </v-list-item>
            <v-list-item @click="scheduleCustom()" class="rounded-lg bg-white bg-opacity-05">
              <v-list-item-title class="text-white text-body-2">Custom time...</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-0 pb-0 justify-end">
          <v-btn variant="text" color="medium-emphasis" @click="showScheduler = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTheme } from 'vuetify'
import { useMailStore } from '../stores/mail'
import iconImg from '../assets/icon.png'
import { jmap } from '../services/jmap'

const router = useRouter()
const route = useRoute()
const store = useMailStore()

// Form variables
const to = ref('')
const cc = ref('')
const bcc = ref('')
const subject = ref('')
const body = ref('')
const sending = ref(false)
const sent = ref(false)
const error = ref('')

// Toggles & Priority
const showCc = ref(false)
const showBcc = ref(false)
const isHighPriority = ref(false)
const isHtmlMode = ref(false)

// Attachments
const fileInput = ref<HTMLInputElement | null>(null)
interface Attachment {
  name: string
  size: string
}
const attachments = ref<Attachment[]>([])

// Scheduling
const showScheduler = ref(false)
const isScheduled = ref(false)
const scheduledTime = ref<Date | null>(null)

const username = ref(localStorage.getItem('jmap_username') || 'admin')
const emailAddress = ref(username.value.includes('@') ? username.value : `${username.value}@localhost`)
const profileName = ref('')
const profilePicture = ref('')

// Email Templates for OTP and Newsletters
interface EmailTemplate {
  name: string
  icon: string
  desc: string
  subject: string
  body: string
}
const templates: EmailTemplate[] = [
  {
    name: 'OTP Verification',
    icon: 'mdi-shield-lock-outline',
    desc: 'Send OTP codes to users',
    subject: 'Verification Code: [OTP]',
    body: `Hello,\n\nYour one-time password (OTP) is: [OTP]\n\nThis code is valid for 5 minutes. Please do not share this verification code with anyone else.\n\nBest regards,\nSecurity Team`
  },
  {
    name: 'Weekly Newsletter',
    icon: 'mdi-newspaper',
    desc: 'Send news and updates to subscribers',
    subject: 'Weekly Newsletter: Latest Updates & Feature Releases',
    body: `Hi Subscriber,\n\nHere is your digest of the latest news and updates for this week:\n\n1. Product Release: We launched our new dashboard interface.\n2. Performance Improvements: Our backend is now 40% faster.\n\nThank you for choosing our service!\n\nBest regards,\nNewsletter Team`
  },
  {
    name: 'Welcome Onboarding',
    icon: 'mdi-handshake-outline',
    desc: 'Welcome email for new user registrations',
    subject: 'Welcome to our platform!',
    body: `Hello [Name],\n\nThank you for creating an account with us! We are thrilled to welcome you to our growing community.\n\nTo get started, follow these simple steps:\n- Step 1: Complete your user profile.\n- Step 2: Integrate our API into your backend.\n\nIf you have any questions, feel free to reply directly to this mail.\n\nBest regards,\nSupport Team`
  }
]

onMounted(() => {
  const saved = localStorage.getItem('jmap_username')
  if (saved) {
    username.value = saved
    emailAddress.value = saved.includes('@') ? saved : `${saved}@localhost`
  }
  profileName.value = localStorage.getItem('jmap_profileName') || ''
  profilePicture.value = localStorage.getItem('jmap_profilePicture') || ''

  if (route.query.to) to.value = route.query.to as string
  if (route.query.subject) subject.value = route.query.subject as string
  if (route.query.body) body.value = route.query.body as string
})

function applyTemplate(tpl: EmailTemplate) {
  subject.value = tpl.subject
  body.value = tpl.body
}

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

function logout() {
  localStorage.removeItem('jmap_basic')
  localStorage.removeItem('jmap_accountId')
  localStorage.removeItem('jmap_username')
  router.push('/login')
}

// Attachments logic
function triggerFilePicker() {
  fileInput.value?.click()
}

function handleFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files) return
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    const sizeInKB = Math.round(file.size / 1024)
    const formattedSize = sizeInKB > 1000
      ? `${(sizeInKB / 1024).toFixed(1)} MB`
      : `${sizeInKB} KB`
    attachments.value.push({
      name: file.name,
      size: formattedSize
    })
  }
}

function removeAttachment(index: number) {
  attachments.value.splice(index, 1)
}

// Scheduling logic
function openScheduler() {
  showScheduler.value = true
}

function scheduleForMinutes(min: number) {
  const t = new Date()
  t.setMinutes(t.getMinutes() + min)
  setScheduled(t)
}

function scheduleForHours(hr: number) {
  const t = new Date()
  t.setHours(t.getHours() + hr)
  setScheduled(t)
}

function scheduleForTomorrow() {
  const t = new Date()
  t.setDate(t.getDate() + 1)
  t.setHours(8, 0, 0, 0)
  setScheduled(t)
}

function scheduleCustom() {
  const hours = prompt('In how many hours would you like to schedule this?', '2')
  if (!hours) return
  const hVal = parseFloat(hours)
  if (isNaN(hVal)) return
  const t = new Date()
  t.setMinutes(t.getMinutes() + Math.round(hVal * 60))
  setScheduled(t)
}

// Set scheduled time
function setScheduled(time: Date) {
  scheduledTime.value = time
  isScheduled.value = true
  showScheduler.value = false
}

function cancelSchedule() {
  isScheduled.value = false
  scheduledTime.value = null
}

function formatScheduleTime(d: Date) {
  return d.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
}

// Inserting Text (Bold, Italic, Link, etc.)
function insertText(text: string) {
  body.value += text
}

async function send() {
  if (!to.value.trim()) { error.value = 'Please enter a recipient'; return }
  sending.value = true
  error.value = ''
  try {
    await jmap.sendEmail({
      to: to.value,
      subject: isHighPriority.value ? `[URGENT] ${subject.value}` : subject.value,
      body: body.value
    })
    sent.value = true
    setTimeout(() => router.push('/inbox'), 1500)
  } catch (e: any) {
    error.value = e.message || 'Failed to send'
  } finally {
    sending.value = false
  }
}

function close() {
  if (to.value || subject.value || body.value) {
    if (!confirm('Discard draft?')) return
  }
  router.push('/inbox')
}
</script>

<style scoped>
.compose-header-btn {
  border: 1px solid rgba(var(--v-theme-primary), 0.3) !important;
  border-radius: 9999px !important;
  text-transform: none;
  font-weight: 500;
  letter-spacing: normal;
}
.bg-white {
  background-color: white;
}
.bg-opacity-05 {
  background-color: rgba(255, 255, 255, 0.03) !important;
  transition: background 0.2s;
}
.bg-opacity-05:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
}
/* High Contrast Fields */
:deep(.v-text-field) {
  margin-bottom: 8px !important;
}
:deep(.v-text-field .v-field__input) {
  color: #ffffff !important;
  font-weight: 500;
  font-size: 0.95rem;
}
:deep(.v-text-field .v-label) {
  color: rgba(255, 255, 255, 0.45) !important;
  font-weight: 600 !important;
  font-size: 0.9rem;
  letter-spacing: 0.02em;
}
:deep(.v-text-field .v-field--focused .v-label) {
  color: rgb(var(--v-theme-primary)) !important;
  opacity: 1 !important;
}
:deep(.v-text-field .v-field__outline::before) {
  border-bottom-color: rgba(255, 255, 255, 0.08) !important;
  opacity: 1 !important;
}
:deep(.v-text-field .v-field--focused .v-field__outline::after) {
  border-bottom-color: rgb(var(--v-theme-primary)) !important;
  opacity: 1 !important;
}

/* Premium Editor Container */
.editor-container {
  background: rgba(10, 14, 23, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-radius: 16px !important;
  overflow: hidden;
  transition: all 0.3s ease;
}
.editor-container:focus-within {
  border-color: rgba(var(--v-theme-primary), 0.4) !important;
  background: rgba(10, 14, 23, 0.5) !important;
}

.editor-toolbar {
  background: rgba(255, 255, 255, 0.02) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  padding: 8px 16px !important;
}
.editor-toolbar :deep(.v-btn) {
  transition: all 0.2s ease !important;
  border-radius: 6px !important;
}
.editor-toolbar :deep(.v-btn:hover) {
  background: rgba(255, 255, 255, 0.08) !important;
  color: #ffffff !important;
}

.border-top-dashed {
  border-top: 1px dashed rgba(255, 255, 255, 0.08) !important;
}

.message-textarea :deep(textarea) {
  color: #ffffff !important;
  font-size: 1.05rem !important;
  line-height: 1.6 !important;
  min-height: 350px !important;
  padding-top: 12px !important;
  padding-bottom: 12px !important;
}
.message-textarea :deep(.v-field__input::placeholder),
.message-textarea :deep(textarea::placeholder) {
  color: rgba(255, 255, 255, 0.35) !important;
  opacity: 1 !important;
}
.message-textarea :deep(.v-field) {
  --v-field-padding-start: 16px !important;
  --v-field-padding-end: 16px !important;
}
.v-btn-group {
  border-radius: 9999px !important;
  overflow: hidden !important;
}
.v-btn-group :deep(.v-btn) {
  border-radius: 0 !important;
  border: none;
}
.v-btn-group :deep(.v-btn:not(:first-child)) {
  border-left: 1px solid rgba(255, 255, 255, 0.2) !important;
}
</style>
