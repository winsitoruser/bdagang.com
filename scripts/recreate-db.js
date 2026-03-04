const sequelize = require('../lib/sequelize');

async function recreateDB() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        // Drop public schema and recreate it to wipe all tables
        await sequelize.query('DROP SCHEMA public CASCADE;');
        await sequelize.query('CREATE SCHEMA public;');

        // Grant privileges (standard for postgres public schema)
        await sequelize.query('GRANT ALL ON SCHEMA public TO postgres;');
        await sequelize.query('GRANT ALL ON SCHEMA public TO public;');

        console.log('Successfully wiped database schema.');
    } catch (error) {
        console.error('Unable to recreate database:', error);
    } finally {
        await sequelize.close();
    }
}

recreateDB();
