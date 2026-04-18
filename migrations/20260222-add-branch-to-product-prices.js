'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    const d = await queryInterface.describeTable('product_prices');
    if (!d.branch_id) {
      await queryInterface.addColumn('product_prices', 'branch_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
    }

    await sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_indexes WHERE indexname = 'product_prices_product_branch_unique'
        ) THEN
          CREATE UNIQUE INDEX product_prices_product_branch_unique
          ON "product_prices" ("product_id", "branch_id");
        END IF;
      END $$;
    `);

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS product_prices_branch_id ON "product_prices" ("branch_id")'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('product_prices', 'product_prices_product_branch_unique');
    await queryInterface.removeIndex('product_prices', 'product_prices_branch_id');
    await queryInterface.removeColumn('product_prices', 'branch_id');
  }
};
