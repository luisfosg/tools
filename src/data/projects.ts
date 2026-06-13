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
    status: "active",
  },
];
