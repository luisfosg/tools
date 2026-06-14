import { useState, useMemo } from "react";
import { Toaster, sileo } from "sileo";

const COMMON_TZS = [
  { label: "UTC", value: "UTC" },
  { label: "US/Eastern", value: "America/New_York" },
  { label: "US/Central", value: "America/Chicago" },
  { label: "US/Mountain", value: "America/Denver" },
  { label: "US/Pacific", value: "America/Los_Angeles" },
  { label: "Europe/London", value: "Europe/London" },
  { label: "Europe/Paris", value: "Europe/Paris" },
  { label: "Europe/Berlin", value: "Europe/Berlin" },
  { label: "Europe/Madrid", value: "Europe/Madrid" },
  { label: "Europe/Rome", value: "Europe/Rome" },
  { label: "Europe/Moscow", value: "Europe/Moscow" },
  { label: "Asia/Dubai", value: "Asia/Dubai" },
  { label: "Asia/Kolkata", value: "Asia/Kolkata" },
  { label: "Asia/Shanghai", value: "Asia/Shanghai" },
  { label: "Asia/Tokyo", value: "Asia/Tokyo" },
  { label: "Asia/Seoul", value: "Asia/Seoul" },
  { label: "Australia/Sydney", value: "Australia/Sydney" },
  { label: "Pacific/Auckland", value: "Pacific/Auckland" },
  { label: "America/Sao_Paulo", value: "America/Sao_Paulo" },
  { label: "America/Argentina/Buenos_Aires", value: "America/Argentina/Buenos_Aires" },
  { label: "America/Bogota", value: "America/Bogota" },
  { label: "America/Mexico_City", value: "America/Mexico_City" },
];

const TABS = [
  { id: "unix", label: "Unix Timestamp" },
  { id: "tz", label: "Zona Horaria" },
  { id: "diff", label: "Diferencia" },
  { id: "format", label: "Formateo" },
];

/* ────────── Shared helpers ────────── */

function inputClass(extra = "") {
  return `rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 transition-all duration-200 placeholder:text-gray-400 hover:border-gray-300 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${extra}`;
}

function ResultBox({ label, value, sub, copyValue }) {
  const [justCopied, setJustCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyValue ?? value);
      sileo.success({ title: "Copiado", description: `${label}` });
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch {
      sileo.error({ title: "Error", description: "No se pudo copiar" });
    }
  };

  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:border-gray-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            {label}
          </p>
          <p className="text-base font-semibold leading-snug text-gray-800 break-all">
            {value}
          </p>
          {sub && <p className="text-sm text-gray-500">{sub}</p>}
        </div>
        <button
          onClick={handleCopy}
          className="shrink-0 rounded-lg p-1.5 text-gray-300 transition-all duration-150 hover:bg-indigo-50 hover:text-indigo-500 active:scale-90"
          title="Copiar"
        >
          {justCopied ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
              <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.379a1.5 1.5 0 00-.44-1.06L9.94 8.44A1.5 1.5 0 008.88 8H4.5z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function selectTZ({ value, onChange, label }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={inputClass("w-full appearance-none pr-10 sm:w-auto")}
      >
        {COMMON_TZS.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <svg className="h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

/* ────────── Unix Tab ────────── */
function UnixTab() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("ts");
  const [inSeconds, setInSeconds] = useState(true);
  const [pickerDate, setPickerDate] = useState("");

  const unixTs = useMemo(() => {
    if (mode === "ts") {
      const raw = Number(input);
      if (!input || isNaN(raw)) return null;
      return inSeconds ? raw * 1000 : raw;
    }
    if (mode === "date" && pickerDate) {
      return new Date(pickerDate).getTime();
    }
    return null;
  }, [input, mode, inSeconds, pickerDate]);

  const results = useMemo(() => {
    if (unixTs === null) return null;
    const d = new Date(unixTs);
    const formatOpts = { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" };
    return {
      utc: d.toUTCString(),
      local: d.toLocaleString("es", formatOpts),
      unixSec: Math.floor(d.getTime() / 1000),
      unixMs: d.getTime(),
      iso: d.toISOString(),
      relative: getRelative(d),
    };
  }, [unixTs]);

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-1">
        <button
          onClick={() => setMode("ts")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
            mode === "ts"
              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Timestamp a fecha
        </button>
        <button
          onClick={() => setMode("date")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
            mode === "date"
              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-gray-200"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Fecha a timestamp
        </button>
      </div>

      {mode === "ts" ? (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Unix timestamp</label>
          <div className="flex flex-wrap items-center gap-4">
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="1735689600"
              className={inputClass("w-64")}
            />
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 select-none">
              <input
                type="checkbox"
                checked={inSeconds}
                onChange={() => setInSeconds(!inSeconds)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 transition-colors focus:ring-2 focus:ring-indigo-100 focus:ring-offset-0"
              />
              Segundos
            </label>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Fecha y hora</label>
          <input
            type="datetime-local"
            value={pickerDate}
            onChange={(e) => setPickerDate(e.target.value)}
            className={inputClass("w-72")}
          />
        </div>
      )}

      {results && (
        <div className="grid gap-3 sm:grid-cols-2">
          <ResultBox label="UTC" value={results.utc} />
          <ResultBox label="Local" value={results.local} />
          <ResultBox label="ISO 8601" value={results.iso} />
          <ResultBox label="Unix (s)" value={results.unixSec.toLocaleString("es")} copyValue={String(results.unixSec)} />
          <ResultBox label="Unix (ms)" value={results.unixMs.toLocaleString("es")} copyValue={String(results.unixMs)} />
          <ResultBox label="Relativo" value={results.relative} />
        </div>
      )}
    </div>
  );
}

/* ────────── TZ Tab ────────── */
function TZTab() {
  const now = new Date();
  const localISO = now.toLocaleString("sv-SE").replace(" ", "T").slice(0, 16);
  const [datetime, setDatetime] = useState(localISO);
  const [fromTZ, setFromTZ] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [toTZ, setToTZ] = useState("UTC");

  const converted = useMemo(() => {
    if (!datetime) return null;
    const d = new Date(datetime);
    if (isNaN(d.getTime())) return null;

    const formatterFrom = new Intl.DateTimeFormat("es", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      timeZone: fromTZ,
    });
    const formatterTo = new Intl.DateTimeFormat("es", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      timeZone: toTZ,
    });

    return {
      from: formatterFrom.format(d),
      to: formatterTo.format(d),
      offset: getTZOffset(d, toTZ),
    };
  }, [datetime, fromTZ, toTZ]);

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <label className="text-sm font-medium text-gray-700">Fecha y hora</label>
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className={inputClass("w-full sm:w-72")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Desde zona</label>
          {selectTZ({ value: fromTZ, onChange: setFromTZ, label: "Desde" })}
          <p className="text-xs text-gray-400">
            Detectado: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Hacia zona</label>
          {selectTZ({ value: toTZ, onChange: setToTZ, label: "Hacia" })}
        </div>
      </div>

      {converted && (
        <div className="grid gap-3 sm:grid-cols-2">
          <ResultBox label={`En ${fromTZ}`} value={converted.from} />
          <ResultBox label={`En ${toTZ}`} value={converted.to} sub={`UTC ${converted.offset}`} />
        </div>
      )}
    </div>
  );
}

/* ────────── Diff Tab ────────── */
function DiffTab() {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to, setTo] = useState(today);

  const diff = useMemo(() => {
    const d1 = new Date(from);
    const d2 = new Date(to);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return null;

    const ms = Math.abs(d2.getTime() - d1.getTime());
    const totalSec = Math.floor(ms / 1000);
    const totalMin = Math.floor(totalSec / 60);
    const totalHrs = Math.floor(totalMin / 60);
    const totalDays = Math.floor(totalHrs / 24);

    const years = Math.floor(totalDays / 365);
    const months = Math.floor((totalDays % 365) / 30);
    const days = totalDays % 30;
    const hours = totalHrs % 24;
    const minutes = totalMin % 60;
    const seconds = totalSec % 60;

    return {
      years, months, days, hours, minutes, seconds,
      totalDays, totalHrs, totalMin, totalSec,
      ms,
    };
  }, [from, to]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Desde</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className={inputClass("w-full")}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Hasta</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className={inputClass("w-full")}
          />
        </div>
      </div>

      {diff && (
        <>
          <div className="rounded-xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-indigo-400">
              Diferencia
            </p>
            <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
              {diff.years > 0 && `${diff.years}a `}
              {diff.months > 0 && `${diff.months}m `}
              {diff.days > 0 && `${diff.days}d `}
              {diff.hours}h {diff.minutes}m {diff.seconds}s
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ResultBox label="Días" value={diff.totalDays.toLocaleString("es")} copyValue={String(diff.totalDays)} />
            <ResultBox label="Horas" value={diff.totalHrs.toLocaleString("es")} copyValue={String(diff.totalHrs)} />
            <ResultBox label="Minutos" value={diff.totalMin.toLocaleString("es")} copyValue={String(diff.totalMin)} />
            <ResultBox label="Segundos" value={diff.totalSec.toLocaleString("es")} copyValue={String(diff.totalSec)} />
          </div>
        </>
      )}
    </div>
  );
}

/* ────────── Format Tab ────────── */
function FormatTab() {
  const now = new Date();
  const localISO = now.toLocaleString("sv-SE").replace(" ", "T").slice(0, 16);
  const [datetime, setDatetime] = useState(localISO);

  const formats = useMemo(() => {
    if (!datetime) return null;
    const d = new Date(datetime);
    if (isNaN(d.getTime())) return null;

    const REL = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
    const unixSec = Math.floor(d.getTime() / 1000);
    const unixMs = d.getTime();

    return [
      { label: "ISO 8601", value: d.toISOString() },
      { label: "UTC String", value: d.toUTCString() },
      { label: "Locale (es)", value: d.toLocaleString("es", { dateStyle: "full", timeStyle: "long" }) },
      { label: "Locale (en-US)", value: d.toLocaleString("en-US", { dateStyle: "full", timeStyle: "long" }) },
      { label: "RFC 2822", value: d.toUTCString().replace("GMT", "+0000") },
      { label: "Unix (segundos)", value: unixSec.toLocaleString("es"), copyValue: String(unixSec) },
      { label: "Unix (milisegundos)", value: unixMs.toLocaleString("es"), copyValue: String(unixMs) },
      { label: "YYYY-MM-DD", value: d.toISOString().slice(0, 10) },
      { label: "HH:mm:ss", value: d.toTimeString().slice(0, 8) },
      { label: "Relativo", value: getRelative(d) },
    ];
  }, [datetime]);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Fecha y hora</label>
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className={inputClass("w-full sm:w-72")}
        />
      </div>

      {formats && (
        <div className="grid gap-3 sm:grid-cols-2">
          {formats.map((f) => (
            <ResultBox key={f.label} label={f.label} value={f.value} copyValue={f.copyValue} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ────────── Helpers ────────── */
function getRelative(date) {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  const seconds = Math.round(diffMs / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);
  const weeks = Math.round(days / 7);
  const months = Math.round(days / 30);
  const years = Math.round(days / 365);

  if (Math.abs(seconds) < 60) return rtf.format(seconds, "second");
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  if (Math.abs(days) < 7) return rtf.format(days, "day");
  if (Math.abs(weeks) < 5) return rtf.format(weeks, "week");
  if (Math.abs(months) < 12) return rtf.format(months, "month");
  return rtf.format(years, "year");
}

function getTZOffset(date, tz) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: tz,
    timeZoneName: "longOffset",
  }).formatToParts(date);
  const off = parts.find((p) => p.type === "timeZoneName");
  return off ? off.value : "";
}

/* ────────── Main Component ────────── */
export default function TimestampTool() {
  const [activeTab, setActiveTab] = useState("unix");

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:py-12">
      <Toaster position="top-right" />

      {/* ── Header ── */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-indigo-600">
          Timestamp
        </h1>
        <p className="mt-1 text-gray-500">
          Conversor de timestamps, zonas horarias, diferencias y formatos
        </p>
      </header>

      {/* ── Tool Card ── */}
      <section className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        {/* Tab Navigation */}
        <nav className="flex border-b border-gray-100 px-1 sm:px-3">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-4 py-3 text-sm font-medium transition-colors duration-200 sm:px-5 ${
                activeTab === tab.id
                  ? "text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-indigo-600 sm:inset-x-3" />
              )}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">
          {activeTab === "unix" && <UnixTab />}
          {activeTab === "tz" && <TZTab />}
          {activeTab === "diff" && <DiffTab />}
          {activeTab === "format" && <FormatTab />}
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400">
        Timestamp — gestiona horas y fechas en un solo lugar
      </footer>
    </div>
  );
}
