import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { formatCents, formatDate } from "../lib/format";
import { Button, Card, Input, Label, SectionTitle, Select } from "../components/ui";

export function ChargesPage() {
  const [charges, setCharges] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerId: "",
    amountCents: 2000,
    dueDate: "",
    paymentMethod: "boleto",
    description: "",
  });

  async function load() {
    try {
      const [chargesData, customersData] = await Promise.all([
        api.listCharges("?page=1&pageSize=20"),
        api.listCustomers("?page=1&pageSize=50"),
      ]);
      setCharges((chargesData as any).items ?? chargesData ?? []);
      setCustomers((customersData as any).items ?? customersData ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load charges");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.createManualCharge({
        customerId: form.customerId,
        amountCents: Number(form.amountCents),
        dueDate: form.dueDate,
        paymentMethod: form.paymentMethod,
        description: form.description || undefined,
      });
      setForm({ customerId: "", amountCents: 2000, dueDate: "", paymentMethod: "boleto", description: "" });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create charge");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <SectionTitle>Cobrancas</SectionTitle>
        <p className="text-sm text-ink-700">Crie cobrancas avulsas e acompanhe status.</p>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <div className="space-y-2">
            <Label>Cliente</Label>
            <Select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required>
              <option value="">Selecione um cliente</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valor (centavos)</Label>
            <Input
              type="number"
              value={form.amountCents}
              onChange={(e) => setForm({ ...form, amountCents: Number(e.target.value) })}
              min={1}
            />
          </div>
          <div className="space-y-2">
            <Label>Vencimento</Label>
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Metodo</Label>
            <Select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
            >
              <option value="boleto">Boleto</option>
              <option value="pix">Pix</option>
              <option value="card">Cartao</option>
            </Select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Descricao</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mensalidade, setup, etc."
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Gerando..." : "Criar cobranca"}
            </Button>
          </div>
          {error && <p className="text-sm text-ember-500 md:col-span-2">{error}</p>}
        </form>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-ink-700">
              <tr>
                <th className="py-2">Cliente</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Link</th>
              </tr>
            </thead>
            <tbody className="text-ink-900">
              {charges.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-sm text-ink-700">
                    Nenhuma cobranca criada.
                  </td>
                </tr>
              )}
              {charges.map((charge) => (
                <tr key={charge.id} className="border-t border-ink-700/10">
                  <td className="py-3">{charge.customer_name ?? "-"}</td>
                  <td>{formatCents(charge.amount_cents)}</td>
                  <td>{formatDate(charge.due_date)}</td>
                  <td>
                    <span className="badge bg-ink-700/10 text-ink-700">{charge.status}</span>
                  </td>
                  <td>
                    {charge.invoice_url ? (
                      <a className="text-sm font-semibold text-tide-600" href={charge.invoice_url} target="_blank">
                        Abrir
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
