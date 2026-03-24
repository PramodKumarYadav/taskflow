import { Router, Response } from 'express';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { featureGate } from '../middleware/featureGate';

const router = Router();
router.use(authMiddleware);

// POST /api/collaboration/share — COLLABORATION flag
router.post(
  '/share',
  featureGate('COLLABORATION'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { taskId, shareWithEmail } = req.body as {
      taskId: string;
      shareWithEmail: string;
    };

    if (!taskId || !shareWithEmail) {
      res.status(400).json({ error: 'taskId and shareWithEmail are required' });
      return;
    }

    const [task, targetUser] = await Promise.all([
      Task.findOne({ _id: taskId, owner: req.userId }),
      User.findOne({ email: shareWithEmail }),
    ]);

    if (!task) {
      res.status(404).json({ error: 'Task not found or you are not the owner' });
      return;
    }
    if (!targetUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (task.sharedWith.includes(targetUser._id)) {
      res.status(409).json({ error: 'Already shared with this user' });
      return;
    }

    task.sharedWith.push(targetUser._id);
    await task.save();

    res.json({ message: `Task shared with ${targetUser.name}` });
  }
);

// DELETE /api/collaboration/share — COLLABORATION flag
router.delete(
  '/share',
  featureGate('COLLABORATION'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { taskId, removeEmail } = req.body as {
      taskId: string;
      removeEmail: string;
    };

    const [task, targetUser] = await Promise.all([
      Task.findOne({ _id: taskId, owner: req.userId }),
      User.findOne({ email: removeEmail }),
    ]);

    if (!task || !targetUser) {
      res.status(404).json({ error: 'Task or user not found' });
      return;
    }

    task.sharedWith = task.sharedWith.filter(
      (id) => id.toString() !== targetUser._id.toString()
    );
    await task.save();

    res.json({ message: 'User removed from task' });
  }
);

export default router;
