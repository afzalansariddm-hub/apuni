import { useEffect, useState } from "react";
import { ArrowLeft, Bell, Search, Settings } from "lucide-react";
import {
  createCategory,
  createProvider,
  createTown,
  deleteCategory,
  deleteProvider,
  deleteTown,
  fetchBootstrap,
  renameCategory,
  renameTown,
  toggleProviderVerified,
  updateProvider,
} from "./api";
import type { AdminScreen, Provider, ProviderFormData } from "./types";
import AdminView from "./components/AdminView";
import GamosaBorder from "./components/GamosaBorder";
import PublicView from "./components/PublicView";
import "./App.css";

type Tab = "public" | "admin";

export default function App() {
  const [tab, setTab] = useState<Tab>("public");
  const [adminScreen, setAdminScreen] = useState<AdminScreen>("home");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [towns, setTowns] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await fetchBootstrap();
        if (cancelled) return;
        setProviders(data.providers);
        setCategories(data.categories);
        setTowns(data.towns);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const goPublic = () => {
    setTab("public");
    setAdminScreen("home");
  };

  const goAdminHome = () => {
    setTab("admin");
    setAdminScreen("home");
  };

  const handleAdd = async (data: ProviderFormData) => {
    const created = await createProvider(data);
    setProviders((prev) => [created, ...prev]);
  };

  const handleUpdate = async (id: string, data: ProviderFormData) => {
    const updated = await updateProvider(id, data);
    setProviders((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const handleDelete = async (id: string) => {
    await deleteProvider(id);
    setProviders((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleVerified = async (id: string) => {
    const updated = await toggleProviderVerified(id);
    setProviders((prev) => prev.map((p) => (p.id === id ? updated : p)));
  };

  const handleAddCategory = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const created = await createCategory(trimmed);
    setCategories((prev) =>
      prev.some((c) => c.toLowerCase() === created.name.toLowerCase())
        ? prev
        : [...prev, created.name],
    );
  };

  const handleRenameCategory = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    const renamed = await renameCategory(oldName, trimmed);
    setCategories((prev) =>
      prev.map((c) => (c === oldName ? renamed.name : c)),
    );
    setProviders((prev) =>
      prev.map((p) =>
        p.category === oldName ? { ...p, category: renamed.name } : p,
      ),
    );
  };

  const handleDeleteCategory = async (name: string) => {
    await deleteCategory(name);
    setCategories((prev) => prev.filter((c) => c !== name));
  };

  const handleAddTown = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const created = await createTown(trimmed);
    setTowns((prev) =>
      prev.some((t) => t.toLowerCase() === created.name.toLowerCase())
        ? prev
        : [...prev, created.name],
    );
  };

  const handleRenameTown = async (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    const renamed = await renameTown(oldName, trimmed);
    setTowns((prev) => prev.map((t) => (t === oldName ? renamed.name : t)));
    setProviders((prev) =>
      prev.map((p) => (p.town === oldName ? { ...p, town: renamed.name } : p)),
    );
  };

  const handleDeleteTown = async (name: string) => {
    await deleteTown(name);
    setTowns((prev) => prev.filter((t) => t !== name));
  };

  const showAdminBack = tab === "admin" && adminScreen !== "home";
  const showFabPad =
    tab === "admin" &&
    (adminScreen === "providers" ||
      adminScreen === "categories" ||
      adminScreen === "cities");

  return (
    <div className="desktop-backdrop">
      <div className="phone-frame">
        <header className="app-header">
          <div className="app-header-bar">
            <div className="header-left">
              {showAdminBack && (
                <button
                  type="button"
                  className="header-icon-btn"
                  aria-label="Back to dashboard"
                  onClick={() => setAdminScreen("home")}
                >
                  <ArrowLeft size={17} strokeWidth={2} />
                </button>
              )}
              <h1 className="brand">Apuni</h1>
            </div>
            <button
              type="button"
              className="header-icon-btn"
              aria-label="Notifications"
              title="Coming soon"
            >
              <Bell size={17} strokeWidth={1.75} />
            </button>
          </div>
          <GamosaBorder />
        </header>

        <main className={showFabPad ? "app-main has-fab" : "app-main"}>
          {loading ? (
            <div className="view-pane" style={{ padding: "2rem 1.25rem" }}>
              <p style={{ color: "var(--muted, #666)", margin: 0 }}>
                Loading…
              </p>
            </div>
          ) : error ? (
            <div className="view-pane" style={{ padding: "2rem 1.25rem" }}>
              <p style={{ color: "#b42318", margin: 0 }}>{error}</p>
              <p style={{ color: "var(--muted, #666)", marginTop: "0.75rem" }}>
                Make sure the API server is running (`npm run dev:server`).
              </p>
            </div>
          ) : tab === "public" ? (
            <PublicView
              key="public"
              providers={providers}
              categories={categories}
              towns={towns}
            />
          ) : (
            <AdminView
              key="admin"
              providers={providers}
              categories={categories}
              towns={towns}
              screen={adminScreen}
              onScreenChange={setAdminScreen}
              onAdd={handleAdd}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onToggleVerified={handleToggleVerified}
              onAddCategory={handleAddCategory}
              onRenameCategory={handleRenameCategory}
              onDeleteCategory={handleDeleteCategory}
              onAddTown={handleAddTown}
              onRenameTown={handleRenameTown}
              onDeleteTown={handleDeleteTown}
            />
          )}
        </main>

        <nav className="bottom-nav" aria-label="Main">
          <button
            type="button"
            className={tab === "public" ? "nav-item active" : "nav-item"}
            aria-current={tab === "public" ? "page" : undefined}
            onClick={goPublic}
          >
            <span className="nav-item-pill">
              <Search
                size={tab === "public" ? 22 : 20}
                strokeWidth={tab === "public" ? 2.6 : 1.75}
              />
              Find providers
            </span>
          </button>
          <button
            type="button"
            className={tab === "admin" ? "nav-item active" : "nav-item"}
            aria-current={tab === "admin" ? "page" : undefined}
            onClick={goAdminHome}
          >
            <span className="nav-item-pill">
              <Settings
                size={tab === "admin" ? 22 : 20}
                strokeWidth={tab === "admin" ? 2.6 : 1.75}
              />
              Admin
            </span>
          </button>
        </nav>

        <div id="app-overlays" className="app-overlays" />
      </div>
    </div>
  );
}
