import { useState, useMemo } from "react";

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

function inputClass(extra = "") {
  return `rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:outline-none ${extra}`;
}

function resultBox(label, value, sub) {
  return (
    <div className="rounded-xl bg-indigo-50/50 p-4 ring-1 ring-indigo-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
        {label}
      </p>
      <p className="mt-1 text-lg font-semibold text-gray-800 break-all">{value}</p>
      {sub && <p className="mt-0.5 text-sm text-gray-500">{sub}</p>}
    </div>
  );
}

function selectTZ({ value, onChange, label }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={inputClass("w-full sm:w-auto")}
    >
      {COMMON_TZS.map((tz) => (
        <option key={tz.value} value={tz.value}>
          {tz.label}
        </option>
      ))}
    </select>
  );
}

/* ────────── Unix Tab ────────── */
function UnixTab() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState("ts"); // "ts" | "date"
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
    <div className="space-y-4">
      {/* Mode toggle */}
      <div className="flex items-center gap-3">
        <button onClick={() => setMode("ts")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${mode === "ts" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Timestamp a fecha
        </button>
        <button onClick={() => setMode("date")}
          className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${mode === "date" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
          Fecha a timestamp
        </button>
      </div>

      {mode === "ts" ? (
        <div className="space-y-3">
          <label className="text-sm font-medium text-gray-700">Unix timestamp</label>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="1735689600"
              className={inputClass("w-64")}
            />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={inSeconds}
                onChange={() => setInSeconds(!inSeconds)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
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
          {resultBox("UTC", results.utc)}
          {resultBox("Local", results.local)}
          {resultBox("ISO 8601", results.iso)}
          {resultBox("Unix (s)", results.unixSec.toLocaleString("es"))}
          {resultBox("Unix (ms)", results.unixMs.toLocaleString("es"))}
          {resultBox("Relativo", results.relative)}
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
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Fecha y hora</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            className={inputClass("w-full")}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Desde zona</label>
          {selectTZ({ value: fromTZ, onChange: setFromTZ, label: "Desde" })}
          <p className="text-xs text-gray-400">Detectado: {Intl.DateTimeFormat().resolvedOptions().timeZone}</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Hacia zona</label>
          {selectTZ({ value: toTZ, onChange: setToTZ, label: "Hacia" })}
        </div>
      </div>

      {converted && (
        <div className="grid gap-3 sm:grid-cols-2">
          {resultBox(`En ${fromTZ}`, converted.from)}
          {resultBox(`En ${toTZ}`, converted.to, `UTC ${converted.offset}`)}
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
    <div className="space-y-4">
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
          <div className="rounded-xl bg-indigo-50/50 p-4 ring-1 ring-indigo-100">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
              Diferencia
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-800">
              {diff.years > 0 && `${diff.years}a `}{diff.months > 0 && `${diff.months}m `}{diff.days > 0 && `${diff.days}d `}
              {diff.hours}h {diff.minutes}m {diff.seconds}s
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {resultBox("Días", diff.totalDays.toLocaleString("es"))}
            {resultBox("Horas", diff.totalHrs.toLocaleString("es"))}
            {resultBox("Minutos", diff.totalMin.toLocaleString("es"))}
            {resultBox("Segundos", diff.totalSec.toLocaleString("es"))}
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

    return [
      { label: "ISO 8601", value: d.toISOString() },
      { label: "UTC String", value: d.toUTCString() },
      { label: "Locale (es)", value: d.toLocaleString("es", { dateStyle: "full", timeStyle: "long" }) },
      { label: "Locale (en-US)", value: d.toLocaleString("en-US", { dateStyle: "full", timeStyle: "long" }) },
      { label: "RFC 2822", value: d.toUTCString().replace("GMT", "+0000") },
      { label: "Unix (segundos)", value: Math.floor(d.getTime() / 1000).toLocaleString("es") },
      { label: "Unix (milisegundos)", value: d.getTime().toLocaleString("es") },
      { label: "YYYY-MM-DD", value: d.toISOString().slice(0, 10) },
      { label: "HH:mm:ss", value: d.toTimeString().slice(0, 8) },
      { label: "Relativo", value: getRelative(d) },
    ];
  }, [datetime]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Fecha y hora</label>
        <input
          type="datetime-local"
          value={datetime}
          onChange={(e) => setDatetime(e.target.value)}
          className={inputClass("w-72")}
        />
      </div>

      {formats && (
        <div className="grid gap-3 sm:grid-cols-2">
          {formats.map((f) => resultBox(f.label, f.value))}
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
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-indigo-600">
          Timestamp
        </h1>
        <p className="mt-1 text-gray-500">
          Conversor de timestamps, zonas horarias, diferencias y formatos
        </p>
      </header>

      {/* Tab Nav */}
      <nav className="flex flex-wrap justify-center gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Tab Content */}
      <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
        {activeTab === "unix" && <UnixTab />}
        {activeTab === "tz" && <TZTab />}
        {activeTab === "diff" && <DiffTab />}
        {activeTab === "format" && <FormatTab />}
      </section>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400">
        Timestamp — gestiona horas y fechas en un solo lugar
      </footer>
    </div>
  );
}
