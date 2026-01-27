import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatCents, formatDate } from "../lib/format";
import { Badge, Card, SectionTitle } from "../components/ui";

type Summary = {
  totals: {
    pending_cents: number;
    paid_cents: number;
    overdue_cents: number;
    pending_count: number;
    paid_count: number;
    overdue_count: number;
  };
};

export function DashboardPage({ canViewReports = true }: { canViewReports?: boolean }) {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [charges, setCharges] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [summaryData, chargesData] = await Promise.all([
          canViewReports ? api.summary("") : Promise.resolve(null),
          api.listCharges("?page=1&pageSize=5"),
        ]);
        if (!active) return;
        setSummary((summaryData as Summary | null) ?? null);
        setCharges((chargesData as any)?.items ?? chargesData ?? []);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message ?? "Failed to load dashboard");
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [canViewReports]);

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <SectionTitle>Dashboard</SectionTitle>
        <p className="text-sm text-ink-700">Visao rapida das suas cobrancas e receita.</p>
      </div>

      {error && <Card className="border border-ember-400/40 text-ember-500">{error}</Card>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">Recebido</p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">
            {formatCents(summary?.totals?.paid_cents ?? 0)}
          </p>
          <p className="text-xs text-ink-700">{summary?.totals?.paid_count ?? 0} pagos</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">Pendente</p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">
            {formatCents(summary?.totals?.pending_cents ?? 0)}
          </p>
          <p className="text-xs text-ink-700">{summary?.totals?.pending_count ?? 0} abertos</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">Overdue</p>
          <p className="mt-2 text-2xl font-semibold text-ink-900">
            {formatCents(summary?.totals?.overdue_cents ?? 0)}
          </p>
          <p className="text-xs text-ink-700">{summary?.totals?.overdue_count ?? 0} em atraso</p>
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-xl text-ink-900">Ultimas cobrancas</h3>
          <Badge tone="tide">Ativo</Badge>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.2em] text-ink-700">
              <tr>
                <th className="py-2">Cliente</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="text-ink-900">
              {charges.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-4 text-sm text-ink-700">
                    Nenhuma cobranca encontrada.
                  </td>
                </tr>
              )}
              {charges.map((charge) => (
                <tr key={charge.id} className="border-t border-ink-700/10">
                  <td className="py-3">{charge.customer_name ?? "Cliente"}</td>
                  <td>{formatCents(charge.amount_cents)}</td>
                  <td>{formatDate(charge.due_date)}</td>
                  <td>
                    <span className="badge bg-ink-700/10 text-ink-700">{charge.status}</span>
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
