const { DataTypes } = require('sequelize');
const { validate: uuidValidate, v5: uuidv5 } = require('uuid');
const sequelize = require('../lib/sequelize');

/** Namespace tetap agar id numerik user → UUID stabil untuk kolom cashier_id (uuid). */
const CASHIER_ID_NAMESPACE = '6ba7b811-9dad-11d1-80b4-00c04fd430c8';

function normalizePaymentMethod(v) {
  if (v == null) return 'cash';
  const s = String(v).trim();
  const direct = {
    Cash: 'cash',
    Card: 'card',
    Transfer: 'transfer',
    QRIS: 'ewallet',
    'E-Wallet': 'ewallet',
    cash: 'cash',
    card: 'card',
    transfer: 'transfer',
    ewallet: 'ewallet',
    mixed: 'mixed',
  };
  if (direct[s]) return direct[s];
  const lower = s.toLowerCase();
  if (lower === 'qris' || lower === 'e-wallet' || lower === 'e_wallet') return 'ewallet';
  if (['cash', 'card', 'transfer', 'ewallet', 'mixed'].includes(lower)) return lower;
  return 'cash';
}

function normalizeStatus(v) {
  if (v == null) return 'closed';
  const s = String(v).toLowerCase();
  if (s === 'completed' || s === 'closed') return 'closed';
  if (s === 'pending' || s === 'open') return 'open';
  if (s === 'cancelled' || s === 'refunded' || s === 'void') return 'void';
  if (s === 'open' || s === 'closed' || s === 'void') return s;
  return 'closed';
}

const PosTransaction = sequelize.define(
  'PosTransaction',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    transactionNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      field: 'transaction_number',
    },
    shiftId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'shift_id',
      references: { model: 'shifts', key: 'id' },
    },
    customerId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'customer_id',
      references: { model: 'Customers', key: 'id' },
    },
    customerName: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'customer_name',
    },
    /** Kasir: biasanya `users.id` (UUID), bukan integer employees.id */
    cashierId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'cashier_id',
    },
    branchId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'branch_id',
      references: { model: 'branches', key: 'id' },
    },
    transactionDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'transaction_date',
    },
    subtotal: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    discount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'discount_amount',
    },
    tax: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'tax_amount',
    },
    serviceCharge: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
      field: 'service_charge',
    },
    total: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      field: 'total_amount',
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'transfer', 'ewallet', 'mixed'),
      allowNull: false,
      defaultValue: 'cash',
      field: 'payment_method',
    },
    paymentStatus: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded', 'void'),
      allowNull: false,
      defaultValue: 'paid',
      field: 'payment_status',
    },
    tableNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'table_number',
    },
    orderType: {
      type: DataTypes.ENUM('dine-in', 'takeaway', 'delivery'),
      allowNull: false,
      defaultValue: 'dine-in',
      field: 'order_type',
    },
    status: {
      type: DataTypes.ENUM('open', 'closed', 'void'),
      allowNull: false,
      defaultValue: 'closed',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    kitchenOrderId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'kitchen_order_id',
    },
    heldTransactionId: {
      type: DataTypes.UUID,
      allowNull: true,
      field: 'held_transaction_id',
    },
    wasHeld: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      field: 'was_held',
    },
    /** Kolom DB tidak ada — hanya untuk kompatibilitas kode lama (checkout). */
    paidAmount: {
      type: DataTypes.VIRTUAL,
    },
    changeAmount: {
      type: DataTypes.VIRTUAL,
    },
  },
  {
    tableName: 'pos_transactions',
    timestamps: true,
    underscored: false,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeValidate(instance) {
        const d = instance.dataValues;
        if (d.cashierId != null) {
          const raw = String(d.cashierId).trim();
          if (!uuidValidate(raw)) {
            d.cashierId = uuidv5(raw, CASHIER_ID_NAMESPACE);
          }
        }
        if (d.status != null) d.status = normalizeStatus(d.status);
        if (d.paymentMethod != null) d.paymentMethod = normalizePaymentMethod(d.paymentMethod);
        if (d.orderType != null && typeof d.orderType === 'string') {
          const o = String(d.orderType).toLowerCase();
          if (o === 'dinein' || o === 'dine_in') d.orderType = 'dine-in';
          else if (o === 'takeaway' || o === 'take-away') d.orderType = 'takeaway';
          else if (o === 'delivery') d.orderType = 'delivery';
        }
        if (d.paidAmount != null || d.changeAmount != null) {
          const bits = [];
          if (d.paidAmount != null) bits.push(`paid:${d.paidAmount}`);
          if (d.changeAmount != null) bits.push(`change:${d.changeAmount}`);
          const extra = bits.join(' ');
          d.notes = d.notes ? `${d.notes} | ${extra}` : extra;
        }
        delete d.paidAmount;
        delete d.changeAmount;
      },
    },
    indexes: [
      { fields: ['transaction_number'] },
      { fields: ['transaction_date'] },
      { fields: ['shift_id'] },
      { fields: ['cashier_id'] },
      { fields: ['status'] },
      { fields: ['branch_id'] },
    ],
  }
);

PosTransaction.associate = (models) => {
  PosTransaction.hasMany(models.PosTransactionItem, {
    foreignKey: 'transactionId',
    as: 'items',
  });

  PosTransaction.belongsTo(models.Customer, {
    foreignKey: 'customerId',
    as: 'customer',
  });

  PosTransaction.belongsTo(models.Shift, {
    foreignKey: 'shiftId',
    as: 'shift',
  });

  PosTransaction.belongsTo(models.Branch, {
    foreignKey: 'branchId',
    as: 'branch',
  });

  PosTransaction.belongsTo(models.HeldTransaction, {
    foreignKey: 'heldTransactionId',
    as: 'heldTransaction',
  });
};

module.exports = PosTransaction;
