import { useEffect, useMemo, useState, type FormEvent } from "react";
import { api } from "../lib/api";
import { getAuth } from "../lib/auth";
import { Card, Input, Label, Button, PaginationBar, SectionTitle } from "../components/ui";
import { maskPhone, onlyDigits } from "../lib/masks";

type UserItem = {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  role: "OWNER" | "ADMIN";
  active: boolean;
  created_at: string;
};

export function UsersPage() {
  const [items, setItems] = useState<UserItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [total, setTotal] = useState(0);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });

  const isOwner = useMemo(() => getAuth()?.role === "OWNER", []);

  async function load(nextPage = page, nextPageSize = pageSize) {
    try {
      const data = (await api.listUsers(`?page=${nextPage}&pageSize=${nextPageSize}&role=ADMIN`)) as any;
      setItems((data?.items ?? data ?? []) as UserItem[]);
      setTotal(Number(data?.total ?? (Array.isArray(data) ? data.length : 0)));
    } catch (err: any) {
      setError(err?.message ?? "Falha ao carregar usuarios");
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
      await api.createUser({
        fullName: form.fullName,
        email: form.email,
        phone: onlyDigits(form.phone),
        password: form.password,
        role: "ADMIN",
      });
      setForm({ fullName: "", email: "", phone: "", password: "" });
      setPage(1);
      await load(1, pageSize);
    } catch (err: any) {
      setError(err?.message ?? "Falha ao criar admin");
      if (err?.fieldErrors) setFieldErrors(err.fieldErrors);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(user: UserItem) {
    if (user.role === "OWNER") return;
    setLoading(true);
    setError(null);
    try {
      await api.updateUser(user.id, { active: !user.active });
      await load();
    } catch (err: any) {
      setError(err?.message ?? "Falha ao atualizar usuario");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <SectionTitle>Usuarios</SectionTitle>
        <p className="text-sm text-ink-700">Gerencie acessos da sua empresa.</p>
      </div>

      <Card>
        {isOwner ? (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div className="space-y-2">
              <Label>Nome completo</Label>
              <Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
              {fieldErrors.fullName?.[0] && <p className="text-xs text-red-500">{fieldErrors.fullName[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              {fieldErrors.email?.[0] && <p className="text-xs text-red-500">{fieldErrors.email[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
                placeholder="(00) 00000-0000"
                required
              />
              {fieldErrors.phone?.[0] && <p className="text-xs text-red-500">{fieldErrors.phone[0]}</p>}
            </div>
            <div className="space-y-2">
              <Label>Senha</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              {fieldErrors.password?.[0] && <p className="text-xs text-red-500">{fieldErrors.password[0]}</p>}
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={loading}>
                {loading ? "Salvando..." : "Criar admin"}
              </Button>
            </div>
            {error && <p className="text-sm text-ember-500 md:col-span-2">{error}</p>}
          </form>
        ) : (
          <p className="text-sm text-ink-700">
            Somente o OWNER pode criar ou alterar usuarios da empresa.
          </p>
        )}
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-ink-700">
              <tr>
                <th className="py-2">Nome</th>
                <th>Email</th>
                <th>Telefone</th>
                <th>Role</th>
                <th>Status</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody className="text-ink-900">
              {items.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-4 text-sm text-ink-700">
                    Nenhum usuario cadastrado.
                  </td>
                </tr>
              )}
              {items.map((user) => (
                <tr key={user.id} className="border-t border-ink-700/10">
                  <td className="py-3">{user.full_name}</td>
                  <td>{user.email}</td>
                  <td>{user.phone ? maskPhone(user.phone) : "-"}</td>
                  <td>{user.role}</td>
                  <td>{user.active ? "Ativo" : "Inativo"}</td>
                  <td>
                    {isOwner && user.role !== "OWNER" ? (
                      <button
                        type="button"
                        className="text-sm font-semibold text-ink-800"
                        onClick={() => toggleActive(user)}
                        disabled={loading}
                      >
                        {user.active ? "Desativar" : "Ativar"}
                      </button>
                    ) : (
                      <span className="text-xs text-ink-600">-</span>
                    )}
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
        {error && <p className="mt-4 text-sm text-ember-500">{error}</p>}
      </Card>
    </div>
  );
}
