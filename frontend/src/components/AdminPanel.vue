<template>
  <v-container fluid class="pa-4 pa-sm-6 d-flex flex-column" style="height: 100%; overflow: hidden">
    <!-- Header -->
    <div class="d-flex align-center mb-6">
      <v-icon size="32" color="primary" class="mr-3">mdi-shield-account</v-icon>
      <div>
        <h2 class="text-h5 font-weight-bold text-white mb-1">User Management</h2>
        <div class="text-caption text-medium-emphasis">Create and manage email accounts and roles</div>
      </div>
      <v-spacer />
      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus"
        variant="flat"
        class="text-none font-weight-bold"
        @click="openCreateDialog"
      >
        Add User
      </v-btn>
    </div>

    <!-- Data Table -->
    <v-card class="flex-grow-1 bg-surface rounded-xl border border-opacity-10 d-flex flex-column overflow-hidden" elevation="0">
      <v-table class="flex-grow-1 bg-transparent" hover>
        <thead>
          <tr>
            <th class="text-left font-weight-bold text-medium-emphasis text-subtitle-2 px-6">Name</th>
            <th class="text-left font-weight-bold text-medium-emphasis text-subtitle-2 px-6">Email / Username</th>
            <th class="text-left font-weight-bold text-medium-emphasis text-subtitle-2 px-6">Role</th>
            <th class="text-right font-weight-bold text-medium-emphasis text-subtitle-2 px-6">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="user-row">
            <td class="px-6 py-3">
              <div class="d-flex align-center">
                <v-avatar color="primary" size="36" class="mr-3">
                  <span class="text-white text-uppercase font-weight-bold text-caption">
                    {{ user.name.charAt(0).toUpperCase() }}
                  </span>
                </v-avatar>
                <span class="text-body-2 font-weight-bold text-white">{{ user.name }}</span>
              </div>
            </td>
            <td class="px-6 py-3 text-body-2 text-medium-emphasis">
              {{ user.email }}
            </td>
            <td class="px-6 py-3">
              <v-chip
                :color="getRoleColor(user.role)"
                size="small"
                variant="flat"
                class="text-uppercase font-weight-bold"
              >
                {{ user.role }}
              </v-chip>
              <v-chip v-if="user.hasDeveloperAccess" size="small" color="primary" variant="flat" class="ml-2 text-uppercase font-weight-bold" style="font-size: 10px">
                DEV
              </v-chip>
            </td>
            <td class="px-6 py-3 text-right">
              <v-btn icon="mdi-pencil" variant="text" size="small" color="medium-emphasis" class="mr-2" @click="openEditDialog(user)" />
              <v-btn icon="mdi-delete" variant="text" size="small" color="error" @click="openDeleteDialog(user)" />
            </td>
          </tr>
          <tr v-if="users.length === 0">
            <td colspan="4" class="text-center py-16 text-medium-emphasis">
              No users found.
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card class="bg-surface rounded-xl border border-opacity-10" elevation="24">
        <v-card-title class="px-6 pt-6 text-white font-weight-bold d-flex align-center">
          <v-icon :icon="isEditing ? 'mdi-pencil' : 'mdi-account-plus'" color="primary" class="mr-3" />
          {{ isEditing ? 'Edit User' : 'Create New User' }}
        </v-card-title>
        <v-card-text class="px-6 pt-4 pb-2">
          <v-form ref="form" v-model="valid">
            <v-text-field
              v-model="formData.name"
              label="Full Name"
              variant="outlined"
              color="primary"
              class="mb-4"
              :rules="[v => !!v || 'Name is required']"
            />
            <v-text-field
              v-model="formData.email"
              label="Email Address"
              variant="outlined"
              color="primary"
              class="mb-4"
              :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Must be valid email']"
            />
            <v-text-field
              v-if="!isEditing"
              v-model="formData.password"
              label="Password"
              type="password"
              variant="outlined"
              color="primary"
              class="mb-4"
              :rules="[v => !!v || 'Password is required']"
            />
            <v-select
              v-model="formData.role"
              :items="[{ title: 'User', value: 'user' }, { title: 'Admin', value: 'admin' }, { title: 'Super Admin', value: 'superadmin' }]"
              label="Role"
              variant="outlined"
              color="primary"
              class="mb-2"
              :rules="[v => !!v || 'Role is required']"
            >
              <template #selection="{ item }">
                <v-chip :color="getRoleColor(item.value)" size="small" variant="flat" class="text-uppercase font-weight-bold">
                  {{ item.title }}
                </v-chip>
              </template>
            </v-select>
            <v-switch
              v-model="formData.hasDeveloperAccess"
              color="primary"
              label="Grant Developer API Access"
              hide-details
              class="mt-2"
            />
          </v-form>
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0">
          <v-spacer />
          <v-btn variant="text" color="medium-emphasis" class="text-none font-weight-bold mr-2" @click="dialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" class="text-none font-weight-bold px-6 rounded-lg" :disabled="!valid" @click="saveUser">
            {{ isEditing ? 'Save Changes' : 'Create User' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card class="bg-surface rounded-xl border border-opacity-10" elevation="24">
        <v-card-title class="px-6 pt-6 text-error font-weight-bold d-flex align-center">
          <v-icon icon="mdi-alert" class="mr-3" />
          Confirm Deletion
        </v-card-title>
        <v-card-text class="px-6 pt-2 text-medium-emphasis">
          Are you sure you want to delete user <strong>{{ userToDelete?.name }}</strong>? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="px-6 pb-6 pt-0 mt-4">
          <v-spacer />
          <v-btn variant="text" color="medium-emphasis" class="text-none font-weight-bold mr-2" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn variant="flat" color="error" class="text-none font-weight-bold px-6 rounded-lg" @click="confirmDelete">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { adminService, type User } from '../services/admin'

const users = ref<User[]>([])
const dialog = ref(false)
const deleteDialog = ref(false)
const isEditing = ref(false)
const valid = ref(false)
const form = ref()

const userToDelete = ref<User | null>(null)
const formData = ref({
  id: '',
  name: '',
  email: '',
  password: '',
  role: 'user' as User['role'],
  hasDeveloperAccess: false
})

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  try {
    const apiUsers = await adminService.getUsers()
    users.value = apiUsers.map(u => ({
      ...u,
      hasDeveloperAccess: localStorage.getItem(`dev_access_${u.email}`) === 'true'
    }))
  } catch (e) {
    console.error('Failed to load users:', e)
  }
}

function getRoleColor(role: string) {
  switch(role) {
    case 'superadmin': return 'error'
    case 'admin': return 'warning'
    case 'user': return 'info'
    default: return 'primary'
  }
}

function openCreateDialog() {
  isEditing.value = false
  formData.value = { id: '', name: '', email: '', password: '', role: 'user', hasDeveloperAccess: false }
  dialog.value = true
  if (form.value) form.value.resetValidation()
}

function openEditDialog(user: User) {
  isEditing.value = true
  formData.value = { id: user.id, name: user.name, email: user.email, password: '', role: user.role, hasDeveloperAccess: user.hasDeveloperAccess || false }
  dialog.value = true
  if (form.value) form.value.resetValidation()
}

function openDeleteDialog(user: User) {
  userToDelete.value = user
  deleteDialog.value = true
}

async function saveUser() {
  if (!valid.value) return
  
  try {
    if (isEditing.value) {
      await adminService.updateUser(formData.value.id, {
        name: formData.value.name,
        email: formData.value.email,
        role: formData.value.role
      })
    } else {
      await adminService.createUser({
        name: formData.value.name,
        email: formData.value.email,
        password: formData.value.password,
        role: formData.value.role
      })
    }
    
    // Save the developer access permission locally
    localStorage.setItem(`dev_access_${formData.value.email}`, formData.value.hasDeveloperAccess ? 'true' : 'false')
    
    dialog.value = false
    await loadUsers()
  } catch (e: any) {
    alert('Failed to save user: ' + e.message)
  }
}

async function confirmDelete() {
  if (userToDelete.value) {
    try {
      await adminService.deleteUser(userToDelete.value.id)
      deleteDialog.value = false
      await loadUsers()
    } catch (e: any) {
      alert('Failed to delete user: ' + e.message)
    }
  }
}
</script>

<style scoped>
.user-row {
  transition: background-color 0.2s ease;
}
.user-row:hover {
  background-color: rgba(255, 255, 255, 0.03) !important;
}
</style>
