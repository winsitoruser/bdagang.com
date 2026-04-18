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

    const branchesDesc = await queryInterface.describeTable('branches');
    if (!branchesDesc.warehouse_layout) {
      await queryInterface.addColumn('branches', 'warehouse_layout', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Warehouse layout configuration'
      });
    }

    if (!branchesDesc.warehouse_capacity) {
      await queryInterface.addColumn('branches', 'warehouse_capacity', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Total warehouse capacity'
      });
    }

    if (!branchesDesc.warehouse_zones) {
      await queryInterface.addColumn('branches', 'warehouse_zones', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Warehouse zones configuration'
      });
    }

    if (!branchesDesc.storage_areas) {
      await queryInterface.addColumn('branches', 'storage_areas', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Storage areas configuration'
      });
    }

    const branchFkType = await fkTypeFor('branches', 'id');
    const tenantFkType = await fkTypeFor('tenants', 'id');
    const userFkType = await fkTypeFor('users', 'id');
    const productFkType = await fkTypeFor('products', 'id');

    const wzExists = (await queryInterface.showAllTables()).includes('warehouse_zones');
    if (!wzExists) {
    // Create warehouse_zones table
    await queryInterface.createTable('warehouse_zones', {
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      zoneType: {
        type: Sequelize.ENUM('receiving', 'storage', 'picking', 'packing', 'shipping', 'quarantine', 'returns'),
        allowNull: false,
        field: 'zone_type'
      },
      capacity: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Zone capacity in units or volume'
      },
      currentUtilization: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'current_utilization'
      },
      coordinates: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'zone_coordinates',
        comment: 'Zone coordinates for warehouse map'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      temperature: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Required temperature for this zone'
      },
      humidity: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Required humidity for this zone'
      },
      accessRestrictions: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'access_restrictions',
        comment: 'Access restrictions for this zone'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
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
    }

    const zoneFkType = wzExists
      ? await fkTypeFor('warehouse_zones', 'id')
      : Sequelize.UUID;

    if (!(await queryInterface.showAllTables()).includes('storage_areas')) {
    // Create storage_areas table
    await queryInterface.createTable('storage_areas', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      zoneId: {
        type: zoneFkType,
        allowNull: false,
        field: 'zone_id',
        references: {
          model: 'warehouse_zones',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      binCode: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'bin_code'
      },
      capacity: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Storage area capacity'
      },
      currentUtilization: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'current_utilization'
      },
      coordinatesX: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        field: 'coordinates_x'
      },
      coordinatesY: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        field: 'coordinates_y'
      },
      coordinatesZ: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        field: 'coordinates_z'
      },
      aisle: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      shelf: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      level: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      storageType: {
        type: Sequelize.ENUM('pallet', 'shelf', 'bin', 'floor', 'hanging', 'bulk'),
        allowNull: false,
        defaultValue: 'shelf',
        field: 'storage_type'
      },
      weightLimit: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        field: 'weight_limit'
      },
      dimensions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Storage area dimensions (length, width, height)'
      },
      requirements: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Special requirements for this storage area'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
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
    }

    const storageAreaPkType = (await queryInterface.showAllTables()).includes('storage_areas')
      ? await fkTypeFor('storage_areas', 'id')
      : Sequelize.UUID;

    const productsWh = await queryInterface.describeTable('products');
    if (!productsWh.storage_area_id) {
      await queryInterface.addColumn('products', 'storage_area_id', {
        type: storageAreaPkType,
        allowNull: true,
        field: 'storage_area_id',
        references: {
          model: 'storage_areas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      });
    }

    if (!productsWh.warehouse_coordinates) {
      await queryInterface.addColumn('products', 'warehouse_coordinates', {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'warehouse_coordinates',
        comment: 'Product coordinates within warehouse'
      });
    }

    if (!(await queryInterface.showAllTables()).includes('product_location_history')) {
    // Create product_location_history table
    await queryInterface.createTable('product_location_history', {
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
      storageAreaId: {
        type: storageAreaPkType,
        allowNull: true,
        field: 'storage_area_id',
        references: {
          model: 'storage_areas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      coordinates: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'location_coordinates',
        comment: 'Product coordinates at time of move'
      },
      movedBy: {
        type: userFkType,
        allowNull: false,
        field: 'moved_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      moveReason: {
        type: Sequelize.STRING(200),
        allowNull: true,
        field: 'move_reason'
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
      }
    });
    }

    const wzD = await queryInterface.describeTable('warehouse_zones');
    const saD = await queryInterface.describeTable('storage_areas');
    const wzBranchCol = wzD.branch_id ? 'branch_id' : wzD.branchId ? '"branchId"' : null;
    const saBranchCol = saD.branch_id ? 'branch_id' : saD.branchId ? '"branchId"' : null;
    const wzTenantCol = wzD.tenant_id ? 'tenant_id' : wzD.tenantId ? '"tenantId"' : null;
    const saTenantCol = saD.tenant_id ? 'tenant_id' : saD.tenantId ? '"tenantId"' : null;

    await sequelize.query(`
      ${wzBranchCol ? `CREATE INDEX IF NOT EXISTS warehouse_zones_branch_id ON warehouse_zones (${wzBranchCol});` : ''}
      CREATE INDEX IF NOT EXISTS warehouse_zones_zone_type ON warehouse_zones (zone_type);
      CREATE INDEX IF NOT EXISTS warehouse_zones_is_active ON warehouse_zones (is_active);
      ${wzTenantCol ? `CREATE INDEX IF NOT EXISTS warehouse_zones_tenant_id ON warehouse_zones (${wzTenantCol});` : ''}
      CREATE INDEX IF NOT EXISTS storage_areas_zone_id ON storage_areas (zone_id);
      ${saBranchCol ? `CREATE INDEX IF NOT EXISTS storage_areas_branch_id ON storage_areas (${saBranchCol});` : ''}
      CREATE UNIQUE INDEX IF NOT EXISTS storage_areas_bin_code ON storage_areas (bin_code);
      CREATE INDEX IF NOT EXISTS storage_areas_aisle_shelf_level ON storage_areas (aisle, shelf, level);
      CREATE INDEX IF NOT EXISTS storage_areas_is_active ON storage_areas (is_active);
      ${saTenantCol ? `CREATE INDEX IF NOT EXISTS storage_areas_tenant_id ON storage_areas (${saTenantCol});` : ''}
      CREATE INDEX IF NOT EXISTS products_storage_area_id_wh ON products (storage_area_id);
      CREATE INDEX IF NOT EXISTS product_location_history_product_id ON product_location_history (product_id);
      CREATE INDEX IF NOT EXISTS product_location_history_storage_area_id ON product_location_history (storage_area_id);
      CREATE INDEX IF NOT EXISTS product_location_history_moved_by ON product_location_history (moved_by);
      CREATE INDEX IF NOT EXISTS product_location_history_created_at ON product_location_history (created_at);
      CREATE INDEX IF NOT EXISTS product_location_history_tenant_id ON product_location_history (tenant_id);
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('product_location_history', ['tenant_id']);
    await queryInterface.removeIndex('product_location_history', ['created_at']);
    await queryInterface.removeIndex('product_location_history', ['moved_by']);
    await queryInterface.removeIndex('product_location_history', ['storage_area_id']);
    await queryInterface.removeIndex('product_location_history', ['product_id']);
    
    await queryInterface.removeIndex('products', ['storage_area_id']);
    
    await queryInterface.removeIndex('storage_areas', ['tenant_id']);
    await queryInterface.removeIndex('storage_areas', ['is_active']);
    await queryInterface.removeIndex('storage_areas', ['aisle', 'shelf', 'level']);
    await queryInterface.removeIndex('storage_areas', ['bin_code']);
    await queryInterface.removeIndex('storage_areas', ['branch_id']);
    await queryInterface.removeIndex('storage_areas', ['zone_id']);
    
    await queryInterface.removeIndex('warehouse_zones', ['tenant_id']);
    await queryInterface.removeIndex('warehouse_zones', ['is_active']);
    await queryInterface.removeIndex('warehouse_zones', ['zone_type']);
    await queryInterface.removeIndex('warehouse_zones', ['branch_id']);

    // Drop tables
    await queryInterface.dropTable('product_location_history');
    await queryInterface.dropTable('storage_areas');
    await queryInterface.dropTable('warehouse_zones');

    // Remove columns
    await queryInterface.removeColumn('products', 'warehouse_coordinates');
    await queryInterface.removeColumn('products', 'storage_area_id');
    await queryInterface.removeColumn('branches', 'storage_areas');
    await queryInterface.removeColumn('branches', 'warehouse_zones');
    await queryInterface.removeColumn('branches', 'warehouse_capacity');
    await queryInterface.removeColumn('branches', 'warehouse_layout');
  }
};
