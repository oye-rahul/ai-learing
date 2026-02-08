const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { awardBadge } = require('../services/badgeService');

const router = express.Router();

// Get user projects (SQLite compatible)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, language } = req.query;

    let queryText = `
      SELECT p.*, u.username as owner_username
      FROM projects p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = ? OR p.id IN (
        SELECT p2.id FROM projects p2 CROSS JOIN json_each(p2.collaborators) je
        WHERE je.value = ?
      )
    `;
    const params = [req.user.id, req.user.email];

    if (search) {
      queryText += ' AND (p.title LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    if (language) {
      queryText += ' AND p.language = ?';
      params.push(language);
    }

    queryText += ' ORDER BY p.updated_at DESC';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get projects',
    });
  }
});

// Create project (SQLite: no RETURNING)
router.post('/', authenticateToken, [
  body('title').notEmpty().trim().isLength({ max: 255 }),
  body('description').optional().trim(),
  body('language').notEmpty().trim(),
  body('template_id').optional().trim(),
  body('code').optional().trim(),
  body('is_public').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { title, description, language, template_id, code, is_public } = req.body;
    const projectId = uuidv4();
    const collaborators = '[]';

    await query(
      `INSERT INTO projects (id, user_id, title, description, language, template_id, code, collaborators, is_public, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [projectId, req.user.id, title, description || '', language, template_id || null, code || '', collaborators, is_public ? 1 : 0]
    );

    const created = await query(
      'SELECT p.*, u.username as owner_username FROM projects p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
      [projectId]
    );

    await query(
      `INSERT INTO user_activity (id, user_id, activity_type, metadata, timestamp)
       VALUES (?, ?, 'project_created', ?, CURRENT_TIMESTAMP)`,
      [uuidv4(), req.user.id, JSON.stringify({ projectId, title, language })]
    );
    await awardBadge(req.user.id, 'first_project');

    res.status(201).json({
      message: 'Project created successfully',
      project: created.rows[0],
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to create project',
    });
  }
});

// Update project
router.put('/:id', authenticateToken, [
  body('title').optional().notEmpty().trim().isLength({ max: 255 }),
  body('description').optional().trim(),
  body('code').optional().trim(),
  body('is_public').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const { title, description, code, is_public } = req.body;

    const existingProject = await query(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );

    if (existingProject.rows.length === 0) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or you do not have permission to edit it',
      });
    }

    const project = existingProject.rows[0];
    const isOwner = project.user_id === req.user.id;
    let isCollaborator = false;
    try {
      const collab = typeof project.collaborators === 'string' ? JSON.parse(project.collaborators || '[]') : project.collaborators;
      isCollaborator = Array.isArray(collab) && collab.includes(req.user.email);
    } catch (_) {}
    if (!isOwner && !isCollaborator) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or you do not have permission to edit it',
      });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (code !== undefined) {
      updates.push('code = ?');
      values.push(code);
    }
    if (is_public !== undefined) {
      updates.push('is_public = ?');
      values.push(is_public ? 1 : 0);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No updates provided',
        message: 'Please provide at least one field to update',
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await query(
      `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    if (code !== undefined) {
      await query(
        `INSERT INTO user_activity (id, user_id, activity_type, metadata, timestamp)
         VALUES (?, ?, 'project_updated', ?, CURRENT_TIMESTAMP)`,
        [uuidv4(), req.user.id, JSON.stringify({ projectId: id, title: title ?? project.title })]
      );
    }

    const updated = await query(
      'SELECT p.*, u.username as owner_username FROM projects p JOIN users u ON p.user_id = u.id WHERE p.id = ?',
      [id]
    );

    res.json({
      message: 'Project updated successfully',
      project: updated.rows[0],
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update project',
    });
  }
});

// Delete project
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const existingProject = await query(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingProject.rows.length === 0) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or you do not have permission to delete it',
      });
    }

    const title = existingProject.rows[0].title;
    await query('DELETE FROM projects WHERE id = ?', [id]);

    await query(
      `INSERT INTO user_activity (id, user_id, activity_type, metadata, timestamp)
       VALUES (?, ?, 'project_deleted', ?, CURRENT_TIMESTAMP)`,
      [uuidv4(), req.user.id, JSON.stringify({ projectId: id, title })]
    );

    res.json({
      message: 'Project deleted successfully',
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to delete project',
    });
  }
});

// Add collaborator
router.post('/:id/collaborate', authenticateToken, [
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { id } = req.params;
    const { email } = req.body;

    const existingProject = await query(
      'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingProject.rows.length === 0) {
      return res.status(404).json({
        error: 'Project not found',
        message: 'Project not found or you do not have permission to add collaborators',
      });
    }

    const collaboratorResult = await query(
      'SELECT id, username FROM users WHERE email = ?',
      [email]
    );

    if (collaboratorResult.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with that email address',
      });
    }

    const project = existingProject.rows[0];
    let collaborators = [];
    try {
      collaborators = typeof project.collaborators === 'string' ? JSON.parse(project.collaborators || '[]') : (project.collaborators || []);
    } catch (_) {}

    if (collaborators.includes(email)) {
      return res.status(409).json({
        error: 'Already a collaborator',
        message: 'This user is already a collaborator on this project',
      });
    }

    collaborators.push(email);
    await query(
      'UPDATE projects SET collaborators = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [JSON.stringify(collaborators), id]
    );

    await query(
      `INSERT INTO user_activity (id, user_id, activity_type, metadata, timestamp)
       VALUES (?, ?, 'collaborator_added', ?, CURRENT_TIMESTAMP)`,
      [
        uuidv4(),
        req.user.id,
        JSON.stringify({
          projectId: id,
          title: project.title,
          collaboratorEmail: email,
          collaboratorUsername: collaboratorResult.rows[0].username,
        }),
      ]
    );

    res.json({
      message: 'Collaborator added successfully',
      projectId: id,
      collaborators,
    });
  } catch (error) {
    console.error('Add collaborator error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to add collaborator',
    });
  }
});

// Get project templates
router.get('/templates', authenticateToken, async (req, res) => {
  try {
    const templates = [
      {
        id: uuidv4(),
        title: 'React Todo App',
        description: 'A simple todo application built with React',
        language: 'javascript',
        code: `import React, { useState } from 'react';

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, { id: Date.now(), text: input, completed: false }]);
      setInput('');
    }
  };

  const toggleTodo = (id) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  return (
    <div className="todo-app">
      <h1>Todo App</h1>
      <div>
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Add a todo..." />
        <button onClick={addTodo}>Add</button>
      </div>
      <ul>
        {todos.map(todo => (
          <li key={todo.id} onClick={() => toggleTodo(todo.id)}>
            <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>{todo.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TodoApp;`,
      },
      {
        id: uuidv4(),
        title: 'Express API Server',
        description: 'Basic Express.js API server with CRUD operations',
        language: 'javascript',
        code: `const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
let items = [];
let nextId = 1;
app.get('/api/items', (req, res) => res.json(items));
app.post('/api/items', (req, res) => {
  const { name, description } = req.body;
  const newItem = { id: nextId++, name, description, createdAt: new Date().toISOString() };
  items.push(newItem);
  res.status(201).json(newItem);
});
app.listen(PORT, () => console.log('Server running on port ' + PORT));`,
      },
      {
        id: uuidv4(),
        title: 'Python Calculator',
        description: 'Simple calculator with basic operations',
        language: 'python',
        code: `def add(a, b): return a + b
def subtract(a, b): return a - b
def multiply(a, b): return a * b
def divide(a, b): return a / b if b else None
print("5 + 3 =", add(5, 3))
print("10 - 4 =", subtract(10, 4))`,
      },
    ];

    res.json(templates);
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get project templates',
    });
  }
});

module.exports = router;
