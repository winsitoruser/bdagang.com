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
    const userFkType = await fkTypeFor('users', 'id');
    const tenantFkType = await fkTypeFor('tenants', 'id');
    const productFkType = await fkTypeFor('products', 'id');
    const tablesPr = await queryInterface.showAllTables();
    const vendorFkType = tablesPr.includes('vendors')
      ? await fkTypeFor('vendors', 'id')
      : Sequelize.UUID;

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

    const vendorIdDef = tablesPr.includes('vendors')
      ? {
          type: vendorFkType,
          allowNull: true,
          field: 'vendor_id',
          references: { model: 'vendors', key: 'id' },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        }
      : { type: vendorFkType, allowNull: true, field: 'vendor_id' };

    // Create purchase_requisitions table
    await ensureTableMerge('purchase_requisitions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      prNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'pr_number'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
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
      department: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
        allowNull: false,
        defaultValue: 'medium'
      },
      expectedDeliveryDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'expected_delivery_date'
      },
      vendorId: vendorIdDef,
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'ordered', 'received', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      requestedBy: {
        type: userFkType,
        allowNull: false,
        field: 'requested_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approvedBy: {
        type: userFkType,
        allowNull: true,
        field: 'approved_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'approved_at'
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'rejection_reason'
      },
      orderReference: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'order_reference'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      attachmentUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'attachment_url'
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

    // Create purchase_requisition_items table
    await ensureTableMerge('purchase_requisition_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      prId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'pr_id',
        references: {
          model: 'purchase_requisitions',
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
      productName: {
        type: Sequelize.STRING(200),
        allowNull: false,
        field: 'product_name'
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'unit_price'
      },
      totalPrice: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        field: 'total_price'
      },
      receivedQuantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'received_quantity'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
      CREATE UNIQUE INDEX IF NOT EXISTS purchase_requisitions_pr_number ON purchase_requisitions (pr_number);
      CREATE INDEX IF NOT EXISTS purchase_requisitions_branch_id ON purchase_requisitions (branch_id);
      CREATE INDEX IF NOT EXISTS purchase_requisitions_vendor_id ON purchase_requisitions (vendor_id);
      CREATE INDEX IF NOT EXISTS purchase_requisitions_status ON purchase_requisitions (status);
      CREATE INDEX IF NOT EXISTS purchase_requisitions_priority ON purchase_requisitions (priority);
      CREATE INDEX IF NOT EXISTS purchase_requisitions_department ON purchase_requisitions (department);
      CREATE INDEX IF NOT EXISTS purchase_requisitions_requested_by ON purchase_requisitions (requested_by);
      CREATE INDEX IF NOT EXISTS purchase_requisitions_approved_by ON purchase_requisitions (approved_by);
      CREATE INDEX IF NOT EXISTS purchase_requisitions_tenant_id ON purchase_requisitions (tenant_id);
      CREATE INDEX IF NOT EXISTS purchase_requisitions_created_at ON purchase_requisitions (created_at);
      CREATE INDEX IF NOT EXISTS purchase_requisition_items_pr_id ON purchase_requisition_items (pr_id);
      CREATE INDEX IF NOT EXISTS purchase_requisition_items_product_id ON purchase_requisition_items (product_id);
      CREATE INDEX IF NOT EXISTS purchase_requisition_items_sku ON purchase_requisition_items (sku);
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS purchase_requisition_items_sku;
      DROP INDEX IF EXISTS purchase_requisition_items_product_id;
      DROP INDEX IF EXISTS purchase_requisition_items_pr_id;
      DROP INDEX IF EXISTS purchase_requisitions_created_at;
      DROP INDEX IF EXISTS purchase_requisitions_tenant_id;
      DROP INDEX IF EXISTS purchase_requisitions_approved_by;
      DROP INDEX IF EXISTS purchase_requisitions_requested_by;
      DROP INDEX IF EXISTS purchase_requisitions_department;
      DROP INDEX IF EXISTS purchase_requisitions_priority;
      DROP INDEX IF EXISTS purchase_requisitions_status;
      DROP INDEX IF EXISTS purchase_requisitions_vendor_id;
      DROP INDEX IF EXISTS purchase_requisitions_branch_id;
      DROP INDEX IF EXISTS purchase_requisitions_pr_number;
    `);

    // Drop tables
    await queryInterface.dropTable('purchase_requisition_items');
    await queryInterface.dropTable('purchase_requisitions');
  }
};
