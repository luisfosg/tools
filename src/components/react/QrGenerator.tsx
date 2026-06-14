import { useState, useEffect, useRef, useCallback } from "react";
import { Toaster, sileo } from "sileo";
import QRCodeStyling from "qr-code-styling";
import type {
  DotType,
  CornerSquareType,
  CornerDotType,
  ErrorCorrectionLevel,
} from "qr-code-styling";

/* ───────── types ───────── */

type GradientMode = "none" | "linear" | "radial";

interface HistoryItem {
  data: string;
  dotsColor: string;
  bgColor: string;
  dotsType: DotType;
  cornersSquareType: CornerSquareType;
  cornersDotType: CornerDotType;
  errorCorrectionLevel: ErrorCorrectionLevel;
  margin: number;
  imageSize: number;
  imageMargin: number;
  dotsGradientMode: GradientMode;
  dotsGradientStart: string;
  dotsGradientEnd: string;
  dotsGradientRotation: number;
  bgGradientMode: GradientMode;
  bgGradientStart: string;
  bgGradientEnd: string;
  bgGradientRotation: number;
}

/* ───────── constants ───────── */

const PRESETS: { name: string; dots: string; bg: string }[] = [
  { name: "Dark", dots: "#1a1a2e", bg: "#ffffff" },
  { name: "Light", dots: "#e2e8f0", bg: "#ffffff" },
  { name: "Brand", dots: "#4f46e5", bg: "#ffffff" },
  { name: "Neon", dots: "#00ff88", bg: "#0a0a0a" },
];

const DOT_STYLES: { label: string; value: DotType }[] = [
  { label: "Square", value: "square" },
  { label: "Rounded", value: "rounded" },
  { label: "Extra Rounded", value: "extra-rounded" },
  { label: "Classy", value: "classy" },
  { label: "Classy Rounded", value: "classy-rounded" },
  { label: "Dots", value: "dots" },
];

const CORNER_SQ: { label: string; value: CornerSquareType }[] = [
  { label: "Square", value: "square" },
  { label: "Dot", value: "dot" },
  { label: "Extra Rounded", value: "extra-rounded" },
  { label: "Rounded", value: "rounded" },
  { label: "Classy", value: "classy" },
];

const CORNER_DOT: { label: string; value: CornerDotType }[] = [
  { label: "Square", value: "square" },
  { label: "Dot", value: "dot" },
  { label: "Rounded", value: "rounded" },
];

const EC_LEVELS: ErrorCorrectionLevel[] = ["L", "M", "Q", "H"];

const HISTORY_KEY = "qr-history";
const QR_SIZE = 280;

/* ───────── helpers ───────── */

function buildGradient(
  mode: GradientMode,
  start: string,
  end: string,
  rotation = 0,
): { type: "linear" | "radial"; rotation: number; colorStops: { offset: number; color: string }[] } | undefined {
  if (mode === "none") return undefined;
  return {
    type: mode,
    rotation,
    colorStops: [
      { offset: 0, color: start },
      { offset: 1, color: end },
    ],
  };
}

function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/* ───────── component ───────── */

export default function QrGenerator() {
  /* ── state ── */
  const [data, setData] = useState("https://google.com");
  const [dotsColor, setDotsColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [dotsType, setDotsType] = useState<DotType>("square");
  const [cornersSquareType, setCornersSquareType] = useState<CornerSquareType>("square");
  const [cornersDotType, setCornersDotType] = useState<CornerDotType>("dot");
  const [ecLevel, setEcLevel] = useState<ErrorCorrectionLevel>("Q");
  const [margin, setMargin] = useState(0);
  const [image, setImage] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState(0.4);
  const [imageMargin, setImageMargin] = useState(10);
  const [dotGradMode, setDotGradMode] = useState<GradientMode>("none");
  const [dotGradStart, setDotGradStart] = useState("#000000");
  const [dotGradEnd, setDotGradEnd] = useState("#ffffff");
  const [bgGradMode, setBgGradMode] = useState<GradientMode>("none");
  const [bgGradStart, setBgGradStart] = useState("#ffffff");
  const [bgGradEnd, setBgGradEnd] = useState("#000000");
  const [dotGradRotation, setDotGradRotation] = useState(90);
  const [bgGradRotation, setBgGradRotation] = useState(90);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>("Dark");

  /* ── refs ── */
  const containerRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const historyDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── load history from localStorage ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* corrupt data — ignore */
    }
  }, []);

  /* ── init QR instance (once) ── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const qr = new QRCodeStyling({
      width: QR_SIZE,
      height: QR_SIZE,
      type: "canvas",
      data: "https://google.com",
      margin: 0,
      qrOptions: { errorCorrectionLevel: "Q" },
      imageOptions: {
        imageSize: 0.4,
        margin: 10,
        crossOrigin: "anonymous",
        hideBackgroundDots: true,
      },
      dotsOptions: { color: "#000000", type: "square" },
      backgroundOptions: { color: "#ffffff" },
      cornersSquareOptions: { type: "square" },
      cornersDotOptions: { type: "dot" },
    });
    qr.append(el);
    qrRef.current = qr;

    return () => {
      el.innerHTML = "";
      qrRef.current = null;
    };
  }, []);

  /* ── build current options and update QR ── */
  const pushUpdate = useCallback(() => {
    const qr = qrRef.current;
    if (!qr || !data.trim()) return;

    const dotsGrad = buildGradient(dotGradMode, dotGradStart, dotGradEnd, dotGradRotation);
    const bgGrad = buildGradient(bgGradMode, bgGradStart, bgGradEnd, bgGradRotation);

    qr.update({
      data,
      margin,
      qrOptions: { errorCorrectionLevel: ecLevel },
      dotsOptions: {
        color: dotsColor,
        type: dotsType,
        gradient: dotsGrad,
      },
      backgroundOptions: {
        color: bgColor,
        gradient: bgGrad,
      },
      cornersSquareOptions: { type: cornersSquareType, color: dotsColor },
      cornersDotOptions: { type: cornersDotType, color: dotsColor },
      image: image ?? undefined,
      imageOptions: {
        imageSize,
        margin: imageMargin,
        crossOrigin: "anonymous",
        hideBackgroundDots: true,
      },
    });
  }, [
    data,
    margin,
    ecLevel,
    dotsColor,
    dotsType,
    dotGradMode,
    dotGradStart,
    dotGradEnd,
    dotGradRotation,
    bgColor,
    bgGradMode,
    bgGradStart,
    bgGradEnd,
    bgGradRotation,
    cornersSquareType,
    cornersDotType,
    image,
    imageSize,
    imageMargin,
  ]);

  /* ── update QR on any option change ── */
  useEffect(() => {
    pushUpdate();
  }, [pushUpdate]);

  /* ── debounced history save ── */
  useEffect(() => {
    if (!data.trim()) return;

    if (historyDebounce.current) clearTimeout(historyDebounce.current);
    historyDebounce.current = setTimeout(() => {
      const item: HistoryItem = {
        data,
        dotsColor,
        bgColor,
        dotsType,
        cornersSquareType,
        cornersDotType,
        errorCorrectionLevel: ecLevel,
        margin,
        imageSize,
        imageMargin,
        dotsGradientMode: dotGradMode,
        dotsGradientStart: dotGradStart,
        dotsGradientEnd: dotGradEnd,
        dotsGradientRotation: dotGradRotation,
        bgGradientMode: bgGradMode,
        bgGradientStart: bgGradStart,
        bgGradientEnd: bgGradEnd,
        bgGradientRotation: bgGradRotation,
      };

      setHistory((prev) => {
        const filtered = prev.filter((h) => h.data !== item.data);
        const next = [item, ...filtered].slice(0, 5);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    }, 1000);

    return () => {
      if (historyDebounce.current) clearTimeout(historyDebounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  /* ── handlers ── */

  const applyPreset = useCallback((preset: (typeof PRESETS)[0]) => {
    setDotsColor(preset.dots);
    setBgColor(preset.bg);
    setDotGradMode("none");
    setBgGradMode("none");
    setActivePreset(preset.name);
  }, []);

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const removeImage = useCallback(() => {
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  const handleDownload = useCallback(
    async (ext: "png" | "svg" | "jpeg") => {
      if (!qrRef.current) return;
      try {
        await qrRef.current.download({ name: "qr-code", extension: ext });
        sileo.success({ title: "Descargado", description: `QR descargado como ${ext.toUpperCase()}` });
      } catch {
        sileo.error({ title: "Error", description: "No se pudo descargar" });
      }
    },
    [],
  );

  const handleCopy = useCallback(async () => {
    if (!qrRef.current) return;
    try {
      const blob = await qrRef.current.getRawData("png");
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      sileo.success({ title: "Copiado", description: "QR copiado al portapapeles" });
    } catch {
      sileo.error({ title: "Error", description: "No se pudo copiar la imagen" });
    }
  }, []);

  const restoreHistory = useCallback((item: HistoryItem) => {
    setData(item.data);
    setDotsColor(item.dotsColor);
    setBgColor(item.bgColor);
    setDotsType(item.dotsType);
    setCornersSquareType(item.cornersSquareType);
    setCornersDotType(item.cornersDotType);
    setEcLevel(item.errorCorrectionLevel);
    setMargin(item.margin);
    setImageSize(item.imageSize);
    setImageMargin(item.imageMargin);
    setDotGradMode(item.dotsGradientMode);
    setDotGradStart(item.dotsGradientStart);
    setDotGradEnd(item.dotsGradientEnd);
    setDotGradRotation(item.dotsGradientRotation ?? 90);
    setBgGradMode(item.bgGradientMode);
    setBgGradStart(item.bgGradientStart);
    setBgGradEnd(item.bgGradientEnd);
    setBgGradRotation(item.bgGradientRotation ?? 90);
    setActivePreset(null);
  }, []);

  /* ── style classes matching existing tools ── */
  const inp =
    "rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:outline-none";
  const sel = inp + " w-full appearance-none";
  const lbl = "text-xs font-semibold uppercase tracking-wide text-gray-400";

  /* ── render ── */
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Toaster position="top-right" />

      {/* ── Header ── */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-indigo-600">
          QR Code Generator
        </h1>
        <p className="mt-1 text-gray-500">
          Generá códigos QR personalizados con colores, estilos y logo
        </p>
      </header>

      {/* ── Input ── */}
      <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
        <input
          type="text"
          value={data}
          onChange={(e) => setData(e.target.value)}
          placeholder="Texto o URL para codificar..."
          className={inp + " w-full text-base"}
        />
      </section>

      {/* ── Presets ── */}
      <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
        <p className={cx(lbl, "mb-3")}>Presets de color</p>
        <div className="flex flex-wrap gap-3">
          {PRESETS.map((p) => (
            <button
              key={p.name}
              type="button"
              onClick={() => applyPreset(p)}
              className={cx(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all",
                activePreset === p.name
                  ? "ring-2 ring-indigo-500 ring-offset-2"
                  : "ring-1 ring-gray-200 hover:ring-indigo-300",
              )}
            >
              <span className="flex -space-x-1">
                <span
                  className="inline-block h-5 w-5 rounded-full border border-white"
                  style={{ backgroundColor: p.dots }}
                />
                <span
                  className="inline-block h-5 w-5 rounded-full border border-white"
                  style={{ backgroundColor: p.bg }}
                />
              </span>
              {p.name}
            </button>
          ))}
        </div>
      </section>

      {/* ── Main: Customize (left) + Preview (right) ── */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* ── Customization panel ── */}
        <section className="min-w-0 flex-1 space-y-5 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
          <h2 className={lbl}>Personalización</h2>

          {/* Dots color */}
          <ColorField
            label="Color de puntos"
            value={dotsColor}
            onChange={(v) => {
              setDotsColor(v);
              setActivePreset(null);
            }}
            inp={inp}
            lbl={lbl}
          />

          {/* Dots style */}
          <SelectField label="Estilo de puntos" value={dotsType} onChange={setDotsType} options={DOT_STYLES} sel={sel} lbl={lbl} />

          {/* Background color */}
          <ColorField
            label="Color de fondo"
            value={bgColor}
            onChange={(v) => {
              setBgColor(v);
              setActivePreset(null);
            }}
            inp={inp}
            lbl={lbl}
          />

          {/* Dots gradient */}
          <GradientBlock
            label="Gradiente de puntos"
            mode={dotGradMode}
            onModeChange={setDotGradMode}
            start={dotGradStart}
            onStartChange={setDotGradStart}
            end={dotGradEnd}
            onEndChange={setDotGradEnd}
            rotation={dotGradRotation}
            onRotationChange={setDotGradRotation}
            inp={inp}
            lbl={lbl}
          />

          {/* Background gradient */}
          <GradientBlock
            label="Gradiente de fondo"
            mode={bgGradMode}
            onModeChange={setBgGradMode}
            start={bgGradStart}
            onStartChange={setBgGradStart}
            end={bgGradEnd}
            onEndChange={setBgGradEnd}
            rotation={bgGradRotation}
            onRotationChange={setBgGradRotation}
            inp={inp}
            lbl={lbl}
          />

          {/* Corner squares */}
          <SelectField label="Esquinas" value={cornersSquareType} onChange={setCornersSquareType} options={CORNER_SQ} sel={sel} lbl={lbl} />

          {/* Corner dots */}
          <SelectField label="Puntos de esquina" value={cornersDotType} onChange={setCornersDotType} options={CORNER_DOT} sel={sel} lbl={lbl} />

          {/* Error correction level */}
          <div className="space-y-1.5">
            <label className={lbl}>Corrección de error</label>
            <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
              {EC_LEVELS.map((lv) => (
                <button
                  key={lv}
                  type="button"
                  onClick={() => setEcLevel(lv)}
                  className={cx(
                    "flex-1 rounded-md px-3 py-1.5 text-xs font-bold transition-all",
                    ecLevel === lv
                      ? "bg-white text-indigo-600 shadow-sm"
                      : "text-gray-500 hover:text-gray-800",
                  )}
                >
                  {lv}
                </button>
              ))}
            </div>
          </div>

          {/* Margin slider */}
          <div className="space-y-1.5">
            <label className={lbl}>Margen: {margin}px</label>
            <input
              type="range"
              min={0}
              max={20}
              value={margin}
              onChange={(e) => setMargin(Number(e.target.value))}
              className="w-full accent-indigo-600"
            />
          </div>

          {/* Logo upload */}
          <div className="space-y-1.5">
            <label className={lbl}>Logo central</label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {!image ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={cx(inp, "w-full cursor-pointer text-center hover:border-indigo-300")}
              >
                Subir logo
              </button>
            ) : (
              <div className="space-y-3 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center justify-between">
                  <span className="truncate text-sm text-gray-600">Logo cargado</span>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="text-xs font-semibold text-red-500 hover:text-red-700"
                  >
                    Quitar
                  </button>
                </div>
                <div>
                  <label className={lbl}>Tamaño: {Math.round(imageSize * 100)}%</label>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    value={Math.round(imageSize * 100)}
                    onChange={(e) => setImageSize(Number(e.target.value) / 100)}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div>
                  <label className={lbl}>Margen: {imageMargin}px</label>
                  <input
                    type="range"
                    min={0}
                    max={40}
                    value={imageMargin}
                    onChange={(e) => setImageMargin(Number(e.target.value))}
                    className="w-full accent-indigo-600"
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── QR Preview ── */}
        <section className="flex w-full flex-col self-center md:w-80 md:self-start">
          <div className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
            {!data.trim() ? (
              <div className="flex h-[280px] w-[280px] items-center justify-center rounded-xl bg-gray-50">
                <p className="px-4 text-center text-sm text-gray-400">
                  Ingresá texto o URL para generar
                </p>
              </div>
            ) : (
              <>
                <div ref={containerRef} className="flex items-center justify-center" />
                <p className="mt-3 max-w-[260px] truncate text-center text-xs text-gray-400">
                  {data}
                </p>
              </>
            )}
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              <ActionButton onClick={() => handleDownload("png")}>
                <DownloadIcon /> PNG
              </ActionButton>
              <ActionButton onClick={() => handleDownload("svg")}>
                <DownloadIcon /> SVG
              </ActionButton>
              <ActionButton onClick={() => handleDownload("jpeg")}>
                <DownloadIcon /> JPG
              </ActionButton>
              <ActionButton onClick={handleCopy}>
                <CopyIcon /> Copiar
              </ActionButton>
            </div>
          </div>

          {/* ── History ── */}
          {history.length > 0 && (
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-gray-100">
              <h2 className={cx(lbl, "mb-3")}>Historial</h2>
              <div className="space-y-2">
                {history.map((item, i) => (
                  <div
                    key={item.data + i}
                    onClick={() => restoreHistory(item)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 px-4 py-2.5 transition-colors hover:bg-indigo-50"
                  >
                    <span
                      className="inline-block h-4 w-4 shrink-0 rounded"
                      style={{ backgroundColor: item.dotsColor }}
                    />
                    <p className="min-w-0 truncate text-sm font-medium text-gray-700">
                      {item.data}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="text-center text-xs text-gray-400">
        QR Code Generator — qr-code-styling
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function ColorField({
  label,
  value,
  onChange,
  inp,
  lbl,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  inp: string;
  lbl: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className={lbl}>{label}</label>
      <div className="flex gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-0.5"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={inp + " flex-1 font-mono text-xs"}
        />
      </div>
    </div>
  );
}

function SelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  sel,
  lbl,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { label: string; value: T }[];
  sel: string;
  lbl: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className={lbl}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className={sel}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function GradientBlock({
  label,
  mode,
  onModeChange,
  start,
  onStartChange,
  end,
  onEndChange,
  rotation,
  onRotationChange,
  inp,
  lbl,
}: {
  label: string;
  mode: GradientMode;
  onModeChange: (m: GradientMode) => void;
  start: string;
  onStartChange: (c: string) => void;
  end: string;
  onEndChange: (c: string) => void;
  rotation: number;
  onRotationChange: (r: number) => void;
  inp: string;
  lbl: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className={lbl}>{label}</label>
      <select
        value={mode}
        onChange={(e) => onModeChange(e.target.value as GradientMode)}
        className={inp + " w-full appearance-none"}
      >
        <option value="none">None</option>
        <option value="linear">Linear</option>
        <option value="radial">Radial</option>
      </select>
      {mode !== "none" && (
        <div className="mt-2 space-y-3">
          <div className="flex gap-2">
            <div className="flex-1 space-y-1">
              <label className={lbl}>Inicio</label>
              <div className="flex gap-1">
                <input
                  type="color"
                  value={start}
                  onChange={(e) => onStartChange(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
                />
                <input
                  type="text"
                  value={start}
                  onChange={(e) => onStartChange(e.target.value)}
                  className={inp + " flex-1 font-mono text-xs"}
                />
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <label className={lbl}>Fin</label>
              <div className="flex gap-1">
                <input
                  type="color"
                  value={end}
                  onChange={(e) => onEndChange(e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border border-gray-200 bg-white p-0.5"
                />
                <input
                  type="text"
                  value={end}
                  onChange={(e) => onEndChange(e.target.value)}
                  className={inp + " flex-1 font-mono text-xs"}
                />
              </div>
            </div>
          </div>
          <div>
            <label className={lbl}>Ángulo: {rotation}°</label>
            <input
              type="range"
              min={0}
              max={360}
              value={rotation}
              onChange={(e) => onRotationChange(Number(e.target.value))}
              className="mt-1 w-full accent-indigo-600"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-xs transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.96]"
    >
      {children}
    </button>
  );
}

function DownloadIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
      <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
      <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
    </svg>
  );
}
