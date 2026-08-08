import React, { useState, useEffect, useCallback } from "react";
import { Phone, MessageCircle, ShieldCheck, Search, Plus, Trash2, Pencil, Lock, X, Check, LayoutGrid, Settings } from "lucide-react";

const TOWNS = ["Tinsukia", "Doomdooma", "Hansara", "Barhapjan", "Makum", "Hijuguri", "Borguri"];
const CATEGORIES = ["Electrician", "Plumber", "Home Tutor", "Event Planner", "AC & Appliance Repair", "Photographer"];
const ADMIN_PASSCODE = "apuni2026";
const STORAGE_KEY = "apuni-providers-v1";

const SEED = [
  { id: "p1", name: "Dilip Gogoi", category: "Electrician", town: "Tinsukia", phone: "9435012345", desc: "12 years experience, house wiring and repairs.", verified: true, addedAt: Date.now() },
  { id: "p2", name: "Rekha Devi", category: "Home Tutor", town: "Doomdooma", phone: "9854098765", desc: "Class 6-10 Maths and Science, Assamese medium.", verified: true, addedAt: Date.now() },
  { id: "p3", name: "Mintu Sonowal", category: "Plumber", town: "Makum", phone: "8638011223", desc: "Pipe fitting, leak repair, bathroom fittings.", verified: true, addedAt: Date.now() },
  { id: "p4", name: "Purabi Studios", category: "Photographer", town: "Tinsukia", phone: "9707044556", desc: "Weddings, Bihu functions, birthday events.", verified: false, addedAt: Date.now() },
];

function cleanPhone(p) {
  return (p || "").replace(/\D/g, "");
}

function useProviders() {
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await window.storage.get(STORAGE_KEY, true);
      const parsed = res ? JSON.parse(res.value) : null;
      if (parsed && Array.isArray(parsed) && parsed.length) {
        setProviders(parsed);
      } else {
        setProviders(SEED);
        await window.storage.set(STORAGE_KEY, JSON.stringify(SEED), true);
      }
    } catch (e) {
      setProviders(SEED);
      try {
        await window.storage.set(STORAGE_KEY, JSON.stringify(SEED), true);
      } catch (e2) {
        setErr("Could not reach storage. Working with local demo data only.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const persist = useCallback(async (next) => {
    setProviders(next);
    try {
      const res = await window.storage.set(STORAGE_KEY, JSON.stringify(next), true);
      if (!res) setErr("Save failed. Your change may not be visible to others.");
      else setErr(null);
    } catch (e) {
      setErr("Save failed. Your change may not be visible to others.");
    }
  }, []);

  return { providers: providers || [], loading, err, persist, reload: load };
}

const GAMOSA_BORDER = (
  <svg viewBox="0 0 240 14" preserveAspectRatio="xMidYMid slice" style={{ width: "100%", height: 12, display: "block" }} aria-hidden="true">
    <rect width="240" height="14" fill="#EFE6D3" />
    {Array.from({ length: 20 }).map((_, i) => (
      <g key={i} transform={`translate(${i * 12}, 0)`}>
        <path d="M6 2 L10 7 L6 12 L2 7 Z" fill="#A32D2D" />
      </g>
    ))}
  </svg>
);

function Badge({ children, tone = "neutral" }) {
  const tones = {
    verified: { bg: "#EAF3DE", fg: "#173404", border: "#639922" },
    pending: { bg: "#FAEEDA", fg: "#412402", border: "#BA7517" },
    neutral: { bg: "#F1EFE8", fg: "#2C2C2A", border: "#B4B2A9" },
  };
  const t = tones[tone];
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 999, background: t.bg, color: t.fg, border: `1px solid ${t.border}` }}>
      {children}
    </span>
  );
}

function ProviderCard({ p }) {
  const digits = cleanPhone(p.phone);
  return (
    <div style={{ background: "#FFFDF8", border: "1px solid #DCD5C3", borderRadius: 10, overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 4, background: "linear-gradient(90deg, #A32D2D, #33513E)" }} />
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
          <div>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 17, fontWeight: 600, color: "#221D17" }}>{p.name}</div>
            <div style={{ fontSize: 13, color: "#5F5E5A", marginTop: 2 }}>{p.category} &middot; {p.town}</div>
          </div>
          {p.verified ? <Badge tone="verified"><ShieldCheck size={12} /> KYC verified</Badge> : <Badge tone="pending">Pending</Badge>}
        </div>
        {p.desc ? <div style={{ fontSize: 13, color: "#444441", lineHeight: 1.5 }}>{p.desc}</div> : null}
        <div style={{ display: "flex", gap: 8, marginTop: "auto", paddingTop: 8 }}>
          <a href={`tel:${digits}`} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "8px 10px", borderRadius: 8, background: "#A32D2D", color: "#FCEBEB", textDecoration: "none" }}>
            <Phone size={14} /> Call
          </a>
          <a href={`https://wa.me/91${digits}`} target="_blank" rel="noreferrer" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13, fontWeight: 600, padding: "8px 10px", borderRadius: 8, background: "#EAF3DE", color: "#173404", textDecoration: "none", border: "1px solid #97C459" }}>
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function PublicView({ providers, loading }) {
  const [town, setTown] = useState("All towns");
  const [category, setCategory] = useState("All categories");
  const [q, setQ] = useState("");

  const verified = providers.filter((p) => p.verified);
  const filtered = verified.filter((p) => {
    if (town !== "All towns" && p.town !== town) return false;
    if (category !== "All categories" && p.category !== category) return false;
    if (q.trim()) {
      const s = q.trim().toLowerCase();
      if (!p.name.toLowerCase().includes(s) && !p.category.toLowerCase().includes(s) && !p.desc.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const selectStyle = { padding: "9px 10px", borderRadius: 8, border: "1px solid #C9C1AB", background: "#FFFDF8", color: "#221D17", fontSize: 13, minWidth: 150 };

  return (
    <div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 18 }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 11, color: "#8A7B65" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name or service"
            style={{ width: "100%", boxSizing: "border-box", padding: "9px 10px 9px 32px", borderRadius: 8, border: "1px solid #C9C1AB", background: "#FFFDF8", fontSize: 13, color: "#221D17" }}
          />
        </div>
        <select value={town} onChange={(e) => setTown(e.target.value)} style={selectStyle}>
          <option>All towns</option>
          {TOWNS.map((t) => <option key={t}>{t}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={selectStyle}>
          <option>All categories</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ color: "#8A7B65", fontSize: 14, padding: "24px 0" }}>Loading providers...</div>
      ) : filtered.length === 0 ? (
        <div style={{ color: "#8A7B65", fontSize: 14, padding: "24px 0", textAlign: "center", border: "1px dashed #C9C1AB", borderRadius: 10 }}>
          No verified providers match this search yet.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 12 }}>
          {filtered.map((p) => <ProviderCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}

const emptyForm = { name: "", category: CATEGORIES[0], town: TOWNS[0], phone: "", desc: "", verified: false };

function AdminView({ providers, persist, err }) {
  const [authed, setAuthed] = useState(false);
  const [pass, setPass] = useState("");
  const [passErr, setPassErr] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  if (!authed) {
    return (
      <div style={{ maxWidth: 320, margin: "40px auto", textAlign: "center" }}>
        <Lock size={22} style={{ color: "#8A7B65" }} />
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 18, margin: "10px 0 4px", color: "#221D17" }}>Admin access</div>
        <div style={{ fontSize: 12, color: "#8A7B65", marginBottom: 14 }}>Demo passcode: apuni2026</div>
        <input
          type="password"
          value={pass}
          onChange={(e) => { setPass(e.target.value); setPassErr(false); }}
          onKeyDown={(e) => { if (e.key === "Enter") { if (pass === ADMIN_PASSCODE) setAuthed(true); else setPassErr(true); } }}
          placeholder="Enter passcode"
          style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: `1px solid ${passErr ? "#E24B4A" : "#C9C1AB"}`, fontSize: 13, marginBottom: 10 }}
        />
        <button
          onClick={() => { if (pass === ADMIN_PASSCODE) setAuthed(true); else setPassErr(true); }}
          style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "none", background: "#33513E", color: "#EAF3DE", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          Enter
        </button>
        {passErr && <div style={{ fontSize: 12, color: "#A32D2D", marginTop: 8 }}>Incorrect passcode.</div>}
      </div>
    );
  }

  const startEdit = (p) => {
    setEditingId(p.id);
    setForm({ name: p.name, category: p.category, town: p.town, phone: p.phone, desc: p.desc, verified: p.verified });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const submit = async () => {
    if (!form.name.trim() || !form.phone.trim()) return;
    if (editingId) {
      const next = providers.map((p) => (p.id === editingId ? { ...p, ...form } : p));
      await persist(next);
    } else {
      const next = [{ id: "p" + Date.now(), ...form, addedAt: Date.now() }, ...providers];
      await persist(next);
    }
    cancelEdit();
  };

  const remove = async (id) => {
    const next = providers.filter((p) => p.id !== id);
    await persist(next);
  };

  const toggleVerified = async (id) => {
    const next = providers.map((p) => (p.id === id ? { ...p, verified: !p.verified } : p));
    await persist(next);
  };

  const inputStyle = { width: "100%", boxSizing: "border-box", padding: "8px 10px", borderRadius: 8, border: "1px solid #C9C1AB", fontSize: 13, background: "#FFFDF8", color: "#221D17" };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "#8A7B65", textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 4, display: "block" };

  return (
    <div>
      {err && <div style={{ background: "#FCEBEB", color: "#791F1F", border: "1px solid #E24B4A", borderRadius: 8, padding: "8px 12px", fontSize: 12, marginBottom: 14 }}>{err}</div>}

      <div style={{ background: "#FFFDF8", border: "1px solid #DCD5C3", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: "#221D17", marginBottom: 12 }}>
          {editingId ? "Edit provider" : "Add a new provider"}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={labelStyle}>Full name</label>
            <input style={inputStyle} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Dilip Gogoi" />
          </div>
          <div>
            <label style={labelStyle}>Phone number</label>
            <input style={inputStyle} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit mobile number" />
          </div>
          <div>
            <label style={labelStyle}>Category</label>
            <select style={inputStyle} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Town</label>
            <select style={inputStyle} value={form.town} onChange={(e) => setForm({ ...form, town: e.target.value })}>
              {TOWNS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>Description</label>
            <input style={inputStyle} value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="Short note on experience or specialty" />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" id="kyc" checked={form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} />
            <label htmlFor="kyc" style={{ fontSize: 13, color: "#221D17" }}>KYC verified — visible to public</label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button onClick={submit} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 8, border: "none", background: "#33513E", color: "#EAF3DE", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            {editingId ? <><Check size={14} /> Save changes</> : <><Plus size={14} /> Add provider</>}
          </button>
          {editingId && (
            <button onClick={cancelEdit} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 14px", borderRadius: 8, border: "1px solid #C9C1AB", background: "transparent", color: "#444441", fontSize: 13, cursor: "pointer" }}>
              <X size={14} /> Cancel
            </button>
          )}
        </div>
      </div>

      <div style={{ fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 600, color: "#221D17", marginBottom: 10 }}>
        All providers ({providers.length})
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {providers.map((p) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, background: "#FFFDF8", border: "1px solid #DCD5C3", borderRadius: 8, padding: "10px 12px" }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#221D17" }}>{p.name} <span style={{ fontWeight: 400, color: "#8A7B65" }}>&middot; {p.category} &middot; {p.town}</span></div>
              <div style={{ fontSize: 12, color: "#8A7B65" }}>{p.phone}</div>
            </div>
            <button onClick={() => toggleVerified(p.id)} style={{ cursor: "pointer" }}>
              {p.verified ? <Badge tone="verified"><ShieldCheck size={12} /> Verified</Badge> : <Badge tone="pending">Pending</Badge>}
            </button>
            <button onClick={() => startEdit(p)} title="Edit" style={{ padding: 6, borderRadius: 6, border: "1px solid #C9C1AB", background: "transparent", cursor: "pointer", color: "#444441" }}><Pencil size={14} /></button>
            <button onClick={() => remove(p.id)} title="Delete" style={{ padding: 6, borderRadius: 6, border: "1px solid #E24B4A", background: "transparent", cursor: "pointer", color: "#A32D2D" }}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Apuni() {
  const [tab, setTab] = useState("public");
  const { providers, loading, err, persist } = useProviders();

  return (
    <div style={{ fontFamily: "Inter, -apple-system, sans-serif", background: "#EDE7D9", minHeight: 500, borderRadius: 12, overflow: "hidden" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap');`}</style>

      <div style={{ padding: "22px 24px 16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontFamily: "Fraunces, serif", fontSize: 30, fontWeight: 700, color: "#221D17", letterSpacing: -0.5 }}>Apuni</div>
            <div style={{ fontSize: 13, color: "#5F5E5A", marginTop: 2 }}>Verified local services across Tinsukia district</div>
          </div>
          <div style={{ display: "flex", gap: 6, background: "#E0D8C4", padding: 4, borderRadius: 9 }}>
            <button
              onClick={() => setTab("public")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === "public" ? "#FFFDF8" : "transparent", color: tab === "public" ? "#221D17" : "#5F5E5A" }}
            >
              <LayoutGrid size={14} /> Find providers
            </button>
            <button
              onClick={() => setTab("admin")}
              style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: tab === "admin" ? "#FFFDF8" : "transparent", color: tab === "admin" ? "#221D17" : "#5F5E5A" }}
            >
              <Settings size={14} /> Admin
            </button>
          </div>
        </div>
      </div>

      {GAMOSA_BORDER}

      <div style={{ padding: "20px 24px 28px" }}>
        {tab === "public" ? (
          <PublicView providers={providers} loading={loading} />
        ) : (
          <AdminView providers={providers} persist={persist} err={err} />
        )}
      </div>
    </div>
  );
}
