import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { AuthPayload } from "../lib/auth";

type LoginPageProps = {
  onAuth: (payload: AuthPayload) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function LoginPage({ onAuth, theme, onToggleTheme }: LoginPageProps) {
  const isDark = theme === "dark";
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    legalName: "",
    document: "",
    email: "",
    password: "",
    bankProvider: "mock",
    providerApiKey: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (mode === "login") {
        const payload = (await api.login({ email: form.email, password: form.password })) as AuthPayload;
        onAuth(payload);
      } else {
        const payload = (await api.register({
          legalName: form.legalName,
          document: form.document,
          email: form.email,
          password: form.password,
          bankProvider: form.bankProvider,
          providerApiKey: form.providerApiKey || undefined,
        })) as AuthPayload;
        onAuth(payload);
      }
    } catch (err: any) {
      setError(err?.message ?? "Falha ao autenticar");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = `rounded-2xl border px-4 py-3 text-sm ${
    isDark ? "border-slate-700 bg-slate-900/60 text-slate-100" : "border-slate-200 bg-white/80 text-slate-900"
  }`;

  return (
    <div
      className={`min-h-screen px-6 pb-20 pt-8 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-[#f8f6f2] text-slate-900"
      }`}
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <header className="flex items-center justify-between">
          <Link
            className={`inline-flex items-center rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.4em] ${
              isDark ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-50"
            }`}
            to="/"
          >
            CobrancaPro
          </Link>
          <button
            className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
              isDark
                ? "border-slate-600 bg-slate-900/70 text-slate-100"
                : "border-slate-300 bg-white/80 text-slate-800"
            }`}
            type="button"
            onClick={onToggleTheme}
          >
            {isDark ? "Modo claro" : "Modo escuro"}
          </button>
        </header>

        <div
          className={`mx-auto w-full max-w-lg rounded-3xl border p-7 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.2)] ${
            isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-white/80"
          }`}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="font-serif text-2xl">{mode === "login" ? "Entrar" : "Criar conta"}</h2>
              <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
                {mode === "login" ? "Acesse o painel do SaaS." : "Ative sua empresa em minutos."}
              </p>
            </div>
            <button
              type="button"
              className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                isDark ? "text-slate-300" : "text-slate-500"
              }`}
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Criar conta" : "Entrar"}
            </button>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                  Empresa
                  <input
                    className={inputClass}
                    value={form.legalName}
                    onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                    placeholder="Nome legal da empresa"
                    required
                  />
                </label>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                  Documento
                  <input
                    className={inputClass}
                    value={form.document}
                    onChange={(e) => setForm({ ...form, document: e.target.value })}
                    placeholder="CPF/CNPJ"
                    required
                  />
                </label>
              </>
            )}

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
              Email
              <input
                className={inputClass}
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="voce@empresa.com"
                required
              />
            </label>

            <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
              Senha
              <input
                className={inputClass}
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimo 6 caracteres"
                required
              />
            </label>

            {mode === "register" && (
              <>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                  Banco principal
                  <select
                    className={inputClass}
                    value={form.bankProvider}
                    onChange={(e) => setForm({ ...form, bankProvider: e.target.value })}
                  >
                    <option value="mock">Mock</option>
                    <option value="asaas">Asaas</option>
                    <option value="cora" disabled>
                      Cora (em breve)
                    </option>
                  </select>
                </label>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                  API Key do banco
                  <input
                    className={inputClass}
                    value={form.providerApiKey}
                    onChange={(e) => setForm({ ...form, providerApiKey: e.target.value })}
                    placeholder="Opcional para mock"
                  />
                </label>
              </>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              className={`mt-2 rounded-2xl px-5 py-3 text-sm font-semibold shadow-[0_18px_40px_-24px_rgba(15,23,42,0.2)] ${
                isDark ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-50"
              }`}
              type="submit"
              disabled={loading}
            >
              {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
