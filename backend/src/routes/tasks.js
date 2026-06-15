const router = require('express').Router();
const db = require('../db/database');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);

// GET /api/tasks
router.get('/', (req, res) => {
  const { search, status, priority, due_from, due_to, sort } = req.query;

  let sql = 'SELECT * FROM tasks WHERE owner_id = ?';
  const params = [req.user.id];

  if (search) {
    sql += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }
  if (status) {
    sql += ' AND status = ?';
    params.push(status);
  }
  if (priority) {
    sql += ' AND priority = ?';
    params.push(priority);
  }
  if (due_from) {
    sql += ' AND due_date >= ?';
    params.push(due_from);
  }
  if (due_to) {
    sql += ' AND due_date <= ?';
    params.push(due_to);
  }

  const sortMap = {
    created_asc:  'created_at ASC',
    created_desc: 'created_at DESC',
    due_asc:      'due_date ASC',
    due_desc:     'due_date DESC',
    priority_asc: "CASE priority WHEN 'low' THEN 1 WHEN 'medium' THEN 2 WHEN 'high' THEN 3 END ASC",
    priority_desc:"CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END ASC",
  };
  sql += ` ORDER BY ${sortMap[sort] || 'created_at DESC'}`;

  const tasks = db.prepare(sql).all(...params);
  res.json({ tasks });
});

// POST /api/tasks
router.post('/', (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'title is required' });
  }

  const validStatuses = ['todo', 'in_progress', 'done'];
  const validPriorities = ['low', 'medium', 'high'];

  const s = status || 'todo';
  const p = priority || 'medium';

  if (!validStatuses.includes(s)) return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  if (!validPriorities.includes(p)) return res.status(400).json({ error: `priority must be one of: ${validPriorities.join(', ')}` });

  const result = db.prepare(`
    INSERT INTO tasks (title, description, status, priority, due_date, owner_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(title.trim(), description || null, s, p, due_date || null, req.user.id);

  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json({ task });
});

// GET /api/tasks/:id
router.get('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });
  res.json({ task });
});

// PUT /api/tasks/:id
router.put('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { title, description, status, priority, due_date } = req.body;

  const validStatuses = ['todo', 'in_progress', 'done'];
  const validPriorities = ['low', 'medium', 'high'];

  const s = status !== undefined ? status : task.status;
  const p = priority !== undefined ? priority : task.priority;

  if (!validStatuses.includes(s)) return res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  if (!validPriorities.includes(p)) return res.status(400).json({ error: `priority must be one of: ${validPriorities.join(', ')}` });

  const newTitle = title !== undefined ? title.trim() : task.title;
  if (!newTitle) return res.status(400).json({ error: 'title cannot be empty' });

  db.prepare(`
    UPDATE tasks SET title=?, description=?, status=?, priority=?, due_date=?
    WHERE id = ?
  `).run(
    newTitle,
    description !== undefined ? description : task.description,
    s, p,
    due_date !== undefined ? due_date : task.due_date,
    task.id
  );

  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(task.id);
  res.json({ task: updated });
});

// DELETE /api/tasks/:id
router.delete('/:id', (req, res) => {
  const task = db.prepare('SELECT id FROM tasks WHERE id = ? AND owner_id = ?').get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  db.prepare('DELETE FROM tasks WHERE id = ?').run(task.id);
  res.status(204).end();
});

module.exports = router;
