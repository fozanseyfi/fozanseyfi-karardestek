-- Güvenlik sıkılaştırması: INSERT policy'leri organization_id'yi explicit doğrular.
-- Önceki durum: trigger sadece organization_id null geldiğinde dolduruyordu, INSERT
-- policy'leri organization_id'yi with check'te kontrol etmiyordu. Authenticated bir
-- kullanıcı doğrudan Supabase API'ye başka org'un uuid'sini gönderirse o org'a kayıt
-- yazabiliyordu (cross-tenant write). Aşağıdaki policy'ler kayıt yapılan org'un
-- mutlaka çağıran kullanıcının kendi org'u olmasını zorunlu kılar.

-- FIRMS
drop policy if exists firms_insert on firms;
create policy firms_insert on firms for insert to authenticated
  with check (
    organization_id = current_user_org_id()
    and current_user_role() in ('admin', 'user')
  );

-- PROJECTS
drop policy if exists projects_insert on projects;
create policy projects_insert on projects for insert to authenticated
  with check (
    organization_id = current_user_org_id()
    and owner_id = auth.uid()
    and current_user_role() in ('admin', 'user')
  );

-- COMPARISONS
drop policy if exists comparisons_insert on comparisons;
create policy comparisons_insert on comparisons for insert to authenticated
  with check (
    organization_id = current_user_org_id()
    and owner_id = auth.uid()
    and current_user_role() in ('admin', 'user')
  );

-- TEMPLATES
-- Ek olarak: kullanıcılar is_system=true (tüm org'lara görünen) template yaratamaz.
-- Sistem template'leri sadece migration ile (seed) veya service-role ile oluşturulur.
drop policy if exists templates_insert on templates;
create policy templates_insert on templates for insert to authenticated
  with check (
    organization_id = current_user_org_id()
    and is_system = false
    and created_by = auth.uid()
    and current_user_role() in ('admin', 'user')
  );

-- NOTIFICATIONS
drop policy if exists notifications_admin_insert on notifications;
create policy notifications_admin_insert on notifications for insert to authenticated
  with check (
    organization_id = current_user_org_id()
    and is_admin()
  );
