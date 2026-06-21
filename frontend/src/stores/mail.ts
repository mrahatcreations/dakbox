import { defineStore } from 'pinia'
import { ref } from 'vue'
import { jmap } from '../services/jmap'

export interface Email {
  id: string
  subject?: string
  from?: { name?: string; email?: string }[]
  to?: { name?: string; email?: string }[]
  receivedAt?: string
  preview?: string
  hasAttachment?: boolean
  keywords?: Record<string, boolean>
  bodyValues?: Record<string, { value: string; charset?: string }>
}

export interface Mailbox {
  id: string
  name: string
  role?: string
  totalEmails?: number
  unreadEmails?: number
}

export type ViewType = 'mailbox' | 'starred' | 'all' | 'snoozed' | 'important' | 'scheduled' | 'settings' | 'admin'

export const useMailStore = defineStore('mail', () => {
  const emails = ref<Email[]>([])
  const mailboxes = ref<Mailbox[]>([])
  const loading = ref(false)
  const currentMailboxId = ref('')
  const currentView = ref<ViewType>('mailbox')
  const currentLabel = ref('Inbox')
  const drawer = ref(true)

  // Floating Compose State
  const isComposeOpen = ref(false)
  const isComposeMinimized = ref(false)
  const isComposeMaximized = ref(false)
  const composeTo = ref('')
  const composeCc = ref('')
  const composeBcc = ref('')
  const composeSubject = ref('')
  const composeBody = ref('')

  function openCompose(to = '', subject = '', body = '') {
    composeTo.value = to
    composeCc.value = ''
    composeBcc.value = ''
    composeSubject.value = subject
    composeBody.value = body
    isComposeOpen.value = true
    isComposeMinimized.value = false
    isComposeMaximized.value = false
  }

  function closeCompose() {
    isComposeOpen.value = false
  }

  async function fetchMailboxes() {
    const res = await jmap.getMailboxes()
    mailboxes.value = (res?.list || []).map((m: any) => ({
      id: m.id,
      name: m.name,
      role: m.role,
      totalEmails: m.totalEmails,
      unreadEmails: m.unreadEmails,
    }))
    const inbox = mailboxes.value.find(m => m.role === 'inbox')
    if (inbox && !currentMailboxId.value) {
      currentMailboxId.value = inbox.id
      currentView.value = 'mailbox'
      currentLabel.value = 'Inbox'
      fetchEmails(inbox.id)
    }
  }

  async function refreshEmails() {
    loading.value = true
    try {
      const data = await jmap.getEmails(currentMailboxId.value)
      emails.value = data?.list || []
    } finally {
      loading.value = false
    }
  }

  async function fetchEmails(mailboxId: string) {
    currentView.value = 'mailbox'
    currentMailboxId.value = mailboxId
    const mb = mailboxes.value.find(m => m.id === mailboxId)
    currentLabel.value = mb?.name || 'Mail'
    loading.value = true
    try {
      const data = await jmap.getEmails(mailboxId)
      emails.value = data?.list || []
    } finally {
      loading.value = false
    }
  }

  async function fetchStarred() {
    currentView.value = 'starred'
    currentLabel.value = 'Starred'
    currentMailboxId.value = ''
    loading.value = true
    try {
      const data = await jmap.getStarred()
      emails.value = data?.list || []
    } finally {
      loading.value = false
    }
  }

  async function fetchAllMail() {
    currentView.value = 'all'
    currentLabel.value = 'All Mail'
    currentMailboxId.value = ''
    loading.value = true
    try {
      const data = await jmap.getAllMail()
      emails.value = data?.list || []
    } finally {
      loading.value = false
    }
  }

  function showView(view: ViewType, label: string) {
    currentView.value = view
    currentLabel.value = label
    currentMailboxId.value = ''
    emails.value = []
  }

  async function toggleStar(emailId: string, emailObj?: Email) {
    const email = emailObj || emails.value.find(e => e.id === emailId)
    if (!email) return
    const starred = !email.keywords?.$flagged
    await jmap.toggleStar(emailId, starred)
    if (email.keywords) email.keywords.$flagged = starred
    else email.keywords = { $flagged: starred }
    if (currentView.value === 'starred' && !starred) {
      emails.value = emails.value.filter(e => e.id !== emailId)
    }
  }

  async function moveToTrash(emailId: string) {
    loading.value = true
    try {
      await jmap.moveToTrash(emailId)
      emails.value = emails.value.filter(e => e.id !== emailId)
    } finally {
      loading.value = false
    }
  }

  function getMailboxIcon(mailbox: Mailbox) {
    switch (mailbox.role) {
      case 'inbox': return 'mdi-inbox'
      case 'sent': return 'mdi-send'
      case 'trash': return 'mdi-delete'
      case 'drafts': return 'mdi-pencil-outline'
      case 'spam': return 'mdi-alert-circle-outline'
      case 'archive': return 'mdi-archive'
      case 'junk': return 'mdi-alert-circle-outline'
      default: return 'mdi-folder'
    }
  }

  return {
    emails, mailboxes, loading, drawer,
    currentMailboxId, currentView, currentLabel,
    isComposeOpen, isComposeMinimized, isComposeMaximized,
    composeTo, composeCc, composeBcc, composeSubject, composeBody,
    openCompose, closeCompose,
    fetchMailboxes, refreshEmails, fetchEmails, fetchStarred, fetchAllMail,
    showView, toggleStar, moveToTrash, getMailboxIcon,
  }
})
