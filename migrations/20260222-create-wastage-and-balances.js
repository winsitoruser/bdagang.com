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
    const productFkType = await fkTypeFor('products', 'id');
    const userFkType = await fkTypeFor('users', 'id');
    const tenantFkType = await fkTypeFor('tenants', 'id');

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

    // Create wastage_records table
    await ensureTableMerge('wastage_records', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      wasteNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'waste_number'
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
      productId: {
        type: productFkType,
        allowNull: false,
        field: 'product_id',
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      costPerUnit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'cost_per_unit'
      },
      totalCost: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        field: 'total_cost'
      },
      wasteType: {
        type: Sequelize.ENUM('spoilage', 'error', 'theft', 'expired', 'damage', 'other'),
        allowNull: false,
        field: 'waste_type'
      },
      reason: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      wasteDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'waste_date'
      },
      reportedBy: {
        type: userFkType,
        allowNull: false,
        field: 'reported_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      verifiedBy: {
        type: userFkType,
        allowNull: true,
        field: 'verified_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'verified_at'
      },
      actionTaken: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'action_taken'
      },
      photoUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'photo_url'
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

    const transferFkType = await fkTypeFor('inventory_transfers', 'id');

    // Create inter_branch_balances table
    await ensureTableMerge('inter_branch_balances', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      fromBranchId: {
        type: branchFkType,
        allowNull: false,
        field: 'from_branch_id',
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      toBranchId: {
        type: branchFkType,
        allowNull: false,
        field: 'to_branch_id',
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      transactionType: {
        type: Sequelize.ENUM('stock_transfer', 'settlement', 'loan', 'payment'),
        allowNull: false,
        field: 'transaction_type'
      },
      referenceId: {
        type: transferFkType,
        allowNull: false,
        field: 'reference_id',
        comment: 'Reference to transfer, settlement, or other transaction'
      },
      referenceType: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: 'reference_type'
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        comment: 'Amount owed (positive) or to be received (negative)'
      },
      status: {
        type: Sequelize.ENUM('pending', 'partial', 'cleared', 'overdue'),
        allowNull: false,
        defaultValue: 'pending'
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'due_date'
      },
      clearedAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'cleared_amount'
      },
      lastPaymentDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'last_payment_date'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    const ppDesc = await queryInterface.describeTable('product_prices');
    if (!ppDesc.is_standard) {
      await queryInterface.addColumn('product_prices', 'is_standard', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_standard',
        comment: 'If true, branch cannot modify price locally'
      });
    }

    if ((await queryInterface.showAllTables()).includes('productions')) {
      const prodTbl = await queryInterface.describeTable('productions');
      if (!prodTbl.distributed_at) {
        await queryInterface.addColumn('productions', 'distributed_at', {
          type: Sequelize.DATE,
          allowNull: true,
          field: 'distributed_at',
          comment: 'When production was distributed to branches'
        });
      }
    }

    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS wastage_records_waste_number ON wastage_records (waste_number);
      CREATE INDEX IF NOT EXISTS wastage_records_branch_id ON wastage_records (branch_id);
      CREATE INDEX IF NOT EXISTS wastage_records_product_id ON wastage_records (product_id);
      CREATE INDEX IF NOT EXISTS wastage_records_waste_type ON wastage_records (waste_type);
      CREATE INDEX IF NOT EXISTS wastage_records_waste_date ON wastage_records (waste_date);
      CREATE INDEX IF NOT EXISTS wastage_records_reported_by ON wastage_records (reported_by);
      CREATE INDEX IF NOT EXISTS wastage_records_tenant_id ON wastage_records (tenant_id);
      CREATE INDEX IF NOT EXISTS inter_branch_balances_branches ON inter_branch_balances (from_branch_id, to_branch_id);
      CREATE INDEX IF NOT EXISTS inter_branch_balances_ref ON inter_branch_balances (reference_id, reference_type);
      CREATE INDEX IF NOT EXISTS inter_branch_balances_transaction_type ON inter_branch_balances (transaction_type);
      CREATE INDEX IF NOT EXISTS inter_branch_balances_status ON inter_branch_balances (status);
      CREATE INDEX IF NOT EXISTS inter_branch_balances_due_date ON inter_branch_balances (due_date);
      CREATE INDEX IF NOT EXISTS inter_branch_balances_tenant_id ON inter_branch_balances (tenant_id);
      CREATE INDEX IF NOT EXISTS product_prices_is_standard ON product_prices (is_standard);
    `);

    // Create trigger to update inter_branch_balances when transfers are completed
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_inter_branch_balance()
      RETURNS TRIGGER AS $$
      BEGIN
        -- When transfer is received, update the balance
        IF NEW.status = 'received' AND OLD.status != 'received' THEN
          UPDATE inter_branch_balances SET
            status = CASE 
              WHEN ABS(amount - cleared_amount - NEW.total_price) < 0.01 THEN 'cleared'
              WHEN cleared_amount > 0 THEN 'partial'
              ELSE 'pending'
            END,
            cleared_amount = LEAST(cleared_amount + NEW.total_price, amount),
            last_payment_date = NOW(),
            updated_at = NOW()
          WHERE reference_id = NEW.id
          AND reference_type = 'transfer';
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    const hasInvTransfers = (await queryInterface.showAllTables()).includes(
      'inventory_transfers'
    );
    if (hasInvTransfers) {
      await queryInterface.sequelize.query(`
        DROP TRIGGER IF EXISTS trigger_update_inter_branch_balance ON inventory_transfers;
        CREATE TRIGGER trigger_update_inter_branch_balance
          AFTER UPDATE ON inventory_transfers
          FOR EACH ROW
          EXECUTE FUNCTION update_inter_branch_balance();
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop triggers
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS trigger_update_inter_branch_balance ON inventory_transfers'
    );
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS update_inter_branch_balance()');

    // Remove indexes
    await queryInterface.removeIndex('product_prices', ['is_standard']);
    
    await queryInterface.removeIndex('inter_branch_balances', ['tenant_id']);
    await queryInterface.removeIndex('inter_branch_balances', ['due_date']);
    await queryInterface.removeIndex('inter_branch_balances', ['status']);
    await queryInterface.removeIndex('inter_branch_balances', ['transaction_type']);
    await queryInterface.removeIndex('inter_branch_balances', ['reference_id', 'reference_type']);
    await queryInterface.removeIndex('inter_branch_balances', ['from_branch_id', 'to_branch_id']);
    
    await queryInterface.removeIndex('wastage_records', ['tenant_id']);
    await queryInterface.removeIndex('wastage_records', ['reported_by']);
    await queryInterface.removeIndex('wastage_records', ['waste_date']);
    await queryInterface.removeIndex('wastage_records', ['waste_type']);
    await queryInterface.removeIndex('wastage_records', ['product_id']);
    await queryInterface.removeIndex('wastage_records', ['branch_id']);
    await queryInterface.removeIndex('wastage_records', ['waste_number']);

    // Remove columns
    await queryInterface.removeColumn('productions', 'distributed_at');
    await queryInterface.removeColumn('product_prices', 'is_standard');

    // Drop tables
    await queryInterface.dropTable('inter_branch_balances');
    await queryInterface.dropTable('wastage_records');
  }
};
