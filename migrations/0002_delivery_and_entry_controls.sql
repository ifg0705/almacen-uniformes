alter table deliveries
  add column if not exists delivery_kind text not null default 'kit';

alter table deliveries
  add column if not exists note text not null default '';

create index if not exists idx_deliveries_delivery_date on deliveries(delivery_date desc);
