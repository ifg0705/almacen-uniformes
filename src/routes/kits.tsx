import { createFileRoute } from "@tanstack/react-router";
import { kitFor, ROLE_LABEL, type Role } from "@/lib/catalog";

export const Route = createFileRoute("/kits")({ component: Kits });

export function Kits() {
  const cards: Array<{ role: Role; title: string; note?: string }> = [
    { role: "operador", title: ROLE_LABEL.operador },
    { role: "supervisor", title: ROLE_LABEL.supervisor },
    { role: "mantenimiento", title: ROLE_LABEL.mantenimiento },
    { role: "caseta", title: ROLE_LABEL.caseta },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Regla de entrega</p>
        <h1 className="font-display text-3xl tracking-tight text-primary">Kits de ingreso</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Cada puesto configurado recibe 2 pantalones de mezclilla, 1 par de botas de seguridad,
          1 polo azul cielo y 1 camisa de mezclilla. En dama se utiliza la prenda equivalente de dama.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.role}
            className="rounded-[var(--radius-xl)] border border-border bg-surface p-5"
          >
            <h2 className="font-display text-2xl text-primary">{card.title}</h2>
            <p className="mt-1 text-xs text-muted">Kit estándar de ingreso</p>
            <ul className="mt-4 space-y-2">
              {kitFor(card.role, "hombre").map((piece) => (
                <li key={piece.key} className="border-t border-border pt-2 text-sm">
                  <span className="font-medium">
                    {piece.qty} × {piece.label}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  );
}
