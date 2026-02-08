const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function generateSlug() {
  return crypto.randomBytes(8).toString('hex');
}

router.post('/create', authenticateToken, async (req, res) => {
  try {
    const { resource_type, resource_id, expires_in_hours } = req.body;
    if (!resource_type || !resource_id) {
      return res.status(400).json({ error: 'resource_type and resource_id required' });
    }
    if (!['project', 'snippet'].includes(resource_type)) {
      return res.status(400).json({ error: 'resource_type must be project or snippet' });
    }
    const table = resource_type === 'project' ? 'projects' : 'code_snippets';
    const row = await query(
      `SELECT id FROM ${table} WHERE id = ? AND user_id = ?`,
      [resource_id, req.user.id]
    );
    if (row.rows.length === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    const slug = generateSlug();
    const id = uuidv4();
    let expiresAt = null;
    if (expires_in_hours) {
      const d = new Date();
      d.setHours(d.getHours() + parseInt(expires_in_hours));
      expiresAt = d.toISOString();
    }
    await query(
      `INSERT INTO share_links (id, user_id, resource_type, resource_id, slug, expires_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, req.user.id, resource_type, resource_id, slug, expiresAt]
    );
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.status(201).json({
      slug,
      url: `${baseUrl}/share/${slug}`,
      expires_at: expiresAt,
    });
  } catch (error) {
    console.error('Create share error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:slug', async (req, res) => {
  try {
    const link = await query(
      'SELECT * FROM share_links WHERE slug = ?',
      [req.params.slug]
    );
    if (link.rows.length === 0) {
      return res.status(404).json({ error: 'Share link not found' });
    }
    const l = link.rows[0];
    if (l.expires_at && new Date(l.expires_at) < new Date()) {
      return res.status(410).json({ error: 'This share link has expired' });
    }
    if (l.resource_type === 'project') {
      const proj = await query(
        'SELECT id, title, description, language, code, created_at FROM projects WHERE id = ?',
        [l.resource_id]
      );
      if (proj.rows.length === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }
      return res.json({
        type: 'project',
        resource: proj.rows[0],
      });
    }
    if (l.resource_type === 'snippet') {
      const snip = await query(
        'SELECT id, title, code, language, ai_explanation, tags, created_at FROM code_snippets WHERE id = ?',
        [l.resource_id]
      );
      if (snip.rows.length === 0) {
        return res.status(404).json({ error: 'Snippet not found' });
      }
      return res.json({
        type: 'snippet',
        resource: snip.rows[0],
      });
    }
    res.status(400).json({ error: 'Unknown resource type' });
  } catch (error) {
    console.error('Get share error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
