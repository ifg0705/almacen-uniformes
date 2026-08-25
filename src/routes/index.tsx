import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, Package, PackagePlus, Shirt, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FAMILY_LABEL, stockStatus } from "@/lib/catalog";
import { useInventory } from "@/lib/store";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const items = useInventory((s) => s.items);
  const deliveries = useInventory((s) => s.deliveries);
  const agotados = items.filter((i) => stockStatus(i) === "agotado");
  const bajos = items.filter((i) => stockStatus(i) === "bajo");
  const units = items.reduce((a, i) => a + i.stock, 0);
  const value = items.reduce((a, i) => a + i.stock * i.unitCost, 0);
  const alerts = [...agotados, ...bajos];

  return (
    <div className="space-y-7 md:space-y-8">
      <section className="brand-hero overflow-hidden rounded-[var(--radius-xl)] border border-primary/10 bg-primary text-primary-fg shadow-[0_18px_50px_rgba(15,61,74,0.16)]">
        <div className="grid min-h-[290px] gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div className="relative z-10 max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
              Almacén · Control de uniformes
            </div>
            <h1 className="font-display text-4xl font-bold tracking-[-0.03em] text-white sm:text-5xl">
              Inventario y entregas en un solo lugar
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/75 sm:text-base">
              Registra entradas, controla existencias y entrega kits al personal desde cualquier dispositivo conectado.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild className="bg-accent text-white hover:bg-accent/90">
                <Link to="/entregar">Entregar kit <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/15 hover:text-white">
                <Link to="/entradas"><PackagePlus className="size-4" />Registrar entrada</Link>
              </Button>
            </div>
          </div>

          <div className="relative hidden h-48 w-64 shrink-0 lg:block" aria-hidden="true">
            <div className="absolute right-0 top-2 size-44 rounded-[38px] border border-white/15 bg-white/8 rotate-6" />
            <div className="absolute bottom-2 left-2 size-36 rounded-[34px] border border-white/20 bg-white/8 -rotate-6" />
            <div className="absolute right-7 top-10 grid grid-cols-3 gap-2">
              {['bg-[#76b947]','bg-[#2f9a5a]','bg-[#3984a0]','bg-[#76b947]','bg-[#246b74]','bg-[#438bad]','bg-[#d85348]','bg-[#f08a2e]','bg-[#e1ad2c]'].map((c, idx) => (
                <span key={idx} className={`size-9 rounded-lg ${c} shadow-sm`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Piezas en almacén" value={String(units)} icon={Package} />
        <Stat label="Valor inventario" value={money(value)} icon={Shirt} />
        <Stat label="Entregas registradas" value={String(deliveries.length)} icon={Users} />
        <Stat
          label="Por reponer"
          value={String(alerts.length)}
          icon={AlertTriangle}
          alert={alerts.length > 0}
        />
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent">Inventario</p>
            <h2 className="mt-1 font-display text-xl font-bold text-primary">Próximos a acabarse</h2>
          </div>
          <Link to="/inventario" className="rounded-lg px-2 py-1 text-sm font-semibold text-primary underline-offset-4 hover:bg-primary/5 hover:underline">
            Ver inventario
          </Link>
        </div>
        {alerts.length === 0 ? (
          <div className="rounded-xl border border-ok/20 bg-ok-bg px-4 py-3 text-sm text-ok">
            Todo el stock está por encima del mínimo.
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {alerts.slice(0, 8).map((item) => {
              const st = stockStatus(item);
              return (
                <li key={item.id} className="flex items-start justify-between gap-3 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.description}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {item.id} · {FAMILY_LABEL[item.family]} · talla {item.size}
                    </p>
                  </div>
                  <Badge tone={st === "agotado" ? "danger" : "warn"}>
                    {st === "agotado" ? "Agotado" : `${item.stock} pza`}
                  </Badge>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  alert,
}: {
  label: string;
  value: string;
  icon: typeof Package;
  alert?: boolean;
}) {
  return (
    <div className="group rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold text-muted">{label}</p>
        <span className={alert ? "rounded-xl bg-danger-bg p-2 text-danger" : "rounded-xl bg-primary/7 p-2 text-primary"}>
          <Icon className="size-4" strokeWidth={1.9} />
        </span>
      </div>
      <p className="mt-3 font-mono text-2xl font-semibold tabular-nums tracking-tight text-primary">{value}</p>
      <div className={alert ? "mt-3 h-1 w-10 rounded-full bg-danger" : "mt-3 h-1 w-10 rounded-full bg-accent"} />
    </div>
  );
}
