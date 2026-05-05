-- Multi-org tamamlayıcı: organizations.SELECT politikasını üyelik bazlı yap
-- (Aktif org dışındaki üyeliklerin de switcher dropdown'da görünmesi için.)

drop policy if exists organizations_select on organizations;
create policy organizations_select on organizations for select to authenticated
  using (user_belongs_to_org(id));

-- Eski kayıtların temizliği (aktif org rezolüsyonu için bütünlük): owner_id NULL'sa,
-- ilgili org'un en eski admin üyesini owner_id olarak ata.
update organizations o
set owner_id = m.user_id
from organization_members m
where o.owner_id is null
  and m.organization_id = o.id
  and m.role = 'admin'
  and m.user_id = (
    select user_id from organization_members
    where organization_id = o.id and role = 'admin'
    order by joined_at asc
    limit 1
  );
