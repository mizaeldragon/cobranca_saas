import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { formatCents, formatDate } from "../lib/format";
import { Button, Card, Input, Label, SectionTitle, Select } from "../components/ui";

export function SubscriptionsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    customerId: "",
    amountCents: 5000,
    interval: "monthly",
    paymentMethod: "boleto",
    nextDueDate: "",
  });

  async function load() {
    try {
      const [subsData, customersData] = await Promise.all([
        api.listSubscriptions("?page=1&pageSize=20"),
        api.listCustomers("?page=1&pageSize=50"),
      ]);
      setItems((subsData as any).items ?? subsData ?? []);
      setCustomers((customersData as any).items ?? customersData ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load subscriptions");
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
      await api.createSubscription({
        customerId: form.customerId,
        amountCents: Number(form.amountCents),
        interval: form.interval,
        paymentMethod: form.paymentMethod,
        nextDueDate: form.nextDueDate,
      });
      setForm({ customerId: "", amountCents: 5000, interval: "monthly", paymentMethod: "boleto", nextDueDate: "" });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create subscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <SectionTitle>Assinaturas</SectionTitle>
        <p className="text-sm text-ink-700">Planos recorrentes que alimentam o scheduler.</p>
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
            <Label>Intervalo</Label>
            <Select value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value })}>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </Select>
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
          <div className="space-y-2">
            <Label>Proximo vencimento</Label>
            <Input
              type="date"
              value={form.nextDueDate}
              onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
              required
            />
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Criar assinatura"}
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
                <th>Intervalo</th>
                <th>Proximo vencimento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="text-ink-900">
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-sm text-ink-700">
                    Nenhuma assinatura configurada.
                  </td>
                </tr>
              )}
              {items.map((sub) => (
                <tr key={sub.id} className="border-t border-ink-700/10">
                  <td className="py-3">{sub.customer_name ?? "-"}</td>
                  <td>{formatCents(sub.amount_cents)}</td>
                  <td>{sub.interval}</td>
                  <td>{formatDate(sub.next_due_date)}</td>
                  <td>
                    <span className="badge bg-ink-700/10 text-ink-700">
                      {sub.active ? "ativo" : "inativo"}
                    </span>
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
