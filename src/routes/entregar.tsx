import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { type FormEvent, type ReactNode, useMemo, useState } from "react";
import { kitFor, ROLE_LABEL, type Gender, type Role } from "@/lib/catalog";
import { useInventory } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/entregar")({ component: Entregar });

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function Entregar() {
  const items = useInventory((s) => s.items);
  const issueKit = useInventory((s) => s.issueKit);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [date, setDate] = useState(today);
  const [role, setRole] = useState<Role>("operador");
  const [gender, setGender] = useState<Gender>("hombre");
  const [sizes, setSizes] = useState({
    pantalon: "",
    camisa: "",
    polo: "",
    zapato: "",
  });
  const [error, setError] = useState("");

  const kit = useMemo(() => kitFor(role, gender), [role, gender]);

  const preview = kit.map((piece) => {
    const size = sizes[piece.key];
    const item = items.find((i) => i.family === piece.family && i.size === size);
    const options = items.filter((i) => i.family === piece.family);
    return { piece, size, item, options };
  });

  const [saving, setSaving] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("Escribe el nombre del colaborador.");
      return;
    }
    setSaving(true);
    const result = await issueKit({ name, area, date, role, gender, sizes });
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
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Ingreso</p>
        <h1 className="font-display text-3xl tracking-tight text-primary">Entregar kit</h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          Al entrar un colaborador se le da el kit completo. El almacén descuenta las piezas.
        </p>
      </div>

      <div className="grid gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5 md:grid-cols-2">
        <Field label="Colaborador">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
        </Field>
        <Field label="Área / departamento">
          <Input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Opcional" />
        </Field>
        <Field label="Fecha de ingreso">
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

      <div className="space-y-3">
        <h2 className="font-display text-xl text-primary">Piezas del kit</h2>
        {preview.map(({ piece, item, options }) => (
          <div
            key={piece.key}
            className="rounded-[var(--radius-lg)] border border-border bg-surface p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium">
                  {piece.qty} × {piece.label}
                </p>
                {piece.note ? <p className="mt-1 text-xs text-warn">{piece.note}</p> : null}
              </div>
              {item ? (
                <Badge
                  tone={
                    item.stock < piece.qty ? "danger" : item.stock <= item.minStock ? "warn" : "ok"
                  }
                >
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

      {error ? (
        <p className="rounded-[var(--radius-sm)] bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
      ) : null}

      <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={saving}>
        {saving ? "Guardando entrega…" : "Registrar entrega y descontar almacén"}
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
