'use strict';

const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const FleetFuelTransaction = sequelize.define('FleetFuelTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  vehicleId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'fleet_vehicles', key: 'id' },
    field: 'vehicle_id'
  },
  driverId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'fleet_drivers', key: 'id' },
    field: 'driver_id'
  },
  transactionType: {
    type: DataTypes.STRING(30),
    allowNull: false,
    defaultValue: 'refill',
    field: 'transaction_type',
    comment: 'refill, consumption_estimate'
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'transaction_date'
  },
  fuelStation: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'fuel_station'
  },
  fuelType: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: 'diesel',
    field: 'fuel_type',
    comment: 'diesel, petrol, electric'
  },
  quantityLiters: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'quantity_liters'
  },
  pricePerLiter: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_per_liter'
  },
  totalCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'total_cost'
  },
  odometerReading: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'odometer_reading'
  },
  paymentMethod: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'payment_method',
    comment: 'cash, card, fuel_card'
  },
  receiptNumber: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'receipt_number'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'tenant_id'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'fleet_fuel_transactions',
  timestamps: true,
  underscored: true,
  indexes: [
    { fields: ['vehicle_id'] },
    { fields: ['driver_id'] },
    { fields: ['transaction_date'] },
    { fields: ['tenant_id'] }
  ]
});

FleetFuelTransaction.associate = function(models) {
  FleetFuelTransaction.belongsTo(models.FleetVehicle, {
    foreignKey: 'vehicleId',
    as: 'vehicle'
  });
  FleetFuelTransaction.belongsTo(models.FleetDriver, {
    foreignKey: 'driverId',
    as: 'driver'
  });
};

module.exports = FleetFuelTransaction;
