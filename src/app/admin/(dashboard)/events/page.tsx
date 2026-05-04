/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, Settings, ExternalLink, Shield, Trash2, Edit2, ChevronDown, Clock, CheckCircle2, XCircle, Search, Filter, SortDesc, SortAsc, Maximize2, Minimize2 } from "lucide-react";
// Localizing styles to avoid cross-component dependency issues
import Link from "next/link";
import { AlertModal, ConfirmationModal } from "@/components/ui/Modal";
import { useHistory } from "@/components/providers/HistoryProvider";
import { Interactive } from "@/components/ui/Boop";
import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SimpleInput } from "@/components/ui/Input";

/* ── Status Dropdown Component ───────────────────────────────────────────── */

function StatusDropdown({ status, onStatusChange }: { status: string; onStatusChange: (s: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-2 transition-all cursor-pointer group active:scale-95
          ${status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${status === 'OPEN' ? 'bg-emerald-500' : 'bg-red-500'} animate-pulse`} />
        {status}
        <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-32 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95">
            <button
              onClick={() => { onStatusChange('OPEN'); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted text-left text-[10px] font-black uppercase tracking-widest text-emerald-500"
            >
              <CheckCircle2 size={14} /> Open
            </button>
            <button
              onClick={() => { onStatusChange('CLOSED'); setIsOpen(false); }}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-muted text-left text-[10px] font-black uppercase tracking-widest text-red-500"
            >
              <XCircle size={14} /> Close
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Event Card Component ────────────────────────────────────────────────── */

function EventCard({ event, onEdit, onDelete, onStatusChange }: {
  event: any;
  onEdit: (e: any) => void;
  onDelete: (e: any) => void;
  onStatusChange: (id: string, s: string) => void;
}) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <motion.div
      layout
      initial={false}
      animate={{ height: isMinimized ? 92 : "auto" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onClick={() => isMinimized && setIsMinimized(false)}
      className={`bg-card border border-border rounded-[2.5rem] p-6 hover:border-amber-500/50 transition-colors group relative overflow-hidden flex flex-col
        ${isMinimized ? 'cursor-pointer hover:bg-muted/10' : 'cursor-default'}`}
    >
      {/* Background Decoration */}
      <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl opacity-10 -mr-8 -mt-8 rounded-full ${event.status === 'OPEN' ? 'bg-emerald-500' : 'bg-red-500'}`} />

      <div className={`flex justify-between items-center ${isMinimized ? 'mb-0' : 'mb-4'}`}>
        <div className="flex items-center gap-3">
          <Interactive>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
              <Calendar size={20} />
            </div>
          </Interactive>
          {isMinimized && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="duration-300"
            >
              <h4 className="text-sm font-bold truncate group-hover:text-amber-500 transition-colors max-w-[120px]">{event.name}</h4>
              <p className="text-[10px] text-muted-foreground/60 font-mono">/{event.slug}</p>
            </motion.div>
          )}
        </div>

        <div className="flex items-center gap-2 relative z-20">
          {!isMinimized && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(event); }}
                className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-all cursor-pointer active:scale-90"
                title="Edit Event"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(event); }}
                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-all cursor-pointer active:scale-90"
                title="Delete Event"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}

          <div onClick={(e) => e.stopPropagation()}>
            <StatusDropdown
              status={event.status}
              onStatusChange={(s) => onStatusChange(event._id, s)}
            />
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            className="p-2 hover:bg-muted text-muted-foreground rounded-lg transition-all cursor-pointer ml-1 active:scale-90 flex items-center justify-center"
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <h4 className="text-xl font-bold mb-1 truncate group-hover:text-amber-500 transition-colors">{event.name}</h4>
            <p className="text-xs text-muted-foreground font-mono mb-4">/event/{event.slug}</p>

            {event.createdAt && (
              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest mb-6">
                <Clock size={10} />
                Created {new Date(event.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            )}

            <div className="flex gap-2 pt-4 border-t border-border">
              <Button
                asChild
                variant="outline"
                className="flex-1 py-2.5 rounded-xl text-[10px] bg-muted/50 border-transparent"
                leftIcon={<Settings size={14} />}
              >
                <Link href={`/admin/settings?eventId=${event._id}`}>Config</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 py-2.5 rounded-xl text-[10px] bg-muted/50 border-transparent"
                leftIcon={<Shield size={14} />}
              >
                <Link href={`/admin?eventId=${event._id}`}>Board</Link>
              </Button>
            </div>

            <a
              href={`/event/${event.slug}/register`}
              target="_blank"
              className="mt-3 w-full py-2 text-amber-500 hover:text-amber-400 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer border border-transparent hover:border-amber-500/10 rounded-lg transition-all"
            >
              Live Preview <ExternalLink size={10} />
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function EventsManagementPage() {
  const router = useRouter();
  const { clearEventHistory } = useHistory();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deletingEvent, setDeletingEvent] = useState<any>(null);
  const [newForm, setNewForm] = useState({ name: "", slug: "" });
  const [alert, setAlert] = useState<{ title: string; message: string; isOpen: boolean; variant: "success" | "error" | "info" }>({ title: "", message: "", isOpen: false, variant: "info" });

  // Filtering States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "OPEN" | "CLOSED">("ALL");
  const [sortBy, setSortBy] = useState<"NEWEST" | "OLDEST">("NEWEST");

  const showAlert = (title: string, message: string, variant: "success" | "error" | "info" = "info") => {
    setAlert({ title, message, isOpen: true, variant });
  };

  const filteredEvents = useMemo(() => {
    let result = [...events];

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(ev =>
        ev.name.toLowerCase().includes(term) ||
        ev.slug.toLowerCase().includes(term)
      );
    }

    // Status filter
    if (statusFilter !== "ALL") {
      result = result.filter(ev => ev.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === "NEWEST" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [events, searchTerm, statusFilter, sortBy]);

  useEffect(() => {
    fetch("/api/events")
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setEvents(data.data);
        } else {
          setEvents([]);
        }
        setIsLoading(false);
      });
  }, []);

  const capitalizeName = (val: string) => {
    return val.replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const sanitizeSlug = (val: string) => {
    return val
      .toLowerCase()
      .replace(/\s+/g, "-")           // Replace spaces with -
      .replace(/[^a-z0-9-]/g, "")     // Remove non-alphanumeric/non-hyphen characters
      .replace(/-+/g, "-");           // Collapse multiple hyphens
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newForm, status: "OPEN" })
    });
    const data = await res.json();
    if (data.success) {
      setEvents([data.data, ...events]);
      setIsAdding(false);
      setNewForm({ name: "", slug: "" });
      router.refresh();
    } else {
      showAlert("Error", data.error || "Failed to create event", "error");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || !editingEvent._id) return;
    const res = await fetch(`/api/events/${editingEvent._id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingEvent.name, slug: editingEvent.slug })
    });
    const data = await res.json();
    if (data.success) {
      const updatedId = editingEvent._id;
      setEvents(prev => prev.map(ev => (ev && ev._id === updatedId) ? data.data : ev));
      setEditingEvent(null);
      showAlert("Success", "Event updated successfully", "success");
    } else {
      showAlert("Error", data.error || "Failed to update event", "error");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/events/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setEvents(prev => prev.map(ev => ev._id === id ? data.data : ev));
      } else {
        showAlert("Error", data.error || "Failed to update status", "error");
      }
    } catch (err) {
      showAlert("Error", "Network error updating status", "error");
    }
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;
    const eventId = deletingEvent._id;
    const res = await fetch(`/api/events/${eventId}`, {
      method: "DELETE"
    });
    const data = await res.json();
    if (data.success) {
      setEvents(events.filter(ev => ev && ev._id !== eventId));
      clearEventHistory(eventId);
      setDeletingEvent(null);
      showAlert("Success", "Event deleted successfully", "success");
      router.refresh();
    } else {
      showAlert("Error", data.error || "Failed to delete event", "error");
    }
  };

  if (isLoading) return <div className="py-20 text-center"><Button variant="ghost" isLoading /></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black">Manage <span className="text-amber-500">Events</span></h2>
          <p className="text-muted-foreground">Create and configure event instances.</p>
        </div>
        <Button
          onClick={() => setIsAdding(!isAdding)}
          variant="primary"
          size="lg"
          leftIcon={<Plus size={20} />}
        >
          Create New Event
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-card/50 border border-border p-4 rounded-[2rem] backdrop-blur-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <SimpleInput
            type="text"
            placeholder="Search by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-4 py-3"
          />
        </div>

        <div className="flex items-center gap-2 bg-muted/20 p-1.5 rounded-2xl border border-border w-full md:w-auto overflow-x-auto">
          {(['ALL', 'OPEN', 'CLOSED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer whitespace-nowrap
                ${statusFilter === s ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-muted/20 p-1.5 rounded-2xl border border-border w-full md:w-auto">
          <Button
            onClick={() => setSortBy(sortBy === "NEWEST" ? "OLDEST" : "NEWEST")}
            variant="ghost"
            className="px-4 py-2 text-[10px] w-full md:w-auto"
            leftIcon={sortBy === "NEWEST" ? <SortDesc size={14} /> : <SortAsc size={14} />}
          >
            {sortBy}
          </Button>
        </div>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-card border border-border rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg">New Event Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase mb-1 block">Event Name</label>
              <SimpleInput
                type="text"
                value={newForm.name}
                onChange={e => setNewForm({ ...newForm, name: capitalizeName(e.target.value) })}
                placeholder="e.g. 2026 Singles Week"
                required
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase mb-1 block">Slug (URL Path)</label>
              <SimpleInput
                type="text"
                value={newForm.slug}
                onChange={e => setNewForm({ ...newForm, slug: sanitizeSlug(e.target.value) })}
                placeholder="e.g. singles-2026"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" onClick={() => setIsAdding(false)} variant="ghost">Cancel</Button>
            <Button
              type="submit"
              disabled={!newForm.name || !newForm.slug}
              variant="primary"
            >
              Create Event
            </Button>
          </div>
        </form>
      )}

      {editingEvent && (
        <form onSubmit={handleUpdate} className="bg-card border border-amber-500/50 rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-4">
          <h3 className="font-bold text-lg">Edit Event Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black uppercase mb-1 block">Event Name</label>
              <SimpleInput
                type="text"
                value={editingEvent.name}
                onChange={e => setEditingEvent({ ...editingEvent, name: capitalizeName(e.target.value) })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-black uppercase mb-1 block">Slug (URL Path)</label>
              <SimpleInput
                type="text"
                value={editingEvent.slug}
                onChange={e => setEditingEvent({ ...editingEvent, slug: sanitizeSlug(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" onClick={() => setEditingEvent(null)} variant="ghost">Cancel</Button>
            <Button
              type="submit"
              disabled={!editingEvent.name || !editingEvent.slug}
              variant="primary"
            >
              Update Event
            </Button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.length > 0 ? (
          filteredEvents.map((event: any) => (
            <EventCard
              key={event._id}
              event={event}
              onEdit={setEditingEvent}
              onDelete={setDeletingEvent}
              onStatusChange={handleStatusChange}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-muted/10 rounded-[3rem] border border-dashed border-border">
            <Search className="mx-auto mb-4 text-muted-foreground opacity-20" size={48} />
            <h3 className="text-xl font-bold">No events found</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
            <Button
              onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
              variant="ghost"
              className="mt-4"
            >
              Clear all filters
            </Button>
          </div>
        )}
      </div>

      <AlertModal
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        title={alert.title}
        message={alert.message}
        variant={alert.variant}
      />

      <ConfirmationModal
        isOpen={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDelete}
        title="Delete Event?"
        message={deletingEvent ? `Are you sure you want to delete "${deletingEvent.name}"? This will delete all products, inventory, and registrations associated with this event. This action is IRREVERSIBLE.` : ""}
        confirmText="Delete Event"
        variant="danger"
      />
    </div>
  );
}
