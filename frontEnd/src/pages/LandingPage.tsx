import { Link } from "react-router-dom";
import { useState } from "react";

// Ícones SVG simples para não depender de bibliotecas externas
const Icons = {
  Check: () => (
    <svg className="h-5 w-5 flex-shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Star: () => (
    <svg className="h-5 w-5 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20" fill="currentColor">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  Zap: () => (
    <svg className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Chart: () => (
    <svg className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
    </svg>
  ),
  Shield: () => (
    <svg className="h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  )
};

type LandingPageProps = {
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

export function LandingPage({ theme, onToggleTheme }: LandingPageProps) {
  const isDark = theme === "dark";
  // Estado simples para FAQ
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden px-6 pb-20 pt-8 transition-colors duration-300 ${
        isDark ? "bg-slate-950 text-slate-100" : "bg-[#f8f6f2] text-slate-900"
      }`}
    >
      {/* Background Effects */}
      <div
        className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
          isDark
            ? "bg-[radial-gradient(900px_380px_at_10%_-10%,rgba(56,189,248,0.2),transparent_55%),radial-gradient(900px_380px_at_85%_0%,rgba(249,115,22,0.18),transparent_55%),linear-gradient(180deg,#0b0f1a_0%,#0f172a_100%)] opacity-100"
            : "bg-[radial-gradient(1000px_420px_at_15%_-10%,rgba(45,182,163,0.28),transparent_55%),radial-gradient(900px_420px_at_90%_0%,rgba(245,158,11,0.18),transparent_55%),linear-gradient(180deg,#f8f6f2_0%,#efe8dc_100%)] opacity-100"
        }`}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(17,24,39,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(17,24,39,0.04)_1px,transparent_1px)] bg-[length:32px_32px]" />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-16 md:gap-24">
        {/* HEADER */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sticky top-0 z-50 py-4 -mx-6 px-6 backdrop-blur-md">
          <div className="flex flex-col gap-1">
            <span
              className={`inline-flex w-fit items-center rounded-full px-4 py-1 text-sm font-black tracking-[0.2em] uppercase shadow-sm ${
                isDark ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-slate-50"
              }`}
            >
              CobrançaPro
            </span>
            {/* <span className={`text-[10px] tracking-widest ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              SaaS AUTOMATION
            </span> */}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all hover:scale-105 ${
                isDark
                  ? "border-slate-700 bg-slate-900/50 text-slate-300 hover:bg-slate-800"
                  : "border-slate-200 bg-white/50 text-slate-600 hover:bg-white"
              }`}
              type="button"
              onClick={onToggleTheme}
            >
              {isDark ? "☀️ Claro" : "🌙 Escuro"}
            </button>
            <Link
              className={`group flex items-center gap-2 rounded-full border px-6 py-2 text-sm font-bold shadow-lg transition-all hover:-translate-y-0.5 ${
                isDark
                  ? "border-indigo-500/30 bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-indigo-500/25"
                  : "border-slate-900 bg-slate-900 text-white hover:bg-slate-800 hover:shadow-xl"
              }`}
              to="/login"
            >
              Entrar
            </Link>
          </div>
        </header>

        {/* HERO SECTION */}
        <section className="grid gap-8 pt-10 text-center md:pt-16 lg:text-left lg:grid-cols-2 lg:gap-12 items-center">
          <div className="space-y-8">
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
               isDark ? "border-amber-500/30 bg-amber-500/10 text-amber-300" : "border-amber-600/30 bg-amber-100 text-amber-700"
            }`}>
              <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse"></span>
              Nova Integração com Cora e Asaas V3 disponível
            </div>
            
            <h1 className="font-serif text-5xl font-medium leading-[1.1] tracking-tight sm:text-6xl md:text-7xl">
              Pare de fazer cobranças <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
                manualmente.
              </span>
            </h1>
            
            <p className={`max-w-2xl text-lg leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              O CobrançaPro automatiza 100% do seu financeiro. Emita boletos, Pix e gerencie assinaturas enquanto você dorme.
              <br className="hidden md:block"/> Recupere até <strong className={isDark ? "text-white" : "text-black"}>20% da receita perdida</strong> com inadimplência.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 px-8 text-sm font-bold text-white shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(79,70,229,0.6)]"
              >
                Testar Grátis por 7 dias
                <Icons.ArrowRight />
              </Link>
              <button className={`inline-flex h-12 items-center justify-center rounded-full border px-8 text-sm font-bold transition-all hover:bg-slate-100/10 ${
                isDark ? "border-slate-700 text-slate-300" : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}>
                Ver Demonstração
              </button>
            </div>
            <p className="text-xs text-slate-500 uppercase tracking-widest">Sem cartão de crédito • Cancelamento a qualquer hora</p>
          </div>

          {/* Hero Visual/Image Placeholder */}
          <div className={`relative aspect-square md:aspect-video lg:aspect-square rounded-3xl border p-4 shadow-2xl ${
            isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white/50"
          }`}>
             {/* Abstract UI Representation */}
             <div className={`absolute inset-0 rounded-3xl overflow-hidden opacity-50 ${
                isDark 
                ? "bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-blue-500/10" 
                : "bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-50"
             }`} />
             <div className="relative h-full w-full rounded-xl border border-dashed border-slate-400/30 flex items-center justify-center flex-col gap-4">
                <div className="w-3/4 h-8 rounded-lg bg-slate-500/20 animate-pulse"></div>
                <div className="w-1/2 h-8 rounded-lg bg-slate-500/20 animate-pulse delay-75"></div>
                <div className="w-2/3 h-32 rounded-lg bg-slate-500/10 mt-4"></div>
                
                {/* Floating Badge */}
                <div className={`absolute -right-4 top-10 flex items-center gap-3 rounded-xl border p-3 shadow-xl backdrop-blur-md ${
                   isDark ? "border-slate-700 bg-slate-800/90" : "border-white bg-white/90"
                } animate-bounce duration-[3000ms]`}>
                   <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
                      <Icons.Zap />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-slate-500">Receita Recuperada</p>
                      <p className="text-lg font-bold text-emerald-500">+ R$ 12.450,00</p>
                   </div>
                </div>
             </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <section className="py-8 border-y border-slate-500/10">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
            Empresas que escalaram com o CobrançaPro
          </p>
          <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale transition-all hover:grayscale-0 hover:opacity-100">
             {/* Placeholder Logos - substitua por SVGs reais */}
             {['Acme Corp', 'GlobalBank', 'TechStart', 'FinanceFlow', 'DevHouse'].map(logo => (
                <span key={logo} className="text-xl font-black font-serif text-slate-500">{logo}</span>
             ))}
          </div>
        </section>

        {/* METRICS / STATS */}
        <section className="grid gap-4 md:grid-cols-3">
          {[
            { title: "+20%", desc: "recuperação de receita", icon: <Icons.Chart /> },
            { title: "100%", desc: "automação via webhook", icon: <Icons.Zap /> },
            { title: "Zero", desc: "erros manuais em planilhas", icon: <Icons.Shield /> },
          ].map((item) => (
            <div
              key={item.title}
              className={`group relative overflow-hidden rounded-3xl border p-6 transition-all hover:-translate-y-1 hover:shadow-2xl ${
                isDark 
                  ? "border-slate-800 bg-slate-900/40 hover:border-indigo-500/30" 
                  : "border-slate-200 bg-white/60 hover:border-indigo-200"
              }`}
            >
              <div className="absolute -right-4 -top-4 opacity-5 transition-transform group-hover:scale-110 group-hover:opacity-10">
                 <div className="scale-[3]">{item.icon}</div>
              </div>
              <div className="mb-4 inline-flex rounded-xl bg-slate-500/10 p-3">
                {item.icon}
              </div>
              <strong className="block text-3xl font-bold tracking-tight">{item.title}</strong>
              <span className={`text-sm font-medium ${isDark ? "text-slate-400" : "text-slate-500"}`}>{item.desc}</span>
            </div>
          ))}
        </section>

        {/* FEATURES GRID */}
        <section className="space-y-12">
           <div className="text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">Tudo o que você precisa.</h2>
              <p className={`mt-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Uma suíte completa para gerenciar o ciclo de vida do seu cliente.</p>
           </div>
           
           <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Cobrança recorrente", desc: "Configure a recorrência (mensal, anual) e esqueça. O sistema envia tudo." },
              { title: "Pagamentos flexíveis", desc: "Seu cliente escolhe: Boleto, Pix copia-e-cola ou Cartão de Crédito." },
              { title: "Área do Cliente", desc: "Um portal white-label para seu cliente baixar 2ª via e notas fiscais." },
              { title: "Régua de Cobrança", desc: "E-mails e WhatsApp automáticos antes, no dia e após o vencimento." },
            ].map((item, i) => (
              <article
                key={item.title}
                className={`flex flex-col rounded-2xl border p-5 shadow-sm transition-colors ${
                  isDark ? "border-slate-800 bg-slate-900/60 hover:bg-slate-800" : "border-slate-200 bg-white/60 hover:bg-white"
                }`}
              >
                <div className="mb-3 text-xs font-bold text-indigo-500">0{i + 1}</div>
                <h3 className="text-lg font-bold">{item.title}</h3>
                <p className={`mt-2 text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>{item.desc}</p>
              </article>
            ))}
          </div>
        </section>

        {/* PRICING SECTION - NOVO! */}
        <section className="relative scroll-mt-24" id="precos">
           <div className="absolute inset-0 flex items-center justify-center opacity-30 blur-3xl pointer-events-none">
              <div className="h-64 w-64 rounded-full bg-indigo-500"></div>
              <div className="h-64 w-64 rounded-full bg-blue-500 -ml-20"></div>
           </div>

           <div className="relative text-center mb-12">
              <h2 className="text-3xl font-bold sm:text-5xl">Planos que se pagam.</h2>
              <p className={`mt-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>Escolha o melhor plano para o estágio do seu negócio.</p>
           </div>

           <div className="relative grid gap-8 lg:grid-cols-3 items-center">
              {/* STARTER */}
              <div className={`rounded-3xl border p-8 ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white/50"}`}>
                 <h3 className="text-lg font-semibold text-slate-500">Starter</h3>
                 <div className="my-4 flex items-baseline">
                    <span className="text-3xl font-bold">R$ 49</span>
                    <span className="text-slate-500">/mês</span>
                 </div>
                 <p className="text-sm text-slate-500 mb-6">Para quem está começando a organizar a casa.</p>
                 <button className={`w-full rounded-xl border py-3 text-sm font-bold transition-transform active:scale-95 ${
                    isDark ? "border-slate-700 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-50"
                 }`}>Começar Starter</button>
                 <ul className="mt-8 space-y-4 text-sm text-left">
                    {['Até 50 clientes', 'Cobranças ilimitadas', 'Painel Básico'].map(feat => (
                       <li key={feat} className="flex items-center gap-3"><Icons.Check /><span className="text-slate-500">{feat}</span></li>
                    ))}
                 </ul>
              </div>

              {/* PRO (Highlighted) */}
              <div className={`relative rounded-3xl border-2 p-8 shadow-2xl scale-105 z-10 ${
                 isDark ? "border-indigo-500 bg-slate-900" : "border-indigo-600 bg-white"
              }`}>
                 <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-indigo-600 px-4 py-1 text-xs font-bold text-white uppercase tracking-wider">
                    Mais Popular
                 </div>
                 <h3 className="text-lg font-semibold text-indigo-500">Pro Business</h3>
                 <div className="my-4 flex items-baseline">
                    <span className="text-5xl font-bold">R$ 129</span>
                    <span className="text-slate-500">/mês</span>
                 </div>
                 <p className={`text-sm mb-6 ${isDark ? "text-slate-300" : "text-slate-600"}`}>Automação total para empresas em crescimento.</p>
                 <button className="w-full rounded-xl bg-indigo-600 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:bg-indigo-700 active:scale-95">
                    Assinar Pro Business
                 </button>
                 <ul className={`mt-8 space-y-4 text-sm text-left ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                    {['Clientes Ilimitados', 'Integração WhatsApp API', 'Múltiplos Usuários', 'Webhook em Tempo Real', 'Suporte Prioritário'].map(feat => (
                       <li key={feat} className="flex items-center gap-3">
                          <div className="rounded-full bg-indigo-500/20 p-1"><Icons.Check /></div>
                          <span>{feat}</span>
                       </li>
                    ))}
                 </ul>
              </div>

              {/* ENTERPRISE */}
              <div className={`rounded-3xl border p-8 ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white/50"}`}>
                 <h3 className="text-lg font-semibold text-slate-500">Enterprise</h3>
                 <div className="my-4 flex items-baseline">
                    <span className="text-3xl font-bold">Sob Medida</span>
                 </div>
                 <p className="text-sm text-slate-500 mb-6">Para grandes volumes e necessidades específicas.</p>
                 <button className={`w-full rounded-xl border py-3 text-sm font-bold transition-transform active:scale-95 ${
                    isDark ? "border-slate-700 hover:bg-slate-800" : "border-slate-300 hover:bg-slate-50"
                 }`}>Falar com Vendas</button>
                 <ul className="mt-8 space-y-4 text-sm text-left">
                    {['API Dedicada', 'Gerente de Conta', 'Setup Assistido', 'SLA Garantido'].map(feat => (
                       <li key={feat} className="flex items-center gap-3"><Icons.Check /><span className="text-slate-500">{feat}</span></li>
                    ))}
                 </ul>
              </div>
           </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="grid gap-6 md:grid-cols-2">
           {[
              { q: "O CobrançaPro reduziu nossa inadimplência em 40% no primeiro mês. Simplesmente funciona.", author: "Ricardo Silva", role: "CEO da Agência R" },
              { q: "Eu perdia 2 dias por mês gerando boletos. Agora faço em 5 minutos. O suporte é incrível.", author: "Ana Clara", role: "Fundadora do FitBox" }
           ].map((t, i) => (
              <div key={i} className={`flex flex-col gap-4 rounded-2xl border p-6 ${
                 isDark ? "border-slate-800 bg-slate-900/30" : "border-slate-200 bg-white/60"
              }`}>
                 <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => <Icons.Star key={s} />)}
                 </div>
                 <p className="text-lg italic font-medium">"{t.q}"</p>
                 <div className="mt-auto pt-4 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200" />
                    <div>
                       <p className="text-sm font-bold">{t.author}</p>
                       <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                 </div>
              </div>
           ))}
        </section>

        {/* FAQ - Acordeão Simples */}
        <section className="max-w-2xl mx-auto w-full">
           <h2 className="text-2xl font-bold text-center mb-8">Dúvidas Frequentes</h2>
           <div className="grid gap-4">
              {[
                 { q: "Preciso ter conta em qual banco?", a: "Integramos com os principais: Cora, Inter, Itaú, Bradesco e também gateways como Asaas e Iugu." },
                 { q: "Como funciona o teste grátis?", a: "Você tem acesso total ao plano Pro por 7 dias. Não pedimos cartão de crédito para começar." },
                 { q: "Posso cancelar quando quiser?", a: "Sim, sem multas e sem fidelidade. Você é livre para ir e vir." }
              ].map((item, idx) => (
                 <div key={idx} className={`rounded-2xl border overflow-hidden transition-all ${
                    isDark ? "border-slate-800 bg-slate-900/40" : "border-slate-200 bg-white/60"
                 }`}>
                    <button 
                       onClick={() => toggleFaq(idx)}
                       className="flex w-full items-center justify-between p-4 text-left font-semibold"
                    >
                       {item.q}
                       <span className={`transform transition-transform ${openFaq === idx ? "rotate-180" : ""}`}>↓</span>
                    </button>
                    {openFaq === idx && (
                       <div className={`p-4 pt-0 text-sm ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                          {item.a}
                       </div>
                    )}
                 </div>
              ))}
           </div>
        </section>

        {/* FINAL CTA */}
        <section
          className={`relative overflow-hidden flex flex-col items-center justify-between gap-8 rounded-[2.5rem] border p-12 text-center md:text-left md:flex-row ${
            isDark 
               ? "border-slate-700 bg-gradient-to-br from-slate-900 to-indigo-950/50" 
               : "border-slate-200 bg-gradient-to-br from-white to-indigo-50/50"
          }`}
        >
          {/* Decorative glow */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-lg space-y-4">
            <h2 className="text-3xl font-bold md:text-4xl">Pronto para ter sua receita no piloto automático?</h2>
            <p className={`text-base ${isDark ? "text-slate-300" : "text-slate-500"}`}>
              Entre agora e comece a automatizar. Configure em menos de 5 minutos.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium uppercase tracking-wider text-indigo-500">
               <span className="flex items-center gap-1"><Icons.Check /> Setup Instantâneo</span>
               <span className="flex items-center gap-1"><Icons.Check /> Suporte Humanizado</span>
            </div>
          </div>
          <div className="relative z-10">
            <Link
              className={`inline-flex items-center justify-center rounded-2xl px-8 py-4 text-base font-bold shadow-xl transition-transform hover:scale-105 ${
                isDark 
                  ? "bg-slate-100 text-slate-900 hover:bg-white" 
                  : "bg-slate-900 text-slate-50 hover:bg-slate-800"
              }`}
              to="/register"
            >
              Começar Agora
              <Icons.ArrowRight />
            </Link>
            <p className="mt-3 text-center text-xs opacity-60">Teste de 7 dias grátis</p>
          </div>
        </section>

        {/* FOOTER */}
        <footer className={`border-t py-12 text-center text-sm ${isDark ? "border-slate-800 text-slate-500" : "border-slate-200 text-slate-400"}`}>
           <p>&copy; {new Date().getFullYear()} CobrançaPro. Todos os direitos reservados.</p>
           <div className="mt-4 flex justify-center gap-6">
              <a href="#" className="hover:underline">Termos</a>
              <a href="#" className="hover:underline">Privacidade</a>
              <a href="#" className="hover:underline">Suporte</a>
           </div>
        </footer>
      </div>
    </div>
  );
}