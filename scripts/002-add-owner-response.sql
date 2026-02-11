-- Add owner_response column to rental_requests for lender messages
alter table public.rental_requests
  add column if not exists owner_response text;

-- Also allow borrowers to update their own requests (e.g. cancel)
drop policy if exists "rental_requests_update_borrower" on public.rental_requests;
create policy "rental_requests_update_borrower" on public.rental_requests
  for update using (auth.uid() = borrower_id);
