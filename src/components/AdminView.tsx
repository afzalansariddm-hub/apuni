import { useState } from "react";
import {
  ChevronRight,
  FolderOpen,
  Lock,
  MapPin,
  Users,
} from "lucide-react";
import type { AdminScreen, Provider, ProviderFormData } from "../types";
import { ADMIN_PASSCODE } from "../data";
import AdminProvidersScreen from "./AdminProvidersScreen";
import AdminTaxonomyScreen from "./AdminTaxonomyScreen";

interface AdminViewProps {
  providers: Provider[];
  categories: string[];
  towns: string[];
  screen: AdminScreen;
  onScreenChange: (screen: AdminScreen) => void;
  onAdd: (data: ProviderFormData) => void;
  onUpdate: (id: string, data: ProviderFormData) => void;
  onDelete: (id: string) => void;
  onToggleVerified: (id: string) => void;
  onAddCategory: (name: string) => void;
  onRenameCategory: (oldName: string, newName: string) => void;
  onDeleteCategory: (name: string) => void;
  onAddTown: (name: string) => void;
  onRenameTown: (oldName: string, newName: string) => void;
  onDeleteTown: (name: string) => void;
}

export default function AdminView({
  providers,
  categories,
  towns,
  screen,
  onScreenChange,
  onAdd,
  onUpdate,
  onDelete,
  onToggleVerified,
  onAddCategory,
  onRenameCategory,
  onDeleteCategory,
  onAddTown,
  onRenameTown,
  onDeleteTown,
}: AdminViewProps) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState(false);

  const tryUnlock = () => {
    if (pass === ADMIN_PASSCODE) {
      setAuthed(true);
      setPassErr(false);
      onScreenChange("home");
    } else {
      setPassErr(true);
    }
  };

  if (!authed) {
    return (
      <div className="lock-screen view-pane">
        <div className="lock-icon-wrap">
          <Lock size={32} strokeWidth={1.75} />
        </div>
        <h2 className="lock-title">Admin access</h2>
        <p className="lock-hint">Demo passcode: apuni2026</p>
        <input
          type="password"
          className={passErr ? "lock-input error" : "lock-input"}
          value={pass}
          onChange={(e) => {
            setPass(e.target.value);
            setPassErr(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") tryUnlock();
          }}
          placeholder="••••••••"
          aria-label="Admin passcode"
          autoComplete="off"
        />
        <button type="button" className="lock-btn" onClick={tryUnlock}>
          Unlock
        </button>
        {passErr && <div className="lock-error">Incorrect passcode.</div>}
      </div>
    );
  }

  if (screen === "providers") {
    return (
      <AdminProvidersScreen
        providers={providers}
        categories={categories}
        towns={towns}
        onAdd={onAdd}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onToggleVerified={onToggleVerified}
      />
    );
  }

  if (screen === "categories") {
    return (
      <AdminTaxonomyScreen
        title="Categories"
        itemLabel="category"
        items={categories}
        getCount={(name) =>
          providers.filter((p) => p.category === name).length
        }
        onAdd={onAddCategory}
        onRename={onRenameCategory}
        onDelete={onDeleteCategory}
      />
    );
  }

  if (screen === "cities") {
    return (
      <AdminTaxonomyScreen
        title="Cities"
        itemLabel="town"
        items={towns}
        getCount={(name) => providers.filter((p) => p.town === name).length}
        onAdd={onAddTown}
        onRename={onRenameTown}
        onDelete={onDeleteTown}
      />
    );
  }

  const total = providers.length;
  const verified = providers.filter((p) => p.verified).length;
  const pending = total - verified;

  return (
    <div className="view-pane">
      <div className="dash-header">
        <h2 className="dash-title">Admin dashboard</h2>
        <p className="dash-sub">Manage Apuni listings</p>
      </div>

      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-value">{total}</div>
          <div className="stat-label">Total providers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{verified}</div>
          <div className="stat-label">Verified</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{pending}</div>
          <div className="stat-label">Pending</div>
        </div>
      </div>

      <div className="action-list">
        <button
          type="button"
          className="action-card"
          onClick={() => onScreenChange("providers")}
        >
          <div className="action-icon" style={{ background: "#FCE8C8", color: "#8A4B12" }}>
            <Users size={18} />
          </div>
          <div className="action-text">
            <div className="action-title">Providers</div>
            <div className="action-sub">Add, edit, and verify listings</div>
          </div>
          <ChevronRight size={18} className="action-chevron" />
        </button>

        <button
          type="button"
          className="action-card"
          onClick={() => onScreenChange("categories")}
        >
          <div className="action-icon" style={{ background: "#E8DFF5", color: "#4A2F78" }}>
            <FolderOpen size={18} />
          </div>
          <div className="action-text">
            <div className="action-title">Categories</div>
            <div className="action-sub">Manage service categories</div>
          </div>
          <ChevronRight size={18} className="action-chevron" />
        </button>

        <button
          type="button"
          className="action-card"
          onClick={() => onScreenChange("cities")}
        >
          <div className="action-icon" style={{ background: "#DCEEE6", color: "#1F4F3A" }}>
            <MapPin size={18} />
          </div>
          <div className="action-text">
            <div className="action-title">Cities</div>
            <div className="action-sub">Manage coverage towns</div>
          </div>
          <ChevronRight size={18} className="action-chevron" />
        </button>
      </div>
    </div>
  );
}
