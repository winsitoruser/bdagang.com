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

    const cashierFkType = await fkTypeFor('employees', 'id');
    const customerFkType = await fkTypeFor('customers', 'id');

    const heldTransactionsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      hold_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      cashier_id: {
        type: cashierFkType,
        allowNull: false,
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      customer_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      customer_id: {
        type: customerFkType,
        allowNull: true,
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },

      cart_items: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      subtotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      discount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      tax: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      total: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },

      customer_type: {
        type: Sequelize.STRING(20),
        defaultValue: 'walk-in'
      },
      selected_member: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      selected_voucher: {
        type: Sequelize.JSONB,
        allowNull: true
      },

      hold_reason: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },

      status: {
        type: Sequelize.ENUM('held', 'resumed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'held'
      },
      held_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      resumed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      completed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    };

    await ensureTableMerge('held_transactions', heldTransactionsDef);

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_held_transactions_cashier ON "held_transactions" ("cashier_id")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_held_transactions_status ON "held_transactions" ("status")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_held_transactions_held_at ON "held_transactions" ("held_at")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_held_transactions_hold_number ON "held_transactions" ("hold_number")'
    );

    const posD = await queryInterface.describeTable('pos_transactions');
    if (!posD.held_transaction_id) {
      await queryInterface.addColumn('pos_transactions', 'held_transaction_id', {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'held_transactions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }
    if (!posD.was_held) {
      await queryInterface.addColumn('pos_transactions', 'was_held', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('pos_transactions', 'was_held');
    await queryInterface.removeColumn('pos_transactions', 'held_transaction_id');

    await queryInterface.dropTable('held_transactions');
  }
};
