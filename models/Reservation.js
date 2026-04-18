const { DataTypes } = require('sequelize');
const sequelize = require('../lib/sequelize');

const Reservation = sequelize.define('Reservation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  reservationNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'reservation_number'
  },
  
  // Customer Info
  customerId: {
    type: DataTypes.UUID,
    field: 'customer_id'
  },
  customerName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'customer_name'
  },
  customerPhone: {
    type: DataTypes.STRING(50),
    allowNull: false,
    field: 'customer_phone'
  },
  customerEmail: {
    type: DataTypes.STRING(255),
    field: 'customer_email',
    validate: {
      isEmail: true
    }
  },
  
  // Reservation Details
  reservationDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'reservation_date'
  },
  reservationTime: {
    type: DataTypes.TIME,
    allowNull: false,
    field: 'reservation_time'
  },
  guestCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'guest_count',
    validate: {
      min: 1,
      max: 100
    }
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 120,
    field: 'duration_minutes'
  },
  
  // Table Assignment
  tableId: {
    type: DataTypes.UUID,
    field: 'table_id'
  },
  tableNumber: {
    type: DataTypes.STRING(20),
    field: 'table_number'
  },
  
  // Status & Payment
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'),
    allowNull: false,
    defaultValue: 'pending'
  },
  depositAmount: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    field: 'deposit_amount'
  },
  depositPaid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'deposit_paid'
  },
  
  // Additional Info
  specialRequests: {
    type: DataTypes.TEXT,
    field: 'special_requests'
  },
  notes: {
    type: DataTypes.TEXT
  },
  cancellationReason: {
    type: DataTypes.TEXT,
    field: 'cancellation_reason'
  },
  
  // Staff Info
  createdBy: {
    type: DataTypes.UUID,
    field: 'created_by'
  },
  confirmedBy: {
    type: DataTypes.UUID,
    field: 'confirmed_by'
  },
  seatedBy: {
    type: DataTypes.UUID,
    field: 'seated_by'
  },
  
  // Timestamps
  confirmedAt: {
    type: DataTypes.DATE,
    field: 'confirmed_at'
  },
  seatedAt: {
    type: DataTypes.DATE,
    field: 'seated_at'
  },
  completedAt: {
    type: DataTypes.DATE,
    field: 'completed_at'
  },
  cancelledAt: {
    type: DataTypes.DATE,
    field: 'cancelled_at'
  },
  tenantId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'tenant_id',
    references: {
      model: 'tenants',
      key: 'id'
    }
  },
  branchId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'branch_id',
    references: {
      model: 'branches',
      key: 'id'
    }
  }
}, {
  tableName: 'reservations',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Class methods
Reservation.generateReservationNumber = async function(tenantId = null) {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const Op = sequelize.Sequelize.Op;

  const where = {
    reservationNumber: {
      [Op.like]: `RSV-${dateStr}-%`
    }
  };
  if (tenantId) {
    where.tenantId = tenantId;
  }

  const lastReservation = await this.findOne({
    where,
    order: [['reservationNumber', 'DESC']]
  });

  let sequence = 1;
  if (lastReservation) {
    const lastNumber = lastReservation.reservationNumber.split('-')[2];
    sequence = parseInt(lastNumber, 10) + 1;
  }

  return `RSV-${dateStr}-${sequence.toString().padStart(3, '0')}`;
};

Reservation.getByDate = async function(date, options = {}) {
  const { tenantId } = options;
  const Op = sequelize.Sequelize.Op;
  const where = {
    reservationDate: date,
    status: {
      [Op.notIn]: ['cancelled', 'no-show']
    }
  };
  if (tenantId) {
    where.tenantId = tenantId;
  }
  return await this.findAll({
    where,
    include: [
      { association: 'table' },
      { association: 'customer' }
    ],
    order: [['reservationTime', 'ASC']]
  });
};

Reservation.getUpcoming = async function(days = 7, options = {}) {
  const { tenantId } = options;
  const Op = sequelize.Sequelize.Op;
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);

  const where = {
    reservationDate: {
      [Op.between]: [today, futureDate]
    },
    status: {
      [Op.in]: ['pending', 'confirmed']
    }
  };
  if (tenantId) {
    where.tenantId = tenantId;
  }

  return await this.findAll({
    where,
    include: [
      { association: 'table' },
      { association: 'customer' }
    ],
    order: [['reservationDate', 'ASC'], ['reservationTime', 'ASC']]
  });
};

Reservation.checkAvailability = async function(date, time, guestCount, excludeId = null, options = {}) {
  const { tenantId } = options;
  const Op = sequelize.Sequelize.Op;
  const where = {
    reservationDate: date,
    status: {
      [Op.in]: ['confirmed', 'seated']
    }
  };

  if (tenantId) {
    where.tenantId = tenantId;
  }

  if (excludeId) {
    where.id = {
      [Op.ne]: excludeId
    };
  }

  const existingReservations = await this.findAll({
    where,
    include: [{ association: 'table' }]
  });

  const Table = sequelize.models.Table;
  const tableWhere = {
    isActive: true,
    capacity: {
      [Op.gte]: guestCount
    }
  };
  if (tenantId) {
    tableWhere.tenantId = tenantId;
  }

  const allTables = await Table.findAll({
    where: tableWhere
  });
  
  // Filter out occupied tables
  const occupiedTableIds = existingReservations.map(r => r.tableId).filter(Boolean);
  const availableTables = allTables.filter(t => !occupiedTableIds.includes(t.id));
  
  return availableTables;
};

// Instance methods
function tableWhereForReservation(reservation, tableId) {
  const w = { id: tableId };
  if (reservation.tenantId) {
    w.tenantId = reservation.tenantId;
  }
  return w;
}

Reservation.prototype.confirm = async function(confirmedBy) {
  this.status = 'confirmed';
  this.confirmedBy = confirmedBy;
  this.confirmedAt = new Date();
  await this.save();

  if (this.tableId) {
    const Table = sequelize.models.Table;
    const table = await Table.findOne({ where: tableWhereForReservation(this, this.tableId) });
    if (table) {
      await table.markAsReserved();
    }
  }

  return this;
};

Reservation.prototype.seat = async function(seatedBy, tableId = null) {
  this.status = 'seated';
  this.seatedBy = seatedBy;
  this.seatedAt = new Date();

  if (tableId) {
    this.tableId = tableId;
    const Table = sequelize.models.Table;
    const table = await Table.findOne({ where: tableWhereForReservation(this, tableId) });
    if (table) {
      this.tableNumber = table.tableNumber;
      await table.markAsOccupied();
    }
  }
  
  await this.save();
  return this;
};

Reservation.prototype.complete = async function() {
  this.status = 'completed';
  this.completedAt = new Date();
  await this.save();
  
  // Update table status
  if (this.tableId) {
    const Table = sequelize.models.Table;
    const table = await Table.findOne({ where: tableWhereForReservation(this, this.tableId) });
    if (table) {
      await table.markAsAvailable();
    }
  }

  return this;
};

Reservation.prototype.cancel = async function(reason) {
  this.status = 'cancelled';
  this.cancellationReason = reason;
  this.cancelledAt = new Date();
  await this.save();
  
  // Update table status
  if (this.tableId) {
    const Table = sequelize.models.Table;
    const table = await Table.findOne({ where: tableWhereForReservation(this, this.tableId) });
    if (table && table.status === 'reserved') {
      await table.markAsAvailable();
    }
  }

  return this;
};

Reservation.prototype.markNoShow = async function() {
  this.status = 'no-show';
  await this.save();

  if (this.tableId) {
    const Table = sequelize.models.Table;
    const table = await Table.findOne({ where: tableWhereForReservation(this, this.tableId) });
    if (table && table.status === 'reserved') {
      await table.markAsAvailable();
    }
  }

  return this;
};

Reservation.prototype.assignTable = async function(tableId) {
  const Table = sequelize.models.Table;
  const table = await Table.findOne({ where: tableWhereForReservation(this, tableId) });
  
  if (!table) {
    throw new Error('Table not found');
  }
  
  if (!table.isAvailable() && table.status !== 'reserved') {
    throw new Error('Table is not available');
  }
  
  if (!table.canAccommodate(this.guestCount)) {
    throw new Error('Table capacity is insufficient');
  }
  
  this.tableId = tableId;
  this.tableNumber = table.tableNumber;
  await this.save();
  
  if (this.status === 'confirmed') {
    await table.markAsReserved();
  }
  
  return this;
};

Reservation.prototype.isPending = function() {
  return this.status === 'pending';
};

Reservation.prototype.isConfirmed = function() {
  return this.status === 'confirmed';
};

Reservation.prototype.isSeated = function() {
  return this.status === 'seated';
};

Reservation.prototype.isCompleted = function() {
  return this.status === 'completed';
};

Reservation.prototype.isCancelled = function() {
  return this.status === 'cancelled';
};

Reservation.prototype.isNoShow = function() {
  return this.status === 'no-show';
};

// Associations
Reservation.associate = function(models) {
  // Reservation belongs to Table
  Reservation.belongsTo(models.Table, {
    foreignKey: 'tableId',
    as: 'table'
  });
  
  // Reservation belongs to Customer
  Reservation.belongsTo(models.Customer, {
    foreignKey: 'customerId',
    as: 'customer'
  });
  
  // Reservation has one TableSession
  Reservation.hasOne(models.TableSession, {
    foreignKey: 'reservationId',
    as: 'session'
  });
  
  // Staff associations (if Employee model exists)
  if (models.Employee) {
    Reservation.belongsTo(models.Employee, {
      foreignKey: 'createdBy',
      as: 'creator'
    });
    
    Reservation.belongsTo(models.Employee, {
      foreignKey: 'confirmedBy',
      as: 'confirmer'
    });
    
    Reservation.belongsTo(models.Employee, {
      foreignKey: 'seatedBy',
      as: 'seater'
    });
  }
};

// Hooks
Reservation.beforeCreate(async (reservation) => {
  if (!reservation.reservationNumber) {
    reservation.reservationNumber = await Reservation.generateReservationNumber(reservation.tenantId);
  }
});

Reservation.beforeUpdate((reservation) => {
  // Prevent changes to completed/cancelled reservations
  if (reservation.changed('status')) {
    const oldStatus = reservation._previousDataValues.status;
    if (['completed', 'cancelled', 'no-show'].includes(oldStatus)) {
      throw new Error(`Cannot modify ${oldStatus} reservation`);
    }
  }
});

module.exports = Reservation;
