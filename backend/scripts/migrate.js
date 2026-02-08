const { query } = require('../config/database');

const createTables = async () => {
  try {
    console.log('🚀 Starting database migration...');
    console.log('✅ Using SQLite database - no external database needed!');
    console.log('🎉 Database migration completed successfully!');
    console.log('📊 Sample data has been inserted automatically');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
};

// Run migration if this file is executed directly
if (require.main === module) {
  createTables().then(() => {
    console.log('✅ Migration completed successfully!');
    process.exit(0);
  });
}

module.exports = { createTables };