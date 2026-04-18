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

    const tables = await queryInterface.showAllTables();
    const tableExists = tables.includes('inventory_transfers');
    const userFkType = tableExists ? await fkTypeFor('users', 'id') : Sequelize.UUID;
    const branchFkType =
      tables.includes('branches') ? await fkTypeFor('branches', 'id') : Sequelize.UUID;

    if (tableExists) {
      // Postgres: default must be dropped before ALTER ... TYPE to enum, then set default again.
      await sequelize.query(
        `ALTER TABLE inventory_transfers ALTER COLUMN status DROP DEFAULT;`
      );
      await sequelize.query(`
        DO $e$ BEGIN
          CREATE TYPE public.enum_inventory_transfers_status AS ENUM (
            'requested', 'approved', 'rejected', 'in_transit', 'received', 'completed', 'cancelled'
          );
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $e$;
      `);

      const [[colInfo]] = await sequelize.query(`
        SELECT udt_name FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'inventory_transfers' AND column_name = 'status'
      `);
      const udt = colInfo?.udt_name;

      const [[hasInTransit]] = await sequelize.query(`
        SELECT COUNT(*)::int AS c FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        JOIN pg_namespace n ON t.typnamespace = n.oid
        WHERE n.nspname = 'public' AND t.typname = 'enum_inventory_transfers_status'
          AND e.enumlabel = 'in_transit'
      `);
      if (!hasInTransit?.c) {
        await sequelize.query(
          `ALTER TYPE public.enum_inventory_transfers_status ADD VALUE 'in_transit';`
        );
      }

      if (udt !== 'enum_inventory_transfers_status') {
        await sequelize.query(`
          ALTER TABLE inventory_transfers
            ALTER COLUMN status TYPE public.enum_inventory_transfers_status
            USING (
              CASE
                WHEN status::text IN (
                  'requested', 'approved', 'rejected', 'in_transit', 'received', 'completed', 'cancelled'
                ) THEN status::text::public.enum_inventory_transfers_status
                ELSE 'requested'::public.enum_inventory_transfers_status
              END
            );
        `);
      }

      await sequelize.query(`
        ALTER TABLE inventory_transfers ALTER COLUMN status SET NOT NULL;
        ALTER TABLE inventory_transfers
          ALTER COLUMN status SET DEFAULT 'requested'::public.enum_inventory_transfers_status;
      `);

      const invCols = await queryInterface.describeTable('inventory_transfers');

      // Add tracking fields (idempotent for partial reruns)
      if (!invCols.shipped_at) {
        await queryInterface.addColumn('inventory_transfers', 'shipped_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'When items were shipped from source'
        });
      }
      if (!invCols.shipped_by) {
        await queryInterface.addColumn('inventory_transfers', 'shipped_by', {
          type: userFkType,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          comment: 'User who marked as shipped'
        });
      }
      if (!invCols.received_at) {
        await queryInterface.addColumn('inventory_transfers', 'received_at', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'When items were received at destination'
        });
      }
      if (!invCols.received_by) {
        await queryInterface.addColumn('inventory_transfers', 'received_by', {
          type: userFkType,
          allowNull: true,
          references: {
            model: 'users',
            key: 'id'
          },
          comment: 'User who confirmed receipt'
        });
      }
      if (!invCols.from_branch_id) {
        await queryInterface.addColumn('inventory_transfers', 'from_branch_id', {
          type: branchFkType,
          allowNull: true,
          references: {
            model: 'branches',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        });
      }
      if (!invCols.to_branch_id) {
        await queryInterface.addColumn('inventory_transfers', 'to_branch_id', {
          type: branchFkType,
          allowNull: true,
          references: {
            model: 'branches',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL'
        });
      }

      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS inventory_transfers_status ON inventory_transfers (status);
        CREATE INDEX IF NOT EXISTS inventory_transfers_from_branch_id ON inventory_transfers (from_branch_id);
        CREATE INDEX IF NOT EXISTS inventory_transfers_to_branch_id ON inventory_transfers (to_branch_id);
        CREATE INDEX IF NOT EXISTS inventory_transfers_shipped_at ON inventory_transfers (shipped_at);
        CREATE INDEX IF NOT EXISTS inventory_transfers_received_at ON inventory_transfers (received_at);
      `);
    }

    // Update inventory_transfer_items table
    const itemsTableExists = tables.includes('inventory_transfer_items');

    if (itemsTableExists) {
      const itemCols = await queryInterface.describeTable('inventory_transfer_items');

      if (!itemCols.quantity_shipped) {
        await queryInterface.addColumn('inventory_transfer_items', 'quantity_shipped', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: true,
          defaultValue: 0,
          comment: 'Actual quantity shipped'
        });
      }
      if (!itemCols.quantity_received) {
        await queryInterface.addColumn('inventory_transfer_items', 'quantity_received', {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: true,
          defaultValue: 0,
          comment: 'Actual quantity received'
        });
      }
      if (!itemCols.batch_number) {
        await queryInterface.addColumn('inventory_transfer_items', 'batch_number', {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'Batch/lot number for tracking'
        });
      }
      if (!itemCols.expiry_date) {
        await queryInterface.addColumn('inventory_transfer_items', 'expiry_date', {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Expiry date for perishable items'
        });
      }
      if (!itemCols.notes) {
        await queryInterface.addColumn('inventory_transfer_items', 'notes', {
          type: Sequelize.TEXT,
          allowNull: true,
          comment: 'Item-specific notes'
        });
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove indexes first
    await queryInterface.removeIndex('inventory_transfers', ['status']);
    await queryInterface.removeIndex('inventory_transfers', ['from_branch_id']);
    await queryInterface.removeIndex('inventory_transfers', ['to_branch_id']);
    await queryInterface.removeIndex('inventory_transfers', ['shipped_at']);
    await queryInterface.removeIndex('inventory_transfers', ['received_at']);

    // Remove columns from inventory_transfers
    await queryInterface.removeColumn('inventory_transfers', 'shipped_at');
    await queryInterface.removeColumn('inventory_transfers', 'shipped_by');
    await queryInterface.removeColumn('inventory_transfers', 'received_at');
    await queryInterface.removeColumn('inventory_transfers', 'received_by');
    await queryInterface.removeColumn('inventory_transfers', 'from_branch_id');
    await queryInterface.removeColumn('inventory_transfers', 'to_branch_id');

    // Revert status ENUM to original values
    await queryInterface.changeColumn('inventory_transfers', 'status', {
      type: Sequelize.ENUM(
        'requested',
        'approved',
        'rejected',
        'received',
        'completed',
        'cancelled'
      ),
      allowNull: false,
      defaultValue: 'requested'
    });

    // Remove columns from inventory_transfer_items
    await queryInterface.removeColumn('inventory_transfer_items', 'quantity_shipped');
    await queryInterface.removeColumn('inventory_transfer_items', 'quantity_received');
    await queryInterface.removeColumn('inventory_transfer_items', 'batch_number');
    await queryInterface.removeColumn('inventory_transfer_items', 'expiry_date');
    await queryInterface.removeColumn('inventory_transfer_items', 'notes');
  }
};
