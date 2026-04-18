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

    const userFkType = await fkTypeFor('users', 'id');
    const tenantFkType = await fkTypeFor('tenants', 'id');
    const branchFkType = await fkTypeFor('branches', 'id');

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

    // Create global_settings table
    await ensureTableMerge('global_settings', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      key: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      label: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      value: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Setting value (JSON encoded)'
      },
      type: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'select', 'json'),
        allowNull: false,
        defaultValue: 'string'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'general'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isRequired: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_required'
      },
      validation: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Validation rules (min, max, options, etc.)'
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
      updatedBy: {
        type: userFkType,
        allowNull: true,
        field: 'updated_by',
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

    // Create branch_settings table
    await ensureTableMerge('branch_settings', {
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
      key: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      label: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      value: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Setting value (JSON encoded)'
      },
      type: {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'select', 'json'),
        allowNull: false,
        defaultValue: 'string'
      },
      category: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'general'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isOverridable: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_overridable',
        comment: 'Can this setting be overridden by global settings?'
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

    const productsGs = await queryInterface.describeTable('products');
    if (!productsGs.is_master) {
      await queryInterface.addColumn('products', 'is_master', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_master',
        comment: 'Master product that syncs to all branches'
      });
    }

    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS global_settings_tenant_key_unique ON global_settings (tenant_id, key);
      CREATE INDEX IF NOT EXISTS global_settings_category ON global_settings (category);
      CREATE INDEX IF NOT EXISTS global_settings_type ON global_settings (type);
      CREATE INDEX IF NOT EXISTS branch_settings_branch_id_key ON branch_settings (branch_id, key);
      CREATE INDEX IF NOT EXISTS branch_settings_category ON branch_settings (category);
      CREATE INDEX IF NOT EXISTS branch_settings_type ON branch_settings (type);
      CREATE INDEX IF NOT EXISTS products_is_master_global_settings ON products (is_master);
    `);

    // Create function to sync global settings to branches
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION sync_global_to_branch_settings()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Sync to all branches if setting is marked as global
        IF NEW.category IN ('tax', 'system') THEN
          INSERT INTO branch_settings (branch_id, key, label, value, type, category, description, tenant_id, created_at, updated_at)
          SELECT 
            id, NEW.key, NEW.label, NEW.value, NEW.type, NEW.category, NEW.description, NEW.tenant_id, NOW(), NOW()
          FROM branches 
          WHERE tenant_id = NEW.tenant_id
          AND is_active = true
          ON CONFLICT (branch_id, key) 
          DO UPDATE SET
            value = EXCLUDED.value,
            updated_at = NOW();
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_sync_global_settings ON global_settings;
      CREATE TRIGGER trigger_sync_global_settings
        AFTER INSERT OR UPDATE ON global_settings
        FOR EACH ROW
        EXECUTE FUNCTION sync_global_to_branch_settings();
    `);

    // Create view for effective settings (global overrides branch)
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW effective_settings AS
      SELECT 
        b.id as branch_id,
        b.name as branch_name,
        COALESCE(bs.key, gs.key) as key,
        COALESCE(bs.label, gs.label) as label,
        COALESCE(bs.value, gs.value) as value,
        COALESCE(bs.type::text, gs.type::text)::text as type,
        COALESCE(bs.category, gs.category) as category,
        CASE 
          WHEN bs.id IS NOT NULL THEN 'branch'
          WHEN gs.id IS NOT NULL THEN 'global'
          ELSE NULL
        END as source,
        b.tenant_id
      FROM branches b
      LEFT JOIN branch_settings bs ON b.id = bs.branch_id
      LEFT JOIN global_settings gs ON b.tenant_id = gs.tenant_id 
        AND bs.key = gs.key
        AND gs.category IN ('tax', 'system')
      WHERE b.is_active = true
      AND (bs.id IS NOT NULL OR gs.id IS NOT NULL);
    `);

    const [posStatusEnums] = await sequelize.query(`
      SELECT e.enumlabel
      FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON t.typnamespace = n.oid
      WHERE n.nspname = 'public' AND t.typname = 'enum_pos_transactions_status'
      ORDER BY e.enumsortorder
    `);
    const posLabels = posStatusEnums.map((r) => r.enumlabel);
    const terminalStatuses = posLabels.filter((l) =>
      /complete|paid|success|closed|done|settled|finish/i.test(l)
    );
    const statusInList =
      terminalStatuses.length > 0 ? terminalStatuses : posLabels;
    const statusSqlList = statusInList
      .map((s) => `'${String(s).replace(/'/g, "''")}'`)
      .join(', ');
    const posStatusPredicate =
      statusSqlList.length > 0
        ? `AND pt.status::text IN (${statusSqlList})`
        : '';

    const tableListAgg = await queryInterface.showAllTables();
    const hasEmployeeAttendances = tableListAgg.includes('employee_attendances');

    const productsCols = await queryInterface.describeTable('products');
    const inventoryJoinClause = productsCols.branch_id
      ? `LEFT JOIN products p ON b.id = p.branch_id AND p.is_active = true`
      : productsCols.tenant_id
        ? `LEFT JOIN products p ON p.tenant_id = b.tenant_id AND p.is_active = true`
        : `LEFT JOIN products p ON false`;

    const stockExpr = productsCols.stock ? 'p.stock' : '0::numeric';
    const minStockExpr = productsCols.min_stock ? 'p.min_stock' : '0::numeric';
    const costExpr = productsCols.cost ? 'p.cost' : '0::numeric';

    const attendanceUnion = hasEmployeeAttendances
      ? `
      UNION ALL
      
      SELECT 
        'employee_attendance' as report_type,
        t.id as tenant_id,
        CURRENT_DATE as report_date,
        b.id as branch_id,
        b.name as branch_name,
        COUNT(ea.id)::bigint as transaction_count,
        0::numeric as total_sales,
        0::numeric as net_sales,
        COUNT(CASE WHEN ea.check_out_at IS NOT NULL THEN 1 END)::bigint as total_discount,
        COUNT(ea.id)::bigint as total_tax,
        COUNT(DISTINCT ea.employee_id)::bigint as unique_customers,
        CURRENT_TIMESTAMP as generated_at
      FROM tenants t
      JOIN branches b ON t.id = b.tenant_id
      LEFT JOIN employee_attendances ea ON b.id = ea.branch_id
        AND DATE(ea.check_in_at) = CURRENT_DATE
      WHERE b.is_active = true
      GROUP BY t.id, b.id, b.name`
      : `
      UNION ALL
      
      SELECT 
        'employee_attendance' as report_type,
        t.id as tenant_id,
        CURRENT_DATE as report_date,
        b.id as branch_id,
        b.name as branch_name,
        0::bigint as transaction_count,
        0::numeric as total_sales,
        0::numeric as net_sales,
        0::bigint as total_discount,
        0::bigint as total_tax,
        0::bigint as unique_customers,
        CURRENT_TIMESTAMP as generated_at
      FROM tenants t
      JOIN branches b ON t.id = b.tenant_id
      WHERE b.is_active = true
      GROUP BY t.id, b.id, b.name`;

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW api_aggregator_reports AS
      SELECT 
        'daily_sales' as report_type,
        t.id as tenant_id,
        DATE(pt.transaction_date) as report_date,
        b.id as branch_id,
        b.name as branch_name,
        COUNT(pt.id) as transaction_count,
        COALESCE(SUM(pt.total_amount), 0) as total_sales,
        COALESCE(SUM(pt.subtotal), 0) as net_sales,
        COALESCE(SUM(pt.discount_amount), 0) as total_discount,
        COALESCE(SUM(pt.tax_amount), 0) as total_tax,
        COUNT(DISTINCT pt.customer_id) as unique_customers,
        CURRENT_TIMESTAMP as generated_at
      FROM tenants t
      JOIN branches b ON t.id = b.tenant_id
      LEFT JOIN pos_transactions pt ON b.id = pt.branch_id
        ${posStatusPredicate}
        AND DATE(pt.transaction_date) = CURRENT_DATE
      WHERE b.is_active = true
      GROUP BY t.id, b.id, b.name, DATE(pt.transaction_date)
      
      UNION ALL
      
      SELECT 
        'inventory_status' as report_type,
        t.id as tenant_id,
        CURRENT_DATE as report_date,
        b.id as branch_id,
        b.name as branch_name,
        COUNT(p.id)::bigint as transaction_count,
        COALESCE(SUM(${stockExpr} * ${costExpr}), 0) as total_sales,
        0::numeric as net_sales,
        COUNT(CASE WHEN ${stockExpr} <= ${minStockExpr} THEN 1 END)::bigint as total_discount,
        COUNT(CASE WHEN ${stockExpr} = 0 THEN 1 END)::bigint as total_tax,
        COUNT(p.id)::bigint as unique_customers,
        CURRENT_TIMESTAMP as generated_at
      FROM tenants t
      JOIN branches b ON t.id = b.tenant_id
      ${inventoryJoinClause}
      WHERE b.is_active = true
      GROUP BY t.id, b.id, b.name
      ${attendanceUnion};
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop views
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS api_aggregator_reports');
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS effective_settings');

    // Drop triggers and functions
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS trigger_sync_global_settings ON global_settings'
    );
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS sync_global_to_branch_settings()');

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS products_is_master_global_settings;
      DROP INDEX IF EXISTS branch_settings_type;
      DROP INDEX IF EXISTS branch_settings_category;
      DROP INDEX IF EXISTS branch_settings_branch_id_key;
      DROP INDEX IF EXISTS global_settings_type;
      DROP INDEX IF EXISTS global_settings_category;
      DROP INDEX IF EXISTS global_settings_tenant_key_unique;
    `);

    // Drop tables
    await queryInterface.dropTable('branch_settings');
    await queryInterface.dropTable('global_settings');

    // Remove column
    await queryInterface.removeColumn('products', 'is_master');
  }
};
