'use strict';

const { Sequelize } = require('sequelize');

module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;
    const tables = await queryInterface.showAllTables();
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

    const tenantFkType = tables.includes('tenants')
      ? await fkTypeFor('tenants', 'id')
      : Sequelize.UUID;

    const vehicleCol = {
      type: Sequelize.UUID,
      allowNull: false,
      ...(tables.includes('fleet_vehicles')
        ? { references: { model: 'fleet_vehicles', key: 'id' } }
        : {})
    };
    const driverCol = {
      type: Sequelize.UUID,
      allowNull: true,
      ...(tables.includes('fleet_drivers')
        ? { references: { model: 'fleet_drivers', key: 'id' } }
        : {})
    };

    let tablesNow = tables;
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

    await ensureTableMerge('fleet_fuel_transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      vehicle_id: vehicleCol,
      driver_id: driverCol,
      transaction_type: {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: 'refill'
      },
      transaction_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      fuel_station: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      fuel_type: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'diesel'
      },
      quantity_liters: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      price_per_liter: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      total_cost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      },
      odometer_reading: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      payment_method: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      receipt_number: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      tenant_id: {
        type: tenantFkType,
        allowNull: true,
        ...(tables.includes('tenants')
          ? {
              references: { model: 'tenants', key: 'id' },
              onUpdate: 'CASCADE',
              onDelete: 'SET NULL'
            }
          : {})
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('NOW')
      }
    });

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS fleet_fuel_tx_vehicle_id ON fleet_fuel_transactions (vehicle_id);
      CREATE INDEX IF NOT EXISTS fleet_fuel_tx_driver_id ON fleet_fuel_transactions (driver_id);
      CREATE INDEX IF NOT EXISTS fleet_fuel_tx_transaction_date ON fleet_fuel_transactions (transaction_date);
      CREATE INDEX IF NOT EXISTS fleet_fuel_tx_tenant_id ON fleet_fuel_transactions (tenant_id);
      CREATE INDEX IF NOT EXISTS fleet_fuel_tx_fuel_type ON fleet_fuel_transactions (fuel_type);
    `);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('fleet_fuel_transactions');
  }
};
