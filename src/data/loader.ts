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
  family: string | null;
}

export interface ExerciseEquipment extends Equipment {
  numItems: number | null;
}

export interface Exercise {
  id: string;
  name: string | null;
  slug: string | null;
  type: string;
  difficultyLevel: string | null;
  forceType: string | null;
  mechanics: string | null;
  category: string | null;
  instructions: string[] | null;
  muscleGroups: ExerciseMuscleGroup[];
  equipment: ExerciseEquipment[];
  youtube: YouTubeVideo | null;
}

/** A YouTube video of the exercise, with the title, channel and thumbnail YouTube gives for it. */
export interface YouTubeVideo {
  url: string;
  videoId: string;
  title: string;
  channel: string;
  channelUrl: string;
  thumbnailUrl: string;
}

/** Another exercise a guide points to, and why it fits. */
export interface ExerciseLink {
  exerciseId: string;
  name: string | null;
  reason: string;
}

/** How to do one exercise, in one language (`<lang>/guides.json`). */
export interface ExerciseGuide {
  exerciseId: string;
  summary: string;
  whyItWorks: string;
  setup: string[];
  execution: string[];
  formCues: string[];
  breathing: string | null;
  commonMistakes: { mistake: string; correction: string }[];
  programmingNotes: string[];
  safetyNotes: string[];
  faq: { question: string; answer: string }[];
  alternatives: ExerciseLink[];
  easierVariations: ExerciseLink[];
  harderVariations: ExerciseLink[];
}

// ---------- Languages ----------

export const LANGS = ['en', 'es'] as const;
export type Lang = (typeof LANGS)[number];

/** The `lang` query parameter: English when absent, null when it isn't one of LANGS. */
export function parseLang(value: string | undefined): Lang | null {
  if (!value) return 'en';
  const lang = value.toLowerCase();
  return (LANGS as readonly string[]).includes(lang) ? (lang as Lang) : null;
}

// ---------- Cache ----------

const cache = {
  exercises: null as Exercise[] | null,
  equipment: null as Equipment[] | null,
  muscleGroups: null as MuscleGroup[] | null,
  guides: new Map<Lang, Map<string, ExerciseGuide>>(),
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

/** One language's guides, by exercise ID. Not every exercise has one. */
export async function getGuides(bucket: R2Bucket, lang: Lang): Promise<Map<string, ExerciseGuide>> {
  let guides = cache.guides.get(lang);
  if (!guides) {
    const list = await loadJson<ExerciseGuide[]>(bucket, `${lang}/guides.json`);
    guides = new Map(list.map((guide) => [guide.exerciseId, guide]));
    cache.guides.set(lang, guides);
  }
  return guides;
}
