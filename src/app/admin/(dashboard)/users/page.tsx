/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Plus, User, Trash2, Key, Loader } from "lucide-react";
import { inputCls } from "@/components/admin/settings/SettingsUI";
import { AlertModal } from "@/components/ui/Modal";

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newForm, setNewForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "EVENT_ADMIN",
    managedEvents: [] as string[]
  });
  const [alert, setAlert] = useState<{ title: string; message: string; isOpen: boolean; variant: "success" | "error" | "info" }>({ title: "", message: "", isOpen: false, variant: "info" });

  const showAlert = (title: string, message: string, variant: "success" | "error" | "info" = "info") => {
    setAlert({ title, message, isOpen: true, variant });
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/users").then(r => r.json()),
      fetch("/api/events").then(r => r.json())
    ]).then(([userData, eventData]) => {
      if (userData.success) setUsers(userData.data);
      if (eventData.success) setEvents(eventData.data);
      setIsLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newForm)
    });
    const data = await res.json();
    if (data.success) {
      setUsers([data.data, ...users]);
      setIsAdding(false);
      setNewForm({ name: "", email: "", password: "", role: "EVENT_ADMIN", managedEvents: [] });
    } else {
      showAlert("Error", data.error || "Failed to create user", "error");
    }
  };

  const toggleEvent = (eventId: string) => {
    setNewForm(prev => ({
      ...prev,
      managedEvents: prev.managedEvents.includes(eventId)
        ? prev.managedEvents.filter(id => id !== eventId)
        : [...prev.managedEvents, eventId]
    }));
  };

  if (isLoading) return <div className="py-20 text-center"><Loader /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black">Manage <span className="text-amber-500">Admins</span></h2>
          <p className="text-muted-foreground">Assign roles and managed events to administrators.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="px-6 py-3 bg-amber-500 text-black font-bold rounded-2xl flex items-center gap-2 hover:bg-amber-400 transition-all"
        >
          <Plus size={20} /> Create New Admin
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-card border border-border rounded-3xl p-8 space-y-6 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
          <h3 className="font-black text-xl uppercase tracking-widest">Add New Administrator</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Full Name</label>
                <input type="text" value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })} className={inputCls()} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Email Address</label>
                <input type="email" value={newForm.email} onChange={e => setNewForm({ ...newForm, email: e.target.value })} className={inputCls()} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Password</label>
                <input type="password" value={newForm.password} onChange={e => setNewForm({ ...newForm, password: e.target.value })} className={inputCls()} required />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Role</label>
                <select 
                  value={newForm.role} 
                  onChange={e => setNewForm({ ...newForm, role: e.target.value })}
                  className="w-full bg-background border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="EVENT_ADMIN">Event Admin</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1 block">Assigned Events</label>
              <div className="bg-background/50 border border-border rounded-2xl p-4 max-h-[250px] overflow-y-auto space-y-2">
                {events.map(event => (
                  <label key={event._id} className="flex items-center gap-3 p-2 hover:bg-muted rounded-xl cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      checked={newForm.managedEvents.includes(event._id)} 
                      onChange={() => toggleEvent(event._id)}
                      className="w-4 h-4 rounded border-border text-amber-500 focus:ring-amber-500/20"
                    />
                    <span className="text-sm font-bold">{event.name}</span>
                  </label>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground italic">Super Admins have access to all events automatically.</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button type="button" onClick={() => setIsAdding(false)} className="px-6 py-2 text-sm font-bold opacity-60 hover:opacity-100">Cancel</button>
            <button type="submit" className="px-8 py-3 bg-foreground text-background rounded-2xl font-black uppercase tracking-widest text-xs">Create Admin</button>
          </div>
        </form>
      )}

      <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Role</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Managed Events</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map(user => (
              <tr key={user._id} className="hover:bg-muted/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                      <User size={14} />
                    </div>
                    <span className="font-bold text-sm">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-md text-[9px] font-black tracking-widest ${user.role === 'SUPER_ADMIN' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {user.role === 'SUPER_ADMIN' ? (
                    <span className="text-xs font-medium text-emerald-500">All Events</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {user.managedEvents?.length > 0 ? user.managedEvents.map((e: any) => (
                        <span key={e._id} className="px-2 py-0.5 bg-muted rounded-full text-[10px] font-bold border border-border">
                          {e.name}
                        </span>
                      )) : <span className="text-xs text-muted-foreground/40 italic">None</span>}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-amber-500/10 hover:text-amber-500 rounded-lg transition-all" title="Reset Password">
                      <Key size={16} />
                    </button>
                    <button className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all" title="Delete User">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
      />
    </div>
  );
}
