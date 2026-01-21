import { Link } from "react-router-dom";

type LandingPageProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function LandingPage({ theme, onToggleTheme }: LandingPageProps) {
  const isDark = theme === "dark";

  return (
    <div
      className={`relative min-h-screen overflow-hidden px-6 pb-20 pt-8 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-[#f8f6f2] text-slate-900"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 ${
          isDark
            ? "bg-[radial-gradient(900px_380px_at_10%_-10%,rgba(56,189,248,0.2),transparent_55%),radial-gradient(900px_380px_at_85%_0%,rgba(249,115,22,0.18),transparent_55%),linear-gradient(180deg,#0b0f1a_0%,#0f172a_100%)]"
            : "bg-[radial-gradient(1000px_420px_at_15%_-10%,rgba(45,182,163,0.28),transparent_55%),radial-gradient(900px_420px_at_90%_0%,rgba(245,158,11,0.18),transparent_55%),linear-gradient(180deg,#f8f6f2_0%,#efe8dc_100%)]"
        }`}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.04)_1px,transparent_1px)] bg-[length:32px_32px]" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2 text-xs tracking-[0.35em] text-slate-500">
            <span
              className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-[11px] font-bold tracking-[0.4em] ${
                isDark ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-50"
              }`}
            >
              CobrançaPro
            </span>
            <span className={isDark ? "text-slate-400" : "text-slate-500"}>SaaS de cobranca automatizada</span>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                isDark
                  ? "border-slate-600 bg-slate-900/70 text-slate-100"
                  : "border-slate-300 bg-white/80 text-slate-800"
              }`}
              type="button"
              onClick={onToggleTheme}
            >
              {isDark ? "Modo claro" : "Modo escuro"}
            </button>
            <Link
              className={`rounded-full border px-5 py-2 text-sm font-semibold ${
                isDark
                  ? "border-slate-600 text-slate-100 hover:bg-slate-900/70"
                  : "border-slate-300 text-slate-800 hover:bg-white/80"
              }`}
              to="/login"
            >
              Entrar
            </Link>
          </div>
        </header>

        <section className="grid gap-5">
          <h1 className="font-serif text-4xl leading-tight sm:text-5xl">
            Automatize cobrancas e mantenha sua receita previsivel.
          </h1>
          <p className={`max-w-2xl text-base ${isDark ? "text-slate-300" : "text-slate-600"}`}>
            Um painel limpo para controlar clientes, assinaturas e pagamentos. Conecte provedores como Asaas agora e
            deixe pronto para Cora e outros bancos.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            { title: "+20%", desc: "recuperacao de receita com cobranca recorrente" },
            { title: "100%", desc: "automacao por webhook seguro" },
            { title: "1 painel", desc: "clientes, cobrancas e relatorios" },
          ].map((item) => (
            <div
              key={item.title}
              className={`rounded-2xl border p-4 shadow-[0_16px_34px_-28px_rgba(15,23,42,0.2)] ${
                isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-white/80"
              }`}
            >
              <strong className="block text-xl">{item.title}</strong>
              <span className={`text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{item.desc}</span>
            </div>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-4">
          {[
            { title: "Cobranca recorrente", desc: "Gere faturas em lote e acompanhe status." },
            { title: "Pagamentos flexiveis", desc: "Boleto, Pix ou cartao em poucos cliques." },
            { title: "Relatorios vivos", desc: "Visao diaria de pendencias e recebidos." },
            { title: "Roadmap aberto", desc: "Integracoes com Cora e outros bancos." },
          ].map((item) => (
            <article
              key={item.title}
              className={`rounded-2xl border p-4 ${
                isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-white/80"
              }`}
            >
              <h3 className="text-sm font-semibold">{item.title}</h3>
              <p className={`mt-2 text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>{item.desc}</p>
            </article>
          ))}
        </section>

        <section
          className={`flex flex-wrap items-center justify-between gap-4 rounded-3xl border p-6 ${
            isDark ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-white/80"
          }`}
        >
          <div>
            <h2 className="text-xl font-semibold">Seu fluxo de cobranca em um so lugar.</h2>
            <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              Entre agora e comece a automatizar. Leva menos de 5 minutos.
            </p>
          </div>
          <Link
            className={`rounded-2xl px-5 py-3 text-sm font-semibold ${
              isDark ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-50"
            }`}
            to="/login"
          >
            Comecar agora
          </Link>
        </section>
      </div>
    </div>
  );
}
