import { createFileRoute } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { ROLE_LABEL } from "@/lib/catalog";
import { useInventory } from "@/lib/store";

export const Route = createFileRoute("/historial")({ component: Historial });

export function Historial() {
  const deliveries = useInventory((s) => s.deliveries);
  const movements = useInventory((s) => s.movements);
  const sync = useInventory((s) => s.sync);

  return (
    <div className="space-y-7">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Control</p>
          <h1 className="font-display text-3xl tracking-tight text-primary">Historial</h1>
          <p className="mt-2 text-sm text-muted">
            Entregas a colaboradores y movimientos recientes del almacén.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void sync()}
          className="text-xs text-muted underline-offset-4 hover:underline"
        >
          Actualizar
        </button>
      </div>

      <section>
        <h2 className="mb-3 font-display text-xl text-primary">Entregas de kits</h2>
        {deliveries.length === 0 ? (
          <p className="rounded-[var(--radius-lg)] border border-border bg-surface p-6 text-sm text-muted">
            Aún no hay entregas. Cuando entre un colaborador, registra el kit en Entregar.
          </p>
        ) : (
          <ul className="space-y-3">
            {deliveries.map((delivery) => (
              <li
                key={delivery.id}
                className="rounded-[var(--radius-lg)] border border-border bg-surface p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{delivery.name}</p>
                    <p className="text-xs text-muted">
                      {delivery.date} {delivery.area ? `· ${delivery.area}` : ""}
                    </p>
                  </div>
                  <Badge>{ROLE_LABEL[delivery.role] ?? delivery.role}</Badge>
                </div>
                <ul className="mt-3 space-y-1 text-sm">
                  {delivery.lines.map((line) => (
                    <li key={`${delivery.id}-${line.itemId}`} className="flex justify-between gap-3 text-muted">
                      <span className="min-w-0 truncate">
                        {line.qty} × {line.description}
                      </span>
                      <span className="shrink-0 font-mono text-xs">{line.itemId}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="font-display text-xl text-primary">Movimientos recientes</h2>
        {movements.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Todavía no hay movimientos registrados.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {movements.slice(0, 30).map((movement) => (
              <li key={movement.id} className="flex items-start justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{movement.description}</p>
                  <p className="text-xs text-muted">
                    {movement.date} · {movement.itemId}
                    {movement.supplier ? ` · ${movement.supplier}` : ""}
                  </p>
                  {movement.note ? <p className="mt-1 text-xs text-subtle">{movement.note}</p> : null}
                </div>
                <Badge tone={movement.qtyChange > 0 ? "ok" : "warn"}>
                  {movement.qtyChange > 0 ? "+" : ""}{movement.qtyChange} pza
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
