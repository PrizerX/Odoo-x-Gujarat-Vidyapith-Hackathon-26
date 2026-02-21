import { PGlite } from '@electric-sql/pglite';

console.log('🔧 Starting database migration...');

const db = new PGlite('idb://fleetflow-db');

try {
  // Add distance and revenue columns to trips table
  console.log('Adding distance column to trips...');
  await db.exec(`
    DO $$ 
    BEGIN
      BEGIN
        ALTER TABLE trips ADD COLUMN distance DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE 'distance column added';
      EXCEPTION
        WHEN duplicate_column THEN
          RAISE NOTICE 'distance column already exists';
      END;
    END $$;
  `);

  console.log('Adding revenue column to trips...');
  await db.exec(`
    DO $$ 
    BEGIN
      BEGIN
        ALTER TABLE trips ADD COLUMN revenue DECIMAL(10, 2) DEFAULT 0;
        RAISE NOTICE 'revenue column added';
      EXCEPTION
        WHEN duplicate_column THEN
          RAISE NOTICE 'revenue column already exists';
      END;
    END $$;
  `);

  // Verify tables exist
  const result = await db.query(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'trips' 
    ORDER BY ordinal_position;
  `);

  console.log('\n✅ Trips table columns:');
  result.rows.forEach((row) => {
    console.log(`  - ${row.column_name}`);
  });

  // Check expenses table
  const expensesCheck = await db.query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_name = 'expenses'
    );
  `);

  console.log(`\n✅ Expenses table exists: ${expensesCheck.rows[0].exists}`);

  console.log('\n🎉 Migration completed successfully!');
  console.log('Please restart your dev server (npm run dev)');

} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  await db.close();
}
