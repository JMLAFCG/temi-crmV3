create extension if not exists pgcrypto;

create table if not exists public.operational_tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo' check (status in ('todo','in_progress','blocked','done','cancelled')),
  priority text not null default 'normal' check (priority in ('critical','high','normal','low')),
  source text not null default 'manual' check (source in ('manual','workflow','risk_engine','opportunity_engine','system')),
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  assigned_to uuid references public.users(id) on delete set null,
  created_by uuid references public.users(id) on delete set null,
  due_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  blocked_reason text,
  estimated_minutes integer not null default 15 check (estimated_minutes >= 0),
  potential_value numeric(14,2) not null default 0,
  risk_value numeric(14,2) not null default 0,
  customer_impact integer not null default 0 check (customer_impact between 0 and 100),
  group_impact integer not null default 0 check (group_impact between 0 and 100),
  priority_score numeric(10,2) not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists operational_tasks_project_idx on public.operational_tasks(project_id);
create index if not exists operational_tasks_client_idx on public.operational_tasks(client_id);
create index if not exists operational_tasks_assigned_idx on public.operational_tasks(assigned_to);
create index if not exists operational_tasks_status_due_idx on public.operational_tasks(status, due_at);
create index if not exists operational_tasks_priority_score_idx on public.operational_tasks(priority_score desc);

create or replace function public.set_operational_task_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_operational_tasks_updated_at on public.operational_tasks;
create trigger trg_operational_tasks_updated_at
before update on public.operational_tasks
for each row execute function public.set_operational_task_updated_at();

alter table public.operational_tasks enable row level security;

create policy "operational_tasks_select_authenticated"
on public.operational_tasks for select
to authenticated
using (true);

create policy "operational_tasks_insert_staff"
on public.operational_tasks for insert
to authenticated
with check (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role in ('admin','super_admin','manager','commercial','mandatary')
  )
);

create policy "operational_tasks_update_staff_or_assignee"
on public.operational_tasks for update
to authenticated
using (
  assigned_to = auth.uid()
  or exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role in ('admin','super_admin','manager')
  )
)
with check (true);

create policy "operational_tasks_delete_management"
on public.operational_tasks for delete
to authenticated
using (
  exists (
    select 1 from public.users u
    where u.id = auth.uid()
      and u.role in ('admin','super_admin','manager')
  )
);
