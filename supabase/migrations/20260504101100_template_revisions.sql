-- Tüm şablonların sample_data'sına 3 revize simülasyonu ekle
-- Format: sample_data.revisions = [{ revision: 2, prices: [[items×firms]] }, { revision: 3, prices: [[...]] }]
-- Tipik patern: rev2 = rev1 × ~0.97 (firma %3 düştü), rev3 = rev2 × ~0.98 (ek %2 düşüş)

update templates
set sample_data = jsonb_set(
  sample_data,
  '{revisions}',
  $$[
    {
      "revision": 2,
      "prices": [
        [232, 258, 240, 270],
        [16, 18, 16, 19],
        [32, 35, 33, 38],
        [1100, 1240, 1170, 1310],
        [40, 46, 42, 50],
        [68000, 77000, 70000, 85000]
      ]
    },
    {
      "revision": 3,
      "prices": [
        [225, 250, 235, 262],
        [15.5, 17.5, 15.5, 18.5],
        [31, 34, 32, 36],
        [1080, 1210, 1150, 1280],
        [39, 45, 41, 48],
        [66000, 75000, 68000, 82000]
      ]
    }
  ]$$::jsonb
)
where name = 'GES Mekanik Montaj';

update templates
set sample_data = jsonb_set(
  sample_data,
  '{revisions}',
  $$[
    {
      "revision": 2,
      "prices": [
        [26, 29, 25],
        [61, 68, 58],
        [270, 290, 265],
        [430000, 470000, 415000],
        [11200, 12700, 10700],
        [170000, 195000, 165000],
        [23500, 26500, 23000]
      ]
    },
    {
      "revision": 3,
      "prices": [
        [25, 28, 24.5],
        [60, 67, 57],
        [265, 285, 260],
        [425000, 460000, 410000],
        [11000, 12500, 10500],
        [167000, 192000, 162000],
        [23000, 26000, 22500]
      ]
    }
  ]$$::jsonb
)
where name = 'GES Elektrik İşleri';

update templates
set sample_data = jsonb_set(
  sample_data,
  '{revisions}',
  $$[
    {
      "revision": 2,
      "prices": [
        [7.3, 8.2, 6.8],
        [365, 395, 355],
        [265, 295, 260],
        [212, 235, 207],
        [80500, 90000, 78500]
      ]
    },
    {
      "revision": 3,
      "prices": [
        [7.1, 8.0, 6.7],
        [360, 390, 350],
        [260, 290, 255],
        [208, 230, 205],
        [79000, 88000, 77000]
      ]
    }
  ]$$::jsonb
)
where name = 'GES İnşaat İşleri';

update templates
set sample_data = jsonb_set(
  sample_data,
  '{revisions}',
  $$[
    {
      "revision": 2,
      "prices": [
        [810, 870, 860],
        [2120, 2250, 2150],
        [36500, 39000, 37000],
        [237000, 265000, 242000],
        [80000, 86000, 92500],
        [17200, 18700, 17500]
      ]
    },
    {
      "revision": 3,
      "prices": [
        [800, 855, 850],
        [2100, 2230, 2130],
        [36000, 38500, 36500],
        [234000, 262000, 240000],
        [78000, 84000, 90000],
        [17000, 18500, 17200]
      ]
    }
  ]$$::jsonb
)
where name = 'RES Kule & Foundation';

update templates
set sample_data = jsonb_set(
  sample_data,
  '{revisions}',
  $$[
    {
      "revision": 2,
      "prices": [
        [335, 358, 340],
        [270, 290, 265],
        [305000, 332000, 310000],
        [80, 88, 78],
        [90000, 98000, 88000]
      ]
    },
    {
      "revision": 3,
      "prices": [
        [330, 355, 335],
        [265, 285, 260],
        [302000, 330000, 308000],
        [78, 86, 76],
        [89000, 96000, 87000]
      ]
    }
  ]$$::jsonb
)
where name = 'RES Elektrik & SCADA';

update templates
set sample_data = jsonb_set(
  sample_data,
  '{revisions}',
  $$[
    {
      "revision": 2,
      "prices": [
        [1430, 1580, 1460],
        [3050, 3350, 3000],
        [80, 88, 78]
      ]
    },
    {
      "revision": 3,
      "prices": [
        [1400, 1560, 1450],
        [3000, 3300, 2980],
        [79, 87, 77]
      ]
    }
  ]$$::jsonb
)
where name = 'Genel Malzeme Karşılaştırma';
