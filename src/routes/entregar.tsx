import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { PackageCheck, Shirt } from "lucide-react";
import { kitFor, ROLE_LABEL, type Gender, type Role } from "@/lib/catalog";
import { useInventory } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/entregar")({ component: Entregar });

type DeliveryMode = "kit" | "individual";

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function Entregar() {
  const items = useInventory((s) => s.items);
  const issueKit = useInventory((s) => s.issueKit);
  const issueSingle = useInventory((s) => s.issueSingle);
  const navigate = useNavigate();

  const [mode, setMode] = useState<DeliveryMode>("kit");
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [date, setDate] = useState(today);
  const [role, setRole] = useState<Role>("operador");
  const [gender, setGender] = useState<Gender>("hombre");
  const [sizes, setSizes] = useState({ pantalon: "", camisa: "", polo: "", zapato: "" });
  const [singleSearch, setSingleSearch] = useState("");
  const [singleItemId, setSingleItemId] = useState("");
  const [singleNote, setSingleNote] = useState("Cambio por desgaste");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const kit = useMemo(() => kitFor(role, gender), [role, gender]);

  const preview = kit.map((piece) => {
    const size = sizes[piece.key];
    const item = items.find((i) => i.family === piece.family && i.size === size);
    const options = items.filter((i) => i.family === piece.family);
    return { piece, size, item, options };
  });

  const singleOptions = useMemo(() => {
    const needle = singleSearch.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      `${item.id} ${item.description} ${item.size}`.toLowerCase().includes(needle),
    );
  }, [items, singleSearch]);
  const selectedSingle = items.find((item) => item.id === singleItemId);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Escribe el nombre del colaborador.");
      return;
    }
    if (mode === "individual" && !singleItemId) {
      setError("Selecciona la prenda o el zapato que vas a entregar.");
      return;
    }

    setSaving(true);
    const result =
      mode === "kit"
        ? await issueKit({ name, area, date, role, gender, sizes })
        : await issueSingle({
            name,
            area,
            date,
            role,
            gender,
            itemId: singleItemId,
            note: singleNote,
          });
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }
    void navigate({ to: "/historial" });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Almacén</p>
        <h1 className="font-display text-3xl tracking-tight text-primary">Entregar uniformes</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Registra un kit completo para un nuevo ingreso o una sola prenda cuando sea cambio por
          desgaste, talla o reposición. En ambos casos se descuenta del inventario.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-[var(--radius-lg)] border border-border bg-surface p-2">
        <button
          type="button"
          onClick={() => setMode("kit")}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm font-medium ${
            mode === "kit" ? "bg-primary text-primary-fg" : "text-muted hover:bg-bg"
          }`}
        >
          <PackageCheck className="size-4" />Kit completo
        </button>
        <button
          type="button"
          onClick={() => setMode("individual")}
          className={`flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-sm)] px-3 text-sm font-medium ${
            mode === "individual" ? "bg-primary text-primary-fg" : "text-muted hover:bg-bg"
          }`}
        >
          <Shirt className="size-4" />Una sola prenda
        </button>
      </div>

      <div className="grid gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5 md:grid-cols-2">
        <Field label="Colaborador">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
        </Field>
        <Field label="Área / departamento">
          <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Opcional" />
        </Field>
        <Field label="Fecha de entrega">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Puesto">
            <select
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              {(Object.entries(ROLE_LABEL) as [Role, string][]).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>
          <Field label="Género">
            <select
              className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm"
              value={gender}
              onChange={(e) => setGender(e.target.value as Gender)}
            >
              <option value="hombre">Hombre</option>
              <option value="mujer">Mujer</option>
            </select>
          </Field>
        </div>
      </div>

      {mode === "kit" ? (
        <div className="space-y-3">
          <h2 className="font-display text-xl text-primary">Piezas del kit</h2>
          {preview.map(({ piece, item, options }) => (
            <div key={piece.key} className="rounded-[var(--radius-lg)] border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{piece.qty} × {piece.label}</p>
                  {piece.note ? <p className="mt-1 text-xs text-warn">{piece.note}</p> : null}
                </div>
                {item ? (
                  <Badge tone={item.stock < piece.qty ? "danger" : item.stock <= item.minStock ? "warn" : "ok"}>
                    {item.stock} en almacén
                  </Badge>
                ) : (
                  <Badge>Elige talla</Badge>
                )}
              </div>
              <div className="mt-3">
                <Label>Talla</Label>
                <select
                  className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm"
                  value={sizes[piece.key]}
                  onChange={(e) => setSizes((s) => ({ ...s, [piece.key]: e.target.value }))}
                >
                  <option value="">Seleccionar</option>
                  {options.map((opt) => (
                    <option key={opt.id} value={opt.size} disabled={opt.stock < piece.qty}>
                      {opt.size} — {opt.stock} pza {opt.stock < piece.qty ? "(insuficiente)" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
          <div>
            <h2 className="font-display text-xl text-primary">Cambio / reposición individual</h2>
            <p className="mt-1 text-sm text-muted">
              Selecciona exactamente una prenda o un par de zapatos. Se descontará 1 pieza del inventario.
            </p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Buscar producto</Label>
              <Input
                value={singleSearch}
                onChange={(e) => setSingleSearch(e.target.value)}
                placeholder="Ej. camisa M, pantalón 34, zapato 27…"
              />
            </div>
            <div className="md:col-span-2">
              <Label>Prenda / talla</Label>
              <select
                className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm"
                value={singleItemId}
                onChange={(e) => setSingleItemId(e.target.value)}
              >
                <option value="">Seleccionar producto</option>
                {singleOptions.map((item) => (
                  <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                    {item.description} · stock {item.stock}{item.stock <= 0 ? " (agotado)" : ""}
                  </option>
                ))}
              </select>
              {selectedSingle ? (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
                  <Badge>{selectedSingle.id}</Badge>
                  <span>Talla {selectedSingle.size}</span>
                  <Badge tone={selectedSingle.stock <= 0 ? "danger" : selectedSingle.stock <= selectedSingle.minStock ? "warn" : "ok"}>
                    {selectedSingle.stock} en almacén
                  </Badge>
                </div>
              ) : null}
            </div>
            <div className="md:col-span-2">
              <Label>Motivo / observación</Label>
              <Input
                value={singleNote}
                onChange={(e) => setSingleNote(e.target.value)}
                placeholder="Ej. cambio por desgaste, talla incorrecta…"
              />
            </div>
          </div>
        </section>
      )}

      {error ? (
        <p className="rounded-[var(--radius-sm)] bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
      ) : null}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={saving}>
        {saving
          ? "Guardando entrega…"
          : mode === "kit"
            ? "Registrar kit y descontar almacén"
            : "Entregar 1 pieza y descontar almacén"}
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
