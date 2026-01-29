import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { api } from "../lib/api";
import { maskCpfCnpj, maskPhone, onlyDigits } from "../lib/masks";
import { Card, Input, Label, Button, PaginationBar, SectionTitle } from "../components/ui";

export function CustomersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({
    name: "",
    document: "",
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    zip: "",
  });
  const [editForm, setEditForm] = useState({
    name: "",
    document: "",
    email: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    zip: "",
  });

  async function load(nextPage = page, nextPageSize = pageSize) {
    try {
      const data = (await api.listCustomers(`?page=${nextPage}&pageSize=${nextPageSize}`)) as any;
      setItems(data.items ?? data ?? []);
      setTotal(Number(data.total ?? (Array.isArray(data) ? data.length : 0)));
    } catch (err: any) {
      setError(err?.message ?? "Failed to load customers");
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
      const payload = {
        name: form.name,
        document: onlyDigits(form.document),
        email: form.email || undefined,
        phone: form.phone ? onlyDigits(form.phone) : undefined,
        addressLine1: form.addressLine1 || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zip: form.zip || undefined,
      };
      await api.createCustomer(payload);
      setForm({ name: "", document: "", email: "", phone: "", addressLine1: "", city: "", state: "", zip: "" });
      setPage(1);
      await load(1, pageSize);
    } catch (err: any) {
      setError(err?.message ?? "Failed to create customer");
      if (err?.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  }

  function startEdit(customer: any) {
    setEditingId(customer.id);
    setEditForm({
      name: customer.name ?? "",
      document: maskCpfCnpj(customer.document ?? ""),
      email: customer.email ?? "",
      phone: maskPhone(customer.phone ?? ""),
      addressLine1: customer.address_line1 ?? "",
      city: customer.city ?? "",
      state: customer.state ?? "",
      zip: customer.zip ?? "",
    });
    setEditOpen(true);
  }

  function resetEdit() {
    setEditingId(null);
    setEditOpen(false);
    setEditForm({ name: "", document: "", email: "", phone: "", addressLine1: "", city: "", state: "", zip: "" });
  }

  async function handleUpdate(e: FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    setLoading(true);
    setError(null);
    setEditFieldErrors({});
    try {
      await api.updateCustomer(editingId, {
        name: editForm.name,
        document: onlyDigits(editForm.document),
        email: editForm.email || undefined,
        phone: editForm.phone ? onlyDigits(editForm.phone) : undefined,
        addressLine1: editForm.addressLine1 || undefined,
        city: editForm.city || undefined,
        state: editForm.state || undefined,
        zip: editForm.zip || undefined,
      });
      resetEdit();
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to update customer");
      if (err?.fieldErrors) setEditFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  }

  function startDelete(customer: any) {
    setDeleteTarget(customer);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setLoading(true);
    setError(null);
    try {
      await api.deleteCustomer(deleteTarget.id);
      if (editingId === deleteTarget.id) resetEdit();
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to delete customer");
    } finally {
      setDeleteTarget(null);
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <SectionTitle>Clientes</SectionTitle>
        <p className="text-sm text-ink-700">Cadastre e acompanhe quem recebe suas cobrancas.</p>
      </div>

      <Card>
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            {fieldErrors.name?.[0] && <p className="text-xs text-red-500">{fieldErrors.name[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Documento</Label>
            <Input
              value={form.document}
              onChange={(e) => setForm({ ...form, document: maskCpfCnpj(e.target.value) })}
              required
            />
            {fieldErrors.document?.[0] && <p className="text-xs text-red-500">{fieldErrors.document[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {fieldErrors.email?.[0] && <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })} />
            {fieldErrors.phone?.[0] && <p className="text-xs text-red-500">{fieldErrors.phone[0]}</p>}
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Endereco</Label>
            <Input
              value={form.addressLine1}
              onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
              placeholder="Rua e numero"
            />
            {fieldErrors.addressLine1?.[0] && <p className="text-xs text-red-500">{fieldErrors.addressLine1[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            {fieldErrors.city?.[0] && <p className="text-xs text-red-500">{fieldErrors.city[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>UF</Label>
            <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
            {fieldErrors.state?.[0] && <p className="text-xs text-red-500">{fieldErrors.state[0]}</p>}
          </div>
          <div className="space-y-2">
            <Label>CEP</Label>
            <Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
            {fieldErrors.zip?.[0] && <p className="text-xs text-red-500">{fieldErrors.zip[0]}</p>}
          </div>
          <div className="flex items-end">
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : "Adicionar cliente"}
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
                <th className="py-2">Nome</th>
                <th>Documento</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody className="text-ink-900">
              {items.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-sm text-ink-700">
                    Nenhum cliente cadastrado.
                  </td>
                </tr>
              )}
              {items.map((customer) => (
                <tr key={customer.id} className="border-t border-ink-700/10">
                  <td className="py-3">{customer.name}</td>
                  <td>{customer.document}</td>
                  <td>{customer.email ?? "-"}</td>
                  <td>{customer.phone ?? "-"}</td>
                  <td className="space-x-2">
                    <button
                      type="button"
                      className="text-sm font-semibold text-ink-800"
                      onClick={() => startEdit(customer)}
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      className="text-sm font-semibold text-ember-500"
                      onClick={() => startDelete(customer)}
                    >
                      Excluir
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
            <div className="relative w-full max-w-2xl animate-rise overflow-hidden rounded-[28px] border border-white/40 bg-white/90 p-6 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)]">
              <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-white/30 to-tide-400/10" />
              <div className="relative">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-2xl text-ink-900">Editar cliente</h3>
                    <p className="text-sm text-ink-700">Atualize os dados do cliente selecionado.</p>
                  </div>
                  <button type="button" className="text-sm font-semibold text-ink-700" onClick={resetEdit}>
                    Fechar
                  </button>
                </div>
                <form className="mt-6 grid gap-4 md:grid-cols-2" onSubmit={handleUpdate}>
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                {editFieldErrors.name?.[0] && <p className="text-xs text-red-500">{editFieldErrors.name[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Documento</Label>
                <Input
                  value={editForm.document}
                  onChange={(e) => setEditForm({ ...editForm, document: maskCpfCnpj(e.target.value) })}
                />
                {editFieldErrors.document?.[0] && (
                  <p className="text-xs text-red-500">{editFieldErrors.document[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                />
                {editFieldErrors.email?.[0] && <p className="text-xs text-red-500">{editFieldErrors.email[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: maskPhone(e.target.value) })}
                />
                {editFieldErrors.phone?.[0] && <p className="text-xs text-red-500">{editFieldErrors.phone[0]}</p>}
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Endereco</Label>
                <Input
                  value={editForm.addressLine1}
                  onChange={(e) => setEditForm({ ...editForm, addressLine1: e.target.value })}
                />
                {editFieldErrors.addressLine1?.[0] && (
                  <p className="text-xs text-red-500">{editFieldErrors.addressLine1[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                {editFieldErrors.city?.[0] && <p className="text-xs text-red-500">{editFieldErrors.city[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>UF</Label>
                <Input value={editForm.state} onChange={(e) => setEditForm({ ...editForm, state: e.target.value })} />
                {editFieldErrors.state?.[0] && <p className="text-xs text-red-500">{editFieldErrors.state[0]}</p>}
              </div>
              <div className="space-y-2">
                <Label>CEP</Label>
                <Input value={editForm.zip} onChange={(e) => setEditForm({ ...editForm, zip: e.target.value })} />
                {editFieldErrors.zip?.[0] && <p className="text-xs text-red-500">{editFieldErrors.zip[0]}</p>}
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
                <h3 className="font-serif text-2xl text-ink-900">Excluir cliente</h3>
                <p className="mt-2 text-sm text-ink-700">
                  Tem certeza que deseja excluir <strong>{deleteTarget.name}</strong>? Essa acao nao pode ser desfeita.
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
