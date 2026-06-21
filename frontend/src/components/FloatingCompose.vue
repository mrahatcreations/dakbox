<template>
  <div
    v-if="store.isComposeOpen"
    class="floating-compose"
    :class="{ 'is-minimized': store.isComposeMinimized, 'is-maximized': store.isComposeMaximized }"
  >
    <!-- Header/Toolbar -->
    <div class="d-flex align-center px-4 py-3 border-bottom card-toolbar cursor-pointer" @click="toggleMinimize">
      <div class="text-subtitle-2 font-weight-bold text-white">
        {{ store.isComposeMinimized ? 'Draft Minimized' : (isScheduled ? 'Schedule Message' : 'New Message') }}
      </div>
      
      <v-spacer />
      
      <!-- Window Controls -->
      <v-btn icon size="x-small" variant="text" color="medium-emphasis" class="mr-1" @click.stop="toggleMinimize">
        <v-icon>{{ store.isComposeMinimized ? 'mdi-window-maximize' : 'mdi-minus' }}</v-icon>
      </v-btn>
      <v-btn icon size="x-small" variant="text" color="medium-emphasis" class="mr-1" @click.stop="toggleMaximize">
        <v-icon>{{ store.isComposeMaximized ? 'mdi-fullscreen-exit' : 'mdi-fullscreen' }}</v-icon>
      </v-btn>
      <v-btn icon size="x-small" variant="text" color="white" @click.stop="close">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <!-- Content Editor Area (Hidden when minimized) -->
    <div v-show="!store.isComposeMinimized" class="flex-grow-1 overflow-y-auto px-4 py-4 d-flex flex-column">
      
      <!-- Template Selection Row -->
      <div class="d-flex align-center justify-end mb-3">
        <v-menu transition="slide-y-transition">
          <template #activator="{ props }">
            <v-btn
              v-bind="props"
              variant="outlined"
              color="primary"
              size="small"
              rounded="pill"
              class="px-3"
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
      </div>

      <v-alert v-if="error" type="error" variant="tonal" closable class="mb-3 rounded-lg" size="small" @click:close="error = ''">
        {{ error }}
      </v-alert>
      <v-alert v-if="sent" type="success" variant="tonal" closable class="mb-3 rounded-lg" size="small">
        {{ isScheduled ? 'Email scheduled successfully!' : 'Email sent successfully!' }}
      </v-alert>

      <!-- Scheduled Indicator Bar -->
      <v-alert v-if="isScheduled && scheduledTime" type="info" variant="tonal" closable class="mb-3 rounded-lg" size="small" @click:close="cancelSchedule">
        <div class="d-flex align-center justify-space-between text-caption">
          <span>Scheduled: <strong>{{ formatScheduleTime(scheduledTime) }}</strong></span>
          <v-btn size="x-small" variant="text" color="primary" class="font-weight-bold" @click="cancelSchedule">Cancel</v-btn>
        </div>
      </v-alert>

      <!-- Recipient Field (Vuetify Underlined) -->
      <v-text-field
        v-model="store.composeTo"
        label="To"
        variant="underlined"
        placeholder="recipient@example.com"
        class="mb-2"
        density="compact"
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
        v-model="store.composeCc"
        label="Cc"
        variant="underlined"
        placeholder="cc@example.com"
        class="mb-2"
        density="compact"
        hide-details="auto"
      />

      <!-- BCC Field -->
      <v-text-field
        v-if="showBcc"
        v-model="store.composeBcc"
        label="Bcc"
        variant="underlined"
        placeholder="bcc@example.com"
        class="mb-2"
        density="compact"
        hide-details="auto"
      />

      <!-- Subject Field -->
      <v-text-field
        v-model="store.composeSubject"
        label="Subject"
        variant="underlined"
        placeholder="Enter subject line"
        class="mb-3"
        density="compact"
        hide-details="auto"
      />

      <!-- Editor Options -->
      <div class="d-flex align-center ga-3 mb-2">
        <v-chip
          size="x-small"
          :color="isHighPriority ? 'error' : 'medium-emphasis'"
          variant="outlined"
          class="px-2"
          @click="isHighPriority = !isHighPriority"
        >
          <v-icon start size="12">
            {{ isHighPriority ? 'mdi-alert-circle' : 'mdi-alert-circle-outline' }}
          </v-icon>
          High Priority
        </v-chip>

        <v-chip
          size="x-small"
          :color="isHtmlMode ? 'success' : 'medium-emphasis'"
          variant="outlined"
          class="px-2"
          @click="isHtmlMode = !isHtmlMode"
        >
          <v-icon start size="12">mdi-code-braces</v-icon>
          HTML
        </v-chip>
      </div>

      <!-- Textarea for Email Body -->
      <v-textarea
        v-model="store.composeBody"
        variant="plain"
        placeholder="Write your email here..."
        hide-details
        auto-grow
        rows="8"
        class="message-textarea flex-grow-1 mt-1 text-white"
      />

      <!-- Attachment List -->
      <div v-if="attachments.length > 0" class="mt-4">
        <div class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="(file, idx) in attachments"
            :key="idx"
            closable
            variant="flat"
            bg-color="rgba(255, 255, 255, 0.05)"
            color="white"
            size="x-small"
            class="rounded-lg"
            @click:close="removeAttachment(idx)"
          >
            <v-icon start size="12" color="primary">mdi-file-outline</v-icon>
            {{ file.name }}
            <span class="text-caption text-medium-emphasis ml-1">({{ file.size }})</span>
          </v-chip>
        </div>
      </div>
    </div>

    <!-- Formatting & Action Toolbar at the Bottom -->
    <div v-show="!store.isComposeMinimized" class="d-flex align-center px-4 py-2 border-top card-toolbar mt-auto">
      <!-- Send Action Button -->
      <v-btn-group rounded="pill" color="primary" variant="flat" size="small" class="mr-3">
        <v-btn :loading="sending" class="px-4" @click="send">
          <v-icon start class="mr-1">
            {{ isScheduled ? 'mdi-calendar-clock' : 'mdi-send-outline' }}
          </v-icon>
          {{ isScheduled ? 'Schedule' : 'Send' }}
        </v-btn>
        <v-menu transition="slide-y-transition">
          <template #activator="{ props }">
            <v-btn v-bind="props" icon="mdi-menu-down" class="px-0" style="min-width: 28px" />
          </template>
          <v-list bg-color="#121620" class="border border-opacity-10 rounded-lg">
            <v-list-item @click="send" class="py-1">
              <template #prepend><v-icon size="small" class="mr-2">mdi-send-outline</v-icon></template>
              <v-list-item-title class="text-white text-body-2">Send Now</v-list-item-title>
            </v-list-item>
            <v-list-item @click="openScheduler" class="py-1">
              <template #prepend><v-icon size="small" class="mr-2">mdi-calendar-clock</v-icon></template>
              <v-list-item-title class="text-white text-body-2">Send Later...</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-btn-group>

      <!-- Text Formatting Icons -->
      <div class="d-flex align-center ga-1">
        <v-btn icon size="x-small" variant="text" color="medium-emphasis" @click="insertText('**BoldText**')">
          <v-icon size="18">mdi-format-bold</v-icon>
        </v-btn>
        <v-btn icon size="x-small" variant="text" color="medium-emphasis" @click="insertText('*ItalicText*')">
          <v-icon size="18">mdi-format-italic</v-icon>
        </v-btn>
        <v-btn icon size="x-small" variant="text" color="medium-emphasis" @click="insertText('<u>UnderlineText</u>')">
          <v-icon size="18">mdi-format-underline</v-icon>
        </v-btn>
      </div>

      <v-divider vertical class="mx-2 opacity-30" style="height: 18px" />

      <!-- Attachment Trigger Button -->
      <v-btn icon size="x-small" variant="text" color="medium-emphasis" @click="triggerFilePicker">
        <v-icon size="18">mdi-paperclip</v-icon>
      </v-btn>
      <input
        type="file"
        ref="fileInput"
        multiple
        class="d-none"
        @change="handleFileSelected"
      />

      <v-spacer />

      <!-- Discard Button -->
      <v-btn icon size="x-small" variant="text" color="error" @click="close">
        <v-icon size="18">mdi-trash-can-outline</v-icon>
      </v-btn>
    </div>

    <!-- Custom Scheduler Dialog -->
    <v-dialog v-model="showScheduler" max-width="320">
      <v-card bg-color="#121620" class="border border-opacity-10 rounded-xl pa-4 text-white">
        <v-card-title class="px-0 pt-0 text-subtitle-1 font-weight-bold d-flex align-center ga-2">
          <v-icon color="primary">mdi-calendar-clock</v-icon> Schedule Send
        </v-card-title>
        <v-card-text class="px-0 py-3">
          <p class="text-caption text-medium-emphasis mb-3">Choose when you want this message to be sent:</p>
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
          <v-btn variant="text" size="small" color="medium-emphasis" @click="showScheduler = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useMailStore } from '../stores/mail'
import { jmap } from '../services/jmap'

const store = useMailStore()

// State
const sending = ref(false)
const sent = ref(false)
const error = ref('')

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

// Email Templates
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

function applyTemplate(tpl: EmailTemplate) {
  store.composeSubject = tpl.subject
  store.composeBody = tpl.body
}

// Window Toggles
function toggleMinimize() {
  store.isComposeMinimized = !store.isComposeMinimized
}

function toggleMaximize() {
  store.isComposeMaximized = !store.isComposeMaximized
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

function insertText(text: string) {
  store.composeBody += text
}

async function send() {
  if (!store.composeTo.trim()) { error.value = 'Please enter a recipient'; return }
  sending.value = true
  error.value = ''
  try {
    await jmap.sendEmail({
      to: store.composeTo,
      subject: isHighPriority.value ? `[URGENT] ${store.composeSubject}` : store.composeSubject,
      body: store.composeBody
    })
    sent.value = true
    setTimeout(() => {
      close()
      store.refreshEmails() // Reload emails
    }, 1200)
  } catch (e: any) {
    error.value = e.message || 'Failed to send'
  } finally {
    sending.value = false
  }
}

function close() {
  if (store.composeTo || store.composeSubject || store.composeBody) {
    if (!confirm('Discard draft?')) return
  }
  store.closeCompose()
  attachments.value = []
  cancelSchedule()
}
</script>

<style scoped>
.floating-compose {
  position: fixed;
  bottom: 0;
  right: 30px;
  width: 580px;
  height: 520px;
  z-index: 2000;
  background: rgba(15, 20, 32, 0.96) !important;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-bottom: none !important;
  border-radius: 12px 12px 0 0 !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5) !important;
  display: flex;
  flex-direction: column;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  overflow: hidden;
}

.floating-compose.is-minimized {
  height: 48px !important;
}

.floating-compose.is-maximized {
  width: 75% !important;
  height: 80% !important;
  right: 12.5% !important;
  bottom: 5% !important;
  border-radius: 12px !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.card-toolbar {
  height: 48px;
  background: rgba(255, 255, 255, 0.02) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.message-textarea :deep(.v-field__input) {
  font-family: inherit;
  line-height: 1.5;
  padding: 0;
  font-size: 0.95rem;
}
.message-textarea :deep(.v-field) {
  --v-field-padding-start: 0px !important;
  --v-field-padding-end: 0px !important;
}
.bg-opacity-05 {
  background-color: rgba(255, 255, 255, 0.03) !important;
  transition: background 0.2s;
}
.bg-opacity-05:hover {
  background-color: rgba(255, 255, 255, 0.08) !important;
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
.compose-header-btn {
  border: 1px solid rgba(var(--v-theme-primary), 0.2) !important;
  border-radius: 9999px !important;
  text-transform: none;
  font-size: 0.75rem;
  height: 28px !important;
}
</style>
