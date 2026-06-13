import { useState, useMemo } from "react";

const DEFAULT_DATA = {
  categories: [
    {
      name: "Actividades",
      items: [
        { name: "Actividad 1", score: 10, maxScore: 10, weight: 5 },
        { name: "Actividad 2", score: 10, maxScore: 10, weight: 5 },
      ],
    },
    {
      name: "Exámenes",
      items: [
        { name: "Examen 1", score: 10, maxScore: 10, weight: 0.2 },
        { name: "Examen 2", score: 10, maxScore: 10, weight: 0.2 },
        { name: "Examen 3", score: 10, maxScore: 10, weight: 0.2 },
        { name: "Examen 4", score: 10, maxScore: 10, weight: 0.2 },
        { name: "Examen 5", score: 10, maxScore: 10, weight: 0.2 },
        { name: "Examen 6", score: 10, maxScore: 10, weight: 0.2 },
        { name: "Examen 7", score: 10, maxScore: 10, weight: 0.2 },
        { name: "Examen 8", score: 10, maxScore: 10, weight: 0.2 },
        { name: "Examen 9", score: 10, maxScore: 10, weight: 0.2 },
        { name: "Examen 10", score: 10, maxScore: 10, weight: 0.2 },
        { name: "Examen Final", score: 10, maxScore: 10, weight: 10 },
      ],
    },
  ],
};

function getGradeColor(pct) {
  if (pct >= 90) return "text-green-600";
  if (pct >= 80) return "text-emerald-600";
  if (pct >= 70) return "text-yellow-600";
  if (pct >= 60) return "text-orange-600";
  return "text-red-600";
}

function getGradeBg(pct) {
  if (pct >= 90) return "bg-green-500";
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 70) return "bg-yellow-500";
  if (pct >= 60) return "bg-orange-500";
  return "bg-red-500";
}

function getClassification(pct) {
  if (pct >= 90) return "Excelente";
  if (pct >= 80) return "Bueno";
  if (pct >= 70) return "Regular";
  if (pct >= 60) return "Deficiente";
  return "Reprobado";
}

export default function GradeCalculator() {
  const [categories, setCategories] = useState(DEFAULT_DATA.categories);
  const [collapsed, setCollapsed] = useState({});

  function updateScore(catIdx, itemIdx, value) {
    const next = structuredClone(categories);
    next[catIdx].items[itemIdx].score = value === "" ? null : Number(value);
    setCategories(next);
  }

  function updateWeight(catIdx, itemIdx, value) {
    const next = structuredClone(categories);
    next[catIdx].items[itemIdx].weight = value === "" ? 0 : Number(value);
    setCategories(next);
  }

  function updateMaxScore(catIdx, itemIdx, value) {
    const next = structuredClone(categories);
    next[catIdx].items[itemIdx].maxScore = value === "" ? 10 : Number(value);
    setCategories(next);
  }

  function addItem(catIdx) {
    const next = structuredClone(categories);
    next[catIdx].items.push({
      name: "Nuevo ítem",
      score: null,
      maxScore: 10,
      weight: 1,
    });
    setCategories(next);
  }

  function removeItem(catIdx, itemIdx) {
    const next = structuredClone(categories);
    next[catIdx].items.splice(itemIdx, 1);
    setCategories(next);
  }

  function updateItemName(catIdx, itemIdx, name) {
    const next = structuredClone(categories);
    next[catIdx].items[itemIdx].name = name;
    setCategories(next);
  }

  function toggleCollapse(catIdx) {
    setCollapsed((prev) => ({ ...prev, [catIdx]: !prev[catIdx] }));
  }

  const { totalWeighted, totalWeight, percentage, filledItems, totalItems } =
    useMemo(() => {
      let totalWeighted = 0;
      let totalWeight = 0;
      let filledItems = 0;
      let totalItems = 0;

      for (const cat of categories) {
        for (const item of cat.items) {
          totalItems++;
          if (item.score !== null && item.score !== "" && item.maxScore > 0) {
            totalWeighted += (item.score / item.maxScore) * item.weight;
            totalWeight += item.weight;
            filledItems++;
          } else {
            totalWeight += item.weight;
          }
        }
      }

      const percentage = totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 0;

      return { totalWeighted, totalWeight, percentage, filledItems, totalItems };
    }, [categories]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* Header */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-indigo-600">
          Noteffy
        </h1>
        <p className="mt-1 text-gray-500">
          Calculadora de notas por ponderación
        </p>
      </header>

      {/* Summary Card */}
      <section className="rounded-2xl bg-white p-6 shadow-lg ring-1 ring-gray-100">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-400">
              Nota ponderada
            </p>
            <p className={`text-6xl font-black ${getGradeColor(percentage)}`}>
              {percentage.toFixed(1)}
              <span className="text-2xl font-normal text-gray-400">%</span>
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-600">
              {getClassification(percentage)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-baseline gap-3 text-sm text-gray-400">
              <span>
                <span className="font-semibold text-gray-700">
                  {totalWeighted.toFixed(2)}
                </span>{" "}
                / {totalWeight.toFixed(2)} pts
              </span>
              <span>
                <span className="font-semibold text-gray-700">{filledItems}</span> /{" "}
                {totalItems} ítems
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-3 w-56 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getGradeBg(percentage)}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      {categories.map((cat, catIdx) => (
        <section
          key={catIdx}
          className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-gray-100"
        >
          {/* Category header */}
          <button
            onClick={() => toggleCollapse(catIdx)}
            className="flex w-full items-center justify-between px-6 py-4 text-left transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center gap-3">
              <span
                className={`text-xl transition-transform ${collapsed[catIdx] ? "-rotate-90" : ""}`}
              >
                ▼
              </span>
              <h2 className="text-lg font-bold text-gray-800">{cat.name}</h2>
              <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-600">
                {cat.items.length}
              </span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addItem(catIdx);
              }}
              className="rounded-lg px-3 py-1 text-sm font-medium text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              + Añadir
            </button>
          </button>

          {/* Items */}
          {!collapsed[catIdx] && (
            <div className="divide-y divide-gray-100 border-t border-gray-100">
              {/* Header row */}
              <div className="hidden items-center gap-4 px-6 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 md:flex">
                <span className="flex-1">Ítem</span>
                <span className="w-16 text-center">Nota</span>
                <span className="w-16 text-center">Máx</span>
                <span className="w-20 text-center">Peso</span>
                <span className="w-20 text-center">Aporte</span>
                <span className="w-8" />
              </div>

              {cat.items.map((item, itemIdx) => {
                const contribution =
                  item.score !== null && item.score !== "" && item.maxScore > 0
                    ? (item.score / item.maxScore) * item.weight
                    : null;

                return (
                  <div
                    key={itemIdx}
                    className="flex flex-col gap-2 px-6 py-3 md:flex-row md:items-center md:gap-4"
                  >
                    {/* Name */}
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        updateItemName(catIdx, itemIdx, e.target.value)
                      }
                      className="flex-1 rounded-lg border border-gray-200 bg-gray-50/50 px-2 py-1.5 text-sm text-gray-700 transition-colors hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:outline-none"
                    />

                    {/* Score */}
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="–"
                      value={item.score ?? ""}
                      onChange={(e) =>
                        updateScore(catIdx, itemIdx, e.target.value)
                      }
                      className="w-16 rounded-lg border border-gray-200 bg-gray-50/50 px-2 py-1.5 text-center text-sm transition-colors hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:outline-none"
                    />

                    <span className="hidden text-gray-300 md:inline">/</span>

                    {/* Max score */}
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={item.maxScore}
                      onChange={(e) =>
                        updateMaxScore(catIdx, itemIdx, e.target.value)
                      }
                      className="w-16 rounded-lg border border-gray-200 bg-gray-50/50 px-2 py-1.5 text-center text-sm transition-colors hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:outline-none"
                    />

                    {/* Weight */}
                    <input
                      type="number"
                      step="any"
                      min="0"
                      value={item.weight}
                      onChange={(e) =>
                        updateWeight(catIdx, itemIdx, e.target.value)
                      }
                      className="w-20 rounded-lg border border-gray-200 bg-gray-50/50 px-2 py-1.5 text-center text-sm transition-colors hover:border-gray-300 focus:border-indigo-400 focus:bg-white focus:outline-none"
                    />

                    {/* Contribution */}
                    <div className="w-20 text-center text-sm font-semibold text-gray-600">
                      {contribution !== null
                        ? contribution.toFixed(2)
                        : "–"}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(catIdx, itemIdx)}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      ))}

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400">
        Noteffy — calculadora de notas ponderadas en tiempo real
      </footer>
    </div>
  );
}
