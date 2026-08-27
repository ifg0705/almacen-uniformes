import { createFileRoute } from "@tanstack/react-router";
import { type ReactNode, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Boxes, PackageCheck, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { FAMILY_LABEL, ROLE_LABEL, stockStatus } from "@/lib/catalog";
import { useInventory } from "@/lib/store";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

const PIE_COLORS = ["#111111", "#4b4b4b", "#858585", "#b7b7b7"];

function Dashboard() {
  const items = useInventory((s) => s.items);
  const deliveries = useInventory((s) => s.deliveries);
  const movements = useInventory((s) => s.movements);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const data = useMemo(() => {
    const itemById = new Map(items.map((item) => [item.id, item]));
    const stockByFamily = new Map<string, number>();
    for (const item of items) {
      stockByFamily.set(item.family, (stockByFamily.get(item.family) ?? 0) + item.stock);
    }

    const stockFamily = [...stockByFamily.entries()]
      .map(([family, stock]) => ({
        name: FAMILY_LABEL[family as keyof typeof FAMILY_LABEL] ?? family,
        stock,
      }))
      .sort((a, b) => b.stock - a.stock)
      .slice(0, 8);

    const outByFamily = new Map<string, number>();
    for (const delivery of deliveries) {
      for (const line of delivery.lines) {
        const family = itemById.get(line.itemId)?.family ?? "otro";
        outByFamily.set(family, (outByFamily.get(family) ?? 0) + line.qty);
      }
    }
    const mostDelivered = [...outByFamily.entries()]
      .map(([family, qty]) => ({
        name: FAMILY_LABEL[family as keyof typeof FAMILY_LABEL] ?? family,
        qty,
      }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 8);

    const roleCount = new Map<string, number>();
    for (const delivery of deliveries) {
      roleCount.set(delivery.role, (roleCount.get(delivery.role) ?? 0) + 1);
    }
    const roles = [...roleCount.entries()].map(([role, value]) => ({
      name: ROLE_LABEL[role as keyof typeof ROLE_LABEL] ?? role,
      value,
    }));

    const now = new Date();
    const monthRows: Array<{ key: string; name: string; entregas: number }> = [];
    for (let offset = 5; offset >= 0; offset -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      monthRows.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        name: d.toLocaleDateString("es-MX", { month: "short" }).replace(".", ""),
        entregas: 0,
      });
    }
    for (const delivery of deliveries) {
      const row = monthRows.find((m) => delivery.date.startsWith(m.key));
      if (row) row.entregas += 1;
    }

    const critical = items
      .filter((item) => stockStatus(item) !== "ok")
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10)
      .map((item) => ({
        name: `${item.size} · ${FAMILY_LABEL[item.family]}`,
        stock: item.stock,
        minimo: item.minStock,
      }));

    const agotados = items.filter((item) => stockStatus(item) === "agotado").length;
    const bajos = items.filter((item) => stockStatus(item) === "bajo").length;
    const piezas = items.reduce((sum, item) => sum + item.stock, 0);
    const entradas = movements.filter((m) => m.type === "entrada").length;
    const individual = deliveries.filter((d) => d.kind === "individual").length;

    return { stockFamily, mostDelivered, roles, monthRows, critical, agotados, bajos, piezas, entradas, individual };
  }, [items, deliveries, movements]);

  return (
    <div className="space-y-7">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Indicadores</p>
        <h1 className="font-display text-3xl tracking-tight text-primary">Dashboard de uniformes</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Vista rápida del inventario, las entregas y los productos que requieren reposición. Las
          gráficas se alimentan de los registros guardados en el sistema.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Piezas disponibles" value={data.piezas} icon={Boxes} />
        <Kpi label="Entregas registradas" value={deliveries.length} icon={PackageCheck} />
        <Kpi label="Stock bajo" value={data.bajos} icon={TrendingDown} warn={data.bajos > 0} />
        <Kpi label="Agotados" value={data.agotados} icon={AlertTriangle} danger={data.agotados > 0} />
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Existencias por tipo de prenda" subtitle="Piezas disponibles agrupadas por familia">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.stockFamily} layout="vertical" margin={{ left: 12, right: 14 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" />
                <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="stock" fill="#111111" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <ChartLoading />}
        </ChartCard>

        <ChartCard title="Entregas de los últimos 6 meses" subtitle="Número de registros de entrega por mes">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.monthRows} margin={{ left: 0, right: 16, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="entregas" stroke="#111111" strokeWidth={3} dot={{ r: 4, fill: "#111111" }} />
              </LineChart>
            </ResponsiveContainer>
          ) : <ChartLoading />}
        </ChartCard>

        <ChartCard title="Prendas más entregadas" subtitle="Acumulado de piezas entregadas por tipo">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.mostDelivered} margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-18} textAnchor="end" height={70} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="qty" fill="#3f3f46" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <ChartLoading />}
        </ChartCard>

        <ChartCard title="Entregas por puesto" subtitle={`Incluye ${data.individual} cambios o reposiciones individuales`}>
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.roles} dataKey="value" nameKey="name" innerRadius={55} outerRadius={92} paddingAngle={3}>
                  {data.roles.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <ChartLoading />}
        </ChartCard>
      </section>

      <ChartCard
        title="Productos críticos"
        subtitle={data.critical.length ? "Comparación entre existencia actual y stock mínimo" : "No hay productos bajos o agotados"}
        wide
      >
        {data.critical.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">Inventario por encima de mínimos.</div>
        ) : mounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.critical} margin={{ left: 0, right: 14, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} interval={0} angle={-18} textAnchor="end" height={75} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="stock" name="Existencia" fill="#b42318" radius={[5, 5, 0, 0]} />
              <Bar dataKey="minimo" name="Mínimo" fill="#c7c7c7" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : <ChartLoading />}
      </ChartCard>

      <p className="text-xs text-muted">Entradas registradas en historial: {data.entradas}.</p>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon: Icon,
  danger,
  warn,
}: {
  label: string;
  value: number;
  icon: typeof Boxes;
  danger?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">{label}</p>
        <Icon className={danger ? "size-4 text-danger" : warn ? "size-4 text-warn" : "size-4 text-subtle"} strokeWidth={1.75} />
      </div>
      <p className="mt-2 font-mono text-2xl tabular-nums tracking-tight">{value}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  children,
  wide,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <section className={`rounded-[var(--radius-xl)] border border-border bg-surface p-5 ${wide ? "lg:col-span-2" : ""}`}>
      <div className="mb-4">
        <h2 className="font-display text-xl text-primary">{title}</h2>
        <p className="mt-1 text-xs text-muted">{subtitle}</p>
      </div>
      <div className="h-72 w-full">{children}</div>
    </section>
  );
}

function ChartLoading() {
  return <div className="flex h-full items-center justify-center text-sm text-muted">Preparando gráfica…</div>;
}
