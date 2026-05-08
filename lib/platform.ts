/**
 * Bu kod tabanının ait olduğu platform.
 *
 * organization_members tablosu (user_id, organization_id, platform) composite
 * primary key kullanıyor. Bu sayede aynı kullanıcı aynı org'da birden çok
 * platformda farklı rollerde üye olabilir; bir platforma davet edilen
 * kullanıcı diğer platformlarda görünmez.
 *
 * Tüm organization_members ve invitations sorgularında bu sabiti
 * `platform: PLATFORM_KEY` filter'ı olarak kullan.
 */
export const PLATFORM_KEY = "karar-destek" as const;
