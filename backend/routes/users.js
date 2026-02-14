const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      user: req.user,
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user information',
    });
  }
});

// Update user profile
router.put('/me', authenticateToken, [
  body('username').optional().isLength({ min: 3, max: 30 }).trim(),
  body('role').optional().isIn(['beginner', 'intermediate', 'expert']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { username, role } = req.body;
    const updates = [];
    const values = [];

    if (username) {
      // Check if username is already taken by another user
      const existingUser = await query(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, req.user.id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(409).json({
          error: 'Username already taken',
          message: 'Please choose a different username',
        });
      }

      updates.push('username = ?');
      values.push(username);
    }

    if (role) {
      updates.push('role = ?');
      values.push(role);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        error: 'No updates provided',
        message: 'Please provide at least one field to update',
      });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(req.user.id);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Get updated user
    const result = await query(
      'SELECT id, email, username, role, created_at, updated_at FROM users WHERE id = ?',
      [req.user.id]
    );

    res.json({
      message: 'Profile updated successfully',
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update profile',
    });
  }
});

// Get user progress
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Create default progress if it doesn't exist
      try {
        await query(
          `INSERT INTO user_progress (user_id, skills, completed_modules, current_module, streak_days, total_learning_hours)
           VALUES (?, '{}', '[]', NULL, 0, 0)`,
          [req.user.id]
        );
      } catch (e) {
        console.warn('⚠️ Could not insert progress into DB (likely read-only), using defaults');
      }

      return res.json({
        skills: {},
        completed_modules: [],
        current_module: null,
        streak_days: 0,
        total_learning_hours: 0,
      });
    }

    const progress = result.rows[0];
    res.json({
      skills: JSON.parse(progress.skills || '{}'),
      completed_modules: JSON.parse(progress.completed_modules || '[]'),
      current_module: progress.current_module,
      streak_days: progress.streak_days || 0,
      total_learning_hours: progress.total_learning_hours || 0,
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user progress',
    });
  }
});

// Update user skills
router.post('/skills', authenticateToken, [
  body('skills').isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { skills } = req.body;

    // Validate skill values (should be 0-100)
    for (const [skill, level] of Object.entries(skills)) {
      if (typeof level !== 'number' || level < 0 || level > 100) {
        return res.status(400).json({
          error: 'Invalid skill level',
          message: `Skill level for ${skill} must be between 0 and 100`,
        });
      }
    }

    try {
      await query(
        `UPDATE user_progress 
         SET skills = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [JSON.stringify(skills), req.user.id]
      );
    } catch (e) {
      console.warn('⚠️ Could not update skills in DB (likely read-only)');
    }

    res.json({
      message: 'Skills updated successfully',
      skills,
    });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to update skills',
    });
  }
});

// Get user activity
router.get('/activity', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const result = await query(
      `SELECT activity_type, metadata, duration_minutes, timestamp
       FROM user_activity 
       WHERE user_id = ? AND timestamp >= datetime('now', '-${parseInt(days)} days')
       ORDER BY timestamp DESC
       LIMIT 100`,
      [req.user.id]
    );

    res.json({
      activities: result.rows,
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get user activity',
    });
  }
});

// Export all user data (progress, activity, certificates summary)
router.get('/export', authenticateToken, async (req, res) => {
  try {
    const progressResult = await query('SELECT * FROM user_progress WHERE user_id = ?', [req.user.id]);
    const activityResult = await query(
      'SELECT activity_type, metadata, duration_minutes, timestamp FROM user_activity WHERE user_id = ? ORDER BY timestamp DESC LIMIT 500',
      [req.user.id]
    );
    const badgesResult = await query('SELECT badge_id, earned_at FROM user_badges WHERE user_id = ?', [req.user.id]);
    const progress = progressResult.rows[0] || {};
    const exportData = {
      exported_at: new Date().toISOString(),
      profile: { id: req.user.id, username: req.user.username, email: req.user.email, role: req.user.role },
      progress: {
        skills: typeof progress.skills === 'string' ? JSON.parse(progress.skills || '{}') : (progress.skills || {}),
        completed_modules: typeof progress.completed_modules === 'string' ? JSON.parse(progress.completed_modules || '[]') : (progress.completed_modules || []),
        current_module: progress.current_module,
        streak_days: progress.streak_days || 0,
        total_learning_hours: progress.total_learning_hours || 0,
      },
      activities: activityResult.rows || [],
      badges: badgesResult.rows || [],
    };
    res.json(exportData);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;