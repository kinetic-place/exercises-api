import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { getExercises, getEquipment, getMuscleGroups } from './data/loader';
import {
  searchExercises,
  filterExercises,
  paginate,
  deriveUniqueValues,
  type ExerciseFilters,
} from './data/query';

type Bindings = {
  ENVIRONMENT: string;
  EXERCISES_BUCKET: R2Bucket;
};

const app = new Hono<{ Bindings: Bindings }>();

// ---------- Middleware ----------

app.use('*', cors());

// ---------- Health ----------

app.get('/', async (c) => {
  let exerciseCount = 0;
  try {
    const exercises = await getExercises(c.env.EXERCISES_BUCKET);
    exerciseCount = exercises.length;
  } catch {
    // bucket may not be seeded yet
  }

  return c.json({
    name: 'Kinetic.place Exercises API',
    version: '0.1.0',
    status: 'ok',
    exercises: exerciseCount,
    docs: 'https://github.com/kinetic-place/exercises-api',
    website: 'https://kinetic.place',
  });
});

// ---------- Exercises: list / search / filter ----------

app.get('/v1/exercises', async (c) => {
  const bucket = c.env.EXERCISES_BUCKET;

  try {
    let exercises = await getExercises(bucket);

    // Search (applied first)
    const q = c.req.query('q');
    if (q) {
      exercises = searchExercises(exercises, q);
    }

    // Filters
    const filters: ExerciseFilters = {
      muscle: c.req.query('muscle'),
      equipment: c.req.query('equipment'),
      level: c.req.query('level'),
      category: c.req.query('category'),
      force: c.req.query('force'),
      mechanics: c.req.query('mechanics'),
      type: c.req.query('type'),
    };

    // Remove undefined keys
    for (const key of Object.keys(filters) as (keyof ExerciseFilters)[]) {
      if (!filters[key]) delete filters[key];
    }

    if (Object.keys(filters).length > 0) {
      exercises = filterExercises(exercises, filters);
    }

    // Paginate
    const page = parseInt(c.req.query('page') || '1', 10);
    const limit = parseInt(c.req.query('limit') || '50', 10);
    const result = paginate(exercises, page, limit);

    c.header('X-Total-Count', String(result.total));
    return c.json(result);
  } catch (err: any) {
    return c.json({ error: err.message, status: 500 }, 500);
  }
});

// ---------- Exercises: get by ID ----------

app.get('/v1/exercises/:id', async (c) => {
  const id = c.req.param('id');
  const bucket = c.env.EXERCISES_BUCKET;

  try {
    const exercises = await getExercises(bucket);
    const exercise = exercises.find((ex) => ex.id === id);

    if (!exercise) {
      return c.json({ error: 'Exercise not found', status: 404 }, 404);
    }

    return c.json(exercise);
  } catch (err: any) {
    return c.json({ error: err.message, status: 500 }, 500);
  }
});

// ---------- Muscle Groups ----------

app.get('/v1/muscles', async (c) => {
  const bucket = c.env.EXERCISES_BUCKET;

  try {
    const muscleGroups = await getMuscleGroups(bucket);
    return c.json({ data: muscleGroups, total: muscleGroups.length });
  } catch (err: any) {
    return c.json({ error: err.message, status: 500 }, 500);
  }
});

// ---------- Equipment ----------

app.get('/v1/equipment', async (c) => {
  const bucket = c.env.EXERCISES_BUCKET;

  try {
    const equipment = await getEquipment(bucket);
    return c.json({ data: equipment, total: equipment.length });
  } catch (err: any) {
    return c.json({ error: err.message, status: 500 }, 500);
  }
});

// ---------- Categories ----------

app.get('/v1/categories', async (c) => {
  const bucket = c.env.EXERCISES_BUCKET;

  try {
    const exercises = await getExercises(bucket);
    const categories = deriveUniqueValues(exercises, 'category');
    return c.json({ data: categories, total: categories.length });
  } catch (err: any) {
    return c.json({ error: err.message, status: 500 }, 500);
  }
});

// ---------- Difficulty Levels ----------

app.get('/v1/levels', async (c) => {
  const bucket = c.env.EXERCISES_BUCKET;

  try {
    const exercises = await getExercises(bucket);
    const levels = deriveUniqueValues(exercises, 'difficultyLevel');
    return c.json({ data: levels, total: levels.length });
  } catch (err: any) {
    return c.json({ error: err.message, status: 500 }, 500);
  }
});

export default app;
