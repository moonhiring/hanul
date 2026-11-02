import { useEffect, useRef } from "react";
import { LAND_DOTS } from "@/lib/globe-dots";
import { cityGeo } from "@/lib/geo";
import { cities } from "@/data";

/** 지구본 회전·투영 상수 */
const TILT = (-14 * Math.PI) / 180; // 보기 좋은 축 기울기
const IDLE_SPEED = 0.05; // rad/s — 자전 속도
const HOLD_MS = 4200; // 도시 선택 후 머무는 시간

interface Props {
  /** 선택된 도시 id (context의 city) */
  cityId: string;
}

/** 정사영(orthographic) 투영의 3D 점 구 지구본. 도시 선택 시 해당 도시가 정면으로 오도록 회전합니다. */
export default function Globe({ cityId }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const target = useRef(cityId);
  target.current = cityId;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let W = 0;
    let H = 0;
    let dpr = 1;

    // 회전 상태
    let rot = Math.PI * 0.55; // 시작 각도 — 아시아·미주가 함께 보이게
    let rotFrom = rot;
    let rotTo = rot;
    let animStart = 0; // 0 = 애니메이션 아님
    const ANIM_MS = 1600;
    let scale = 1;
    let scaleFrom = 1;
    let scaleTo = 1;
    let lastCity = ""; // 빈 값으로 시작 → 첫 로드 때 선택 도시로 인트로 회전
    let holdUntil = 0;
    let prevT = performance.now();

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = rect.width;
      H = rect.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    const norm = (a: number) => {
      // [-PI, PI]로 정규화해 최단 경로 회전
      while (a > Math.PI) a -= Math.PI * 2;
      while (a < -Math.PI) a += Math.PI * 2;
      return a;
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    // 위경도 → 화면 좌표 (회전 rot + 축 기울기 TILT 적용)
    const project = (lat: number, lng: number, R: number) => {
      const phi = (lat * Math.PI) / 180;
      const lam = (lng * Math.PI) / 180 + rot;
      const x0 = Math.cos(phi) * Math.sin(lam);
      const y0 = Math.sin(phi);
      const z0 = Math.cos(phi) * Math.cos(lam);
      const y = y0 * Math.cos(TILT) - z0 * Math.sin(TILT);
      const z = y0 * Math.sin(TILT) + z0 * Math.cos(TILT);
      return { x: x0 * R, y: -y * R, z };
    };

    const draw = (now: number) => {
      const dt = Math.min((now - prevT) / 1000, 0.05);
      prevT = now;

      // 도시 변경 감지 → 그 도시가 정면(λ'=0)에 오도록 목표 각도 설정
      if (target.current !== lastCity) {
        lastCity = target.current;
        const g = cityGeo[lastCity];
        if (g) {
          rotFrom = rot;
          rotTo = rot + norm((-g.lng * Math.PI) / 180 - rot);
          animStart = now;
          scaleFrom = scale;
          scaleTo = 1.13; // 원근감 — 도시로 살짝 다가가기
          holdUntil = now + ANIM_MS + HOLD_MS;
        }
      }

      if (animStart > 0) {
        const t = Math.min((now - animStart) / ANIM_MS, 1);
        const e = easeOutCubic(t);
        rot = rotFrom + (rotTo - rotFrom) * e;
        // 회전하며 다가갔다가 제자리로 (in-out)
        const s = t < 0.5 ? t * 2 : (1 - t) * 2;
        scale = scaleFrom + (scaleTo - scaleFrom) * easeOutCubic(s);
        if (t >= 1) {
          animStart = 0;
          scale = 1;
        }
      } else if (now > holdUntil) {
        rot += IDLE_SPEED * dt; // 유휴 시 천천히 자전
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const cx = W / 2;
      const cy = H / 2;
      const R = (Math.min(W, H) / 2) * 0.86 * scale;

      // 구 가장자리 — 얇은 먹선
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(47, 74, 59, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // 육지 점
      for (const [lat, lng] of LAND_DOTS) {
        const p = project(lat, lng, R);
        if (p.z < 0) continue;
        const depth = p.z / R; // 0(가장자리) ~ 1(정면)
        const size = 1.3 + depth * 1.6 * scale;
        ctx.beginPath();
        ctx.arc(cx + p.x, cy + p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 57, 45, ${0.25 + depth * 0.7})`;
        ctx.fill();
      }

      // 도시 마커 — 앞면에 있을 때만
      for (const c of cities) {
        const g = cityGeo[c.id];
        if (!g) continue;
        const p = project(g.lat, g.lng, R);
        if (p.z < R * 0.06) continue;
        const active = c.id === target.current;
        const x = cx + p.x;
        const y = cy + p.y;

        if (active) {
          // 펄스 링
          const pulse = ((now / 1000) % 2) / 2;
          ctx.beginPath();
          ctx.arc(x, y, 6 + pulse * 12, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(192, 67, 43, ${0.55 * (1 - pulse)})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(x, y, active ? 4.5 : 2.6, 0, Math.PI * 2);
        ctx.fillStyle = active ? "#c0432b" : "rgba(47, 74, 59, 0.85)";
        ctx.fill();

        // 활성 도시 라벨
        if (active) {
          ctx.font = "700 12px 'Noto Sans KR', sans-serif";
          ctx.fillStyle = "#211f1b";
          ctx.textAlign = "center";
          ctx.fillText(c.ko, x, y - 14);
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="relative aspect-square w-full">
      <canvas ref={canvasRef} className="block" aria-label="돌아가는 3D 지구본 — 선택한 도시를 향해 회전합니다" />
    </div>
  );
}
