// Simple SQLite Database Viewer
// Run: node view-database.js

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

console.log('\n📊 SQLite Database Viewer\n');
console.log('='.repeat(80));

// Get all tables
db.all("SELECT name FROM sqlite_master WHERE type='table'", [], (err, tables) => {
  if (err) {
    console.error('Error:', err);
    return;
  }

  console.log('\n📋 Available Tables:\n');
  tables.forEach((table, index) => {
    console.log(`${index + 1}. ${table.name}`);
  });

  // Show users table
  console.log('\n' + '='.repeat(80));
  console.log('\n👥 USERS TABLE:\n');
  db.all('SELECT id, email, username, role, created_at FROM users LIMIT 10', [], (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else if (rows.length === 0) {
      console.log('No users found');
    } else {
      console.table(rows);
    }
  });

  // Show learning modules
  console.log('\n' + '='.repeat(80));
  console.log('\n📚 LEARNING MODULES:\n');
  db.all('SELECT id, title, category, difficulty FROM learning_modules LIMIT 10', [], (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else if (rows.length === 0) {
      console.log('No modules found');
    } else {
      console.table(rows);
    }
  });

  // Show AI interactions
  console.log('\n' + '='.repeat(80));
  console.log('\n🤖 RECENT AI INTERACTIONS:\n');
  db.all('SELECT user_id, prompt_type, created_at FROM ai_interactions ORDER BY created_at DESC LIMIT 5', [], (err, rows) => {
    if (err) {
      console.error('Error:', err);
    } else if (rows.length === 0) {
      console.log('No AI interactions yet');
    } else {
      console.table(rows);
    }

    // Close database
    db.close();
    console.log('\n' + '='.repeat(80));
    console.log('\n✅ Database viewer closed\n');
  });
});
