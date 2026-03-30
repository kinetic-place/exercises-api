/**
 * Generic, pluggable API key authentication middleware.
 *
 * This middleware is auth-backend-agnostic. You provide a `validateKey`
 * function and it handles the HTTP plumbing (header extraction, 401
 * responses, rate-limit headers, context variables).
 *
 * Usage:
 *   import { createAuthMiddleware } from './middleware/auth';
 *
 *   // Bring your own validator
 *   app.use('/v1/*', createAuthMiddleware({
 *     validateKey: async (key) => {
 *       const user = await myDb.findByApiKey(key);
 *       return user ? { tier: user.plan, email: user.email } : null;
 *     }
 *   }));
 */
import type { Context, Next, MiddlewareHandler } from 'hono';
import type { ApiTier, ApiKeyInfo } from '../types';

export type { ApiTier, ApiKeyInfo };

// ---------- Config ----------

export interface AuthMiddlewareOptions {
  /**
   * Validate an API key and return tier info.
   * Return null if the key is invalid.
   */
  validateKey: (key: string) => Promise<ApiKeyInfo | null>;

  /**
   * Custom rate limits per tier. Defaults provided if omitted.
   */
  rateLimits?: Partial<Record<ApiTier, number>>;

  /**
   * Custom 401 message / hint for invalid keys.
   */
  invalidKeyHint?: string;
}

// Default rate limits (requests per day)
const DEFAULT_RATE_LIMITS: Record<ApiTier, number> = {
  public: 50,
  free: 500,
  waitlist: 2000,
  admin: 100000,
};

// ---------- Middleware factory ----------

export function createAuthMiddleware(options: AuthMiddlewareOptions): MiddlewareHandler {
  const { validateKey, invalidKeyHint } = options;
  const rateLimits = Object.assign({}, DEFAULT_RATE_LIMITS, options.rateLimits ?? {}) as Record<ApiTier, number>;

  return async (c: Context, next: Next) => {
    // Extract API key from multiple sources
    const apiKey =
      c.req.header('X-API-Key') ||
      c.req.header('Authorization')?.replace(/^Bearer\s+/i, '') ||
      c.req.query('api_key');

    if (!apiKey) {
      // No key — public tier with limits
      c.set('apiTier', 'public' as ApiTier);
      c.set('apiKeyInfo', { tier: 'public' as ApiTier });
      addRateLimitHeaders(c, 'public', rateLimits);
      await next();
      return;
    }

    // Validate the key via the provided callback
    const keyInfo = await validateKey(apiKey);

    if (!keyInfo) {
      return c.json(
        {
          error: 'Invalid API key',
          status: 401,
          ...(invalidKeyHint ? { hint: invalidKeyHint } : {}),
        },
        401
      );
    }

    c.set('apiTier', keyInfo.tier);
    c.set('apiKeyInfo', keyInfo);
    addRateLimitHeaders(c, keyInfo.tier, rateLimits);
    await next();
  };
}

// ---------- Helpers ----------

function addRateLimitHeaders(
  c: Context,
  tier: ApiTier,
  limits: Record<ApiTier, number>
): void {
  c.header('X-RateLimit-Limit', String(limits[tier]));
  c.header('X-RateLimit-Tier', tier);
}
