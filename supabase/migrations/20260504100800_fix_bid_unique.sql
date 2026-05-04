-- Fix bid_prices unique to include revision (was item_id+firm_id only → 2nd revize fails)
alter table bid_prices drop constraint if exists bid_prices_item_id_firm_id_key;
alter table bid_prices add constraint bid_prices_item_firm_revision_key unique (item_id, firm_id, revision);
