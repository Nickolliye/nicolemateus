-- ============================================================
-- Nicole & Mateus - Wedding Gift List - Initial Schema
-- ============================================================
create extension if not exists "pgcrypto";

-- GIFTS TABLE
create table if not exists public.gifts (
  id                uuid primary key default gen_random_uuid(),
  name              text not null check (char_length(name) between 2 and 120),
  description       text check (char_length(description) <= 500),
  image_path        text,
  quantity_mode     text not null default 'fixed' check (quantity_mode in ('fixed', 'unlimited')),
  required_quantity integer check (
    (quantity_mode = 'fixed' and required_quantity > 0)
    or (quantity_mode = 'unlimited' and required_quantity is null)
  ),
  inventory_status  text not null default 'needed' check (inventory_status in ('needed', 'owned')),
  is_visible        boolean not null default true,
  display_order     integer not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- RESERVATIONS TABLE
create table if not exists public.gift_reservations (
  id          uuid primary key default gen_random_uuid(),
  gift_id     uuid not null references public.gifts(id) on delete restrict,
  guest_name  text not null check (char_length(trim(guest_name)) between 2 and 100),
  quantity    integer not null default 1 check (quantity > 0),
  status      text not null default 'active' check (status in ('active', 'cancelled')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- AUDIT LOG TABLE
create table if not exists public.admin_audit_log (
  id          uuid primary key default gen_random_uuid(),
  action      text not null,
  entity      text not null,
  entity_id   uuid,
  notes       text,
  performed_at timestamptz not null default now()
);

-- INDEXES
create index if not exists idx_gifts_visible on public.gifts (is_visible, inventory_status, display_order);
create index if not exists idx_reservations_gift_status on public.gift_reservations (gift_id, status);
create index if not exists idx_reservations_created on public.gift_reservations (created_at desc);

-- AUTO UPDATE updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger gifts_set_updated_at before update on public.gifts
  for each row execute function public.set_updated_at();
create trigger reservations_set_updated_at before update on public.gift_reservations
  for each row execute function public.set_updated_at();

-- ATOMIC RESERVE FUNCTION (SECURITY DEFINER - safe)
create or replace function public.reserve_gift(
  p_gift_id   uuid,
  p_guest_name text,
  p_quantity  integer default 1
) returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_gift        public.gifts%rowtype;
  v_reserved    integer;
  v_available   integer;
  v_reservation public.gift_reservations%rowtype;
  v_clean_name  text;
begin
  v_clean_name := trim(p_guest_name);
  if v_clean_name is null or char_length(v_clean_name) < 2 then
    return jsonb_build_object('success', false, 'error', 'invalid_name',
      'message', 'Por favor, informe um nome valido (minimo 2 caracteres).');
  end if;
  if char_length(v_clean_name) > 100 then
    return jsonb_build_object('success', false, 'error', 'invalid_name',
      'message', 'Nome muito longo. Maximo de 100 caracteres.');
  end if;
  if p_quantity is null or p_quantity < 1 then
    return jsonb_build_object('success', false, 'error', 'invalid_quantity',
      'message', 'A quantidade deve ser pelo menos 1.');
  end if;
  if p_quantity > 100 then
    return jsonb_build_object('success', false, 'error', 'invalid_quantity',
      'message', 'Quantidade excessiva. Maximo de 100 por reserva.');
  end if;
  select * into v_gift from public.gifts where id = p_gift_id for update;
  if not found then
    return jsonb_build_object('success', false, 'error', 'not_found',
      'message', 'Presente nao encontrado.');
  end if;
  if not v_gift.is_visible then
    return jsonb_build_object('success', false, 'error', 'not_available',
      'message', 'Este presente nao esta disponivel no momento.');
  end if;
  if v_gift.inventory_status = 'owned' then
    return jsonb_build_object('success', false, 'error', 'already_owned',
      'message', 'O casal ja possui este item.');
  end if;
  if v_gift.quantity_mode = 'fixed' then
    select coalesce(sum(r.quantity), 0) into v_reserved
    from public.gift_reservations r
    where r.gift_id = p_gift_id and r.status = 'active';
    v_available := v_gift.required_quantity - v_reserved;
    if v_available <= 0 then
      return jsonb_build_object('success', false, 'error', 'no_availability',
        'message', 'Que pena! Este presente ja foi garantido por outros convidados.');
    end if;
    if p_quantity > v_available then
      return jsonb_build_object('success', false, 'error', 'quantity_exceeds',
        'message', format('So %s unidade(s) disponivel(is) para este presente.', v_available),
        'available', v_available);
    end if;
  end if;
  insert into public.gift_reservations (gift_id, guest_name, quantity, status)
  values (p_gift_id, v_clean_name, p_quantity, 'active')
  returning * into v_reservation;
  return jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation.id,
    'gift_name', v_gift.name,
    'guest_name', v_clean_name,
    'quantity', p_quantity
  );
end; $$;

revoke all on function public.reserve_gift(uuid, text, integer) from public;
grant execute on function public.reserve_gift(uuid, text, integer) to anon;
grant execute on function public.reserve_gift(uuid, text, integer) to authenticated;

-- CANCEL RESERVATION (admin only)
create or replace function public.cancel_reservation(
  p_reservation_id uuid, p_notes text default null
) returns jsonb language plpgsql security definer set search_path = public as $$
declare v_res public.gift_reservations%rowtype;
begin
  select * into v_res from public.gift_reservations where id = p_reservation_id for update;
  if not found then return jsonb_build_object('success', false, 'error', 'not_found'); end if;
  if v_res.status = 'cancelled' then return jsonb_build_object('success', false, 'error', 'already_cancelled'); end if;
  update public.gift_reservations set status = 'cancelled', updated_at = now() where id = p_reservation_id;
  insert into public.admin_audit_log (action, entity, entity_id, notes)
  values ('cancel_reservation', 'gift_reservations', p_reservation_id, p_notes);
  return jsonb_build_object('success', true, 'reservation_id', p_reservation_id);
end; $$;

revoke all on function public.cancel_reservation(uuid, text) from public;
grant execute on function public.cancel_reservation(uuid, text) to authenticated;

-- ROW LEVEL SECURITY
alter table public.gifts enable row level security;
create policy "public_read_visible_gifts" on public.gifts for select to anon using (is_visible = true);
create policy "admin_all_gifts" on public.gifts for all to authenticated using (true) with check (true);

alter table public.gift_reservations enable row level security;
create policy "admin_all_reservations" on public.gift_reservations for all to authenticated using (true) with check (true);

alter table public.admin_audit_log enable row level security;
create policy "admin_read_audit" on public.admin_audit_log for select to authenticated using (true);
create policy "admin_insert_audit" on public.admin_audit_log for insert to authenticated with check (true);

-- GRANTS
grant select on public.gifts to anon;
grant select on public.gifts to authenticated;
grant insert, update, delete on public.gifts to authenticated;
grant select on public.gift_reservations to authenticated;
grant insert, update on public.gift_reservations to authenticated;
grant select, insert on public.admin_audit_log to authenticated;
