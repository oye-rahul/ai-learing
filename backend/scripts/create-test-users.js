const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { query } = require('../config/database');

const createTestUsers = async () => {
  try {
    console.log('🧪 Creating test users...');

    const testUsers = [
      {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
        role: 'beginner'
      },
      {
        email: 'admin@flowstate.com',
        username: 'admin',
        password: 'admin123',
        role: 'expert'
      },
      {
        email: 'demo@flowstate.com',
        username: 'demo',
        password: 'demo123',
        role: 'intermediate'
      }
    ];

    for (const userData of testUsers) {
      // Check if user already exists
      const existingUser = await query(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [userData.email, userData.username]
      );

      if (existingUser.rows.length > 0) {
        console.log(`⚠️  User ${userData.username} already exists, skipping...`);
        continue;
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

      // Create user
      const userId = uuidv4();
      await query(
        `INSERT INTO users (id, email, username, password_hash, role, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [userId, userData.email, userData.username, hashedPassword, userData.role]
      );

      // Create user progress record
      await query(
        `INSERT INTO user_progress (user_id, skills, completed_modules, current_module, streak_days, total_learning_hours)
         VALUES (?, '{}', '[]', NULL, 0, 0)`,
        [userId]
      );

      console.log(`✅ Created test user: ${userData.username} (${userData.email})`);
    }

    console.log('\n🎉 Test users created successfully!');
    console.log('\n📋 Test Login Credentials:');
    console.log('┌─────────────────────────────────────────────────────────┐');
    console.log('│                    TEST ACCOUNTS                        │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email: test@example.com     | Password: password123     │');
    console.log('│ Username: testuser          | Role: beginner            │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email: admin@flowstate.com  | Password: admin123        │');
    console.log('│ Username: admin             | Role: expert              │');
    console.log('├─────────────────────────────────────────────────────────┤');
    console.log('│ Email: demo@flowstate.com   | Password: demo123         │');
    console.log('│ Username: demo              | Role: intermediate        │');
    console.log('└─────────────────────────────────────────────────────────┘');

  } catch (error) {
    console.error('❌ Failed to create test users:', error);
    process.exit(1);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  createTestUsers().then(() => {
    process.exit(0);
  });
}

module.exports = { createTestUsers };