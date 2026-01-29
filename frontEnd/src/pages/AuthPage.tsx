import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { AuthPayload } from "../lib/auth";

type AuthPageProps = {
  onAuth: (payload: AuthPayload) => void;
};

export function AuthPage({ onAuth }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [form, setForm] = useState({
    legalName: "",
    document: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("cobrancapro.theme");
    if (stored === "dark") setTheme("dark");
  }, []);

  function toggleTheme() {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("cobrancapro.theme", next);
  }

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
          phone: ""
        })) as AuthPayload;
        onAuth(payload);
      }
    } catch (err: any) {
      setError(err?.message ?? "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`auth-shell ${theme === "dark" ? "theme-dark" : ""}`}>
      <header className="auth-nav">
        <div className="auth-brand">
          <span className="auth-pill">CobrancaPro</span>
          <span className="auth-slogan">SaaS de cobranca automatizada</span>
        </div>
        <button type="button" className="auth-toggle" onClick={toggleTheme}>
          {theme === "light" ? "Modo escuro" : "Modo claro"}
        </button>
      </header>

      <section className="auth-hero">
        <div>
          <h1>Automatize cobranças e mantenha sua receita previsível.</h1>
          <p>
            Um painel limpo para controlar clientes, assinaturas e pagamentos. Conecte provedores como Asaas agora e
            deixe pronto para Cora e outros bancos.
          </p>
        </div>
        <div className="auth-stats">
          <div>
            <strong>+20%</strong>
            <span>recuperação de receita com cobrança recorrente</span>
          </div>
          <div>
            <strong>100%</strong>
            <span>automação por webhook seguro</span>
          </div>
          <div>
            <strong>1 painel</strong>
            <span>clientes, cobranças e relatórios</span>
          </div>
        </div>
      </section>

      <section className="auth-highlights">
        {[
          { title: "Cobrança recorrente", desc: "Gere faturas em lote e acompanhe status." },
          { title: "Pagamentos flexíveis", desc: "Boleto, Pix ou cartão em poucos cliques." },
          { title: "Relatórios vivos", desc: "Visão diária de pendências e recebidos." },
          { title: "Roadmap aberto", desc: "Integrações com Cora e outros bancos." },
        ].map((item) => (
          <article key={item.title}>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </article>
        ))}
      </section>

      <section className="auth-form">
        <div className="auth-card">
          <div className="auth-card-head">
            <div>
              <h2>{mode === "login" ? "Entrar" : "Criar conta"}</h2>
              <p>{mode === "login" ? "Acesse o painel do SaaS." : "Ative sua empresa em minutos."}</p>
            </div>
            <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")}>
              {mode === "login" ? "Criar conta" : "Entrar"}
            </button>
          </div>

          <form className="auth-fields" onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <label>
                  Empresa
                  <input
                    value={form.legalName}
                    onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                    placeholder="Nome legal da empresa"
                    required
                  />
                </label>
                <label>
                  Documento
                  <input
                    value={form.document}
                    onChange={(e) => setForm({ ...form, document: e.target.value })}
                    placeholder="CPF/CNPJ"
                    required
                  />
                </label>
              </>
            )}

            <label>
              Email
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="voce@empresa.com"
                required
              />
            </label>

            <label>
              Senha
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimo 6 caracteres"
                required
              />
            </label>

            {error && <p className="auth-error">{error}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
