import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Search, SearchX, SlidersHorizontal, X } from "lucide-react";
import type { Provider } from "../types";
import ProviderCard from "./ProviderCard";

interface PublicViewProps {
  providers: Provider[];
  categories: string[];
  towns: string[];
}

export default function PublicView({
  providers,
  categories,
  towns,
}: PublicViewProps) {
  const [town, setTown] = useState("All towns");
  const [category, setCategory] = useState("All categories");
  const [query, setQuery] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draftTown, setDraftTown] = useState(town);
  const [draftCategory, setDraftCategory] = useState(category);
  const [overlayEl, setOverlayEl] = useState<Element | null>(null);

  useEffect(() => {
    setOverlayEl(document.getElementById("app-overlays"));
  }, []);

  // If an active filter was deleted from admin, reset it
  useEffect(() => {
    if (town !== "All towns" && !towns.includes(town)) setTown("All towns");
  }, [towns, town]);

  useEffect(() => {
    if (category !== "All categories" && !categories.includes(category)) {
      setCategory("All categories");
    }
  }, [categories, category]);

  const filtered = providers.filter((p) => {
    if (!p.verified) return false;
    if (town !== "All towns" && p.town !== town) return false;
    if (category !== "All categories" && p.category !== category) return false;
    if (query.trim()) {
      const s = query.trim().toLowerCase();
      const haystack = `${p.name} ${p.category} ${p.description}`.toLowerCase();
      if (!haystack.includes(s)) return false;
    }
    return true;
  });

  const activeFilters: { key: "town" | "category"; label: string }[] = [];
  if (town !== "All towns") activeFilters.push({ key: "town", label: town });
  if (category !== "All categories") {
    activeFilters.push({ key: "category", label: category });
  }

  const openFilters = () => {
    setDraftTown(town);
    setDraftCategory(category);
    setSheetOpen(true);
  };

  const applyFilters = () => {
    setTown(draftTown);
    setCategory(draftCategory);
    setSheetOpen(false);
  };

  const clearDrafts = () => {
    setDraftTown("All towns");
    setDraftCategory("All categories");
  };

  const removeFilter = (key: "town" | "category") => {
    if (key === "town") setTown("All towns");
    else setCategory("All categories");
  };

  const filterSheet =
    overlayEl &&
    createPortal(
      <>
        <div
          className={sheetOpen ? "sheet-backdrop open" : "sheet-backdrop"}
          onClick={() => setSheetOpen(false)}
          aria-hidden={!sheetOpen}
        />
        <div
          className={sheetOpen ? "sheet open filter-sheet" : "sheet filter-sheet"}
          role="dialog"
          aria-modal="true"
          aria-labelledby="filter-sheet-title"
          aria-hidden={!sheetOpen}
        >
          <div className="sheet-handle" />
          <div className="sheet-header">
            <h2 id="filter-sheet-title" className="sheet-title">
              Filters
            </h2>
            <button
              type="button"
              className="sheet-close"
              aria-label="Close"
              onClick={() => setSheetOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <div className="sheet-body filter-sheet-body">
            <div className="chip-label">Town</div>
            <div className="chip-wrap">
              <button
                type="button"
                className={
                  draftTown === "All towns" ? "chip selected" : "chip"
                }
                onClick={() => setDraftTown("All towns")}
              >
                All towns
              </button>
              {towns.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={draftTown === t ? "chip selected" : "chip"}
                  onClick={() => setDraftTown(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="chip-label">Category</div>
            <div className="chip-wrap">
              <button
                type="button"
                className={
                  draftCategory === "All categories" ? "chip selected" : "chip"
                }
                onClick={() => setDraftCategory("All categories")}
              >
                All categories
              </button>
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={draftCategory === c ? "chip selected" : "chip"}
                  onClick={() => setDraftCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="sheet-footer">
            <button
              type="button"
              className="btn-text-muted"
              onClick={clearDrafts}
            >
              Clear all
            </button>
            <button
              type="button"
              className="btn-accent"
              onClick={applyFilters}
            >
              Apply filters
            </button>
          </div>
        </div>
      </>,
      overlayEl,
    );

  return (
    <div className="view-pane">
      <div className="search-wrap">
        <Search size={16} />
        <input
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, category…"
          aria-label="Search providers"
        />
      </div>

      <div className="filter-bar">
        <button type="button" className="filters-pill" onClick={openFilters}>
          <SlidersHorizontal size={15} strokeWidth={2} />
          Filters
          {activeFilters.length > 0 && (
            <span className="filters-count">{activeFilters.length}</span>
          )}
        </button>

        {activeFilters.length === 0 ? (
          <span className="filter-none">No filters applied</span>
        ) : (
          <div className="active-filter-row">
            {activeFilters.map((f) => (
              <button
                key={f.key}
                type="button"
                className="active-filter-chip"
                onClick={() => removeFilter(f.key)}
              >
                {f.label}
                <X size={12} strokeWidth={2.5} />
              </button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <SearchX size={36} strokeWidth={1.5} />
          <p>No verified providers match this search yet.</p>
        </div>
      ) : (
        <div className="provider-list">
          {filtered.map((p) => (
            <ProviderCard key={p.id} provider={p} />
          ))}
        </div>
      )}

      {filterSheet}
    </div>
  );
}
