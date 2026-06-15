import { useState, useEffect, useCallback } from "react";
import { Toaster, sileo } from "sileo";
import bcrypt from "bcryptjs";
import {
  SignJWT,
  importJWK,
  base64url,
  decodeProtectedHeader,
  jwtVerify,
} from "jose";

/* ───────── helpers ───────── */

function bytesToHex(buf) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function copy(text, label = "Copiado") {
  navigator.clipboard
    .writeText(text)
    .then(() =>
      sileo.success({ title: label, description: "Copiado al portapapeles" }),
    )
    .catch(() =>
      sileo.error({ title: "Error", description: "No se pudo copiar" }),
    );
}

/* ───────── algorithm config ───────── */

const ALGORITHMS = {
  bcrypt: {
    label: "bcrypt",
    desc: "Password hashing con salt rounds ajustable",
    needsSecret: false,
    fields: [
      {
        key: "salt",
        label: "Salt",
        type: "text",
        placeholder: "$2a$10$... — vacío para generarlo automático",
        default: "",
      },
    ],
  },
  sha256: {
    label: "SHA-256",
    desc: "Hash criptográfico de 256 bits",
    needsSecret: false,
    fields: [],
  },
  sha512: {
    label: "SHA-512",
    desc: "Hash criptográfico de 512 bits",
    needsSecret: false,
    fields: [],
  },
  hmacSha256: {
    label: "HMAC-SHA256",
    desc: "Hash con clave secreta simétrica",
    needsSecret: true,
    secretLabel: "Clave Secreta",
    fields: [],
  },
  hmacSha512: {
    label: "HMAC-SHA512",
    desc: "Hash con clave secreta simétrica",
    needsSecret: true,
    secretLabel: "Clave Secreta",
    fields: [],
  },
  pbkdf2: {
    label: "PBKDF2",
    desc: "Derivación de clave con salt e iteraciones",
    needsSecret: false,
    fields: [
      { key: "salt", label: "Salt", type: "text", placeholder: "ej. s3cr3t", default: "" },
      { key: "iterations", label: "Iteraciones", type: "number", min: 1, default: 100000 },
      { key: "keyLength", label: "Key Length (bytes)", type: "number", min: 1, default: 32 },
    ],
  },
  jwt: {
    label: "JWT",
    desc: "JSON Web Token firmado con HMAC",
    needsSecret: true,
    secretLabel: "Signing Key",
    fields: [
      { key: "subject", label: "Subject (sub)", type: "text", placeholder: "ej. user123", default: "" },
      { key: "jwtAlg", label: "Algoritmo", type: "select", options: ["HS256", "HS384", "HS512"], default: "HS256" },
      { key: "expiration", label: "Expiración (seg)", type: "number", min: 1, default: 3600 },
    ],
  },
};

const ALGO_KEYS = Object.keys(ALGORITHMS);

function getDefaultFields(algoKey) {
  const algo = ALGORITHMS[algoKey];
  const obj = {};
  for (const f of algo.fields) {
    obj[f.key] = f.default;
  }
  return obj;
}

/* ───────── hash functions ───────── */

const enc = new TextEncoder();

const BCRYPT_SALT_RE = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{22}$/;

async function computeHash(algoKey, password, secret, fields) {
  switch (algoKey) {
    case "bcrypt": {
      if (!password) return "";
      if (fields.salt) {
        if (!BCRYPT_SALT_RE.test(fields.salt)) {
          return "Error: formato de salt inválido — debe ser $2a$XX$ + 22 caracteres base64";
        }
        return await bcrypt.hash(password, fields.salt);
      }
      const salt = await bcrypt.genSalt(10);
      return await bcrypt.hash(password, salt);
    }

    case "sha256": {
      if (!password) return "";
      const h = await crypto.subtle.digest("SHA-256", enc.encode(password));
      return bytesToHex(h);
    }

    case "sha512": {
      if (!password) return "";
      const h = await crypto.subtle.digest("SHA-512", enc.encode(password));
      return bytesToHex(h);
    }

    case "hmacSha256": {
      if (!password || !secret) return "";
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, enc.encode(password));
      return bytesToHex(sig);
    }

    case "hmacSha512": {
      if (!password || !secret) return "";
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-512" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, enc.encode(password));
      return bytesToHex(sig);
    }

    case "pbkdf2": {
      if (!password || !fields.salt) return "";
      const key = await crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveBits"],
      );
      const bits = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt: enc.encode(fields.salt),
          iterations: fields.iterations,
          hash: "SHA-256",
        },
        key,
        fields.keyLength * 8,
      );
      return bytesToHex(bits);
    }

    case "jwt": {
      if (!secret) return "";
      const sk = enc.encode(secret);
      const jwk = { kty: "oct", k: base64url.encode(sk) };
      const key = await importJWK(jwk, fields.jwtAlg);
      const payload = {};
      if (password) payload.data = password;
      if (fields.subject) payload.sub = fields.subject;
      const jwt = await new SignJWT(payload)
        .setProtectedHeader({ alg: fields.jwtAlg })
        .setExpirationTime(`${fields.expiration}s`)
        .sign(key);
      return jwt;
    }

    default:
      return "";
  }
}

/* ───────── compare / decode functions ───────── */

async function compareHash(algoKey, password, secret, fields, hashToCompare) {
  if (!password || !hashToCompare) return null;

  if (algoKey === "bcrypt") {
    if (!hashToCompare.startsWith("$2")) return false;
    return bcrypt.compare(password, hashToCompare);
  }

  const computed = await computeHash(algoKey, password, secret, fields);
  if (!computed || computed.startsWith("Error")) return false;
  return computed === hashToCompare;
}

function decodeJwtToken(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return { error: "Formato JWT inválido — se requieren 3 partes separadas por punto" };
    const header = JSON.parse(
      new TextDecoder().decode(base64url.decode(parts[0])),
    );
    const payload = JSON.parse(
      new TextDecoder().decode(base64url.decode(parts[1])),
    );
    return { header, payload };
  } catch (e) {
    return { error: "Error decodificando: " + e.message };
  }
}

async function verifyJwtSignature(token, secret) {
  if (!secret) return null;
  try {
    const sk = enc.encode(secret);
    const jwk = { kty: "oct", k: base64url.encode(sk) };
    const header = decodeProtectedHeader(token);
    const key = await importJWK(jwk, header.alg);
    const { payload } = await jwtVerify(token, key);
    return { verified: true, payload };
  } catch (e) {
    return { verified: false, error: e.message };
  }
}

/* ───────── common style helpers ───────── */

const inp =
  "rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:outline-none";
const sel = inp + " w-full sm:w-auto";
const lbl = "text-xs font-semibold uppercase tracking-wide text-gray-400";

/* ───────── field renderer ───────── */

function FieldRenderer({ field, value, onChange }) {
  return (
    <div key={field.key} className="space-y-1">
      <label className={lbl}>{field.label}</label>

      {field.type === "slider" && (
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={field.min}
            max={field.max}
            value={value ?? field.default}
            onChange={(e) => onChange(field.key, Number(e.target.value))}
            className="w-full accent-indigo-600"
          />
          <span className="min-w-[2ch] text-sm font-semibold text-indigo-600">
            {value ?? field.default}
          </span>
        </div>
      )}

      {field.type === "number" && (
        <input
          type="number"
          min={field.min}
          value={value ?? field.default}
          onChange={(e) => onChange(field.key, Number(e.target.value))}
          className={inp + " w-full"}
        />
      )}

      {field.type === "text" && (
        <input
          type="text"
          value={value ?? field.default}
          onChange={(e) => onChange(field.key, e.target.value)}
          placeholder={field.placeholder ?? ""}
          className={inp + " w-full"}
        />
      )}

      {field.type === "select" && (
        <select
          value={value ?? field.default}
          onChange={(e) => onChange(field.key, e.target.value)}
          className={sel}
        >
          {field.options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}

/* ───────── result box sub-component ───────── */

function ResultBox({ label, children }) {
  return (
    <div className="rounded-xl bg-indigo-50/50 p-4 ring-1 ring-indigo-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-indigo-400">
        {label}
      </p>
      <pre className="mt-1 whitespace-pre-wrap break-all font-mono text-sm text-gray-800">
        {children ?? "—"}
      </pre>
    </div>
  );
}

/* ───────── component ───────── */

export default function PasswordHash() {
  const [mode, setMode] = useState("generate");
  const [algorithm, setAlgorithm] = useState("bcrypt");
  const [password, setPassword] = useState("");
  const [secret, setSecret] = useState("");
  const [fields, setFields] = useState(() => getDefaultFields("bcrypt"));
  const [hashResult, setHashResult] = useState("");
  const [loading, setLoading] = useState(false);

  /* compare state */
  const [compareHash, setCompareHash] = useState("");
  const [compareResult, setCompareResult] = useState(null);

  /* jwt decode state */
  const [jwtToken, setJwtToken] = useState("");
  const [jwtSecret, setJwtSecret] = useState("");
  const [decodedJwt, setDecodedJwt] = useState(null);
  const [jwtVerifyResult, setJwtVerifyResult] = useState(null);

  const algo = ALGORITHMS[algorithm];

  /* ───── mode / algo change ───── */

  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setCompareHash("");
    setCompareResult(null);
    setJwtToken("");
    setJwtSecret("");
    setDecodedJwt(null);
    setJwtVerifyResult(null);
    if (newMode === "compare" && algorithm === "jwt") {
      setAlgorithm("bcrypt");
      setFields(getDefaultFields("bcrypt"));
      setSecret("");
    }
  }, [algorithm]);

  const handleAlgorithmChange = useCallback((e) => {
    const newAlgo = e.target.value;
    setAlgorithm(newAlgo);
    setFields(getDefaultFields(newAlgo));
    setSecret("");
    setHashResult("");
    setCompareHash("");
    setCompareResult(null);
  }, []);

  const handleFieldChange = useCallback((key, val) => {
    setFields((prev) => ({ ...prev, [key]: val }));
  }, []);

  /* ───── generate effect ───── */

  useEffect(() => {
    if (mode !== "generate") return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const result = await computeHash(algorithm, password, secret, fields);
        if (!cancelled) setHashResult(result);
      } catch (err) {
        if (!cancelled) setHashResult("Error: " + err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [algorithm, password, secret, fields, mode]);

  /* ───── compare effect ───── */

  useEffect(() => {
    if (mode !== "compare") return;
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      try {
        const result = await compareHash(algorithm, password, secret, fields, compareHash);
        if (!cancelled) setCompareResult(result);
      } catch (err) {
        if (!cancelled) setCompareResult(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [algorithm, password, secret, fields, compareHash, mode]);

  /* ───── jwt decode effect ───── */

  useEffect(() => {
    if (mode !== "decode") return;

    const parts = jwtToken.split(".");
    if (parts.length !== 3 || !jwtToken) {
      setDecodedJwt(null);
      if (jwtToken) setDecodedJwt({ error: "Formato JWT inválido — se requieren 3 partes" });
      return;
    }

    const decoded = decodeJwtToken(jwtToken);
    setDecodedJwt(decoded);
  }, [jwtToken, mode]);

  useEffect(() => {
    if (mode !== "decode" || !jwtToken || !jwtSecret) {
      setJwtVerifyResult(null);
      return;
    }
    let cancelled = false;

    const run = async () => {
      const result = await verifyJwtSignature(jwtToken, jwtSecret);
      if (!cancelled) setJwtVerifyResult(result);
    };

    run();
    return () => { cancelled = true; };
  }, [jwtToken, jwtSecret, mode]);

  /* ───── tab button helper ───── */

  const TabButton = ({ tab, label }) => (
    <button
      onClick={() => handleModeChange(tab)}
      className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-all ${
        mode === tab
          ? "bg-white text-indigo-700 shadow-sm ring-1 ring-gray-200"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );

  /* ───── render: generate ───── */

  function renderGenerate() {
    return (
      <>
        {/* Algorithm */}
        <div className="space-y-1">
          <label className={lbl}>Algoritmo</label>
          <select value={algorithm} onChange={handleAlgorithmChange} className={sel}>
            {ALGO_KEYS.map((k) => (
              <option key={k} value={k}>
                {ALGORITHMS[k].label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400">{algo.desc}</p>
        </div>

        {/* Password / Payload */}
        <div className="space-y-1">
          <label className={lbl}>
            {algorithm === "jwt" ? "Datos del payload" : "Contraseña"}
          </label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              algorithm === "jwt"
                ? "ej. info adicional — opcional"
                : "Escribí una contraseña..."
            }
            className={inp + " w-full"}
          />
        </div>

        {/* Secret (for HMAC, JWT) */}
        {algo.needsSecret && (
          <div className="space-y-1">
            <label className={lbl}>{algo.secretLabel}</label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Clave secreta..."
              className={inp + " w-full"}
            />
          </div>
        )}

        {/* Extra fields */}
        {algo.fields.map((f) => (
          <FieldRenderer key={f.key} field={f} value={fields[f.key]} onChange={handleFieldChange} />
        ))}
      </>
    );
  }

  /* ───── render: compare ───── */

  function renderCompare() {
    return (
      <>
        <div className="space-y-1">
          <label className={lbl}>Algoritmo</label>
          <select value={algorithm} onChange={handleAlgorithmChange} className={sel}>
            {ALGO_KEYS.filter((k) => k !== "jwt").map((k) => (
              <option key={k} value={k}>
                {ALGORITHMS[k].label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400">{algo.desc}</p>
        </div>

        <div className="space-y-1">
          <label className={lbl}>Contraseña</label>
          <input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Escribí una contraseña..."
            className={inp + " w-full"}
          />
        </div>

        {algo.needsSecret && (
          <div className="space-y-1">
            <label className={lbl}>{algo.secretLabel}</label>
            <input
              type="text"
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Clave secreta..."
              className={inp + " w-full"}
            />
          </div>
        )}

        {algo.fields.map((f) => (
          <FieldRenderer key={f.key} field={f} value={fields[f.key]} onChange={handleFieldChange} />
        ))}

        <div className="space-y-1">
          <label className={lbl}>
            {algorithm === "bcrypt" ? "Hash bcrypt" : "Hash a comparar"}
          </label>
          <input
            type="text"
            value={compareHash}
            onChange={(e) => setCompareHash(e.target.value)}
            placeholder="Pegá el hash aquí..."
            className={inp + " w-full font-mono"}
          />
        </div>
      </>
    );
  }

  /* ───── render: decode jwt ───── */

  function renderDecode() {
    return (
      <>
        <div className="space-y-1">
          <label className={lbl}>JWT Token</label>
          <textarea
            value={jwtToken}
            onChange={(e) => setJwtToken(e.target.value.trim())}
            placeholder="Pegá el JWT aquí..."
            rows={3}
            className={inp + " w-full resize-none font-mono text-xs"}
          />
        </div>

        <div className="space-y-1">
          <label className={lbl}>Signing Key (opcional — para verificar firma)</label>
          <input
            type="text"
            value={jwtSecret}
            onChange={(e) => setJwtSecret(e.target.value)}
            placeholder="Dejá vacío para solo decodificar..."
            className={inp + " w-full"}
          />
        </div>
      </>
    );
  }

  /* ───── main render ───── */

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Toaster position="top-right" />

      {/* Header */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-indigo-600">
          Password Hash
        </h1>
        <p className="mt-1 text-gray-500">
          Generá hashes, compará, decodificá JWTs
        </p>
      </header>

      {/* Mode tabs */}
      <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
        <div className="mb-4 flex justify-center gap-1 rounded-xl bg-gray-100 p-1">
          <TabButton tab="generate" label="🔐 Generar" />
          <TabButton tab="compare" label="🔍 Comparar" />
          <TabButton tab="decode" label="🔓 Decodificar JWT" />
        </div>

        <div className="mx-auto max-w-xl space-y-4">
          {mode === "generate" && renderGenerate()}
          {mode === "compare" && renderCompare()}
          {mode === "decode" && renderDecode()}
        </div>
      </section>

      {/* Result section */}
      <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
        {mode === "generate" && (
          <div className="text-center">
            <p className={lbl}>{algorithm === "jwt" ? "Token" : "Resultado"}</p>
            {loading ? (
              <div className="mt-3 h-12 animate-pulse rounded-lg bg-gray-100" />
            ) : hashResult ? (
              <>
                <pre className="mt-3 max-h-56 overflow-auto break-all rounded-lg bg-gray-50 p-4 text-left font-mono text-sm text-gray-800 ring-1 ring-gray-200">
                  {hashResult}
                </pre>
                <div className="mt-3 flex justify-center gap-2">
                  <button
                    onClick={() => copy(hashResult, algorithm === "jwt" ? "JWT" : "Hash")}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                  >
                    📋 Copiar
                  </button>
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-400">
                {algorithm === "jwt"
                  ? "Ingresá una signing key para generar el JWT"
                  : "Ingresá una contraseña para generar el hash"}
              </p>
            )}
          </div>
        )}

        {mode === "compare" && (
          <div className="text-center">
            <p className={lbl}>Resultado de la comparación</p>
            {loading ? (
              <div className="mx-auto mt-3 h-8 w-32 animate-pulse rounded-lg bg-gray-100" />
            ) : compareResult === true ? (
              <div className="mt-3 flex items-center justify-center gap-2 text-lg font-bold text-green-600">
                <span className="text-2xl">✅</span> Coincide
              </div>
            ) : compareResult === false ? (
              <div className="mt-3 flex items-center justify-center gap-2 text-lg font-bold text-red-500">
                <span className="text-2xl">❌</span> No coincide
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-400">
                Ingresá una contraseña y un hash para comparar
              </p>
            )}
          </div>
        )}

        {mode === "decode" && (
          <div className="space-y-4">
            {decodedJwt?.error ? (
              <div className="text-center">
                <p className="text-sm font-medium text-red-500">{decodedJwt.error}</p>
              </div>
            ) : decodedJwt ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <ResultBox label="Header">
                    {JSON.stringify(decodedJwt.header, null, 2)}
                  </ResultBox>
                  <ResultBox label="Payload">
                    {JSON.stringify(decodedJwt.payload, null, 2)}
                  </ResultBox>
                </div>

                {/* Signature verification */}
                {jwtSecret && (
                  <div className="text-center">
                    {jwtVerifyResult === null ? (
                      <div className="mx-auto h-8 w-32 animate-pulse rounded-lg bg-gray-100" />
                    ) : jwtVerifyResult.verified ? (
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-green-600">
                        <span className="text-lg">✅</span> Firma verificada
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 text-sm font-bold text-red-500">
                          <span className="text-lg">❌</span> Firma inválida
                        </div>
                        <p className="mt-1 text-xs text-gray-400">{jwtVerifyResult.error}</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => copy(jwtToken, "JWT")}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                  >
                    📋 Copiar JWT
                  </button>
                  <button
                    onClick={() =>
                      copy(JSON.stringify(decodedJwt, null, 2), "JSON decodificado")
                    }
                    className="rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    📋 Copiar JSON
                  </button>
                </div>
              </>
            ) : (
              <p className="text-center text-sm text-gray-400">
                Pegá un JWT para decodificarlo
              </p>
            )}
          </div>
        )}
      </section>

      <footer className="text-center text-xs text-gray-400">
        Password Hash — todo se procesa localmente en tu navegador
      </footer>
    </div>
  );
}
