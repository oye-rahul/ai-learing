// Fix database constraints
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('\n🔧 Fixing Database Issues...\n');

// Check current table structure
db.all("PRAGMA table_info(ai_interactions)", [], (err, rows) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('Current ai_interactions table structure:');
  console.table(rows);
  
  // Drop and recreate the table without CHECK constraint
  console.log('\n📝 Recreating ai_interactions table...');
  
  db.serialize(() => {
    // Backup existing data
    db.run(`CREATE TABLE IF NOT EXISTS ai_interactions_backup AS SELECT * FROM ai_interactions`, (err) => {
      if (err) console.error('Backup error:', err);
      else console.log('✅ Backed up existing data');
    });
    
    // Drop old table
    db.run(`DROP TABLE IF EXISTS ai_interactions`, (err) => {
      if (err) console.error('Drop error:', err);
      else console.log('✅ Dropped old table');
    });
    
    // Create new table without CHECK constraint
    db.run(`
      CREATE TABLE ai_interactions (
        id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
        prompt_type TEXT NOT NULL,
        input_code TEXT NOT NULL,
        output TEXT NOT NULL,
        tokens_used INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) {
        console.error('Create error:', err);
      } else {
        console.log('✅ Created new table without CHECK constraint');
        
        // Restore data
        db.run(`INSERT INTO ai_interactions SELECT * FROM ai_interactions_backup`, (err) => {
          if (err) console.error('Restore error:', err);
          else console.log('✅ Restored data');
          
          // Drop backup
          db.run(`DROP TABLE IF EXISTS ai_interactions_backup`, (err) => {
            if (err) console.error('Cleanup error:', err);
            else console.log('✅ Cleaned up backup');
            
            console.log('\n🎉 Database fixed successfully!\n');
            db.close();
          });
        });
      }
    });
  });
});
