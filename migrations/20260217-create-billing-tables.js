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

    const fkTypeOrDefault = async (tableName, columnName = 'id', fallback = Sequelize.UUID) => {
      const tableList = await queryInterface.showAllTables();
      if (!tableList.includes(tableName)) return fallback;
      const [rows] = await sequelize.query(
        `SELECT udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}' AND column_name = '${columnName}'`
      );
      return pgUdtToSequelizeType(rows[0]?.udt_name);
    };

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

    const tenantFkType = await fkTypeOrDefault('tenants', 'id');

    // Create plans table
    const plansDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      billing_interval: {
        type: Sequelize.ENUM('monthly', 'yearly'),
        allowNull: false,
        defaultValue: 'monthly'
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'IDR'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      features: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      trial_days: {
        type: Sequelize.INTEGER,
        defaultValue: 14
      },
      max_users: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      max_branches: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      max_products: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      max_transactions: {
        type: Sequelize.INTEGER,
        defaultValue: 1000
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    };
    await ensureTableMerge('plans', plansDef);

    const planFkType = await fkTypeOrDefault('plans', 'id');

    // Create plan_limits table
    const planLimitsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      plan_id: {
        type: planFkType,
        allowNull: false,
        references: {
          model: 'plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      metric_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      max_value: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      is_soft_limit: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      overage_rate: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    };
    await ensureTableMerge('plan_limits', planLimitsDef);

    // Create subscriptions table
    const subscriptionsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenant_id: {
        type: tenantFkType,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      plan_id: {
        type: planFkType,
        allowNull: false,
        references: {
          model: 'plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      status: {
        type: Sequelize.ENUM('trial', 'active', 'past_due', 'cancelled', 'expired'),
        allowNull: false,
        defaultValue: 'trial'
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      trial_ends_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      current_period_start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      current_period_end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      cancel_at_period_end: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      cancelled_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    };
    await ensureTableMerge('subscriptions', subscriptionsDef);

    const subscriptionFkType = await fkTypeOrDefault('subscriptions', 'id');

    // Create billing_cycles table
    const billingCyclesDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      subscription_id: {
        type: subscriptionFkType,
        allowNull: false,
        references: {
          model: 'subscriptions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      period_start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      period_end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      base_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      overage_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'IDR'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'paid', 'failed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    };
    await ensureTableMerge('billing_cycles', billingCyclesDef);

    const tenantIdTypeForInvoices = await fkTypeOrDefault('tenants', 'id');
    const billingCycleIdType = await fkTypeOrDefault('billing_cycles', 'id');
    const subscriptionIdTypeForInvoices = await fkTypeOrDefault('subscriptions', 'id');

    // Create invoices table
    const invoicesDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenant_id: {
        type: tenantIdTypeForInvoices,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      billing_cycle_id: {
        type: billingCycleIdType,
        allowNull: true,
        references: {
          model: 'billing_cycles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      subscription_id: {
        type: subscriptionIdTypeForInvoices,
        allowNull: true,
        references: {
          model: 'subscriptions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      invoice_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'sent', 'paid', 'overdue', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: 'draft'
      },
      issued_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      paid_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      subtotal: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      total_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'IDR'
      },
      payment_provider: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      external_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      payment_fee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      },
      customer_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      customer_email: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      customer_phone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      customer_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    };
    await ensureTableMerge('invoices', invoicesDef);

    const invoiceIdType = await fkTypeOrDefault('invoices', 'id');

    // Create invoice_items table
    const invoiceItemsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      invoice_id: {
        type: invoiceIdType,
        allowNull: false,
        references: {
          model: 'invoices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1
      },
      unit_price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      reference_type: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      reference_id: {
        type: Sequelize.UUID,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    };
    await ensureTableMerge('invoice_items', invoiceItemsDef);

    const tenantIdTypeUsage = await fkTypeOrDefault('tenants', 'id');

    // Create usage_metrics table
    const usageMetricsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenant_id: {
        type: tenantIdTypeUsage,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      metric_name: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      metric_value: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      period_start: {
        type: Sequelize.DATE,
        allowNull: false
      },
      period_end: {
        type: Sequelize.DATE,
        allowNull: false
      },
      source: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    };
    await ensureTableMerge('usage_metrics', usageMetricsDef);

    const invoiceIdTypePay = await fkTypeOrDefault('invoices', 'id');
    const billingCycleIdTypePay = await fkTypeOrDefault('billing_cycles', 'id');

    // Create payment_transactions table
    const paymentTransactionsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      invoice_id: {
        type: invoiceIdTypePay,
        allowNull: false,
        references: {
          model: 'invoices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      billing_cycle_id: {
        type: billingCycleIdTypePay,
        allowNull: true,
        references: {
          model: 'billing_cycles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'IDR'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending'
      },
      provider: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      provider_transaction_id: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      failure_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      processed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    };
    await ensureTableMerge('payment_transactions', paymentTransactionsDef);

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS plans_is_active ON "plans" ("is_active")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS plans_billing_interval ON "plans" ("billing_interval")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS plans_sort_order ON "plans" ("sort_order")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS plan_limits_plan_id ON "plan_limits" ("plan_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS plan_limits_metric_name ON "plan_limits" ("metric_name")'
    );
    await sequelize.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS plan_limits_plan_id_metric_name ON "plan_limits" ("plan_id", "metric_name")'
    );

    await sequelize.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_tenant_id ON "subscriptions" ("tenant_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS subscriptions_status ON "subscriptions" ("status")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS subscriptions_current_period_end ON "subscriptions" ("current_period_end")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS subscriptions_plan_id ON "subscriptions" ("plan_id")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS billing_cycles_subscription_id ON "billing_cycles" ("subscription_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS billing_cycles_status ON "billing_cycles" ("status")'
    );
    await sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'billing_cycles' AND column_name = 'due_date'
        ) THEN
          CREATE INDEX IF NOT EXISTS billing_cycles_due_date ON "billing_cycles" ("due_date");
        END IF;
      END $$;
    `);
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS billing_cycles_period_start_period_end ON "billing_cycles" ("period_start", "period_end")'
    );

    await sequelize.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS invoices_invoice_number ON "invoices" ("invoice_number")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS invoices_tenant_id ON "invoices" ("tenant_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS invoices_status ON "invoices" ("status")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS invoices_due_date ON "invoices" ("due_date")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS invoices_billing_cycle_id ON "invoices" ("billing_cycle_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS invoices_subscription_id ON "invoices" ("subscription_id")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS invoice_items_invoice_id ON "invoice_items" ("invoice_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS invoice_items_type ON "invoice_items" ("type")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS usage_metrics_tenant_id ON "usage_metrics" ("tenant_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS usage_metrics_metric_name ON "usage_metrics" ("metric_name")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS usage_metrics_period ON "usage_metrics" ("period_start", "period_end")'
    );
    await sequelize.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS usage_metrics_tenant_metric_period ON "usage_metrics" ("tenant_id", "metric_name", "period_start")'
    );

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS payment_transactions_invoice_id ON "payment_transactions" ("invoice_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS payment_transactions_status ON "payment_transactions" ("status")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS payment_transactions_provider ON "payment_transactions" ("provider")'
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('payment_transactions');
    await queryInterface.dropTable('usage_metrics');
    await queryInterface.dropTable('invoice_items');
    await queryInterface.dropTable('invoices');
    await queryInterface.dropTable('billing_cycles');
    await queryInterface.dropTable('subscriptions');
    await queryInterface.dropTable('plan_limits');
    await queryInterface.dropTable('plans');
  }
};
