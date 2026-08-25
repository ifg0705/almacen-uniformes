import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, Package, PackagePlus, Shirt, Users } from "lucide-react";
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
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Almacén</p>
          <h1 className="font-display text-3xl tracking-tight text-primary md:text-4xl">
            Uniformes al ingreso
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Controla existencias, entradas de mercancía y kits de ingreso para operadores,
            supervisores, mantenimiento y caseta desde cualquier dispositivo conectado.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild>
            <Link to="/entregar">Entregar kit de ingreso</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/entradas"><PackagePlus className="size-4" />Registrar entrada</Link>
          </Button>
        </div>
      </div>

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

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-display text-xl text-primary">Próximos a acabarse</h2>
          <Link to="/inventario" className="text-sm text-muted underline-offset-4 hover:underline">
            Ver inventario
          </Link>
        </div>
        {alerts.length === 0 ? (
          <p className="text-sm text-muted">Todo el stock está por encima del mínimo.</p>
        ) : (
          <ul className="divide-y divide-border">
            {alerts.slice(0, 8).map((item) => {
              const st = stockStatus(item);
              return (
                <li key={item.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-muted">
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
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">{label}</p>
        <Icon className={alert ? "size-4 text-danger" : "size-4 text-subtle"} strokeWidth={1.75} />
      </div>
      <p className="mt-2 font-mono text-2xl tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
