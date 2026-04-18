'use strict';

/**
 * Menyelaraskan kitchen_order_items.product_id dengan products.id (INTEGER).
 * Jika kolom masih UUID / tipe lain, data baris yang ada dihapus lalu kolom diganti (dev-safe).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const allTables = await queryInterface.showAllTables();
    if (!allTables.includes('kitchen_order_items') || !allTables.includes('products')) return;

    const [cols] = await queryInterface.sequelize.query(`
      SELECT data_type
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'kitchen_order_items'
        AND column_name = 'product_id'
    `);
    if (!cols.length) return;
    const dt = (cols[0].data_type || '').toLowerCase();
    if (dt === 'integer') return;

    await queryInterface.sequelize.query(`
      ALTER TABLE kitchen_order_items DROP CONSTRAINT IF EXISTS kitchen_order_items_product_id_fkey;
    `);

    const countRows = await queryInterface.sequelize.query(
      `SELECT COUNT(*)::int AS c FROM kitchen_order_items`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const c = Array.isArray(countRows) && countRows[0] ? countRows[0].c : 0;
    if (c > 0) {
      await queryInterface.sequelize.query(`DELETE FROM kitchen_order_items`);
    }

    await queryInterface.sequelize.query(`
      ALTER TABLE kitchen_order_items DROP COLUMN IF EXISTS product_id;
    `);

    await queryInterface.addColumn('kitchen_order_items', 'product_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: { model: 'products', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  },

  async down() {
    // Revert tidak aman tanpa backup tipe UUID lama
  }
};
