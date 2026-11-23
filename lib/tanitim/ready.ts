import manifest from "./manifest.json";

/**
 * Tanıtım ekranları çekildi mi? (scripts/tour/capture.mjs manifest'i doldurur.)
 * Ekranlar yokken giriş sayfasındaki tanıtım şeridi, menü öğesi ve başlık butonu gizlenir.
 */
export const TOUR_READY = (manifest.modules as { steps: unknown[] }[]).some(
  (m) => m.steps.length > 0,
);
