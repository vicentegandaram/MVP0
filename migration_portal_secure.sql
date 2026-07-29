-- Portal del paciente · acceso seguro vía token + RPC SECURITY DEFINER
-- Reemplaza migration_portal_rls.sql, que dejaba "USING (true)" sobre las
-- tablas patient/nutrition_plan/shopping_list y permitía a cualquiera con
-- la anon key dumpear todos los pacientes.
--
-- Aplicar en Supabase Dashboard > SQL Editor. Es idempotente.

-- 1. Token por paciente (UUID, no enumerable)
alter table public.patient
  add column if not exists portal_token uuid not null default gen_random_uuid();

create unique index if not exists idx_patient_portal_token
  on public.patient(portal_token);

-- 2. Eliminar policies abiertas anteriores
drop policy if exists "portal_patient_read" on public.patient;
drop policy if exists "portal_plan_read" on public.nutrition_plan;
drop policy if exists "portal_meal_read" on public.meal;
drop policy if exists "portal_meal_food_read" on public.meal_food;
drop policy if exists "portal_shopping_list_read" on public.shopping_list;
drop policy if exists "portal_shopping_item_read" on public.shopping_item;
drop policy if exists "portal_shopping_item_update" on public.shopping_item;

-- A partir de aquí, anon no puede SELECT/UPDATE directamente sobre las tablas.
-- El portal sólo accede vía las funciones de abajo, que validan el token.

-- 3. RPC: bundle con todo lo que el portal necesita en una sola llamada
create or replace function public.portal_get_bundle(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_patient_id uuid;
  v_result jsonb;
begin
  select id into v_patient_id
    from patient
   where portal_token = p_token;

  if v_patient_id is null then
    return null;
  end if;

  select jsonb_build_object(
    'patient', (
      select jsonb_build_object(
        'id',        p.id,
        'name',      p.name,
        'last_name', p.last_name
      )
      from patient p where p.id = v_patient_id
    ),
    'plan', (
      select to_jsonb(np)
      from nutrition_plan np
      where np.patient_id = v_patient_id
        and np.is_active = true
      order by np.created_at desc
      limit 1
    ),
    'meals', coalesce((
      select jsonb_agg(meal_obj order by day_of_week, meal_type)
      from (
        select
          m.day_of_week,
          m.meal_type,
          to_jsonb(m) || jsonb_build_object(
            'foods', coalesce((
              select jsonb_agg(to_jsonb(f) order by f.created_at)
              from meal_food f where f.meal_id = m.id
            ), '[]'::jsonb)
          ) as meal_obj
        from meal m
        where m.plan_id in (
          select id from nutrition_plan
          where patient_id = v_patient_id and is_active = true
        )
      ) sub
    ), '[]'::jsonb),
    'shopping_list', (
      select jsonb_build_object(
        'id',    sl.id,
        'name',  sl.name,
        'items', coalesce((
          select jsonb_agg(to_jsonb(si) order by si.category, si.food_name)
          from shopping_item si where si.shopping_list_id = sl.id
        ), '[]'::jsonb)
      )
      from shopping_list sl
      where sl.patient_id = v_patient_id
      order by sl.created_at desc
      limit 1
    )
  ) into v_result;

  return v_result;
end;
$$;

revoke all on function public.portal_get_bundle(uuid) from public;
grant execute on function public.portal_get_bundle(uuid) to anon, authenticated;

-- 4. RPC: marcar/desmarcar un item de la lista como comprado
create or replace function public.portal_toggle_shopping_item(
  p_token   uuid,
  p_item_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_patient_id uuid;
  v_new_state  boolean;
begin
  select id into v_patient_id
    from patient
   where portal_token = p_token;

  if v_patient_id is null then
    raise exception 'invalid_portal_token';
  end if;

  update shopping_item si
     set is_purchased = not coalesce(si.is_purchased, false)
   where si.id = p_item_id
     and si.shopping_list_id in (
       select id from shopping_list where patient_id = v_patient_id
     )
   returning si.is_purchased into v_new_state;

  if v_new_state is null then
    raise exception 'item_not_found_for_token';
  end if;

  return v_new_state;
end;
$$;

revoke all on function public.portal_toggle_shopping_item(uuid, uuid) from public;
grant execute on function public.portal_toggle_shopping_item(uuid, uuid) to anon, authenticated;
