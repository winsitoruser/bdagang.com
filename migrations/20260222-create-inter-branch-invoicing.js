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

    const transferFkType = await fkTypeFor('inventory_transfers', 'id');
    const branchFkType = await fkTypeFor('branches', 'id');
    const userFkType = await fkTypeFor('users', 'id');
    const tenantFkType = await fkTypeFor('tenants', 'id');
    const productFkType = await fkTypeFor('products', 'id');

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

    // Create inter_branch_invoices table
    await ensureTableMerge('inter_branch_invoices', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      invoiceNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'invoice_number'
      },
      invoiceType: {
        type: Sequelize.ENUM('inter_branch', 'settlement', 'adjustment'),
        allowNull: false,
        defaultValue: 'inter_branch',
        field: 'invoice_type'
      },
      transferId: {
        type: transferFkType,
        allowNull: true,
        field: 'transfer_id',
        references: {
          model: 'inventory_transfers',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      fromBranchId: {
        type: branchFkType,
        allowNull: false,
        field: 'from_branch_id',
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      toBranchId: {
        type: branchFkType,
        allowNull: false,
        field: 'to_branch_id',
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      invoiceDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'invoice_date'
      },
      dueDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'due_date'
      },
      subtotal: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      taxRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'tax_rate'
      },
      taxAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'tax_amount'
      },
      totalAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'total_amount'
      },
      status: {
        type: Sequelize.ENUM('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled'),
        allowNull: false,
        defaultValue: 'draft'
      },
      paidAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'paid_amount'
      },
      paidDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'paid_date'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      terms: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      attachmentUrl: {
        type: Sequelize.STRING(500),
        allowNull: true,
        field: 'attachment_url'
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
      approvedBy: {
        type: userFkType,
        allowNull: true,
        field: 'approved_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approvedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'approved_at'
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

    // Create inter_branch_invoice_items table
    await ensureTableMerge('inter_branch_invoice_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      invoiceId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'invoice_id',
        references: {
          model: 'inter_branch_invoices',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      productName: {
        type: Sequelize.STRING(200),
        allowNull: false,
        field: 'product_name'
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      unitPrice: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        field: 'unit_price'
      },
      totalPrice: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        field: 'total_price'
      },
      taxRate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'tax_rate'
      },
      taxAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'tax_amount'
      },
      discountPercentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'discount_percentage'
      },
      discountAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'discount_amount'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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
      CREATE UNIQUE INDEX IF NOT EXISTS inter_branch_invoices_invoice_number ON inter_branch_invoices (invoice_number);
      CREATE INDEX IF NOT EXISTS inter_branch_invoices_transfer_id ON inter_branch_invoices (transfer_id);
      CREATE INDEX IF NOT EXISTS inter_branch_invoices_from_branch_id ON inter_branch_invoices (from_branch_id);
      CREATE INDEX IF NOT EXISTS inter_branch_invoices_to_branch_id ON inter_branch_invoices (to_branch_id);
      CREATE INDEX IF NOT EXISTS inter_branch_invoices_status ON inter_branch_invoices (status);
      CREATE INDEX IF NOT EXISTS inter_branch_invoices_invoice_date ON inter_branch_invoices (invoice_date);
      CREATE INDEX IF NOT EXISTS inter_branch_invoices_due_date ON inter_branch_invoices (due_date);
      CREATE INDEX IF NOT EXISTS inter_branch_invoices_created_by ON inter_branch_invoices (created_by);
      CREATE INDEX IF NOT EXISTS inter_branch_invoices_tenant_id ON inter_branch_invoices (tenant_id);
      CREATE INDEX IF NOT EXISTS inter_branch_invoice_items_invoice_id ON inter_branch_invoice_items (invoice_id);
      CREATE INDEX IF NOT EXISTS inter_branch_invoice_items_product_id ON inter_branch_invoice_items (product_id);
    `);

    // Create function to update invoice status when paid
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_invoice_status()
      RETURNS TRIGGER AS $$
      BEGIN
        -- Update invoice status based on payment
        IF NEW.paid_amount >= NEW.total_amount AND OLD.paid_amount < NEW.total_amount THEN
          NEW.status = 'paid';
          NEW.paid_date = NOW();
        ELSIF NEW.paid_amount > 0 AND NEW.paid_amount < NEW.total_amount THEN
          NEW.status = 'sent';
        END IF;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_invoice_status ON inter_branch_invoices;
      CREATE TRIGGER trigger_update_invoice_status
        BEFORE UPDATE OF paid_amount ON inter_branch_invoices
        FOR EACH ROW
        EXECUTE FUNCTION update_invoice_status();
    `);

    const posColsPnl = await queryInterface.describeTable('pos_transactions');
    const ptBranchJoin = posColsPnl.branch_id
      ? `LEFT JOIN pos_transactions pt ON b.id::text = pt.branch_id::text`
      : 'LEFT JOIN pos_transactions pt ON false';
    const ptStatusClause = posColsPnl.status
      ? `AND pt.status::text IN ('closed', 'completed', 'paid', 'success')`
      : '';
    const revenueExpr = posColsPnl.total_amount
      ? 'COALESCE(SUM(pt.total_amount), 0)'
      : posColsPnl.total
        ? 'COALESCE(SUM(pt.total), 0)'
        : '0::numeric';
    const netRevExpr = posColsPnl.subtotal
      ? 'COALESCE(SUM(pt.subtotal), 0)'
      : revenueExpr;
    const discountExpr =
      posColsPnl.discount_amount && posColsPnl.discount
        ? 'COALESCE(SUM(pt.discount_amount), COALESCE(SUM(pt.discount), 0))'
        : posColsPnl.discount_amount
          ? 'COALESCE(SUM(pt.discount_amount), 0)'
          : posColsPnl.discount
            ? 'COALESCE(SUM(pt.discount), 0)'
            : '0::numeric';
    const taxExpr =
      posColsPnl.tax_amount && posColsPnl.tax
        ? 'COALESCE(SUM(pt.tax_amount), COALESCE(SUM(pt.tax), 0))'
        : posColsPnl.tax_amount
          ? 'COALESCE(SUM(pt.tax_amount), 0)'
          : posColsPnl.tax
            ? 'COALESCE(SUM(pt.tax), 0)'
            : '0::numeric';

    const productsColsPnl = await queryInterface.describeTable('products');
    const costCol = productsColsPnl.cost
      ? 'p.cost'
      : productsColsPnl.standard_cost
        ? 'p.standard_cost'
        : '0::numeric';

    const ptiCols = await queryInterface.describeTable('pos_transaction_items');
    const ptiTxnCol = ptiCols.transaction_id
      ? 'transaction_id'
      : ptiCols.pos_transaction_id
        ? 'pos_transaction_id'
        : null;

    let ftExpenseWhere = 'false';
    let ftDateTruncExpr = 'ft.transaction_date';
    const allTbl = await queryInterface.showAllTables();
    if (allTbl.includes('finance_transactions')) {
      const ftCols = await queryInterface.describeTable('finance_transactions');
      const tt = ftCols.transaction_type
        ? 'transaction_type'
        : ftCols.transactionType
          ? '"transactionType"'
          : null;
      const bd = ftCols.branch_id ? 'branch_id' : ftCols.branchId ? '"branchId"' : null;
      const td = ftCols.transaction_date
        ? 'transaction_date'
        : ftCols.transactionDate
          ? '"transactionDate"'
          : null;
      if (tt && bd && td) {
        ftExpenseWhere = `ft.${bd}::text = b.id::text AND ft.${tt}::text = 'expense'`;
        ftDateTruncExpr = `ft.${td}`;
      }
    }

    const ftColsForJoin = allTbl.includes('finance_transactions')
      ? await queryInterface.describeTable('finance_transactions')
      : {};
    const ftBdCol =
      ftColsForJoin.branch_id != null
        ? 'branch_id'
        : ftColsForJoin.branchId != null
          ? '"branchId"'
          : null;

    const posAgg = `
        SELECT 
          t.id as tenant_id,
          t.name as tenant_name,
          b.id as branch_id,
          b.name as branch_name,
          b.code as branch_code,
          DATE_TRUNC('month', pt.transaction_date) as period,
          COUNT(DISTINCT pt.id) as transaction_count,
          ${revenueExpr} as revenue,
          ${netRevExpr} as net_revenue,
          ${discountExpr} as discount,
          ${taxExpr} as tax_collected
        FROM tenants t
        JOIN branches b ON t.id = b.tenant_id
        ${ptBranchJoin}
          ${ptStatusClause}
        WHERE b.is_active = true
        GROUP BY t.id, t.name, b.id, b.name, b.code, DATE_TRUNC('month', pt.transaction_date)`;

    const cogsAgg =
      ptiTxnCol &&
      `
        SELECT 
          b.id as branch_id,
          DATE_TRUNC('month', pt.transaction_date) as period,
          COALESCE(SUM(pti.quantity * COALESCE(${costCol}, 0)), 0) as cogs
        FROM tenants t
        JOIN branches b ON t.id = b.tenant_id
        ${ptBranchJoin}
          ${ptStatusClause}
        JOIN pos_transaction_items pti ON pti.${ptiTxnCol}::text = pt.id::text
        JOIN products p ON pti.product_id::text = p.id::text
        WHERE b.is_active = true
        GROUP BY b.id, DATE_TRUNC('month', pt.transaction_date)`;

    const ftExpenseWhereJoin =
      ftBdCol && ftExpenseWhere !== 'false'
        ? ftExpenseWhere.replace(
            /ft\.[^ ]+::text = b\.id::text/g,
            `ft.${ftBdCol}::text = b2.id::text`
          )
        : 'false';

    const ftAgg =
      ftBdCol && ftExpenseWhereJoin !== 'false'
        ? `
        SELECT 
          b2.id as branch_id,
          DATE_TRUNC('month', ${ftDateTruncExpr}) as period,
          SUM(ft.amount) as expenses
        FROM finance_transactions ft
        JOIN branches b2 ON ft.${ftBdCol}::text = b2.id::text
        WHERE ${ftExpenseWhereJoin}
        GROUP BY b2.id, DATE_TRUNC('month', ${ftDateTruncExpr})`
        : null;

    await queryInterface.sequelize.query(`
      CREATE OR REPLACE VIEW consolidated_profit_loss AS
      SELECT 
        pa.tenant_id,
        pa.tenant_name,
        pa.branch_id,
        pa.branch_name,
        pa.branch_code,
        pa.period,
        pa.transaction_count,
        pa.revenue,
        pa.net_revenue,
        pa.discount,
        pa.tax_collected,
        COALESCE(cg.cogs, 0) as cogs,
        COALESCE(ftx.expenses, 0) as expenses,
        COALESCE(ibf.from_amt, 0) as inter_branch_income,
        COALESCE(ibt.to_amt, 0) as inter_branch_expense,
        CURRENT_TIMESTAMP as generated_at
      FROM (${posAgg}) pa
      LEFT JOIN (${cogsAgg || 'SELECT NULL::uuid as branch_id, NULL::timestamptz as period, 0::numeric as cogs WHERE false'}) cg
        ON cg.branch_id::text = pa.branch_id::text AND cg.period = pa.period
      LEFT JOIN (${ftAgg || 'SELECT NULL::uuid as branch_id, NULL::timestamptz as period, 0::numeric as expenses WHERE false'}) ftx
        ON ftx.branch_id::text = pa.branch_id::text AND ftx.period = pa.period
      LEFT JOIN (
        SELECT 
          ibi.from_branch_id as bid,
          DATE_TRUNC('month', ibi.invoice_date) as period,
          SUM(ibi.total_amount) as from_amt
        FROM inter_branch_invoices ibi
        WHERE ibi.status::text = 'paid'
        GROUP BY ibi.from_branch_id, DATE_TRUNC('month', ibi.invoice_date)
      ) ibf ON ibf.bid::text = pa.branch_id::text AND ibf.period = pa.period
      LEFT JOIN (
        SELECT 
          ibi.to_branch_id as bid,
          DATE_TRUNC('month', ibi.invoice_date) as period,
          SUM(ibi.total_amount) as to_amt
        FROM inter_branch_invoices ibi
        WHERE ibi.status::text = 'paid'
        GROUP BY ibi.to_branch_id, DATE_TRUNC('month', ibi.invoice_date)
      ) ibt ON ibt.bid::text = pa.branch_id::text AND ibt.period = pa.period;
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop view
    await queryInterface.sequelize.query('DROP VIEW IF EXISTS consolidated_profit_loss');

    // Drop triggers and functions
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS trigger_update_invoice_status ON inter_branch_invoices'
    );
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS update_invoice_status()');

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS inter_branch_invoice_items_product_id;
      DROP INDEX IF EXISTS inter_branch_invoice_items_invoice_id;
      DROP INDEX IF EXISTS inter_branch_invoices_tenant_id;
      DROP INDEX IF EXISTS inter_branch_invoices_created_by;
      DROP INDEX IF EXISTS inter_branch_invoices_due_date;
      DROP INDEX IF EXISTS inter_branch_invoices_invoice_date;
      DROP INDEX IF EXISTS inter_branch_invoices_status;
      DROP INDEX IF EXISTS inter_branch_invoices_to_branch_id;
      DROP INDEX IF EXISTS inter_branch_invoices_from_branch_id;
      DROP INDEX IF EXISTS inter_branch_invoices_transfer_id;
      DROP INDEX IF EXISTS inter_branch_invoices_invoice_number;
    `);

    // Drop tables
    await queryInterface.dropTable('inter_branch_invoice_items');
    await queryInterface.dropTable('inter_branch_invoices');
  }
};
