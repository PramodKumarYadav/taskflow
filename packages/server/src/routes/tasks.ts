import { Router, Response } from 'express';
import { Task } from '../models/Task';
import { Comment } from '../models/Comment';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { featureGate } from '../middleware/featureGate';

const router = Router();

// All task routes require authentication
router.use(authMiddleware);

// GET /api/tasks — list tasks owned by or shared with the user
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const tasks = await Task.find({
    $or: [{ owner: req.userId }, { sharedWith: req.userId }],
  }).sort({ createdAt: -1 });
  res.json(tasks);
});

// POST /api/tasks — create a new task
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, priority, labels, dueDate } = req.body as {
    title: string;
    description?: string;
    priority?: string;
    labels?: string[];
    dueDate?: string;
  };

  if (!title) {
    res.status(400).json({ error: 'title is required' });
    return;
  }

  const task = await Task.create({
    title,
    description,
    priority: priority ?? 'medium',
    labels: labels ?? [],
    owner: req.userId,
    dueDate: dueDate ? new Date(dueDate) : undefined,
  });
  res.status(201).json(task);
});

// PUT /api/tasks/:id — update a task
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  res.json(task);
});

// DELETE /api/tasks/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.userId });
  if (!task) {
    res.status(404).json({ error: 'Task not found' });
    return;
  }
  await Comment.deleteMany({ task: req.params.id });
  res.json({ message: 'Task deleted' });
});

// ─── Feature-gated routes ────────────────────────────────────────────────────

// GET /api/tasks/export/csv — CSV_EXPORT flag
router.get('/export/csv', featureGate('CSV_EXPORT'), async (req: AuthRequest, res: Response): Promise<void> => {
  const tasks = await Task.find({ owner: req.userId }).sort({ createdAt: -1 });
  const header = 'id,title,description,completed,priority,labels,dueDate,createdAt\n';
  const rows = tasks
    .map((t) =>
      [
        t._id,
        `"${t.title.replace(/"/g, '""')}"`,
        `"${(t.description ?? '').replace(/"/g, '""')}"`,
        t.completed,
        t.priority,
        `"${t.labels.join(';')}"`,
        t.dueDate?.toISOString() ?? '',
        t.createdAt.toISOString(),
      ].join(',')
    )
    .join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="tasks.csv"');
  res.send(header + rows);
});

// GET /api/tasks/:id/comments — TASK_COMMENTS flag
router.get(
  '/:id/comments',
  featureGate('TASK_COMMENTS'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const comments = await Comment.find({ task: req.params.id })
      .populate('author', 'name email')
      .sort({ createdAt: 1 });
    res.json(comments);
  }
);

// POST /api/tasks/:id/comments — TASK_COMMENTS flag
router.post(
  '/:id/comments',
  featureGate('TASK_COMMENTS'),
  async (req: AuthRequest, res: Response): Promise<void> => {
    const { text } = req.body as { text: string };
    if (!text) {
      res.status(400).json({ error: 'text is required' });
      return;
    }
    const comment = await Comment.create({
      task: req.params.id,
      author: req.userId,
      text,
    });
    const populated = await comment.populate('author', 'name email');
    res.status(201).json(populated);
  }
);

export default router;
