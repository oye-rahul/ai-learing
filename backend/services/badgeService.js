const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const BADGE_NAMES = {
  first_login: 'First Steps',
  first_lesson: 'Lesson Complete',
  module_master: 'Module Master',
  streak_7: 'Week Warrior',
  streak_30: 'Monthly Master',
  first_project: 'Builder',
  ai_chat_10: 'AI Explorer',
  snippets_5: 'Code Collector',
  certificate_1: 'Certified',
};

async function awardBadge(userId, badgeId) {
  try {
    const existing = await query(
      'SELECT id FROM user_badges WHERE user_id = ? AND badge_id = ?',
      [userId, badgeId]
    );
    if (existing.rows.length > 0) return false;
    await query(
      'INSERT INTO user_badges (id, user_id, badge_id, earned_at) VALUES (?, ?, ?, CURRENT_TIMESTAMP)',
      [uuidv4(), userId, badgeId]
    );
    const name = BADGE_NAMES[badgeId] || badgeId;
    await query(
      'INSERT INTO notifications (id, user_id, type, title, body, link) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), userId, 'badge', `You earned: ${name}`, `Badge earned: ${name}`, '/badges']
    );
    return true;
  } catch (err) {
    console.error('awardBadge error:', err);
    return false;
  }
}

async function checkAndAwardLearningBadges(userId) {
  const progress = await query('SELECT completed_modules FROM user_progress WHERE user_id = ?', [userId]);
  let completed = [];
  try {
    const raw = progress.rows[0]?.completed_modules;
    completed = typeof raw === 'string' ? JSON.parse(raw || '[]') : (raw || []);
  } catch (_) {}
  const activity = await query(
    "SELECT COUNT(*) as c FROM user_activity WHERE user_id = ? AND activity_type = 'lesson_completed'",
    [userId]
  );
  const lessonCount = activity.rows[0]?.c || 0;
  if (lessonCount >= 1) await awardBadge(userId, 'first_lesson');
  if (completed.length >= 1) await awardBadge(userId, 'module_master');
  if (completed.length >= 1) await awardBadge(userId, 'certificate_1');
}

async function checkAndAwardStreakBadges(userId) {
  const progress = await query('SELECT streak_days FROM user_progress WHERE user_id = ?', [userId]);
  const days = progress.rows[0]?.streak_days || 0;
  if (days >= 7) await awardBadge(userId, 'streak_7');
  if (days >= 30) await awardBadge(userId, 'streak_30');
}

module.exports = {
  awardBadge,
  checkAndAwardLearningBadges,
  checkAndAwardStreakBadges,
};
