import { useState, useCallback } from "react";
import { Toaster, sileo } from "sileo";
import { COUNTRIES, getCountryList } from "../data/iban-data";

/* ───────── helpers ───────── */

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDigits(len) {
  return Array.from({ length: len }, () => rand(0, 9)).join("");
}

function randLetters(len) {
  const s = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  return Array.from({ length: len }, () => s[rand(0, 25)]).join("");
}

function randAlphanum(len) {
  const s = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length: len }, () => s[rand(0, 35)]).join("");
}

/**
 * ISO 7064 MOD-97-10 check-digit calculation.
 * Given countryCode + "00" + BBAN, computes the 2-digit check digit.
 */
function calcCheckDigits(countryCode, bban) {
  const s = bban + countryCode + "00";
  let num = "";
  for (const ch of s) {
    if (/[A-Z]/.test(ch)) num += (ch.charCodeAt(0) - 55).toString();
    else num += ch;
  }
  const remainder = BigInt(num) % 97n;
  return String(98 - Number(remainder)).padStart(2, "0");
}

function genFieldValue(field, bank) {
  const cs = field.charset ?? "n";
  if (field.type === "bank") {
    return bank.code.padStart(field.length, "0").slice(0, field.length);
  }
  if (cs === "a") return randLetters(field.length);
  if (cs === "c") return randAlphanum(field.length);
  return randDigits(field.length);
}

function formatIban(raw) {
  return raw.match(/.{1,4}/g).join(" ");
}

function generateIban(countryCode, bankIdx) {
  const country = COUNTRIES[countryCode];
  const bank = country.banks[bankIdx];

  // Build BBAN and collect field values
  const fields = {};
  let bban = "";
  for (const fd of country.bban) {
    const val = genFieldValue(fd, bank);
    fields[fd.type] = val;
    bban += val;
  }

  const checkDigits = calcCheckDigits(countryCode, bban);
  const rawIban = countryCode + checkDigits + bban;

  return {
    formattedIban: formatIban(rawIban),
    rawIban,
    countryCode,
    country: country.name,
    currency: country.currency,
    checkDigits,
    bic: bank.bic,
    bankName: bank.name,
    bankCode: bank.code,
    accountNumber: fields.account ?? "—",
    branchCode: fields.branch ?? null,
  };
}

function copy(text, label = "Copiado") {
  navigator.clipboard.writeText(text)
    .then(() => sileo.success({ title: label, description: "Copiado al portapapeles" }))
    .catch(() => sileo.error({ title: "Error", description: "No se pudo copiar" }));
}

/* ───────── component ───────── */

const COUNTRY_LIST = getCountryList();

export default function IbanGenerator() {
  const [countryCode, setCountryCode] = useState("");
  const [bankIdx, setBankIdx] = useState(-1);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  const banks = countryCode ? COUNTRIES[countryCode].banks : [];

  const handleGenerate = useCallback(() => {
    if (!countryCode) return;
    const idx = bankIdx >= 0 ? bankIdx : rand(0, COUNTRIES[countryCode].banks.length - 1);
    const r = generateIban(countryCode, idx);
    setResult(r);
    setHistory((prev) => {
      const next = [r, ...prev].slice(0, 5);
      return next;
    });
  }, [countryCode, bankIdx]);

  const handleRandom = useCallback(() => {
    const codes = Object.keys(COUNTRIES);
    const cc = codes[rand(0, codes.length - 1)];
    setCountryCode(cc);
    const idx = rand(0, COUNTRIES[cc].banks.length - 1);
    setBankIdx(idx);
    // generate on next tick so selects update first
    setTimeout(() => {
      const r = generateIban(cc, idx);
      setResult(r);
      setHistory((prev) => [r, ...prev].slice(0, 5));
    }, 0);
  }, []);

  /* ───────── style helpers ───────── */
  const inp =
    "rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:border-gray-600 dark:focus:bg-gray-800";
  const sel = inp + " w-full sm:w-auto";
  const lbl =     "text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500";

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Toaster position="top-right" theme="system" />
      {/* Header */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
          IBAN Generator
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Generador de IBANs de prueba con datos bancarios consistentes para la UE
        </p>
      </header>

      {/* Controls */}
      <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          {/* Country */}
          <div className="space-y-1">
            <label className={lbl}>País</label>
            <select
              value={countryCode}
              onChange={(e) => {
                setCountryCode(e.target.value);
                setBankIdx(-1);
              }}
              className={sel}
            >
              <option value="">— Seleccionar país —</option>
              {COUNTRY_LIST.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.currency})
                </option>
              ))}
            </select>
          </div>

          {/* Bank */}
          <div className="space-y-1">
            <label className={lbl}>Banco</label>
            <select
              value={bankIdx}
              onChange={(e) => setBankIdx(Number(e.target.value))}
              disabled={!countryCode}
              className={sel}
            >
              <option value="-1">— Cualquier banco —</option>
              {banks.map((b, i) => (
                <option key={b.bic} value={i}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleGenerate}
            disabled={!countryCode}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generar IBAN
          </button>
          <button
            onClick={handleRandom}
            className="rounded-lg border border-indigo-200 bg-white px-6 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-900 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
          >
            🎲 Random cualquier país
          </button>
        </div>
      </section>

      {/* Result */}
      {result && (
        <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          {/* IBAN display */}
          <div className="text-center">
            <p className={lbl}>IBAN</p>
            <p className="mt-1 select-all text-2xl font-bold tracking-widest text-indigo-600 dark:text-indigo-400">
              {result.formattedIban}
            </p>
            <div className="mt-2 flex justify-center gap-2">
              <button
                onClick={() => copy(result.formattedIban, "IBAN (con espacios)")}
                className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                📋 Con espacios
              </button>
              <button
                onClick={() => copy(result.rawIban, "IBAN (sin espacios)")}
                className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                📋 Sin espacios
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
              {result.country} · {result.currency}
            </p>
          </div>

          {/* Detail grid */}
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <ResultBox label="BIC / SWIFT" value={result.bic} onCopy={(v) => copy(v, "BIC / SWIFT")} />
            <ResultBox label="Banco" value={result.bankName} onCopy={(v) => copy(v, "Banco")} />
            <ResultBox label="Bank Code" value={result.bankCode} onCopy={(v) => copy(v, "Bank Code")} />
            <ResultBox label="Número de cuenta" value={result.accountNumber} onCopy={(v) => copy(v, "Número de cuenta")} />
            <ResultBox label="País" value={result.country} onCopy={(v) => copy(v, "País")} />
            <ResultBox label="Moneda" value={result.currency} onCopy={(v) => copy(v, "Moneda")} />
          </div>

          {/* Actions */}
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => copy(JSON.stringify(result, null, 2), "JSON")}
              className="rounded-lg border border-gray-200 bg-white px-5 py-2 text-sm font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              💾 Copiar JSON
            </button>
          </div>
        </section>
      )}

      {/* History */}
      {history.length > 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Historial
          </h2>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div
                key={h.rawIban + i}
                className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 transition-colors hover:bg-indigo-50 dark:bg-gray-800/50 dark:hover:bg-indigo-900/30"
                onClick={() => copy(h.formattedIban, "IBAN historial")}
                title="Copiar IBAN"
              >
                <div>
                  <p className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {h.formattedIban}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {h.country} · {h.bankName}
                  </p>
                </div>
                <span className="text-xs text-indigo-400">{h.currency}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 dark:text-gray-500">
        IBAN Generator — datos de prueba sintéticos, no uses para transacciones reales
      </footer>
    </div>
  );
}

/* ───────── small sub-component ───────── */

function ResultBox({ label, value, onCopy }) {
  return (
    <div className="group relative rounded-xl bg-indigo-50/50 p-4 ring-1 ring-indigo-100 dark:bg-indigo-950/30 dark:ring-indigo-900">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
            {label}
          </p>
          <p className="mt-1 select-all break-all text-sm font-semibold text-gray-800 dark:text-gray-100">
            {value ?? "—"}
          </p>
        </div>
        {value && onCopy && (
          <button
            onClick={() => onCopy(value)}
            className="shrink-0 rounded-md p-1.5 text-gray-400 opacity-0 transition-all hover:bg-indigo-100 hover:text-indigo-600 group-hover:opacity-100 dark:text-gray-500 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-400"
            title={`Copiar ${label}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
              <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
