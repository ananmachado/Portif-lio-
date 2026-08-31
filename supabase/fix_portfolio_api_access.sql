-- Run this once in Supabase > SQL Editor for an EXISTING portfolio database.
-- It is safe to run more than once.

grant usage on schema public to service_role;

grant select, insert, update, delete on table
  public.users,
  public.portfolio_settings,
  public.categories,
  public.projects,
  public.project_blocks
to service_role;

grant usage, select on all sequences in schema public to service_role;

revoke all on table
  public.users,
  public.portfolio_settings,
  public.categories,
  public.projects,
  public.project_blocks
from anon, authenticated;

alter table public.users enable row level security;
alter table public.portfolio_settings enable row level security;
alter table public.categories enable row level security;
alter table public.projects enable row level security;
alter table public.project_blocks enable row level security;

alter default privileges for role postgres in schema public
  grant select, insert, update, delete on tables to service_role;
alter default privileges for role postgres in schema public
  grant usage, select on sequences to service_role;
