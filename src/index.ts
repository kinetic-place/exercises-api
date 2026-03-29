import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  ENVIRONMENT: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS
app.use('*', cors());

// Health check
app.get('/', (c) => {
  return c.json({
    name: 'Kinetic.place API',
    version: '0.1.0',
    docs: 'https://docs.kinetic.place',
    status: 'ok',
  });
});

// V1 routes placeholder
app.get('/v1/exercises', (c) => {
  return c.json({
    data: [
      {
        id: 'barbell-bench-press',
        name: 'Barbell Bench Press',
        slug: 'barbell-bench-press',
        category: 'strength',
        force: 'push',
        level: 'intermediate',
        mechanic: 'compound',
        equipment: ['barbell', 'flat-bench'],
        primaryMuscles: ['chest'],
        secondaryMuscles: ['triceps', 'anterior-deltoid'],
        premiumContentAvailable: true,
      },
    ],
    total: 1,
    page: 1,
    limit: 50,
  });
});

app.get('/v1/exercises/:id', (c) => {
  const id = c.req.param('id');
  return c.json({
    id,
    name: 'Barbell Bench Press',
    slug: 'barbell-bench-press',
    category: 'strength',
    force: 'push',
    level: 'intermediate',
    mechanic: 'compound',
    equipment: ['barbell', 'flat-bench'],
    primaryMuscles: ['chest'],
    secondaryMuscles: ['triceps', 'anterior-deltoid'],
    instructions: [
      'Lie back on a flat bench.',
      'Using a medium width grip, lift the bar from the rack and hold it straight over you with your arms locked.',
      'Lower the bar slowly until it touches your middle chest.',
      'Push the bar back to the starting position as you breathe out.',
    ],
    tips: [
      'Keep your feet flat on the floor.',
      'Maintain a slight arch in your lower back.',
      'Do not bounce the bar off your chest.',
    ],
    premiumContentAvailable: true,
    videos: {
      preview: `https://cdn.kinetic.place/previews/${id}.mp4`,
    },
  });
});

app.get('/v1/muscles', (c) => {
  return c.json({
    data: [
      'chest', 'back', 'shoulders', 'biceps', 'triceps', 'forearms',
      'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs', 'obliques',
      'traps', 'lats', 'lower-back', 'hip-flexors', 'adductors', 'abductors',
    ],
  });
});

app.get('/v1/equipment', (c) => {
  return c.json({
    data: [
      'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine',
      'bodyweight', 'resistance-band', 'medicine-ball', 'flat-bench',
      'incline-bench', 'pull-up-bar', 'foam-roller', 'stability-ball',
    ],
  });
});

app.get('/v1/categories', (c) => {
  return c.json({
    data: ['strength', 'cardio', 'flexibility', 'balance', 'plyometrics', 'olympic'],
  });
});

export default app;
