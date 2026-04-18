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

    const branchFkType = await fkTypeFor('branches', 'id');
    const tenantFkType = await fkTypeFor('tenants', 'id');
    const userFkType = await fkTypeFor('users', 'id');

    const ensureTableMerge = async (tableName, tableDef) => {
      const tableList = await queryInterface.showAllTables();
      if (!tableList.includes(tableName)) {
        await queryInterface.createTable(tableName, tableDef);
        return;
      }
      const d = await queryInterface.describeTable(tableName);
      for (const [attrName, def] of Object.entries(tableDef)) {
        const colName =
          def && typeof def === 'object' && def.field ? def.field : attrName;
        if (d[colName]) continue;
        const { field: _f, comment: _c, ...rest } = def;
        await queryInterface.addColumn(tableName, colName, rest);
        d[colName] = true;
      }
    };

    // Create finance_reconciliations table (FK types match existing referenced PKs)
    await ensureTableMerge('finance_reconciliations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      branchId: {
        type: branchFkType,
        allowNull: false,
        field: 'branch_id',
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'start_date'
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'end_date'
      },
      posTotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        field: 'pos_total',
        comment: 'Total from POS transactions'
      },
      financeTotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        field: 'finance_total',
        comment: 'Total from finance transactions'
      },
      cashExpected: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        field: 'cash_expected',
        comment: 'Expected cash from shifts'
      },
      cashActual: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        field: 'cash_actual',
        comment: 'Actual cash counted'
      },
      cashDifference: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        field: 'cash_difference',
        comment: 'Difference between expected and actual cash'
      },
      status: {
        type: Sequelize.ENUM('balanced', 'minor_issues', 'requires_attention'),
        allowNull: false,
        defaultValue: 'balanced'
      },
      discrepanciesData: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'discrepancies_data',
        comment: 'Details of any discrepancies found'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      reviewedBy: {
        type: userFkType,
        allowNull: true,
        field: 'reviewed_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      reviewedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'reviewed_at'
      },
      tenantId: {
        type: tenantFkType,
        allowNull: false,
        field: 'tenant_id',
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdBy: {
        type: userFkType,
        allowNull: false,
        field: 'created_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'created_at'
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'updated_at'
      }
    });

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS finance_reconciliations_branch_id ON finance_reconciliations (branch_id);
      CREATE INDEX IF NOT EXISTS finance_reconciliations_start_date_end_date ON finance_reconciliations (start_date, end_date);
      CREATE INDEX IF NOT EXISTS finance_reconciliations_status ON finance_reconciliations (status);
      CREATE INDEX IF NOT EXISTS finance_reconciliations_tenant_id ON finance_reconciliations (tenant_id);
      CREATE INDEX IF NOT EXISTS finance_reconciliations_created_at ON finance_reconciliations (created_at);
      CREATE UNIQUE INDEX IF NOT EXISTS finance_reconciliation_branch_date_unique ON finance_reconciliations (branch_id, start_date, end_date);
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('finance_reconciliations', 'finance_reconciliation_branch_date_unique');
    await queryInterface.removeIndex('finance_reconciliations', ['created_at']);
    await queryInterface.removeIndex('finance_reconciliations', ['tenant_id']);
    await queryInterface.removeIndex('finance_reconciliations', ['status']);
    await queryInterface.removeIndex('finance_reconciliations', ['start_date', 'end_date']);
    await queryInterface.removeIndex('finance_reconciliations', ['branch_id']);

    // Drop table
    await queryInterface.dropTable('finance_reconciliations');
  }
};
