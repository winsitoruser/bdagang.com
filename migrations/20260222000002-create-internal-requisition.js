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

    const branchFkType = await fkTypeFor('branches', 'id');
    const userFkType = await fkTypeFor('users', 'id');
    const productFkType = await fkTypeFor('products', 'id');

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

    await ensureTableMerge('internal_requisitions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      ir_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      requesting_branch_id: {
        type: branchFkType,
        allowNull: false,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      fulfilling_branch_id: {
        type: branchFkType,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      request_type: {
        type: Sequelize.ENUM(
          'restock',
          'new_item',
          'emergency',
          'scheduled',
          'transfer'
        ),
        defaultValue: 'restock'
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: 'normal'
      },
      status: {
        type: Sequelize.ENUM(
          'draft',
          'submitted',
          'under_review',
          'approved',
          'partially_approved',
          'rejected',
          'processing',
          'ready_to_ship',
          'in_transit',
          'delivered',
          'completed',
          'cancelled'
        ),
        defaultValue: 'draft'
      },
      requested_delivery_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      actual_delivery_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      total_items: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_quantity: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      estimated_value: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requested_by: {
        type: userFkType,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      reviewed_by: {
        type: userFkType,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      approved_by: {
        type: userFkType,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      consolidated_po_id: {
        type: Sequelize.UUID,
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

    await ensureTableMerge('internal_requisition_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      requisition_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'internal_requisitions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: productFkType,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      requested_quantity: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      approved_quantity: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      fulfilled_quantity: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      unit: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      current_stock: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      min_stock: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      estimated_unit_cost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      estimated_total_cost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'approved',
          'partially_approved',
          'rejected',
          'fulfilled'
        ),
        defaultValue: 'pending'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      rejection_reason: {
        type: Sequelize.TEXT,
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

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS internal_requisitions_ir_number_idx ON internal_requisitions (ir_number);
      CREATE INDEX IF NOT EXISTS internal_requisitions_requesting_branch_idx ON internal_requisitions (requesting_branch_id);
      CREATE INDEX IF NOT EXISTS internal_requisitions_status_idx ON internal_requisitions (status);
      CREATE INDEX IF NOT EXISTS internal_requisitions_priority_idx ON internal_requisitions (priority);
      CREATE INDEX IF NOT EXISTS internal_requisitions_created_at_idx ON internal_requisitions (created_at);
      CREATE INDEX IF NOT EXISTS internal_requisition_items_requisition_id_idx ON internal_requisition_items (requisition_id);
      CREATE INDEX IF NOT EXISTS internal_requisition_items_product_id_idx ON internal_requisition_items (product_id);
      CREATE INDEX IF NOT EXISTS internal_requisition_items_status_idx ON internal_requisition_items (status);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('internal_requisition_items');
    await queryInterface.dropTable('internal_requisitions');
  }
};
