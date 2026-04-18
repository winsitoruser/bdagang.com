'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const desc = await queryInterface.describeTable('inventory_stock');
    const addIfMissing = async (column, options) => {
      if (desc[column]) return;
      await queryInterface.addColumn('inventory_stock', column, options);
      desc[column] = true;
    };

    await addIfMissing('batch_number', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Batch or lot number for tracking'
    });

    await addIfMissing('expiry_date', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Expiry date for perishable items'
    });

    const seq = queryInterface.sequelize;
    await seq.query(`
      CREATE INDEX IF NOT EXISTS inventory_stock_batch_number_idx ON inventory_stock (batch_number);
      CREATE INDEX IF NOT EXISTS inventory_stock_expiry_date_idx ON inventory_stock (expiry_date);
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex(
      'inventory_stock',
      'inventory_stock_expiry_date_idx'
    );
    await queryInterface.removeIndex(
      'inventory_stock',
      'inventory_stock_batch_number_idx'
    );
    await queryInterface.removeColumn('inventory_stock', 'expiry_date');
    await queryInterface.removeColumn('inventory_stock', 'batch_number');
  }
};
