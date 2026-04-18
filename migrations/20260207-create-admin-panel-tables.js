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

    /** Match FK column types to existing referenced PK types (handles INT vs UUID drift). */
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
        `SELECT udt_name FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = '${tableName}' AND column_name = '${columnName}'`
      );
      return pgUdtToSequelizeType(rows[0]?.udt_name);
    };

    // 1. Create partners table (merge columns if table exists but is incomplete)
    const partnerTableDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      business_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      business_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'pharmacy, retail, restaurant, etc.'
      },
      owner_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      postal_code: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      tax_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'NPWP'
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'pending',
        comment: 'pending, active, inactive, suspended'
      },
      activation_status: {
        type: Sequelize.STRING(50),
        defaultValue: 'pending',
        comment: 'pending, approved, rejected'
      },
      activation_requested_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      activation_approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      activation_approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      rejection_reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      logo_url: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      website: {
        type: Sequelize.STRING(255),
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

    await ensureTableMerge('partners', partnerTableDef);

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_partners_status ON "partners" ("status")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_partners_activation_status ON "partners" ("activation_status")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_partners_email ON "partners" ("email")'
    );

    // 2. Create subscription_packages table
    const subscriptionPackagesDef = {
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
      price_monthly: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      price_yearly: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true
      },
      max_outlets: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      max_users: {
        type: Sequelize.INTEGER,
        defaultValue: 3
      },
      max_products: {
        type: Sequelize.INTEGER,
        defaultValue: 1000
      },
      max_transactions_per_month: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      features: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'Array of feature flags'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await ensureTableMerge('subscription_packages', subscriptionPackagesDef);

    // 3. Create partner_subscriptions table
    const partnerSubscriptionsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      partner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'partners',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      package_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'subscription_packages',
          key: 'id'
        }
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'active',
        comment: 'active, expired, cancelled, suspended'
      },
      start_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      auto_renew: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'bank_transfer, credit_card, e-wallet'
      },
      last_payment_date: {
        type: Sequelize.DATE,
        allowNull: true
      },
      next_billing_date: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      total_paid: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
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
    await ensureTableMerge('partner_subscriptions', partnerSubscriptionsDef);

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_partner ON "partner_subscriptions" ("partner_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_partner_subscriptions_status ON "partner_subscriptions" ("status")'
    );

    // 4. Create partner_outlets table
    const partnerOutletsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      partner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'partners',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      outlet_name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      outlet_code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      phone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      manager_name: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      pos_device_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Device identifier'
      },
      last_sync_at: {
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
    await ensureTableMerge('partner_outlets', partnerOutletsDef);

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_partner_outlets_partner ON "partner_outlets" ("partner_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_partner_outlets_code ON "partner_outlets" ("outlet_code")'
    );

    // 5. Create partner_users table
    const partnerUsersPartnerFkType = await fkTypeFor('partners', 'id');
    const partnerUsersOutletFkType = await fkTypeFor('partner_outlets', 'id');
    const partnerUsersDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      partner_id: {
        type: partnerUsersPartnerFkType,
        allowNull: false,
        references: {
          model: 'partners',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      outlet_id: {
        type: partnerUsersOutletFkType,
        allowNull: true,
        references: {
          model: 'partner_outlets',
          key: 'id'
        },
        onDelete: 'SET NULL'
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      role: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'owner, admin, manager, cashier, staff'
      },
      password_hash: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      last_login_at: {
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
    await ensureTableMerge('partner_users', partnerUsersDef);

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_partner_users_partner ON "partner_users" ("partner_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_partner_users_email ON "partner_users" ("email")'
    );

    // 6. Create activation_requests table
    const activationPartnerFkType = await fkTypeFor('partners', 'id');
    const activationPackageFkType = await fkTypeFor('subscription_packages', 'id');
    const activationRequestsDef = {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      partner_id: {
        type: activationPartnerFkType,
        allowNull: false,
        references: {
          model: 'partners',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      package_id: {
        type: activationPackageFkType,
        allowNull: false,
        references: {
          model: 'subscription_packages',
          key: 'id'
        }
      },
      business_documents: {
        type: Sequelize.JSONB,
        allowNull: true,
        comment: 'KTP, NPWP, SIUP, etc.'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING(50),
        defaultValue: 'pending',
        comment: 'pending, approved, rejected, under_review'
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      review_notes: {
        type: Sequelize.TEXT,
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
    await ensureTableMerge('activation_requests', activationRequestsDef);

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_activation_requests_status ON "activation_requests" ("status")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS idx_activation_requests_partner ON "activation_requests" ("partner_id")'
    );

    // Insert sample subscription packages (only when empty; id type must match existing column)
    const [pkgRows] = await sequelize.query(
      'SELECT COUNT(*)::int AS c FROM "subscription_packages"'
    );
    const [spkIdRows] = await sequelize.query(
      `SELECT udt_name FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'subscription_packages' AND column_name = 'id'`
    );
    const spkIdUdt = String(spkIdRows[0]?.udt_name || '').toLowerCase();
    const pkgIdsAreInteger = spkIdUdt === 'int4' || spkIdUdt === 'integer';

    if (Number(pkgRows[0].c) === 0) {
      const seedRows = pkgIdsAreInteger
        ? [
            {
              id: 1,
              name: 'Starter',
              description:
                'Paket untuk usaha kecil - cocok untuk toko retail atau apotek dengan 1 outlet',
              price_monthly: 99000,
              price_yearly: 990000,
              max_outlets: 1,
              max_users: 3,
              max_products: 500,
              max_transactions_per_month: 1000,
              features: JSON.stringify(['pos', 'inventory', 'basic_reports']),
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: 2,
              name: 'Professional',
              description: 'Paket untuk usaha menengah - multi outlet dengan fitur lengkap',
              price_monthly: 299000,
              price_yearly: 2990000,
              max_outlets: 5,
              max_users: 10,
              max_products: 5000,
              max_transactions_per_month: 10000,
              features: JSON.stringify([
                'pos',
                'inventory',
                'advanced_reports',
                'multi_outlet',
                'loyalty',
                'analytics'
              ]),
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: 3,
              name: 'Enterprise',
              description: 'Paket untuk usaha besar - unlimited outlets dan fitur premium',
              price_monthly: 999000,
              price_yearly: 9990000,
              max_outlets: 999,
              max_users: 999,
              max_products: 999999,
              max_transactions_per_month: null,
              features: JSON.stringify([
                'pos',
                'inventory',
                'advanced_reports',
                'multi_outlet',
                'loyalty',
                'analytics',
                'api_access',
                'custom_integration',
                'priority_support'
              ]),
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            }
          ]
        : [
            {
              id: '00000000-0000-0000-0000-000000000001',
              name: 'Starter',
              description:
                'Paket untuk usaha kecil - cocok untuk toko retail atau apotek dengan 1 outlet',
              price_monthly: 99000,
              price_yearly: 990000,
              max_outlets: 1,
              max_users: 3,
              max_products: 500,
              max_transactions_per_month: 1000,
              features: JSON.stringify(['pos', 'inventory', 'basic_reports']),
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: '00000000-0000-0000-0000-000000000002',
              name: 'Professional',
              description: 'Paket untuk usaha menengah - multi outlet dengan fitur lengkap',
              price_monthly: 299000,
              price_yearly: 2990000,
              max_outlets: 5,
              max_users: 10,
              max_products: 5000,
              max_transactions_per_month: 10000,
              features: JSON.stringify([
                'pos',
                'inventory',
                'advanced_reports',
                'multi_outlet',
                'loyalty',
                'analytics'
              ]),
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: '00000000-0000-0000-0000-000000000003',
              name: 'Enterprise',
              description: 'Paket untuk usaha besar - unlimited outlets dan fitur premium',
              price_monthly: 999000,
              price_yearly: 9990000,
              max_outlets: 999,
              max_users: 999,
              max_products: 999999,
              max_transactions_per_month: null,
              features: JSON.stringify([
                'pos',
                'inventory',
                'advanced_reports',
                'multi_outlet',
                'loyalty',
                'analytics',
                'api_access',
                'custom_integration',
                'priority_support'
              ]),
              is_active: true,
              created_at: new Date(),
              updated_at: new Date()
            }
          ];
      await queryInterface.bulkInsert('subscription_packages', seedRows);
    }

    console.log('✅ Admin panel tables created successfully');
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('activation_requests');
    await queryInterface.dropTable('partner_users');
    await queryInterface.dropTable('partner_outlets');
    await queryInterface.dropTable('partner_subscriptions');
    await queryInterface.dropTable('subscription_packages');
    await queryInterface.dropTable('partners');
    
    console.log('✅ Admin panel tables dropped successfully');
  }
};
