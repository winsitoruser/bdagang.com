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

    const tenantFkType = await fkTypeFor('tenants', 'id');
    const branchFkType = await fkTypeFor('branches', 'id');
    const customerFkType = await fkTypeFor('customers', 'id');
    const userFkType = await fkTypeFor('users', 'id');

    const tables = await queryInterface.showAllTables();

    const ensureTableMerge = async (tableName, tableDef) => {
      if (!tables.includes(tableName)) {
        await queryInterface.createTable(tableName, tableDef);
        tables.push(tableName);
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

    const loyaltyCols =
      tables.includes('customer_loyalty')
        ? await queryInterface.describeTable('customer_loyalty')
        : {};

    const [pgClRows] = tables.includes('customer_loyalty')
      ? await sequelize.query(`
          SELECT a.attname AS column_name
          FROM pg_attribute a
          JOIN pg_class c ON c.oid = a.attrelid
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE n.nspname = 'public' AND c.relname = 'customer_loyalty'
            AND a.attnum > 0 AND NOT a.attisdropped
        `)
      : [[]];

    const pgColSet = new Set((pgClRows || []).map((r) => r.column_name));
    /** Resolve FK-style columns despite camelCase/snake_case / legacy naming drift. */
    const quotedClId = (snake, camel) => {
      if (pgColSet.has(snake)) return snake;
      if (pgColSet.has(camel)) return `"${camel}"`;
      const folded = camel.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
      if (pgColSet.has(folded)) return folded;
      if (pgColSet.has(camel.toLowerCase())) return camel.toLowerCase();
      return snake;
    };
    const clCustomerCol =
      [...pgColSet].find(
        (n) =>
          /customer/i.test(n) &&
          /id$/i.test(n) &&
          !/tier/i.test(n) &&
          !/tenant/i.test(n)
      ) || quotedClId('customer_id', 'customerId');
    const clProgramCol =
      [...pgColSet].find((n) => /^program(?:id)?$/i.test(n)) ||
      [...pgColSet].find(
        (n) => /program/i.test(n) && /id$/i.test(n) && !/tier/i.test(n)
      ) ||
      [...pgColSet].find(
        (n) =>
          (/loyalty/i.test(n) && /program/i.test(n)) ||
          (/program/i.test(n) && !/tier/i.test(n))
      ) ||
      quotedClId('program_id', 'programId');

    const physical = (col) => col.replace(/^"|"$/g, '');
    const programColOk = physical(clProgramCol) !== 'program_id' || pgColSet.has('program_id');
    const uniqueTripletReady =
      programColOk &&
      pgColSet.has('tenant_id') &&
      pgColSet.has(physical(clCustomerCol)) &&
      pgColSet.has(physical(clProgramCol));

    // tenant_id — idempotent + safe when rows exist (nullable → backfill → NOT NULL)
    if (!loyaltyCols.tenant_id) {
      await queryInterface.addColumn('customer_loyalty', 'tenant_id', {
        type: tenantFkType,
        allowNull: true,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Tenant ID for cross-branch loyalty support'
      });
      await sequelize.query(`
        UPDATE customer_loyalty AS cl
        SET tenant_id = c.tenant_id
        FROM customers AS c
        WHERE cl.${clCustomerCol} = c.id
          AND cl.tenant_id IS NULL
          AND c.tenant_id IS NOT NULL
      `);
      await sequelize.query(`
        ALTER TABLE customer_loyalty ALTER COLUMN tenant_id SET NOT NULL;
      `);
    }

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS customer_loyalty_tenant_id_idx ON customer_loyalty (tenant_id);
    `);
    if (uniqueTripletReady) {
      await sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS customer_loyalty_customer_program_tenant_unique
        ON customer_loyalty (${clCustomerCol}, ${clProgramCol}, tenant_id);
      `);
    }

    let loyaltyPointsTableExists =
      tables.includes('loyalty_points');

    if (loyaltyPointsTableExists) {
      const lpCols = await queryInterface.describeTable('loyalty_points');
      const [lpPgRows] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'loyalty_points'
      `);
      const lpPg = new Set((lpPgRows || []).map((r) => r.column_name));
      const lpCust = lpPg.has('customer_id')
        ? 'customer_id'
        : lpPg.has('customerId')
        ? `"customerId"`
        : lpPg.has('customerid')
        ? 'customerid'
        : 'customer_id';
      if (!lpCols.tenant_id) {
        await queryInterface.addColumn('loyalty_points', 'tenant_id', {
          type: tenantFkType,
          allowNull: true,
          references: {
            model: 'tenants',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          comment: 'Tenant ID for cross-branch loyalty tracking'
        });
        await sequelize.query(`
          UPDATE loyalty_points lp
          SET tenant_id = c.tenant_id
          FROM customers c
          WHERE lp.${lpCust} = c.id
            AND lp.tenant_id IS NULL
            AND c.tenant_id IS NOT NULL
        `);
        await sequelize.query(`
          ALTER TABLE loyalty_points ALTER COLUMN tenant_id SET NOT NULL;
        `);
      }
      if (!lpCols.branch_id) {
        await queryInterface.addColumn('loyalty_points', 'branch_id', {
          type: branchFkType,
          allowNull: true,
          references: {
            model: 'branches',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
          comment: 'Branch where points were earned/redeemed'
        });
      }
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS loyalty_points_tenant_id_idx ON loyalty_points (tenant_id);
        CREATE INDEX IF NOT EXISTS loyalty_points_branch_id_idx ON loyalty_points (branch_id);
        CREATE INDEX IF NOT EXISTS loyalty_points_customer_tenant_idx ON loyalty_points (${lpCust}, tenant_id);
      `);
    }

    await ensureTableMerge('loyalty_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      customerId: {
        type: customerFkType,
        allowNull: false,
        field: 'customer_id',
        references: {
          model: 'customers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      branchId: {
        type: branchFkType,
        allowNull: true,
        field: 'branch_id',
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      transactionType: {
        type: Sequelize.ENUM('earned', 'redeemed', 'expired', 'adjusted', 'refunded'),
        allowNull: false,
        field: 'transaction_type'
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Points amount (positive for earned, negative for redeemed)'
      },
      balanceAfter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'balance_after',
        comment: 'Customer points balance after this transaction'
      },
      referenceType: {
        type: Sequelize.ENUM(
          'pos_transaction',
          'manual_adjustment',
          'reward_redemption',
          'expiry',
          'refund'
        ),
        allowNull: false,
        field: 'reference_type'
      },
      referenceId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'reference_id',
        comment: 'Reference to related transaction'
      },
      referenceNumber: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'reference_number',
        comment: 'Transaction number for reference'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Transaction description'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional transaction metadata'
      },
      createdBy: {
        type: userFkType,
        allowNull: true,
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
      }
    });

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS loyalty_transactions_customer_tenant_idx ON loyalty_transactions (customer_id, tenant_id);
      CREATE INDEX IF NOT EXISTS loyalty_transactions_branch_id_idx ON loyalty_transactions (branch_id);
      CREATE INDEX IF NOT EXISTS loyalty_transactions_transaction_type_idx ON loyalty_transactions (transaction_type);
      CREATE INDEX IF NOT EXISTS loyalty_transactions_ref_type_ref_id_idx ON loyalty_transactions (reference_type, reference_id);
      CREATE INDEX IF NOT EXISTS loyalty_transactions_created_at_idx ON loyalty_transactions (created_at);
    `);

    await sequelize.query(`
      UPDATE customer_loyalty AS cl
      SET tenant_id = c.tenant_id
      FROM customers AS c
      WHERE cl.${clCustomerCol} = c.id
        AND cl.tenant_id IS NULL
        AND c.tenant_id IS NOT NULL
    `);

    if (loyaltyPointsTableExists) {
      const [lpPgRowsFinal] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'loyalty_points'
      `);
      const lpPgFinal = new Set((lpPgRowsFinal || []).map((r) => r.column_name));
      const lpCustFinal = lpPgFinal.has('customer_id')
        ? 'customer_id'
        : lpPgFinal.has('customerId')
        ? `"customerId"`
        : lpPgFinal.has('customerid')
        ? 'customerid'
        : 'customer_id';
      await sequelize.query(`
        UPDATE loyalty_points lp
        SET tenant_id = c.tenant_id
        FROM customers c
        WHERE lp.${lpCustFinal} = c.id
          AND lp.tenant_id IS NULL
          AND c.tenant_id IS NOT NULL
      `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS loyalty_transactions_created_at_idx;
      DROP INDEX IF EXISTS loyalty_transactions_ref_type_ref_id_idx;
      DROP INDEX IF EXISTS loyalty_transactions_transaction_type_idx;
      DROP INDEX IF EXISTS loyalty_transactions_branch_id_idx;
      DROP INDEX IF EXISTS loyalty_transactions_customer_tenant_idx;

      DROP INDEX IF EXISTS loyalty_points_customer_tenant_idx;
      DROP INDEX IF EXISTS loyalty_points_branch_id_idx;
      DROP INDEX IF EXISTS loyalty_points_tenant_id_idx;

      DROP INDEX IF EXISTS customer_loyalty_customer_program_tenant_unique;
      DROP INDEX IF EXISTS customer_loyalty_tenant_id_idx;
    `);

    await queryInterface.dropTable('loyalty_transactions');

    const tables = await queryInterface.showAllTables();
    if (tables.includes('loyalty_points')) {
      await queryInterface.removeColumn('loyalty_points', 'branch_id');
      await queryInterface.removeColumn('loyalty_points', 'tenant_id');
    }

    await queryInterface.removeColumn('customer_loyalty', 'tenant_id');
  }
};
