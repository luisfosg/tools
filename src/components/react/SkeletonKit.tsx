import { useEffect, useRef, useState } from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

/* ───────── hydration ───────── */

/**
 * Devuelve `true` una vez el componente se ha hidratado en el cliente.
 * Renderiza el skeleton en el primer paint (SSR incluido) y lo mantiene
 * al menos `minMs` (default 200 ms) para que el esqueleto sea perceptible
 * aunque el contenido cargue al instante. Esto evita también el "flash" de
 * contenido SSR con estado por defecto (p. ej. secciones de Noteffy que
 * aparecen abiertas antes de leer localStorage).
 */
export function useHydrated(minMs = 200): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setHydrated(true), minMs);
    return () => clearTimeout(timer);
  }, [minMs]);
  return hydrated;
}

/* ───────── building blocks ───────── */

const skCard =
  "rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800";

/** Tarjeta esqueleto con el mismo aspecto que las cards de las tools. */
function SkCard({ children }: { children: React.ReactNode }) {
  return <section className={skCard}>{children}</section>;
}

/** Línea esqueleto con ancho controlado (px o %) dentro de un wrapper. */
function SkLine({
  width = "100%",
  height = 14,
  className = "",
  radius = 6,
}: {
  width?: number | string;
  height?: number;
  className?: string;
  radius?: number;
}) {
  return (
    <div className={className} style={{ width: typeof width === "number" ? `${width}px` : width }}>
      <Skeleton width="100%" height={height} borderRadius={radius} />
    </div>
  );
}

/** Cabecera centrada estándar de las tools. */
function SkHeader({ title = 220, sub = 280 }: { title?: number; sub?: number }) {
  return (
    <header className="text-center">
      <SkLine width={title} height={30} className="mx-auto" />
      <SkLine width={sub} height={13} className="mx-auto mt-2" />
    </header>
  );
}

/** Tabs (pills o nav) como las de cada tool. */
function SkTabs({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkLine key={i} width={i % 2 === 0 ? 130 : 100} height={30} radius={999} />
      ))}
    </div>
  );
}

/** Select de formulario. */
function SkSelect() {
  return <SkLine width="100%" height={38} />;
}

/* ─────────────────────────────────────────
   Per-tool skeletons: imitan el layout real
   ───────────────────────────────────────── */

/** Timestamp Tool: header + card con nav de tabs + inputs + resultado. */
export function TimestampSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8" aria-busy="true" aria-label="Cargando conversor de timestamps">
      <SkHeader title={250} sub={300} />
      <section className={`${skCard} overflow-hidden`}>
        <div className="flex gap-1 border-b border-gray-100 px-1 dark:border-gray-800 sm:px-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkLine key={i} width={i % 2 === 0 ? 140 : 115} height={38} />
          ))}
        </div>
        <div className="space-y-5 p-5">
          <SkLine width="60%" height={34} className="mx-auto" />
          <SkLine width="40%" height={13} />
          <SkLine width="100%" height={16} />
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-100 p-4 dark:border-gray-800">
                <SkLine width={90} height={11} />
                <SkLine width="95%" height={17} className="mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

/** Noteffy: header + pills de asignatura + tarjeta resumen + secciones + agregar. */
export function NoteffySkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8" aria-busy="true" aria-label="Cargando Noteffy">
      <SkHeader title={190} sub={280} />
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkLine key={i} width={i % 2 === 0 ? 120 : 90} height={34} radius={999} />
        ))}
        <div className="rounded-full border-2 border-dashed border-gray-200 px-4 py-2 dark:border-gray-700">
          <Skeleton width={95} height={14} borderRadius={999} />
        </div>
      </div>
      <SkCard>
        <SkLine width={110} height={12} />
        <SkLine width="45%" height={26} className="mt-2" />
        <SkLine width={110} height={24} className="mt-3" />
        <SkLine width="100%" height={10} className="mt-4" />
      </SkCard>
      {Array.from({ length: 2 }).map((_, s) => (
        <SkCard key={s}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex shrink-0 items-center gap-1.5">
              <Skeleton width={18} height={18} borderRadius={4} />
              <Skeleton width={26} height={16} borderRadius={999} />
            </div>
            <SkLine width="38%" height={18} />
            <SkLine width={70} height={26} />
          </div>
          <div className="mt-4 space-y-2.5">
            {Array.from({ length: 3 }).map((_, r) => (
              <div key={r} className="flex items-center gap-3">
                <Skeleton circle width={16} height={16} />
                <SkLine width="100%" height={16} />
                <SkLine width={64} height={16} />
              </div>
            ))}
          </div>
        </SkCard>
      ))}
      <div className="flex justify-center">
        <div className="rounded-xl border-2 border-dashed border-gray-200 px-6 py-3 dark:border-gray-700">
          <Skeleton width={150} height={15} />
        </div>
      </div>
    </div>
  );
}

/** IBAN: header + config (país/banco/acciones) + resultado centrado + historial. */
export function IbanSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8" aria-busy="true" aria-label="Cargando generador de IBAN">
      <SkHeader title={220} sub={300} />
      <SkCard>
        <SkLine width={120} height={12} />
        <SkSelect />
        <SkLine width={120} height={12} className="mt-4" />
        <SkSelect />
        <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SkLine width={150} height={34} radius={8} />
          <SkLine width={190} height={34} radius={8} />
        </div>
      </SkCard>
      <SkCard>
        <SkLine width={60} height={12} className="mx-auto" />
        <SkLine width={280} height={28} className="mx-auto mt-2" />
        <div className="mt-3 flex justify-center gap-2">
          <SkLine width={150} height={28} radius={8} />
          <SkLine width={150} height={28} radius={8} />
        </div>
      </SkCard>
      <SkCard>
        <SkLine width={100} height={14} />
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="mt-3 flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 dark:bg-gray-800/50">
            <div className="min-w-0 flex-1">
              <SkLine width="60%" height={14} />
              <SkLine width="40%" height={11} className="mt-1" />
            </div>
            <SkLine width={50} height={13} />
          </div>
        ))}
      </SkCard>
    </div>
  );
}

/** Password Hash: header + tabs de modo + formulario + resultado. */
export function PasswordSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8" aria-busy="true" aria-label="Cargando generador de hashes">
      <SkHeader title={220} sub={310} />
      <SkTabs count={3} />
      <SkCard>
        <SkLine width={120} height={12} />
        <SkSelect />
        <SkLine width={120} height={12} className="mt-4" />
        <SkSelect />
        <SkLine width={120} height={12} className="mt-4" />
        <SkSelect />
        <div className="mt-5 flex justify-center">
          <SkLine width={180} height={38} radius={8} />
        </div>
      </SkCard>
      <SkCard>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <SkLine width={90} height={12} />
            <SkLine width="100%" height={16} className="mt-2" />
          </div>
          <SkLine width={70} height={28} radius={8} />
        </div>
      </SkCard>
    </div>
  );
}

/** Phone: header + tabs (Generar/Validar/Identificar) + config + filas de resultado. */
export function PhoneSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8" aria-busy="true" aria-label="Cargando generador de teléfonos">
      <SkHeader title={220} sub={300} />
      <SkTabs count={3} />
      <SkCard>
        <SkLine width={110} height={12} />
        <SkSelect />
        <SkLine width={110} height={12} className="mt-4" />
        <SkSelect />
        <div className="mt-5 flex justify-center gap-3">
          <SkLine width={140} height={34} radius={8} />
          <SkLine width={140} height={34} radius={8} />
        </div>
      </SkCard>
      <SkCard>
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800/50">
              <div className="min-w-0 flex-1">
                <SkLine width={80} height={11} />
                <SkLine width="65%" height={18} className="mt-1" />
              </div>
              <SkLine width={90} height={26} radius={8} />
            </div>
          ))}
        </div>
      </SkCard>
    </div>
  );
}

/** QR: header + input + presets + panel customización + preview cuadrado + acciones. */
export function QrSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8" aria-busy="true" aria-label="Cargando generador de QR">
      <SkHeader title={220} sub={300} />
      <SkCard>
        <SkLine width="100%" height={40} />
      </SkCard>
      <SkCard>
        <SkLine width={130} height={13} className="mb-3" />
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2 rounded-full px-4 py-2 ring-1 ring-gray-200 dark:ring-gray-600">
              <Skeleton circle width={18} height={18} />
              <Skeleton circle width={18} height={18} />
              <Skeleton width={i % 2 === 0 ? 60 : 40} height={14} />
            </div>
          ))}
        </div>
      </SkCard>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1 space-y-4">
          <SkLine width={110} height={12} />
          <SkSelect />
          <SkLine width={110} height={12} />
          <SkLine width="100%" height={34} />
          <div className="flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkLine key={i} width="100%" height={28} radius={6} />
            ))}
          </div>
          <SkLine width="100%" height={22} />
          <SkLine width={120} height={34} radius={8} />
        </div>
        <div className="grid w-full place-items-center md:w-72">
          <div className="grid aspect-square w-full place-items-center rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
            <Skeleton width={170} height={170} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Barcode: header + input + presets + opciones + preview de barras + acciones. */
export function BarcodeSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8" aria-busy="true" aria-label="Cargando generador de códigos de barras">
      <SkHeader title={240} sub={310} />
      <SkCard>
        <SkLine width="100%" height={40} />
      </SkCard>
      <SkCard>
        <SkLine width={160} height={13} className="mb-3" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkLine key={i} width={i % 2 === 0 ? 120 : 90} height={30} radius={8} />
          ))}
        </div>
      </SkCard>
      <div className="flex flex-col gap-6 md:flex-row">
        <div className="flex-1 space-y-4">
          <SkLine width={110} height={12} />
          <SkSelect />
          <SkLine width={110} height={12} />
          <SkLine width="100%" height={34} />
          <div className="flex items-center justify-between">
            <SkLine width={100} height={14} />
            <SkLine width={36} height={20} radius={999} />
          </div>
        </div>
        <div className="w-full md:w-72">
          <div className="grid place-items-center rounded-2xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <SkLine width="100%" height={80} />
            <SkLine width="70%" height={12} className="mt-2" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── fallback genérico ───────── */

/** Esqueleto genérico de página (fallback). */
export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Cargando contenido">
      <SkHeader />
      <SkCard>
        <SkLine width="38%" height={16} className="mb-4" />
        <SkLine width="100%" height={13} />
        <SkLine width="100%" height={13} className="mt-2" />
        <SkLine width="100%" height={13} className="mt-2" />
      </SkCard>
      <div className="grid gap-6 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkCard key={i}>
            <div className="mb-3 flex items-center gap-2">
              <Skeleton circle width={20} height={20} />
              <SkLine width={120} height={15} />
            </div>
            <SkLine width="100%" height={12} />
            <SkLine width="100%" height={12} className="mt-2" />
          </SkCard>
        ))}
      </div>
    </div>
  );
}

/* ───────── save-to-storage feedback ───────── */

export type SaveStatus = "saving" | "saved" | "idle";

/**
 * Sigue un valor persistido (depKey) y devuelve su estado de guardado:
 * - "saving": el valor cambió y está pendiente el guardado (debounce).
 * - "saved":  se persistió hace un momento (vuelve a "idle" a los 2s).
 * - "idle":   sin actividad.
 * `skipFirst` evita el destello al montar (primera ejecución).
 */
export function useSaveStatus(depKey: string, delayMs = 600, skipFirst = true): SaveStatus {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const firstRun = useRef(skipFirst);
  const restoreTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!depKey) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setStatus("saving");
    const saveTimer = setTimeout(() => {
      setStatus("saved");
      if (restoreTimer.current) clearTimeout(restoreTimer.current);
      restoreTimer.current = setTimeout(() => setStatus("idle"), 2000);
    }, delayMs);
    return () => {
      clearTimeout(saveTimer);
      if (restoreTimer.current) clearTimeout(restoreTimer.current);
    };
  }, [depKey, delayMs]);

  return status;
}

/** Indicador visual "Guardando… / Guardado" para las operaciones de storage. */
export function SaveIndicator({ status, label }: { status: SaveStatus; label: string }) {
  if (status === "idle") return null;
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={`${label}: ${status === "saving" ? "guardando" : "guardado"}`}
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-opacity " +
        (status === "saving"
          ? "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300"
          : "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300")
      }
    >
      <span className="relative flex h-1.5 w-1.5">
        {status === "saving" && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        )}
        <span
          className={
            "relative inline-flex h-1.5 w-1.5 rounded-full " +
            (status === "saving" ? "bg-amber-500" : "bg-green-500")
          }
        />
      </span>
      {status === "saving" ? "Guardando…" : "Guardado"}
    </span>
  );
}