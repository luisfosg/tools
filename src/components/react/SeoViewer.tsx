import { useState, useEffect, useCallback, useRef } from "react";
import { Toaster, sileo } from "sileo";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

/* ───────── types ───────── */

type Status = "good" | "warn" | "error" | "info";

interface TitleResult {
  content: string;
  length: number;
  status: Status;
}

interface MetaDescResult {
  content: string;
  length: number;
  status: Status;
}

interface CanonicalResult {
  present: boolean;
  href: string;
}

interface TagListResult {
  [key: string]: string;
}

interface HreflangEntry {
  lang: string;
  url: string;
}

interface StructuredDataEntry {
  raw: string;
  parsed: Record<string, unknown> | null;
}

interface HeadingNode {
  level: number;
  tag: string;
  text: string;
  children: HeadingNode[];
}

interface ImagesResult {
  total: number;
  withAlt: number;
  withoutAlt: number;
  ratio: number;
}

interface SeoAnalysis {
  title: TitleResult;
  metaDescription: MetaDescResult;
  canonical: CanonicalResult;
  openGraph: TagListResult;
  twitterCards: TagListResult;
  hreflang: HreflangEntry[];
  structuredData: StructuredDataEntry[];
  headings: HeadingNode[];
  headingsFlat: { level: number; tag: string; text: string }[];
  headingWarnings: string[];
  images: ImagesResult;
  language: { present: boolean; value: string };
  viewport: { present: boolean; content: string };
  robots: { present: boolean; content: string };
  favicon: { present: boolean; href: string };
  charset: { present: boolean; value: string };
  score: number;
  issues: string[];
  checklist: ChecklistItem[];
}

interface ChecklistItem {
  label: string;
  status: Status;
  detail: string;
}

/* ───────── helpers ───────── */

function cx(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

function isUrl(str: string): boolean {
  return /^https?:\/\//i.test(str);
}

function UrlLink({ href, className }: { href: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cx("max-w-full truncate text-indigo-600 underline underline-offset-2 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300", className)}
    >
      {href}
    </a>
  );
}

function statusIcon(status: Status): string {
  if (status === "good") return "✅";
  if (status === "warn") return "⚠️";
  if (status === "error") return "❌";
  return "ℹ️";
}

function statusColor(status: Status): string {
  if (status === "good") return "text-green-600 dark:text-green-400";
  if (status === "warn") return "text-amber-600 dark:text-amber-400";
  if (status === "error") return "text-red-600 dark:text-red-400";
  return "text-gray-500 dark:text-gray-400";
}

function statusBg(status: Status): string {
  if (status === "good") return "bg-green-50 dark:bg-green-900/20";
  if (status === "warn") return "bg-amber-50 dark:bg-amber-900/20";
  if (status === "error") return "bg-red-50 dark:bg-red-900/20";
  return "bg-gray-50 dark:bg-gray-800/50";
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-green-500";
  if (score >= 50) return "text-amber-500";
  return "text-red-500";
}

function scoreRingColor(score: number): string {
  if (score >= 80) return "stroke-green-500";
  if (score >= 50) return "stroke-amber-500";
  return "stroke-red-500";
}

function scoreLabel(score: number): string {
  if (score >= 90) return "Excelente";
  if (score >= 80) return "Muy bueno";
  if (score >= 65) return "Bueno";
  if (score >= 50) return "Regular";
  if (score >= 30) return "Malo";
  return "Muy malo";
}

function copyToClipboard(text: string, label: string) {
  navigator.clipboard.writeText(text).then(
    () => sileo.success({ title: "Copiado", description: `${label} copiado al portapapeles` }),
    () => sileo.error({ title: "Error", description: "No se pudo copiar" }),
  );
}

/* ───────── style constants ───────── */

const inp =
  "rounded-lg border border-gray-200 bg-gray-50/50 px-3 py-2 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:outline-none dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-300 dark:hover:border-gray-600 dark:focus:border-indigo-400 dark:focus:bg-gray-800";
const lbl = "text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500";
const card = "rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100 dark:bg-gray-900 dark:ring-gray-800";
const badge = (status: Status) =>
  cx(
    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
    statusBg(status),
    statusColor(status),
  );

/* ───────── skeleton loading ───────── */

function SkeletonBadges() {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} width={i === 0 ? 100 : i === 1 ? 130 : 90} height={26} borderRadius={999} />
      ))}
    </div>
  );
}

function SkeletonScoreCard() {
  return (
    <section className={card}>
      <div className="flex flex-col items-center gap-6 sm:flex-row">
        <Skeleton circle width={120} height={120} />
        <div className="flex-1 space-y-3">
          <Skeleton width={180} height={20} />
          <Skeleton width="100%" height={14} count={2} />
          <Skeleton width={140} height={14} />
        </div>
      </div>
    </section>
  );
}

function SkeletonContentCards() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-200 p-5 dark:border-gray-700">
          <div className="mb-3 flex items-center gap-2">
            <Skeleton circle width={20} height={20} />
            <Skeleton width={120} height={16} />
          </div>
          <Skeleton width="100%" height={12} count={3} />
        </div>
      ))}
    </div>
  );
}

function SkeletonIssues() {
  return (
    <section className={card}>
      <Skeleton width={160} height={20} className="mb-4" />
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} width={`${70 + i * 5}%`} height={14} />
        ))}
      </div>
    </section>
  );
}

function SkeletonSocialPreview() {
  return (
    <section className={card}>
      <Skeleton width={200} height={18} className="mb-4" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            <Skeleton width="100%" height={24} />
            <div className="p-3">
              <Skeleton width="100%" height={100} className="mb-2" />
              <Skeleton width="80%" height={14} className="mb-1" />
              <Skeleton width="60%" height={12} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <SkeletonScoreCard />
      <SkeletonBadges />
      <SkeletonContentCards />
      <SkeletonSocialPreview />
      <SkeletonIssues />
    </div>
  );
}

/* ───────── analysis logic ───────── */

function analyzeTitle(doc: Document): TitleResult {
  const el = doc.querySelector("title");
  const content = el?.textContent?.trim() ?? "";
  const length = content.length;

  let status: Status;
  if (!content) status = "error";
  else if (length >= 30 && length <= 60) status = "good";
  else if (length >= 10 && length <= 70) status = "warn";
  else status = "error";

  return { content, length, status };
}

function analyzeMetaDescription(doc: Document): MetaDescResult {
  const el = doc.querySelector('meta[name="description"]');
  const content = el?.getAttribute("content")?.trim() ?? "";
  const length = content.length;

  let status: Status;
  if (!content) status = "error";
  else if (length >= 120 && length <= 160) status = "good";
  else if (length >= 50 && length <= 200) status = "warn";
  else status = "error";

  return { content, length, status };
}

function analyzeCanonical(doc: Document): CanonicalResult {
  const el = doc.querySelector('link[rel="canonical"]');
  return { present: !!el, href: el?.getAttribute("href") ?? "" };
}

function collectMetaTags(doc: Document, attr: string, prefix: string): TagListResult {
  const result: TagListResult = {};
  const selector = attr === "property" ? `meta[property^="${prefix}"]` : `meta[name^="${prefix}"]`;
  doc.querySelectorAll(selector).forEach((el) => {
    const key = el.getAttribute(attr)?.replace(prefix, "") ?? "";
    const val = el.getAttribute("content") ?? "";
    if (key && val) result[key] = val;
  });
  return result;
}

function analyzeHreflang(doc: Document): HreflangEntry[] {
  const entries: HreflangEntry[] = [];
  doc.querySelectorAll('link[rel="alternate"][hreflang]').forEach((el) => {
    const lang = el.getAttribute("hreflang") ?? "";
    const url = el.getAttribute("href") ?? "";
    if (lang && url) entries.push({ lang, url });
  });
  return entries;
}

function analyzeStructuredData(doc: Document): StructuredDataEntry[] {
  const entries: StructuredDataEntry[] = [];
  doc.querySelectorAll('script[type="application/ld+json"]').forEach((el) => {
    const raw = el.textContent?.trim() ?? "";
    if (!raw) return;
    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      /* invalid JSON — keep parsed as null */
    }
    entries.push({ raw, parsed });
  });
  return entries;
}

function buildHeadingTree(
  headings: { level: number; tag: string; text: string }[],
): { tree: HeadingNode[]; warnings: string[] } {
  const root: HeadingNode[] = [];
  const stack: { level: number; node: HeadingNode }[] = [];
  const warnings: string[] = [];
  let prevLevel = 0;

  for (const h of headings) {
    if (prevLevel > 0 && h.level > prevLevel + 1) {
      warnings.push(`Salto de nivel: h${prevLevel} → h${h.level} (falta h${prevLevel + 1})`);
    }
    prevLevel = h.level;

    const node: HeadingNode = { level: h.level, tag: h.tag, text: h.text, children: [] };

    while (stack.length > 0 && stack[stack.length - 1].level >= h.level) {
      stack.pop();
    }

    if (stack.length > 0) {
      stack[stack.length - 1].node.children.push(node);
    } else {
      root.push(node);
    }

    stack.push({ level: h.level, node });
  }

  return { tree: root, warnings };
}

function analyzeHeadings(doc: Document): {
  tree: HeadingNode[];
  flat: { level: number; tag: string; text: string }[];
  warnings: string[];
} {
  const flat: { level: number; tag: string; text: string }[] = [];
  for (let i = 1; i <= 6; i++) {
    const tag = `h${i}`;
    doc.querySelectorAll(tag).forEach((el) => {
      const text = (el as HTMLElement).textContent?.trim() ?? "";
      if (text) flat.push({ level: i, tag, text });
    });
  }

  if (flat.length === 0) {
    return { tree: [], flat, warnings: ["No se encontraron encabezados (h1-h6) en la página"] };
  }

  const hasH1 = flat.some((h) => h.level === 1);
  if (!hasH1) {
    return { tree: [], flat, warnings: ["No se encontró un h1 en la página"] };
  }

  const { tree, warnings } = buildHeadingTree(flat);
  return { tree, flat, warnings };
}

function analyzeImages(doc: Document): ImagesResult {
  const imgs = doc.querySelectorAll("img");
  const total = imgs.length;
  let withAlt = 0;
  let withoutAlt = 0;

  imgs.forEach((img) => {
    const alt = img.getAttribute("alt");
    if (alt !== null && alt !== undefined) {
      withAlt++;
    } else {
      withoutAlt++;
    }
  });

  return { total, withAlt, withoutAlt, ratio: total > 0 ? withAlt / total : 1 };
}

function analyzeLanguage(doc: Document): { present: boolean; value: string } {
  const html = doc.querySelector("html");
  const lang = html?.getAttribute("lang") ?? "";
  return { present: !!lang, value: lang };
}

function analyzeViewport(doc: Document): { present: boolean; content: string } {
  const el = doc.querySelector('meta[name="viewport"]');
  return { present: !!el, content: el?.getAttribute("content") ?? "" };
}

function analyzeRobots(doc: Document): { present: boolean; content: string } {
  const el = doc.querySelector('meta[name="robots"]');
  return { present: !!el, content: el?.getAttribute("content") ?? "" };
}

function analyzeFavicon(doc: Document): { present: boolean; href: string } {
  const selectors = [
    'link[rel="icon"]',
    'link[rel="shortcut icon"]',
    'link[rel="apple-touch-icon"]',
  ];
  for (const sel of selectors) {
    const el = doc.querySelector(sel);
    if (el) return { present: true, href: el.getAttribute("href") ?? "" };
  }
  return { present: false, href: "" };
}

function analyzeCharset(doc: Document): { present: boolean; value: string } {
  const el = doc.querySelector('meta[charset]');
  if (el) return { present: true, value: el.getAttribute("charset") ?? "" };
  const httpEquiv = doc.querySelector('meta[http-equiv="Content-Type"]');
  if (httpEquiv) {
    const content = httpEquiv.getAttribute("content") ?? "";
    const match = content.match(/charset=([\w-]+)/);
    return { present: true, value: match?.[1] ?? content };
  }
  return { present: false, value: "" };
}

function analyzeHtml(html: string): SeoAnalysis {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  const title = analyzeTitle(doc);
  const metaDescription = analyzeMetaDescription(doc);
  const canonical = analyzeCanonical(doc);
  const openGraph = collectMetaTags(doc, "property", "og:");
  const twitterCards = collectMetaTags(doc, "name", "twitter:");
  const hreflang = analyzeHreflang(doc);
  const structuredData = analyzeStructuredData(doc);
  const { tree: headings, flat: headingsFlat, warnings: headingWarnings } = analyzeHeadings(doc);
  const images = analyzeImages(doc);
  const language = analyzeLanguage(doc);
  const viewport = analyzeViewport(doc);
  const robots = analyzeRobots(doc);
  const favicon = analyzeFavicon(doc);
  const charset = analyzeCharset(doc);

  /* ── calculate score ── */
  let score = 0;
  const issues: string[] = [];

  // Title (max 10)
  if (title.status === "good") {
    score += 10;
  } else if (title.status === "warn") {
    score += 5;
    issues.push(`El title tiene ${title.length} caracteres (ideal: 30-60)`);
  } else {
    if (!title.content) issues.push("Falta la etiqueta <title>");
    else issues.push(`El title tiene ${title.length} caracteres (ideal: 30-60)`);
  }

  // Meta Description (max 10)
  if (metaDescription.status === "good") {
    score += 10;
  } else if (metaDescription.status === "warn") {
    score += 5;
    issues.push(`La meta description tiene ${metaDescription.length} caracteres (ideal: 120-160)`);
  } else {
    if (!metaDescription.content) issues.push("Falta la meta description");
    else issues.push(`La meta description tiene ${metaDescription.length} caracteres (ideal: 120-160)`);
  }

  // Canonical (max 5)
  if (canonical.present) {
    score += 5;
  } else {
    issues.push("Falta la etiqueta <link rel='canonical'>");
  }

  // Open Graph (max 15)
  const ogKeys = ["title", "description", "image", "type"];
  const ogPresent = ogKeys.filter((k) => openGraph[k]).length;
  score += Math.round((ogPresent / ogKeys.length) * 15);
  if (ogPresent < ogKeys.length) {
    const missing = ogKeys.filter((k) => !openGraph[k]);
    issues.push(`Open Graph: faltan ${missing.map((k) => `og:${k}`).join(", ")}`);
  }

  // Twitter Cards (max 5)
  const twKeys = ["card", "title", "description", "image"];
  const twPresent = twKeys.filter((k) => twitterCards[k]).length;
  score += Math.round((twPresent / twKeys.length) * 5);
  if (twPresent < twKeys.length) {
    const missing = twKeys.filter((k) => !twitterCards[k]);
    issues.push(`Twitter Cards: faltan ${missing.map((k) => `twitter:${k}`).join(", ")}`);
  }

  // hreflang (max 5)
  if (hreflang.length > 0) {
    score += 5;
  } else {
    issues.push("No hay etiquetas hreflang");
  }

  // Structured Data (max 5)
  if (structuredData.length > 0) {
    score += 5;
  } else {
    issues.push("No hay datos estructurados (JSON-LD)");
  }

  // Headings (max 10)
  if (headingsFlat.length > 0) {
    const hasH1 = headingsFlat.some((h) => h.level === 1);
    score += hasH1 ? 5 : 0;
    if (headingWarnings.length === 0) {
      score += 5;
    } else {
      score += 2;
      headingWarnings.forEach((w) => issues.push(w));
    }
  } else {
    issues.push("No hay encabezados (h1-h6) en la página");
  }

  // Images (max 10)
  score += Math.round(images.ratio * 10);
  if (images.withoutAlt > 0) {
    issues.push(`${images.withoutAlt} imagen(es) sin atributo alt`);
  }

  // Language (max 5)
  if (language.present) score += 5;
  else issues.push("Falta el atributo lang en <html>");

  // Viewport (max 5)
  if (viewport.present) score += 5;
  else issues.push("Falta la meta viewport");

  // Robots (max 5)
  if (robots.present) score += 5;

  // Favicon (max 5)
  if (favicon.present) score += 5;
  else issues.push("No se encontró un favicon");

  // Charset (max 5)
  if (charset.present) score += 5;
  else issues.push("Falta la declaración de charset");

  score = Math.min(100, Math.max(0, score));

  /* ── build checklist ── */
  const checklist: ChecklistItem[] = [
    {
      label: "Etiqueta <title>",
      status: title.status,
      detail: title.content ? `${title.length} caracteres` : "No presente",
    },
    {
      label: "Meta description",
      status: metaDescription.status,
      detail: metaDescription.content ? `${metaDescription.length} caracteres` : "No presente",
    },
    {
      label: "Canonical URL",
      status: canonical.present ? "good" : "error",
      detail: canonical.present ? canonical.href : "No presente",
    },
    {
      label: "Open Graph",
      status: ogPresent === ogKeys.length ? "good" : ogPresent > 0 ? "warn" : "error",
      detail: `${ogPresent}/${ogKeys.length} tags presentes`,
    },
    {
      label: "Twitter Cards",
      status: twPresent === twKeys.length ? "good" : twPresent > 0 ? "warn" : "error",
      detail: `${twPresent}/${twKeys.length} tags presentes`,
    },
    {
      label: "Hreflang",
      status: hreflang.length > 0 ? "good" : "info",
      detail: hreflang.length > 0 ? `${hreflang.length} tag(s)` : "No presente",
    },
    {
      label: "Datos estructurados (JSON-LD)",
      status: structuredData.length > 0 ? "good" : "info",
      detail: structuredData.length > 0 ? `${structuredData.length} bloque(s)` : "No presente",
    },
    {
      label: "Encabezados (h1-h6)",
      status: headingWarnings.length === 0 && headingsFlat.length > 0
        ? "good"
        : headingsFlat.length > 0
          ? "warn"
          : "error",
      detail: `${headingsFlat.length} encabezado(s)`,
    },
    {
      label: "Imágenes con alt",
      status: images.ratio >= 1 ? "good" : images.ratio > 0 ? "warn" : "error",
      detail: images.total > 0
        ? `${images.withAlt}/${images.total} tienen alt`
        : "No hay imágenes",
    },
    {
      label: "Idioma (lang)",
      status: language.present ? "good" : "error",
      detail: language.present ? language.value : "No presente",
    },
    {
      label: "Viewport",
      status: viewport.present ? "good" : "error",
      detail: viewport.present ? "Presente" : "No presente",
    },
    {
      label: "Favicon",
      status: favicon.present ? "good" : "warn",
      detail: favicon.present ? "Presente" : "No presente",
    },
    {
      label: "Charset",
      status: charset.present ? "good" : "error",
      detail: charset.present ? charset.value : "No presente",
    },
  ];

  return {
    title,
    metaDescription,
    canonical,
    openGraph,
    twitterCards,
    hreflang,
    structuredData,
    headings,
    headingsFlat,
    headingWarnings,
    images,
    language,
    viewport,
    robots,
    favicon,
    charset,
    score,
    issues,
    checklist,
  };
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function ScoreGauge({ score }: { score: number }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex items-center justify-center">
        <svg width={120} height={120} className="-rotate-90">
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={6}
            className="text-gray-100 dark:text-gray-800"
          />
          <circle
            cx={60}
            cy={60}
            r={radius}
            fill="none"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className={scoreRingColor(score)}
            style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
          />
        </svg>
        <span className={cx("absolute text-3xl font-extrabold tracking-tight", scoreColor(score))}>
          {score}
        </span>
      </div>
      <div className="text-center">
        <span className={cx("text-lg font-bold", scoreColor(score))}>{scoreLabel(score)}</span>
        <p className="text-xs text-gray-400 dark:text-gray-500">sobre 100</p>
      </div>
    </div>
  );
}

function SectionCard({
  title,
  icon,
  status,
  children,
  colSpan,
}: {
  title: string;
  icon: string;
  status?: Status;
  children: React.ReactNode;
  colSpan?: boolean;
}) {
  return (
    <div className={cx(card, "overflow-hidden", colSpan ? "sm:col-span-2" : "")}>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
          <span>{icon}</span>
          {title}
        </h3>
        {status && <span className={badge(status)}>{statusIcon(status)} {statusText(status)}</span>}
      </div>
      {children}
    </div>
  );
}

function statusText(s: Status): string {
  if (s === "good") return "OK";
  if (s === "warn") return "Aviso";
  if (s === "error") return "Error";
  return "Info";
}

function TagRow({ label, value, status }: { label: string; value: string; status?: Status }) {
  return (
    <div className="flex items-start gap-3 rounded-lg bg-gray-50/50 px-3 py-2 dark:bg-gray-800/30">
      <span className="mt-0.5 shrink-0 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 w-28">
        {label}
      </span>
      <div className="min-w-0 flex-1">
        {status ? (
          <span className={cx("flex items-center gap-1 text-sm font-medium min-w-0", statusColor(status))}>
            <span className="shrink-0">{statusIcon(status)}</span>
            <span className="min-w-0 truncate">
              {value && isUrl(value) ? <UrlLink href={value} /> : value || "No presente"}
            </span>
          </span>
        ) : (
          <span className="block min-w-0 text-sm text-gray-700 dark:text-gray-300">
            {isUrl(value) ? <UrlLink href={value} className="block" /> : <span className="truncate block">{value}</span>}
          </span>
        )}
      </div>
    </div>
  );
}

function HeadingTreeView({ nodes, depth = 0 }: { nodes: HeadingNode[]; depth?: number }) {
  if (nodes.length === 0) return null;
  return (
    <ul className={cx("space-y-1", depth > 0 ? "ml-5 border-l-2 border-gray-100 pl-4 dark:border-gray-700" : "")}>
      {nodes.map((node, i) => (
        <li key={i}>
          <div className="flex items-center gap-2 rounded-md px-2 py-1 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <span className="inline-flex items-center justify-center rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {node.tag}
            </span>
            <span className="text-sm text-gray-700 dark:text-gray-300">{node.text}</span>
          </div>
          {node.children.length > 0 && <HeadingTreeView nodes={node.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  );
}

function JsonBlock({ data }: { data: StructuredDataEntry }) {
  const [open, setOpen] = useState(true);

  const formatted = data.parsed
    ? JSON.stringify(data.parsed, null, 2)
    : data.raw;

  return (
    <div className="rounded-lg border border-gray-100 dark:border-gray-700">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"
      >
        <span>JSON-LD {data.parsed ? "✓" : "⚠️ inválido"}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={cx("h-4 w-4 transition-transform", open && "rotate-180")}
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <pre className="overflow-x-auto border-t border-gray-100 bg-gray-50/50 p-4 text-xs leading-relaxed text-gray-700 dark:border-gray-700 dark:bg-gray-800/30 dark:text-gray-300">
          {formatted}
        </pre>
      )}
    </div>
  );
}

function HreflangList({ entries }: { entries: HreflangEntry[] }) {
  if (entries.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">No se encontraron etiquetas hreflang</p>;
  }

  return (
    <div className="space-y-1.5">
      {entries.map((e, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg bg-gray-50/50 px-3 py-2 text-sm dark:bg-gray-800/30">
          <span className="inline-flex items-center justify-center rounded bg-indigo-100 px-2 py-0.5 text-xs font-bold uppercase text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
            {e.lang}
          </span>
          <span className="truncate text-gray-600 dark:text-gray-400">{e.url}</span>
        </div>
      ))}
    </div>
  );
}

function TagTable({ tags, prefix }: { tags: TagListResult; prefix: string }) {
  const keys = Object.keys(tags);
  if (keys.length === 0) {
    return <p className="text-sm text-gray-400 dark:text-gray-500">No se encontraron tags</p>;
  }

  return (
    <div className="space-y-1.5">
      {keys.map((key) => (
        <div key={key} className="flex items-start gap-3 rounded-lg bg-gray-50/50 px-3 py-2 text-sm dark:bg-gray-800/30">
          <span className="shrink-0 font-mono text-xs text-indigo-600 dark:text-indigo-400">
            {prefix}:{key}
          </span>
          <span className="min-w-0 text-gray-700 dark:text-gray-300">
            {isUrl(tags[key]) ? <UrlLink href={tags[key]} /> : <span className="break-all">{tags[key]}</span>}
          </span>
        </div>
      ))}
    </div>
  );
}

function CompressionInfo() {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-gray-50/50 px-3 py-2 text-sm dark:bg-gray-800/30">
      <span className="text-xs text-gray-400 dark:text-gray-500">
        La detección de compresión HTTP requiere acceso al servidor. Usá herramientas como
        Chrome DevTools → Network para verificar gzip/brotli.
      </span>
    </div>
  );
}

/* ───────── social preview ───────── */

function extractDomain(urlStr: string): string {
  try {
    return new URL(urlStr).hostname.replace(/^www\./, "");
  } catch {
    return urlStr;
  }
}

interface SocialPreviewProps {
  title: string;
  description: string;
  image: string;
  domain: string;
}

function PlatformCard({
  name,
  accent,
  children,
}: {
  name: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
      <div className={cx("px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white", accent)}>
        {name}
      </div>
      {children}
    </div>
  );
}

function LinkPreviewCard({ title, description, image, domain }: SocialPreviewProps) {
  const hasImage = !!image;
  return (
    <div className="bg-white dark:bg-gray-800">
      {hasImage && (
        <div className="aspect-[1.91/1] w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={image}
            alt=""
            className="h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget.parentElement as HTMLElement).style.display = "none";
            }}
          />
        </div>
      )}
      <div className="space-y-1 p-3">
        <p className="text-xs text-gray-400 dark:text-gray-500">{domain}</p>
        <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100 line-clamp-2">
          {title}
        </p>
        {description && (
          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

function WhatsAppPreview(props: SocialPreviewProps) {
  return (
    <PlatformCard name="WhatsApp" accent="bg-[#25D366]">
      <div className="m-3 overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
        {props.image && (
          <div className="aspect-[1.91/1] w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img src={props.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
          </div>
        )}
        <div className="space-y-1 p-3">
          <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100 line-clamp-2">{props.title}</p>
          {props.description && <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">{props.description}</p>}
          <p className="text-xs text-[#25D366]">{props.domain}</p>
        </div>
      </div>
    </PlatformCard>
  );
}

function TwitterPreview(props: SocialPreviewProps) {
  return (
    <PlatformCard name="X (Twitter)" accent="bg-black dark:bg-gray-200 dark:text-gray-900">
      <div className="m-3 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
        {props.image && (
          <div className="aspect-[1.91/1] w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img src={props.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
          </div>
        )}
        <div className="space-y-1 p-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">{props.domain}</p>
          <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100 line-clamp-2">{props.title}</p>
          {props.description && <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-2">{props.description}</p>}
        </div>
      </div>
    </PlatformCard>
  );
}

function FacebookPreview(props: SocialPreviewProps) {
  return (
    <PlatformCard name="Facebook" accent="bg-[#1877F2]">
      <div className="m-3 overflow-hidden rounded-lg bg-white dark:bg-gray-800">
        {props.image && (
          <div className="aspect-[1.91/1] w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img src={props.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
          </div>
        )}
        <div className="space-y-1 border-t border-gray-200 p-3 dark:border-gray-700">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{props.domain}</p>
          <p className="text-md font-semibold leading-snug text-gray-900 dark:text-gray-100 line-clamp-2">{props.title}</p>
          {props.description && <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400 line-clamp-3">{props.description}</p>}
        </div>
      </div>
    </PlatformCard>
  );
}

function LinkedInPreview(props: SocialPreviewProps) {
  return (
    <PlatformCard name="LinkedIn" accent="bg-[#0A66C2]">
      <div className="m-3">
        <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">{props.domain}</p>
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-800">
          {props.image && (
            <div className="aspect-[1.91/1] w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
              <img src={props.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
            </div>
          )}
          <div className="space-y-1 p-3">
            <p className="text-sm font-semibold leading-snug text-gray-900 dark:text-gray-100 line-clamp-2">{props.title}</p>
            {props.description && <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">{props.description}</p>}
          </div>
        </div>
      </div>
    </PlatformCard>
  );
}

function TelegramPreview(props: SocialPreviewProps) {
  return (
    <PlatformCard name="Telegram" accent="bg-[#0088cc]">
      <div className="m-3 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-gray-600 dark:bg-gray-800">
        {props.image && (
          <div className="aspect-[1.91/1] w-full overflow-hidden bg-gray-100 dark:bg-gray-700">
            <img src={props.image} alt="" className="h-full w-full object-cover" onError={(e) => { (e.currentTarget.parentElement as HTMLElement).style.display = "none"; }} />
          </div>
        )}
        <div className="space-y-1 p-3">
          <p className="text-sm font-semibold leading-snug text-[#0088cc] dark:text-blue-400 line-clamp-2">{props.title}</p>
          {props.description && <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">{props.description}</p>}
          <p className="text-xs text-gray-400 dark:text-gray-500">{props.domain}</p>
        </div>
      </div>
    </PlatformCard>
  );
}

function SocialPreviewSection({
  analysis,
  pageUrl,
}: {
  analysis: SeoAnalysis;
  pageUrl: string;
}) {
  const title = analysis.openGraph.title || analysis.title.content || "Sin título";
  const description =
    analysis.openGraph.description || analysis.metaDescription.content || "";
  const image = analysis.openGraph.image || "";
  const domain = extractDomain(pageUrl || analysis.canonical.href || "");

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <WhatsAppPreview title={title} description={description} image={image} domain={domain} />
      <TwitterPreview title={title} description={description} image={image} domain={domain} />
      <FacebookPreview title={title} description={description} image={image} domain={domain} />
      <LinkedInPreview title={title} description={description} image={image} domain={domain} />
      <TelegramPreview title={title} description={description} image={image} domain={domain} />
    </div>
  );
}

/* ───────── main component ───────── */

const CORS_PROXY = "https://api.allorigins.win/raw?url=";

export default function SeoViewer() {
  const [url, setUrl] = useState("");
  const [pastedHtml, setPastedHtml] = useState("");
  const [analysis, setAnalysis] = useState<SeoAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false);
  const [showSocialPreview, setShowSocialPreview] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── auto-analyze on mount ── */
  useEffect(() => {
    const defaultUrl = window.location.origin + "/tools/";
    setUrl(defaultUrl);
    handleFetchUrl(defaultUrl);
    setInitialLoadDone(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tryFetch = useCallback(async (urlStr: string): Promise<string> => {
    const response = await fetch(urlStr);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    const html = await response.text();
    if (!html.trim()) throw new Error("Respuesta vacía");
    return html;
  }, []);

  const tryFetchWithProxy = useCallback(async (urlStr: string): Promise<string> => {
    const proxyUrl = CORS_PROXY + encodeURIComponent(urlStr);
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error(`Proxy HTTP ${response.status}: ${response.statusText}`);
    }
    const html = await response.text();
    if (!html.trim()) throw new Error("Respuesta vacía");
    return html;
  }, []);

  const handleFetchUrl = useCallback(async (urlStr: string) => {
    if (!urlStr.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setError(null);
    setShowPaste(false);

    try {
      /* 1 — try direct fetch (works for same-origin) */
      const html = await tryFetch(urlStr);
      const result = analyzeHtml(html);
      setAnalysis(result);
      sileo.success({ title: "Analizado", description: "SEO analizado correctamente" });
    } catch (_directErr) {
      /* 2 — direct failed (likely CORS), try via proxy */
      try {
        const proxiedHtml = await tryFetchWithProxy(urlStr);
        const result = analyzeHtml(proxiedHtml);
        setAnalysis(result);
        sileo.success({ title: "Analizado", description: "SEO analizado vía proxy CORS" });
      } catch (_proxyErr) {
        /* 3 — proxy also failed, show paste fallback */
        setError(`No se pudo acceder a ${urlStr} ni por proxy. Pegá el HTML manualmente.`);
        setShowPaste(true);
        sileo.error({ title: "Error de conexión", description: "Usá la opción 'Pegar HTML' para análisis manual." });
      }
    } finally {
      setLoading(false);
    }
  }, [tryFetch, tryFetchWithProxy]);

  const handleAnalyzeUrl = useCallback(() => {
    handleFetchUrl(url);
  }, [url, handleFetchUrl]);

  const handleAnalyzePaste = useCallback(() => {
    if (!pastedHtml.trim()) return;
    setLoading(true);
    setAnalysis(null);
    setError(null);

    try {
      const result = analyzeHtml(pastedHtml);
      setAnalysis(result);
      sileo.success({ title: "Analizado", description: "HTML analizado correctamente" });
    } catch (err) {
      setError("No se pudo analizar el HTML. Verificá que sea HTML válido.");
      sileo.error({ title: "Error", description: "HTML inválido" });
    } finally {
      setLoading(false);
    }
  }, [pastedHtml]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !loading) handleAnalyzeUrl();
    },
    [handleAnalyzeUrl, loading],
  );

  /* ── render ── */
  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8">
      <Toaster position="top-right" theme="system" />

      {/* ── Header ── */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
          SEO Viewer
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Analizá el SEO de cualquier página web con puntuación y recomendaciones
        </p>
      </header>

      {/* ── Input section ── */}
      <section className={card}>
        <div className="space-y-4">
          {/* URL row */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="min-w-0 flex-1">
              <label className={lbl}>URL a analizar</label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="https://ejemplo.com"
                className={cx(inp, "mt-1 w-full text-base")}
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={handleAnalyzeUrl}
                disabled={loading || !url.trim()}
                className={cx(
                  "inline-flex h-[38px] items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all active:scale-[0.97]",
                  loading || !url.trim()
                    ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                    : "bg-indigo-600 text-white shadow-sm hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-400",
                )}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Analizando...
                  </>
                ) : (
                  "Analizar"
                )}
              </button>
            </div>
          </div>

          {/* Toggle paste */}
          <button
            type="button"
            onClick={() => setShowPaste(!showPaste)}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className={cx("h-4 w-4 transition-transform", showPaste && "rotate-90")}
            >
              <path
                fillRule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clipRule="evenodd"
              />
            </svg>
            {showPaste ? "Ocultar" : "O pegar HTML manualmente"}
          </button>

          {/* Paste area */}
          {showPaste && (
            <div className="animate-fadeIn space-y-3 rounded-xl border border-dashed border-gray-200 bg-gray-50/50 p-4 dark:border-gray-700 dark:bg-gray-800/20">
              <div>
                <label className={lbl}>Pegá el HTML de la página</label>
                <textarea
                  ref={textareaRef}
                  value={pastedHtml}
                  onChange={(e) => setPastedHtml(e.target.value)}
                  placeholder="&lt;html&gt;&lt;head&gt;...&lt;/head&gt;&lt;body&gt;...&lt;/body&gt;&lt;/html&gt;"
                  rows={6}
                  className={cx(inp, "mt-1 w-full font-mono text-xs leading-relaxed")}
                />
              </div>
              <button
                type="button"
                onClick={handleAnalyzePaste}
                disabled={loading || !pastedHtml.trim()}
                className={cx(
                  "inline-flex h-[38px] items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all active:scale-[0.97]",
                  loading || !pastedHtml.trim()
                    ? "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-700 dark:text-gray-500"
                    : "bg-gray-800 text-white shadow-sm hover:bg-gray-900 dark:bg-gray-200 dark:text-gray-800 dark:hover:bg-gray-300",
                )}
              >
                {loading ? (
                  <>
                    <Spinner />
                    Analizando...
                  </>
                ) : (
                  "Pegar HTML"
                )}
              </button>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-300">
              <p className="font-semibold">⚠️ {error}</p>
              <p className="mt-1 text-red-600 dark:text-red-400">
                {showPaste ? "Pegá el HTML de la página en el área de abajo para analizarlo manualmente." : ""}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── RESULTS ── */}
      {loading ? (
        <ResultsSkeleton />
      ) : (
        analysis && (
          <>
            {/* Score card */}
          <section className={card}>
            <div className="flex flex-col items-center sm:flex-row sm:gap-8">
              <ScoreGauge score={analysis.score} />
              <div className="mt-4 sm:mt-0 sm:flex-1">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                  Resumen
                </h3>
                <div className="flex flex-wrap gap-2">
                  <span className={badge(analysis.title.status)}>
                    {statusIcon(analysis.title.status)} Title
                  </span>
                  <span className={badge(analysis.metaDescription.status)}>
                    {statusIcon(analysis.metaDescription.status)} Description
                  </span>
                  {analysis.canonical.present && (
                    <span className={badge("good")}>{statusIcon("good")} Canonical</span>
                  )}
                  {analysis.headingsFlat.length > 0 && (
                    <span className={badge(analysis.headingWarnings.length === 0 ? "good" : "warn")}>
                      {statusIcon(analysis.headingWarnings.length === 0 ? "good" : "warn")} Headings
                    </span>
                  )}
                  {analysis.images.total > 0 && (
                    <span className={badge(analysis.images.ratio >= 1 ? "good" : "warn")}>
                      {statusIcon(analysis.images.ratio >= 1 ? "good" : "warn")} Imágenes
                    </span>
                  )}
                  <span className={badge(analysis.structuredData.length > 0 ? "good" : "info")}>
                    {statusIcon(analysis.structuredData.length > 0 ? "good" : "info")} JSON-LD
                  </span>
                </div>
                {analysis.issues.length > 0 && (
                  <div className="mt-4">
                    <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                      Recomendaciones ({analysis.issues.length})
                    </p>
                    <ul className="space-y-1">
                      {analysis.issues.map((issue, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="mt-0.5 shrink-0 text-red-400">•</span>
                          <span>{issue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Social Preview toggle ── */}
          <section className={card}>
            <button
              type="button"
              onClick={() => setShowSocialPreview(!showSocialPreview)}
              className="flex w-full items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">👁️</span>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-200">
                  Vista previa en redes sociales
                </h3>
                {analysis.openGraph.image ? (
                  <span className={badge("good")}>{statusIcon("good")} Con imagen OG</span>
                ) : (
                  <span className={badge("warn")}>{statusIcon("warn")} Sin imagen OG</span>
                )}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={cx("h-5 w-5 text-gray-400 transition-transform dark:text-gray-500", showSocialPreview && "rotate-180")}
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {showSocialPreview && (
              <div className="mt-6 animate-fadeIn">
                <SocialPreviewSection analysis={analysis} pageUrl={url} />
              </div>
            )}
          </section>

          {/* ── Content SEO ── */}
          <div className="grid gap-6 sm:grid-cols-2">
            <SectionCard
              title="Title"
              icon="📄"
              status={analysis.title.status}
            >
              <div className="space-y-2">
                <TagRow label="Contenido" value={analysis.title.content || "—"} />
                <TagRow label="Caracteres" value={`${analysis.title.length}`} status={
                  analysis.title.length >= 30 && analysis.title.length <= 60
                    ? "good"
                    : analysis.title.length > 0
                      ? "warn"
                      : "error"
                } />
              </div>
            </SectionCard>

            <SectionCard
              title="Meta Description"
              icon="📝"
              status={analysis.metaDescription.status}
            >
              <div className="space-y-2">
                <TagRow label="Contenido" value={analysis.metaDescription.content || "—"} />
                <TagRow label="Caracteres" value={`${analysis.metaDescription.length}`} status={
                  analysis.metaDescription.length >= 120 && analysis.metaDescription.length <= 160
                    ? "good"
                    : analysis.metaDescription.length > 0
                      ? "warn"
                      : "error"
                } />
              </div>
            </SectionCard>
          </div>

          {/* ── Social ── */}
          <div className="grid gap-6 sm:grid-cols-2">
            <SectionCard
              title="Open Graph"
              icon="🔗"
              status={Object.keys(analysis.openGraph).length > 0 ? "good" : "info"}
            >
              <TagTable tags={analysis.openGraph} prefix="og" />
            </SectionCard>

            <SectionCard
              title="Twitter Cards"
              icon="🐦"
              status={Object.keys(analysis.twitterCards).length > 0 ? "good" : "info"}
            >
              <TagTable tags={analysis.twitterCards} prefix="twitter" />
            </SectionCard>
          </div>

          {/* ── Technical SEO ── */}
          <div className="grid gap-6 sm:grid-cols-2">
            <SectionCard title="Canonical" icon="🔗" status={analysis.canonical.present ? "good" : "error"}>
              <TagRow label="URL" value={analysis.canonical.href || "No presente"} />
            </SectionCard>

            <SectionCard title="Hreflang" icon="🌐" status={analysis.hreflang.length > 0 ? "good" : "info"}>
              <HreflangList entries={analysis.hreflang} />
            </SectionCard>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <SectionCard title="Meta Tags" icon="🏷️">
              <div className="space-y-2">
                <TagRow label="Language" value={analysis.language.value || "No presente"} status={analysis.language.present ? "good" : "error"} />
                <TagRow label="Charset" value={analysis.charset.value || "No presente"} status={analysis.charset.present ? "good" : "error"} />
                <TagRow label="Viewport" value={analysis.viewport.present ? "Presente" : "No presente"} status={analysis.viewport.present ? "good" : "error"} />
                <TagRow label="Robots" value={analysis.robots.content || "No presente"} status={analysis.robots.present ? "good" : "info"} />
              </div>
            </SectionCard>

            <SectionCard title="Recursos" icon="📦">
              <div className="space-y-2">
                <TagRow label="Favicon" value={analysis.favicon.href || "No presente"} status={analysis.favicon.present ? "good" : "warn"} />
                <TagRow label="Compresión" value="—" />
                <div className="mt-2">
                  <CompressionInfo />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ── Headings ── */}
          <SectionCard
            title="Encabezados"
            icon="📑"
            status={
              analysis.headingsFlat.length === 0
                ? "error"
                : analysis.headingWarnings.length > 0
                  ? "warn"
                  : "good"
            }
          >
            {analysis.headingsFlat.length > 0 ? (
              <div className="space-y-3">
                <HeadingTreeView nodes={analysis.headings} />
                {analysis.headingWarnings.length > 0 && (
                  <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-300">
                    {analysis.headingWarnings.map((w, i) => (
                      <p key={i}>⚠️ {w}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">No se encontraron encabezados</p>
            )}
          </SectionCard>

          {/* ── Images ── */}
          <SectionCard
            title="Imágenes"
            icon="🖼️"
            status={analysis.images.total === 0 ? "info" : analysis.images.ratio >= 1 ? "good" : "warn"}
          >
            <div className="space-y-2">
              <TagRow label="Total" value={`${analysis.images.total}`} />
              <TagRow label="Con alt" value={`${analysis.images.withAlt}`} status={analysis.images.withAlt > 0 ? "good" : "error"} />
              <TagRow label="Sin alt" value={`${analysis.images.withoutAlt}`} status={analysis.images.withoutAlt === 0 ? "good" : "warn"} />
            </div>
          </SectionCard>

          {/* ── Structured Data ── */}
          <SectionCard
            title="Datos Estructurados"
            icon="📊"
            status={analysis.structuredData.length > 0 ? "good" : "info"}
          >
            {analysis.structuredData.length > 0 ? (
              <div className="space-y-3">
                {analysis.structuredData.map((entry, i) => (
                  <JsonBlock key={i} data={entry} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No se encontraron datos estructurados JSON-LD
              </p>
            )}
          </SectionCard>

          {/* ── Checklist ── */}
          <SectionCard title="Checklist Completo" icon="✅" colSpan>
            <div className="grid gap-2 sm:grid-cols-2">
              {analysis.checklist.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-lg border border-gray-50 bg-gray-50/30 px-3 py-2.5 dark:border-gray-800 dark:bg-gray-800/20"
                >
                  <span className="text-base">{statusIcon(item.status)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.label}</p>
                    <p className="truncate text-xs text-gray-400 dark:text-gray-500">{item.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* ── Raw HTML actions ── */}
          {analysis && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const report = [
                    `# SEO Report — ${url || "Pasted HTML"}`,
                    `\n## Score: ${analysis.score}/100 (${scoreLabel(analysis.score)})`,
                    `\n## Issues (${analysis.issues.length})`,
                    ...analysis.issues.map((i) => `- ${i}`),
                    `\n## Checklist`,
                    ...analysis.checklist.map((c) => `- [${c.status === "good" ? "x" : " "}] ${c.label}: ${c.detail}`),
                  ].join("\n");
                  copyToClipboard(report, "Reporte");
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-xs transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.96] dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:border-indigo-500 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-300"
              >
                <CopyIcon />
                Copiar reporte
              </button>
            </div>
          )}
        </>
      ))}

      {/* ── Empty state (before any analysis and not loading) ── */}
      {!analysis && !loading && initialLoadDone && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 text-5xl">🔍</div>
          <p className="text-lg font-semibold text-gray-600 dark:text-gray-400">
            Ingresá una URL o pegá el HTML para analizar
          </p>
          <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
            El análizis incluye title, meta tags, Open Graph, headings, structured data y más
          </p>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="text-center text-xs text-gray-400 dark:text-gray-500">
        SEO Viewer — Client-side analysis con DOMParser
      </footer>
    </div>
  );
}

/* ───────── spinner ───────── */

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/* ───────── icon components ───────── */

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
