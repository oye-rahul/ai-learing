const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

const BADGE_DEFS = {
  first_login: { id: 'first_login', name: 'First Steps', icon: '🌟', description: 'Created your account' },
  first_lesson: { id: 'first_lesson', name: 'Lesson Complete', icon: '📖', description: 'Completed your first lesson' },
  module_master: { id: 'module_master', name: 'Module Master', icon: '🎓', description: 'Completed a full module' },
  streak_7: { id: 'streak_7', name: 'Week Warrior', icon: '🔥', description: '7-day learning streak' },
  streak_30: { id: 'streak_30', name: 'Monthly Master', icon: '💪', description: '30-day learning streak' },
  first_project: { id: 'first_project', name: 'Builder', icon: '🛠️', description: 'Created your first project' },
  ai_chat_10: { id: 'ai_chat_10', name: 'AI Explorer', icon: '🤖', description: 'Had 10 AI chat conversations' },
  snippets_5: { id: 'snippets_5', name: 'Code Collector', icon: '📦', description: 'Saved 5 code snippets' },
  certificate_1: { id: 'certificate_1', name: 'Certified', icon: '📜', description: 'Earned your first certificate' },
};

router.get('/definitions', authenticateToken, (req, res) => {
  res.json({ badges: Object.values(BADGE_DEFS) });
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT badge_id, earned_at FROM user_badges WHERE user_id = ? ORDER BY earned_at DESC',
      [req.user.id]
    );
    const earned = (result.rows || []).map((r) => {
      const def = BADGE_DEFS[r.badge_id];
      if (!def) return null;
      return { ...def, earned_at: r.earned_at };
    }).filter(Boolean);
    res.json({ badges: earned });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/leaderboard', authenticateToken, async (req, res) => {
  try {
    const by = req.query.by === 'lessons' ? 'lessons' : 'streak';
    const orderCol = by === 'lessons' ? 'total_learning_hours' : 'streak_days';
    const result = await query(
      `SELECT u.id, u.username, up.streak_days, up.total_learning_hours, up.completed_modules
       FROM users u
       JOIN user_progress up ON up.user_id = u.id
       ORDER BY up.${orderCol} DESC
       LIMIT 20`,
      []
    );
    const list = (result.rows || []).map((r, i) => {
      let completedCount = 0;
      try {
        const arr = typeof r.completed_modules === 'string' ? JSON.parse(r.completed_modules || '[]') : (r.completed_modules || []);
        completedCount = Array.isArray(arr) ? arr.length : 0;
      } catch (_) {}
      return {
        rank: i + 1,
        username: r.username,
        streak_days: r.streak_days || 0,
        total_learning_hours: r.total_learning_hours || 0,
        completed_count: completedCount,
      };
    });
    res.json({ leaderboard: list });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
