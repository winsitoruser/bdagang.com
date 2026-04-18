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

    let tablesNow = await queryInterface.showAllTables();
    const ensureTableMerge = async (tableName, tableDef) => {
      if (!tablesNow.includes(tableName)) {
        await queryInterface.createTable(tableName, tableDef);
        tablesNow.push(tableName);
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

    // Create employee_branch_assignments table for many-to-many relationship
    await ensureTableMerge('employee_branch_assignments', {
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
      isPrimary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_primary',
        comment: 'Primary branch assignment for the employee'
      },
      canRoam: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'can_roam',
        comment: 'Whether employee can work at other branches'
      },
      role: {
        type: Sequelize.ENUM('cashier', 'waiter', 'kitchen', 'supervisor', 'manager'),
        allowNull: false,
        defaultValue: 'cashier',
        comment: 'Role specific to this branch'
      },
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        field: 'start_date'
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'end_date',
        comment: 'End date of assignment (null for ongoing)'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active'
      },
      assignedBy: {
        type: userFkType,
        allowNull: false,
        field: 'assigned_by',
        references: {
          model: 'users',
          key: 'id'
        }
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

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS employee_branch_assignments_employee_id ON employee_branch_assignments (employee_id);
      CREATE INDEX IF NOT EXISTS employee_branch_assignments_branch_id ON employee_branch_assignments (branch_id);
      CREATE INDEX IF NOT EXISTS employee_branch_assignments_is_primary ON employee_branch_assignments (is_primary);
      CREATE INDEX IF NOT EXISTS employee_branch_assignments_can_roam ON employee_branch_assignments (can_roam);
      CREATE INDEX IF NOT EXISTS employee_branch_assignments_is_active ON employee_branch_assignments (is_active);
      CREATE INDEX IF NOT EXISTS employee_branch_assignments_tenant_id ON employee_branch_assignments (tenant_id);
      CREATE UNIQUE INDEX IF NOT EXISTS employee_branch_assignment_unique ON employee_branch_assignments (employee_id, branch_id);
    `);

    // Create roaming_requests table
    await ensureTableMerge('roaming_requests', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      requestNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
        field: 'request_number'
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
      startDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'start_date'
      },
      endDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'end_date'
      },
      reason: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Reason for roaming request'
      },
      status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
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
      rejectionReason: {
        type: Sequelize.TEXT,
        allowNull: true,
        field: 'rejection_reason'
      },
      notes: {
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
      CREATE UNIQUE INDEX IF NOT EXISTS roaming_requests_request_number_unique ON roaming_requests (request_number);
      CREATE INDEX IF NOT EXISTS roaming_requests_employee_id ON roaming_requests (employee_id);
      CREATE INDEX IF NOT EXISTS roaming_requests_from_branch_id ON roaming_requests (from_branch_id);
      CREATE INDEX IF NOT EXISTS roaming_requests_to_branch_id ON roaming_requests (to_branch_id);
      CREATE INDEX IF NOT EXISTS roaming_requests_status ON roaming_requests (status);
      CREATE INDEX IF NOT EXISTS roaming_requests_start_date ON roaming_requests (start_date);
      CREATE INDEX IF NOT EXISTS roaming_requests_end_date ON roaming_requests (end_date);
      CREATE INDEX IF NOT EXISTS roaming_requests_tenant_id ON roaming_requests (tenant_id);
    `);

    // Create roaming_attendance table
    await ensureTableMerge('roaming_attendance', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      roamingRequestId: {
        type: Sequelize.UUID,
        allowNull: false,
        field: 'roaming_request_id',
        references: {
          model: 'roaming_requests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      attendanceDate: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'attendance_date'
      },
      checkIn: {
        type: Sequelize.TIME,
        allowNull: true,
        field: 'check_in'
      },
      checkOut: {
        type: Sequelize.TIME,
        allowNull: true,
        field: 'check_out'
      },
      workHours: {
        type: Sequelize.DECIMAL(4, 2),
        allowNull: true,
        field: 'work_hours',
        comment: 'Total work hours for the day'
      },
      status: {
        type: Sequelize.ENUM('present', 'absent', 'late', 'early_leave'),
        allowNull: false,
        defaultValue: 'present'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      verifiedBy: {
        type: userFkType,
        allowNull: true,
        field: 'verified_by',
        references: {
          model: 'users',
          key: 'id'
        }
      },
      verifiedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        field: 'verified_at'
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
      CREATE INDEX IF NOT EXISTS roaming_attendance_roaming_request_id ON roaming_attendance (roaming_request_id);
      CREATE INDEX IF NOT EXISTS roaming_attendance_employee_id ON roaming_attendance (employee_id);
      CREATE INDEX IF NOT EXISTS roaming_attendance_branch_id ON roaming_attendance (branch_id);
      CREATE INDEX IF NOT EXISTS roaming_attendance_attendance_date ON roaming_attendance (attendance_date);
      CREATE INDEX IF NOT EXISTS roaming_attendance_status ON roaming_attendance (status);
      CREATE INDEX IF NOT EXISTS roaming_attendance_tenant_id ON roaming_attendance (tenant_id);
    `);

    // Update existing employees to have primary branch assignment
    await queryInterface.sequelize.query(`
      INSERT INTO employee_branch_assignments (
        id, employee_id, branch_id, is_primary, can_roam, role,
        start_date, assigned_by, tenant_id, created_at, updated_at
      )
      SELECT
        gen_random_uuid(),
        e.id,
        e.branch_id,
        true,
        false,
        'cashier'::"enum_employee_branch_assignments_role",
        COALESCE(e.hire_date, NOW()),
        (SELECT u.id FROM users u ORDER BY u.id ASC LIMIT 1),
        e.tenant_id,
        NOW(),
        NOW()
      FROM employees e
      WHERE e.branch_id IS NOT NULL
      AND NOT EXISTS (
        SELECT 1 FROM employee_branch_assignments eba
        WHERE eba.employee_id = e.id
      )
    `);
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('roaming_attendance', ['tenant_id']);
    await queryInterface.removeIndex('roaming_attendance', ['status']);
    await queryInterface.removeIndex('roaming_attendance', ['attendance_date']);
    await queryInterface.removeIndex('roaming_attendance', ['branch_id']);
    await queryInterface.removeIndex('roaming_attendance', ['employee_id']);
    await queryInterface.removeIndex('roaming_attendance', ['roaming_request_id']);
    
    await queryInterface.removeIndex('roaming_requests', ['tenant_id']);
    await queryInterface.removeIndex('roaming_requests', ['end_date']);
    await queryInterface.removeIndex('roaming_requests', ['start_date']);
    await queryInterface.removeIndex('roaming_requests', ['status']);
    await queryInterface.removeIndex('roaming_requests', ['to_branch_id']);
    await queryInterface.removeIndex('roaming_requests', ['from_branch_id']);
    await queryInterface.removeIndex('roaming_requests', ['employee_id']);
    await queryInterface.removeIndex('roaming_requests', ['request_number']);
    
    await queryInterface.removeIndex('employee_branch_assignments', 'employee_branch_assignment_unique');
    await queryInterface.removeIndex('employee_branch_assignments', ['tenant_id']);
    await queryInterface.removeIndex('employee_branch_assignments', ['is_active']);
    await queryInterface.removeIndex('employee_branch_assignments', ['can_roam']);
    await queryInterface.removeIndex('employee_branch_assignments', ['is_primary']);
    await queryInterface.removeIndex('employee_branch_assignments', ['branch_id']);
    await queryInterface.removeIndex('employee_branch_assignments', ['employee_id']);

    // Drop tables
    await queryInterface.dropTable('roaming_attendance');
    await queryInterface.dropTable('roaming_requests');
    await queryInterface.dropTable('employee_branch_assignments');
  }
};
