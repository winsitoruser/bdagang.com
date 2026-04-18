'use strict';

/** Adds tenant scoping to customers for multi-tenant API isolation. */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const hasCustomers = tables.includes('customers');
    if (!hasCustomers) return;

    const desc = await queryInterface.describeTable('customers');
    if (desc.tenant_id) return;

    await queryInterface.addColumn('customers', 'tenant_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'tenants',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.addIndex('customers', ['tenant_id'], {
      name: 'customers_tenant_id_idx'
    });
  },

  async down(queryInterface) {
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('customers')) return;
    const desc = await queryInterface.describeTable('customers');
    if (!desc.tenant_id) return;
    try {
      await queryInterface.removeIndex('customers', 'customers_tenant_id_idx');
    } catch (_) {
      /* index name may differ */
    }
    await queryInterface.removeColumn('customers', 'tenant_id');
  }
};
