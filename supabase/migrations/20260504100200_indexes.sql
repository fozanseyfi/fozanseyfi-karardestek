-- Performance indexes

create index idx_profiles_email on profiles(email);
create index idx_profiles_role on profiles(role);

create index idx_projects_owner on projects(owner_id);

create index idx_firms_name on firms(name);
create index idx_firms_created_by on firms(created_by);

create index idx_comparisons_owner on comparisons(owner_id);
create index idx_comparisons_project on comparisons(project_id);
create index idx_comparisons_status on comparisons(status);
create index idx_comparisons_created on comparisons(created_at desc);

create index idx_cf_comparison on comparison_firms(comparison_id);
create index idx_cf_firm on comparison_firms(firm_id);

create index idx_ci_comparison on comparison_items(comparison_id);
create index idx_ci_position on comparison_items(comparison_id, position);

create index idx_bp_comparison on bid_prices(comparison_id);
create index idx_bp_item on bid_prices(item_id);
create index idx_bp_firm on bid_prices(firm_id);

create index idx_cs_comparison on comparison_shares(comparison_id);
create index idx_cs_with on comparison_shares(shared_with);

create index idx_notifications_user_unread on notifications(user_id, read_at) where read_at is null;
create index idx_notifications_created on notifications(user_id, created_at desc);

create index idx_templates_category on templates(category);
create index idx_templates_type on templates(type);
