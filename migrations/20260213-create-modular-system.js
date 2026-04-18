'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sequelize = queryInterface.sequelize;

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

    await ensureTableMerge('business_types', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: { type: Sequelize.TEXT },
      icon: { type: Sequelize.STRING(50), allowNull: true },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await ensureTableMerge('modules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      code: {
        type: Sequelize.STRING(50),
        unique: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: { type: Sequelize.TEXT },
      icon: { type: Sequelize.STRING(50), allowNull: true },
      route: { type: Sequelize.STRING(100), allowNull: true },
      parent_module_id: {
        type: Sequelize.UUID,
        references: {
          model: 'modules',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      is_core: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await ensureTableMerge('business_type_modules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      business_type_id: {
        type: Sequelize.UUID,
        references: {
          model: 'business_types',
          key: 'id'
        },
        onDelete: 'CASCADE',
        allowNull: false
      },
      module_id: {
        type: Sequelize.UUID,
        references: {
          model: 'modules',
          key: 'id'
        },
        onDelete: 'CASCADE',
        allowNull: false
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      is_optional: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await ensureTableMerge('tenant_modules', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenant_id: {
        type: Sequelize.UUID,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onDelete: 'CASCADE',
        allowNull: false
      },
      module_id: {
        type: Sequelize.UUID,
        references: {
          model: 'modules',
          key: 'id'
        },
        onDelete: 'CASCADE',
        allowNull: false
      },
      is_enabled: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      enabled_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      disabled_at: { type: Sequelize.DATE, allowNull: true },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_tenant_modules_tenant ON "tenant_modules" ("tenant_id")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_tenant_modules_enabled ON "tenant_modules" ("tenant_id", "is_enabled")'
    );

    await sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'unique_business_type_module'
        ) THEN
          ALTER TABLE "business_type_modules" ADD CONSTRAINT "unique_business_type_module"
            UNIQUE ("business_type_id", "module_id");
        END IF;
      END $$;
    `);

    await sequelize.query(`
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'unique_tenant_module'
        ) THEN
          ALTER TABLE "tenant_modules" ADD CONSTRAINT "unique_tenant_module"
            UNIQUE ("tenant_id", "module_id");
        END IF;
      END $$;
    `);

    const tenantsD = await queryInterface.describeTable('tenants');
    const addTenantCol = async (col, def) => {
      if (tenantsD[col]) return;
      const { comment: _c, ...rest } = def;
      await queryInterface.addColumn('tenants', col, rest);
      tenantsD[col] = true;
    };

    await addTenantCol('business_type_id', {
      type: Sequelize.UUID,
      references: {
        model: 'business_types',
        key: 'id'
      },
      onDelete: 'SET NULL'
    });

    await addTenantCol('business_name', {
      type: Sequelize.STRING(255)
    });

    await addTenantCol('business_address', {
      type: Sequelize.TEXT
    });

    await addTenantCol('business_phone', {
      type: Sequelize.STRING(50)
    });

    await addTenantCol('business_email', {
      type: Sequelize.STRING(255)
    });

    await addTenantCol('setup_completed', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await addTenantCol('onboarding_step', {
      type: Sequelize.INTEGER,
      defaultValue: 0
    });

    const usersD = await queryInterface.describeTable('users');
    if (!usersD.tenant_id) {
      await queryInterface.addColumn('users', 'tenant_id', {
        type: Sequelize.UUID,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onDelete: 'SET NULL'
      });
    }
    if (!usersD.role) {
      await queryInterface.addColumn('users', 'role', {
        type: Sequelize.STRING(50),
        defaultValue: 'staff'
      });
    }

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_users_tenant ON "users" ("tenant_id")'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeIndex('users', 'idx_users_tenant');
    await queryInterface.removeColumn('users', 'role');
    await queryInterface.removeColumn('users', 'tenant_id');

    await queryInterface.removeColumn('tenants', 'onboarding_step');
    await queryInterface.removeColumn('tenants', 'setup_completed');
    await queryInterface.removeColumn('tenants', 'business_email');
    await queryInterface.removeColumn('tenants', 'business_phone');
    await queryInterface.removeColumn('tenants', 'business_address');
    await queryInterface.removeColumn('tenants', 'business_name');
    await queryInterface.removeColumn('tenants', 'business_type_id');

    await queryInterface.removeConstraint('tenant_modules', 'unique_tenant_module');
    await queryInterface.removeConstraint('business_type_modules', 'unique_business_type_module');

    await queryInterface.removeIndex('tenant_modules', 'idx_tenant_modules_enabled');
    await queryInterface.removeIndex('tenant_modules', 'idx_tenant_modules_tenant');

    await queryInterface.dropTable('tenant_modules');
    await queryInterface.dropTable('business_type_modules');
    await queryInterface.dropTable('modules');
    await queryInterface.dropTable('business_types');
  }
};
