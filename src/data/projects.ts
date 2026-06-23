export interface Project {
  slug: string;
  title: string;
  description: string;
  icon: string;
  status: "active" | "wip" | "planned";
}

export const projects: Project[] = [
  {
    slug: "noteffy",
    title: "Noteffy",
    description:
      "Calculadora de notas ponderadas en tiempo real. Agrega categorías, ítems y pesos para calcular tu promedio final al instante.",
    icon: "📊",
    status: "active",
  },
  {
    slug: "timestamp",
    title: "Timestamp",
    description:
      "Conversor de timestamps, zonas horarias, diferencias entre fechas y formateo. Gestiona horas y fechas en un solo lugar.",
    icon: "⏱️",
    status: "wip",
  },
  {
    slug: "iban-generator",
    title: "IBAN Generator",
    description:
      "Generador de IBANs de prueba para la UE. Seleccioná país y banco, o generá uno random con todos los datos bancarios consistentes.",
    icon: "🏦",
    status: "wip",
  },
  {
    slug: "qr-generator",
    title: "QR Generator",
    description:
      "Generador de QR con personalización completa: colores, gradientes, estilos, logo y descarga en PNG/SVG/JPG.",
    icon: "📱",
    status: "active",
  },
  {
    slug: "password-hash",
    title: "Password Hash",
    description:
      "Generá hashes bcrypt, SHA, HMAC, PBKDF2 y JWT al instante. Soporta secretos y salt rounds configurables.",
    icon: "🔐",
    status: "wip",
  },
  {
    slug: "barcode-generator",
    title: "Barcode Generator",
    description:
      "Generá códigos de barras en múltiples formatos: CODE128, EAN-13, UPC-A, CODE39, ITF-14 y más. Descargá en PNG o SVG.",
    icon: "▌",
    status: "active",
  },
  {
    slug: "phone-generator",
    title: "Phone Generator",
    description:
      "Generá números telefónicos de prueba por país, validalos e identificá el país de origen. Copiá en múltiples formatos.",
    icon: "📞",
    status: "wip",
  },
  {
    slug: "seo-viewer",
    title: "SEO Viewer",
    description:
      "Analizá el SEO de cualquier página web: title, meta tags, Open Graph, headings, structured data y más con puntuación y recomendaciones.",
    icon: "🔍",
    status: "active",
  },
];
