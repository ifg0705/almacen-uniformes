create table if not exists inventory_items (
  id text primary key,
  description text not null,
  family text not null,
  size text not null,
  stock integer not null default 0 check (stock >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  unit_cost numeric(12,2) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists deliveries (
  id text primary key,
  delivery_date date not null,
  employee_name text not null,
  area text not null default '',
  role text not null,
  gender text not null,
  created_at timestamptz not null default now()
);

create table if not exists delivery_lines (
  id bigserial primary key,
  delivery_id text not null references deliveries(id) on delete cascade,
  item_id text not null references inventory_items(id),
  description text not null,
  qty integer not null check (qty > 0),
  size text not null
);

create table if not exists stock_movements (
  id text primary key,
  movement_date date not null,
  movement_type text not null check (movement_type in ('entrada', 'entrega', 'ajuste')),
  item_id text not null references inventory_items(id),
  description text not null,
  qty_change integer not null,
  reference text not null default '',
  supplier text not null default '',
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists idx_deliveries_created_at on deliveries(created_at desc);
create index if not exists idx_stock_movements_created_at on stock_movements(created_at desc);
create index if not exists idx_stock_movements_item_id on stock_movements(item_id);
