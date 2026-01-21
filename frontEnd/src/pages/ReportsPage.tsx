import { useEffect, useState } from "react";
import { api } from "../lib/api";
import { formatCents } from "../lib/format";
import { Card, SectionTitle } from "../components/ui";

export function ReportsPage() {
  const [summary, setSummary] = useState<any>(null);
  const [mrr, setMrr] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [summaryData, mrrData] = await Promise.all([api.summary(""), api.mrr()]);
        if (!active) return;
        setSummary(summaryData);
        setMrr(mrrData);
      } catch (err: any) {
        if (!active) return;
        setError(err?.message ?? "Failed to load reports");
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-6 animate-rise">
      <div>
        <SectionTitle>Relatorios</SectionTitle>
        <p className="text-sm text-ink-700">Indicadores financeiros para acompanhar sua operacao.</p>
      </div>

      {error && <Card className="border border-ember-400/40 text-ember-500">{error}</Card>}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">MRR estimado</p>
          <p className="mt-2 text-3xl font-semibold text-ink-900">{formatCents(mrr?.mrrCents ?? 0)}</p>
          <p className="text-xs text-ink-700">Assinaturas ativas mensalizadas.</p>
        </Card>
        <Card>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">Recebido total</p>
          <p className="mt-2 text-3xl font-semibold text-ink-900">{formatCents(summary?.totals?.paid_cents ?? 0)}</p>
          <p className="text-xs text-ink-700">Cobrancas confirmadas.</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-serif text-xl text-ink-900">Historico por mes</h3>
        <div className="mt-4 space-y-3">
          {(summary?.byMonth ?? []).map((item: any) => (
            <div key={item.month} className="flex items-center justify-between border-b border-ink-700/10 pb-2">
              <div>
                <p className="text-sm font-semibold text-ink-900">{item.month}</p>
                <p className="text-xs text-ink-700">Pago vs aberto</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-ink-900">{formatCents(item.paid_cents)}</p>
                <p className="text-xs text-ink-700">{formatCents(item.open_cents)}</p>
              </div>
            </div>
          ))}
          {!summary?.byMonth?.length && <p className="text-sm text-ink-700">Sem dados ainda.</p>}
        </div>
      </Card>
    </div>
  );
}
