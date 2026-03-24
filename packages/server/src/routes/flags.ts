import { Router, Response } from 'express';
import { getAllFlags } from '@taskflow/feature-flags';

const router = Router();

// GET /api/flags — returns all feature flags for the current environment
router.get('/', (_req, res: Response) => {
  res.json(getAllFlags());
});

export default router;
