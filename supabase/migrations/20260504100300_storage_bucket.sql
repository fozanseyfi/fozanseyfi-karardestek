-- Storage bucket for PDF teklif dosyaları
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bid-pdfs', 'bid-pdfs', false, 10485760, array['application/pdf'])
on conflict (id) do nothing;

-- Storage RLS: only users who can view comparison can read; only editors can write
create policy "bid_pdfs_read"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'bid-pdfs'
    and exists (
      select 1 from public.comparison_firms cf
      where cf.id::text = (storage.foldername(name))[1]
        and public.can_view_comparison(cf.comparison_id)
    )
  );

create policy "bid_pdfs_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'bid-pdfs'
    and exists (
      select 1 from public.comparison_firms cf
      where cf.id::text = (storage.foldername(name))[1]
        and public.can_edit_comparison(cf.comparison_id)
    )
  );

create policy "bid_pdfs_update"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'bid-pdfs'
    and exists (
      select 1 from public.comparison_firms cf
      where cf.id::text = (storage.foldername(name))[1]
        and public.can_edit_comparison(cf.comparison_id)
    )
  );

create policy "bid_pdfs_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'bid-pdfs'
    and exists (
      select 1 from public.comparison_firms cf
      where cf.id::text = (storage.foldername(name))[1]
        and public.can_edit_comparison(cf.comparison_id)
    )
  );
