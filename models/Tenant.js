const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Tenant = sequelize.define('Tenant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    businessTypeId: {
      type: DataTypes.UUID,
      field: 'business_type_id',
      references: {
        model: 'business_types',
        key: 'id'
      }
    },
    businessName: {
      type: DataTypes.STRING(255),
      field: 'business_name'
    },
    businessAddress: {
      type: DataTypes.TEXT,
      field: 'business_address'
    },
    businessPhone: {
      type: DataTypes.STRING(50),
      field: 'business_phone'
    },
    businessEmail: {
      type: DataTypes.STRING(255),
      field: 'business_email'
    },
    setupCompleted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'setup_completed'
    },
    onboardingStep: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      field: 'onboarding_step'
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: true,
      unique: true
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'trial'),
      defaultValue: 'trial'
    },
    subscriptionPlan: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'subscription_plan'
    },
    subscriptionStart: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'subscription_start'
    },
    subscriptionEnd: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'subscription_end'
    },
    maxUsers: {
      type: DataTypes.INTEGER,
      defaultValue: 5,
      field: 'max_users'
    },
    maxBranches: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      field: 'max_branches'
    },
    contactName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'contact_name'
    },
    contactEmail: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'contact_email'
    },
    contactPhone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'contact_phone'
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    postalCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'postal_code'
    },
    settings: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: {}
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      field: 'is_active'
    }
  }, {
    tableName: 'tenants',
    underscored: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  });

  Tenant.associate = (models) => {
    // Tenant belongs to a business type
    Tenant.belongsTo(models.BusinessType, {
      foreignKey: 'businessTypeId',
      as: 'businessType'
    });

    // Tenant has many users
    Tenant.hasMany(models.User, {
      foreignKey: 'tenantId',
      as: 'users'
    });

    // Tenant has many modules through tenant_modules
    Tenant.belongsToMany(models.Module, {
      through: models.TenantModule,
      foreignKey: 'tenantId',
      otherKey: 'moduleId',
      as: 'modules'
    });

    // Direct access to junction table
    Tenant.hasMany(models.TenantModule, {
      foreignKey: 'tenantId',
      as: 'tenantModules'
    });

    // Tenant has many branches
    Tenant.hasMany(models.Branch, {
      foreignKey: 'tenantId',
      as: 'branches'
    });

    // Tenant has many stores
    Tenant.hasMany(models.Store, {
      foreignKey: 'tenantId',
      as: 'stores'
    });

    // Tenant has many sync logs
    if (models.SyncLog) {
      Tenant.hasMany(models.SyncLog, {
        foreignKey: 'tenantId',
        as: 'syncLogs'
      });
    }
  };

  // Instance methods
  Tenant.prototype.canAddBranch = function() {
    return this.branches ? this.branches.length < this.maxBranches : true;
  };

  Tenant.prototype.canAddUser = function() {
    return this.users ? this.users.length < this.maxUsers : true;
  };

  Tenant.prototype.isSubscriptionActive = function() {
    if (!this.subscriptionEnd) return this.status === 'active' || this.status === 'trial';
    return new Date() < new Date(this.subscriptionEnd) && this.status === 'active';
  };

  return Tenant;
};
