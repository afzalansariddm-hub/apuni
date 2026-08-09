import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Check,
  Pencil,
  Plus,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { getCategoryAvatar, getInitials } from "../categoryColors";
import type { Provider, ProviderFormData } from "../types";

interface AdminProvidersScreenProps {
  providers: Provider[];
  categories: string[];
  towns: string[];
  onAdd: (data: ProviderFormData) => void | Promise<void>;
  onUpdate: (id: string, data: ProviderFormData) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  onToggleVerified: (id: string) => void | Promise<void>;
}

function emptyForm(categories: string[], towns: string[]): ProviderFormData {
  return {
    name: "",
    phone: "",
    category: categories[0] ?? "",
    town: towns[0] ?? "",
    description: "",
    verified: false,
  };
}

function StatusBadge({ verified }: { verified: boolean }) {
  if (verified) {
    return (
      <span className="badge verified">
        <ShieldCheck size={10} />
        Verified
      </span>
    );
  }
  return <span className="badge pending">Pending</span>;
}

export default function AdminProvidersScreen({
  providers,
  categories,
  towns,
  onAdd,
  onUpdate,
  onDelete,
  onToggleVerified,
}: AdminProvidersScreenProps) {
  const [form, setForm] = useState<ProviderFormData>(() =>
    emptyForm(categories, towns),
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [overlayEl, setOverlayEl] = useState<Element | null>(null);

  useEffect(() => {
    setOverlayEl(document.getElementById("app-overlays"));
  }, []);

  const openAddSheet = () => {
    setEditingId(null);
    setForm(emptyForm(categories, towns));
    setSheetOpen(true);
  };

  const startEdit = (p: Provider) => {
    setEditingId(p.id);
    setForm({
      name: p.name,
      phone: p.phone,
      category: p.category,
      town: p.town,
      description: p.description,
      verified: p.verified,
    });
    setExpandedId(null);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingId(null);
    setForm(emptyForm(categories, towns));
  };

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    try {
      if (editingId) await onUpdate(editingId, form);
      else await onAdd(form);
      closeSheet();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Save failed");
    }
  };

  const overlays =
    overlayEl &&
    createPortal(
      <>
        <button
          type="button"
          className={sheetOpen ? "fab hidden" : "fab"}
          aria-label="Add provider"
          onClick={openAddSheet}
        >
          <Plus size={26} strokeWidth={2.25} />
        </button>

        <div
          className={sheetOpen ? "sheet-backdrop open" : "sheet-backdrop"}
          onClick={closeSheet}
          aria-hidden={!sheetOpen}
        />

        <div
          className={sheetOpen ? "sheet open" : "sheet"}
          role="dialog"
          aria-modal="true"
          aria-labelledby="sheet-title"
          aria-hidden={!sheetOpen}
        >
          <div className="sheet-handle" />
          <div className="sheet-header">
            <h2 id="sheet-title" className="sheet-title">
              {editingId ? "Edit provider" : "Add provider"}
            </h2>
            <button
              type="button"
              className="sheet-close"
              aria-label="Close"
              onClick={closeSheet}
            >
              <X size={16} />
            </button>
          </div>
          <div className="sheet-body">
            <div className="field">
              <label htmlFor="provider-name">Full name</label>
              <input
                id="provider-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Dilip Gogoi"
              />
            </div>
            <div className="field">
              <label htmlFor="provider-phone">Phone number</label>
              <input
                id="provider-phone"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="10-digit mobile number"
                inputMode="tel"
              />
            </div>
            <div className="field">
              <label htmlFor="provider-category">Category</label>
              <select
                id="provider-category"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="provider-town">Town</label>
              <select
                id="provider-town"
                value={form.town}
                onChange={(e) => setForm({ ...form, town: e.target.value })}
              >
                {towns.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="provider-description">Description</label>
              <input
                id="provider-description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Short note on experience or specialty"
              />
            </div>
            <div className="check-row">
              <input
                type="checkbox"
                id="kyc"
                checked={form.verified}
                onChange={(e) =>
                  setForm({ ...form, verified: e.target.checked })
                }
              />
              <label htmlFor="kyc">KYC verified — visible to public</label>
            </div>
            <div className="sheet-actions">
              <button type="button" className="btn-primary" onClick={submit}>
                {editingId ? (
                  <>
                    <Check size={16} /> Save changes
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Add provider
                  </>
                )}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={closeSheet}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      </>,
      overlayEl,
    );

  return (
    <div className="view-pane">
      <div className="admin-heading">All providers ({providers.length})</div>

      <div className="provider-list">
        {providers.map((p) => {
          const tint = getCategoryAvatar(p.category);
          const expanded = expandedId === p.id;
          return (
            <article
              key={p.id}
              className={
                expanded
                  ? "provider-card admin-card expanded"
                  : "provider-card admin-card"
              }
              onClick={() =>
                setExpandedId((prev) => (prev === p.id ? null : p.id))
              }
            >
              <div
                className="avatar"
                style={{ background: tint.bg, color: tint.fg }}
              >
                {getInitials(p.name)}
              </div>

              <div className="card-body">
                <h3 className="card-name">{p.name}</h3>
                <p className="card-meta">
                  {p.category} · {p.town}
                </p>
                <p className="card-meta">{p.phone}</p>
                <button
                  type="button"
                  className="badge-btn"
                  title="Toggle verified status"
                  onClick={async (e) => {
                    e.stopPropagation();
                    try {
                      await onToggleVerified(p.id);
                    } catch (err) {
                      window.alert(
                        err instanceof Error ? err.message : "Update failed",
                      );
                    }
                  }}
                >
                  <StatusBadge verified={p.verified} />
                </button>
              </div>

              <div
                className="card-actions-reveal"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  className="icon-btn edit"
                  title="Edit"
                  aria-label={`Edit ${p.name}`}
                  onClick={() => startEdit(p)}
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className="icon-btn delete"
                  title="Delete"
                  aria-label={`Delete ${p.name}`}
                  onClick={async () => {
                    try {
                      await onDelete(p.id);
                    } catch (err) {
                      window.alert(
                        err instanceof Error ? err.message : "Delete failed",
                      );
                    }
                  }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {overlays}
    </div>
  );
}
