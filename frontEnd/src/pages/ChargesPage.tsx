import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { api } from "../lib/api";
import { formatCents, formatDate } from "../lib/format";
import { Button, Card, Input, Label, PaginationBar, SectionTitle, Select } from "../components/ui";

export function ChargesPage() {
  const [charges, setCharges] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editingCharge, setEditingCharge] = useState<any | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({
    customerId: "",
    amountCents: 2000,
    dueDate: "",
    paymentMethod: "boleto",
    description: "",
  });
  const [editForm, setEditForm] = useState({
    amountCents: 0,
    dueDate: "",
    paymentMethod: "boleto",
  });

  async function load(nextPage = page, nextPageSize = pageSize) {
    try {
      const [chargesData, customersData] = await Promise.all([
        api.listCharges(`?page=${nextPage}&pageSize=${nextPageSize}`),
        api.listCustomers("?page=1&pageSize=50"),
      ]);
      setCharges((chargesData as any).items ?? chargesData ?? []);
      setTotal(Number((chargesData as any).total ?? (Array.isArray(chargesData) ? chargesData.length : 0)));
      setCustomers((customersData as any).items ?? customersData ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load charges");
    }
  }

  useEffect(() => {
    load();
  }, [page]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setFieldErrors({});
    try {
      await api.createManualCharge({
        customerId: form.customerId,
        amountCents: Number(form.amountCents),
        dueDate: form.dueDate,
        paymentMethod: form.paymentMethod,
        description: form.description || undefined,
      });
      setForm({ customerId: "", amountCents: 2000, dueDate: "", paymentMethod: "boleto", description: "" });
      setPage(1);
      await load(1, pageSize);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create charge");
      if (err?.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(charge: any) {
    setEditingCharge(charge);
    setEditForm({
      amountCents: Number(charge.amount_cents ?? 0),
      dueDate: String(charge.due_date ?? "").slice(0, 10),
      paymentMethod: charge.payment_method ?? "boleto",
    });
    setEditOpen(true);
  }

  function resetEdit() {
    setEditOpen(false);
    setEditingCharge(null);
    setEditForm({ amountCents: 0, dueDate: "", paymentMethod: "boleto" });
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingCharge) return;
    setLoading(true);
    setError(null);
    setEditFieldErrors({});
    try {
      await api.updateCharge(editingCharge.id, {
        amountCents: Number(editForm.amountCents),
        dueDate: editForm.dueDate,
        paymentMethod: editForm.paymentMethod,
      });
      resetEdit();
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update charge");
      if (err?.fieldErrors) setEditFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  }

  function startDelete(charge: any) {
    setDeleteTarget(charge);
  }

  async function confirmCancel() {
    if (!deleteTarget) return;
    setLoading(true);
    setError(null);
    try {
      await api.cancelCharge(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to cancel charge");
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
            <Label>Vencimento</Label>
            <Input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            {fieldErrors.dueDate?.[0] && <p className="text-xs text-red-500">{fieldErrors.dueDate[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Metodo</Label>
            <Select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
              <option value="boleto">Boleto</option>
              <option value="pix">Pix</option>
              <option value="card">Cartao</option>
            </Select>
            {fieldErrors.paymentMethod?.[0] && <p className="text-xs text-red-500">{fieldErrors.paymentMethod[0]}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Descricao</Label>
            <Input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Mensalidade, setup, etc."
            />
            {fieldErrors.description?.[0] && <p className="text-xs text-red-500">{fieldErrors.description[0]}</p>}
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
          <table className="table-premium w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-ink-700">
              <tr>
                <th className="py-2">Cliente</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
                <th>Link</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody className="text-ink-900">
              {charges.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-sm text-ink-700">
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
                  <td className="space-x-2">
                    <button
                      type="button"
                      className="text-sm font-semibold text-ink-800"
                      onClick={() => startEdit(charge)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-ember-500"
                      onClick={() => startDelete(charge)}
                    >
                      Cancelar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <PaginationBar
          page={page}
          pageSize={pageSize}
          total={total}
          onPrev={() => setPage((p) => Math.max(1, p - 1))}
          onNext={() => setPage((p) => Math.min(Math.max(1, Math.ceil(total / pageSize)), p + 1))}
        />
      </Card>

      {typeof document !== "undefined" &&
        editOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink-900/60 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-xl animate-rise overflow-hidden rounded-[28px] border border-white/40 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/30 to-tide-400/10" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl text-ink-900">Editar cobranca</h3>
                    <p className="text-sm text-ink-700">
                      Cliente: <strong>{editingCharge?.customer_name ?? "-"}</strong>
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
                    <Label>Vencimento</Label>
                    <Input
                      type="date"
                      value={editForm.dueDate}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    />
                    {editFieldErrors.dueDate?.[0] && (
                      <p className="text-xs text-red-500">{editFieldErrors.dueDate[0]}</p>
                    )}
                  </div>
                  <div className="space-y-2 md:col-span-2">
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
        deleteTarget &&
        createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-ink-900/60 px-4 backdrop-blur-sm">
            <div className="relative w-full max-w-md animate-rise overflow-hidden rounded-[26px] border border-white/40 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/30 to-ember-400/10" />
              <div className="relative">
                <h3 className="font-serif text-2xl text-ink-900">Cancelar cobranca</h3>
                <p className="mt-2 text-sm text-ink-700">
                  Tem certeza que deseja cancelar a cobranca de <strong>{deleteTarget.customer_name ?? "-"}</strong>?
                </p>
                <div className="mt-6 flex gap-3">
                  <Button type="button" onClick={confirmCancel} disabled={loading}>
                    {loading ? "Cancelando..." : "Sim, cancelar"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => setDeleteTarget(null)}>
                    Voltar
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
