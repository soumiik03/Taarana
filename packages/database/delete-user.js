const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_H4CTIMFVc5qX@ep-dry-sky-ao2rucge-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' });
pool.query("DELETE FROM users WHERE email = 'soumiktalukder03@gmail.com'")
  .then(res => { console.log('Deleted rows:', res.rowCount); pool.end(); })
  .catch(console.error);
