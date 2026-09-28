import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUsers, updateUser, deleteUser } from '../../services/api';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
  Users, RefreshCw, Search, Edit2, Trash2, CheckCircle2,
  AlertCircle, X, ChevronDown, Shield, User,
} from 'lucide-react';

const ROLE_STYLE = {
  administrator: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  operator:      'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  analyst:       'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400',
};

/* ── edit user modal ─────────────────────────────────────────────────── */
function EditModal({ user, onSave, onClose, saving, error }) {
  const [form, setForm] = useState({
    full_name: user.full_name || '',
    email:     user.email || '',
    role:      user.role || 'operator',
    is_active: user.is_active !== false,
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 w-full max-w-md shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800">
          <h3 className="text-base font-bold text-[#0F172A] dark:text-white">Edit User</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-[#64748B] transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
            </div>
          )}

          {[
            { key: 'full_name', label: 'Full Name', type: 'text' },
            { key: 'email',     label: 'Email',     type: 'email' },
          ].map(({ key, label, type }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-[#0F172A] dark:text-slate-200 mb-1.5">{label}</label>
              <input
                type={type} value={form[key]}
                onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-[#0F172A] dark:text-slate-200 mb-1.5">Role</label>
            <div className="relative">
              <select
                value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                className="w-full appearance-none px-4 py-2.5 pr-10 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors"
              >
                <option value="administrator">Administrator</option>
                <option value="operator">Traffic Operator</option>
                <option value="analyst">Traffic Analyst</option>
              </select>
              <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
              className={`w-10 h-6 rounded-full transition-colors ${form.is_active ? 'bg-[#2563EB]' : 'bg-[#E2E8F0] dark:bg-slate-700'} cursor-pointer relative`}
            >
              <span className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform shadow ${form.is_active ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm font-medium text-[#0F172A] dark:text-white">Account Active</span>
          </label>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(user.id, form)} disabled={saving}
            className="flex-1 bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</> : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── delete confirm modal ────────────────────────────────────────────── */
function DeleteModal({ user, onConfirm, onClose, deleting }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800 w-full max-w-sm shadow-2xl animate-slide-up p-6 text-center">
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="text-base font-bold text-[#0F172A] dark:text-white mb-2">Delete User?</h3>
        <p className="text-sm text-[#64748B] dark:text-slate-400 mb-6">
          This will permanently delete <strong className="text-[#0F172A] dark:text-white">{user.full_name}</strong>. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-[#E2E8F0] dark:border-slate-700 text-[#64748B] dark:text-slate-400 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            Cancel
          </button>
          <button onClick={() => onConfirm(user.id)} disabled={deleting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {deleting ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Deleting…</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const [users,     setUsers]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [editUser,  setEditUser]  = useState(null);
  const [delUser,   setDelUser]   = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [editErr,   setEditErr]   = useState('');
  const [toast,     setToast]     = useState(null);

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (id, form) => {
    setSaving(true); setEditErr('');
    try {
      const { data } = await updateUser(id, form);
      setUsers(prev => prev.map(u => u.id === id ? data : u));
      setEditUser(null);
      showToast('User updated successfully.');
    } catch (err) {
      setEditErr(err.response?.data?.detail || 'Update failed.');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(true);
    try {
      await deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      setDelUser(null);
      showToast('User deleted.');
    } catch (err) {
      showToast(err.response?.data?.detail || 'Delete failed.', false);
    } finally { setDeleting(false); }
  };

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const breadcrumbs = [{ label: 'Dashboard', href: '/dashboard' }, { label: 'User Management' }];

  return (
    <DashboardLayout breadcrumbs={breadcrumbs}>
      <div className="space-y-6">

        {/* Modals */}
        {editUser && <EditModal user={editUser} onSave={handleSave} onClose={() => { setEditUser(null); setEditErr(''); }} saving={saving} error={editErr} />}
        {delUser  && <DeleteModal user={delUser} onConfirm={handleDelete} onClose={() => setDelUser(null)} deleting={deleting} />}

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium animate-slide-in ${
            toast.ok
              ? 'bg-green-600 text-white border-green-500'
              : 'bg-red-600 text-white border-red-500'
          }`}>
            {toast.ok ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {toast.msg}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] dark:text-white">User Management</h1>
            <p className="text-sm text-[#64748B] dark:text-slate-400 mt-0.5">Administrator access — manage all platform users</p>
          </div>
          <button onClick={load} className="inline-flex items-center gap-2 text-sm font-medium text-[#64748B] dark:text-slate-400 border border-[#E2E8F0] dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Users',     value: users.length,                                           color: 'text-[#2563EB]',  bg: 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10' },
            { label: 'Administrators',  value: users.filter(u => u.role === 'administrator').length,   color: 'text-purple-600', bg: 'border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-900/10' },
            { label: 'Operators',       value: users.filter(u => u.role === 'operator').length,        color: 'text-[#06B6D4]',  bg: 'border-cyan-200 bg-cyan-50 dark:border-cyan-800 dark:bg-cyan-900/10' },
            { label: 'Active Accounts', value: users.filter(u => u.is_active).length,                 color: 'text-[#16A34A]',  bg: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`rounded-2xl border p-5 ${bg}`}>
              <p className={`text-2xl font-bold ${color}`}>{loading ? '…' : value}</p>
              <p className={`text-xs font-semibold mt-1 ${color}`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-[#E2E8F0] dark:border-slate-800">
          {/* Search */}
          <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-slate-800">
            <div className="relative max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search users…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#E2E8F0] dark:border-slate-700 bg-[#F8FAFC] dark:bg-slate-800 text-[#0F172A] dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30 focus:border-[#2563EB] transition-colors placeholder-[#94a3b8]"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead>
                <tr className="border-b border-[#E2E8F0] dark:border-slate-800">
                  {['User', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-[#64748B] dark:text-slate-400 uppercase tracking-wider bg-[#F8FAFC] dark:bg-slate-800/50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-slate-800">
                {loading ? (
                  [1,2,3].map(i => (
                    <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-5 bg-gray-100 dark:bg-slate-800 rounded animate-pulse" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Users className="w-10 h-10 text-gray-300 dark:text-slate-600 mx-auto mb-2" />
                      <p className="text-sm text-[#64748B] dark:text-slate-400">No users found.</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id} className="hover:bg-[#F8FAFC] dark:hover:bg-slate-800/50 transition-colors">
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#06B6D4] flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-white">
                              {u.full_name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-[#0F172A] dark:text-white">{u.full_name}</p>
                            {u.id === currentUser?.id && <p className="text-xs text-[#06B6D4]">You</p>}
                          </div>
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-6 py-4 text-[#64748B] dark:text-slate-400 text-xs">{u.email}</td>
                      {/* Role */}
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${ROLE_STYLE[u.role] || ROLE_STYLE.operator}`}>
                          {u.role}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 text-xs font-semibold w-fit ${u.is_active ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                          <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-400'}`} />
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      {/* Last Login */}
                      <td className="px-6 py-4 text-[#64748B] dark:text-slate-400 text-xs whitespace-nowrap">
                        {u.last_login ? new Date(u.last_login).toLocaleDateString() : 'Never'}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditUser(u)}
                            className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-[#2563EB] transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {u.id !== currentUser?.id && (
                            <button
                              onClick={() => setDelUser(u)}
                              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
