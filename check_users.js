const { query } = require('./backend/config/database');

async function checkUsers() {
    try {
        const result = await query('SELECT id, email, username FROM users');
        console.log('Users in database:', JSON.stringify(result.rows, null, 2));
    } catch (err) {
        console.error('Error checking users:', err);
    } finally {
        process.exit(0);
    }
}

checkUsers();
