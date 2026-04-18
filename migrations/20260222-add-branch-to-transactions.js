'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    const tableList = await queryInterface.showAllTables();
    const addIfMissing = async (table) => {
      if (!tableList.includes(table)) return;
      const d = await queryInterface.describeTable(table);
      if (d.branch_id) return;
      await queryInterface.addColumn(table, 'branch_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    };

    await addIfMissing('pos_transactions');
    await addIfMissing('stock_movements');
    await addIfMissing('finance_transactions');
    await addIfMissing('productions');
    await addIfMissing('shifts');

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_pos_transactions_branch ON "pos_transactions" ("branch_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_stock_movements_branch ON "stock_movements" ("branch_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_finance_transactions_branch ON "finance_transactions" ("branch_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_productions_branch ON "productions" ("branch_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_shifts_branch ON "shifts" ("branch_id")'
    );
  },

  down: async (queryInterface, Sequelize) => {
    const tables = [
      'pos_transactions',
      'stock_movements',
      'finance_transactions',
      'productions',
      'shifts'
    ];
    for (const table of tables) {
      try {
        await queryInterface.removeColumn(table, 'branch_id');
      } catch (_e) {
        /* column may not exist */
      }
    }
  }
};
