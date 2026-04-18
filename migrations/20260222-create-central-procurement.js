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
    const supplierFkType = await fkTypeFor('suppliers', 'id');
    const productFkType = await fkTypeFor('products', 'id');
    const invTransferFkType = await fkTypeFor('inventory_transfers', 'id');

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

    // Create internal_requisitions table
    const internalRequisitionsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      irNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'ir_number'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
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
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'processing', 'completed', 'cancelled'),
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
      transferId: {
        type: invTransferFkType,
        allowNull: true,
        field: 'transfer_id',
        references: {
          model: 'inventory_transfers',
          key: 'id'
        }
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
    };
    await ensureTableMerge('internal_requisitions', internalRequisitionsDef);

    const internalRequisitionPkType = await fkTypeFor('internal_requisitions', 'id');
    const supplierPriceAgreementPkType = await fkTypeFor('supplier_price_agreements', 'id');

    // Create internal_requisition_items table
    const internalRequisitionItemsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      irId: {
        type: internalRequisitionPkType,
        allowNull: false,
        field: 'ir_id',
        references: {
          model: 'internal_requisitions',
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
    };
    await ensureTableMerge('internal_requisition_items', internalRequisitionItemsDef);

    // Create supplier_price_agreements table
    const supplierPriceAgreementsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      agreementNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'agreement_number'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      supplierId: {
        type: supplierFkType,
        allowNull: false,
        field: 'supplier_id',
        references: {
          model: 'suppliers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      validFrom: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'valid_from'
      },
      validUntil: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'valid_until'
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'expired', 'terminated'),
        allowNull: false,
        defaultValue: 'active'
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
      autoApply: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'auto_apply'
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
    };
    await ensureTableMerge('supplier_price_agreements', supplierPriceAgreementsDef);

    // Create supplier_price_agreement_items table
    const supplierPriceAgreementItemsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      agreementId: {
        type: supplierPriceAgreementPkType,
        allowNull: false,
        field: 'agreement_id',
        references: {
          model: 'supplier_price_agreements',
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
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'unit_price'
      },
      minOrderQty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'min_order_qty'
      },
      maxOrderQty: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        field: 'max_order_qty'
      },
      leadTimeDays: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'lead_time_days'
      },
      qualityGrade: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: 'quality_grade'
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
    };
    await ensureTableMerge('supplier_price_agreement_items', supplierPriceAgreementItemsDef);

    // Add standard_cost to products table
    const productsD = await queryInterface.describeTable('products');
    if (!productsD.standard_cost) {
      await queryInterface.addColumn('products', 'standard_cost', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Standard cost from supplier agreement'
      });
    }

    // Create product_cost_history table (procurement; separate from HPP product_cost_history if name reused)
    const productCostHistoryProcDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
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
      oldCost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'old_cost'
      },
      newCost: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'new_cost'
      },
      reason: {
        type: Sequelize.STRING(200),
        allowNull: true
      },
      referenceType: {
        type: Sequelize.ENUM('supplier_agreement', 'manual_update', 'adjustment'),
        allowNull: true,
        field: 'reference_type'
      },
      referenceId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'reference_id'
      },
      changedBy: {
        type: userFkType,
        allowNull: false,
        field: 'changed_by',
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
      }
    };
    await ensureTableMerge('product_cost_history', productCostHistoryProcDef);

    await sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'internal_requisitions' AND column_name = 'ir_number'
        ) THEN
          EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS internal_requisitions_ir_number ON "internal_requisitions" ("ir_number")';
        END IF;
      END $$;
    `);
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS internal_requisitions_from_branch ON "internal_requisitions" ("from_branch_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS internal_requisitions_to_branch ON "internal_requisitions" ("to_branch_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS internal_requisitions_status ON "internal_requisitions" ("status")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS internal_requisitions_priority ON "internal_requisitions" ("priority")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS internal_requisitions_requested_by ON "internal_requisitions" ("requested_by")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS internal_requisitions_approved_by ON "internal_requisitions" ("approved_by")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS internal_requisitions_tenant_id ON "internal_requisitions" ("tenant_id")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS internal_requisition_items_ir_id ON "internal_requisition_items" ("ir_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS internal_requisition_items_product_id ON "internal_requisition_items" ("product_id")'
    );

    await sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'supplier_price_agreements' AND column_name = 'agreement_number'
        ) THEN
          EXECUTE 'CREATE UNIQUE INDEX IF NOT EXISTS supplier_price_agreements_agreement_number ON "supplier_price_agreements" ("agreement_number")';
        END IF;
      END $$;
    `);
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS supplier_price_agreements_supplier_id ON "supplier_price_agreements" ("supplier_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS supplier_price_agreements_status ON "supplier_price_agreements" ("status")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS supplier_price_agreements_valid_range ON "supplier_price_agreements" ("valid_from", "valid_until")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS supplier_price_agreements_tenant_id ON "supplier_price_agreements" ("tenant_id")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS supplier_price_agreement_items_agreement_id ON "supplier_price_agreement_items" ("agreement_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS supplier_price_agreement_items_product_id ON "supplier_price_agreement_items" ("product_id")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS product_cost_history_product_id ON "product_cost_history" ("product_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS product_cost_history_created_at ON "product_cost_history" ("created_at")'
    );
    await sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'product_cost_history' AND column_name = 'reference_type'
        ) AND EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'product_cost_history' AND column_name = 'reference_id'
        ) THEN
          EXECUTE 'CREATE INDEX IF NOT EXISTS product_cost_history_reference ON "product_cost_history" ("reference_type", "reference_id")';
        END IF;
      END $$;
    `);
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS product_cost_history_tenant_id ON "product_cost_history" ("tenant_id")'
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('product_cost_history', 'spa_product_unique');
    await queryInterface.removeIndex('product_cost_history', ['tenant_id']);
    await queryInterface.removeIndex('product_cost_history', ['reference_type', 'reference_id']);
    await queryInterface.removeIndex('product_cost_history', ['created_at']);
    await queryInterface.removeIndex('product_cost_history', ['product_id']);
    
    await queryInterface.removeIndex('supplier_price_agreement_items', ['product_id']);
    await queryInterface.removeIndex('supplier_price_agreement_items', ['agreement_id']);
    
    await queryInterface.removeIndex('supplier_price_agreements', ['tenant_id']);
    await queryInterface.removeIndex('supplier_price_agreements', ['valid_from', 'valid_until']);
    await queryInterface.removeIndex('supplier_price_agreements', ['status']);
    await queryInterface.removeIndex('supplier_price_agreements', ['supplier_id']);
    await queryInterface.removeIndex('supplier_price_agreements', ['agreement_number']);
    
    await queryInterface.removeIndex('internal_requisition_items', ['product_id']);
    await queryInterface.removeIndex('internal_requisition_items', ['ir_id']);
    
    await queryInterface.removeIndex('internal_requisitions', ['tenant_id']);
    await queryInterface.removeIndex('internal_requisitions', ['approved_by']);
    await queryInterface.removeIndex('internal_requisitions', ['requested_by']);
    await queryInterface.removeIndex('internal_requisitions', ['priority']);
    await queryInterface.removeIndex('internal_requisitions', ['status']);
    await queryInterface.removeIndex('internal_requisitions', ['to_branch_id']);
    await queryInterface.removeIndex('internal_requisitions', ['from_branch_id']);
    await queryInterface.removeIndex('internal_requisitions', ['ir_number']);

    // Drop tables
    await queryInterface.dropTable('product_cost_history');
    await queryInterface.dropTable('supplier_price_agreement_items');
    await queryInterface.dropTable('supplier_price_agreements');
    await queryInterface.dropTable('internal_requisition_items');
    await queryInterface.dropTable('internal_requisitions');

    // Remove column
    await queryInterface.removeColumn('products', 'standard_cost');
  }
};
