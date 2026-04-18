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

    const fkTypeFor = async (tableName, columnName = 'id') => {
      const [rows] = await sequelize.query(
        `SELECT udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}' AND column_name = '${columnName}'`
      );
      return pgUdtToSequelizeType(rows[0]?.udt_name);
    };

    const ensureTableMerge = async (tableName, tableDef) => {
      const tableList = await queryInterface.showAllTables();
      if (!tableList.includes(tableName)) {
        await queryInterface.createTable(tableName, tableDef);
        return;
      }
      const d = await queryInterface.describeTable(tableName);
      for (const [col, def] of Object.entries(tableDef)) {
        if (d[col]) continue;
        const { comment: _c, ...rest } = def;
        await queryInterface.addColumn(tableName, col, rest);
        d[col] = true;
      }
    };

    const partnerPkType = await fkTypeFor('partners', 'id');
    const outletPkType = await fkTypeFor('partner_outlets', 'id');
    const userPkType = await fkTypeFor('users', 'id');

    const partnerIntegrationsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      partner_id: {
        type: partnerPkType,
        allowNull: false,
        references: {
          model: 'partners',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      integration_type: {
        type: Sequelize.ENUM('payment_gateway', 'whatsapp', 'email_smtp'),
        allowNull: false
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      configuration: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      test_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_tested_at: {
        type: Sequelize.DATE
      },
      last_test_status: {
        type: Sequelize.ENUM('success', 'failed', 'pending')
      },
      last_test_message: {
        type: Sequelize.TEXT
      },
      created_by: {
        type: userPkType
      },
      updated_by: {
        type: userPkType
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    };
    await ensureTableMerge('partner_integrations', partnerIntegrationsDef);

    const outletIntegrationsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      outlet_id: {
        type: outletPkType,
        allowNull: false,
        references: {
          model: 'partner_outlets',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      integration_type: {
        type: Sequelize.ENUM('payment_gateway', 'whatsapp', 'email_smtp'),
        allowNull: false
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      configuration: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      },
      test_mode: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      use_partner_config: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      last_tested_at: {
        type: Sequelize.DATE
      },
      last_test_status: {
        type: Sequelize.ENUM('success', 'failed', 'pending')
      },
      last_test_message: {
        type: Sequelize.TEXT
      },
      created_by: {
        type: userPkType
      },
      updated_by: {
        type: userPkType
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    };
    await ensureTableMerge('outlet_integrations', outletIntegrationsDef);

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS partner_integrations_partner_id ON "partner_integrations" ("partner_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS partner_integrations_integration_type ON "partner_integrations" ("integration_type")'
    );
    await sequelize.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS partner_integrations_unique ON "partner_integrations" ("partner_id", "integration_type", "provider")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS outlet_integrations_outlet_id ON "outlet_integrations" ("outlet_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS outlet_integrations_integration_type ON "outlet_integrations" ("integration_type")'
    );
    await sequelize.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS outlet_integrations_unique ON "outlet_integrations" ("outlet_id", "integration_type", "provider")'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('outlet_integrations');
    await queryInterface.dropTable('partner_integrations');
  }
};
