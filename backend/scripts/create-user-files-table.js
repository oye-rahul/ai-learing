const { query } = require('../config/database');

async function createUserFilesTable() {
  try {
    console.log('Creating user_files table...');

    await query(`
      CREATE TABLE IF NOT EXISTS user_files (
        id VARCHAR(255) PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        content TEXT,
        language VARCHAR(50),
        type VARCHAR(50) DEFAULT 'file',
        path VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ user_files table created successfully!');

    // Create index for faster queries
    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_files_user_id ON user_files(user_id)
    `);

    console.log('✅ Index created successfully!');

  } catch (error) {
    console.error('❌ Error creating user_files table:', error);
    throw error;
  }
}

// Run if called directly
if (require.main === module) {
  createUserFilesTable()
    .then(() => {
      console.log('Migration completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = { createUserFilesTable };
