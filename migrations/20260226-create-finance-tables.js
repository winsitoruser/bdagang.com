'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create finance_accounts table
    await queryInterface.createTable('finance_accounts', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      branchId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      accountCode: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      accountName: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      accountType: {
        type: Sequelize.ENUM('asset', 'liability', 'equity', 'revenue', 'expense'),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      subCategory: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      parentAccountId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'finance_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      balance: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'IDR',
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Indexes (column names vary: camelCase vs snake_case drift across environments)
    const sequelize = queryInterface.sequelize;
    const idxDyn = async (table, indexName, candidates) => {
      const [rows] = await sequelize.query(`
        SELECT column_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = '${table}'
      `);
      const set = new Set((rows || []).map((r) => r.column_name));
      const col = candidates.find((c) => set.has(c));
      if (!col) return;
      const q = /[A-Z]/.test(col) ? `"${col}"` : col;
      await sequelize.query(
        `CREATE INDEX IF NOT EXISTS ${indexName} ON ${table} (${q})`
      );
    };
    await idxDyn('finance_accounts', 'finance_accounts_tenant_idx', [
      'tenantId',
      'tenant_id'
    ]);
    await idxDyn('finance_accounts', 'finance_accounts_branch_idx', [
      'branchId',
      'branch_id'
    ]);
    await idxDyn('finance_accounts', 'finance_accounts_account_type_idx', [
      'accountType',
      'account_type'
    ]);
    await idxDyn('finance_accounts', 'finance_accounts_is_active_idx', [
      'isActive',
      'is_active'
    ]);

    // Create finance_transactions table
    await queryInterface.createTable('finance_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      branchId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      transactionNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      transactionDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('income', 'expense', 'transfer'),
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      accountId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'finance_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      debitAccountId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'finance_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      creditAccountId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'finance_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      amount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'IDR',
      },
      exchangeRate: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
        defaultValue: 1,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      reference: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('draft', 'pending', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
      },
      paymentMethod: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      attachments: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      approvedBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await idxDyn('finance_transactions', 'finance_transactions_tenant_idx', [
      'tenantId',
      'tenant_id'
    ]);
    await idxDyn('finance_transactions', 'finance_transactions_branch_idx', [
      'branchId',
      'branch_id'
    ]);
    await idxDyn(
      'finance_transactions',
      'finance_transactions_transaction_date_idx',
      ['transactionDate', 'transaction_date']
    );
    await idxDyn('finance_transactions', 'finance_transactions_type_idx', [
      'type'
    ]);
    await idxDyn('finance_transactions', 'finance_transactions_status_idx', [
      'status'
    ]);
    await idxDyn('finance_transactions', 'finance_transactions_account_idx', [
      'accountId',
      'account_id'
    ]);

    // Create finance_invoices table
    await queryInterface.createTable('finance_invoices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      branchId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      invoiceNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      invoiceDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM('sales', 'purchase', 'inter_branch'),
        allowNull: false,
      },
      customerId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      supplierId: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      relatedBranchId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      subtotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      taxAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      discountAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      totalAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      paidAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      outstandingAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'IDR',
      },
      status: {
        type: Sequelize.ENUM('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
      },
      paymentTerms: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      items: {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      attachments: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await idxDyn('finance_invoices', 'finance_invoices_tenant_idx', [
      'tenantId',
      'tenant_id'
    ]);
    await idxDyn('finance_invoices', 'finance_invoices_branch_idx', [
      'branchId',
      'branch_id'
    ]);
    await idxDyn('finance_invoices', 'finance_invoices_invoice_date_idx', [
      'invoiceDate',
      'invoice_date'
    ]);
    await idxDyn('finance_invoices', 'finance_invoices_due_date_idx', [
      'dueDate',
      'due_date'
    ]);
    await idxDyn('finance_invoices', 'finance_invoices_type_idx', ['type']);
    await idxDyn('finance_invoices', 'finance_invoices_status_idx', ['status']);

    // Create finance_budgets table
    await queryInterface.createTable('finance_budgets', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      tenantId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'tenants',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      branchId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      fiscalYear: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      period: {
        type: Sequelize.ENUM('monthly', 'quarterly', 'yearly'),
        allowNull: false,
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      accountId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
          model: 'finance_accounts',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      plannedAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
      },
      actualAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      variance: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
      },
      variancePercentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'IDR',
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft',
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdBy: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      updatedBy: {
        type: Sequelize.UUID,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await idxDyn('finance_budgets', 'finance_budgets_tenant_idx', [
      'tenantId',
      'tenant_id'
    ]);
    await idxDyn('finance_budgets', 'finance_budgets_branch_idx', [
      'branchId',
      'branch_id'
    ]);
    await idxDyn('finance_budgets', 'finance_budgets_fiscal_year_idx', [
      'fiscalYear',
      'fiscal_year'
    ]);
    await idxDyn('finance_budgets', 'finance_budgets_period_idx', ['period']);
    await idxDyn('finance_budgets', 'finance_budgets_status_idx', ['status']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('finance_budgets');
    await queryInterface.dropTable('finance_invoices');
    await queryInterface.dropTable('finance_transactions');
    await queryInterface.dropTable('finance_accounts');
  }
};
