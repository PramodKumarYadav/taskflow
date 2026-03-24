import { Request, Response, NextFunction } from 'express';
import { isEnabled, FlagName } from '@taskflow/feature-flags';

/**
 * Express middleware factory that gates a route behind a feature flag.
 *
 * Usage:
 *   router.post('/comments', featureGate('TASK_COMMENTS'), handler);
 *
 * If the flag is disabled for the current environment, the request is
 * rejected with 404 (so the feature is invisible, not just forbidden).
 */
export function featureGate(flag: FlagName) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    if (!isEnabled(flag)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    next();
  };
}
