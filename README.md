<p align="center">
  <a href="https://kinetic.place">
    <img src="https://kinetic.place/images/kinetic-logo-animated.gif" alt="Kinetic.place" width="400" />
  </a>
</p>

# @kinetic-place/exercises-api

A self-hostable REST API for the [Kinetic.place](https://kinetic.place) exercise dataset. **899+ exercises** with search, filtering, and pagination — deploy to your own Cloudflare Workers in minutes.

[![MIT License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Cloudflare Workers](https://img.shields.io/badge/runs%20on-Cloudflare%20Workers-orange.svg)](https://workers.cloudflare.com)

> **Don't want to self-host?** Skip the setup entirely — use the free hosted instance at `https://api.kinetic.place`. Same API, zero configuration.

## Quick Start

```bash
# Clone and install
git clone https://github.com/kinetic-place/exercises-api.git
cd exercises-api
npm install

# Seed local R2 with exercise data
npm run seed

# Start the dev server
npm run dev
# → http://localhost:8787
```

## Base URL

```
Local dev:   http://localhost:8787
```

## Endpoints

### `GET /`

Health check with dataset stats.

```bash
curl http://localhost:8787/
```

```json
{
  "name": "Kinetic.place Exercises API",
  "version": "0.1.0",
  "status": "ok",
  "exercises": 899,
  "docs": "https://github.com/kinetic-place/exercises-api",
  "website": "https://kinetic.place"
}
```

---

### `GET /v1/exercises`

List, search, and filter exercises with pagination.

#### Query Parameters

| Parameter   | Type   | Default | Description                                                 |
| ----------- | ------ | ------- | ----------------------------------------------------------- |
| `q`         | string | —       | Search exercises by name and instructions                   |
| `muscle`    | string | —       | Filter by muscle group slug (e.g. `chest`)                  |
| `equipment` | string | —       | Filter by equipment name (e.g. `barbell`)                   |
| `level`     | string | —       | Filter by difficulty (`beginner`, `intermediate`, `expert`) |
| `category`  | string | —       | Filter by category (e.g. `strength`, `cardio`)              |
| `force`     | string | —       | Filter by force type (`push`, `pull`, `static`)             |
| `mechanics` | string | —       | Filter by mechanics (`compound`, `isolation`)               |
| `type`      | string | —       | Filter by exercise type (e.g. `reps`)                       |
| `page`      | number | 1       | Page number                                                 |
| `limit`     | number | 50      | Results per page (max 200)                                  |

#### Examples

```bash
# All exercises (paginated)
curl "http://localhost:8787/v1/exercises"

# Search by name
curl "http://localhost:8787/v1/exercises?q=bench+press"

# Filter by muscle group
curl "http://localhost:8787/v1/exercises?muscle=chest"

# Filter by equipment
curl "http://localhost:8787/v1/exercises?equipment=dumbbell"

# Combined filters
curl "http://localhost:8787/v1/exercises?muscle=chest&equipment=dumbbell&level=beginner"

# Search + filter
curl "http://localhost:8787/v1/exercises?q=curl&muscle=biceps"

# Pagination
curl "http://localhost:8787/v1/exercises?page=2&limit=10"
```

#### Response

```json
{
  "data": [
    {
      "id": "d586b5aa-c2f4-4cb5-8038-d10b03c3b763",
      "name": "Barbell Bench Press",
      "type": "reps",
      "difficultyLevel": "intermediate",
      "forceType": "push",
      "mechanics": "compound",
      "category": "strength",
      "instructions": [
        "Lie flat on a bench with your feet planted firmly on the floor...",
        "As you breathe in, slowly lower the bar to your mid-chest..."
      ],
      "muscleGroups": [
        { "id": "...", "slug": "chest", "name": "Chest", "type": "primary" },
        { "id": "...", "slug": "triceps", "name": "Triceps", "type": "primary" },
        { "id": "...", "slug": "shoulders", "name": "Shoulders", "type": "primary" }
      ],
      "equipment": [
        {
          "id": "...",
          "name": "Barbell",
          "type": "weight",
          "usageType": "single",
          "numItems": null
        }
      ]
    }
  ],
  "total": 899,
  "page": 1,
  "limit": 50
}
```

---

### `GET /v1/exercises/:id`

Get a single exercise by UUID.

```bash
curl "http://localhost:8787/v1/exercises/d586b5aa-c2f4-4cb5-8038-d10b03c3b763"
```

Returns the full exercise object (same shape as items in the list response). Returns `404` if not found.

---

### `GET /v1/muscles`

List all muscle groups.

```bash
curl "http://localhost:8787/v1/muscles"
```

```json
{
  "data": [
    { "id": "...", "slug": "chest", "name": "Chest" },
    { "id": "...", "slug": "biceps", "name": "Biceps" }
  ],
  "total": 17
}
```

---

### `GET /v1/equipment`

List all equipment types.

```bash
curl "http://localhost:8787/v1/equipment"
```

```json
{
  "data": [
    { "id": "...", "name": "Barbell", "type": "weight", "usageType": "single" },
    { "id": "...", "name": "Dumbbell", "type": "weight", "usageType": "double" }
  ],
  "total": 36
}
```

---

### `GET /v1/categories`

List all exercise categories.

```bash
curl "http://localhost:8787/v1/categories"
```

```json
{
  "data": [
    "cardio",
    "olympicWeightlifting",
    "plyometrics",
    "powerlifting",
    "strength",
    "stretching",
    "strongman"
  ],
  "total": 7
}
```

---

### `GET /v1/levels`

List all difficulty levels.

```bash
curl "http://localhost:8787/v1/levels"
```

```json
{
  "data": ["beginner", "expert", "intermediate"],
  "total": 3
}
```

---

## Exercise Schema

### Exercise Object

```json
{
  "id": "d586b5aa-c2f4-4cb5-8038-d10b03c3b763",
  "name": "Barbell Bench Press",
  "type": "reps",
  "difficultyLevel": "intermediate",
  "forceType": "push",
  "mechanics": "compound",
  "category": "strength",
  "instructions": [
    "Lie flat on a bench with your feet planted firmly on the floor...",
    "As you breathe in, slowly lower the bar to your mid-chest..."
  ],
  "muscleGroups": [
    { "id": "...", "slug": "chest", "name": "Chest", "type": "primary" },
    { "id": "...", "slug": "triceps", "name": "Triceps", "type": "primary" }
  ],
  "equipment": [
    { "id": "...", "name": "Barbell", "type": "weight", "usageType": "single", "numItems": null }
  ]
}
```

### Field Reference

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID — stable across versions |
| `name` | `string \| null` | Exercise name (localized) |
| `type` | `string` | Measurement type: `reps`, `time`, or `distance` |
| `difficultyLevel` | `string \| null` | `beginner`, `intermediate`, or `expert` |
| `forceType` | `string \| null` | Primary force: `push`, `pull`, or `static` |
| `mechanics` | `string \| null` | Movement type: `compound` or `isolation` |
| `category` | `string \| null` | Exercise category (see values below) |
| `instructions` | `string[] \| null` | Step-by-step coaching cues |
| `muscleGroups` | `MuscleGroup[]` | Muscles targeted with role classification |
| `equipment` | `Equipment[]` | Required equipment |

**Categories:** `strength` · `stretching` · `cardio` · `plyometrics` · `powerlifting` · `olympicWeightlifting` · `strongman`

**Difficulty levels:** `beginner` · `intermediate` · `expert`

### Muscle Group Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID |
| `slug` | `string` | URL-safe identifier (e.g., `chest`, `biceps`) |
| `name` | `string \| null` | Display name (e.g., `Chest`, `Biceps`) |
| `type` | `string \| null` | Targeting: `primary`, `secondary`, or `tertiary` |

**17 muscle groups:** abdominals · abductors · adductors · biceps · calves · chest · forearms · glutes · hamstrings · lats · lower back · middle back · neck · quadriceps · shoulders · traps · triceps

### Equipment Object

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | UUID |
| `name` | `string \| null` | Equipment name (e.g., `Barbell`, `Dumbbell`) |
| `type` | `string` | `weight` or `resistance` |
| `usageType` | `string \| null` | `single`, `double`, or `multiple` |
| `numItems` | `number \| null` | Number of items needed (if applicable) |

**36 equipment types** including: Barbell · Dumbbell · Cable · Machine · Body Only · Kettlebell · Bands · Medicine Ball · Exercise Ball · and more.


## Deploy to Your Own Cloudflare

Deploy this API to your own Cloudflare Workers account:

```bash
# 1. Create an R2 bucket
npx wrangler r2 bucket create kinetic-exercises

# 2. Deploy the Worker
npm run deploy

# 3. Seed your production R2 bucket
npm run seed:remote
```

Your API will be live at the URL Cloudflare assigns (e.g. `https://kinetic-api.<you>.workers.dev`).

> **Or use the hosted version** — if you don't want to manage infrastructure, the Kinetic.place team maintains a free hosted instance at `https://api.kinetic.place` with the same dataset and endpoints.

## Adding Authentication (Optional)

This API ships with **no authentication** by default. If you want to add API key protection, use the built-in `createAuthMiddleware` with your own key validator:

```typescript
import { Hono } from 'hono';
import { createAuthMiddleware } from '@kinetic-place/exercises-api/middleware/auth';

const app = new Hono();

// Bring your own validator — any async function that returns tier info
app.use('/v1/*', createAuthMiddleware({
  validateKey: async (key) => {
    const user = await myDatabase.findByApiKey(key);
    if (!user) return null;
    return { tier: user.plan, email: user.email };
  },
  invalidKeyHint: 'Get a key at https://yourdomain.com',
}));
```

The middleware handles:
- Key extraction from `X-API-Key` header, `Authorization: Bearer` header, or `?api_key=` query param
- Rate-limit response headers (`X-RateLimit-Limit`, `X-RateLimit-Tier`)
- `401 Unauthorized` for invalid keys
- Unauthenticated requests get `public` tier (50 req/day default)

**Tier defaults:** `public` (50/day), `free` (500/day), `waitlist` (2,000/day), `admin` (100,000/day). Override with `rateLimits` option.

## Related Packages

- [`@kinetic-place/exercises-json`](https://github.com/kinetic-place/exercises-json) — raw JSON dataset (899+ exercises, EN/ES)
- [`@kinetic-place/exercises-db`](https://github.com/kinetic-place/exercises-db) — database-ready exercise data

## Coming Soon

- 🌐 **Multi-locale support** (`?locale=es`)
- 🎬 **Video content endpoints** (waitlist-gated)
- 📦 **TypeScript SDK** (`@kinetic-place/sdk`)

## License

MIT © [Kinetic.place](https://kinetic.place)

