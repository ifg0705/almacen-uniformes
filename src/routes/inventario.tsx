import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, Boxes, CircleDollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { QrMark } from "@/components/qr-code";
import { FAMILY_LABEL, stockStatus, type Family } from "@/lib/catalog";
import { useInventory } from "@/lib/store";
import { money } from "@/lib/utils";

export const Route = createFileRoute("/inventario")({ component: Inventario });

export function Inventario() {
  const items = useInventory((s) => s.items);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"todos" | "bajo" | "agotado">("todos");
  const [openId, setOpenId] = useState<string | null>(null);

  const list = useMemo(() => {
    return items.filter((i) => {
      const st = stockStatus(i);
      if (filter === "bajo" && st !== "bajo") return false;
      if (filter === "agotado" && st !== "agotado") return false;
      if (!q.trim()) return true;
      const hay = `${i.id} ${i.description} ${i.size} ${FAMILY_LABEL[i.family]}`.toLowerCase();
      return hay.includes(q.toLowerCase());
    });
  }, [items, q, filter]);

  const open = items.find((i) => i.id === openId);
  const totalValue = items.reduce((sum, item) => sum + item.stock * item.unitCost, 0);
  const totalUnits = items.reduce((sum, item) => sum + item.stock, 0);
  const exhausted = items.filter((item) => stockStatus(item) === "agotado").length;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Almacén</p>
        <h1 className="font-display text-3xl tracking-tight text-primary">Inventario</h1>
        <p className="mt-2 text-sm text-muted">
          Rojo = agotado. Ámbar = en o bajo el mínimo. Toca un renglón para ver el código QR.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        <InventoryStat label="Valor del inventario" value={money(totalValue)} icon={CircleDollarSign} />
        <InventoryStat label="Piezas disponibles" value={String(totalUnits)} icon={Boxes} />
        <InventoryStat label="Productos agotados" value={String(exhausted)} icon={AlertTriangle} alert={exhausted > 0} />
      </section>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar código, talla o prenda"
        />
        <div className="flex gap-2">
          {(["todos", "bajo", "agotado"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`h-11 rounded-[var(--radius-sm)] border px-3 text-sm ${
                filter === f ? "border-primary bg-primary text-primary-fg" : "border-border bg-elevated"
              }`}
            >
              {f === "todos" ? "Todos" : f === "bajo" ? "Bajos" : "Agotados"}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
        <ul className="divide-y divide-border">
          {list.map((item) => {
            const st = stockStatus(item);
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => setOpenId(item.id)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left hover:bg-bg"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.description}</p>
                    <p className="font-mono text-xs text-muted">
                      {item.id} · talla {item.size} · mín {item.minStock}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <Badge tone={st === "agotado" ? "danger" : st === "bajo" ? "warn" : "ok"}>
                      {item.stock} pza
                    </Badge>
                    <span className="text-xs text-subtle">{money(item.stock * item.unitCost)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center bg-fg/40 p-4 sm:items-center"
          onClick={() => setOpenId(null)}
        >
          <div
            className="w-full max-w-sm rounded-[var(--radius-xl)] bg-elevated p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-xs text-muted">{open.id}</p>
            <h2 className="mt-1 font-display text-xl text-primary">{open.description}</h2>
            <p className="mt-1 text-sm text-muted">
              {FAMILY_LABEL[open.family as Family]} · talla {open.size}
            </p>
            <div className="mt-4 flex justify-center rounded-[var(--radius-md)] border border-border bg-surface p-4">
              <QrMark value={open.id} />
            </div>
            <p className="mt-3 text-center text-xs text-muted">
              El QR contiene el código {open.id}. Úsalo para identificar la prenda al entregar.
            </p>
            <button
              type="button"
              className="mt-4 h-11 w-full rounded-[var(--radius-sm)] border border-border"
              onClick={() => setOpenId(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function InventoryStat({ label, value, icon: Icon, alert }: { label: string; value: string; icon: typeof Boxes; alert?: boolean }) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted">{label}</p>
        <Icon className={alert ? "size-4 text-danger" : "size-4 text-subtle"} strokeWidth={1.75} />
      </div>
      <p className="mt-2 font-mono text-xl tabular-nums tracking-tight">{value}</p>
    </div>
  );
}
