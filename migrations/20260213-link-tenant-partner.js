'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

    const pgUdtToSequelizeType = (udt) => {
      if (!udt) return Sequelize.UUID;
      const u = String(udt).toLowerCase();
      if (u === 'uuid') return Sequelize.UUID;
      if (u === 'int4' || u === 'integer') return Sequelize.INTEGER;
      if (u === 'int8') return Sequelize.BIGINT;
      return Sequelize.UUID;
    };

    const [rows] = await sequelize.query(
      `SELECT udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'partners' AND column_name = 'id'`
    );
    const partnerFkType = pgUdtToSequelizeType(rows[0]?.udt_name);

    const td = await queryInterface.describeTable('tenants');
    if (!td.partner_id) {
      await queryInterface.addColumn('tenants', 'partner_id', {
        type: partnerFkType,
        references: {
          model: 'partners',
          key: 'id'
        },
        onDelete: 'SET NULL',
        allowNull: true
      });
    }

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_tenants_partner ON "tenants" ("partner_id")'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('tenants', 'idx_tenants_partner');
    await queryInterface.removeColumn('tenants', 'partner_id');
  }
};
