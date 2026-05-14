/**
 * UMR (Upah Minimum Regional) Data for Major Indonesian Cities (2024 baselines)
 * Used to evaluate if a user's monthly income falls below a livable wage,
 * triggering the AI to recommend Side-Hustles instead of Investment.
 */

export const UMR_DATA: Record<string, number> = {
  "DKI Jakarta": 5067381,
  "Kota Bekasi": 5343430,
  "Kabupaten Karawang": 5257834,
  "Kota Depok": 4878612,
  "Kota Bogor": 4813988,
  "Kota Tangerang": 4760289,
  "Kota Tangerang Selatan": 4670791,
  "Kota Surabaya": 4725479,
  "Kota Semarang": 3243969,
  "Kota Bandung": 4209309,
  "Kota Medan": 3769082,
  "Kota Makassar": 3643321,
  "DIY Yogyakarta": 2492997,
  "Bali": 2813672,
};

// If city is unknown or not in list, use a reasonable national average 
export const NATIONAL_AVERAGE_UMR = 3200000;
