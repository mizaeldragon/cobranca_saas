import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { api } from "../lib/api";
import { formatCents, formatDate } from "../lib/format";
import { Button, Card, Input, Label, SectionTitle, Select } from "../components/ui";

export function SubscriptionsPage({ canManage = true }: { canManage?: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({
    customerId: "",
    amountCents: 5000,
    interval: "monthly",
    paymentMethod: "boleto",
    nextDueDate: "",
  });
  const [editForm, setEditForm] = useState({
    amountCents: 0,
    interval: "monthly",
    paymentMethod: "boleto",
    nextDueDate: "",
    active: true,
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
    setFieldErrors({});
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
      if (err?.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(sub: any) {
    setEditingSub(sub);
    setEditForm({
      amountCents: Number(sub.amount_cents ?? 0),
      interval: sub.interval ?? "monthly",
      paymentMethod: sub.payment_method ?? "boleto",
      nextDueDate: String(sub.next_due_date ?? "").slice(0, 10),
      active: Boolean(sub.active),
    });
    setEditOpen(true);
  }

  function resetEdit() {
    setEditOpen(false);
    setEditingSub(null);
    setEditForm({ amountCents: 0, interval: "monthly", paymentMethod: "boleto", nextDueDate: "", active: true });
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingSub) return;
    setLoading(true);
    setError(null);
    setEditFieldErrors({});
    try {
      await api.updateSubscription(editingSub.id, {
        amountCents: Number(editForm.amountCents),
        interval: editForm.interval,
        paymentMethod: editForm.paymentMethod,
        nextDueDate: editForm.nextDueDate,
        active: editForm.active,
      });
      resetEdit();
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update subscription");
      if (err?.fieldErrors) setEditFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  }

  function startDelete(sub: any) {
    setDeleteTarget(sub);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    setError(null);
    try {
      await api.deleteSubscription(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete subscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <SectionTitle>Assinaturas</SectionTitle>
        <p className="text-sm text-ink-700">
          Crie cobrancas automaticas por cliente. Use junto das cobrancas manuais quando precisar.
        </p>
        {!canManage && (
          <p className="mt-2 text-sm font-semibold text-amber-600">
            Seu perfil e somente leitura. Voce pode ver, mas nao pode alterar.
          </p>
        )}
      </div>

      {error && !canManage && (
        <Card className="border border-amber-400/40 text-amber-700">{error}</Card>
      )}

      {canManage && (
        <Card>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
                required
              >
                <option value="">Selecione um cliente</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </Select>
              {fieldErrors.customerId?.[0] && <p className="text-xs text-red-500">{fieldErrors.customerId[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Valor (centavos)</Label>
              <Input
                type="number"
                value={form.amountCents}
                onChange={(e) => setForm({ ...form, amountCents: Number(e.target.value) })}
                min={1}
              />
              {fieldErrors.amountCents?.[0] && <p className="text-xs text-red-500">{fieldErrors.amountCents[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Intervalo</Label>
              <Select value={form.interval} onChange={(e) => setForm({ ...form, interval: e.target.value })}>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </Select>
              {fieldErrors.interval?.[0] && <p className="text-xs text-red-500">{fieldErrors.interval[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Metodo</Label>
              <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                <option value="boleto">Boleto</option>
                <option value="pix">Pix</option>
                <option value="card">Cartao</option>
              </Select>
              {fieldErrors.paymentMethod?.[0] && (
                <p className="text-xs text-red-500">{fieldErrors.paymentMethod[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Proximo vencimento</Label>
              <Input
                type="date"
                value={form.nextDueDate}
                onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                required
              />
              {fieldErrors.nextDueDate?.[0] && <p className="text-xs text-red-500">{fieldErrors.nextDueDate[0]}</p>}
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Criar assinatura"}
              </Button>
            </div>
            {error && <p className="text-sm text-ember-500 md:col-span-2">{error}</p>}
          </form>
        </Card>
      )}

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
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody className="text-ink-900">
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-sm text-ink-700">
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
                  <td className="space-x-2">
                    {canManage ? (
                      <>
                        <button
                          type="button"
                          className="text-sm font-semibold text-ink-800"
                          onClick={() => startEdit(sub)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="text-sm font-semibold text-ember-500"
                          onClick={() => startDelete(sub)}
                        >
                          Excluir
                        </button>
                      </>
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-500">Somente leitura</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {typeof document !== "undefined" &&
        canManage &&
        editOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink-900/60 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-xl animate-rise overflow-hidden rounded-[28px] border border-white/40 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/30 to-tide-400/10" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl text-ink-900">Editar assinatura</h3>
                    <p className="text-sm text-ink-700">
                      Cliente: <strong>{editingSub?.customer_name ?? "-"}</strong>
                    </p>
                  </div>
                  <button type="button" className="text-sm font-semibold text-ink-700" onClick={resetEdit}>
                    Fechar
                  </button>
                </div>
                <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleUpdate}>
                  <div className="space-y-2">
                    <Label>Valor (centavos)</Label>
                    <Input
                      type="number"
                      value={editForm.amountCents}
                      onChange={(e) => setEditForm({ ...editForm, amountCents: Number(e.target.value) })}
                      min={1}
                    />
                    {editFieldErrors.amountCents?.[0] && (
                      <p className="text-xs text-red-500">{editFieldErrors.amountCents[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Intervalo</Label>
                    <Select
                      value={editForm.interval}
                      onChange={(e) => setEditForm({ ...editForm, interval: e.target.value })}
                    >
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                      <option value="yearly">Anual</option>
                    </Select>
                    {editFieldErrors.interval?.[0] && (
                      <p className="text-xs text-red-500">{editFieldErrors.interval[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Metodo</Label>
                    <Select
                      value={editForm.paymentMethod}
                      onChange={(e) => setEditForm({ ...editForm, paymentMethod: e.target.value })}
                    >
                      <option value="boleto">Boleto</option>
                      <option value="pix">Pix</option>
                      <option value="card">Cartao</option>
                    </Select>
                    {editFieldErrors.paymentMethod?.[0] && (
                      <p className="text-xs text-red-500">{editFieldErrors.paymentMethod[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Proximo vencimento</Label>
                    <Input
                      type="date"
                      value={editForm.nextDueDate}
                      onChange={(e) => setEditForm({ ...editForm, nextDueDate: e.target.value })}
                    />
                    {editFieldErrors.nextDueDate?.[0] && (
                      <p className="text-xs text-red-500">{editFieldErrors.nextDueDate[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Status</Label>
                    <Select
                      value={editForm.active ? "active" : "inactive"}
                      onChange={(e) => setEditForm({ ...editForm, active: e.target.value === "active" })}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                    </Select>
                    {editFieldErrors.active?.[0] && <p className="text-xs text-red-500">{editFieldErrors.active[0]}</p>}
                  </div>
                  <div className="flex items-end gap-3">
                    <Button type="submit" disabled={loading}>
                      {loading ? "Salvando..." : "Salvar alteracoes"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={resetEdit}>
                      Cancelar
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>,
          document.body
        )}

      {typeof document !== "undefined" &&
        canManage &&
        deleteTarget &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink-900/60 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md animate-rise overflow-hidden rounded-[26px] border border-white/40 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/30 to-ember-400/10" />
              <div className="relative">
                <h3 className="font-serif text-2xl text-ink-900">Excluir assinatura</h3>
                <p className="mt-2 text-sm text-ink-700">
                  Tem certeza que deseja excluir a assinatura de <strong>{deleteTarget.customer_name ?? "-"}</strong>?
                </p>
                <div className="mt-6 flex gap-3">
                  <Button type="button" onClick={confirmDelete} disabled={loading}>
                    {loading ? "Excluindo..." : "Sim, excluir"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
