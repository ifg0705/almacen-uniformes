import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { kitFor, seedItems, type Gender, type Item, type Role } from "./catalog";

export type DeliveryKind = "kit" | "individual";

export type DeliveryLine = {
  itemId: string;
  description: string;
  qty: number;
  size: string;
};

export type Delivery = {
  id: string;
  date: string;
  name: string;
  area: string;
  role: Role;
  gender: Gender;
  kind: DeliveryKind;
  note: string;
  lines: DeliveryLine[];
};

export type StockMovement = {
  id: string;
  date: string;
  type: "entrada" | "entrega" | "ajuste";
  itemId: string;
  description: string;
  qtyChange: number;
  reference: string;
  supplier: string;
  note: string;
  createdAt: string;
};

export type InventorySnapshot = {
  items: Item[];
  deliveries: Delivery[];
  movements: StockMovement[];
  persistent: boolean;
};

const sizesSchema = z.object({
  pantalon: z.string(),
  camisa: z.string(),
  polo: z.string(),
  zapato: z.string(),
});

const issueSchema = z.object({
  name: z.string().trim().min(1),
  area: z.string().default(""),
  date: z.string().min(10),
  role: z.enum(["operador", "supervisor", "mantenimiento", "caseta"]),
  gender: z.enum(["hombre", "mujer"]),
  sizes: sizesSchema,
});

const issueSingleSchema = z.object({
  name: z.string().trim().min(1),
  area: z.string().default(""),
  date: z.string().min(10),
  role: z.enum(["operador", "supervisor", "mantenimiento", "caseta"]),
  gender: z.enum(["hombre", "mujer"]),
  itemId: z.string().min(1),
  note: z.string().default(""),
});

const deleteDeliverySchema = z.object({
  deliveryId: z.string().min(1),
});

const receiveSchema = z.object({
  itemId: z.string().min(1),
  qty: z.coerce.number().int().positive(),
  date: z.string().min(10),
  supplier: z.string().default(""),
  note: z.string().default(""),
});

const editEntrySchema = receiveSchema.extend({
  movementId: z.string().min(1),
});

const deleteEntrySchema = z.object({
  movementId: z.string().min(1),
});

async function getDb() {
  return import("./db");
}

async function ensureSeeded() {
  const { getSql } = await getDb();
  const sql = await getSql();
  const [{ count = 0 } = {}] = await sql.query<{ count: number }>(
    "select count(*)::bigint as count from inventory_items",
  );
  if (Number(count) > 0) return;

  for (const item of seedItems()) {
    await sql.query(
      `insert into inventory_items
        (id, description, family, size, stock, min_stock, unit_cost)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (id) do nothing`,
      [
        item.id,
        item.description,
        item.family,
        item.size,
        item.stock,
        item.minStock,
        item.unitCost,
      ],
    );
  }
}

type DeliveryRow = {
  id: string;
  delivery_date: string;
  employee_name: string;
  area: string;
  role: Role;
  gender: Gender;
  delivery_kind: DeliveryKind;
  note: string;
};

type MovementRow = {
  id: string;
  movement_date: string;
  movement_type: StockMovement["type"];
  item_id: string;
  description: string;
  qty_change: number;
  reference: string;
  supplier: string;
  note: string;
  created_at: string | Date;
};

async function buildSnapshot(limitRows: boolean): Promise<InventorySnapshot> {
  await ensureSeeded();
  const { getSql, dbSource } = await getDb();
  const sql = await getSql();

  const itemRows = await sql.query<{
    id: string;
    description: string;
    family: Item["family"];
    size: string;
    stock: number;
    min_stock: number;
    unit_cost: string | number;
  }>(
    `select id, description, family, size, stock, min_stock, unit_cost
     from inventory_items
     order by id`,
  );

  const deliveryRows = await sql.query<DeliveryRow>(
    `select id, delivery_date, employee_name, area, role, gender, delivery_kind, note
     from deliveries
     order by created_at desc${limitRows ? " limit 300" : ""}`,
  );

  const lineRows = deliveryRows.length
    ? await sql.query<{
        delivery_id: string;
        item_id: string;
        description: string;
        qty: number;
        size: string;
      }>(
        `select delivery_id, item_id, description, qty, size
         from delivery_lines
         order by id desc${limitRows ? " limit 2000" : ""}`,
      )
    : [];

  const movementRows = await sql.query<MovementRow>(
    `select id, movement_date, movement_type, item_id, description,
            qty_change, reference, supplier, note, created_at
     from stock_movements
     order by created_at desc${limitRows ? " limit 300" : ""}`,
  );

  const linesByDelivery = new Map<string, DeliveryLine[]>();
  for (const row of lineRows) {
    const lines = linesByDelivery.get(row.delivery_id) ?? [];
    lines.push({
      itemId: row.item_id,
      description: row.description,
      qty: Number(row.qty),
      size: row.size,
    });
    linesByDelivery.set(row.delivery_id, lines);
  }

  return {
    items: itemRows.map((row) => ({
      id: row.id,
      description: row.description,
      family: row.family,
      size: row.size,
      stock: Number(row.stock),
      minStock: Number(row.min_stock),
      unitCost: Number(row.unit_cost),
    })),
    deliveries: deliveryRows.map((row) => ({
      id: row.id,
      date: row.delivery_date,
      name: row.employee_name,
      area: row.area,
      role: row.role,
      gender: row.gender,
      kind: row.delivery_kind ?? "kit",
      note: row.note ?? "",
      lines: linesByDelivery.get(row.id) ?? [],
    })),
    movements: movementRows.map((row) => ({
      id: row.id,
      date: row.movement_date,
      type: row.movement_type,
      itemId: row.item_id,
      description: row.description,
      qtyChange: Number(row.qty_change),
      reference: row.reference,
      supplier: row.supplier,
      note: row.note,
      createdAt:
        row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    })),
    persistent: dbSource === "neon",
  };
}

async function snapshot(): Promise<InventorySnapshot> {
  return buildSnapshot(true);
}

export const getInventorySnapshot = createServerFn({ method: "GET" }).handler(async () => {
  return snapshot();
});

export const receiveStock = createServerFn({ method: "POST" })
  .validator((input: unknown) => receiveSchema.parse(input))
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { getSql } = await getDb();
    const sql = await getSql();

    const movementId = `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const received = await sql.query<{ id: string }>(
      `with target as (
         select id, description
         from inventory_items
         where id = $1
       ),
       updated as (
         update inventory_items i
         set stock = i.stock + $2, updated_at = now()
         from target t
         where i.id = t.id
         returning i.id, t.description
       ),
       inserted as (
         insert into stock_movements
           (id, movement_date, movement_type, item_id, description, qty_change, reference, supplier, note)
         select $3,$4,'entrada',u.id,u.description,$2,$5,$6,$7
         from updated u
         returning id
       )
       select id from inserted`,
      [
        data.itemId,
        data.qty,
        movementId,
        data.date,
        `Entrada ${movementId}`,
        data.supplier.trim(),
        data.note.trim(),
      ],
    );
    if (!received.length) throw new Error("El producto seleccionado ya no existe.");

    return snapshot();
  });

export const editEntryOnServer = createServerFn({ method: "POST" })
  .validator((input: unknown) => editEntrySchema.parse(input))
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { getSql } = await getDb();
    const sql = await getSql();

    const [entry] = await sql.query<{
      id: string;
      item_id: string;
      qty_change: number;
    }>(
      `select id, item_id, qty_change
       from stock_movements
       where id = $1 and movement_type = 'entrada'`,
      [data.movementId],
    );
    if (!entry) throw new Error("La entrada seleccionada ya no existe.");

    const [newItem] = await sql.query<{ id: string; description: string }>(
      "select id, description from inventory_items where id = $1",
      [data.itemId],
    );
    if (!newItem) throw new Error("El producto seleccionado ya no existe.");

    const oldQty = Number(entry.qty_change);

    if (entry.item_id === data.itemId) {
      const delta = data.qty - oldQty;
      const changed = await sql.query<{ id: string }>(
        `with updated_item as (
           update inventory_items
           set stock = stock + $1, updated_at = now()
           where id = $2 and stock + $1 >= 0
           returning id
         ),
         updated_movement as (
           update stock_movements
           set movement_date = $3, description = $4, qty_change = $5,
               supplier = $6, note = $7
           where id = $8
             and movement_type = 'entrada'
             and exists (select 1 from updated_item)
           returning id
         )
         select id from updated_movement`,
        [
          delta,
          data.itemId,
          data.date,
          newItem.description,
          data.qty,
          data.supplier.trim(),
          data.note.trim(),
          data.movementId,
        ],
      );
      if (!changed.length) {
        throw new Error(
          "No se puede reducir esa entrada porque parte de esas piezas ya fue entregada.",
        );
      }
    } else {
      const changed = await sql.query<{ id: string }>(
        `with eligible as (
           select m.id, m.item_id as old_item_id, m.qty_change as old_qty,
                  n.id as new_item_id, n.description as new_description
           from stock_movements m
           join inventory_items old_i on old_i.id = m.item_id
           join inventory_items n on n.id = $2
           where m.id = $1
             and m.movement_type = 'entrada'
             and old_i.stock >= m.qty_change
         ),
         updated_old as (
           update inventory_items i
           set stock = i.stock - e.old_qty, updated_at = now()
           from eligible e
           where i.id = e.old_item_id
           returning i.id
         ),
         updated_new as (
           update inventory_items i
           set stock = i.stock + $3, updated_at = now()
           from eligible e
           where i.id = e.new_item_id
             and exists (select 1 from updated_old)
           returning i.id
         ),
         updated_movement as (
           update stock_movements m
           set movement_date = $4,
               item_id = e.new_item_id,
               description = e.new_description,
               qty_change = $3,
               supplier = $5,
               note = $6
           from eligible e
           where m.id = e.id
             and exists (select 1 from updated_new)
           returning m.id
         )
         select id from updated_movement`,
        [
          data.movementId,
          data.itemId,
          data.qty,
          data.date,
          data.supplier.trim(),
          data.note.trim(),
        ],
      );
      if (!changed.length) {
        throw new Error(
          "No se puede cambiar esa entrada de producto porque las piezas originales ya fueron utilizadas.",
        );
      }
    }

    return snapshot();
  });

export const deleteEntryOnServer = createServerFn({ method: "POST" })
  .validator((input: unknown) => deleteEntrySchema.parse(input))
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { getSql } = await getDb();
    const sql = await getSql();

    const deleted = await sql.query<{ id: string }>(
      `with target as (
         select id, item_id, qty_change
         from stock_movements
         where id = $1 and movement_type = 'entrada'
       ),
       eligible as (
         select t.*
         from target t
         join inventory_items i on i.id = t.item_id
         where i.stock >= t.qty_change
       ),
       adjusted as (
         update inventory_items i
         set stock = i.stock - e.qty_change, updated_at = now()
         from eligible e
         where i.id = e.item_id
         returning i.id
       ),
       removed as (
         delete from stock_movements m
         using eligible e
         where m.id = e.id
           and exists (select 1 from adjusted)
         returning m.id
       )
       select id from removed`,
      [data.movementId],
    );

    if (!deleted.length) {
      throw new Error(
        "No se puede eliminar esa entrada porque algunas de esas piezas ya fueron utilizadas o entregadas.",
      );
    }
    return snapshot();
  });

export const issueKitOnServer = createServerFn({ method: "POST" })
  .validator((input: unknown) => issueSchema.parse(input))
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { getSql } = await getDb();
    const sql = await getSql();
    const kit = kitFor(data.role, data.gender);
    const lines: DeliveryLine[] = [];

    for (const piece of kit) {
      const size = data.sizes[piece.key];
      if (!size) throw new Error(`Falta talla de ${piece.label}.`);

      const [item] = await sql.query<{ id: string; description: string; stock: number }>(
        `select id, description, stock
         from inventory_items
         where family = $1 and size = $2
         limit 1`,
        [piece.family, size],
      );

      if (!item) throw new Error(`No existe ${piece.label} talla ${size}.`);
      if (Number(item.stock) < piece.qty) {
        throw new Error(
          `No hay suficiente ${piece.label} talla ${size}. Hay ${item.stock}, se necesitan ${piece.qty}.`,
        );
      }

      lines.push({
        itemId: item.id,
        description: item.description,
        qty: piece.qty,
        size,
      });
    }

    const deliveryId = `ENT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    await sql.query(
      `insert into deliveries
        (id, delivery_date, employee_name, area, role, gender, delivery_kind, note)
       values ($1,$2,$3,$4,$5,$6,'kit','')`,
      [deliveryId, data.date, data.name.trim(), data.area.trim(), data.role, data.gender],
    );

    for (const line of lines) {
      const updated = await sql.query<{ id: string }>(
        `update inventory_items
         set stock = stock - $1, updated_at = now()
         where id = $2 and stock >= $1
         returning id`,
        [line.qty, line.itemId],
      );
      if (!updated.length) {
        throw new Error(`El inventario cambió. Revisa existencias de ${line.description}.`);
      }

      await sql.query(
        `insert into delivery_lines
          (delivery_id, item_id, description, qty, size)
         values ($1,$2,$3,$4,$5)`,
        [deliveryId, line.itemId, line.description, line.qty, line.size],
      );

      const movementId = `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      await sql.query(
        `insert into stock_movements
          (id, movement_date, movement_type, item_id, description, qty_change, reference, note)
         values ($1,$2,'entrega',$3,$4,$5,$6,$7)`,
        [
          movementId,
          data.date,
          line.itemId,
          line.description,
          -line.qty,
          deliveryId,
          `Kit de ingreso · ${data.name.trim()}`,
        ],
      );
    }

    return snapshot();
  });

export const issueSingleOnServer = createServerFn({ method: "POST" })
  .validator((input: unknown) => issueSingleSchema.parse(input))
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { getSql } = await getDb();
    const sql = await getSql();
    const deliveryId = `ENT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const movementId = `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const created = await sql.query<{ id: string }>(
      `with deducted as (
         update inventory_items
         set stock = stock - 1, updated_at = now()
         where id = $1 and stock >= 1
         returning id, description, size
       ),
       created_delivery as (
         insert into deliveries
           (id, delivery_date, employee_name, area, role, gender, delivery_kind, note)
         select $2,$3,$4,$5,$6,$7,'individual',$8
         from deducted
         returning id
       ),
       created_line as (
         insert into delivery_lines
           (delivery_id, item_id, description, qty, size)
         select cd.id, d.id, d.description, 1, d.size
         from created_delivery cd cross join deducted d
         returning id
       ),
       created_movement as (
         insert into stock_movements
           (id, movement_date, movement_type, item_id, description, qty_change, reference, note)
         select $9,$3,'entrega',d.id,d.description,-1,cd.id,
                ('Cambio / reposición · ' || $4 || case when $8 = '' then '' else ' · ' || $8 end)
         from created_delivery cd cross join deducted d
         returning id
       )
       select id from created_delivery`,
      [
        data.itemId,
        deliveryId,
        data.date,
        data.name.trim(),
        data.area.trim(),
        data.role,
        data.gender,
        data.note.trim(),
        movementId,
      ],
    );

    if (!created.length) {
      throw new Error("La prenda seleccionada está agotada o ya no existe.");
    }
    return snapshot();
  });

export const deleteDeliveryOnServer = createServerFn({ method: "POST" })
  .validator((input: unknown) => deleteDeliverySchema.parse(input))
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { getSql } = await getDb();
    const sql = await getSql();

    const [delivery] = await sql.query<{ id: string; employee_name: string }>(
      "select id, employee_name from deliveries where id = $1",
      [data.deliveryId],
    );
    if (!delivery) throw new Error("La entrega seleccionada ya no existe.");

    const deleted = await sql.query<{ id: string }>(
      `with restored as (
         select item_id, sum(qty)::integer as qty
         from delivery_lines
         where delivery_id = $1
         group by item_id
       ),
       updated as (
         update inventory_items i
         set stock = i.stock + r.qty, updated_at = now()
         from restored r
         where i.id = r.item_id
         returning i.id
       ),
       deleted_movements as (
         delete from stock_movements
         where reference = $1 and movement_type = 'entrega'
         returning id
       ),
       deleted_delivery as (
         delete from deliveries
         where id = $1
         returning id
       )
       select id from deleted_delivery`,
      [data.deliveryId],
    );

    if (!deleted.length) throw new Error("No se pudo eliminar la entrega.");
    return snapshot();
  });

export type FullBackup = InventorySnapshot;

export const getFullBackup = createServerFn({ method: "GET" }).handler(
  async (): Promise<FullBackup> => buildSnapshot(false),
);
