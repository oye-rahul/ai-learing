const express = require('express');
const { body, validationResult } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { checkAndAwardLearningBadges, checkAndAwardStreakBadges } = require('../services/badgeService');

const router = express.Router();

// Get all learning modules (SQLite compatible)
router.get('/modules', authenticateToken, async (req, res) => {
  try {
    const { difficulty, search } = req.query;

    let queryText = `
      SELECT lm.id, lm.title, lm.description, lm.difficulty, lm.estimated_hours,
             lm.prerequisites, lm.content, lm.project_template_id, lm.created_at, lm.updated_at,
             CASE WHEN je.value IS NOT NULL THEN 1 ELSE 0 END as completed,
             0 as progress
      FROM learning_modules lm
      LEFT JOIN user_progress up ON up.user_id = ?
      LEFT JOIN json_each(up.completed_modules) je ON je.value = lm.id AND up.user_id = ?
      WHERE 1=1
    `;

    const params = [req.user.id, req.user.id];

    if (difficulty) {
      queryText += ' AND lm.difficulty = ?';
      params.push(parseInt(difficulty));
    }

    if (search) {
      queryText += ' AND (lm.title LIKE ? OR lm.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    queryText += ' ORDER BY lm.difficulty, lm.created_at';

    const result = await query(queryText, params);

    // Parse content and prerequisites for each row, ensure completed is boolean
    const rows = result.rows.map((row) => {
      const content = typeof row.content === 'string' ? JSON.parse(row.content || '{}') : row.content;
      const prerequisites = typeof row.prerequisites === 'string' ? JSON.parse(row.prerequisites || '[]') : row.prerequisites;
      return {
        ...row,
        content,
        prerequisites,
        completed: Boolean(row.completed),
        progress: row.progress || 0,
      };
    });

    res.json(rows);
  } catch (error) {
    console.error('Get modules error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get learning modules',
    });
  }
});

// Start a learning module
router.post('/start-module', authenticateToken, [
  body('moduleId').notEmpty().trim(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { moduleId } = req.body;

    const moduleResult = await query(
      'SELECT * FROM learning_modules WHERE id = ?',
      [moduleId]
    );

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Module not found',
        message: 'The specified learning module does not exist',
      });
    }

    const module = moduleResult.rows[0];
    const content = typeof module.content === 'string' ? JSON.parse(module.content || '{}') : module.content;

    await query(
      `UPDATE user_progress SET current_module = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
      [moduleId, req.user.id]
    );

    await query(
      `INSERT INTO user_activity (id, user_id, activity_type, metadata, timestamp)
       VALUES (?, ?, 'module_started', ?, CURRENT_TIMESTAMP)`,
      [uuidv4(), req.user.id, JSON.stringify({ moduleId, moduleTitle: module.title })]
    );

    res.json({
      message: 'Module started successfully',
      module: {
        ...module,
        content,
        completed: false,
        progress: 0,
      },
    });
  } catch (error) {
    console.error('Start module error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to start module',
    });
  }
});

// Complete a lesson
router.post('/complete-lesson', authenticateToken, [
  body('moduleId').notEmpty().trim(),
  body('lessonId').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array(),
      });
    }

    const { moduleId, lessonId } = req.body;

    const moduleResult = await query(
      'SELECT * FROM learning_modules WHERE id = ?',
      [moduleId]
    );

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({
        error: 'Module not found',
        message: 'The specified learning module does not exist',
      });
    }

    const module = moduleResult.rows[0];
    const content = typeof module.content === 'string' ? JSON.parse(module.content || '{}') : module.content;
    const lessons = content.lessons || [];
    const totalLessons = lessons.length;
    const progress = totalLessons > 0 ? Math.min(100, Math.round((1 / totalLessons) * 100)) : 0;

    const progressResult = await query(
      'SELECT * FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );

    let completedModules = [];
    try {
      const raw = progressResult.rows[0]?.completed_modules;
      completedModules = typeof raw === 'string' ? JSON.parse(raw || '[]') : (raw || []);
    } catch (_) {
      completedModules = [];
    }

    if (progress >= 100 && !completedModules.includes(moduleId)) {
      completedModules.push(moduleId);
      await query(
        `UPDATE user_progress SET completed_modules = ?, current_module = NULL, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
        [JSON.stringify(completedModules), req.user.id]
      );
    }

    await query(
      `INSERT INTO user_activity (id, user_id, activity_type, metadata, duration_minutes, timestamp)
       VALUES (?, ?, 'lesson_completed', ?, 30, CURRENT_TIMESTAMP)`,
      [
        uuidv4(),
        req.user.id,
        JSON.stringify({ moduleId, lessonId, moduleTitle: module.title }),
      ]
    );

    const lastActivity = await query(
      `SELECT timestamp FROM user_activity
       WHERE user_id = ? AND (activity_type = 'lesson_completed' OR activity_type = 'module_started')
       ORDER BY timestamp DESC LIMIT 2`,
      [req.user.id]
    );

    const currentStreak = progressResult.rows[0]?.streak_days || 0;
    if (lastActivity.rows.length >= 2) {
      const lastDate = new Date(lastActivity.rows[1].timestamp).toDateString();
      const today = new Date().toDateString();
      if (lastDate !== today) {
        await query(
          `UPDATE user_progress SET streak_days = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`,
          [currentStreak + 1, req.user.id]
        );
      }
    }

    await checkAndAwardLearningBadges(req.user.id);
    await checkAndAwardStreakBadges(req.user.id);

    res.json({
      message: 'Lesson completed successfully',
      moduleId,
      lessonId,
      progress,
      completed: progress >= 100,
    });
  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to complete lesson',
    });
  }
});

// Get personalized recommendations (SQLite)
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    const progressResult = await query(
      'SELECT * FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );

    const userProgress = progressResult.rows[0];
    let completedModules = [];
    try {
      const raw = userProgress?.completed_modules;
      completedModules = typeof raw === 'string' ? JSON.parse(raw || '[]') : (raw || []);
    } catch (_) {}

    const userResult = await query(
      'SELECT role FROM users WHERE id = ?',
      [req.user.id]
    );

    const userRole = userResult.rows[0]?.role || 'beginner';
    let maxDifficulty = 2;
    if (userRole === 'intermediate') maxDifficulty = 4;
    if (userRole === 'expert') maxDifficulty = 5;

    const allModules = await query(
      'SELECT * FROM learning_modules ORDER BY difficulty, created_at',
      []
    );

    const recommended = allModules.rows
      .filter((lm) => {
        const completed = completedModules.includes(lm.id);
        return lm.difficulty <= maxDifficulty && !completed;
      })
      .slice(0, 6)
      .map((row) => {
        const content = typeof row.content === 'string' ? JSON.parse(row.content || '{}') : row.content;
        const prerequisites = typeof row.prerequisites === 'string' ? JSON.parse(row.prerequisites || '[]') : row.prerequisites;
        return { ...row, content, prerequisites, completed: false };
      });

    res.json(recommended);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get recommendations',
    });
  }
});

// Get learning path (SQLite)
router.get('/path', authenticateToken, async (req, res) => {
  try {
    const progressResult = await query(
      'SELECT * FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );

    const userProgress = progressResult.rows[0];
    let completedModules = [];
    try {
      const raw = userProgress?.completed_modules;
      completedModules = typeof raw === 'string' ? JSON.parse(raw || '[]') : (raw || []);
    } catch (_) {}
    const currentModule = userProgress?.current_module || null;

    const modulesResult = await query(
      'SELECT * FROM learning_modules ORDER BY difficulty, created_at',
      []
    );

    const modules = modulesResult.rows.map((row) => {
      const content = typeof row.content === 'string' ? JSON.parse(row.content || '{}') : row.content;
      const prerequisites = typeof row.prerequisites === 'string' ? JSON.parse(row.prerequisites || '[]') : row.prerequisites;
      return {
        ...row,
        content,
        prerequisites,
        completed: completedModules.includes(row.id),
        current: row.id === currentModule,
      };
    });

    const totalModules = modules.length;
    const completedCount = completedModules.length;
    const completionPercentage = totalModules > 0 ? Math.round((completedCount / totalModules) * 100) : 0;

    res.json({
      modules,
      current_module: currentModule,
      completion_percentage: completionPercentage,
      total_modules: totalModules,
      completed_modules: completedCount,
    });
  } catch (error) {
    console.error('Get learning path error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get learning path',
    });
  }
});

// Get my certificates (completed modules)
router.get('/certificates', authenticateToken, async (req, res) => {
  try {
    const progressResult = await query(
      'SELECT completed_modules FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    let completedIds = [];
    try {
      const raw = progressResult.rows[0]?.completed_modules;
      completedIds = typeof raw === 'string' ? JSON.parse(raw || '[]') : (raw || []);
    } catch (_) {}
    if (completedIds.length === 0) {
      return res.json({ certificates: [] });
    }
    const placeholders = completedIds.map(() => '?').join(',');
    const mods = await query(
      `SELECT id, title, description, estimated_hours FROM learning_modules WHERE id IN (${placeholders})`,
      completedIds
    );
    const certificates = (mods.rows || []).map((m) => ({
      module_id: m.id,
      title: m.title,
      description: m.description,
      estimated_hours: m.estimated_hours,
      completed_at: new Date().toISOString(),
    }));
    res.json({ certificates });
  } catch (error) {
    console.error('Get certificates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single certificate (for share/print)
router.get('/certificates/:moduleId', authenticateToken, async (req, res) => {
  try {
    const progressResult = await query(
      'SELECT completed_modules FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    let completedIds = [];
    try {
      const raw = progressResult.rows[0]?.completed_modules;
      completedIds = typeof raw === 'string' ? JSON.parse(raw || '[]') : (raw || []);
    } catch (_) {}
    if (!completedIds.includes(req.params.moduleId)) {
      return res.status(404).json({ error: 'Certificate not found' });
    }
    const mod = await query(
      'SELECT id, title, description, estimated_hours FROM learning_modules WHERE id = ?',
      [req.params.moduleId]
    );
    if (mod.rows.length === 0) {
      return res.status(404).json({ error: 'Module not found' });
    }
    const m = mod.rows[0];
    res.json({
      module_id: m.id,
      title: m.title,
      description: m.description,
      estimated_hours: m.estimated_hours,
      completed_at: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Get certificate error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Skill assessment: submit answers, get recommended modules
const ASSESSMENT_QUESTIONS = [
  { id: 'q1', question: 'How would you rate your experience with programming?', options: ['None', 'Beginner', 'Intermediate', 'Advanced'], weights: [1, 2, 3, 4] },
  { id: 'q2', question: 'Which area interests you most?', options: ['Web Development', 'Data Science / AI', 'Mobile', 'Backend / APIs'], weights: [1, 2, 1, 2] },
  { id: 'q3', question: 'How much time can you dedicate per week?', options: ['1-2 hours', '3-5 hours', '5-10 hours', '10+ hours'], weights: [1, 2, 3, 4] },
];

router.get('/assessment/questions', authenticateToken, (req, res) => {
  res.json({ questions: ASSESSMENT_QUESTIONS });
});

router.post('/assessment', authenticateToken, [
  body('answers').isArray(),
  body('answers.*.questionId').notEmpty(),
  body('answers.*.optionIndex').isInt({ min: 0 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Validation failed', details: errors.array() });
    }
    const { answers } = req.body;
    const resultId = uuidv4();
    await query(
      `INSERT INTO assessment_results (id, user_id, answers) VALUES (?, ?, ?)`,
      [resultId, req.user.id, JSON.stringify(answers)]
    );
    const score = answers.reduce((s, a) => {
      const q = ASSESSMENT_QUESTIONS.find((x) => x.id === a.questionId);
      return s + (q ? (q.weights[a.optionIndex] || 0) : 0);
    }, 0);
    const maxScore = ASSESSMENT_QUESTIONS.reduce((s, q) => s + Math.max(...q.weights), 0);
    const level = score <= maxScore * 0.33 ? 1 : score <= maxScore * 0.66 ? 2 : 3;
    const allMods = await query(
      'SELECT id, title, description, difficulty, estimated_hours FROM learning_modules ORDER BY difficulty LIMIT 6',
      []
    );
    const recommended = (allMods.rows || []).filter((m) => m.difficulty <= level).slice(0, 4);
    await query(
      'UPDATE assessment_results SET recommended_modules = ? WHERE id = ?',
      [JSON.stringify(recommended.map((m) => m.id)), resultId]
    );
    res.json({
      result_id: resultId,
      score,
      maxScore,
      level: level === 1 ? 'beginner' : level === 2 ? 'intermediate' : 'advanced',
      recommended_modules: recommended,
    });
  } catch (error) {
    console.error('Assessment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
