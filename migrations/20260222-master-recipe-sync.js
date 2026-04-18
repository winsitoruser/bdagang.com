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

    const recipeIdType = await fkTypeFor('recipes', 'id');
    const branchFkType = await fkTypeFor('branches', 'id');
    const tenantFkType = await fkTypeFor('tenants', 'id');
    const userFkType = await fkTypeFor('users', 'id');

    const rc = await queryInterface.describeTable('recipes');

    // Add master recipe fields to recipes table
    if (!rc.is_master) {
      await queryInterface.addColumn('recipes', 'is_master', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Whether this is a master recipe from HQ'
      });
    }

    if (!rc.master_recipe_id) {
      await queryInterface.addColumn('recipes', 'master_recipe_id', {
        type: recipeIdType,
        allowNull: true,
        field: 'master_recipe_id',
        references: {
          model: 'recipes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Reference to master recipe if this is a branch copy'
      });
    }

    let rcUpdated = await queryInterface.describeTable('recipes');

    if (!rcUpdated.sync_status) {
      await queryInterface.addColumn('recipes', 'sync_status', {
        type: Sequelize.ENUM('pending', 'synced', 'modified', 'conflict'),
        allowNull: true,
        defaultValue: null,
        field: 'sync_status',
        comment: 'Sync status for branch recipes'
      });
    }

    if (!rcUpdated.last_synced_at) {
      await queryInterface.addColumn('recipes', 'last_synced_at', {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'last_synced_at',
        comment: 'Last time this recipe was synced from master'
      });
    }

    if (!rcUpdated.sync_version) {
      await queryInterface.addColumn('recipes', 'sync_version', {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'sync_version',
        comment: 'Version number for recipe sync tracking'
      });
    }

    if (!rcUpdated.branch_id) {
      await queryInterface.addColumn('recipes', 'branch_id', {
        type: branchFkType,
        allowNull: true,
        field: 'branch_id',
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Branch that owns this recipe (null for master recipes)'
      });
    }

    if (!rcUpdated.tenant_id) {
      await queryInterface.addColumn('recipes', 'tenant_id', {
        type: tenantFkType,
        allowNull: true,
        field: 'tenant_id',
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Tenant that owns this recipe'
      });
    }

    rcUpdated = await queryInterface.describeTable('recipes');
    if (rcUpdated.tenant_id && rcUpdated.tenant_id.allowNull !== false) {
      await sequelize.query(`
        UPDATE recipes r
        SET tenant_id = COALESCE(
          (SELECT tenant_id FROM products p WHERE p.id = r.product_id LIMIT 1),
          (SELECT tenant_id FROM branches b WHERE b.id = r.branch_id LIMIT 1),
          (SELECT tenant_id FROM branches b ORDER BY b.created_at ASC NULLS LAST LIMIT 1),
          (SELECT id FROM tenants t ORDER BY t.created_at ASC NULLS LAST LIMIT 1)
        )
        WHERE r.tenant_id IS NULL
      `);
      await sequelize.query(`
        UPDATE recipes SET tenant_id = (SELECT id FROM tenants t ORDER BY t.created_at ASC NULLS LAST LIMIT 1)
        WHERE tenant_id IS NULL
      `);
      await sequelize.query(`
        ALTER TABLE recipes ALTER COLUMN tenant_id SET NOT NULL;
      `);
    }

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS recipes_is_master_idx ON recipes (is_master);
      CREATE INDEX IF NOT EXISTS recipes_master_recipe_id_idx ON recipes (master_recipe_id);
      CREATE INDEX IF NOT EXISTS recipes_sync_status_idx ON recipes (sync_status);
      CREATE INDEX IF NOT EXISTS recipes_branch_id_idx ON recipes (branch_id);
      CREATE INDEX IF NOT EXISTS recipes_tenant_id_idx ON recipes (tenant_id);
      CREATE INDEX IF NOT EXISTS recipes_sync_version_idx ON recipes (sync_version);
    `);

    // Create recipe sync log table
    const ensureTableMerge = async (tableName, tableDef) => {
      const tableList = await queryInterface.showAllTables();
      if (!tableList.includes(tableName)) {
        await queryInterface.createTable(tableName, tableDef);
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

    await ensureTableMerge('recipe_sync_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      masterRecipeId: {
        type: recipeIdType,
        allowNull: false,
        field: 'master_recipe_id',
        references: {
          model: 'recipes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      branchId: {
        type: branchFkType,
        allowNull: true,
        field: 'branch_id',
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      syncType: {
        type: Sequelize.ENUM('create', 'update', 'delete', 'restore'),
        allowNull: false,
        field: 'sync_type'
      },
      syncVersion: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'sync_version'
      },
      oldData: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'old_data',
        comment: 'Previous recipe data before sync'
      },
      newData: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'new_data',
        comment: 'New recipe data after sync'
      },
      changes: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Specific changes made during sync'
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'failed', 'conflict'),
        allowNull: false,
        defaultValue: 'pending'
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'error_message'
      },
      syncedBy: {
        type: userFkType,
        allowNull: false,
        field: 'synced_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      syncedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'synced_at'
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

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS recipe_sync_logs_master_recipe_id_idx ON recipe_sync_logs (master_recipe_id);
      CREATE INDEX IF NOT EXISTS recipe_sync_logs_branch_id_idx ON recipe_sync_logs (branch_id);
      CREATE INDEX IF NOT EXISTS recipe_sync_logs_sync_type_idx ON recipe_sync_logs (sync_type);
      CREATE INDEX IF NOT EXISTS recipe_sync_logs_status_idx ON recipe_sync_logs (status);
      CREATE INDEX IF NOT EXISTS recipe_sync_logs_synced_at_idx ON recipe_sync_logs (synced_at);
      CREATE INDEX IF NOT EXISTS recipe_sync_logs_tenant_id_idx ON recipe_sync_logs (tenant_id);
    `);

    const riCols = await queryInterface
      .describeTable('recipe_ingredients')
      .catch(() => ({}));

    if (riCols && !riCols.branch_id) {
      await queryInterface.addColumn('recipe_ingredients', 'branch_id', {
        type: branchFkType,
        allowNull: true,
        field: 'branch_id',
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Override ingredient cost for specific branch'
      });
    }

    if (riCols && !riCols.cost_override) {
      await queryInterface.addColumn('recipe_ingredients', 'cost_override', {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        field: 'cost_override',
        comment: 'Override ingredient cost for regional pricing'
      });
    }

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS recipe_ingredients_branch_id_idx ON recipe_ingredients (branch_id);
      CREATE INDEX IF NOT EXISTS recipe_ingredients_recipe_branch_idx ON recipe_ingredients (recipe_id, branch_id);
    `);

    // Backfill tenant_id where still NULL (prefer product / main branch tenant)
    await sequelize.query(`
      UPDATE recipes r
      SET tenant_id = COALESCE(
        (SELECT tenant_id FROM products p WHERE p.id = r.product_id LIMIT 1),
        (SELECT tenant_id FROM branches b WHERE b.id = r.branch_id LIMIT 1),
        (SELECT tenant_id FROM branches b ORDER BY b.created_at ASC NULLS LAST LIMIT 1),
        (SELECT id FROM tenants t ORDER BY t.created_at ASC NULLS LAST LIMIT 1)
      )
      WHERE r.tenant_id IS NULL
    `);

    // Mark existing recipes as master recipes if they don't have branch_id
    await queryInterface.sequelize.query(`
      UPDATE recipes
      SET is_master = true
      WHERE branch_id IS NULL AND is_master = false
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('recipe_ingredients', ['recipe_id', 'branch_id']);
    await queryInterface.removeIndex('recipe_ingredients', ['branch_id']);
    
    await queryInterface.removeIndex('recipe_sync_logs', ['tenant_id']);
    await queryInterface.removeIndex('recipe_sync_logs', ['synced_at']);
    await queryInterface.removeIndex('recipe_sync_logs', ['status']);
    await queryInterface.removeIndex('recipe_sync_logs', ['sync_type']);
    await queryInterface.removeIndex('recipe_sync_logs', ['branch_id']);
    await queryInterface.removeIndex('recipe_sync_logs', ['master_recipe_id']);
    
    await queryInterface.removeIndex('recipes', ['sync_version']);
    await queryInterface.removeIndex('recipes', ['tenant_id']);
    await queryInterface.removeIndex('recipes', ['branch_id']);
    await queryInterface.removeIndex('recipes', ['sync_status']);
    await queryInterface.removeIndex('recipes', ['master_recipe_id']);
    await queryInterface.removeIndex('recipes', ['is_master']);

    // Drop tables
    await queryInterface.dropTable('recipe_sync_logs');

    // Remove columns from recipe_ingredients
    await queryInterface.removeColumn('recipe_ingredients', 'cost_override');
    await queryInterface.removeColumn('recipe_ingredients', 'branch_id');

    // Remove columns from recipes
    await queryInterface.removeColumn('recipes', 'tenant_id');
    await queryInterface.removeColumn('recipes', 'branch_id');
    await queryInterface.removeColumn('recipes', 'sync_version');
    await queryInterface.removeColumn('recipes', 'last_synced_at');
    await queryInterface.removeColumn('recipes', 'sync_status');
    await queryInterface.removeColumn('recipes', 'master_recipe_id');
    await queryInterface.removeColumn('recipes', 'is_master');
  }
};
