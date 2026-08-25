import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { kitFor, seedItems, type Gender, type Item, type Role } from "./catalog";

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

const receiveSchema = z.object({
  itemId: z.string().min(1),
  qty: z.coerce.number().int().positive(),
  date: z.string().min(10),
  supplier: z.string().default(""),
  note: z.string().default(""),
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

async function snapshot(): Promise<InventorySnapshot> {
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

  const deliveryRows = await sql.query<{
    id: string;
    delivery_date: string;
    employee_name: string;
    area: string;
    role: Role;
    gender: Gender;
  }>(
    `select id, delivery_date, employee_name, area, role, gender
     from deliveries
     order by created_at desc
     limit 300`,
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
         order by id desc
         limit 2000`,
      )
    : [];

  const movementRows = await sql.query<{
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
  }>(
    `select id, movement_date, movement_type, item_id, description,
            qty_change, reference, supplier, note, created_at
     from stock_movements
     order by created_at desc
     limit 300`,
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

export const getInventorySnapshot = createServerFn({ method: "GET" }).handler(async () => {
  return snapshot();
});

export const receiveStock = createServerFn({ method: "POST" })
  .validator((input: unknown) => receiveSchema.parse(input))
  .handler(async ({ data }) => {
    await ensureSeeded();
    const { getSql } = await getDb();
    const sql = await getSql();

    const [item] = await sql.query<{
      id: string;
      description: string;
      stock: number;
    }>("select id, description, stock from inventory_items where id = $1", [data.itemId]);

    if (!item) throw new Error("El producto seleccionado ya no existe.");

    await sql.query(
      `update inventory_items
       set stock = stock + $1, updated_at = now()
       where id = $2`,
      [data.qty, data.itemId],
    );

    const movementId = `MOV-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await sql.query(
      `insert into stock_movements
        (id, movement_date, movement_type, item_id, description, qty_change, reference, supplier, note)
       values ($1,$2,'entrada',$3,$4,$5,$6,$7,$8)`,
      [
        movementId,
        data.date,
        data.itemId,
        item.description,
        data.qty,
        `Entrada ${movementId}`,
        data.supplier.trim(),
        data.note.trim(),
      ],
    );

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

      const [item] = await sql.query<{
        id: string;
        description: string;
        stock: number;
      }>(
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
        (id, delivery_date, employee_name, area, role, gender)
       values ($1,$2,$3,$4,$5,$6)`,
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
          `Entrega a ${data.name.trim()}`,
        ],
      );
    }

    return snapshot();
  });
