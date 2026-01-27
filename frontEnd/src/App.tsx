import { useEffect, useState } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CustomersPage } from "./pages/CustomersPage";
import { ChargesPage } from "./pages/ChargesPage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { clearAuth, getAuth, setAuth, type AuthPayload } from "./lib/auth";
import { api } from "./lib/api";
import { canManageCompany, canManageData, canViewReports } from "./lib/rbac";
import { Button } from "./components/ui";

export default function App() {
  const [auth, setAuthState] = useState<AuthPayload | null>(() => getAuth());
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const stored = localStorage.getItem("cobrancapro.theme");
    return stored === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.body.classList.toggle("theme-dark", theme === "dark");
    localStorage.setItem("cobrancapro.theme", theme);
  }, [theme]);

  return (
    <BrowserRouter>
      {!auth ? (
        <Routes>
          <Route path="/" element={<LandingPage theme={theme} onToggleTheme={() => toggleTheme(setTheme)} />} />
          <Route
            path="/login"
            element={
              <LoginPage
                theme={theme}
                onToggleTheme={() => toggleTheme(setTheme)}
                onAuth={(payload) => {
                  setAuth(payload);
                  setAuthState(payload);
                }}
              />
            }
          />
          <Route path="*" element={<LandingPage theme={theme} onToggleTheme={() => toggleTheme(setTheme)} />} />
        </Routes>
      ) : (
        <AppShell
          auth={auth}
          theme={theme}
          onToggleTheme={() => toggleTheme(setTheme)}
          onLogout={() => {
            clearAuth();
            setAuthState(null);
          }}
        />
      )}
    </BrowserRouter>
  );
}

function toggleTheme(setTheme: React.Dispatch<React.SetStateAction<"light" | "dark">>) {
  setTheme((current) => (current === "light" ? "dark" : "light"));
}

function AppShell({
  auth,
  theme,
  onToggleTheme,
  onLogout,
}: {
  auth: AuthPayload;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  onLogout: () => void;
}) {
  const [company, setCompany] = useState<any>(null);

  useEffect(() => {
    let active = true;
    api
      .getCompany()
      .then((data) => {
        if (active) setCompany(data);
      })
      .catch(() => null);
    return () => {
      active = false;
    };
  }, [auth.companyId]);

  const perms = {
    manageData: canManageData(auth.role),
    viewReports: canViewReports(auth.role),
    manageCompany: canManageCompany(auth.role),
  };

  const nav = [
    { to: "/", label: "Dashboard", show: true },
    { to: "/customers", label: "Clientes", show: true },
    { to: "/charges", label: "Cobrancas", show: true },
    { to: "/subscriptions", label: "Assinaturas", show: true },
    { to: "/reports", label: "Relatorios", show: perms.viewReports },
    { to: "/settings", label: "Empresa", show: perms.manageCompany },
  ].filter((item) => item.show);

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row">
        <aside className="glass flex flex-col gap-6 rounded-3xl p-6 md:w-64 md:shrink-0">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-ink-700">CobrancaPro</p>
            <p className="font-serif text-2xl text-ink-900">{company?.legal_name ?? "Sua empresa"}</p>
          </div>
          <nav className="flex flex-row gap-2 overflow-x-auto md:flex-col">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                    isActive ? "bg-ink-900 text-sand-50" : "text-ink-700 hover:bg-ink-700/10"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-2">
            <Button variant="outline" onClick={onLogout}>
              Sair
            </Button>
            <p className="text-xs text-ink-700">Role: {auth.role}</p>
          </div>
        </aside>

        <main className="flex-1 space-y-6">
          <div className="flex items-center justify-end">
            <button
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                theme === "dark"
                  ? "border-slate-600 bg-slate-900/70 text-slate-100"
                  : "border-slate-300 bg-white/80 text-slate-800"
              }`}
              type="button"
              onClick={onToggleTheme}
            >
              {theme === "light" ? "Modo escuro" : "Modo claro"}
            </button>
          </div>

          <Routes>
            <Route path="/" element={<DashboardPage canViewReports={perms.viewReports} />} />
            <Route path="/customers" element={<CustomersPage canManage={perms.manageData} />} />
            <Route path="/charges" element={<ChargesPage canManage={perms.manageData} />} />
            <Route path="/subscriptions" element={<SubscriptionsPage canManage={perms.manageData} />} />
            <Route path="/reports" element={<ReportsPage canView={perms.viewReports} />} />
            <Route path="/settings" element={<SettingsPage canManage={perms.manageCompany} />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
