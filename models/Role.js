const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const Role = sequelize.define('Role', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  permissions: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: {}
  },
  isSystem: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: 'System roles cannot be deleted'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'roles',
  timestamps: true
});

// Association with User model
// Note: users table uses a string 'role' column, not a FK 'roleId' to roles table.
// The hasMany association is commented out to prevent Sequelize from adding
// a phantom 'roleId' column to all User queries.
Role.associate = (models) => {
  // Role.hasMany(models.User, { foreignKey: 'roleId', as: 'users' });
};

module.exports = Role;
