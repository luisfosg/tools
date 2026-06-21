import { useState, useEffect, useRef, useCallback } from "react";
import { Toaster, sileo } from "sileo";
import JsBarcode from "jsbarcode";

/* ───────── types ───────── */

type BarcodeFormat =
  | "CODE128"
  | "CODE39"
  | "EAN13"
  | "EAN8"
  | "UPC"
  | "ITF14"
  | "ITF"
  | "pharmacode"
  | "codabar"
  | "CODE93"
  | "MSI";

type TextPosition = "bottom" | "top";

interface HistoryItem {
  text: string;
  format: BarcodeFormat;
  height: number;
  width: number;
  lineColor: string;
  bgColor: string;
  displayValue: boolean;
  fontSize: number;
  font: string;
  textPosition: TextPosition;
  textMargin: number;
  margin: number;
}

/* ───────── constants ───────── */

const FORMATS: {
  value: BarcodeFormat;
  label: string;
  example: string;
  desc: string;
}[] = [
  { value: "CODE128", label: "CODE128", example: "ABC-123", desc: "Todos los caracteres ASCII" },
  { value: "CODE39", label: "CODE39", example: "HELLO", desc: "A-Z, 0-9, - . $ / + %" },
  { value: "EAN13", label: "EAN-13", example: "5901234123457", desc: "13 dígitos" },
  { value: "EAN8", label: "EAN-8", example: "40170725", desc: "8 dígitos" },
  { value: "UPC", label: "UPC-A", example: "123456789012", desc: "12 dígitos" },
  { value: "ITF14", label: "ITF-14", example: "15478598745236", desc: "14 dígitos" },
  { value: "ITF", label: "ITF", example: "123456", desc: "Cantidad par de dígitos" },
  { value: "pharmacode", label: "Pharmacode", example: "1234", desc: "Enteros > 0" },
  { value: "codabar", label: "Codabar", example: "A12345B", desc: "Empieza/termina con A-B-C-D" },
  { value: "CODE93", label: "CODE93", example: "TEST-123", desc: "Similar a CODE39, más denso" },
  { value: "MSI", label: "MSI", example: "1234567", desc: "Solo dígitos" },
];

const PRESETS: { name: string; line: string; bg: string }[] = [
  { name: "Dark", line: "#1a1a2e", bg: "#ffffff" },
  { name: "Light", line: "#94a3b8", bg: "#0a0a0a" },
  { name: "Brand", line: "#4f46e5", bg: "#ffffff" },
  { name: "Neon", line: "#00ff88", bg: "#0a0a0a" },
];

const FONTS: { label: string; value: string }[] = [
  { label: "Monospace", value: "monospace" },
  { label: "Sans-serif", value: "sans-serif" },
  { label: "Serif", value: "serif" },
  { label: "Arial", value: "Arial" },
  { label: "Courier", value: "Courier" },
  { label: "Georgia", value: "Georgia" },
];

const QUICK_VALUES: { label: string; value: string; format: BarcodeFormat }[] = [
  { label: "CODE128", value: "ABC-123", format: "CODE128" },
  { label: "EAN-13", value: "5901234123457", format: "EAN13" },
  { label: "EAN-8", value: "40170725", format: "EAN8" },
  { label: "UPC-A", value: "123456789012", format: "UPC" },
  { label: "CODE39", value: "HELLO", format: "CODE39" },
  { label: "ITF-14", value: "15478598745238", format: "ITF14" },
  { label: "Codabar", value: "A12345B", format: "codabar" },
  { label: "Pharmacode", value: "1234", format: "pharmacode" },
];

/* Each format's canonical example — used when switching formats */
const FORMAT_EXAMPLES: Record<BarcodeFormat, string> = {
  CODE128: "ABC-123",
  CODE39: "HELLO",
  EAN13: "5901234123457",
  EAN8: "40170725",
  UPC: "123456789012",
  ITF14: "15478598745238",
  ITF: "123456",
  pharmacode: "1234",
  codabar: "A12345B",
  CODE93: "TEST-123",
  MSI: "1234567",
};

const HISTORY_KEY = "barcode-history";

/* ───────── helpers ───────── */

function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function svgToCanvas(
  svgEl: SVGSVGElement,
  scale = 3,
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth * scale;
      canvas.height = img.naturalHeight * scale;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to render SVG to canvas"));
    };
    img.src = url;
  });
}

/* ───────── component ───────── */

export default function BarcodeGenerator() {
  /* ── state ── */
  const [text, setText] = useState("ABC-123");
  const [format, setFormat] = useState<BarcodeFormat>("CODE128");
  const [height, setHeight] = useState(80);
  const [barWidth, setBarWidth] = useState(2);
  const [lineColor, setLineColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [displayValue, setDisplayValue] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [font, setFont] = useState("monospace");
  const [textPosition, setTextPosition] = useState<TextPosition>("bottom");
  const [textMargin, setTextMargin] = useState(2);
  const [margin, setMargin] = useState(10);
  const [isValid, setIsValid] = useState(true);
  const [validationMsg, setValidationMsg] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>("Dark");
  const [showQuickValues, setShowQuickValues] = useState(false);

  /* ── refs ── */
  const svgRef = useRef<SVGSVGElement>(null);
  const historyDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renderKey = useRef(0);

  /* ── load history from localStorage ── */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
    } catch {
      /* corrupt data — ignore */
    }
  }, []);

  /* ── render barcode on every option change ── */
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || !text.trim()) return;

    renderKey.current += 1;
    const key = renderKey.current;

    try {
      // Clear previous content
      while (svg.firstChild) svg.removeChild(svg.firstChild);

      JsBarcode(svg, text, {
        format,
        width: barWidth,
        height,
        displayValue,
        fontSize,
        font,
        textPosition,
        textMargin,
        background: bgColor,
        lineColor,
        margin,
        valid: (valid: boolean) => {
          // Use the render key to avoid stale state updates
          if (key === renderKey.current) {
            setIsValid(valid);
            setValidationMsg(valid ? null : "El formato no acepta este valor");
          }
        },
      });

      if (key === renderKey.current) {
        setIsValid(true);
        setValidationMsg(null);
      }
    } catch (e) {
      if (key === renderKey.current) {
        setIsValid(false);
        setValidationMsg(
          e instanceof Error ? e.message : "Dato inválido para este formato",
        );
      }
    }
  }, [
    text,
    format,
    height,
    barWidth,
    lineColor,
    bgColor,
    displayValue,
    fontSize,
    font,
    textPosition,
    textMargin,
    margin,
  ]);

  /* ── debounced history save ── */
  useEffect(() => {
    if (!text.trim()) return;

    if (historyDebounce.current) clearTimeout(historyDebounce.current);
    historyDebounce.current = setTimeout(() => {
      const item: HistoryItem = {
        text,
        format,
        height,
        width: barWidth,
        lineColor,
        bgColor,
        displayValue,
        fontSize,
        font,
        textPosition,
        textMargin,
        margin,
      };

      setHistory((prev) => {
        const filtered = prev.filter((h) => h.text !== item.text || h.format !== item.format);
        const next = [item, ...filtered].slice(0, 5);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
    }, 1000);

    return () => {
      if (historyDebounce.current) clearTimeout(historyDebounce.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, format]);

  /* ── handlers ── */

  const applyPreset = useCallback((preset: (typeof PRESETS)[0]) => {
    setLineColor(preset.line);
    setBgColor(preset.bg);
    setActivePreset(preset.name);
  }, []);

  const applyQuickValue = useCallback(
    (qv: (typeof QUICK_VALUES)[0]) => {
      setText(qv.value);
      setFormat(qv.format);
      setActivePreset(null);
    },
    [],
  );

  const handleDownloadSVG = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || !text.trim()) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob(
      ['<?xml version="1.0" encoding="UTF-8"?>\n' + svgData],
      { type: "image/svg+xml;charset=utf-8" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "barcode.svg";
    a.click();
    URL.revokeObjectURL(url);
    sileo.success({ title: "Descargado", description: "Código descargado como SVG" });
  }, [text]);

  const handleDownloadPNG = useCallback(async () => {
    const svg = svgRef.current;
    if (!svg || !text.trim()) return;

    try {
      const canvas = await svgToCanvas(svg, 3);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("No blob");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "barcode.png";
      a.click();
      URL.revokeObjectURL(url);
      sileo.success({ title: "Descargado", description: "Código descargado como PNG" });
    } catch {
      sileo.error({ title: "Error", description: "No se pudo descargar como PNG" });
    }
  }, [text]);

  const handleCopy = useCallback(async () => {
    const svg = svgRef.current;
    if (!svg || !text.trim()) return;

    try {
      const canvas = await svgToCanvas(svg, 3);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      if (!blob) throw new Error("No blob");
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);
      sileo.success({ title: "Copiado", description: "Código copiado al portapapeles" });
    } catch {
      sileo.error({ title: "Error", description: "No se pudo copiar la imagen" });
    }
  }, [text]);

  const restoreHistory = useCallback((item: HistoryItem) => {
    setText(item.text);
    setFormat(item.format);
    setHeight(item.height);
    setBarWidth(item.width);
    setLineColor(item.lineColor);
    setBgColor(item.bgColor);
    setDisplayValue(item.displayValue);
    setFontSize(item.fontSize);
    setFont(item.font);
    setTextPosition(item.textPosition);
    setTextMargin(item.textMargin);
    setMargin(item.margin);
    setActivePreset(null);
  }, []);

  /* ── style classes (matching existing tools) ── */
  const inp =
    "rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-gray-600 dark:focus:border-indigo-400 dark:focus:bg-gray-800";
  const sel = inp + " w-full appearance-none";
  const lbl = "text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500";

  /* ── render ── */
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Toaster position="top-right" theme="system" />

      {/* ── Header ── */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
          Barcode Generator
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Generá códigos de barras con múltiples formatos y personalización
        </p>
      </header>

      {/* ── Input + Format ── */}
      <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="min-w-0 flex-1">
            <label className={lbl}>Valor a codificar</label>
            <input
              type="text"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setActivePreset(null);
              }}
              placeholder="Ingresá el valor para el código de barras..."
              className={inp + " mt-1 w-full text-base"}
            />
          </div>
          <div className="w-full sm:w-44">
            <label className={lbl}>Formato</label>
            <select
              value={format}
              onChange={(e) => {
                const next = e.target.value as BarcodeFormat;
                setFormat(next);
                setText(FORMAT_EXAMPLES[next]);
                setActivePreset(null);
              }}
              className={sel + " mt-1"}
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Format info + validation */}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className="text-xs text-gray-400">
            {FORMATS.find((f) => f.value === format)?.desc}
          </span>
          {!isValid && validationMsg && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-600">
              <span>✕</span>
              {validationMsg}
            </span>
          )}
          {isValid && text.trim() && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-600">
              <span>✓</span>
              Válido
            </span>
          )}
        </div>
      </section>

      {/* ── Quick test values ── */}
      <section className="rounded-2xl bg-white shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <button
          type="button"
          onClick={() => setShowQuickValues(!showQuickValues)}
          className="flex w-full items-center justify-between px-6 py-4 text-left"
        >
          <span className={lbl}>Valores de prueba rápida</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cx(
              "h-4 w-4 text-gray-400 transition-transform",
              showQuickValues && "rotate-180",
            )}
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
        {showQuickValues && (
          <div className="px-6 pb-6">
            <div className="flex flex-wrap gap-2">
              {QUICK_VALUES.map((qv) => (
                <button
                  key={qv.label}
                  type="button"
                  onClick={() => applyQuickValue(qv)}
                  className="rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-1.5 text-xs font-semibold text-gray-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {qv.label}: {qv.value}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ── Presets ── */}
      <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
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
                  style={{ backgroundColor: p.line }}
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
        <section className="min-w-0 flex-1 space-y-5 rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className={lbl}>Personalización</h2>

          {/* Height */}
          <SliderField
            label="Alto"
            value={height}
            min={30}
            max={200}
            unit="px"
            onChange={(v) => {
              setHeight(v);
              setActivePreset(null);
            }}
            lbl={lbl}
          />

          {/* Bar width */}
          <SliderField
            label="Ancho de barra"
            value={barWidth}
            min={1}
            max={10}
            unit="px"
            onChange={(v) => {
              setBarWidth(v);
              setActivePreset(null);
            }}
            lbl={lbl}
          />

          {/* Line color */}
          <ColorField
            label="Color de barras"
            value={lineColor}
            onChange={(v) => {
              setLineColor(v);
              setActivePreset(null);
            }}
            inp={inp}
            lbl={lbl}
          />

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

          {/* Display value */}
          <div className="flex items-center justify-between">
            <label className={lbl + " cursor-pointer select-none"}>
              Mostrar texto
            </label>
            <button
              type="button"
              role="switch"
              aria-checked={displayValue}
              onClick={() => setDisplayValue(!displayValue)}
              className={cx(
                "relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors",
                displayValue ? "bg-indigo-600" : "bg-gray-200",
              )}
            >
              <span
                className={cx(
                  "inline-block h-4 w-4 translate-y-0 transform rounded-full bg-white shadow-sm transition-transform",
                  displayValue ? "translate-x-4" : "translate-x-0",
                )}
              />
            </button>
          </div>

          {/* Font size (only when displayValue) */}
          {displayValue && (
            <SliderField
              label="Tamaño de texto"
              value={fontSize}
              min={8}
              max={40}
              unit="px"
              onChange={setFontSize}
              lbl={lbl}
            />
          )}

          {/* Font family (only when displayValue) */}
          {displayValue && (
            <SelectField
              label="Fuente"
              value={font}
              onChange={setFont}
              options={FONTS}
              sel={sel}
              lbl={lbl}
            />
          )}

          {/* Text position (only when displayValue) */}
          {displayValue && (
            <SelectField
              label="Posición del texto"
              value={textPosition}
              onChange={(v) => setTextPosition(v as TextPosition)}
              options={[
                { label: "Abajo", value: "bottom" },
                { label: "Arriba", value: "top" },
              ]}
              sel={sel}
              lbl={lbl}
            />
          )}

          {/* Text margin (only when displayValue) */}
          {displayValue && (
            <SliderField
              label="Margen del texto"
              value={textMargin}
              min={0}
              max={20}
              unit="px"
              onChange={setTextMargin}
              lbl={lbl}
            />
          )}

          {/* Margin slider */}
          <SliderField
            label="Margen exterior"
            value={margin}
            min={0}
            max={30}
            unit="px"
            onChange={setMargin}
            lbl={lbl}
          />
        </section>

        {/* ── Preview ── */}
        <section className="flex w-full flex-col self-center md:w-80 md:self-start">
          <div className="flex flex-col items-center rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
            {!text.trim() || !isValid ? (
              <div className="flex h-[180px] w-full items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800/50">
                <p className="px-4 text-center text-sm text-gray-400 dark:text-gray-500">
                  {!text.trim()
                    ? "Ingresá un valor para generar"
                    : "El valor no es válido para este formato"}
                </p>
              </div>
            ) : (
              <>
                <div className="w-full overflow-x-auto">
                  <svg
                    ref={svgRef}
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto"
                    style={{ maxWidth: "100%" }}
                  />
                </div>
                <p className="mt-3 max-w-[260px] truncate text-center text-xs text-gray-400 dark:text-gray-500">
                  {format}: {text}
                </p>
              </>
            )}
            <div className="mt-4 flex flex-wrap justify-center gap-1.5">
              <ActionButton onClick={handleDownloadPNG}>
                <DownloadIcon /> PNG
              </ActionButton>
              <ActionButton onClick={handleDownloadSVG}>
                <DownloadIcon /> SVG
              </ActionButton>
              <ActionButton onClick={handleCopy}>
                <CopyIcon /> Copiar
              </ActionButton>
            </div>
          </div>

          {/* ── History ── */}
          {history.length > 0 && (
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
              <h2 className={cx(lbl, "mb-3")}>Historial</h2>
              <div className="space-y-2">
                {history.map((item, i) => (
                  <div
                    key={item.text + item.format + i}
                    onClick={() => restoreHistory(item)}
                    className="flex cursor-pointer items-center gap-3 rounded-lg bg-gray-50 px-4 py-2.5 transition-colors hover:bg-indigo-50 dark:bg-gray-800/50 dark:hover:bg-indigo-900/30"
                  >
                    <span
                      className="inline-block h-4 w-4 shrink-0 rounded"
                      style={{ backgroundColor: item.lineColor }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                        {item.text}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{item.format}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="text-center text-xs text-gray-400 dark:text-gray-500">
        Barcode Generator — jsbarcode
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
            className="h-9 w-12 cursor-pointer rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-800"
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
          <option key={o.value as string} value={o.value as string}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function SliderField({
  label,
  value,
  min,
  max,
  unit,
  onChange,
  lbl,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (v: number) => void;
  lbl: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className={lbl}>
        {label}: {value}
        {unit}
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-indigo-600"
      />
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
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-xs transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.96] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
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
