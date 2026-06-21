export interface User {
  id: string
  name: string
  email: string
  role: 'user' | 'admin' | 'superadmin'
  hasDeveloperAccess?: boolean
}

const API_BASE = 'http://localhost:3000/api'

export const adminService = {
  async getUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/users`)
    if (!res.ok) {
      const err = await res.json()
      // If the backend returns 401/Auth failed from the CLI, we return the mock fallback so the UI still works
      // but log the error.
      console.warn('Backend returned error:', err.error)
      throw new Error(err.error)
    }
    const data = await res.json()
    // The actual Stalwart CLI returns accounts in a specific format, we map them here
    // If it's an array, we map it. If it returns an error, we throw.
    if (Array.isArray(data)) {
      return data.map((acc: any) => ({
        id: acc.id || acc.email,
        name: acc.name || 'Unknown',
        email: acc.email || '',
        role: acc.roles?.[0] || 'user'
      }))
    }
    return []
  },
  
  async createUser(user: Omit<User, 'id'> & { password?: string }) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    })
    if (!res.ok) throw new Error((await res.json()).error)
    return await res.json()
  },
  
  async updateUser(id: string, updates: Partial<Omit<User, 'id'>>) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    if (!res.ok) throw new Error((await res.json()).error)
    return await res.json()
  },
  
  async deleteUser(id: string) {
    const res = await fetch(`${API_BASE}/users/${id}`, {
      method: 'DELETE'
    })
    if (!res.ok) throw new Error((await res.json()).error)
    return await res.json()
  }
}
