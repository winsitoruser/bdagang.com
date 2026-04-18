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

    const employeeFkType = await fkTypeFor('employees', 'id');
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

    // Create payroll_allocations table
    await ensureTableMerge('payroll_allocations', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      employeeId: {
        type: employeeFkType,
        allowNull: false,
        field: 'employee_id',
        references: {
          model: 'employees',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      period: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Payroll period (usually month)'
      },
      allocationType: {
        type: Sequelize.ENUM('roaming', 'transfer', 'temporary_assignment', 'training'),
        allowNull: false,
        defaultValue: 'roaming',
        field: 'allocation_type'
      },
      allocatedAmount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        field: 'allocated_amount'
      },
      allocationPercentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 50,
        field: 'allocation_percentage',
        comment: 'Percentage charged to branch (rest charged to company)'
      },
      companyPortion: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        field: 'company_portion'
      },
      branchPortion: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
        field: 'branch_portion'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'processed', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      requestedBy: {
        type: userFkType,
        allowNull: false,
        field: 'requested_by',
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
      processedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'processed_at'
      },
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'rejection_reason'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
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

    const empDesc = await queryInterface.describeTable('employees');
    if (!empDesc.base_salary) {
      await queryInterface.addColumn('employees', 'base_salary', {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
        field: 'base_salary',
        comment: 'Base monthly salary'
      });
    }

    // Create finance_journal_entries table if not exists
    await ensureTableMerge('finance_journal_entries', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      entryNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'entry_number'
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
      entryDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'entry_date'
      },
      entryType: {
        type: Sequelize.ENUM('journal', 'payroll_allocation', 'inter_branch_settlement', 'adjustment'),
        allowNull: false,
        defaultValue: 'journal',
        field: 'entry_type'
      },
      referenceType: {
        type: Sequelize.STRING(50),
        allowNull: true,
        field: 'reference_type'
      },
      referenceId: {
        type: Sequelize.UUID,
        allowNull: true,
        field: 'reference_id'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      totalDebit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'total_debit'
      },
      totalCredit: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'total_credit'
      },
      status: {
        type: Sequelize.ENUM('draft', 'posted', 'reversed'),
        allowNull: false,
        defaultValue: 'draft'
      },
      postedBy: {
        type: userFkType,
        allowNull: true,
        field: 'posted_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      postedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'posted_at'
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

    // Create finance_journal_entry_lines table
    await ensureTableMerge('finance_journal_entry_lines', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      journalEntryId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'journal_entry_id',
        references: {
          model: 'finance_journal_entries',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      accountCode: {
        type: Sequelize.STRING(20),
        allowNull: false,
        field: 'account_code'
      },
      accountName: {
        type: Sequelize.STRING(100),
        allowNull: false,
        field: 'account_name'
      },
      debitAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'debit_amount'
      },
      creditAmount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0,
        field: 'credit_amount'
      },
      description: {
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
      CREATE INDEX IF NOT EXISTS payroll_allocations_employee_id_period ON payroll_allocations (employee_id, period);
      CREATE INDEX IF NOT EXISTS payroll_allocations_branch_id ON payroll_allocations (branch_id);
      CREATE INDEX IF NOT EXISTS payroll_allocations_status ON payroll_allocations (status);
      CREATE INDEX IF NOT EXISTS payroll_allocations_allocation_type ON payroll_allocations (allocation_type);
      CREATE INDEX IF NOT EXISTS payroll_allocations_tenant_id ON payroll_allocations (tenant_id);
      CREATE UNIQUE INDEX IF NOT EXISTS finance_journal_entries_entry_number ON finance_journal_entries (entry_number);
      CREATE INDEX IF NOT EXISTS finance_journal_entries_branch_id ON finance_journal_entries (branch_id);
      CREATE INDEX IF NOT EXISTS finance_journal_entries_entry_date ON finance_journal_entries (entry_date);
      CREATE INDEX IF NOT EXISTS finance_journal_entries_entry_type ON finance_journal_entries (entry_type);
      CREATE INDEX IF NOT EXISTS finance_journal_entries_ref ON finance_journal_entries (reference_type, reference_id);
      CREATE INDEX IF NOT EXISTS finance_journal_entries_status ON finance_journal_entries (status);
      CREATE INDEX IF NOT EXISTS finance_journal_entries_tenant_id ON finance_journal_entries (tenant_id);
      CREATE INDEX IF NOT EXISTS finance_journal_entry_lines_journal_entry_id ON finance_journal_entry_lines (journal_entry_id);
      CREATE INDEX IF NOT EXISTS finance_journal_entry_lines_account_code ON finance_journal_entry_lines (account_code);
    `);

    // Create trigger to update journal entry totals
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION update_journal_entry_totals()
      RETURNS TRIGGER AS $$
      BEGIN
        UPDATE finance_journal_entries SET
          total_debit = (
            SELECT COALESCE(SUM(debit_amount), 0)
            FROM finance_journal_entry_lines
            WHERE journal_entry_id = NEW.journal_entry_id
          ),
          total_credit = (
            SELECT COALESCE(SUM(credit_amount), 0)
            FROM finance_journal_entry_lines
            WHERE journal_entry_id = NEW.journal_entry_id
          ),
          updated_at = NOW()
        WHERE id = NEW.journal_entry_id;
        
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_journal_entry_totals ON finance_journal_entry_lines;
      CREATE TRIGGER trigger_update_journal_entry_totals
        AFTER INSERT OR UPDATE ON finance_journal_entry_lines
        FOR EACH ROW
        EXECUTE FUNCTION update_journal_entry_totals();
    `);

    // Insert default chart of accounts if table exists (optional module)
    const tablesCoa = await queryInterface.showAllTables();
    if (tablesCoa.includes('chart_of_accounts')) {
    await queryInterface.sequelize.query(`
      INSERT INTO chart_of_accounts (id, code, name, type, parent_id, level, is_active, tenant_id, created_at, updated_at)
      SELECT 
        uuid_generate_v4(),
        '1',
        'Assets',
        'group',
        NULL,
        1,
        true,
        t.id,
        NOW(),
        NOW()
      FROM tenants t
      WHERE NOT EXISTS (
        SELECT 1 FROM chart_of_accounts WHERE code = '1' AND tenant_id = t.id
      )
      UNION ALL
      SELECT 
        uuid_generate_v4(),
        '2',
        'Liabilities',
        'group',
        NULL,
        1,
        true,
        t.id,
        NOW(),
        NOW()
      FROM tenants t
      WHERE NOT EXISTS (
        SELECT 1 FROM chart_of_accounts WHERE code = '2' AND tenant_id = t.id
      )
      UNION ALL
      SELECT 
        uuid_generate_v4(),
        '3',
        'Equity',
        'group',
        NULL,
        1,
        true,
        t.id,
        NOW(),
        NOW()
      FROM tenants t
      WHERE NOT EXISTS (
        SELECT 1 FROM chart_of_accounts WHERE code = '3' AND tenant_id = t.id
      )
      UNION ALL
      SELECT 
        uuid_generate_v4(),
        '4',
        'Revenue',
        'group',
        NULL,
        1,
        true,
        t.id,
        NOW(),
        NOW()
      FROM tenants t
      WHERE NOT EXISTS (
        SELECT 1 FROM chart_of_accounts WHERE code = '4' AND tenant_id = t.id
      )
      UNION ALL
      SELECT 
        uuid_generate_v4(),
        '5',
        'Expenses',
        'group',
        NULL,
        1,
        true,
        t.id,
        NOW(),
        NOW()
      FROM tenants t
      WHERE NOT EXISTS (
        SELECT 1 FROM chart_of_accounts WHERE code = '5' AND tenant_id = t.id
      )
    `);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop triggers
    await queryInterface.sequelize.query(
      'DROP TRIGGER IF EXISTS trigger_update_journal_entry_totals ON finance_journal_entry_lines'
    );
    await queryInterface.sequelize.query('DROP FUNCTION IF EXISTS update_journal_entry_totals()');

    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS finance_journal_entry_lines_account_code;
      DROP INDEX IF EXISTS finance_journal_entry_lines_journal_entry_id;
      DROP INDEX IF EXISTS finance_journal_entries_tenant_id;
      DROP INDEX IF EXISTS finance_journal_entries_status;
      DROP INDEX IF EXISTS finance_journal_entries_ref;
      DROP INDEX IF EXISTS finance_journal_entries_entry_type;
      DROP INDEX IF EXISTS finance_journal_entries_entry_date;
      DROP INDEX IF EXISTS finance_journal_entries_branch_id;
      DROP INDEX IF EXISTS finance_journal_entries_entry_number;
      DROP INDEX IF EXISTS payroll_allocations_tenant_id;
      DROP INDEX IF EXISTS payroll_allocations_allocation_type;
      DROP INDEX IF EXISTS payroll_allocations_status;
      DROP INDEX IF EXISTS payroll_allocations_branch_id;
      DROP INDEX IF EXISTS payroll_allocations_employee_id_period;
    `);

    // Drop tables
    await queryInterface.dropTable('finance_journal_entry_lines');
    await queryInterface.dropTable('finance_journal_entries');
    await queryInterface.dropTable('payroll_allocations');

    // Remove column
    await queryInterface.removeColumn('employees', 'base_salary');
  }
};
