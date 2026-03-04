const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const FleetGpsLocation = sequelize.define('FleetGpsLocation', {
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
  latitude: {
    type: DataTypes.DECIMAL(10, 8),
    allowNull: false
  },
  longitude: {
    type: DataTypes.DECIMAL(11, 8),
    allowNull: false
  },
  altitude: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true
  },
  speedKmh: {
    type: DataTypes.DECIMAL(6, 2),
    allowNull: true,
    field: 'speed_kmh'
  },
  heading: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: 'Direction in degrees (0-360)'
  },
  accuracyMeters: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: true,
    field: 'accuracy_meters'
  },
  timestamp: {
    type: DataTypes.DATE,
    allowNull: false
  },
  isMoving: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_moving'
  },
  isIdle: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_idle'
  },
  idleDurationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'idle_duration_minutes'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  }
}, {
  tableName: 'fleet_gps_locations',
  timestamps: false,
  underscored: true
});

FleetGpsLocation.associate = function(models) {
  FleetGpsLocation.belongsTo(models.FleetVehicle, {
    foreignKey: 'vehicleId',
    as: 'vehicle'
  });
  FleetGpsLocation.belongsTo(models.FleetDriver, {
    foreignKey: 'driverId',
    as: 'driver'
  });
};

module.exports = FleetGpsLocation;
