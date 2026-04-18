'use strict';

/**
 * Migration: Create Tables and Reservations
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    const sequelize = queryInterface.sequelize;

    try {
      await sequelize.query(
        `
        DO $$ BEGIN
          CREATE TYPE enum_tables_status AS ENUM('available', 'occupied', 'reserved', 'maintenance');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `,
        { transaction }
      );

      await sequelize.query(
        `
        DO $$ BEGIN
          CREATE TYPE enum_reservations_status AS ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show');
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
      `,
        { transaction }
      );

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
          `SELECT udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}' AND column_name = '${columnName}'`,
          { transaction }
        );
        return pgUdtToSequelizeType(rows[0]?.udt_name);
      };

      const customerFkType = await fkTypeFor('customers', 'id');

      const ensureTableMerge = async (tableName, tableDef) => {
        const tableList = await queryInterface.showAllTables({ transaction });
        if (!tableList.includes(tableName)) {
          await queryInterface.createTable(tableName, tableDef, { transaction });
          return;
        }
        const d = await queryInterface.describeTable(tableName, { transaction });
        for (const [col, def] of Object.entries(tableDef)) {
          if (d[col]) continue;
          const { comment: _c, ...rest } = def;
          await queryInterface.addColumn(tableName, col, rest, { transaction });
          d[col] = true;
        }
      };

      const tablesDef = {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true
        },
        table_number: {
          type: Sequelize.STRING(20),
          allowNull: false,
          unique: true
        },
        capacity: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        area: {
          type: Sequelize.STRING(50),
          comment: 'indoor, outdoor, vip, smoking, non-smoking'
        },
        floor: {
          type: Sequelize.INTEGER,
          defaultValue: 1
        },
        position_x: {
          type: Sequelize.INTEGER,
          comment: 'X coordinate for visual layout'
        },
        position_y: {
          type: Sequelize.INTEGER,
          comment: 'Y coordinate for visual layout'
        },
        status: {
          type: Sequelize.ENUM('available', 'occupied', 'reserved', 'maintenance'),
          allowNull: false,
          defaultValue: 'available'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        notes: {
          type: Sequelize.TEXT
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      };

      await ensureTableMerge('tables', tablesDef);

      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_tables_status ON "tables" ("status")',
        { transaction }
      );
      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_tables_area ON "tables" ("area")',
        { transaction }
      );
      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_tables_active ON "tables" ("is_active")',
        { transaction }
      );

      const reservationsDef = {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true
        },
        reservation_number: {
          type: Sequelize.STRING(50),
          allowNull: false,
          unique: true
        },

        customer_id: {
          type: customerFkType,
          references: {
            model: 'customers',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        customer_name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        customer_phone: {
          type: Sequelize.STRING(50),
          allowNull: false
        },
        customer_email: {
          type: Sequelize.STRING(255)
        },

        reservation_date: {
          type: Sequelize.DATEONLY,
          allowNull: false
        },
        reservation_time: {
          type: Sequelize.TIME,
          allowNull: false
        },
        guest_count: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        duration_minutes: {
          type: Sequelize.INTEGER,
          defaultValue: 120,
          comment: 'Expected duration in minutes'
        },

        table_id: {
          type: Sequelize.UUID,
          references: {
            model: 'tables',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        table_number: {
          type: Sequelize.STRING(20)
        },

        status: {
          type: Sequelize.ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'),
          allowNull: false,
          defaultValue: 'pending'
        },
        deposit_amount: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        deposit_paid: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },

        special_requests: {
          type: Sequelize.TEXT
        },
        notes: {
          type: Sequelize.TEXT
        },
        cancellation_reason: {
          type: Sequelize.TEXT
        },

        created_by: {
          type: Sequelize.UUID
        },
        confirmed_by: {
          type: Sequelize.UUID
        },
        seated_by: {
          type: Sequelize.UUID
        },

        confirmed_at: {
          type: Sequelize.DATE
        },
        seated_at: {
          type: Sequelize.DATE
        },
        completed_at: {
          type: Sequelize.DATE
        },
        cancelled_at: {
          type: Sequelize.DATE
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      };

      await ensureTableMerge('reservations', reservationsDef);

      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_reservations_date ON "reservations" ("reservation_date")',
        { transaction }
      );
      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_reservations_status ON "reservations" ("status")',
        { transaction }
      );
      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_reservations_customer ON "reservations" ("customer_id")',
        { transaction }
      );
      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_reservations_table ON "reservations" ("table_id")',
        { transaction }
      );
      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_reservations_number ON "reservations" ("reservation_number")',
        { transaction }
      );
      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_reservations_phone ON "reservations" ("customer_phone")',
        { transaction }
      );

      const tableSessionsDef = {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true
        },
        table_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'tables',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },
        reservation_id: {
          type: Sequelize.UUID,
          references: {
            model: 'reservations',
            key: 'id'
          },
          onDelete: 'SET NULL',
          onUpdate: 'CASCADE'
        },
        pos_transaction_id: {
          type: Sequelize.UUID
        },
        guest_count: {
          type: Sequelize.INTEGER
        },
        started_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        ended_at: {
          type: Sequelize.DATE
        },
        duration_minutes: {
          type: Sequelize.INTEGER
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      };

      await ensureTableMerge('table_sessions', tableSessionsDef);

      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_table_sessions_table ON "table_sessions" ("table_id")',
        { transaction }
      );
      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_table_sessions_reservation ON "table_sessions" ("reservation_id")',
        { transaction }
      );

      await sequelize.query(
        `
        CREATE INDEX IF NOT EXISTS idx_table_sessions_active
        ON "table_sessions"(table_id, ended_at)
        WHERE ended_at IS NULL;
      `,
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Tables and Reservations migration completed successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();

    try {
      await queryInterface.dropTable('table_sessions', { transaction });
      await queryInterface.dropTable('reservations', { transaction });
      await queryInterface.dropTable('tables', { transaction });

      await queryInterface.sequelize.query(
        `
        DROP TYPE IF EXISTS enum_tables_status;
        DROP TYPE IF EXISTS enum_reservations_status;
      `,
        { transaction }
      );

      await transaction.commit();
      console.log('✅ Tables and Reservations rollback completed');
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
