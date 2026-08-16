'use client'

import { useEffect, useState } from 'react'

export default function UsersPage() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingUserId, setEditingUserId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ id: '', email: '', password: '', name: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

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

  const handleEdit = (user: any) => {
    setEditingUserId(user.id)
    setFormData({
      id: String(user.id),
      email: user.email,
      password: '',
      name: user.name || ''
    })
    setShowForm(true)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      const url = editingUserId ? '/api/admin/users' : '/api/admin/users'
      const method = editingUserId ? 'PUT' : 'POST'
      const payload = editingUserId
        ? {
            id: formData.id,
            email: formData.email,
            name: formData.name,
            ...(formData.password && { password: formData.password })
          }
        : formData

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
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
    if (confirm('Delete this user?')) {
      try {
        const response = await fetch(`/api/admin/users?id=${id}`, {
          method: 'DELETE'
        })

        if (response.ok) {
          await fetchUsers()
        }
      } catch (error) {
        console.error('Delete user error:', error)
      }
    }
  }

  return (
    <div>
      {!showForm && (
        <div className="flex justify-between items-start mb-12">
          <div>
            <h2 className="text-lg tracking-wider text-gray-500 mb-2">USER MANAGEMENT</h2>
            <p className="text-gray-600 text-sm">Manage admin accounts</p>
          </div>
          <button
            onClick={() => {
              setEditingUserId(null)
              setFormData({ id: '', email: '', password: '', name: '' })
              setShowForm(true)
              setError('')
            }}
            className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-6 py-2 transition text-sm tracking-wider font-light"
          >
            + ADD USER
          </button>
        </div>
      )}

      {showForm && (
        <div className="mb-12">
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-500 hover:text-[#b8974a] transition text-sm tracking-wider font-light mb-8"
          >
            ← BACK
          </button>
          <form onSubmit={handleSubmit} className="bg-[#0f1419] border border-[#b8974a] border-opacity-10 p-12">
            <h2 className="text-2xl text-[#b8974a] mb-2" style={{ fontFamily: 'var(--font-tenor)' }}>
              {editingUserId ? 'Edit User' : 'Add New User'}
            </h2>
            <p className="text-gray-600 text-sm tracking-wider mb-8">
              {editingUserId ? 'Update user details' : 'Create a new admin account'}
            </p>

            {error && (
              <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-300 px-6 py-4 mb-8 text-sm">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-gray-600 uppercase text-xs tracking-wider block mb-2">
                  {editingUserId ? 'New Password (leave empty to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-[#06090f] border border-[#b8974a] border-opacity-20 hover:border-opacity-40 focus:border-opacity-100 px-4 py-3 text-white focus:outline-none transition"
                  required={!editingUserId}
                />
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                type="submit"
                className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-8 py-3 transition text-sm tracking-wider font-light"
              >
                {editingUserId ? 'SAVE CHANGES' : 'CREATE USER'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-600 hover:text-gray-400 border border-gray-600 hover:border-gray-400 px-8 py-3 transition text-sm tracking-wider font-light"
              >
                CANCEL
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-500" style={{ fontFamily: 'var(--font-tenor)' }}>Loading users...</div>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 text-gray-500">No users found</div>
      ) : (
        <div className="space-y-4">
          {users.map((user: any) => (
            <div
              key={user.id}
              className="bg-[#0f1419] border border-[#b8974a] border-opacity-10 hover:border-opacity-30 transition p-8 flex justify-between items-center"
            >
              <div>
                <p className="text-[#b8974a] mb-1" style={{ fontFamily: 'var(--font-tenor)' }}>
                  {user.name || '—'}
                </p>
                <p className="text-gray-500 text-sm">{user.email}</p>
                <p className="text-gray-600 text-xs mt-2">
                  Created: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="text-[#b8974a] hover:text-white border border-[#b8974a] hover:border-white px-4 py-2 transition text-xs tracking-wider font-light"
                >
                  EDIT
                </button>
                <button
                  onClick={() => handleDelete(user.id)}
                  className="text-red-600 hover:text-red-400 border border-red-600 hover:border-red-400 px-4 py-2 transition text-xs tracking-wider font-light"
                >
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
