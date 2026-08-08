import { useState } from "react";
import { ArrowLeft, Bell, Search, Settings } from "lucide-react";
import { SEED_CATEGORIES, SEED_PROVIDERS, SEED_TOWNS } from "./data";
import type { AdminScreen, Provider, ProviderFormData } from "./types";
import AdminView from "./components/AdminView";
import GamosaBorder from "./components/GamosaBorder";
import PublicView from "./components/PublicView";
import "./App.css";

type Tab = "public" | "admin";

export default function App() {
  const [tab, setTab] = useState<Tab>("public");
  const [adminScreen, setAdminScreen] = useState<AdminScreen>("home");
  const [providers, setProviders] = useState<Provider[]>(SEED_PROVIDERS);
  const [categories, setCategories] = useState<string[]>(SEED_CATEGORIES);
  const [towns, setTowns] = useState<string[]>(SEED_TOWNS);

  const goPublic = () => {
    setTab("public");
    setAdminScreen("home");
  };

  const goAdminHome = () => {
    setTab("admin");
    setAdminScreen("home");
  };

  const handleAdd = (data: ProviderFormData) => {
    setProviders((prev) => [{ id: `p${Date.now()}`, ...data }, ...prev]);
  };

  const handleUpdate = (id: string, data: ProviderFormData) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...data } : p)),
    );
  };

  const handleDelete = (id: string) => {
    setProviders((prev) => prev.filter((p) => p.id !== id));
  };

  const handleToggleVerified = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, verified: !p.verified } : p)),
    );
  };

  const handleAddCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setCategories((prev) =>
      prev.some((c) => c.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : [...prev, trimmed],
    );
  };

  const handleRenameCategory = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    setCategories((prev) =>
      prev.map((c) => (c === oldName ? trimmed : c)),
    );
    setProviders((prev) =>
      prev.map((p) =>
        p.category === oldName ? { ...p, category: trimmed } : p,
      ),
    );
  };

  const handleDeleteCategory = (name: string) => {
    setCategories((prev) => prev.filter((c) => c !== name));
  };

  const handleAddTown = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setTowns((prev) =>
      prev.some((t) => t.toLowerCase() === trimmed.toLowerCase())
        ? prev
        : [...prev, trimmed],
    );
  };

  const handleRenameTown = (oldName: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed || trimmed === oldName) return;
    setTowns((prev) => prev.map((t) => (t === oldName ? trimmed : t)));
    setProviders((prev) =>
      prev.map((p) => (p.town === oldName ? { ...p, town: trimmed } : p)),
    );
  };

  const handleDeleteTown = (name: string) => {
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
          {tab === "public" ? (
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
