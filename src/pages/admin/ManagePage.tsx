import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Trash2, Edit2, X, ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { cn, formatDuration } from '../../lib/utils';

type Item = { id: string; [key: string]: any };

type ManagePageProps = {
  table: string;
  title: string;
  columns: { key: string; label: string; render?: (item: Item) => React.ReactNode }[];
  searchFields: string[];
  pageSize?: number;
  uploadLabel?: string;
  uploadFields?: { key: string; label: string; type?: string }[];
};

export function ManagePage({ table, title, columns, searchFields, pageSize = 10, uploadLabel, uploadFields }: ManagePageProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [filtered, setFiltered] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Item | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from(table).select('*').order('created_at', { ascending: false });
    setItems((data || []) as Item[]);
    setLoading(false);
  }, [table]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!search) { setFiltered(items); return; }
    const q = search.toLowerCase();
    setFiltered(items.filter((item) => searchFields.some((f) => String(item[f] || '').toLowerCase().includes(q))));
    setPage(0);
  }, [search, items]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const pageItems = filtered.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSelect = (id: string) => {
    const newSel = new Set(selected);
    if (newSel.has(id)) newSel.delete(id); else newSel.add(id);
    setSelected(newSel);
  };

  const toggleSelectAll = () => {
    if (selected.size === pageItems.length) setSelected(new Set());
    else setSelected(new Set(pageItems.map((i) => i.id)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    await supabase.from(table).delete().eq('id', id);
    load();
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} items?`)) return;
    await supabase.from(table).delete().in('id', Array.from(selected));
    setSelected(new Set());
    load();
  };

  const handleSave = async (data: Record<string, any>) => {
    setSaving(true);
    if (editing) {
      await supabase.from(table).update(data).eq('id', editing.id);
    } else {
      await supabase.from(table).insert(data);
    }
    setSaving(false);
    setEditing(null);
    setShowAdd(false);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-extrabold">{title}</h1>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <button onClick={handleBulkDelete} className="flex items-center gap-2 bg-red-500/20 text-red-400 rounded-lg px-3 py-2 text-sm font-semibold hover:bg-red-500/30">
              <Trash2 className="w-4 h-4" /> Delete {selected.size}
            </button>
          )}
          {uploadLabel && uploadFields && (
            <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-accent text-black rounded-lg px-4 py-2 text-sm font-bold hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" /> {uploadLabel}
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." className="w-full bg-base-card border border-white/10 rounded-lg pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
      </div>

      {/* Table */}
      <div className="bg-base-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="p-3 w-10">
                  <input type="checkbox" checked={selected.size === pageItems.length && pageItems.length > 0} onChange={toggleSelectAll} className="accent-accent" />
                </th>
                {columns.map((c) => (
                  <th key={c.key} className="text-left p-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">{c.label}</th>
                ))}
                <th className="p-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={columns.length + 2} className="text-center py-8 text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></td></tr>
              ) : pageItems.length === 0 ? (
                <tr><td colSpan={columns.length + 2} className="text-center py-8 text-gray-400">No items found</td></tr>
              ) : (
                pageItems.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="p-3">
                      <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggleSelect(item.id)} className="accent-accent" />
                    </td>
                    {columns.map((c) => (
                      <td key={c.key} className="p-3 text-sm">
                        {c.render ? c.render(item) : String(item[c.key] || '—')}
                      </td>
                    ))}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditing(item)} className="text-gray-400 hover:text-white"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-white/5">
            <p className="text-sm text-gray-400">{filtered.length} items · Page {page + 1} of {totalPages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center disabled:opacity-30 hover:bg-white/10">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setPage(Math.min(totalPages - 1, page + 1))} disabled={page >= totalPages - 1} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center disabled:opacity-30 hover:bg-white/10">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Edit/Add modal */}
      <AnimatePresence>
        {(editing || showAdd) && (
          <EditModal
            item={editing}
            fields={uploadFields || []}
            columns={columns}
            onClose={() => { setEditing(null); setShowAdd(false); }}
            onSave={handleSave}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EditModal({ item, fields, columns, onClose, onSave, saving }: {
  item: Item | null;
  fields: { key: string; label: string; type?: string }[];
  columns: { key: string; label: string }[];
  onClose: () => void;
  onSave: (data: Record<string, any>) => void;
  saving: boolean;
}) {
  const [data, setData] = useState<Record<string, any>>(item || {});

  // Build fields from columns if no explicit fields
  const allFields = fields.length > 0 ? fields : columns.filter((c) => c.key !== 'id' && c.key !== 'created_at').map((c) => ({ key: c.key, label: c.label, type: c.key.includes('date') ? 'date' : 'text' }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-base-elevated rounded-2xl w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">{item ? 'Edit' : 'Add New'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="space-y-4">
          {allFields.map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">{f.label}</label>
              {f.type === 'textarea' ? (
                <textarea value={data[f.key] || ''} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} rows={3} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent resize-none" />
              ) : (
                <input type={f.type || 'text'} value={data[f.key] || ''} onChange={(e) => setData({ ...data, [f.key]: e.target.value })} className="w-full bg-base-bg border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-accent" />
              )}
            </div>
          ))}
          <button onClick={() => onSave(data)} disabled={saving} className="btn-accent flex items-center gap-2 disabled:opacity-50">
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {item ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
