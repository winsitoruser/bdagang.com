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

    await ensureTableMerge('webhook_event_configs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      eventType: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'event_type',
        comment: 'Event type (e.g., transaction_voided, low_stock)'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      thresholds: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Threshold conditions for triggering'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      },
      emailRecipients: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'email_recipients',
        comment: 'List of email recipients'
      },
      emailTemplate: {
        type: Sequelize.STRING(100),
        allowNull: true,
        field: 'email_template'
      },
      whatsappRecipients: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'whatsapp_recipients',
        comment: 'List of WhatsApp recipients'
      },
      webhookUrls: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'webhook_urls',
        comment: 'Additional webhook URLs'
      },
      retryConfig: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'retry_config',
        comment: 'Retry configuration'
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

    await ensureTableMerge('webhook_dispatch_logs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      eventType: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'event_type'
      },
      payload: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Full payload sent'
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'normal'
      },
      channels: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Channels used for dispatch'
      },
      targetBranches: {
        type: Sequelize.JSON,
        allowNull: true,
        field: 'target_branches',
        comment: 'Target branches (null = all)'
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'completed', 'failed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      dispatchedBy: {
        type: userFkType,
        allowNull: false,
        field: 'dispatched_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'processed_at'
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'error_message'
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

    await ensureTableMerge('webhook_results', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      dispatchLogId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'dispatch_log_id',
        references: {
          model: 'webhook_dispatch_logs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      channel: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Channel used (webhook, email, whatsapp, dashboard)'
      },
      endpoint: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Target endpoint for webhook channel'
      },
      success: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      responseCode: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'response_code'
      },
      responseMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'response_message'
      },
      attemptCount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'attempt_count'
      },
      nextRetryAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'next_retry_at'
      },
      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'completed_at'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'created_at'
      }
    });

    await ensureTableMerge('dashboard_notifications', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      userId: {
        type: userFkType,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      priority: {
        type: Sequelize.ENUM('low', 'normal', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'normal'
      },
      data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional data payload'
      },
      isRead: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_read'
      },
      readAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'read_at'
      },
      actionUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'action_url'
      },
      expiresAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'expires_at'
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

    const ppCols = await queryInterface.describeTable('product_prices').catch(() => null);
    if (ppCols && !ppCols.is_locked_by_hq) {
      await queryInterface.addColumn('product_prices', 'is_locked_by_hq', {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_locked_by_hq',
        comment: 'If true, price cannot be modified by branch managers'
      });
    }

    await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS webhook_event_configs_event_type_tenant_id ON webhook_event_configs (event_type, tenant_id);
      CREATE INDEX IF NOT EXISTS webhook_event_configs_is_active ON webhook_event_configs (is_active);
      CREATE INDEX IF NOT EXISTS webhook_event_configs_tenant_id ON webhook_event_configs (tenant_id);

      CREATE INDEX IF NOT EXISTS webhook_dispatch_logs_event_type ON webhook_dispatch_logs (event_type);
      CREATE INDEX IF NOT EXISTS webhook_dispatch_logs_status ON webhook_dispatch_logs (status);
      CREATE INDEX IF NOT EXISTS webhook_dispatch_logs_created_at ON webhook_dispatch_logs (created_at);
      CREATE INDEX IF NOT EXISTS webhook_dispatch_logs_tenant_id ON webhook_dispatch_logs (tenant_id);

      CREATE INDEX IF NOT EXISTS webhook_results_dispatch_log_id ON webhook_results (dispatch_log_id);
      CREATE INDEX IF NOT EXISTS webhook_results_channel ON webhook_results (channel);
      CREATE INDEX IF NOT EXISTS webhook_results_success ON webhook_results (success);
      CREATE INDEX IF NOT EXISTS webhook_results_next_retry_at ON webhook_results (next_retry_at);

      CREATE INDEX IF NOT EXISTS dashboard_notifications_user_id_is_read ON dashboard_notifications (user_id, is_read);
      CREATE INDEX IF NOT EXISTS dashboard_notifications_type ON dashboard_notifications (type);
      CREATE INDEX IF NOT EXISTS dashboard_notifications_priority ON dashboard_notifications (priority);
      CREATE INDEX IF NOT EXISTS dashboard_notifications_expires_at ON dashboard_notifications (expires_at);
      CREATE INDEX IF NOT EXISTS dashboard_notifications_tenant_id ON dashboard_notifications (tenant_id);

      CREATE INDEX IF NOT EXISTS product_prices_is_locked_by_hq ON product_prices (is_locked_by_hq);
    `);

    await sequelize.query(`
      INSERT INTO webhook_event_configs (
        id, event_type, name, description, thresholds, is_active,
        email_recipients, whatsapp_recipients, created_by, tenant_id, created_at, updated_at
      )
      SELECT
        gen_random_uuid(),
        'transaction_voided',
        'Transaction Voided',
        'Alert when a transaction is voided',
        '{"minAmount": 100000, "businessHoursOnly": false}',
        true,
        '["manager@company.com", "supervisor@company.com"]',
        '["+628123456789", "+628987654321"]',
        u.id,
        t.id,
        NOW(),
        NOW()
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.role = 'super_admin'
      AND NOT EXISTS (
        SELECT 1 FROM webhook_event_configs
        WHERE event_type = 'transaction_voided' AND tenant_id = t.id
      )
    `);

    await sequelize.query(`
      INSERT INTO webhook_event_configs (
        id, event_type, name, description, thresholds, is_active,
        email_recipients, created_by, tenant_id, created_at, updated_at
      )
      SELECT
        gen_random_uuid(),
        'low_stock',
        'Low Stock Alert',
        'Alert when product stock is low',
        '{"minStockLevel": 0, "percentageThreshold": 20}',
        true,
        '["inventory@company.com"]',
        u.id,
        t.id,
        NOW(),
        NOW()
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.role = 'super_admin'
      AND NOT EXISTS (
        SELECT 1 FROM webhook_event_configs
        WHERE event_type = 'low_stock' AND tenant_id = t.id
      )
    `);

    await sequelize.query(`
      INSERT INTO webhook_event_configs (
        id, event_type, name, description, thresholds, is_active,
        email_recipients, whatsapp_recipients, created_by, tenant_id, created_at, updated_at
      )
      SELECT
        gen_random_uuid(),
        'suspicious_activity',
        'Suspicious Activity',
        'Alert for suspicious activities (large voids, unusual patterns)',
        '{"minAmount": 5000000, "businessHoursOnly": false}',
        true,
        '["security@company.com", "manager@company.com"]',
        '["+628123456789"]',
        u.id,
        t.id,
        NOW(),
        NOW()
      FROM users u
      JOIN tenants t ON u.tenant_id = t.id
      WHERE u.role = 'super_admin'
      AND NOT EXISTS (
        SELECT 1 FROM webhook_event_configs
        WHERE event_type = 'suspicious_activity' AND tenant_id = t.id
      )
    `);

    await sequelize.query(`
      CREATE OR REPLACE FUNCTION check_price_lock()
      RETURNS TRIGGER AS $$
      DECLARE
        is_locked BOOLEAN;
        user_role TEXT;
      BEGIN
        SELECT is_locked_by_hq INTO is_locked
        FROM product_prices
        WHERE id = NEW.id;

        user_role := current_setting('app.current_user_role', true);

        IF is_locked = true AND user_role NOT IN ('super_admin', 'admin') THEN
          RAISE EXCEPTION 'Price is locked by HQ. Cannot modify.';
        END IF;

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS check_price_lock()');

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS product_prices_is_locked_by_hq;

      DROP INDEX IF EXISTS dashboard_notifications_tenant_id;
      DROP INDEX IF EXISTS dashboard_notifications_expires_at;
      DROP INDEX IF EXISTS dashboard_notifications_priority;
      DROP INDEX IF EXISTS dashboard_notifications_type;
      DROP INDEX IF EXISTS dashboard_notifications_user_id_is_read;

      DROP INDEX IF EXISTS webhook_results_next_retry_at;
      DROP INDEX IF EXISTS webhook_results_success;
      DROP INDEX IF EXISTS webhook_results_channel;
      DROP INDEX IF EXISTS webhook_results_dispatch_log_id;

      DROP INDEX IF EXISTS webhook_dispatch_logs_tenant_id;
      DROP INDEX IF EXISTS webhook_dispatch_logs_created_at;
      DROP INDEX IF EXISTS webhook_dispatch_logs_status;
      DROP INDEX IF EXISTS webhook_dispatch_logs_event_type;

      DROP INDEX IF EXISTS webhook_event_configs_tenant_id;
      DROP INDEX IF EXISTS webhook_event_configs_is_active;
      DROP INDEX IF EXISTS webhook_event_configs_event_type_tenant_id;
    `);

    await queryInterface.dropTable('dashboard_notifications');
    await queryInterface.dropTable('webhook_results');
    await queryInterface.dropTable('webhook_dispatch_logs');
    await queryInterface.dropTable('webhook_event_configs');

    const pp = await queryInterface.describeTable('product_prices').catch(() => null);
    if (pp?.is_locked_by_hq) {
      await queryInterface.removeColumn('product_prices', 'is_locked_by_hq');
    }
  }
};
