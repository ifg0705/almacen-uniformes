import { createFileRoute } from "@tanstack/react-router";
import { type FormEvent, useMemo, useState } from "react";
import { Pencil, PackagePlus, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { FAMILY_LABEL } from "@/lib/catalog";
import { useInventory } from "@/lib/store";
import type { StockMovement } from "@/lib/inventory-api";

export const Route = createFileRoute("/entradas")({ component: Entradas });

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function Entradas() {
  const items = useInventory((s) => s.items);
  const movements = useInventory((s) => s.movements);
  const receive = useInventory((s) => s.receive);
  const editEntry = useInventory((s) => s.editEntry);
  const deleteEntry = useInventory((s) => s.deleteEntry);

  const [search, setSearch] = useState("");
  const [itemId, setItemId] = useState("");
  const [qty, setQty] = useState("1");
  const [date, setDate] = useState(today);
  const [supplier, setSupplier] = useState("");
  const [note, setNote] = useState("");
  const [editingId, setEditingId] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return items;
    return items.filter((item) =>
      `${item.id} ${item.description} ${item.size} ${FAMILY_LABEL[item.family]}`
        .toLowerCase()
        .includes(needle),
    );
  }, [items, search]);

  const selected = items.find((item) => item.id === itemId);
  const recentEntries = movements.filter((m) => m.type === "entrada").slice(0, 20);

  function clearForm() {
    setEditingId("");
    setSearch("");
    setItemId("");
    setQty("1");
    setDate(today());
    setSupplier("");
    setNote("");
  }

  function startEdit(entry: StockMovement) {
    setError("");
    setSuccess("");
    setEditingId(entry.id);
    setSearch("");
    setItemId(entry.itemId);
    setQty(String(entry.qtyChange));
    setDate(entry.date);
    setSupplier(entry.supplier ?? "");
    setNote(entry.note ?? "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeEntry(entry: StockMovement) {
    const confirmed = window.confirm(
      `¿Eliminar esta entrada de ${entry.qtyChange} pieza${entry.qtyChange === 1 ? "" : "s"}? El inventario se ajustará automáticamente.`,
    );
    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(entry.id);
    const result = await deleteEntry(entry.id);
    setDeletingId("");
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (editingId === entry.id) clearForm();
    setSuccess("La entrada se eliminó y el inventario quedó ajustado.");
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    const amount = Number(qty);
    if (!itemId) {
      setError("Selecciona el producto que llegó al almacén.");
      return;
    }
    if (!Number.isInteger(amount) || amount <= 0) {
      setError("La cantidad debe ser un número entero mayor a cero.");
      return;
    }

    setSaving(true);
    const input = { itemId, qty: amount, date, supplier, note };
    const result = editingId
      ? await editEntry({ ...input, movementId: editingId })
      : await receive(input);
    setSaving(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    setSuccess(
      editingId
        ? "La entrada se modificó y el inventario se recalculó automáticamente."
        : `Se agregaron ${amount} pieza${amount === 1 ? "" : "s"} al inventario.`,
    );
    clearForm();
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted">Recepción</p>
        <h1 className="font-display text-3xl tracking-tight text-primary">Entrada de productos</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Registra lo que llega al almacén. Las entradas guardadas pueden editarse o eliminarse y
          el inventario se ajusta automáticamente para mantener las existencias correctas.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="grid gap-4 rounded-[var(--radius-xl)] border border-border bg-surface p-5 md:grid-cols-2"
      >
        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-primary">
              {editingId ? "Modificar entrada" : "Nueva entrada"}
            </h2>
            {editingId ? (
              <p className="mt-1 text-xs text-muted">Editando movimiento {editingId}</p>
            ) : null}
          </div>
          {editingId ? (
            <Button type="button" variant="outline" size="sm" onClick={clearForm}>
              <X className="size-4" />Cancelar edición
            </Button>
          ) : null}
        </div>

        <div className="md:col-span-2">
          <Label>Buscar producto</Label>
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ej. pantalón mezclilla 34, polo M, UNI-065…"
          />
        </div>

        <div className="md:col-span-2">
          <Label>Producto / talla</Label>
          <select
            className="h-11 w-full rounded-[var(--radius-sm)] border border-border bg-elevated px-3 text-sm"
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
          >
            <option value="">Seleccionar producto</option>
            {filtered.map((item) => (
              <option key={item.id} value={item.id}>
                {item.description} · stock {item.stock}
              </option>
            ))}
          </select>
          {selected ? (
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
              <Badge>{selected.id}</Badge>
              <span>{FAMILY_LABEL[selected.family]}</span>
              <span>· talla {selected.size}</span>
              <span>· existencia actual {selected.stock}</span>
            </div>
          ) : null}
        </div>

        <div>
          <Label>Cantidad recibida</Label>
          <Input min="1" step="1" type="number" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div>
          <Label>Fecha de recepción</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>Proveedor</Label>
          <Input value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="Opcional" />
        </div>
        <div>
          <Label>Observaciones</Label>
          <Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Opcional" />
        </div>

        {error ? (
          <p className="md:col-span-2 rounded-[var(--radius-sm)] bg-danger-bg px-3 py-2 text-sm text-danger">
            {error}
          </p>
        ) : null}
        {success ? (
          <p className="md:col-span-2 rounded-[var(--radius-sm)] bg-ok-bg px-3 py-2 text-sm text-ok">
            {success}
          </p>
        ) : null}

        <div className="md:col-span-2">
          <Button type="submit" size="lg" disabled={saving}>
            {editingId ? <Pencil className="size-4" /> : <PackagePlus className="size-4" />}
            {saving
              ? editingId
                ? "Guardando cambios…"
                : "Sumando al inventario…"
              : editingId
                ? "Guardar cambios"
                : "Agregar al inventario"}
          </Button>
        </div>
      </form>

      <section className="rounded-[var(--radius-xl)] border border-border bg-surface p-5">
        <h2 className="font-display text-xl text-primary">Últimas entradas</h2>
        <p className="mt-1 text-xs text-muted">
          Puedes corregir una captura o eliminarla. Si las piezas ya fueron usadas, el sistema evitará
          un ajuste que deje existencias negativas.
        </p>
        {recentEntries.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Todavía no hay entradas registradas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {recentEntries.map((entry) => (
              <li key={entry.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{entry.description}</p>
                  <p className="text-xs text-muted">
                    {entry.date} · {entry.itemId}
                    {entry.supplier ? ` · ${entry.supplier}` : ""}
                  </p>
                  {entry.note ? <p className="mt-1 text-xs text-subtle">{entry.note}</p> : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge tone="ok">+{entry.qtyChange} pza</Badge>
                  <Button type="button" size="sm" variant="outline" onClick={() => startEdit(entry)}>
                    <Pencil className="size-3.5" />Editar
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    disabled={deletingId === entry.id}
                    onClick={() => void removeEntry(entry)}
                  >
                    <Trash2 className="size-3.5" />
                    {deletingId === entry.id ? "Eliminando…" : "Eliminar"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
