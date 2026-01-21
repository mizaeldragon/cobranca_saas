import { useState, type FormEvent } from "react";
import { api } from "../lib/api";
import type { AuthPayload } from "../lib/auth";
import { Button, Card, Input, Label, Select } from "../components/ui";

type AuthPageProps = {
  onAuth: (payload: AuthPayload) => void;
};

export function AuthPage({ onAuth }: AuthPageProps) {
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
      setError(err?.message ?? "Failed to authenticate");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6 animate-rise">
          <div className="inline-flex items-center gap-3 rounded-full bg-ink-900 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-sand-50">
            CobrancaPro
          </div>
          <h1 className="font-serif text-4xl text-ink-900 md:text-5xl">
            Automate cobranças e mantenha sua receita previsivel.
          </h1>
          <p className="max-w-xl text-base text-ink-700">
            Controle clientes, assinaturas e pagamentos com um painel claro. Conecte provedores como Asaas agora e
            mantenha seu roadmap aberto para Cora e outros bancos.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { title: "Cobrança recorrente", desc: "Gere faturas em lote e acompanhe status." },
              { title: "Webhook seguro", desc: "Confirmacoes automaticas com segredo por empresa." },
              { title: "Relatorios vivos", desc: "Visao diaria de pendencias e recebidos." },
              { title: "Escala multi-tenant", desc: "Uma base para varios clientes SaaS." },
            ].map((item) => (
              <div key={item.title} className="glass rounded-3xl p-4">
                <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                <p className="text-xs text-ink-700">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="animate-rise">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-2xl text-ink-900">{mode === "login" ? "Entrar" : "Criar conta"}</h2>
              <p className="text-sm text-ink-700">
                {mode === "login" ? "Acesse o painel do SaaS." : "Ative sua empresa em minutos."}
              </p>
            </div>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              {mode === "login" ? "Criar conta" : "Entrar"}
            </button>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label>Empresa</Label>
                  <Input
                    value={form.legalName}
                    onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                    placeholder="Nome legal da empresa"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Documento</Label>
                  <Input
                    value={form.document}
                    onChange={(e) => setForm({ ...form, document: e.target.value })}
                    placeholder="CPF/CNPJ"
                    required
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="voce@empresa.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Minimo 6 caracteres"
                required
              />
            </div>

            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label>Banco principal</Label>
                  <Select
                    value={form.bankProvider}
                    onChange={(e) => setForm({ ...form, bankProvider: e.target.value })}
                  >
                    <option value="mock">Mock</option>
                    <option value="asaas">Asaas</option>
                    <option value="cora" disabled>
                      Cora (em breve)
                    </option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>API Key do banco</Label>
                  <Input
                    value={form.providerApiKey}
                    onChange={(e) => setForm({ ...form, providerApiKey: e.target.value })}
                    placeholder="Opcional para mock"
                  />
                </div>
              </>
            )}

            {error && <p className="text-sm text-ember-500">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
