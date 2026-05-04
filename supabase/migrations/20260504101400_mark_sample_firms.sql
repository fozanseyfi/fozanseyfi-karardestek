-- Geriye dönük: şablonlardan klonlanmış olabilecek tipik firmaları is_sample=true işaretle
update firms set is_sample = true where name in (
  'Firma A', 'Firma B', 'Firma C', 'Firma D',
  'Sesa Mühendislik', 'Soldera Solar', 'Bekir Ökmen Mühendislik', 'Efesun Yapı',
  'Vestas Türkiye', 'GE Renewable Türkiye', 'Elin İnşaat'
);
