const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { search, language, tag } = req.query;
    let q = 'SELECT * FROM code_snippets WHERE user_id = ?';
    const params = [req.user.id];
    if (language) {
      q += ' AND language = ?';
      params.push(language);
    }
    if (tag) {
      q += ' AND tags LIKE ?';
      params.push(`%${tag}%`);
    }
    q += ' ORDER BY updated_at DESC';
    const result = await query(q, params);
    let rows = result.rows || [];
    if (search) {
      const s = search.toLowerCase();
      rows = rows.filter((r) =>
        (r.title && r.title.toLowerCase().includes(s)) ||
        (r.code && r.code.toLowerCase().includes(s))
      );
    }
    res.json({ snippets: rows });
  } catch (error) {
    console.error('List snippets error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, [
  body('title').notEmpty().trim(),
  body('code').notEmpty(),
  body('language').notEmpty().trim(),
  body('tags').optional().isArray(),
  body('ai_explanation').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { title, code, language, tags = [], ai_explanation } = req.body;
    const id = uuidv4();
    await query(
      `INSERT INTO code_snippets (id, user_id, title, code, language, ai_explanation, tags) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, title, code, language, ai_explanation || null, JSON.stringify(tags)]
    );
    const row = await query('SELECT * FROM code_snippets WHERE id = ?', [id]);
    res.status(201).json({ snippet: row.rows[0] });
  } catch (error) {
    console.error('Create snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query('SELECT * FROM code_snippets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, [
  body('title').optional().notEmpty().trim(),
  body('code').optional().notEmpty(),
  body('language').optional().notEmpty().trim(),
  body('tags').optional().isArray(),
  body('ai_explanation').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { title, code, language, tags, ai_explanation } = req.body;
    const updates = [];
    const values = [];
    if (title !== undefined) { updates.push('title = ?'); values.push(title); }
    if (code !== undefined) { updates.push('code = ?'); values.push(code); }
    if (language !== undefined) { updates.push('language = ?'); values.push(language); }
    if (tags !== undefined) { updates.push('tags = ?'); values.push(JSON.stringify(tags)); }
    if (ai_explanation !== undefined) { updates.push('ai_explanation = ?'); values.push(ai_explanation); }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }
    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.params.id, req.user.id);
    const result = await query(
      `UPDATE code_snippets SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );
    if ((result.rowCount || 0) === 0) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    const row = await query('SELECT * FROM code_snippets WHERE id = ?', [req.params.id]);
    res.json(row.rows[0]);
  } catch (error) {
    console.error('Update snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await query('DELETE FROM code_snippets WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if ((result.rowCount || 0) === 0) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    res.json({ message: 'Snippet deleted' });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
