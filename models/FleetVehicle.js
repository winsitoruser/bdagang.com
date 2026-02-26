const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const FleetVehicle = sequelize.define('FleetVehicle', {
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
  vehicleNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'vehicle_number'
  },
  licensePlate: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'license_plate'
  },
  vehicleType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'vehicle_type',
    comment: 'truck, van, motorcycle, car'
  },
  brand: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  model: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  color: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  ownershipType: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'ownership_type',
    comment: 'owned, leased, rental'
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'purchase_date'
  },
  purchasePrice: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'purchase_price'
  },
  leaseStartDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'lease_start_date'
  },
  leaseEndDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'lease_end_date'
  },
  leaseMonthlyCost: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: true,
    field: 'lease_monthly_cost'
  },
  maxWeightKg: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'max_weight_kg'
  },
  maxVolumeM3: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'max_volume_m3'
  },
  fuelTankCapacity: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'fuel_tank_capacity'
  },
  registrationNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'registration_number',
    comment: 'STNK'
  },
  ownershipDocument: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'ownership_document',
    comment: 'BPKB'
  },
  registrationExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'registration_expiry'
  },
  insurancePolicyNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'insurance_policy_number'
  },
  insuranceProvider: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'insurance_provider'
  },
  insuranceExpiry: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'insurance_expiry'
  },
  gpsDeviceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'gps_device_id'
  },
  gpsDeviceImei: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'gps_device_imei'
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'active',
    comment: 'active, maintenance, retired, sold'
  },
  currentLocation: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'current_location'
  },
  currentOdometerKm: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'current_odometer_km'
  },
  lastServiceDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_service_date'
  },
  nextServiceDueKm: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'next_service_due_km'
  },
  assignedBranchId: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'branches', key: 'id' },
    field: 'assigned_branch_id'
  },
  assignedDriverId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assigned_driver_id'
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
  tableName: 'fleet_vehicles',
  timestamps: true,
  underscored: true
});

FleetVehicle.associate = function(models) {
  FleetVehicle.belongsTo(models.Tenant, {
    foreignKey: 'tenantId',
    as: 'tenant'
  });
  FleetVehicle.belongsTo(models.Branch, {
    foreignKey: 'assignedBranchId',
    as: 'assignedBranch'
  });
  FleetVehicle.belongsTo(models.FleetDriver, {
    foreignKey: 'assignedDriverId',
    as: 'assignedDriver'
  });
  FleetVehicle.hasMany(models.FleetGpsLocation, {
    foreignKey: 'vehicleId',
    as: 'gpsLocations'
  });
  FleetVehicle.hasMany(models.FleetMaintenanceSchedule, {
    foreignKey: 'vehicleId',
    as: 'maintenanceSchedules'
  });
  FleetVehicle.hasMany(models.FleetRouteAssignment, {
    foreignKey: 'vehicleId',
    as: 'routeAssignments'
  });
};

module.exports = FleetVehicle;
