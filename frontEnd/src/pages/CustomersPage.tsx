import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { Card, Input, Label, Button, SectionTitle } from "../components/ui";

export function CustomersPage() {
  const [items, setItems] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
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

  async function load() {
    try {
      const data = (await api.listCustomers("?page=1&pageSize=20")) as any;
      setItems(data.items ?? data ?? []);
    } catch (err: any) {
      setError(err?.message ?? "Failed to load customers");
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
      await api.createCustomer({
        name: form.name,
        document: form.document,
        email: form.email || undefined,
        phone: form.phone || undefined,
        addressLine1: form.addressLine1 || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        zip: form.zip || undefined,
      });
      setForm({ name: "", document: "", email: "", phone: "", addressLine1: "", city: "", state: "", zip: "" });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Failed to create customer");
    } finally {
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
          </div>
          <div className="space-y-2">
            <Label>Documento</Label>
            <Input value={form.document} onChange={(e) => setForm({ ...form, document: e.target.value })} required />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label>Endereco</Label>
            <Input
              value={form.addressLine1}
              onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
              placeholder="Rua e numero"
            />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>UF</Label>
            <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>CEP</Label>
            <Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
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
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-ink-700">
              <tr>
                <th className="py-2">Nome</th>
                <th>Documento</th>
                <th>Email</th>
                <th>Telefone</th>
              </tr>
            </thead>
            <tbody className="text-ink-900">
              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-sm text-ink-700">
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
