import { createFileRoute } from "@tanstack/react-router";
import { kitFor, ROLE_LABEL, type Gender, type Role } from "@/lib/catalog";

export const Route = createFileRoute("/kits")({ component: Kits });

export function Kits() {
  const cards: Array<{ role: Role; gender: Gender; title: string; note?: string }> = [
    { role: "operador", gender: "hombre", title: "Operador" },
    { role: "operador", gender: "mujer", title: "Operadora" },
    { role: "supervisor", gender: "hombre", title: "Supervisor" },
    { role: "supervisor", gender: "mujer", title: "Supervisora" },
    {
      role: "mantenimiento",
      gender: "hombre",
      title: ROLE_LABEL.mantenimiento,
      note: "Kit de mezclilla",
    },
    {
      role: "caseta",
      gender: "hombre",
      title: ROLE_LABEL.caseta,
      note: "Pantalón caqui y polo azul rey unisex; prenda Oxford según género",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Regla de entrega</p>
        <h1 className="font-display text-3xl tracking-tight text-primary">Kits de ingreso</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Se muestran los seis kits de ingreso. El supervisor de mantenimiento usa prendas de mezclilla.
          El pantalón caqui se maneja como unisex para supervisión y caseta. El operador de caseta usa también polo azul rey unisex; la prenda Oxford se ajusta al género seleccionado.
          Las polos azul cielo, azul marino y azul rey se manejan como unisex. Al registrar una entrega, el sistema descuenta automáticamente las prendas del inventario.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article
            key={`${card.role}-${card.gender}-${card.title}`}
            className="rounded-[var(--radius-xl)] border border-border bg-surface p-5"
          >
            <h2 className="font-display text-2xl text-primary">{card.title}</h2>
            <p className="mt-1 text-xs text-muted">{card.note ?? "Kit estándar de ingreso"}</p>
            <ul className="mt-4 space-y-2">
              {kitFor(card.role, card.gender).map((piece) => (
                <li key={piece.key} className="border-t border-border pt-2 text-sm">
                  <span className="font-medium">
                    {piece.qty} × {piece.label}
                  </span>
                  {piece.note ? <p className="mt-1 text-xs text-warn">{piece.note}</p> : null}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
