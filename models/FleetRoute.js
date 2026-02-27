const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const FleetRoute = sequelize.define('FleetRoute', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: { model: 'tenants', key: 'id' },
    field: 'tenant_id'
  },
  routeNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'route_number'
  },
  routeName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'route_name'
  },
  routeType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'route_type',
    comment: 'delivery, pickup, round_trip, multi_stop'
  },
  startLocation: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'start_location'
  },
  endLocation: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'end_location'
  },
  totalDistanceKm: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_distance_km'
  },
  estimatedDurationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'estimated_duration_minutes'
  },
  stops: {
    type: DataTypes.JSONB,
    allowNull: true,
    comment: 'Array of stop locations with details'
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'active',
    comment: 'active, inactive, archived'
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
  tableName: 'fleet_routes',
  timestamps: true,
  underscored: true
});

FleetRoute.associate = function(models) {
  FleetRoute.belongsTo(models.Tenant, {
    foreignKey: 'tenantId',
    as: 'tenant'
  });
  FleetRoute.hasMany(models.FleetRouteAssignment, {
    foreignKey: 'routeId',
    as: 'assignments'
  });
};

module.exports = FleetRoute;
