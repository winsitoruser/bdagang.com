'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
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

    const userFkType = await fkTypeFor('users', 'id');
    const branchFkType = await fkTypeFor('branches', 'id');

    let tablesNow = await queryInterface.showAllTables();
    const ensureTableMerge = async (tableName, tableDef) => {
      if (!tablesNow.includes(tableName)) {
        await queryInterface.createTable(tableName, tableDef);
        tablesNow.push(tableName);
        return;
      }
      const d = await queryInterface.describeTable(tableName);
      for (const [attrName, def] of Object.entries(tableDef)) {
        if (!def || typeof def !== 'object') continue;
        const colName = def.field ? def.field : attrName;
        if (d[colName]) continue;
        const { field: _f, comment: _c, ...rest } = def;
        await queryInterface.addColumn(tableName, colName, rest);
        d[colName] = true;
      }
    };

    await ensureTableMerge('price_tiers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      multiplier: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 1.0
      },
      markup_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      },
      markup_amount: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      region: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      location_type: {
        type: Sequelize.ENUM(
          'airport',
          'mall',
          'street',
          'tourist_area',
          'residential',
          'office_area',
          'custom'
        ),
        defaultValue: 'custom'
      },
      priority: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      effective_from: {
        type: Sequelize.DATE,
        allowNull: true
      },
      effective_until: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_by: {
        type: userFkType,
        allowNull: true
      },
      updated_by: {
        type: userFkType,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    const pp = await queryInterface.describeTable('product_prices');

    if (!pp.is_standard) {
      await queryInterface.addColumn('product_prices', 'is_standard', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment:
          'Harga standar dari Pusat - tidak bisa diubah oleh BRANCH_MANAGER'
      });
    }

    if (!pp.branch_id) {
      await queryInterface.addColumn('product_prices', 'branch_id', {
        type: branchFkType,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    if (!pp.price_tier_id) {
      await queryInterface.addColumn('product_prices', 'price_tier_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'price_tiers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    if (!pp.locked_by) {
      await queryInterface.addColumn('product_prices', 'locked_by', {
        type: userFkType,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    if (!pp.locked_at) {
      await queryInterface.addColumn('product_prices', 'locked_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    if (!pp.requires_approval) {
      await queryInterface.addColumn('product_prices', 'requires_approval', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });
    }

    if (!pp.approval_status) {
      await queryInterface.addColumn('product_prices', 'approval_status', {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: true
      });
    }

    if (!pp.approved_by) {
      await queryInterface.addColumn('product_prices', 'approved_by', {
        type: userFkType,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    if (!pp.approved_at) {
      await queryInterface.addColumn('product_prices', 'approved_at', {
        type: Sequelize.DATE,
        allowNull: true
      });
    }

    const br = await queryInterface.describeTable('branches');
    if (!br.price_tier_id) {
      await queryInterface.addColumn('branches', 'price_tier_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'price_tiers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS product_prices_is_standard_idx ON product_prices (is_standard);
      CREATE INDEX IF NOT EXISTS product_prices_branch_id_idx ON product_prices (branch_id);
      CREATE INDEX IF NOT EXISTS product_prices_price_tier_id_idx ON product_prices (price_tier_id);
      CREATE INDEX IF NOT EXISTS price_tiers_code_idx ON price_tiers (code);
      CREATE INDEX IF NOT EXISTS price_tiers_location_type_idx ON price_tiers (location_type);
      CREATE INDEX IF NOT EXISTS price_tiers_is_active_idx ON price_tiers (is_active);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS price_tiers_is_active_idx;
      DROP INDEX IF EXISTS price_tiers_location_type_idx;
      DROP INDEX IF EXISTS price_tiers_code_idx;
      DROP INDEX IF EXISTS product_prices_price_tier_id_idx;
      DROP INDEX IF EXISTS product_prices_branch_id_idx;
      DROP INDEX IF EXISTS product_prices_is_standard_idx;
    `);

    const br = await queryInterface.describeTable('branches').catch(() => null);
    if (br?.price_tier_id) {
      await queryInterface.removeColumn('branches', 'price_tier_id');
    }

    const pp = await queryInterface.describeTable('product_prices');
    const dropIf = async (col) => {
      if (pp[col]) await queryInterface.removeColumn('product_prices', col);
    };
    await dropIf('approved_at');
    await dropIf('approved_by');
    await dropIf('approval_status');
    await dropIf('requires_approval');
    await dropIf('locked_at');
    await dropIf('locked_by');
    await dropIf('price_tier_id');
    await dropIf('branch_id');
    await dropIf('is_standard');

    await queryInterface.dropTable('price_tiers');
  }
};
