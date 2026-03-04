const fs = require('fs');
const { Client } = require('pg');

async function run() {
    let sql = fs.readFileSync('db-schema.sql', 'utf8');

    // Fix sequences
    sql = sql.replace(/integer DEFAULT nextval\([^)]+\)/g, 'SERIAL');
    sql = sql.replace(/bigint DEFAULT nextval\([^)]+\)/g, 'BIGSERIAL');

    // Quote camelCase column names in definitions
    sql = sql.replace(/^[ \t]+([a-z]+[A-Z][a-zA-Z0-9_]*)(?=\s)/gm, '  "$1"');

    // Fix duplicate columns in UNIQUE and quote camelCase
    sql = sql.replace(/UNIQUE \(([^)]+)\)/g, (match, cols) => {
        const parts = cols.split(',').map(s => {
            let t = s.trim();
            if (t.match(/^[a-z]+[A-Z][a-zA-Z0-9_]*$/)) return `"${t}"`;
            return t;
        });
        const uniqueParts = [...new Set(parts)];
        return `UNIQUE (${uniqueParts.join(', ')})`;
    });

    // Fix camelCase inside FOREIGN KEY
    sql = sql.replace(/FOREIGN KEY \(([^)]+)\)/g, (match, cols) => {
        const parts = cols.split(',').map(s => {
            let t = s.trim();
            if (t.match(/^[a-z]+[A-Z][a-zA-Z0-9_]*$/)) return `"${t}"`;
            return t;
        });
        return `FOREIGN KEY (${parts.join(', ')})`;
    });

    // Keep existing indexes with quotes properly cased
    sql = sql.replace(/USING btree \(([^)]+)\)/g, (match, cols) => {
        const parts = cols.split(',').map(s => {
            let t = s.trim();
            let inner = t.match(/^"([^"]+)"$/);
            let colName = inner ? inner[1] : t;
            if (colName.match(/^[a-z]+[A-Z][a-zA-Z0-9_]*$/)) {
                return `"${colName}"`;
            }
            return t;
        });
        return `USING btree (${parts.join(', ')})`;
    });

    // Separate FK constraints
    const lines = sql.split('\n');
    const normalLines = [];
    const fkLines = [];

    for (const line of lines) {
        if (line.match(/ALTER TABLE .* ADD CONSTRAINT .* FOREIGN KEY/)) {
            fkLines.push(line);
        } else {
            normalLines.push(line);
        }
    }

    const finalSql = normalLines.join('\n') + '\n\n-- FOREIGN KEYS --\n' + fkLines.join('\n');

    fs.writeFileSync('db-schema-fixed.sql', finalSql);
    console.log('Fixed SQL prepared');

    const client = new Client({
        connectionString: 'postgresql://postgres:password@localhost:5432/bedagang_dev'
    });

    try {
        await client.connect();
        console.log('Connected to database');
        await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public; GRANT ALL ON SCHEMA public TO postgres; GRANT ALL ON SCHEMA public TO public;');
        console.log('Reset public schema');
        await client.query(finalSql);
        console.log('Successfully executed db-schema.sql into bedagang_dev');
    } catch (err) {
        console.error('Error executing query', err);
        process.exit(1);
    } finally {
        await client.end();
    }
}

run();
