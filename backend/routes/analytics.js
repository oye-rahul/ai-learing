const express = require('express');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get daily stats (SQLite compatible)
router.get('/daily', authenticateToken, async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setDate(endOfDay.getDate() + 1);
    const startStr = startOfDay.toISOString();
    const endStr = endOfDay.toISOString();

    const activitiesResult = await query(
      `SELECT activity_type, COUNT(*) as count, SUM(duration_minutes) as total_duration
       FROM user_activity
       WHERE user_id = ? AND timestamp >= ? AND timestamp < ?
       GROUP BY activity_type`,
      [req.user.id, startStr, endStr]
    );

    const aiInteractionsResult = await query(
      `SELECT prompt_type, COUNT(*) as count, SUM(tokens_used) as total_tokens
       FROM ai_interactions
       WHERE user_id = ? AND created_at >= ? AND created_at < ?
       GROUP BY prompt_type`,
      [req.user.id, startStr, endStr]
    );

    const streakResult = await query(
      'SELECT streak_days FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );

    const activities = activitiesResult.rows || [];
    const aiRows = aiInteractionsResult.rows || [];
    const totalDuration = activities.reduce((sum, row) => sum + (parseInt(row.total_duration) || 0), 0);
    const totalAiTokens = aiRows.reduce((sum, row) => sum + (parseInt(row.total_tokens) || 0), 0);

    res.json({
      date: startOfDay.toISOString().split('T')[0],
      activities,
      ai_interactions: aiRows,
      current_streak: streakResult.rows[0]?.streak_days || 0,
      total_duration: totalDuration,
      total_ai_tokens: totalAiTokens,
    });
  } catch (error) {
    console.error('Get daily stats error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get daily statistics',
    });
  }
});

// Get weekly report (SQLite: use date(timestamp))
router.get('/weekly', authenticateToken, async (req, res) => {
  try {
    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startStr = startDate.toISOString();
    const endStr = endDate.toISOString();

    const activitiesResult = await query(
      `SELECT date(timestamp) as date, activity_type, COUNT(*) as count, SUM(duration_minutes) as duration
       FROM user_activity
       WHERE user_id = ? AND timestamp >= ? AND timestamp <= ?
       GROUP BY date(timestamp), activity_type
       ORDER BY date DESC`,
      [req.user.id, startStr, endStr]
    );

    const aiUsageResult = await query(
      `SELECT date(created_at) as date, prompt_type, COUNT(*) as count, SUM(tokens_used) as tokens
       FROM ai_interactions
       WHERE user_id = ? AND created_at >= ? AND created_at <= ?
       GROUP BY date(created_at), prompt_type
       ORDER BY date DESC`,
      [req.user.id, startStr, endStr]
    );

    const progressResult = await query(
      'SELECT completed_modules, skills, total_learning_hours FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );

    const dailyStats = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      dailyStats[dateStr] = {
        date: dateStr,
        activities: 0,
        duration: 0,
        ai_interactions: 0,
        ai_tokens: 0,
      };
    }

    (activitiesResult.rows || []).forEach((row) => {
      const dateStr = row.date;
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].activities += parseInt(row.count) || 0;
        dailyStats[dateStr].duration += parseInt(row.duration) || 0;
      }
    });

    (aiUsageResult.rows || []).forEach((row) => {
      const dateStr = row.date;
      if (dailyStats[dateStr]) {
        dailyStats[dateStr].ai_interactions += parseInt(row.count) || 0;
        dailyStats[dateStr].ai_tokens += parseInt(row.tokens) || 0;
      }
    });

    res.json({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      daily_stats: Object.values(dailyStats),
      summary: {
        total_activities: Object.values(dailyStats).reduce((s, d) => s + d.activities, 0),
        total_duration: Object.values(dailyStats).reduce((s, d) => s + d.duration, 0),
        total_ai_interactions: Object.values(dailyStats).reduce((s, d) => s + d.ai_interactions, 0),
        total_ai_tokens: Object.values(dailyStats).reduce((s, d) => s + d.ai_tokens, 0),
        active_days: Object.values(dailyStats).filter((d) => d.activities > 0).length,
      },
      user_progress: progressResult.rows[0] || {},
    });
  } catch (error) {
    console.error('Get weekly report error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get weekly report',
    });
  }
});

// Get skill progression
router.get('/skills', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const days = parseInt(timeframe);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const startStr = startDate.toISOString();

    const currentSkillsResult = await query(
      'SELECT skills FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );

    let currentSkills = {};
    try {
      const raw = currentSkillsResult.rows[0]?.skills;
      currentSkills = typeof raw === 'string' ? JSON.parse(raw || '{}') : (raw || {});
    } catch (_) {}

    const activitiesResult = await query(
      `SELECT date(timestamp) as date, metadata, activity_type
       FROM user_activity
       WHERE user_id = ? AND timestamp >= ?
         AND (activity_type = 'lesson_completed' OR activity_type = 'module_started' OR activity_type = 'module_completed')
       ORDER BY timestamp`,
      [req.user.id, startStr]
    );

    const progressResult = await query(
      'SELECT completed_modules FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    let completedIds = [];
    try {
      const raw = progressResult.rows[0]?.completed_modules;
      completedIds = typeof raw === 'string' ? JSON.parse(raw || '[]') : (raw || []);
    } catch (_) {}

    const modulesResult = completedIds.length
      ? await query(
          `SELECT id, title, content FROM learning_modules WHERE id IN (${completedIds.map(() => '?').join(',')})`,
          completedIds
        )
      : { rows: [] };

    const skillCategories = {
      JavaScript: ['javascript', 'js', 'react', 'node'],
      Python: ['python', 'django', 'flask'],
      'Web Development': ['html', 'css', 'react', 'vue', 'angular'],
      Backend: ['node', 'express', 'api', 'database'],
      'Data Structures': ['algorithm', 'data structure', 'sorting'],
      Databases: ['sql', 'mongodb', 'database', 'query'],
    };

    const skillProgression = {};
    Object.keys(skillCategories).forEach((skill) => {
      skillProgression[skill] = {
        current_level: currentSkills[skill] || 0,
        activities: [],
        growth: 0,
      };
    });

    (activitiesResult.rows || []).forEach((activity) => {
      let metadata = {};
      try {
        metadata = typeof activity.metadata === 'string' ? JSON.parse(activity.metadata || '{}') : activity.metadata || {};
      } catch (_) {}
      const moduleTitle = metadata.moduleTitle || '';

      Object.entries(skillCategories).forEach(([skill, keywords]) => {
        const isRelevant = keywords.some((kw) => moduleTitle.toLowerCase().includes(kw));
        if (isRelevant) {
          skillProgression[skill].activities.push({
            date: activity.date,
            type: activity.activity_type,
            module: moduleTitle,
          });
          skillProgression[skill].growth += 5;
        }
      });
    });

    res.json({
      timeframe_days: days,
      current_skills: currentSkills,
      skill_progression: skillProgression,
      total_activities: (activitiesResult.rows || []).length,
      completed_modules: (modulesResult.rows || []).length,
    });
  } catch (error) {
    console.error('Get skill progression error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get skill progression',
    });
  }
});

// Log activity
router.post('/log-activity', authenticateToken, async (req, res) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const { activity_type, metadata, duration_minutes } = req.body;

    if (!activity_type) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'activity_type is required',
      });
    }

    await query(
      `INSERT INTO user_activity (id, user_id, activity_type, metadata, duration_minutes, timestamp)
       VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [uuidv4(), req.user.id, activity_type, JSON.stringify(metadata || {}), duration_minutes || null]
    );

    res.json({
      message: 'Activity logged successfully',
    });
  } catch (error) {
    console.error('Log activity error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to log activity',
    });
  }
});

// Get learning velocity
router.get('/velocity', authenticateToken, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const startStr = startDate.toISOString();

    const velocityResult = await query(
      `SELECT date(timestamp) as date, COUNT(*) as modules_completed
       FROM user_activity
       WHERE user_id = ? AND activity_type = 'module_completed' AND timestamp >= ?
       GROUP BY date(timestamp)
       ORDER BY date`,
      [req.user.id, startStr]
    );

    const totalHoursResult = await query(
      `SELECT SUM(duration_minutes) / 60.0 as total_hours
       FROM user_activity
       WHERE user_id = ? AND timestamp >= ? AND duration_minutes IS NOT NULL`,
      [req.user.id, startStr]
    );

    const rows = velocityResult.rows || [];
    const totalModules = rows.reduce((sum, row) => sum + (parseInt(row.modules_completed) || 0), 0);

    res.json({
      timeframe_days: parseInt(days),
      daily_completions: rows,
      total_modules_completed: totalModules,
      total_learning_hours: parseFloat(totalHoursResult.rows[0]?.total_hours || 0),
      average_daily_completions: parseInt(days) > 0 ? totalModules / parseInt(days) : 0,
    });
  } catch (error) {
    console.error('Get velocity error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get learning velocity',
    });
  }
});

module.exports = router;
