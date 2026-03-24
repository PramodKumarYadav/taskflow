import { Router, Response } from 'express';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { featureGate } from '../middleware/featureGate';

const router = Router();
router.use(authMiddleware);

// GET /api/dashboard — DASHBOARD_ANALYTICS flag
router.get(
  '/',
  featureGate('DASHBOARD_ANALYTICS'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const [tasks, comments] = await Promise.all([
      Task.find({ owner: req.userId }),
      Comment.countDocuments(),
    ]);

    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const byPriority = tasks.reduce<Record<string, number>>(
      (acc, t) => {
        acc[t.priority] = (acc[t.priority] ?? 0) + 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0 }
    );

    const labelCounts: Record<string, number> = {};
    tasks.forEach((t) =>
      t.labels.forEach((label) => {
        labelCounts[label] = (labelCounts[label] ?? 0) + 1;
      })
    );

    const overdue = tasks.filter(
      (t) => t.dueDate && t.dueDate < new Date() && !t.completed
    ).length;

    res.json({
      total,
      completed,
      pending: total - completed,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      overdue,
      byPriority,
      topLabels: Object.entries(labelCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([label, count]) => ({ label, count })),
      totalComments: comments,
    });
  }
);

export default router;
