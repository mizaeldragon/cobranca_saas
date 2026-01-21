import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { Button, Card, Input, Label, SectionTitle, Select } from "../components/ui";

export function SettingsPage() {
  const [form, setForm] = useState({
    legalName: "",
    bankProvider: "mock",
    providerApiKey: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = (await api.getCompany()) as any;
        if (!active) return;
        setForm({
          legalName: data.legal_name ?? "",
          bankProvider: data.bank_provider ?? "mock",
          providerApiKey: "",
        });
      } catch (err: any) {
        if (!active) return;
        setError(err?.message ?? "Failed to load company");
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.updateCompany({
        legalName: form.legalName || undefined,
        bankProvider: form.bankProvider,
        providerApiKey: form.providerApiKey || null,
      });
      setSuccess("Empresa atualizada.");
    } catch (err: any) {
      setError(err?.message ?? "Failed to update company");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <SectionTitle>Configurar empresa</SectionTitle>
        <p className="text-sm text-ink-700">Atualize dados, banco principal e credenciais.</p>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label>Nome legal</Label>
            <Input value={form.legalName} onChange={(e) => setForm({ ...form, legalName: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Banco principal</Label>
            <Select value={form.bankProvider} onChange={(e) => setForm({ ...form, bankProvider: e.target.value })}>
              <option value="mock">Mock</option>
              <option value="asaas">Asaas</option>
              <option value="cora" disabled>
                Cora (em breve)
              </option>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>API Key</Label>
            <Input
              value={form.providerApiKey}
              onChange={(e) => setForm({ ...form, providerApiKey: e.target.value })}
              placeholder="Deixe vazio para manter"
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Salvar alteracoes"}
            </Button>
          </div>
          {error && <p className="text-sm text-ember-500 md:col-span-2">{error}</p>}
          {success && <p className="text-sm text-tide-600 md:col-span-2">{success}</p>}
        </form>
      </Card>
    </div>
  );
}
