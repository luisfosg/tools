import { useState, useMemo, useEffect, useRef } from "react";
import { Toaster, sileo } from "sileo";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ConfirmDialog from "./ConfirmDialog.tsx";

const STORAGE_KEY = "noteffy-data";

const DEFAULT_CATEGORIES = [
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
];

function makeSubject(name, categories = []) {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `subj-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    name,
    categories,
    collapsed: {},
  };
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed.subjects) && parsed.subjects.length > 0) {
      return parsed;
    }
    if (parsed.categories) {
      const subject = makeSubject("Asignatura 1", parsed.categories);
      subject.collapsed = parsed.collapsed ?? {};
      return { subjects: [subject], activeId: subject.id };
    }
  } catch {
    /* ignore corrupt data */
  }
  return null;
}

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

/* ── dnd-kit ID helpers ── */
const sectionId = (idx) => `section-${idx}`;
const itemId = (catIdx, itemIdx) => `section-${catIdx}-item-${itemIdx}`;
const isSectionId = (id) =>
  String(id).startsWith("section-") && !String(id).includes("-item-");
const isItemId = (id) => String(id).includes("-item-");
const parseSectionId = (id) => parseInt(String(id).split("-")[1], 10);
const parseItemId = (id) => {
  const p = String(id).split("-");
  return [parseInt(p[1], 10), parseInt(p[3], 10)];
};

export default function GradeCalculator() {
  const [initial] = useState(() => {
    const saved = loadFromStorage();
    const subjects = saved?.subjects ?? [
      makeSubject("Asignatura 1", structuredClone(DEFAULT_CATEGORIES)),
    ];
    const activeId = subjects.some((s) => s.id === saved?.activeId)
      ? saved.activeId
      : subjects[0].id;
    return { subjects, activeId };
  });
  const [subjects, setSubjects] = useState(initial.subjects);
  const [currentSubjectId, setCurrentSubjectId] = useState(initial.activeId);
  const saveTimer = useRef(null);

  const currentIdx = Math.max(
    0,
    subjects.findIndex((s) => s.id === currentSubjectId),
  );
  const currentSubject = subjects[currentIdx];
  const categories = currentSubject.categories;
  const collapsed = currentSubject.collapsed;

  /* Persist to localStorage on every change (debounced) */
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ subjects, activeId: currentSubjectId }),
      );
    }, 600);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [subjects, currentSubjectId]);

  function commit(nextCategories, nextCollapsed = collapsed) {
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === currentSubject.id
          ? { ...s, categories: nextCategories, collapsed: nextCollapsed }
          : s,
      ),
    );
  }

  function addSubject() {
    const subject = makeSubject(`Asignatura ${subjects.length + 1}`);
    setSubjects((prev) => [...prev, subject]);
    setCurrentSubjectId(subject.id);
    sileo.success({ title: "Asignatura creada", description: subject.name });
  }

  function duplicateSubject(subject) {
    const copy = makeSubject(
      `${subject.name || "Sin nombre"} (copia)`,
      structuredClone(subject.categories),
    );
    setSubjects((prev) => {
      const idx = prev.findIndex((s) => s.id === subject.id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setCurrentSubjectId(copy.id);
    sileo.success({ title: "Asignatura duplicada", description: copy.name });
  }

  function updateSubjectName(name) {
    setSubjects((prev) =>
      prev.map((s) => (s.id === currentSubject.id ? { ...s, name } : s)),
    );
  }

  function removeSubject(subject) {
    const next = subjects.filter((s) => s.id !== subject.id);
    if (next.length === 0) {
      const fresh = makeSubject("Asignatura 1");
      setSubjects([fresh]);
      setCurrentSubjectId(fresh.id);
    } else {
      setSubjects(next);
      if (subject.id === currentSubjectId) setCurrentSubjectId(next[0].id);
    }
    sileo.info({ title: "Asignatura eliminada", description: subject.name });
  }

  function updateScore(catIdx, itemIdx, value) {
    const next = structuredClone(categories);
    const maxScore = next[catIdx].items[itemIdx].maxScore;
    next[catIdx].items[itemIdx].score =
      value === "" ? null : Math.min(Number(value), maxScore);
    commit(next);
  }

  function updateWeight(catIdx, itemIdx, value) {
    const next = structuredClone(categories);
    next[catIdx].items[itemIdx].weight = value === "" ? 0 : Number(value);
    commit(next);
  }

  function updateMaxScore(catIdx, itemIdx, value) {
    const next = structuredClone(categories);
    const newMax = value === "" ? 10 : Number(value);
    next[catIdx].items[itemIdx].maxScore = newMax;
    if (next[catIdx].items[itemIdx].score !== null) {
      next[catIdx].items[itemIdx].score = Math.min(
        next[catIdx].items[itemIdx].score,
        newMax,
      );
    }
    commit(next);
  }

  function addItem(catIdx) {
    const next = structuredClone(categories);
    next[catIdx].items.push({
      name: "Nuevo ítem",
      score: null,
      maxScore: 10,
      weight: 1,
    });
    commit(next);
    sileo.success({
      title: "Ítem agregado",
      description: `en ${next[catIdx].name}`,
    });
  }

  function removeItem(catIdx, itemIdx) {
    const item = categories[catIdx].items[itemIdx];
    const next = structuredClone(categories);
    next[catIdx].items.splice(itemIdx, 1);
    commit(next);
    sileo.info({ title: "Ítem eliminado", description: item.name });
  }

  function updateItemName(catIdx, itemIdx, name) {
    const next = structuredClone(categories);
    next[catIdx].items[itemIdx].name = name;
    commit(next);
  }

  function resetToDefaults() {
    commit(structuredClone(DEFAULT_CATEGORIES), {});
    sileo.success({
      title: "Restablecido",
      description: "Valores por defecto restaurados",
    });
  }

  function addCategory() {
    const next = structuredClone(categories);
    next.push({
      name: "Nueva sección",
      items: [{ name: "Ítem 1", score: null, maxScore: 10, weight: 1 }],
    });
    commit(next);
    sileo.success({ title: "Sección agregada" });
  }

  function removeCategory(catIdx) {
    const name = categories[catIdx].name;
    const next = structuredClone(categories);
    next.splice(catIdx, 1);
    commit(next);
    sileo.info({ title: "Sección eliminada", description: name });
  }

  function updateCategoryName(catIdx, name) {
    const next = structuredClone(categories);
    next[catIdx].name = name;
    commit(next);
  }

  function toggleCollapse(catIdx) {
    commit(categories, { ...collapsed, [catIdx]: !collapsed[catIdx] });
  }

  /* ── dnd-kit ── */
  const [draggingId, setDraggingId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
  );

  function handleDragStart(event) {
    setDraggingId(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      setDraggingId(null);
      return;
    }

    const aId = String(active.id);
    const oId = String(over.id);
    let next = null;

    if (isSectionId(aId) && isSectionId(oId)) {
      const oldIdx = parseSectionId(aId);
      const newIdx = parseSectionId(oId);
      if (oldIdx !== newIdx) next = arrayMove(categories, oldIdx, newIdx);
    } else if (isItemId(aId)) {
      const [aCatIdx, aItemIdx] = parseItemId(aId);

      let oCatIdx, oItemIdx;
      if (isItemId(oId)) {
        [oCatIdx, oItemIdx] = parseItemId(oId);
      } else if (isSectionId(oId)) {
        oCatIdx = parseSectionId(oId);
        oItemIdx = categories[oCatIdx]?.items.length ?? 0;
      }

      if (aCatIdx !== undefined && oCatIdx !== undefined) {
        next = structuredClone(categories);

        if (aCatIdx === oCatIdx) {
          next[aCatIdx].items = arrayMove(
            next[aCatIdx].items,
            aItemIdx,
            oItemIdx,
          );
        } else {
          const [item] = next[aCatIdx].items.splice(aItemIdx, 1);
          if (item) {
            next[oCatIdx].items.splice(oItemIdx, 0, item);
          } else {
            next = null;
          }
        }
      }
    }

    if (next) commit(next);
    setDraggingId(null);
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
            totalWeighted +=
              Math.min(item.score / item.maxScore, 1) * item.weight;
            totalWeight += item.weight;
            filledItems++;
          } else {
            totalWeight += item.weight;
          }
        }
      }

      const percentage =
        totalWeight > 0 ? (totalWeighted / totalWeight) * 100 : 0;

      return {
        totalWeighted,
        totalWeight,
        percentage,
        filledItems,
        totalItems,
      };
    }, [categories]);

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <Toaster position="top-right" theme="system" />

      {/* Header */}
      <header className="text-center">
        <h1 className="text-5xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
          Noteffy
        </h1>
        <p className="mt-1 text-gray-500 dark:text-gray-400">
          Calculadora de notas por ponderación
        </p>
      </header>

      {/* Subjects */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1">
        {subjects.map((s) => (
          <button
            key={s.id}
            onClick={() => setCurrentSubjectId(s.id)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
              s.id === currentSubjectId
                ? "bg-indigo-600 text-white shadow-md"
                : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700 hover:text-indigo-600 dark:hover:text-indigo-400 hover:ring-indigo-300 dark:hover:ring-indigo-600"
            }`}
          >
            {s.name || "Sin nombre"}
          </button>
        ))}
        <button
          onClick={addSubject}
          className="shrink-0 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700 px-4 py-2 text-sm font-semibold text-gray-400 dark:text-gray-500 transition-colors hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-400"
        >
          + Asignatura
        </button>
      </div>

      {/* Summary Card */}
      <section className="rounded-2xl bg-white dark:bg-gray-900 p-6 shadow-lg ring-1 ring-gray-100 dark:ring-gray-800">
        <div className="mb-5 flex items-center justify-between gap-3 border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Asignatura
            </p>
            <input
              type="text"
              value={currentSubject.name}
              onChange={(e) => updateSubjectName(e.target.value)}
              placeholder="Nombre de la asignatura"
              className="w-full rounded-lg border border-transparent bg-transparent px-1 py-0.5 text-xl font-bold text-gray-800 dark:text-gray-100 transition-colors hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-800 focus:outline-none"
            />
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={() => duplicateSubject(currentSubject)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 dark:text-gray-500 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:text-indigo-500"
              title="Duplicar asignatura"
            >
              <CopyIcon />
            </button>
            <ConfirmDialog
              title="Eliminar asignatura"
              description={`¿Eliminar la asignatura "${currentSubject.name}" y todas sus secciones?`}
              confirmLabel="Eliminar"
              onConfirm={() => removeSubject(currentSubject)}
              trigger={
                <button
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-gray-300 dark:text-gray-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
                  title="Eliminar asignatura"
                >
                  ✕
                </button>
              }
            />
          </div>
        </div>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <div className="text-center sm:text-left">
            <p className="text-sm font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
              Nota ponderada
            </p>
            <p className={`text-6xl font-black ${getGradeColor(percentage)}`}>
              {percentage.toFixed(1)}
              <span className="text-2xl font-normal text-gray-400 dark:text-gray-500">
                %
              </span>
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-600 dark:text-gray-400">
              {getClassification(percentage)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-baseline gap-3 text-sm text-gray-400 dark:text-gray-500">
              <span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {totalWeighted.toFixed(2)}
                </span>{" "}
                / {totalWeight.toFixed(2)} pts
              </span>
              <span>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  {filledItems}
                </span>{" "}
                / {totalItems} ítems
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-3 w-56 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getGradeBg(percentage)}`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={categories.map((_, i) => sectionId(i))}
          strategy={verticalListSortingStrategy}
        >
          {categories.map((cat, catIdx) => (
            <SortableSection key={sectionId(catIdx)} id={sectionId(catIdx)}>
              {/* Category header */}
              <div className="flex w-full items-center justify-between gap-3 px-6 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <div className="flex shrink-0 items-center gap-1.5">
                  <GripIcon />
                  <button
                    onClick={() => toggleCollapse(catIdx)}
                    className="flex items-center gap-1.5 text-left"
                  >
                    <span
                      className={`text-xl transition-transform ${collapsed[catIdx] ? "-rotate-90" : ""}`}
                    >
                      ▼
                    </span>
                    <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                      {cat.items.length}
                    </span>
                  </button>
                </div>
                <input
                  type="text"
                  value={cat.name}
                  onChange={(e) => updateCategoryName(catIdx, e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-1 py-1 text-lg font-bold text-gray-800 dark:text-gray-100 transition-colors hover:border-gray-200 dark:hover:border-gray-700 focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-800 focus:outline-none"
                />
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addItem(catIdx);
                    }}
                    className="rounded-lg px-3 py-1 text-sm font-medium text-indigo-600 dark:text-indigo-400 transition-colors hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                  >
                    + Añadir
                  </button>
                  <ConfirmDialog
                    title="Eliminar sección"
                    description={`¿Eliminar la sección "${cat.name}" y todos sus ítems?`}
                    confirmLabel="Eliminar"
                    onConfirm={() => removeCategory(catIdx)}
                    trigger={
                      <button
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 dark:text-gray-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
                        title="Eliminar sección"
                      >
                        ✕
                      </button>
                    }
                  />
                </div>
              </div>

              {/* Items */}
              {!collapsed[catIdx] && (
                <div className="divide-y divide-gray-100 dark:divide-gray-800 border-t border-gray-100 dark:border-gray-800">
                  {/* Header row */}
                  <div className="hidden items-center gap-4 px-6 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 md:flex">
                    <span className="w-6" />
                    <span className="flex-1">Ítem</span>
                    <span className="w-16 text-center">Nota</span>
                    <span className="w-16 text-center">Máx</span>
                    <span className="w-20 text-center">Peso</span>
                    <span className="w-20 text-center">Aporte</span>
                    <span className="w-8" />
                  </div>

                  <SortableContext
                    items={cat.items.map((_, j) => itemId(catIdx, j))}
                    strategy={verticalListSortingStrategy}
                  >
                    {cat.items.map((item, itemIdx) => (
                      <SortableItemRow
                        key={itemId(catIdx, itemIdx)}
                        id={itemId(catIdx, itemIdx)}
                        catIdx={catIdx}
                        itemIdx={itemIdx}
                        item={item}
                        onUpdateScore={updateScore}
                        onUpdateWeight={updateWeight}
                        onUpdateMaxScore={updateMaxScore}
                        onUpdateName={updateItemName}
                        onRemove={removeItem}
                      />
                    ))}
                  </SortableContext>
                </div>
              )}
            </SortableSection>
          ))}
        </SortableContext>

        <DragOverlay>
          {draggingId ? (
            <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-xl ring-1 ring-gray-200 dark:ring-gray-700">
              <div className="flex items-center gap-3 px-6 py-3">
                <GripIcon />
                <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add section + Reset */}
      <div className="flex items-center justify-center gap-4">
        <button
          onClick={addCategory}
          className="inline-flex items-center gap-2 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 px-6 py-3 text-sm font-semibold text-gray-400 dark:text-gray-500 transition-colors hover:border-indigo-300 dark:hover:border-indigo-600 hover:text-indigo-500 dark:hover:text-indigo-400"
        >
          + Agregar sección
        </button>
        <ConfirmDialog
          title="Restablecer valores"
          description="Se van a eliminar los datos de la asignatura actual y se restaurarán los valores por defecto."
          confirmLabel="Restablecer"
          variant="default"
          onConfirm={resetToDefaults}
          trigger={
            <button className="rounded-lg px-4 py-3 text-sm font-semibold text-gray-400 dark:text-gray-500 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-400">
              Restablecer
            </button>
          }
        />
      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-400 dark:text-gray-500">
        Noteffy — calculadora de notas ponderadas en tiempo real
      </footer>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Sub-components
   ───────────────────────────────────────────── */

function SortableSection({ id, children }) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    listeners,
    attributes,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <section
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-lg ring-1 ring-gray-100 dark:ring-gray-800 ${isDragging ? "opacity-50" : ""}`}
    >
      {children}
    </section>
  );
}

function SortableItemRow({
  id,
  catIdx,
  itemIdx,
  item,
  onUpdateScore,
  onUpdateWeight,
  onUpdateMaxScore,
  onUpdateName,
  onRemove,
}) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    listeners,
    attributes,
  } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const contribution =
    item.score !== null && item.score !== "" && item.maxScore > 0
      ? Math.min(item.score / item.maxScore, 1) * item.weight
      : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col gap-2 px-6 py-3 md:flex-row md:items-center md:gap-4 ${isDragging ? "opacity-50" : ""}`}
    >
      <button
        ref={setActivatorNodeRef}
        {...listeners}
        {...attributes}
        className="flex shrink-0 cursor-grab items-center text-gray-300 dark:text-gray-500 transition-colors hover:text-gray-500 dark:hover:text-gray-400 active:cursor-grabbing"
        title="Arrastrar"
      >
        <GripIcon />
      </button>

      <input
        type="text"
        value={item.name}
        onChange={(e) => onUpdateName(catIdx, itemIdx, e.target.value)}
        className="flex-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-300 transition-colors hover:border-gray-300 dark:hover:border-gray-600 focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-800 focus:outline-none"
      />

      <input
        type="number"
        step="any"
        min="0"
        max={item.maxScore}
        placeholder="–"
        value={item.score ?? ""}
        onChange={(e) => onUpdateScore(catIdx, itemIdx, e.target.value)}
        className="w-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-2 py-1.5 text-center text-sm transition-colors hover:border-gray-300 dark:hover:border-gray-600 focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-800 focus:outline-none"
      />

      <span className="hidden text-gray-300 dark:text-gray-500 md:inline">
        /
      </span>

      <input
        type="number"
        step="any"
        min="0"
        value={item.maxScore}
        onChange={(e) => onUpdateMaxScore(catIdx, itemIdx, e.target.value)}
        className="w-16 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-2 py-1.5 text-center text-sm transition-colors hover:border-gray-300 dark:hover:border-gray-600 focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-800 focus:outline-none"
      />

      <input
        type="number"
        step="any"
        min="0"
        value={item.weight}
        onChange={(e) => onUpdateWeight(catIdx, itemIdx, e.target.value)}
        className="w-20 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 px-2 py-1.5 text-center text-sm transition-colors hover:border-gray-300 dark:hover:border-gray-600 focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-800 focus:outline-none"
      />

      <div className="w-20 text-center text-sm font-semibold text-gray-600 dark:text-gray-400">
        {contribution !== null ? contribution.toFixed(2) : "–"}
      </div>

      <button
        onClick={() => onRemove(catIdx, itemIdx)}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-300 dark:text-gray-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500"
        title="Eliminar"
      >
        ✕
      </button>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
    </svg>
  );
}

function GripIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 16 16"
      fill="currentColor"
      className="h-4 w-4"
    >
      <circle cx="5" cy="3" r="1.2" />
      <circle cx="11" cy="3" r="1.2" />
      <circle cx="5" cy="8" r="1.2" />
      <circle cx="11" cy="8" r="1.2" />
      <circle cx="5" cy="13" r="1.2" />
      <circle cx="11" cy="13" r="1.2" />
    </svg>
  );
}
