const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres:password@localhost:5432/bedagang_dev' });
client.connect().then(() => client.query("SELECT * FROM information_schema.columns WHERE table_name='employees'")).then(res => { console.log(res.rows.map(r => r.column_name)); return client.end() }).catch(console.error);
