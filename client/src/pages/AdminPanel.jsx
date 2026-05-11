import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, Mail, Shield, ShieldAlert, Loader2 } from 'lucide-react';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/tasks/users');
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-brand-primary" size={40} />
    </div>
  );

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Team Management</h1>
        <p className="text-slate-400 text-lg">Manage your team members and their roles.</p>
      </div>

      <div className="glass rounded-3xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Member</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Email</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300">Role</th>
              <th className="px-6 py-4 text-sm font-semibold text-slate-300 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary/20 flex items-center justify-center text-brand-primary font-bold">
                      {u.name[0]}
                    </div>
                    <span className="font-medium text-white">{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Mail size={14} />
                    <span className="text-sm">{u.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    {u.role === 'Admin' ? (
                      <span className="flex items-center space-x-1 bg-amber-500/10 text-amber-500 px-2 py-1 rounded-lg text-xs font-bold border border-amber-500/20">
                        <Shield size={12} />
                        <span>ADMIN</span>
                      </span>
                    ) : (
                      <span className="flex items-center space-x-1 bg-blue-500/10 text-blue-500 px-2 py-1 rounded-lg text-xs font-bold border border-blue-500/20">
                        <Users size={12} />
                        <span>MEMBER</span>
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                    <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">Active</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
