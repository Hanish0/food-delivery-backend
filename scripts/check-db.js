const { Pool } = require('pg');
require('dotenv').config();

async function checkDatabase() {
    console.log('🔍 Checking database connection...\n');

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/food_delivery',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    try {
        // Test basic connection
        console.log('📡 Testing connection...');
        const client = await pool.connect();
        console.log('✅ Database connection successful!');

        // Test database version
        console.log('\n📊 Database information:');
        const versionResult = await client.query('SELECT version()');
        console.log(`   Version: ${versionResult.rows[0].version.split(' ').slice(0, 2).join(' ')}`);

        // Test database name
        const dbResult = await client.query('SELECT current_database()');
        console.log(`   Database: ${dbResult.rows[0].current_database}`);

        // Test user
        const userResult = await client.query('SELECT current_user');
        console.log(`   User: ${userResult.rows[0].current_user}`);

        // Check if tables exist
        console.log('\n📋 Checking tables:');
        const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

        if (tablesResult.rows.length > 0) {
            console.log('   Tables found:');
            tablesResult.rows.forEach(row => {
                console.log(`   ✅ ${row.table_name}`);
            });
        } else {
            console.log('   ⚠️  No tables found. Run "npm run setup-db" to create tables.');
        }

        // Check table counts
        if (tablesResult.rows.length > 0) {
            console.log('\n📈 Table record counts:');
            for (const table of tablesResult.rows) {
                try {
                    const countResult = await client.query(`SELECT COUNT(*) FROM ${table.table_name}`);
                    console.log(`   ${table.table_name}: ${countResult.rows[0].count} records`);
                } catch (error) {
                    console.log(`   ${table.table_name}: Error counting records`);
                }
            }
        }

        client.release();
        console.log('\n🎉 Database health check completed successfully!');

    } catch (error) {
        console.error('❌ Database connection failed:');
        console.error(`   Error: ${error.message}`);

        if (error.code === 'ECONNREFUSED') {
            console.error('\n💡 Possible solutions:');
            console.error('   1. Make sure PostgreSQL is running');
            console.error('   2. Check if the port 5432 is correct');
            console.error('   3. Verify the database host (localhost)');
        } else if (error.code === '3D000') {
            console.error('\n💡 Database does not exist. Create it with:');
            console.error('   createdb food_delivery');
        } else if (error.code === '28P01') {
            console.error('\n💡 Authentication failed. Check:');
            console.error('   1. Username and password in DATABASE_URL');
            console.error('   2. PostgreSQL user permissions');
        }

        process.exit(1);
    } finally {
        await pool.end();
    }
}

checkDatabase();