/**
 * Pure query functions for in-memory exercise data.
 * All functions operate on pre-loaded arrays — no I/O.
 */
import type { Exercise } from './loader';

// ---------- Filter types ----------

export interface ExerciseFilters {
  muscle?: string;
  equipment?: string;
  level?: string;
  category?: string;
  force?: string;
  mechanics?: string;
  type?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ---------- Search ----------

/**
 * Case-insensitive substring search.
 * Name matches are ranked before instruction-only matches.
 */
export function searchExercises(exercises: Exercise[], query: string): Exercise[] {
  const q = query.toLowerCase();

  const nameMatches: Exercise[] = [];
  const instructionMatches: Exercise[] = [];

  for (const ex of exercises) {
    if (ex.name && ex.name.toLowerCase().includes(q)) {
      nameMatches.push(ex);
    } else if (
      ex.instructions &&
      ex.instructions.some((inst) => inst.toLowerCase().includes(q))
    ) {
      instructionMatches.push(ex);
    }
  }

  return [...nameMatches, ...instructionMatches];
}

// ---------- Filter ----------

export function filterExercises(exercises: Exercise[], filters: ExerciseFilters): Exercise[] {
  let result = exercises;

  if (filters.muscle) {
    const slug = filters.muscle.toLowerCase();
    result = result.filter((ex) =>
      ex.muscleGroups.some((mg) => mg.slug.toLowerCase() === slug)
    );
  }

  if (filters.equipment) {
    const name = filters.equipment.toLowerCase();
    result = result.filter((ex) =>
      ex.equipment.some((eq) => eq.name && eq.name.toLowerCase() === name)
    );
  }

  if (filters.level) {
    const level = filters.level.toLowerCase();
    result = result.filter(
      (ex) => ex.difficultyLevel && ex.difficultyLevel.toLowerCase() === level
    );
  }

  if (filters.category) {
    const cat = filters.category.toLowerCase();
    result = result.filter(
      (ex) => ex.category && ex.category.toLowerCase() === cat
    );
  }

  if (filters.force) {
    const force = filters.force.toLowerCase();
    result = result.filter(
      (ex) => ex.forceType && ex.forceType.toLowerCase() === force
    );
  }

  if (filters.mechanics) {
    const mech = filters.mechanics.toLowerCase();
    result = result.filter(
      (ex) => ex.mechanics && ex.mechanics.toLowerCase() === mech
    );
  }

  if (filters.type) {
    const type = filters.type.toLowerCase();
    result = result.filter((ex) => ex.type.toLowerCase() === type);
  }

  return result;
}

// ---------- Paginate ----------

export function paginate<T>(
  data: T[],
  page: number,
  limit: number
): PaginatedResult<T> {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(Math.max(1, limit), 200);
  const start = (safePage - 1) * safeLimit;

  return {
    data: data.slice(start, start + safeLimit),
    total: data.length,
    page: safePage,
    limit: safeLimit,
  };
}

// ---------- Derivation helpers ----------

export function deriveUniqueValues(
  exercises: Exercise[],
  key: keyof Exercise
): string[] {
  const set = new Set<string>();
  for (const ex of exercises) {
    const val = ex[key];
    if (typeof val === 'string') set.add(val);
  }
  return [...set].sort();
}
