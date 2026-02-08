const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { unread_only } = req.query;
    let q = 'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50';
    const params = [req.user.id];
    if (unread_only === 'true') {
      q = 'SELECT * FROM notifications WHERE user_id = ? AND read = 0 ORDER BY created_at DESC';
    }
    const result = await query(q, params);
    const unreadCount = await query('SELECT COUNT(*) as c FROM notifications WHERE user_id = ? AND read = 0', [req.user.id]);
    res.json({
      notifications: result.rows || [],
      unreadCount: unreadCount.rows[0]?.c || 0,
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, [
  body('type').notEmpty().trim(),
  body('title').notEmpty().trim(),
  body('body').optional().trim(),
  body('link').optional().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { type, title, body, link } = req.body;
    const id = uuidv4();
    await query(
      `INSERT INTO notifications (id, user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, type, title, body || null, link || null]
    );
    const row = await query('SELECT * FROM notifications WHERE id = ?', [id]);
    res.status(201).json({ notification: row.rows[0] });
  } catch (error) {
    console.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    await query(
      'UPDATE notifications SET read = 1 WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/read-all', authenticateToken, async (req, res) => {
  try {
    await query('UPDATE notifications SET read = 1 WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'All marked as read' });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
