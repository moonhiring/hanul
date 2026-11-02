import { useEffect, useState } from "react";
import { businesses as curated, type Business, type BizCategory } from "@/data";

interface SeedRecord {
  id: number;
  name: string;
  category: BizCategory;
  rawCategory: string;
  city: string;
  address: string;
  locality: string;
  phone: string;
  website: string;
  lat: number | null;
  lng: number | null;
}

let cache: Promise<Business[]> | null = null;

function toBusiness(r: SeedRecord): Business {
  return {
    id: r.id,
    name: r.name,
    initial: r.name.trim().charAt(0).toUpperCase(),
    category: r.category,
    city: r.city,
    verified: false,
    tagline: r.rawCategory ? r.rawCategory.replace(/_/g, " ") : undefined,
    address: r.address || undefined,
    locality: r.locality || undefined,
    phone: r.phone || undefined,
    website: r.website || undefined,
    lat: r.lat,
    lng: r.lng,
    source: "overture",
  };
}

/**
 * 업체 데이터 로딩 순서:
 *  1) /api/businesses (Docker 백엔드 — Postgres)
 *  2) /seed/businesses.json (정적 폴백 — API 없이도 동작)
 */
function loadSeed(): Promise<Business[]> {
  if (!cache) {
    cache = (async () => {
      try {
        const res = await fetch("/api/businesses?limit=20000");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.items) && data.items.length > 0) {
            return data.items.map(toBusiness);
          }
        }
      } catch {
        /* API 미기동 — 폴백으로 */
      }
      try {
        const res = await fetch("/seed/businesses.json");
        if (res.ok) {
          const rows = (await res.json()) as SeedRecord[];
          return rows.map(toBusiness);
        }
      } catch {
        /* 정적 시드도 없으면 빈 목록 */
      }
      return [] as Business[];
    })();
  }
  return cache;
}

/** 큐레이션(한울 등록/인증) 목업 + 시드/DB 데이터를 합쳐 반환 */
export function useBusinesses(): { businesses: Business[]; seedLoaded: boolean } {
  const [seed, setSeed] = useState<Business[]>([]);
  const [seedLoaded, setSeedLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    loadSeed().then((rows) => {
      if (alive) {
        setSeed(rows);
        setSeedLoaded(true);
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return { businesses: [...curated, ...seed], seedLoaded };
}
