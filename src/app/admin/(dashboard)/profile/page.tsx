/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { 
  User as UserIcon, 
  Mail, 
  Key, 
  ShieldAlert, 
  Camera, 
  Save, 
  Phone, 
  Bell, 
  Globe, 
  Clock, 
  ShieldCheck,
  Smartphone
} from "lucide-react";
import { 
  Field, 
  inputCls, 
  SecretInput,
  Toggle
} from "@/components/admin/settings/SettingsUI";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { AlertModal, ConfirmationModal } from "@/components/ui/Modal";
import { useSession } from "next-auth/react";
import { UserAvatar } from "@/components/admin/UserAvatar";
import { formatDate } from "@/lib/utils";
import TwoFactorSetupModal from "@/components/admin/TwoFactorSetupModal";

export default function AdminProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    bio: "",
    phone: "",
    image: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    preferences: {
      notifications: true,
      marketing: false
    }
  });

  const [alert, setAlert] = useState<{ title: string; message: string; isOpen: boolean; variant: "success" | "error" | "info" }>({ 
    title: "", message: "", isOpen: false, variant: "info" 
  });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const showAlert = (title: string, message: string, variant: "success" | "error" | "info" = "info") => {
    setAlert({ title, message, isOpen: true, variant });
  };

  const fetchProfile = async () => {
    const r = await fetch("/api/users/profile");
    const data = await r.json();
    if (data.success) {
      setUser(data.data);
      setForm(prev => ({
        ...prev,
        name: data.data.name || "",
        email: data.data.email || "",
        bio: data.data.bio || "",
        phone: data.data.phone || "",
        image: data.data.image || "",
        preferences: data.data.preferences || { notifications: true, marketing: false }
      }));
    }
  };

  useEffect(() => {
    fetchProfile().then(() => setIsLoading(false));
  }, []);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showAlert("Error", "Image too large. Max 2MB allowed.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setForm(prev => ({ ...prev, image: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: form.name, 
          email: form.email,
          bio: form.bio,
          phone: form.phone,
          image: form.image,
          preferences: form.preferences
        })
      });
      const data = await res.json();
      if (data.success) {
        setUser(data.data);
        await updateSession({ 
          name: form.name, 
          email: form.email,
          image: data.data.image 
        });
        showAlert("Success", "Profile updated successfully", "success");
      } else {
        showAlert("Error", data.error || "Failed to update profile", "error");
      }
    } catch (err) {
      showAlert("Error", "An unexpected error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      showAlert("Error", "Passwords do not match", "error");
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/users/profile/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          currentPassword: form.currentPassword, 
          newPassword: form.newPassword 
        })
      });
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, currentPassword: "", newPassword: "", confirmPassword: "" }));
        showAlert("Success", "Password changed successfully", "success");
      } else {
        showAlert("Error", data.error || "Failed to change password", "error");
      }
    } catch (err) {
      showAlert("Error", "An unexpected error occurred", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("/api/users/profile", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        window.location.href = "/admin/signout";
      } else {
        showAlert("Error", data.error || "Failed to delete account", "error");
      }
    } catch (err) {
      showAlert("Error", "An unexpected error occurred", "error");
    }
  };

  const handleDisable2FA = async () => {
    try {
      const res = await fetch("/api/admin/2fa/verify", { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showAlert("Shield Down", "Two-Factor Authentication has been disabled.", "info");
        fetchProfile();
      }
    } catch (err) {
      showAlert("Error", "Failed to disable 2FA", "error");
    }
  };

  if (isLoading) return <div className="py-20 text-center"><Spinner /></div>;

  return (
    <div className="max-w-5xl space-y-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Admin <span className="text-amber-500">Command Center</span></h2>
          <p className="text-muted-foreground mt-2">Personalize your identity and optimize your administrative experience.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-24">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 text-center space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />
            
            <div className="relative inline-block">
              <UserAvatar 
                name={user?.name} 
                image={form.image || user?.image} 
                size="lg" 
                className="ring-4 ring-background shadow-2xl"
              />
              <label className="absolute -bottom-2 -right-2 p-3 bg-amber-500 text-black rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer">
                <Camera size={18} />
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black">{user?.name}</h3>
              <p className="text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em]">{user?.role?.replace('_', ' ')}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="text-left space-y-1">
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Events</p>
                <p className="text-xl font-black text-amber-500">{user?.managedEvents?.length || 0}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest opacity-60">Status</p>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-bold text-foreground">Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2rem] p-6 space-y-4">
            <div className="flex items-center gap-3 text-muted-foreground mb-4">
              <Clock size={16} />
              <h4 className="text-[10px] font-black uppercase tracking-widest">Account Activity</h4>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Member Since</span>
                <span className="font-bold">{formatDate(user?.createdAt)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Last Login</span>
                <span className="font-bold">{user?.lastLogin ? formatDate(user.lastLogin) : "Today"}</span>
              </div>
            </div>
          </div>

          <div className="bg-red-500/5 border border-red-500/10 rounded-[2rem] p-8 space-y-4">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert size={18} />
              <h4 className="text-sm font-bold uppercase tracking-tight">Danger Zone</h4>
            </div>
            <p className="text-[11px] text-red-500/60 leading-relaxed italic">Deleting your account will permanently remove all event associations and administrative access.</p>
            <Button 
              onClick={() => setIsDeleteModalOpen(true)}
              variant="danger"
              className="w-full py-3 text-[10px]"
            >
              Terminate Account
            </Button>
          </div>
        </div>

        {/* Main Forms & History */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Info */}
          <form onSubmit={handleUpdateProfile} className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8 relative overflow-hidden">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <UserIcon size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Identity & Reach</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">Manage your public administrative profile</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Field label="Display Name">
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
                  <input 
                    type="text" 
                    value={form.name} 
                    onChange={e => setForm({ ...form, name: e.target.value })} 
                    className={`${inputCls()} pl-10`} 
                    required 
                  />
                </div>
              </Field>
              <Field label="Direct Email">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
                  <input 
                    type="email" 
                    value={form.email} 
                    onChange={e => setForm({ ...form, email: e.target.value })} 
                    className={`${inputCls()} pl-10`} 
                    required 
                  />
                </div>
              </Field>
              <div className="md:col-span-2">
                <Field label="Phone Number" hint="Used for emergency event coordination">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={16} />
                    <input 
                      type="tel" 
                      value={form.phone} 
                      onChange={e => setForm({ ...form, phone: e.target.value })} 
                      className={`${inputCls()} pl-10`} 
                      placeholder="+234 000 000 0000"
                    />
                  </div>
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Professional Bio" hint="Brief overview of your role or credentials (max 200 chars)">
                  <textarea 
                    value={form.bio} 
                    onChange={e => setForm({ ...form, bio: e.target.value.slice(0, 200) })} 
                    className={`${inputCls()} h-32 py-4 resize-none`} 
                    placeholder="Tell us about your administrative role..."
                  />
                  <p className="text-[9px] text-right text-muted-foreground mt-1 font-mono uppercase opacity-40">{form.bio.length}/200</p>
                </Field>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                isLoading={isSaving}
                variant="primary"
                size="lg"
                leftIcon={<Save size={16} />}
              >
                Update Profile
              </Button>
            </div>
          </form>

          {/* Managed Events History */}
          <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                <Globe size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Event History</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">Catalogue of events managed by you</p>
              </div>
            </div>

            <div className="space-y-4">
              {user?.managedEvents && user.managedEvents.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.managedEvents.map((event: any) => (
                    <div key={event._id} className="p-4 bg-muted/20 border border-border rounded-2xl hover:border-amber-500/50 transition-all group/event">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${event.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {event.status}
                        </span>
                        <span className="text-[10px] font-mono text-muted-foreground">{formatDate(event.date)}</span>
                      </div>
                      <h4 className="font-bold text-sm group-hover/event:text-amber-500 transition-colors">{event.name}</h4>
                      <p className="text-[10px] text-muted-foreground mt-1">/{event.slug}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center bg-muted/10 rounded-3xl border border-dashed border-border">
                  <p className="text-xs text-muted-foreground italic">No events managed yet.</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Bell size={20} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Communications</h3>
              </div>
              <div className="space-y-4">
                <Toggle 
                  label="Email Notifications" 
                  checked={form.preferences.notifications} 
                  onChange={v => setForm({ ...form, preferences: { ...form.preferences, notifications: v } })} 
                />
                <Toggle 
                  label="Platform Updates" 
                  checked={form.preferences.marketing} 
                  onChange={v => setForm({ ...form, preferences: { ...form.preferences, marketing: v } })} 
                />
              </div>
            </div>
            <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">Trust & Security</h3>
              </div>
              <div className="space-y-4">
                <div className="flex flex-col gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Smartphone size={16} className="text-muted-foreground" />
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Two-Factor Auth</span>
                    </div>
                    <span className={`px-2 py-0.5 text-[8px] font-black rounded-full uppercase tracking-tighter ${user?.twoFactorEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {user?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  
                  {user?.twoFactorEnabled ? (
                    <button 
                      onClick={handleDisable2FA}
                      className="text-[10px] font-black uppercase tracking-widest text-red-500 text-left hover:opacity-80 transition-all"
                    >
                      Disable Security Layer
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIs2FAModalOpen(true)}
                      className="text-[10px] font-black uppercase tracking-widest text-amber-500 text-left hover:opacity-80 transition-all"
                    >
                      Configure Shield
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="bg-card border border-border rounded-[2.5rem] p-8 space-y-8">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-violet-500/10 flex items-center justify-center text-violet-400">
                <Key size={20} />
              </div>
              <div>
                <h3 className="text-xl font-black uppercase tracking-tight">Security Credentials</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">Update your access key periodically</p>
              </div>
            </div>
            <div className="space-y-8">
              <Field label="Current Password">
                <SecretInput 
                  name="currentPassword" 
                  value={form.currentPassword} 
                  onChange={e => setForm({ ...form, currentPassword: e.target.value })} 
                />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border/50">
                <Field label="New Secure Password">
                  <SecretInput 
                    name="newPassword" 
                    value={form.newPassword} 
                    onChange={e => setForm({ ...form, newPassword: e.target.value })} 
                  />
                </Field>
                <Field label="Confirm New Password">
                  <SecretInput 
                    name="confirmPassword" 
                    value={form.confirmPassword} 
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })} 
                  />
                </Field>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button 
                type="submit" 
                disabled={!form.currentPassword || !form.newPassword}
                isLoading={isSaving}
                variant="secondary"
                size="lg"
              >
                Sync Security Key
              </Button>
            </div>
          </form>
        </div>
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
      />
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Account Termination"
        message="This action is irreversible. All administrative privileges will be revoked and your data will be purged according to Vestry retention policies."
        confirmText="Terminate Account"
        variant="danger"
      />
      <TwoFactorSetupModal 
        isOpen={is2FAModalOpen} 
        onClose={() => setIs2FAModalOpen(false)} 
        onSuccess={() => {
          showAlert("Shield Active", "Two-Factor Authentication is now protecting your account.", "success");
          fetchProfile();
        }}
      />
    </div>
  );
}
