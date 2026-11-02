/** 도시 위경도 (3D 지구본용) — data.ts의 cities id와 매칭 */
export const cityGeo: Record<string, { lat: number; lng: number }> = {
  nyc: { lat: 40.71, lng: -74.0 },
  la: { lat: 34.05, lng: -118.24 },
  toronto: { lat: 43.65, lng: -79.38 },
  vancouver: { lat: 49.28, lng: -123.12 },
  sydney: { lat: -33.87, lng: 151.21 },
  melbourne: { lat: -37.81, lng: 144.96 },
  london: { lat: 51.5, lng: -0.13 },
  berlin: { lat: 52.52, lng: 13.4 },
  tokyo: { lat: 35.68, lng: 139.69 },
  hcmc: { lat: 10.82, lng: 106.63 },
};
