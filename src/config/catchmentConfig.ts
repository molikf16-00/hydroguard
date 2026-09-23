/** Configured coordinates; village boundaries have not been surveyed. */
export interface VillageConfigItem {
  id: string;
  name: string;
  lat: number;
  lon: number;
}
export interface CatchmentSettings {
  id: string;
  name: string;
  villages: VillageConfigItem[];
}
export const MODEL_ASSUMPTIONS = {
  soilFieldCapacityM3M3: 0.42,
  trendHours: 24,
};
export const DEFAULT_CATCHMENT_CONFIG: CatchmentSettings = {
  id: "chamoli-rishi-ganga",
  name: "Rishi Ganga catchment",
  villages: [
    {
      id: "v-raini",
      name: "Raini (Upper & Lower)",
      lat: 30.4884,
      lon: 79.6972,
    },
    { id: "v-tapovan", name: "Tapovan Outskirts", lat: 30.4932, lon: 79.6275 },
    {
      id: "v-joshimath",
      name: "Joshimath (North Slope)",
      lat: 30.5562,
      lon: 79.5661,
    },
    { id: "v-helang", name: "Helang Terrace", lat: 30.5283, lon: 79.5135 },
    { id: "v-pipalkoti", name: "Pipalkoti Plateau", lat: 30.43, lon: 79.43 },
  ],
};
