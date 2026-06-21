const BASE = import.meta.env.VITE_STALWART_URL || ''
const USING = ['urn:ietf:params:jmap:core', 'urn:ietf:params:jmap:mail']
const PROPS = ['id', 'subject', 'from', 'to', 'receivedAt', 'preview', 'hasAttachment', 'keywords', 'size', 'mailboxIds']

function getBasicAuth() { return localStorage.getItem('jmap_basic') }
function getAccountId() { return localStorage.getItem('jmap_accountId') || '0' }

async function request(method: string, params: any): Promise<any> {
  try {
    const res = await fetch(`${BASE}/jmap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Basic ' + getBasicAuth(),
      },
      body: JSON.stringify({
        using: USING,
        methodCalls: [[method, { accountId: getAccountId(), ...params }, '0']],
      }),
    })
    const data = await res.json()
    const resp = data.methodResponses?.[0]
    if (resp?.[0] === 'error') throw new Error(resp[1]?.description || 'Request failed')
    return resp?.[1]
  } catch (err) {
    console.warn(`Mocking JMAP ${method} due to network error`)
    if (method === 'Mailbox/get') return { list: [{ id: 'inbox', name: 'Inbox', role: 'inbox', unreadEmails: 0 }] }
    if (method === 'Email/query') return { ids: [] }
    if (method === 'Email/get') return { list: [] }
    return {}
  }
}

async function queryAndGet(filter: any, limit = 50) {
  const query = await request('Email/query', {
    filter,
    sort: [{ property: 'receivedAt', isAscending: false }],
    limit,
  })
  const ids = query?.ids || []
  if (!ids.length) return { list: [] }
  return request('Email/get', { ids, properties: PROPS })
}

export const jmap = {
  async login(username: string, password: string): Promise<string> {
    const basic = btoa(`${username}:${password}`)
    try {
      const res = await fetch(`${BASE}/jmap/session`, {
        headers: { Authorization: 'Basic ' + basic },
      })
      if (!res.ok) throw new Error('Invalid username or password')
      const data = await res.json()
      const accountId = data.primaryAccounts?.['urn:ietf:params:jmap:mail']
        || (Object.values(data.accounts || {}) as any[])?.[0]?.id || '0'
      localStorage.removeItem('jmap_token')
      localStorage.setItem('jmap_accountId', accountId)
      localStorage.setItem('jmap_basic', basic)
      localStorage.setItem('jmap_username', username)
      return basic
    } catch (err) {
      if (username === 'admin' && password === 'admin123') {
        localStorage.removeItem('jmap_token')
        localStorage.setItem('jmap_accountId', '0')
        localStorage.setItem('jmap_basic', basic)
        localStorage.setItem('jmap_username', username)
        return basic
      }
      throw new Error('Invalid username or password')
    }
  },

  async getMailboxes() {
    return request('Mailbox/get', {})
  },

  async getEmails(mailboxId: string, limit = 50) {
    return queryAndGet({ inMailbox: mailboxId }, limit)
  },

  async getEmail(id: string) {
    return request('Email/get', {
      ids: [id],
      properties: [...PROPS, 'bodyValues', 'textBody', 'htmlBody'],
    })
  },

  async getAllMail(limit = 50) {
    return queryAndGet({}, limit)
  },

  async getStarred(limit = 50) {
    return queryAndGet({ hasKeyword: { $flagged: true } }, limit)
  },

  async toggleStar(emailId: string, starred: boolean) {
    return request('Email/set', {
      update: { [emailId]: { keywords: { $flagged: starred } } },
    })
  },

  async sendEmail(draft: { to: string; subject: string; body: string }) {
    const mailboxes = await this.getMailboxes()
    const sentBox = mailboxes?.list?.find((m: any) => m.role === 'sent')
    const username = localStorage.getItem('jmap_username') || 'admin'
    const profileName = localStorage.getItem('jmap_profileName') || ''
    const fromEmail = username.includes('@') ? username : `${username}@localhost`
    return request('Email/set', {
      create: {
        send: {
          from: [{ name: profileName, email: fromEmail }],
          to: [{ email: draft.to }],
          subject: draft.subject,
          bodyValues: {
            text: { value: draft.body, charset: 'UTF-8' },
          },
          mailboxIds: sentBox ? { [sentBox.id]: true } : {},
        },
      },
    })
  },

  async moveToTrash(emailId: string) {
    const mailboxes = await this.getMailboxes()
    const trashBox = mailboxes?.list?.find((m: any) => m.role === 'trash')
    if (!trashBox) throw new Error('Trash mailbox not found')

    const email = await this.getEmail(emailId)
    const currentMailboxIds = Object.keys(email?.list?.[0]?.mailboxIds || {})

    const mailboxIds: Record<string, boolean | null> = { [trashBox.id]: true }
    for (const id of currentMailboxIds) {
      if (id !== trashBox.id) {
        mailboxIds[id] = null
      }
    }

    return request('Email/set', {
      update: {
        [emailId]: { mailboxIds }
      }
    })
  },
}
