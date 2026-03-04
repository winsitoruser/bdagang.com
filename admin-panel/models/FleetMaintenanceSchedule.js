const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const FleetMaintenanceSchedule = sequelize.define('FleetMaintenanceSchedule', {
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
  maintenanceType: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'maintenance_type',
    comment: 'routine_service, oil_change, tire_rotation, brake_check, inspection, custom'
  },
  intervalType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'interval_type',
    comment: 'kilometers, months, both'
  },
  intervalKilometers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'interval_kilometers'
  },
  intervalMonths: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'interval_months'
  },
  lastServiceDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_service_date'
  },
  lastServiceOdometer: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'last_service_odometer'
  },
  nextServiceDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'next_service_date'
  },
  nextServiceOdometer: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'next_service_odometer'
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'active',
    comment: 'active, completed, overdue'
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
  tableName: 'fleet_maintenance_schedules',
  timestamps: true,
  underscored: true
});

FleetMaintenanceSchedule.associate = function(models) {
  FleetMaintenanceSchedule.belongsTo(models.FleetVehicle, {
    foreignKey: 'vehicleId',
    as: 'vehicle'
  });
};

module.exports = FleetMaintenanceSchedule;
