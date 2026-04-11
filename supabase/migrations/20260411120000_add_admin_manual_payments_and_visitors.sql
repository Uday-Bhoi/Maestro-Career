alter table public.profiles
add column if not exists payment_method text
  check (payment_method in ('razorpay', 'cash', 'manual_upi')),
add column if not exists manual_cash_amount numeric(10, 2),
add column if not exists manual_payment_notes text;

comment on column public.profiles.payment_method is 'How the payment was collected: Razorpay, cash, or manual UPI.';
comment on column public.profiles.manual_cash_amount is 'Amount collected manually in cash, when applicable.';
comment on column public.profiles.manual_payment_notes is 'Optional admin notes for offline/manual payments.';

create table if not exists public.website_visitors (
  id uuid primary key default gen_random_uuid(),
  visitor_key text not null unique,
  first_path text,
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  visit_count integer not null default 1,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists website_visitors_last_seen_at_idx
  on public.website_visitors (last_seen_at desc);

drop trigger if exists website_visitors_set_updated_at on public.website_visitors;
create trigger website_visitors_set_updated_at
before update on public.website_visitors
for each row
execute function public.set_updated_at();
