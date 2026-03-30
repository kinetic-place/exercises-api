/**
 * R2 data loader with in-memory caching.
 *
 * On first request the Worker fetches JSON from R2 and parses it.
 * Subsequent requests reuse the cached arrays for the lifetime of
 * the Worker isolate (typically minutes on Cloudflare).
 */

// ---------- Types (mirror exercises-core) ----------

export interface MuscleGroup {
  id: string;
  slug: string;
  name: string | null;
}

export interface ExerciseMuscleGroup extends MuscleGroup {
  type: 'primary' | 'secondary' | 'tertiary' | null;
}

export interface Equipment {
  id: string;
  name: string | null;
  type: string;
  usageType: string | null;
}

export interface ExerciseEquipment extends Equipment {
  numItems: number | null;
}

export interface Exercise {
  id: string;
  name: string | null;
  type: string;
  difficultyLevel: string | null;
  forceType: string | null;
  mechanics: string | null;
  category: string | null;
  instructions: string[] | null;
  muscleGroups: ExerciseMuscleGroup[];
  equipment: ExerciseEquipment[];
}

// ---------- Cache ----------

const cache = {
  exercises: null as Exercise[] | null,
  equipment: null as Equipment[] | null,
  muscleGroups: null as MuscleGroup[] | null,
};

// ---------- Loaders ----------

async function loadJson<T>(bucket: R2Bucket, key: string): Promise<T> {
  const obj = await bucket.get(key);
  if (!obj) {
    throw new Error(`R2 object not found: ${key}. Did you run 'yarn seed'?`);
  }
  return obj.json<T>();
}

export async function getExercises(bucket: R2Bucket): Promise<Exercise[]> {
  if (!cache.exercises) {
    cache.exercises = await loadJson<Exercise[]>(bucket, 'en/exercises.json');
  }
  return cache.exercises;
}

export async function getEquipment(bucket: R2Bucket): Promise<Equipment[]> {
  if (!cache.equipment) {
    cache.equipment = await loadJson<Equipment[]>(bucket, 'en/equipment.json');
  }
  return cache.equipment;
}

export async function getMuscleGroups(bucket: R2Bucket): Promise<MuscleGroup[]> {
  if (!cache.muscleGroups) {
    cache.muscleGroups = await loadJson<MuscleGroup[]>(bucket, 'en/muscle_groups.json');
  }
  return cache.muscleGroups;
}
