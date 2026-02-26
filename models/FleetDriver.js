const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const FleetDriver = sequelize.define('FleetDriver', {
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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' },
    field: 'user_id'
  },
  driverNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'driver_number'
  },
  fullName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'full_name'
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'date_of_birth'
  },
  licenseNumber: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'license_number'
  },
  licenseType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'license_type',
    comment: 'SIM A, B, C'
  },
  licenseIssueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'license_issue_date'
  },
  licenseExpiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'license_expiry_date'
  },
  employmentType: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'employment_type',
    comment: 'permanent, contract, freelance'
  },
  hireDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'hire_date'
  },
  assignedBranchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'branches', key: 'id' },
    field: 'assigned_branch_id'
  },
  totalDeliveries: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'total_deliveries'
  },
  onTimeDeliveries: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'on_time_deliveries'
  },
  totalDistanceKm: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'total_distance_km'
  },
  safetyScore: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 100,
    field: 'safety_score'
  },
  customerRating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: true,
    field: 'customer_rating'
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'active',
    comment: 'active, on_leave, suspended, terminated'
  },
  availabilityStatus: {
    type: DataTypes.STRING(50),
    defaultValue: 'available',
    field: 'availability_status',
    comment: 'available, on_duty, off_duty'
  },
  photoUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'photo_url'
  },
  licensePhotoUrl: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'license_photo_url'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'fleet_drivers',
  timestamps: true,
  underscored: true
});

FleetDriver.associate = function(models) {
  FleetDriver.belongsTo(models.Tenant, {
    foreignKey: 'tenantId',
    as: 'tenant'
  });
  FleetDriver.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user',
    constraints: false
  });
  FleetDriver.belongsTo(models.Branch, {
    foreignKey: 'assignedBranchId',
    as: 'assignedBranch'
  });
  FleetDriver.hasMany(models.FleetVehicle, {
    foreignKey: 'assignedDriverId',
    as: 'assignedVehicles'
  });
  FleetDriver.hasMany(models.FleetRouteAssignment, {
    foreignKey: 'driverId',
    as: 'routeAssignments'
  });
  FleetDriver.hasMany(models.FleetGpsLocation, {
    foreignKey: 'driverId',
    as: 'gpsLocations'
  });
};

module.exports = FleetDriver;
