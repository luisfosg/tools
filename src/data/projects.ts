export interface Project {
  slug: string;
  title: string;
  description: string;
  icon: string;
  status: "active" | "wip" | "planned";
}

export const projects: Project[] = [
  {
    slug: "grade-calculator",
    title: "Noteffy",
    description:
      "Calculadora de notas ponderadas en tiempo real. Agrega categorías, ítems y pesos para calcular tu promedio final al instante.",
    icon: "📊",
    status: "active",
  },
];
