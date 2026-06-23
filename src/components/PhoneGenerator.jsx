import { useState, useCallback } from "react";
import { Toaster, sileo } from "sileo";
import { COUNTRIES, getCountryList } from "../data/phone-data";

/* ───────── helpers ───────── */

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randDigits(len) {
  return Array.from({ length: len }, () => rand(0, 9)).join("");
}

function applyFormat(prefix, subscriber, template, subGroups) {
  let formattedSub = subscriber;
  if (subGroups && subGroups.length > 0) {
    const parts = [];
    let pos = 0;
    for (const g of subGroups) {
      parts.push(subscriber.slice(pos, pos + g));
      pos += g;
    }
    formattedSub = parts.join(" ");
  }
  return template.replace("{prefix}", prefix).replace("{sub}", formattedSub);
}

function copy(text, label = "Copiado") {
  navigator.clipboard
    .writeText(text)
    .then(() => sileo.success({ title: label, description: "Copiado al portapapeles" }))
    .catch(() => sileo.error({ title: "Error", description: "No se pudo copiar" }));
}

function validateNumber(input, country) {
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return { valid: false, reason: "Ingresá un número telefónico" };

  // Remove country code if present
  let national = digits;
  const cc = country.code.replace("+", "");
  if (national.startsWith(cc)) {
    national = national.slice(cc.length);
  } else if (national.startsWith("00" + cc)) {
    national = national.slice(2 + cc.length);
  }

  // Remove trunk prefix
  if (country.trunk && national.startsWith(country.trunk)) {
    national = national.slice(country.trunk.length);
  }

  // Try each prefix group
  for (const group of country.prefixGroups) {
    const expectedLen = group.dialLen + group.subLen;
    if (national.length !== expectedLen) continue;

    const prefix = national.slice(0, group.dialLen);
    if (group.dialCodes.includes(prefix)) {
      const subscriber = national.slice(group.dialLen);
      return { valid: true, national, prefix, subscriber, group };
    }
  }

  // Determine best error message
  const minLen = Math.min(...country.prefixGroups.map((g) => g.dialLen + g.subLen));
  const maxLen = Math.max(...country.prefixGroups.map((g) => g.dialLen + g.subLen));

  if (national.length < minLen) {
    return { valid: false, reason: `Número demasiado corto: se requieren al menos ${minLen} dígitos` };
  }
  if (national.length > maxLen) {
    return { valid: false, reason: `Número demasiado largo: se requieren máximo ${maxLen} dígitos` };
  }

  const prefix = national.slice(0, 1);
  return { valid: false, reason: `Prefijo "${prefix}..." no válido para ${country.name}` };
}

function identifyCountry(input) {
  const digits = input.replace(/[^\d]/g, "");
  if (!digits) return [];

  const allCountries = getCountryList();
  const sorted = [...allCountries].sort(
    (a, b) => b.dialCode.replace("+", "").length - a.dialCode.replace("+", "").length,
  );

  const matches = [];
  for (const c of sorted) {
    const cc = c.dialCode.replace("+", "");
    if (digits.startsWith(cc)) {
      const countryData = COUNTRIES[c.code];
      if (!countryData) continue;
      const national = digits.slice(cc.length);
      const trunk = countryData.trunk || "";
      const withoutTrunk = national.startsWith(trunk) ? national.slice(trunk.length) : national;

      // Try to match a prefix group
      let matchedGroup = null;
      for (const g of countryData.prefixGroups) {
        const expectedLen = g.dialLen + g.subLen;
        if (withoutTrunk.length !== expectedLen) continue;
        const prefix = withoutTrunk.slice(0, g.dialLen);
        if (g.dialCodes.includes(prefix)) {
          matchedGroup = g;
          break;
        }
      }

      matches.push({
        ...c,
        national: withoutTrunk,
        countryData,
        matchedGroup,
      });
    }
  }
  return matches.slice(0, 3);
}

/* ───────── sub-components ───────── */

function FormatChips({ formats, prefix, subscriber, subGroups }) {
  return (
    <div className="space-y-3">
      {Object.entries(formats).map(([key, fmt]) => {
        const effectiveSubGroups = fmt.subGroups !== undefined ? fmt.subGroups : subGroups;
        const formatted = applyFormat(prefix, subscriber, fmt.template, effectiveSubGroups);
        return (
          <div
            key={key}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 dark:bg-gray-800/50"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{fmt.label}</p>
              <p className="mt-0.5 select-all font-mono text-lg font-bold text-gray-800 dark:text-gray-100">
                {formatted}
              </p>
            </div>
            <button
              onClick={() => copy(formatted, fmt.label)}
              className="shrink-0 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
            >
              📋 Copiar
            </button>
          </div>
        );
      })}
    </div>
  );
}

/* ───────── style helpers ───────── */

const inp =
  "rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-200 dark:hover:border-gray-600 dark:focus:bg-gray-800";
const sel = inp + " w-full sm:w-auto";
const lbl = "text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500";

/* ───────── component ───────── */

const COUNTRY_LIST = getCountryList();

export default function PhoneGenerator() {
  const [mode, setMode] = useState("generate");
  const [genCountry, setGenCountry] = useState("");
  const [genGroupIdx, setGenGroupIdx] = useState(-1);
  const [valCountry, setValCountry] = useState("");
  const [valInput, setValInput] = useState("");
  const [idInput, setIdInput] = useState("");
  const [genResult, setGenResult] = useState(null);
  const [valResult, setValResult] = useState(null);
  const [idResults, setIdResults] = useState([]);
  const [history, setHistory] = useState([]);

  /* ───── state derived ───── */

  const genCountryData = genCountry ? COUNTRIES[genCountry] : null;
  const genGroups = genCountryData ? genCountryData.prefixGroups : [];
  const valCountryData = valCountry ? COUNTRIES[valCountry] : null;

  /* ───── handlers ───── */

  const handleGenerate = useCallback(() => {
    if (!genCountryData) return;

    const groups = genCountryData.prefixGroups;
    const group = genGroupIdx >= 0 ? groups[genGroupIdx] : groups[rand(0, groups.length - 1)];
    const prefix = group.dialCodes[rand(0, group.dialCodes.length - 1)];
    const subscriber = randDigits(group.subLen);

    const result = {
      prefix,
      subscriber,
      group,
      countryCode: genCountry,
      countryName: genCountryData.name,
      countryFlag: genCountryData.flag,
      formats: genCountryData.formats,
    };

    setGenResult(result);
    setHistory((prev) => {
      const next = [result, ...prev].slice(0, 5);
      return next;
    });
  }, [genCountry, genCountryData, genGroupIdx]);

  const handleRandom = useCallback(() => {
    const codes = Object.keys(COUNTRIES);
    const cc = codes[rand(0, codes.length - 1)];
    setGenCountry(cc);

    const data = COUNTRIES[cc];
    const groups = data.prefixGroups;
    const group = groups[rand(0, groups.length - 1)];
    const prefix = group.dialCodes[rand(0, group.dialCodes.length - 1)];
    const subscriber = randDigits(group.subLen);

    setGenGroupIdx(-1);

    const result = {
      prefix,
      subscriber,
      group,
      countryCode: cc,
      countryName: data.name,
      countryFlag: data.flag,
      formats: data.formats,
    };

    setTimeout(() => {
      setGenResult(result);
      setHistory((prev) => [result, ...prev].slice(0, 5));
    }, 0);
  }, []);

  const handleValInput = useCallback(
    (e) => {
      const input = e.target.value;
      setValInput(input);
      if (valCountryData && input) {
        const r = validateNumber(input, valCountryData);
        setValResult(r);
      } else {
        setValResult(null);
      }
    },
    [valCountryData],
  );

  const handleValCountry = useCallback(
    (e) => {
      const cc = e.target.value;
      setValCountry(cc);
      setValResult(null);
      if (cc && valInput) {
        const r = validateNumber(valInput, COUNTRIES[cc]);
        setValResult(r);
      }
    },
    [valInput],
  );

  const handleIdInput = useCallback((e) => {
    const input = e.target.value;
    setIdInput(input);
    if (input) {
      const results = identifyCountry(input);
      setIdResults(results);
    } else {
      setIdResults([]);
    }
  }, []);

  /* ───── tab button ───── */

  const TabButton = ({ tab, label }) => (
    <button
      onClick={() => setMode(tab)}
      className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
        mode === tab
          ? "bg-white text-indigo-700 shadow-sm ring-1 ring-gray-200 dark:bg-gray-800 dark:text-indigo-400 dark:ring-gray-700"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
    >
      {label}
    </button>
  );

  /* ───── render: generate ───── */

  function renderGenerate() {
    return (
      <>
        <div className="space-y-1">
          <label className={lbl}>País</label>
          <select value={genCountry} onChange={(e) => { setGenCountry(e.target.value); setGenGroupIdx(-1); }} className={sel}>
            <option value="">— Seleccionar país —</option>
            {COUNTRY_LIST.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.dialCode})
              </option>
            ))}
          </select>
        </div>

        {genGroups.length > 1 && (
          <div className="space-y-1">
            <label className={lbl}>Tipo de número</label>
            <select value={genGroupIdx} onChange={(e) => setGenGroupIdx(Number(e.target.value))} className={sel}>
              <option value="-1">— Cualquier tipo —</option>
              {genGroups.map((g, i) => (
                <option key={i} value={i}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={handleGenerate}
            disabled={!genCountry}
            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Generar
          </button>
          <button
            onClick={handleRandom}
            className="rounded-lg border border-indigo-200 bg-white px-6 py-2 text-sm font-semibold text-indigo-600 shadow-sm transition-colors hover:bg-indigo-50 dark:border-indigo-800 dark:bg-gray-900 dark:text-indigo-400 dark:hover:bg-indigo-900/30"
          >
            🎲 Random
          </button>
        </div>
      </>
    );
  }

  /* ───── render: validate ───── */

  function renderValidate() {
    return (
      <>
        <div className="space-y-1">
          <label className={lbl}>País</label>
          <select value={valCountry} onChange={handleValCountry} className={sel}>
            <option value="">— Seleccionar país —</option>
            {COUNTRY_LIST.map((c) => (
              <option key={c.code} value={c.code}>
                {c.flag} {c.name} ({c.dialCode})
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label className={lbl}>Número telefónico</label>
          <input
            type="text"
            value={valInput}
            onChange={handleValInput}
            placeholder="Ej: +54 11 5555 1234"
            className={inp + " w-full font-mono"}
          />
        </div>

        {valResult && (
          <div>
            {valResult.valid ? (
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-green-600 dark:text-green-400">
                  <span>✅</span> Válido — {valResult.group.label} de {COUNTRIES[valCountry]?.name ?? valCountry}
                </p>
              </div>
            ) : (
              <p className="flex items-center gap-2 text-sm font-semibold text-red-500 dark:text-red-400">
                <span>❌</span> Inválido — {valResult.reason}
              </p>
            )}
          </div>
        )}
      </>
    );
  }

  /* ───── render: identify ───── */

  function renderIdentify() {
    return (
      <>
        <div className="space-y-1">
          <label className={lbl}>Número telefónico</label>
          <input
            type="text"
            value={idInput}
            onChange={handleIdInput}
            placeholder="Ej: +1 212 555 1234"
            className={inp + " w-full font-mono"}
          />
        </div>

        {idResults.length > 0 && (
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            {idResults.length === 1
              ? "País identificado"
              : `${idResults.length} países coinciden`}
          </p>
        )}
        {idResults.length === 0 && idInput && (
          <p className="flex items-center gap-2 text-sm font-semibold text-red-500 dark:text-red-400">
            <span>❌</span> No se pudo identificar el país
          </p>
        )}
      </>
    );
  }

  /* ───── main render ───── */

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Toaster position="top-right" theme="system" />

      {/* Header */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
          Phone Generator
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Generá, validá e identificá números telefónicos de múltiples países
        </p>
      </header>

      {/* Tab bar */}
      <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
        <div className="mb-4 flex justify-center gap-1 rounded-xl bg-gray-100 p-1 dark:bg-gray-800">
          <TabButton tab="generate" label="🎲 Generar" />
          <TabButton tab="validate" label="🔍 Validar" />
          <TabButton tab="identify" label="🌍 Identificar" />
        </div>

        <div className="mx-auto max-w-xl space-y-4">
          {mode === "generate" && renderGenerate()}
          {mode === "validate" && renderValidate()}
          {mode === "identify" && renderIdentify()}
        </div>
      </section>

      {/* Generate: result section */}
      {mode === "generate" && genResult && (
        <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {genResult.countryFlag} {genResult.countryName}
              <span className="ml-2 text-xs text-indigo-500 dark:text-indigo-400">
                {genResult.group.label}
              </span>
            </p>
          </div>

          <FormatChips
            formats={genResult.formats}
            prefix={genResult.prefix}
            subscriber={genResult.subscriber}
            subGroups={genResult.group.subGroups}
          />
        </section>
      )}

      {/* Generate: history */}
      {mode === "generate" && history.length > 0 && (
        <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-gray-400 dark:text-gray-500">
            Historial
          </h2>
          <div className="space-y-2">
            {history.map((h, i) => {
              const formatted = applyFormat(
                h.prefix,
                h.subscriber,
                h.formats.pretty.template,
                h.group.subGroups,
              );
              return (
                <div
                  key={h.countryCode + h.prefix + h.subscriber + i}
                  className="flex cursor-pointer items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5 transition-colors hover:bg-indigo-50 dark:bg-gray-800/50 dark:hover:bg-indigo-900/30"
                  onClick={() => copy(formatted, "Número")}
                  title="Copiar"
                >
                  <div>
                    <p className="font-mono text-sm font-semibold text-gray-800 dark:text-gray-100">
                      {formatted}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {h.countryName} · {h.countryCode}
                    </p>
                  </div>
                  <span className="text-xs text-indigo-400">{h.countryFlag}</span>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Validate: result section */}
      {mode === "validate" && valResult && valResult.valid && (
        <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800">
          <div className="mb-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {valCountryData.flag} {valCountryData.name}
              <span className="ml-2 text-xs text-indigo-500 dark:text-indigo-400">
                {valResult.group.label}
              </span>
            </p>
          </div>

          <FormatChips
            formats={valCountryData.formats}
            prefix={valResult.prefix}
            subscriber={valResult.subscriber}
            subGroups={valResult.group.subGroups}
          />
        </section>
      )}

      {/* Identify: result section */}
      {mode === "identify" && idResults.length > 0 && (
        <section className="space-y-4">
          {idResults.map((c) => {
            const countryData = c.countryData;
            if (!countryData) return null;

            if (!c.matchedGroup) {
              return (
                <section
                  key={c.code}
                  className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
                >
                  <div className="text-center">
                    <p className="text-3xl">{c.flag}</p>
                    <p className="mt-1 text-lg font-bold text-gray-800 dark:text-gray-100">{c.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{c.dialCode}</p>
                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                      Número con formato no estándar para {c.name}
                    </p>
                  </div>
                </section>
              );
            }

            const prefix = c.national.slice(0, c.matchedGroup.dialLen);
            const subscriber = c.national.slice(c.matchedGroup.dialLen);

            return (
              <section
                key={c.code}
                className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800"
              >
                <div className="mb-4 text-center">
                  <p className="text-3xl">{c.flag}</p>
                  <p className="mt-1 text-lg font-bold text-gray-800 dark:text-gray-100">{c.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {c.dialCode}
                    <span className="ml-2 text-xs text-indigo-500 dark:text-indigo-400">
                      {c.matchedGroup.label}
                    </span>
                  </p>
                </div>

                <FormatChips
                  formats={countryData.formats}
                  prefix={prefix}
                  subscriber={subscriber}
                  subGroups={c.matchedGroup.subGroups}
                />
              </section>
            );
          })}
        </section>
      )}

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 dark:text-gray-500">
        Phone Generator — datos de prueba sintéticos, no uses para transacciones reales
      </footer>
    </div>
  );
}
