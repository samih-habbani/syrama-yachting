'use client'

import { useEffect, useState } from 'react'
import { Plus, ArrowLeft, Pencil, Trash2, ShieldUser } from 'lucide-react'
import PageHeader from '@/components/admin/ui/PageHeader'
import Card from '@/components/admin/ui/Card'
import Button from '@/components/admin/ui/Button'
import EmptyState from '@/components/admin/ui/EmptyState'
import ActionsMenu from '@/components/admin/ui/ActionsMenu'
import { FilterField, TextField } from '@/components/admin/ui/FilterBar'

interface AdminUser {
  id: number
  email: string
  name: string | null
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ id: '', email: '', password: '', name: '' })
  const [error, setError] = useState('')

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Fetch users error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleEdit = (user: AdminUser) => {
    setEditingUserId(user.id)
    setFormData({ id: String(user.id), email: user.email, password: '', name: user.name || '' })
    setShowForm(true)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const method = editingUserId ? 'PUT' : 'POST'
      const payload = editingUserId
        ? { id: formData.id, email: formData.email, name: formData.name, ...(formData.password && { password: formData.password }) }
        : formData

      const response = await fetch('/api/admin/users', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to save user')
        return
      }

      await fetchUsers()
      setFormData({ id: '', email: '', password: '', name: '' })
      setShowForm(false)
      setEditingUserId(null)
    } catch (error) {
      console.error('Save user error:', error)
      setError('An error occurred')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user?')) return
    try {
      const response = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' })
      if (response.ok) await fetchUsers()
    } catch (error) {
      console.error('Delete user error:', error)
    }
  }

  if (showForm) {
    return (
      <div>
        <Button variant="ghost" size="sm" onClick={() => setShowForm(false)} style={{ marginBottom: 24 }}>
          <ArrowLeft size={14} strokeWidth={2} />
          Back to users
        </Button>

        <Card style={{ maxWidth: 560, padding: 36 }}>
          <h2 style={{ fontFamily: 'var(--font-cormorant)', fontWeight: 400, fontSize: 26, color: '#f5eedd', margin: '0 0 6px' }}>
            {editingUserId ? 'Edit User' : 'Add New User'}
          </h2>
          <p style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f', margin: '0 0 28px' }}>
            {editingUserId ? 'Update this admin account.' : 'Create a new admin account.'}
          </p>

          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{ background: 'rgba(196,94,94,0.1)', border: '1px solid rgba(196,94,94,0.35)', color: '#e08080', padding: '12px 16px', borderRadius: 7, fontFamily: 'var(--font-lora)', fontSize: 13, marginBottom: 20 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 18 }}>
              <FilterField label="Email *">
                <TextField type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </FilterField>
              <FilterField label="Name">
                <TextField value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
              </FilterField>
            </div>

            <div style={{ marginBottom: 28 }}>
              <FilterField label={editingUserId ? 'New Password (leave empty to keep current)' : 'Password *'}>
                <TextField type="password" required={!editingUserId} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
              </FilterField>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Button type="submit" variant="primary">{editingUserId ? 'Save Changes' : 'Create User'}</Button>
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Admin Users"
        description="Manage who has access to this dashboard."
        breadcrumbs={[{ label: 'Overview', href: '/admin/dashboard' }, { label: 'Users' }]}
        action={
          <Button variant="primary" onClick={() => { setEditingUserId(null); setFormData({ id: '', email: '', password: '', name: '' }); setShowForm(true); setError('') }}>
            <Plus size={14} strokeWidth={2.5} />
            Add User
          </Button>
        }
      />

      {isLoading ? (
        <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13, color: '#8f8f7f' }}>Loading users…</div>
        </Card>
      ) : users.length === 0 ? (
        <Card><EmptyState icon={ShieldUser} title="No users found" description="Add an admin account to get started." /></Card>
      ) : (
        <Card style={{ overflow: 'hidden' }}>
          {users.map((user, i) => (
            <div
              key={user.id}
              style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20,
                padding: '18px 24px', borderBottom: i < users.length - 1 ? '1px solid rgba(184,151,74,0.08)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #d4b472, #b8974a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-lora)', fontSize: 13, fontWeight: 700, color: '#06090f',
                  }}
                >
                  {(user.name || user.email).charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 13.5, fontWeight: 600, color: '#f5eedd' }}>{user.name || '—'}</div>
                  <div style={{ fontFamily: 'var(--font-lora)', fontSize: 11.5, color: '#8f8f7f', marginTop: 2 }}>
                    {user.email} · Since {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              <ActionsMenu
                items={[
                  { label: 'Edit', icon: <Pencil size={13.5} strokeWidth={1.75} />, onClick: () => handleEdit(user) },
                  { label: 'Delete', icon: <Trash2 size={13.5} strokeWidth={1.75} />, onClick: () => handleDelete(user.id), tone: 'danger' },
                ]}
              />
            </div>
          ))}
        </Card>
      )}
    </div>
  )
}
