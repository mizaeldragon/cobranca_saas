// src/jobs/chargeScheduler.ts
import { query } from "../config/db";
import { ChargesService } from "../modules/charges/charges.service";
import { addInterval, toISODate } from "../utils/dates";

type SubscriptionRow = {
  id: string;
  company_id: string;
  customer_id: string;
  amount_cents: number;
  interval: "weekly" | "monthly" | "yearly";
  payment_method: "pix" | "boleto" | "card";
  next_due_date: string; // YYYY-MM-DD
  active: boolean;

  // fees
  fine_cents: number;
  interest_bps: number;
  discount_cents: number;
  discount_days_before: number;
};

function isISODate(d: any): d is string {
  return typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d);
}

function startOfDayISO(d = new Date()): string {
  return toISODate(d);
}

export async function markOverdueCharges(todayISO = startOfDayISO()) {
  if (!isISODate(todayISO)) todayISO = startOfDayISO();

  // Marca como overdue tudo que venceu antes de hoje e ainda está pending
  const rows = await query<{ id: string }>(
    `
    UPDATE charges
    SET status = 'overdue'
    WHERE status = 'pending'
      AND due_date < $1::date
    RETURNING id
    `,
    [todayISO]
  );

  return { overdueMarked: rows.length, date: todayISO };
}

export async function runChargeSchedulerOnce(todayISO = startOfDayISO()) {
  if (!isISODate(todayISO)) todayISO = startOfDayISO();

  // 1) Atualiza overdue primeiro
  const overdue = await markOverdueCharges(todayISO);

  // 2) Pega assinaturas ativas que vencem hoje (ou já venceram e ainda não foram geradas)
  // Como usamos idempotency_key unique, pode buscar <= hoje tranquilamente
  const subs = await query<SubscriptionRow>(
    `
    SELECT
      id,
      company_id,
      customer_id,
      amount_cents,
      interval,
      payment_method,
      next_due_date,
      active,
      COALESCE(fine_cents,0) as fine_cents,
      COALESCE(interest_bps,0) as interest_bps,
      COALESCE(discount_cents,0) as discount_cents,
      COALESCE(discount_days_before,0) as discount_days_before
    FROM subscriptions
    WHERE active = true
      AND next_due_date <= $1::date
    ORDER BY next_due_date ASC
    LIMIT 500
    `,
    [todayISO]
  );

  let processed = 0;

  for (const s of subs) {
    // Idempotência por assinatura+vencimento (não duplica cobrança)
    const idempotencyKey = `sub:${s.id}:due:${s.next_due_date}`;

    // cria cobrança (se já existir, o ChargesService devolve a existente e não cria no provider)
    await ChargesService.createManual(s.company_id, {
      customerId: s.customer_id,
      amountCents: s.amount_cents,
      dueDate: s.next_due_date,
      paymentMethod: s.payment_method,
      description: `Recorrência (${s.interval}) - subscription ${s.id}`,
      idempotencyKey,
      fineCents: s.fine_cents,
      interestBps: s.interest_bps,
      discountCents: s.discount_cents,
      discountDaysBefore: s.discount_days_before,
    });

    // Atualiza próxima data de vencimento da assinatura
    const next = addInterval(new Date(s.next_due_date + "T00:00:00"), s.interval);
    await query(`UPDATE subscriptions SET next_due_date = $1 WHERE id = $2`, [toISODate(next), s.id]);

    processed += 1;
  }

  return { date: todayISO, processed, overdue };
}

/**
 * MVP: roda no mesmo processo do server.
 * Produção: ideal rodar worker separado.
 */
export function startChargeSchedulerLoop() {
  // a cada 5 minutos
  const intervalMs = 5 * 60 * 1000;

  // roda logo ao iniciar também
  runChargeSchedulerOnce().catch((e) => console.error("[scheduler] first run error:", e));

  setInterval(async () => {
    try {
      const result = await runChargeSchedulerOnce();
      if (result.processed > 0 || result.overdue.overdueMarked > 0) {
        console.log("[scheduler] tick:", result);
      }
    } catch (e) {
      console.error("[scheduler] tick error:", e);
    }
  }, intervalMs);
}
