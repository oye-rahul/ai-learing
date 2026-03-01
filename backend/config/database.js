const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create SQLite database
// On Vercel or in production environments with read-only filesystems, 
// we use the /tmp directory which is writable.
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const dbPath = isVercel
  ? path.join('/tmp', 'database.sqlite')
  : path.join(__dirname, '../database.sqlite');

console.log(`🗄️ Database Path: ${dbPath}`);
const db = new sqlite3.Database(dbPath);

// Helper function to execute queries
const query = async (text, params = []) => {
  return new Promise((resolve, reject) => {
    const isSelect = text.trim().toLowerCase().startsWith('select');

    if (isSelect) {
      db.all(text, params, (err, rows) => {
        if (err) {
          console.error('❌ Query error:', err);
          reject(err);
        } else {
          console.log('📊 Query executed', { text: text.substring(0, 50) + '...', rows: rows.length });
          resolve({ rows });
        }
      });
    } else {
      db.run(text, params, function (err) {
        if (err) {
          console.error('❌ Query error:', err);
          reject(err);
        } else {
          console.log('📊 Query executed', { text: text.substring(0, 50) + '...', changes: this.changes });
          resolve({ rows: [], rowCount: this.changes, lastID: this.lastID });
        }
      });
    }
  });
};

// Helper function to get a client from the pool (compatibility)
const getClient = async () => {
  return db;
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    console.log('🗄️ Initializing SQLite database...');

    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT CHECK (role IN ('beginner', 'intermediate', 'expert')) NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_active DATETIME
      )
    `);

    // User Progress table
    await query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        skills TEXT DEFAULT '{}',
        completed_modules TEXT DEFAULT '[]',
        current_module TEXT,
        streak_days INTEGER DEFAULT 0,
        total_learning_hours REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Learning Modules table
    await query(`
      CREATE TABLE IF NOT EXISTS learning_modules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        difficulty INTEGER CHECK (difficulty >= 1 AND difficulty <= 5) NOT NULL,
        estimated_hours REAL NOT NULL,
        prerequisites TEXT DEFAULT '[]',
        content TEXT DEFAULT '{}',
        project_template_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // AI Interactions table
    await query(`
      CREATE TABLE IF NOT EXISTS ai_interactions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        prompt_type TEXT NOT NULL,
        input_code TEXT NOT NULL,
        output TEXT NOT NULL,
        tokens_used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User Files table (for playground/IDE file storage)
    await query(`
      CREATE TABLE IF NOT EXISTS user_files (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        content TEXT DEFAULT '',
        language TEXT DEFAULT 'javascript',
        type TEXT DEFAULT 'file',
        path TEXT DEFAULT '',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User Activity table
    await query(`
      CREATE TABLE IF NOT EXISTS user_activity (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        activity_type TEXT NOT NULL,
        metadata TEXT DEFAULT '{}',
        duration_minutes INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Projects table
    await query(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        description TEXT,
        language TEXT NOT NULL,
        template_id TEXT,
        code TEXT DEFAULT '',
        collaborators TEXT DEFAULT '[]',
        is_public BOOLEAN DEFAULT FALSE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Code Snippets table
    await query(`
      CREATE TABLE IF NOT EXISTS code_snippets (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        title TEXT NOT NULL,
        code TEXT NOT NULL,
        language TEXT NOT NULL,
        ai_explanation TEXT,
        tags TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Password reset tokens
    await query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // User bookmarks (save for later - lessons/modules)
    await query(`
      CREATE TABLE IF NOT EXISTS user_bookmarks (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        module_id TEXT NOT NULL,
        lesson_index INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, module_id)
      )
    `);

    // User badges/achievements
    await query(`
      CREATE TABLE IF NOT EXISTS user_badges (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        badge_id TEXT NOT NULL,
        earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, badge_id)
      )
    `);

    // Notifications
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT,
        read INTEGER DEFAULT 0,
        link TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Share links (public read-only for projects/snippets)
    await query(`
      CREATE TABLE IF NOT EXISTS share_links (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        resource_type TEXT NOT NULL,
        resource_id TEXT NOT NULL,
        slug TEXT UNIQUE NOT NULL,
        expires_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Assessment results (skill assessment -> recommended path)
    await query(`
      CREATE TABLE IF NOT EXISTS assessment_results (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        answers TEXT NOT NULL,
        recommended_modules TEXT DEFAULT '[]',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // AI Conversations (multi-turn chat history)
    await query(`
      CREATE TABLE IF NOT EXISTS ai_conversations (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        messages TEXT NOT NULL,
        context TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Practice Problems
    await query(`
      CREATE TABLE IF NOT EXISTS practice_problems (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        problem TEXT NOT NULL,
        solution TEXT,
        difficulty TEXT,
        completed_at DATETIME
      )
    `);

    // Learning Insights
    await query(`
      CREATE TABLE IF NOT EXISTS learning_insights (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        strengths TEXT DEFAULT '[]',
        weaknesses TEXT DEFAULT '[]',
        recommendations TEXT DEFAULT '[]',
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Insert sample learning modules
    const existingModules = await query('SELECT COUNT(*) as count FROM learning_modules');
    if (existingModules.rows[0].count === 0) {
      await insertSampleData();
    }

    console.log('✅ SQLite database initialized successfully!');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

const insertSampleData = async () => {
  const sampleModules = [
    {
      id: 'web-dev-mastery',
      title: 'Web Development Mastery',
      description: 'Complete full-stack web development course with HTML, CSS, JavaScript, React, and Node.js. Build real projects and master modern web technologies with AI assistance.',
      difficulty: 2,
      estimated_hours: 24.0,
      prerequisites: '[]',
      content: JSON.stringify({
        lessons: [
          { title: 'HTML Fundamentals', duration: 45, type: 'video' },
          { title: 'CSS Styling & Layout', duration: 60, type: 'video' },
          { title: 'JavaScript Fundamentals', duration: 75, type: 'video' },
          { title: 'DOM Manipulation', duration: 50, type: 'interactive' },
          { title: 'Responsive Design', duration: 55, type: 'project' },
          { title: 'React Basics', duration: 90, type: 'video' },
          { title: 'State Management', duration: 70, type: 'interactive' },
          { title: 'API Integration', duration: 65, type: 'project' },
          { title: 'Node.js Backend', duration: 80, type: 'video' },
          { title: 'Database Integration', duration: 75, type: 'project' },
          { title: 'Authentication', duration: 60, type: 'interactive' },
          { title: 'Deployment', duration: 45, type: 'project' },
        ],
        features: ['Interactive coding exercises', 'Real-world projects', 'AI tutoring', 'Certificate of completion'],
        track: 'Web Development'
      })
    },
    {
      id: 'js-fundamentals',
      title: 'JavaScript Fundamentals',
      description: 'Learn the basics of JavaScript including variables, functions, and control structures.',
      difficulty: 1,
      estimated_hours: 8.0,
      prerequisites: '[]',
      content: JSON.stringify({
        lessons: [
          { title: 'Variables and Data Types', duration: 60 },
          { title: 'Functions and Scope', duration: 90 },
          { title: 'Control Structures', duration: 75 },
          { title: 'Objects and Arrays', duration: 120 },
        ]
      })
    },
    {
      id: 'react-basics',
      title: 'React Basics',
      description: 'Introduction to React components, props, and state management.',
      difficulty: 2,
      estimated_hours: 12.0,
      prerequisites: '["JavaScript Fundamentals"]',
      content: JSON.stringify({
        lessons: [
          { title: 'Components and JSX', duration: 90 },
          { title: 'Props and State', duration: 120 },
          { title: 'Event Handling', duration: 90 },
          { title: 'Lifecycle Methods', duration: 120 },
        ]
      })
    },
    {
      id: 'python-basics',
      title: 'Python for Beginners',
      description: 'Start your programming journey with Python.',
      difficulty: 1,
      estimated_hours: 10.0,
      prerequisites: '[]',
      content: JSON.stringify({
        lessons: [
          { title: 'Python Syntax', duration: 90 },
          { title: 'Data Structures', duration: 120 },
          { title: 'Functions and Modules', duration: 105 },
          { title: 'File Handling', duration: 75 },
        ]
      })
    },
    {
      id: 'ai-machine-learning',
      title: 'AI & Machine Learning Fundamentals',
      description: 'Introduction to artificial intelligence and machine learning concepts with Python.',
      difficulty: 3,
      estimated_hours: 16.0,
      prerequisites: '["Python for Beginners"]',
      content: JSON.stringify({
        lessons: [
          { title: 'Introduction to AI', duration: 60 },
          { title: 'Data Preprocessing', duration: 90 },
          { title: 'Linear Regression', duration: 120 },
          { title: 'Classification Algorithms', duration: 135 },
          { title: 'Neural Networks', duration: 150 },
          { title: 'Deep Learning Basics', duration: 165 },
        ]
      })
    },
    {
      id: 'mobile-app-development',
      title: 'Mobile App Development with React Native',
      description: 'Build cross-platform mobile applications using React Native.',
      difficulty: 3,
      estimated_hours: 20.0,
      prerequisites: '["React Basics"]',
      content: JSON.stringify({
        lessons: [
          { title: 'React Native Setup', duration: 75 },
          { title: 'Navigation', duration: 90 },
          { title: 'State Management', duration: 105 },
          { title: 'Native Components', duration: 120 },
          { title: 'API Integration', duration: 90 },
          { title: 'Publishing Apps', duration: 60 },
        ]
      })
    }
  ];

  for (const module of sampleModules) {
    await query(`
      INSERT INTO learning_modules (id, title, description, difficulty, estimated_hours, prerequisites, content)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      module.id,
      module.title,
      module.description,
      module.difficulty,
      module.estimated_hours,
      module.prerequisites,
      module.content
    ]);
  }

  console.log('📊 Sample learning modules inserted');
};

// Initialize database on startup
initializeDatabase().catch(console.error);

module.exports = {
  query,
  getClient,
  db,
};