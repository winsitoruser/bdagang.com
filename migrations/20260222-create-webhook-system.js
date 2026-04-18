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

    /** Legacy drift: table created with physical column `event`; current model uses `wh_event`. */
    await sequelize.query(`
      DO $r$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'webhooks' AND column_name = 'event'
        ) AND NOT EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'webhooks' AND column_name = 'wh_event'
        ) THEN
          ALTER TABLE webhooks RENAME COLUMN event TO wh_event;
        END IF;
      END $r$;
    `);

    await ensureTableMerge('webhooks', {
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
      url: {
        type: Sequelize.STRING(500),
        allowNull: false,
        validate: {
          isUrl: true
        }
      },
      webhookEventType: {
        type: Sequelize.ENUM(
          'low_stock_alert',
          'daily_sales_summary',
          'finance_reconciliation',
          'inventory_transfer',
          'order_created',
          'order_completed',
          'payment_received',
          'customer_created',
          'employee_shift_start',
          'employee_shift_end'
        ),
        allowNull: false,
        field: 'wh_event'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      },
      secretKey: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'secret_key',
        comment: 'Secret key for webhook signature verification'
      },
      retryCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
        field: 'retry_count',
        comment: 'Number of retry attempts on failure'
      },
      timeout: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30000,
        comment: 'Timeout in milliseconds'
      },
      headers: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Custom headers to send with webhook'
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
      createdBy: {
        type: userFkType,
        allowNull: false,
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
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'updated_at'
      }
    });

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS webhooks_wh_event ON webhooks (wh_event);
      CREATE INDEX IF NOT EXISTS webhooks_is_active ON webhooks (is_active);
      CREATE INDEX IF NOT EXISTS webhooks_branch_id ON webhooks (branch_id);
      CREATE INDEX IF NOT EXISTS webhooks_tenant_id ON webhooks (tenant_id);
    `);

    await ensureTableMerge('webhook_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      webhookId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'webhook_id',
        references: {
          model: 'webhooks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      event: {
        type: Sequelize.STRING(50),
        allowNull: false,
        field: 'log_event'
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Payload sent to webhook'
      },
      responseStatus: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'response_status'
      },
      responseBody: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'response_body'
      },
      responseHeaders: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'response_headers'
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Response time in milliseconds'
      },
      attempt: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      status: {
        type: Sequelize.ENUM('pending', 'success', 'failed', 'retrying'),
        allowNull: false,
        defaultValue: 'pending'
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'error_message'
      },
      nextRetryAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'next_retry_at'
      },
      triggeredBy: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'triggered_by',
        comment: 'User or system that triggered the webhook'
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

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS webhook_logs_webhook_id ON webhook_logs (webhook_id);
      CREATE INDEX IF NOT EXISTS webhook_logs_log_event ON webhook_logs (log_event);
      CREATE INDEX IF NOT EXISTS webhook_logs_status ON webhook_logs (status);
      CREATE INDEX IF NOT EXISTS webhook_logs_created_at ON webhook_logs (created_at);
      CREATE INDEX IF NOT EXISTS webhook_logs_next_retry_at ON webhook_logs (next_retry_at);
      CREATE INDEX IF NOT EXISTS webhook_logs_tenant_id ON webhook_logs (tenant_id);
    `);

    await ensureTableMerge('webhook_subscriptions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      webhookId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'webhook_id',
        references: {
          model: 'webhooks',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      entityType: {
        type: Sequelize.ENUM('product', 'ingredient', 'category', 'branch', 'employee', 'customer'),
        allowNull: false,
        field: 'entity_type'
      },
      entityId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'entity_id'
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

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS webhook_subscriptions_webhook_id ON webhook_subscriptions (webhook_id);
      CREATE INDEX IF NOT EXISTS webhook_subscriptions_entity_type_entity_id ON webhook_subscriptions (entity_type, entity_id);
      CREATE INDEX IF NOT EXISTS webhook_subscriptions_is_active ON webhook_subscriptions (is_active);
      CREATE INDEX IF NOT EXISTS webhook_subscriptions_tenant_id ON webhook_subscriptions (tenant_id);
    `);

    await sequelize.query(`
      INSERT INTO webhooks (id, name, description, url, wh_event, is_active, tenant_id, created_by, created_at, updated_at)
      SELECT
        gen_random_uuid(),
        'Low Stock Alert',
        'Automatically sends alert when product stock falls below minimum level',
        'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
        'low_stock_alert'::text::"enum_webhooks_wh_event",
        true,
        t.id,
        (SELECT id FROM users WHERE role = 'super_admin' LIMIT 1),
        NOW(),
        NOW()
      FROM tenants t
      WHERE NOT EXISTS (
        SELECT 1 FROM webhooks w
        WHERE w.tenant_id = t.id AND w.wh_event::text = 'low_stock_alert'
      )
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS webhook_subscriptions_tenant_id;
      DROP INDEX IF EXISTS webhook_subscriptions_is_active;
      DROP INDEX IF EXISTS webhook_subscriptions_entity_type_entity_id;
      DROP INDEX IF EXISTS webhook_subscriptions_webhook_id;
    `);

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS webhook_logs_tenant_id;
      DROP INDEX IF EXISTS webhook_logs_next_retry_at;
      DROP INDEX IF EXISTS webhook_logs_created_at;
      DROP INDEX IF EXISTS webhook_logs_status;
      DROP INDEX IF EXISTS webhook_logs_log_event;
      DROP INDEX IF EXISTS webhook_logs_webhook_id;
    `);

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS webhooks_tenant_id;
      DROP INDEX IF EXISTS webhooks_branch_id;
      DROP INDEX IF EXISTS webhooks_is_active;
      DROP INDEX IF EXISTS webhooks_wh_event;
    `);

    await queryInterface.dropTable('webhook_subscriptions');
    await queryInterface.dropTable('webhook_logs');
    await queryInterface.dropTable('webhooks');
  }
};
