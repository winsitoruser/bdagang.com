'use strict';

/**
 * Multi-tenant: tenant_id (+ optional branch_id) pada tables & reservations,
 * unique (tenant_id, table_number) dan (tenant_id, reservation_number).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const allTables = await queryInterface.showAllTables();
    const qi = queryInterface;
    const q = qi.sequelize.query.bind(qi.sequelize);

    const safeAddColumn = async (tableName, column, definition) => {
      if (!allTables.includes(tableName)) return;
      const desc = await qi.describeTable(tableName);
      if (desc[column]) return;
      await qi.addColumn(tableName, column, definition);
    };

    await safeAddColumn('tables', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'tenants', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await safeAddColumn('reservations', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: { model: 'tenants', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    if (allTables.includes('branches')) {
      await safeAddColumn('tables', 'branch_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'branches', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
      await safeAddColumn('reservations', 'branch_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'branches', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    const [tenantRows] = await q(
      `SELECT id FROM tenants ORDER BY created_at ASC NULLS LAST LIMIT 1`
    );
    const defaultTenantId = tenantRows && tenantRows[0] && tenantRows[0].id;

    if (defaultTenantId) {
      await q(`UPDATE tables SET tenant_id = :tid WHERE tenant_id IS NULL`, {
        replacements: { tid: defaultTenantId }
      });
      await q(`UPDATE reservations SET tenant_id = :tid WHERE tenant_id IS NULL`, {
        replacements: { tid: defaultTenantId }
      });
    }

    await q(`
      DO $$ BEGIN
        ALTER TABLE tables DROP CONSTRAINT IF EXISTS tables_table_number_key;
      EXCEPTION WHEN undefined_object THEN NULL; END $$;
    `);
    await q(`
      DO $$ BEGIN
        ALTER TABLE reservations DROP CONSTRAINT IF EXISTS reservations_reservation_number_key;
      EXCEPTION WHEN undefined_object THEN NULL; END $$;
    `);

    await q(`CREATE INDEX IF NOT EXISTS idx_tables_tenant_id ON tables (tenant_id)`);
    await q(`CREATE INDEX IF NOT EXISTS idx_reservations_tenant_id ON reservations (tenant_id)`);
    await q(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_tables_tenant_table_number
      ON tables (tenant_id, table_number)
      WHERE tenant_id IS NOT NULL
    `);
    await q(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_tenant_number
      ON reservations (tenant_id, reservation_number)
      WHERE tenant_id IS NOT NULL
    `);
  },

  async down(queryInterface) {
    const q = queryInterface.sequelize.query.bind(queryInterface.sequelize);
    await q(`DROP INDEX IF EXISTS idx_tables_tenant_table_number`);
    await q(`DROP INDEX IF EXISTS idx_reservations_tenant_number`);
    await q(`DROP INDEX IF EXISTS idx_tables_tenant_id`);
    await q(`DROP INDEX IF EXISTS idx_reservations_tenant_id`);

    const allTables = await queryInterface.showAllTables();
    if (allTables.includes('tables')) {
      const d = await queryInterface.describeTable('tables');
      if (d.branch_id) await queryInterface.removeColumn('tables', 'branch_id');
      if (d.tenant_id) await queryInterface.removeColumn('tables', 'tenant_id');
    }
    if (allTables.includes('reservations')) {
      const d = await queryInterface.describeTable('reservations');
      if (d.branch_id) await queryInterface.removeColumn('reservations', 'branch_id');
      if (d.tenant_id) await queryInterface.removeColumn('reservations', 'tenant_id');
    }
  }
};
