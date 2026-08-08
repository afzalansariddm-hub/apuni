import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

interface AdminTaxonomyScreenProps {
  title: string;
  itemLabel: string; // "category" | "town"
  items: string[];
  getCount: (name: string) => number;
  onAdd: (name: string) => void;
  onRename: (oldName: string, newName: string) => void;
  onDelete: (name: string) => void;
}

export default function AdminTaxonomyScreen({
  title,
  itemLabel,
  items,
  getCount,
  onAdd,
  onRename,
  onDelete,
}: AdminTaxonomyScreenProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingName, setEditingName] = useState<string | null>(null);
  const [value, setValue] = useState("");
  const [overlayEl, setOverlayEl] = useState<Element | null>(null);

  useEffect(() => {
    setOverlayEl(document.getElementById("app-overlays"));
  }, []);

  const openAdd = () => {
    setEditingName(null);
    setValue("");
    setSheetOpen(true);
  };

  const openEdit = (name: string) => {
    setEditingName(name);
    setValue(name);
    setSheetOpen(true);
  };

  const closeSheet = () => {
    setSheetOpen(false);
    setEditingName(null);
    setValue("");
  };

  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    if (editingName) {
      if (trimmed !== editingName) onRename(editingName, trimmed);
    } else {
      onAdd(trimmed);
    }
    closeSheet();
  };

  const overlays =
    overlayEl &&
    createPortal(
      <>
        <button
          type="button"
          className={sheetOpen ? "fab hidden" : "fab"}
          aria-label={`Add ${itemLabel}`}
          onClick={openAdd}
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
          aria-labelledby="taxonomy-sheet-title"
          aria-hidden={!sheetOpen}
        >
          <div className="sheet-handle" />
          <div className="sheet-header">
            <h2 id="taxonomy-sheet-title" className="sheet-title">
              {editingName ? `Edit ${itemLabel}` : `Add ${itemLabel}`}
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
              <label htmlFor="taxonomy-name">Name</label>
              <input
                id="taxonomy-name"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={`e.g. ${itemLabel === "town" ? "Digboi" : "Carpenter"}`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") submit();
                }}
              />
            </div>
            <div className="sheet-actions">
              <button type="button" className="btn-primary" onClick={submit}>
                {editingName ? (
                  <>
                    <Check size={16} /> Save changes
                  </>
                ) : (
                  <>
                    <Plus size={16} /> Add {itemLabel}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </>,
      overlayEl,
    );

  return (
    <div className="view-pane">
      <div className="admin-heading">
        {title} ({items.length})
      </div>

      <div className="provider-list">
        {items.map((name) => {
          const count = getCount(name);
          return (
            <article key={name} className="provider-card taxonomy-row">
              <div className="card-body">
                <h3 className="card-name">{name}</h3>
                <p className="card-meta">
                  {count} {count === 1 ? "provider" : "providers"}
                </p>
                {count > 0 && (
                  <p className="taxonomy-warn">
                    {count} {count === 1 ? "provider uses" : "providers use"}{" "}
                    this {itemLabel}
                  </p>
                )}
              </div>
              <div className="taxonomy-actions">
                <button
                  type="button"
                  className="icon-btn edit"
                  title="Edit"
                  aria-label={`Edit ${name}`}
                  onClick={() => openEdit(name)}
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  className="icon-btn delete"
                  title="Delete"
                  aria-label={`Delete ${name}`}
                  onClick={() => onDelete(name)}
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
