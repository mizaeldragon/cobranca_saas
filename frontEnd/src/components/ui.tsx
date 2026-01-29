import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  PropsWithChildren,
  SelectHTMLAttributes,
} from "react";

export function Card({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  return <div className={`glass panel-premium rounded-3xl p-6 ${className}`}>{children}</div>;
}

export function SectionTitle({ children }: PropsWithChildren) {
  return <h2 className="font-serif text-2xl text-ink-900">{children}</h2>;
}

export function Label({ children }: PropsWithChildren) {
  return <label className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-700">{children}</label>;
}

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-2xl border border-ink-700/10 bg-white/90 px-4 py-3 text-sm text-ink-900 shadow-sm outline-none transition focus:border-ember-400 focus:ring-2 focus:ring-ember-400/30 ${
        props.className ?? ""
      }`}
    />
  );
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-2xl border border-ink-700/10 bg-white/90 px-4 py-3 text-sm text-ink-900 shadow-sm outline-none transition focus:border-ember-400 focus:ring-2 focus:ring-ember-400/30 ${
        props.className ?? ""
      }`}
    />
  );
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "outline" }
>) {
  const base = "rounded-2xl px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember-400/40";
  const styles = {
    primary:
      "bg-ink-900 text-sand-50 hover:-translate-y-[1px] hover:bg-ink-800 shadow-glow shadow-[0_18px_40px_-26px_rgba(17,34,78,0.5)]",
    ghost: "bg-transparent text-ink-800 hover:bg-ink-700/10",
    outline:
      "border border-ink-700/20 text-ink-800 hover:bg-ink-700/10 hover:-translate-y-[1px] shadow-[0_10px_24px_-20px_rgba(17,34,78,0.4)]",
  } as const;

  return (
    <button {...props} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </button>
  );
}

export function Badge({ children, tone = "tide" }: PropsWithChildren<{ tone?: "tide" | "ember" | "slate" }>) {
  const tones = {
    tide: "badge-soft",
    ember: "bg-ember-400/20 text-ember-500 border border-ember-400/30",
    slate: "bg-ink-700/10 text-ink-700 border border-ink-700/15",
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}

export function PaginationBar({
  page,
  pageSize,
  total,
  onPrev,
  onNext,
}: {
  page: number;
  pageSize: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(total, page * pageSize);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-700">
      <span>
        Mostrando {start} - {end} de {total}
      </span>
      <div className="flex items-center gap-2">
        <span>
          Pagina {page} de {totalPages}
        </span>
        <div className="flex items-center gap-1 rounded-full border border-ink-700/20 bg-white/70 p-1 shadow-sm">
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-700/10 disabled:opacity-50"
            onClick={onPrev}
            disabled={page <= 1}
            aria-label="Pagina anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="rounded-full px-4 py-2 text-sm font-semibold text-ink-700 transition hover:bg-ink-700/10 disabled:opacity-50"
            onClick={onNext}
            disabled={page >= totalPages}
            aria-label="Proxima pagina"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
