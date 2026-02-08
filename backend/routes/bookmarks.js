const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT b.*, lm.title as module_title, lm.description as module_description, lm.difficulty, lm.estimated_hours
       FROM user_bookmarks b
       JOIN learning_modules lm ON lm.id = b.module_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );
    res.json({ bookmarks: result.rows || [] });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, [
  body('module_id').notEmpty().trim(),
  body('lesson_index').optional().isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { module_id, lesson_index = 0 } = req.body;
    const mod = await query('SELECT id FROM learning_modules WHERE id = ?', [module_id]);
    if (mod.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    await query(
      'DELETE FROM user_bookmarks WHERE user_id = ? AND module_id = ?',
      [req.user.id, module_id]
    );
    const id = uuidv4();
    await query(
      `INSERT INTO user_bookmarks (id, user_id, module_id, lesson_index, created_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [id, req.user.id, module_id, lesson_index]
    );
    const row = await query(
      `SELECT b.*, lm.title as module_title FROM user_bookmarks b JOIN learning_modules lm ON lm.id = b.module_id WHERE b.user_id = ? AND b.module_id = ?`,
      [req.user.id, module_id]
    );
    res.status(201).json({ bookmark: row.rows[0] });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:moduleId', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'DELETE FROM user_bookmarks WHERE user_id = ? AND module_id = ?',
      [req.user.id, req.params.moduleId]
    );
    if ((result.rowCount || 0) === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }
    res.json({ message: 'Bookmark removed' });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
