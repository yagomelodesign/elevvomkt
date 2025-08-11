"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, TrendingDown, TrendingUp, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

/**
 * Elevvo BI – Dashboard (Dark + Orange)
 * Home: 4 KPIs (Faturamento Mensal, Vendas Mensais, Meta Mensal, Churn Mensal)
 * + gráficos de Faturamento (linha), Vendas (barras) e Churn (linha)
 * Visual: fundo escuro, laranja #FF8A41 → #F96C07
 *
 * OBS: este arquivo usa DADOS DE EXEMPLO (mock).
 * Depois trocamos por consultas ao Supabase.
 */

// ---- tema ----
const ORANGE_GRADIENT = "bg-gradient-to-r from-[#FF8A41] to-[#F96C07]";
const CARD_BG = "bg-zinc-900/60 border-zinc-800";
const TEXT_MUTED = "text-zinc-300";
const TEXT_SOFT = "text-zinc-400";

// ---- tipos ----
type Kpi = {
  label: string;
  value: number;
  deltaPct?: number;
  help?: string;
  suffix?: string;
};

type Filters = {
  month: number; // 1-12
  year: number;
};

// ---- utils ----
const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const pct = (n: number) => `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;

// ---- dados mockados (substituiremos pelo Supabase) ----
const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const sampleMonthly = Array.from({ length: 12 }).map((_, i) => ({
  name: months[i],
  faturamento: 120000 + Math.random() * 60000,
  vendas: 60 + Math.round(Math.random() * 40),
  churn: Math.random() * 6 + 2,
}));

const sampleCategories = [
  { name: "Sites", value: 38 },
  { name: "Tráfego", value: 27 },
  { name: "Conteúdo", value: 20 },
  { name: "Consultoria", value: 15 },
];

const PIE_COLORS = ["#FF8A41", "#F96C07", "#FFB073", "#FF9C5A"];

// ---- página ----
export default function Page() {
  const now = new Date();
  const [filters, setFilters] = useState<Filters>({
    month: now.getMonth() + 1,
    year: now.getFullYear(),
  });
  const [loading, setLoading] = useState(false);
  const [kpis, setKpis] = useState<Kpi[]>([]);

  // simula busca ao trocar mês/ano
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      const mIdx = filters.month - 1;
      const monthRow = sampleMonthly[mIdx];
      const prevRow = sampleMonthly[Math.max(0, mIdx - 1)];

      const faturamentoDelta =
        ((monthRow.faturamento - prevRow.faturamento) / prevRow.faturamento) * 100;
      const vendasDelta =
        ((monthRow.vendas - prevRow.vendas) / Math.max(1, prevRow.vendas)) * 100;
      const churnDelta =
        ((monthRow.churn - prevRow.churn) / Math.max(0.01, prevRow.churn)) * 100;

      const metaMensal = 180000; // depois buscamos em goals (Supabase)
      const metaPct = (monthRow.faturamento / metaMensal) * 100;

      setKpis([
        { label: "Faturamento Mensal", value: monthRow.faturamento, deltaPct: faturamentoDelta },
        { label: "Vendas Mensais", value: monthRow.vendas, deltaPct: vendasDelta },
        {
          label: "Meta Mensal",
          value: metaMensal,
          deltaPct: metaPct - 100,
          suffix: "% atingido",
          help: "% acima/abaixo da meta",
        },
        { label: "Churn Mensal", value: monthRow.churn, deltaPct: churnDelta, suffix: "%" },
      ]);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [filters]);

  const monthName = useMemo(() => months[filters.month - 1], [filters.month]);

  return (
    <div className="min-h-screen w-full bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-30 backdrop-blur border-b border-zinc-800 bg-black/60">
        <div className="mx-auto max-w-[1200px] px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-8 w-8 rounded-xl ${ORANGE_GRADIENT}`} />
            <div>
              <h1 className="text-xl font-semibold">Elevvo — Dashboard BI</h1>
              <p className={`text-xs ${TEXT_SOFT}`}>Visão mensal • {monthName}/{filters.year}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FilterBar filters={filters} setFilters={setFilters} />
            <Button
              className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700"
              onClick={() => window.location.reload()}
              title="Atualizar"
            >
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="mx-auto max-w-[1200px] px-4 py-6 space-y-6">
        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((k, i) => (
            <KpiCard key={i} kpi={k} loading={loading} />
          ))}
        </section>

        {/* Charts */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className={`${CARD_BG} col-span-1 lg:col-span-2`}>
            <CardContent>
              <h3 className="text-sm font-medium mb-2">Evolução de Faturamento (12m)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleMonthly} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <YAxis stroke="#a1a1aa" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                   <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="faturamento" stroke="#FF8A41" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className={`${CARD_BG}`}>
            <CardContent>
              <h3 className="text-sm font-medium mb-2">Vendas por Categoria</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sampleCategories} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={4}>
                      {sampleCategories.map((_, idx) => (
                        <Cell key={`cell-${idx}`} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Secondary grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className={`${CARD_BG} lg:col-span-2`}>
            <CardContent>
              <h3 className="text-sm font-medium mb-2">Vendas (últimos 12 meses)</h3>
              <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
  <BarChart
    data={sampleMonthly}
    margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
  >
    <XAxis
      dataKey="name"
      stroke="#a1a1aa"
      tick={{ fill: "#a1a1aa", fontSize: 12 }}
    />
    <YAxis
      stroke="#a1a1aa"
      tick={{ fill: "#a1a1aa", fontSize: 12 }}
    />
    <Tooltip
      contentStyle={{
        background: "#09090b",
        border: "1px solid #27272a",
        borderRadius: 12,
      }}
    />
    <Bar dataKey="vendas" fill="#F96C07" radius={[6, 6, 0, 0]} />
  </BarChart>
</ResponsiveContainer>

              </div>
            </CardContent>
          </Card>

          <Card className={`${CARD_BG}`}>
            <CardContent>
              <h3 className="text-sm font-medium mb-2">Churn (%, 12 meses)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sampleMonthly} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#a1a1aa" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <YAxis stroke="#a1a1aa" tick={{ fill: "#a1a1aa", fontSize: 12 }} />
                    <Tooltip contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12 }} />
                    <Line type="monotone" dataKey="churn" stroke="#FF9C5A" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-800 mt-8">
        <div className="mx-auto max-w-[1200px] px-4 flex items-center justify-between text-xs text-zinc-500">
          <span>© {now.getFullYear()} Elevvo</span>
          <span>Dark • Orange Gradient • Responsivo</span>
        </div>
      </footer>
    </div>
  );
}

// ---- componentes auxiliares ----
function KpiCard({ kpi, loading }: { kpi: Kpi; loading: boolean }) {
  const positive = (kpi.deltaPct ?? 0) >= 0;
  const TrendIcon = positive ? TrendingUp : TrendingDown;
  const valueFmt =
    kpi.suffix?.includes("%")
      ? `${kpi.value.toFixed(1)}%`
      : isNaN(kpi.value)
      ? String(kpi.value)
      : kpi.label.includes("Vendas")
      ? Math.round(kpi.value).toString()
      : brl(kpi.value);

  return (
    <Card className={`${CARD_BG}`}>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className={`text-xs ${TEXT_SOFT}`}>{kpi.label}</p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl font-semibold">{loading ? "—" : valueFmt}</span>
              {typeof kpi.deltaPct === "number" && (
                <span
                  className={`inline-flex items-center text-xs px-2 py-0.5 rounded-full ${
                    positive ? "bg-emerald-900/40 text-emerald-300" : "bg-rose-900/40 text-rose-300"
                  }`}
                >
                  <TrendIcon className="h-3.5 w-3.5 mr-1" />
                  {pct(kpi.deltaPct)}
                </span>
              )}
            </div>
            {kpi.help && <p className={`mt-1 text-[11px] ${TEXT_MUTED}`}>{kpi.help}</p>}
          </div>
          <div className={`h-8 w-8 rounded-xl ${ORANGE_GRADIENT} opacity-70`} />
        </div>
      </CardContent>
    </Card>
  );
}

function FilterBar({ filters, setFilters }: { filters: Filters; setFilters: (f: Filters) => void }) {
  const years = Array.from({ length: 6 }).map((_, i) => new Date().getFullYear() - i);

  // Selects simples (sem lib) só para trocar mês/ano
  return (
    <div className="flex items-center gap-2">
      <select
        value={filters.month}
        onChange={(e) => setFilters({ ...filters, month: Number(e.target.value) })}
        className="rounded-2xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm"
        title="Mês"
      >
        {months.map((m, idx) => (
          <option value={idx + 1} key={m}>
            {m}
          </option>
        ))}
      </select>
      <select
        value={filters.year}
        onChange={(e) => setFilters({ ...filters, year: Number(e.target.value) })}
        className="rounded-2xl bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm"
        title="Ano"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
      <Button className="bg-zinc-800 border border-zinc-700">
        <ChevronDown className="h-4 w-4" />
        Filtros
      </Button>
    </div>
  );
}
