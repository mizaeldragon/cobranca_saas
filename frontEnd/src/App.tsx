import { useEffect, useState } from "react";
import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CustomersPage } from "./pages/CustomersPage";
import { ChargesPage } from "./pages/ChargesPage";
import { SubscriptionsPage } from "./pages/SubscriptionsPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { clearAuth, getAuth, setAuth, type AuthPayload } from "./lib/auth";
import { api } from "./lib/api";
import { Button } from "./components/ui";

export default function App() {
  const [auth, setAuthState] = useState<AuthPayload | null>(() => getAuth());

  if (!auth) {
    return (
      <AuthPage
        onAuth={(payload) => {
          setAuth(payload);
          setAuthState(payload);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <AppShell
        auth={auth}
        onLogout={() => {
          clearAuth();
          setAuthState(null);
        }}
      />
    </BrowserRouter>
  );
}

function AppShell({ auth, onLogout }: { auth: AuthPayload; onLogout: () => void }) {
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

  const nav = [
    { to: "/", label: "Dashboard" },
    { to: "/customers", label: "Clientes" },
    { to: "/charges", label: "Cobrancas" },
    { to: "/subscriptions", label: "Assinaturas" },
    { to: "/reports", label: "Relatorios" },
    { to: "/settings", label: "Empresa" },
  ];

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
          <header className="glass flex flex-wrap items-center justify-between gap-4 rounded-3xl px-6 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-ink-700">SaaS de cobranca</p>
              <h1 className="font-serif text-2xl text-ink-900">Automacao financeira</h1>
            </div>
            <div className="flex items-center gap-2" />
          </header>

          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/charges" element={<ChargesPage />} />
            <Route path="/subscriptions" element={<SubscriptionsPage />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
