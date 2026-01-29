import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";
import type { AuthPayload } from "../lib/auth";
import { maskCpfCnpj, maskPhone, onlyDigits } from "../lib/masks";
import logo from "../assets/logo.png";



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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({
    legalName: "",
    document: "",
    email: "",
    phone: "",
    password: "",
  });

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      if (mode === "login") {
        const payload = (await api.login({ email: form.email, password: form.password })) as AuthPayload;
        onAuth(payload);
      } else {
        const payload = (await api.register({
          legalName: form.legalName,
          document: onlyDigits(form.document),
          email: form.email,
          phone: onlyDigits(form.phone),
          password: form.password,
        })) as AuthPayload;
        onAuth(payload);
      }
    } catch (err: any) {
      setError(err?.message ?? "Falha ao autenticar");
      if (err?.fieldErrors) setFieldErrors(err.fieldErrors);
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
          <Link className="flex flex-col gap-1" to="/">
            <span
              className="inline-flex w-fit items-center gap-1 rounded-full px-3 py-1 text-sm font-black tracking-[0.2em] uppercase"
            >
              <img src={logo} alt="CobrançaPro" className="h-20 w-20 object-contain" />
              CobrançaPro
            </span>
            {/* <span className={`text-[10px] tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              SaaS AUTOMATION
            </span> */}
          </Link>
          <div />
        </header>

        <div
          className={`mx-auto w-full max-w-lg rounded-3xl border p-7 shadow-[0_30px_80px_-50px_rgba(15,23,42,0.2)] ${
            isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-white/80"
          }`}
        >
          <div className="flex items-start justify-between gap-6">
            <div>
              <h2 className="font-serif text-2xl">{mode === "login" ? "Entrar" : "Criar conta"}</h2>
              <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                {mode === "login" ? "Acesse o seu painel do cobrançaPro." : "Crie sua empresa em minutos."}
              </p>
            </div>
            <button
              type="button"
              className={`text-xs font-semibold uppercase tracking-[0.2em] ${
                isDark ? "text-slate-300" : "text-slate-900"
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
                  {fieldErrors.legalName?.[0] && (
                    <span className="text-xs text-red-500">{fieldErrors.legalName[0]}</span>
                  )}
                </label>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                  Documento
                  <input
                    className={inputClass}
                    value={form.document}
                    onChange={(e) => setForm({ ...form, document: maskCpfCnpj(e.target.value) })}
                    placeholder="CPF/CNPJ"
                    required
                  />
                  {fieldErrors.document?.[0] && (
                    <span className="text-xs text-red-500">{fieldErrors.document[0]}</span>
                  )}
                </label>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.2em]">
                  Telefone
                  <input
                    className={inputClass}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
                    placeholder="(00) 00000-0000"
                    required
                  />
                  {fieldErrors.phone?.[0] && <span className="text-xs text-red-500">{fieldErrors.phone[0]}</span>}
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
              {fieldErrors.email?.[0] && <span className="text-xs text-red-500">{fieldErrors.email[0]}</span>}
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
              {fieldErrors.password?.[0] && <span className="text-xs text-red-500">{fieldErrors.password[0]}</span>}
            </label>

            {mode === "register" && (
              <>
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
