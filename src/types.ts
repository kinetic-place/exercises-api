/**
 * Shared type definitions for the exercises-api Worker.
 */

// ---------- Auth types (used by auth middleware plugins) ----------

export type ApiTier = 'public' | 'free' | 'waitlist' | 'admin';

export interface ApiKeyInfo {
  tier: ApiTier;
  email?: string;
  keyId?: string;
}

// ---------- Hono environment ----------

export interface Env {
  Bindings: {
    ENVIRONMENT: string;
    EXERCISES_BUCKET: R2Bucket;
    [key: string]: unknown; // allow additional bindings from auth adapters
  };
  Variables: {
    apiTier: ApiTier;
    apiKeyInfo: ApiKeyInfo;
  };
}
