
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create all tables first
    await queryInterface.createTable('users', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'email': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'phone': {
        type: Sequelize.STRING(255),
      },
      'businessName': {
        type: Sequelize.STRING(255),
      },
      'password': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'assigned_branch_id': {
        type: Sequelize.UUID,
      },
      'role': {
        type: Sequelize.ENUM('super_admin', 'owner', 'admin', 'manager', 'cashier', 'staff', 'hq_admin', 'branch_manager', 'inventory_staff', 'kitchen_staff', 'finance_staff', 'hr_staff'),
        defaultValue: "staff",
      },
      'data_scope': {
        type: Sequelize.STRING(20),
        defaultValue: "own_branch",
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'lastLogin': {
        type: Sequelize.DATE,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('customers', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'phone': {
        type: Sequelize.STRING(50),
      },
      'email': {
        type: Sequelize.STRING(255),
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'city': {
        type: Sequelize.STRING(100),
      },
      'province': {
        type: Sequelize.STRING(100),
      },
      'postalCode': {
        type: Sequelize.STRING(20),
      },
      'type': {
        type: Sequelize.ENUM('walk-in', 'member', 'vip'),
        defaultValue: "walk-in",
      },
      'customerType': {
        type: Sequelize.ENUM('individual', 'corporate'),
        allowNull: false,
        defaultValue: "individual",
      },
      'companyName': {
        type: Sequelize.STRING(255),
      },
      'picName': {
        type: Sequelize.STRING(255),
      },
      'picPosition': {
        type: Sequelize.STRING(100),
      },
      'contact1': {
        type: Sequelize.STRING(50),
      },
      'contact2': {
        type: Sequelize.STRING(50),
      },
      'companyEmail': {
        type: Sequelize.STRING(255),
      },
      'companyAddress': {
        type: Sequelize.TEXT,
      },
      'taxId': {
        type: Sequelize.STRING(50),
      },
      'status': {
        type: Sequelize.ENUM('active', 'inactive', 'blocked'),
        defaultValue: "active",
      },
      'membershipLevel': {
        type: Sequelize.ENUM('Bronze', 'Silver', 'Gold', 'Platinum'),
        defaultValue: "Silver",
      },
      'points': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'discount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'totalPurchases': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'totalSpent': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'lastVisit': {
        type: Sequelize.DATE,
      },
      'birthDate': {
        type: Sequelize.DATEONLY,
      },
      'gender': {
        type: Sequelize.ENUM('male', 'female', 'other'),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'partnerId': {
        type: Sequelize.UUID,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('employees', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'employeeId': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'userId': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'email': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'phoneNumber': {
        type: Sequelize.STRING(255),
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'dateOfBirth': {
        type: Sequelize.DATE,
      },
      'placeOfBirth': {
        type: Sequelize.STRING(255),
      },
      'nationalId': {
        type: Sequelize.STRING(255),
      },
      'religion': {
        type: Sequelize.STRING(255),
      },
      'maritalStatus': {
        type: Sequelize.ENUM('SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'),
      },
      'position': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'department': {
        type: Sequelize.ENUM('MANAGEMENT', 'OPERATIONS', 'SALES', 'FINANCE', 'ADMINISTRATION', 'WAREHOUSE', 'KITCHEN', 'CUSTOMER_SERVICE', 'IT', 'HR', 'CLINICAL', 'PHARMACY', 'MARKETING', 'LOGISTICS', 'PRODUCTION'),
        allowNull: false,
      },
      'branchId': {
        type: Sequelize.UUID,
      },
      'workLocation': {
        type: Sequelize.ENUM('MAIN_STORE', 'WAREHOUSE', 'CASHIER_FRONT', 'KITCHEN', 'FRONT_DESK', 'ADMIN_OFFICE', 'FINANCE_DEPT', 'FIELD', 'MAIN_PHARMACY', 'CLINIC_PHARMACY', 'CASHIER_PHARMACY', 'GENERAL_CLINIC', 'SPECIALIST_CLINIC', 'REGISTRATION', 'LAB_SECTION', 'INVENTORY', 'MULTIPLE', 'REMOTE'),
        allowNull: false,
      },
      'role': {
        type: Sequelize.ENUM('ADMIN', 'MANAGER', 'SUPERVISOR', 'STAFF', 'CASHIER', 'INVENTORY_MANAGER', 'WAREHOUSE_STAFF', 'DRIVER', 'CHEF', 'WAITER', 'DOCTOR', 'NURSE', 'PHARMACIST', 'RECEPTIONIST', 'SALES_REP'),
        allowNull: false,
      },
      'status': {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE', 'ON_LEAVE', 'TERMINATED'),
        allowNull: false,
        defaultValue: "ACTIVE",
      },
      'joinDate': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'endDate': {
        type: Sequelize.DATE,
      },
      'specialization': {
        type: Sequelize.STRING(255),
      },
      'licenseNumber': {
        type: Sequelize.STRING(255),
      },
      'biography': {
        type: Sequelize.TEXT,
      },
      'emergencyContactName': {
        type: Sequelize.STRING(255),
      },
      'emergencyContactRelationship': {
        type: Sequelize.STRING(255),
      },
      'emergencyContactPhone': {
        type: Sequelize.STRING(255),
      },
      'baseSalary': {
        type: Sequelize.DECIMAL,
      },
      'salaryGrade': {
        type: Sequelize.STRING(255),
      },
      'tenantId': {
        type: Sequelize.UUID,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('categories', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'type': {
        type: Sequelize.ENUM('income', 'expense'),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'icon': {
        type: Sequelize.STRING(50),
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('products', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'sku': {
        type: Sequelize.STRING(255),
      },
      'barcode': {
        type: Sequelize.STRING(255),
      },
      'category_id': {
        type: Sequelize.UUID,
      },
      'supplier_id': {
        type: Sequelize.UUID,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'unit': {
        type: Sequelize.STRING(255),
      },
      'buy_price': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'sell_price': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'minimum_stock': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'maximum_stock': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'reorder_point': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'is_trackable': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('suppliers', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'code': {
        type: Sequelize.STRING(50),
      },
      'contact_person': {
        type: Sequelize.STRING(255),
      },
      'phone': {
        type: Sequelize.STRING(50),
      },
      'email': {
        type: Sequelize.STRING(255),
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'city': {
        type: Sequelize.STRING(100),
      },
      'country': {
        type: Sequelize.STRING(100),
      },
      'tax_number': {
        type: Sequelize.STRING(100),
      },
      'payment_terms': {
        type: Sequelize.STRING(255),
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('inventory_stock', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'location_id': {
        type: Sequelize.UUID,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'reserved_quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'available_quantity': {
        type: Sequelize.DECIMAL,
      },
      'batch_number': {
        type: Sequelize.STRING(100),
      },
      'expiry_date': {
        type: Sequelize.DATE,
      },
      'last_stock_take_date': {
        type: Sequelize.DATE,
      },
      'last_movement_date': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('stock_movements', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'productId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branchId': {
        type: Sequelize.UUID,
      },
      'movementType': {
        type: Sequelize.ENUM('in', 'out', 'transfer', 'adjustment', 'return', 'damage', 'expired', 'sale', 'purchase'),
        allowNull: false,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'unitCost': {
        type: Sequelize.DECIMAL,
      },
      'totalCost': {
        type: Sequelize.DECIMAL,
      },
      'referenceType': {
        type: Sequelize.ENUM('purchase_order', 'sales_order', 'pos_transaction', 'stock_transfer', 'stock_adjustment', 'manual'),
        allowNull: false,
      },
      'referenceId': {
        type: Sequelize.UUID,
      },
      'referenceNumber': {
        type: Sequelize.STRING(100),
      },
      'fromBranchId': {
        type: Sequelize.UUID,
      },
      'toBranchId': {
        type: Sequelize.UUID,
      },
      'batchNumber': {
        type: Sequelize.STRING(100),
      },
      'expiryDate': {
        type: Sequelize.DATE,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'performedBy': {
        type: Sequelize.UUID,
      },
      'approvedBy': {
        type: Sequelize.UUID,
      },
      'movementDate': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'balanceBefore': {
        type: Sequelize.DECIMAL,
      },
      'balanceAfter': {
        type: Sequelize.DECIMAL,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('stock_adjustments', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'adjustmentNumber': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'branchId': {
        type: Sequelize.UUID,
      },
      'adjustmentDate': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'adjustmentType': {
        type: Sequelize.ENUM('count', 'damage', 'expired', 'lost', 'found', 'correction'),
        allowNull: false,
      },
      'status': {
        type: Sequelize.ENUM('draft', 'pending', 'approved', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: "draft",
      },
      'reason': {
        type: Sequelize.TEXT,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdBy': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'approvedBy': {
        type: Sequelize.UUID,
      },
      'approvedAt': {
        type: Sequelize.DATE,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('stock_adjustment_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'stockAdjustmentId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'productId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'systemQuantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'physicalQuantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'unitCost': {
        type: Sequelize.DECIMAL,
      },
      'totalCost': {
        type: Sequelize.DECIMAL,
      },
      'batchNumber': {
        type: Sequelize.STRING(100),
      },
      'expiryDate': {
        type: Sequelize.DATE,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('purchase_orders', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'poNumber': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'supplierId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branchId': {
        type: Sequelize.UUID,
      },
      'orderDate': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'expectedDeliveryDate': {
        type: Sequelize.DATE,
      },
      'actualDeliveryDate': {
        type: Sequelize.DATE,
      },
      'status': {
        type: Sequelize.ENUM('draft', 'pending', 'approved', 'ordered', 'partial', 'received', 'cancelled'),
        allowNull: false,
        defaultValue: "draft",
      },
      'subtotal': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'taxAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'discountAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'shippingCost': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'totalAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'paymentTerms': {
        type: Sequelize.STRING(100),
      },
      'paymentStatus': {
        type: Sequelize.ENUM('unpaid', 'partial', 'paid'),
        allowNull: false,
        defaultValue: "unpaid",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdBy': {
        type: Sequelize.UUID,
      },
      'approvedBy': {
        type: Sequelize.UUID,
      },
      'approvedAt': {
        type: Sequelize.DATE,
      },
      'cancelledBy': {
        type: Sequelize.UUID,
      },
      'cancelledAt': {
        type: Sequelize.DATE,
      },
      'cancellationReason': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('purchase_order_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'purchaseOrderId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'productId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'receivedQuantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'unitPrice': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'taxRate': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'taxAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'discountRate': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'discountAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'subtotal': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'totalAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sales_orders', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'soNumber': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'customerId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branchId': {
        type: Sequelize.UUID,
      },
      'orderDate': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'requiredDate': {
        type: Sequelize.DATE,
      },
      'shippedDate': {
        type: Sequelize.DATE,
      },
      'status': {
        type: Sequelize.ENUM('draft', 'pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: "draft",
      },
      'paymentStatus': {
        type: Sequelize.ENUM('unpaid', 'partial', 'paid'),
        allowNull: false,
        defaultValue: "unpaid",
      },
      'subtotal': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'taxAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'discountAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'shippingCost': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'totalAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'shippingAddress': {
        type: Sequelize.TEXT,
      },
      'shippingMethod': {
        type: Sequelize.STRING(100),
      },
      'trackingNumber': {
        type: Sequelize.STRING(100),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdBy': {
        type: Sequelize.UUID,
      },
      'approvedBy': {
        type: Sequelize.UUID,
      },
      'approvedAt': {
        type: Sequelize.DATE,
      },
      'cancelledBy': {
        type: Sequelize.UUID,
      },
      'cancelledAt': {
        type: Sequelize.DATE,
      },
      'cancellationReason': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sales_order_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'salesOrderId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'productId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'shippedQuantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'unitPrice': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'taxRate': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'taxAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'discountRate': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'discountAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'subtotal': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'totalAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('goods_receipts', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'grNumber': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'purchaseOrderId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'receiptDate': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'receivedBy': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'status': {
        type: Sequelize.ENUM('draft', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: "draft",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'invoiceNumber': {
        type: Sequelize.STRING(100),
      },
      'deliveryNote': {
        type: Sequelize.STRING(100),
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('goods_receipt_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'goodsReceiptId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'purchaseOrderItemId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'productId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'orderedQuantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'receivedQuantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'acceptedQuantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'rejectedQuantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'batchNumber': {
        type: Sequelize.STRING(100),
      },
      'expiryDate': {
        type: Sequelize.DATE,
      },
      'manufacturingDate': {
        type: Sequelize.DATE,
      },
      'unitCost': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'totalCost': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'rejectionReason': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('pos_transactions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'transactionNumber': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'shiftId': {
        type: Sequelize.UUID,
      },
      'customerId': {
        type: Sequelize.UUID,
      },
      'customerName': {
        type: Sequelize.STRING(255),
      },
      'cashierId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'transactionDate': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'subtotal': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'discount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'tax': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'total': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'paymentMethod': {
        type: Sequelize.ENUM('Cash', 'Card', 'Transfer', 'QRIS', 'E-Wallet'),
        allowNull: false,
        defaultValue: "Cash",
      },
      'paidAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'changeAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'status': {
        type: Sequelize.ENUM('pending', 'completed', 'cancelled', 'refunded'),
        allowNull: false,
        defaultValue: "completed",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'heldTransactionId': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('pos_transaction_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'transactionId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'productId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'productName': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'productSku': {
        type: Sequelize.STRING(100),
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'unitPrice': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'discount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'subtotal': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('held_transactions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'hold_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'cashier_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'customer_name': {
        type: Sequelize.STRING(255),
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'cart_items': {
        type: Sequelize.JSONB,
        allowNull: false,
      },
      'subtotal': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'discount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'tax': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'total': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'customer_type': {
        type: Sequelize.STRING(20),
        defaultValue: "walk-in",
      },
      'selected_member': {
        type: Sequelize.JSONB,
      },
      'selected_voucher': {
        type: Sequelize.JSONB,
      },
      'hold_reason': {
        type: Sequelize.STRING(255),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'status': {
        type: Sequelize.ENUM('held', 'resumed', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: "held",
      },
      'held_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'resumed_at': {
        type: Sequelize.DATE,
      },
      'completed_at': {
        type: Sequelize.DATE,
      },
      'cancelled_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('tables', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'table_number': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'capacity': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'area': {
        type: Sequelize.STRING(50),
      },
      'floor': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'position_x': {
        type: Sequelize.INTEGER,
      },
      'position_y': {
        type: Sequelize.INTEGER,
      },
      'status': {
        type: Sequelize.ENUM('available', 'occupied', 'reserved', 'maintenance'),
        allowNull: false,
        defaultValue: "available",
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('reservations', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'reservation_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'customer_name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'customer_phone': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'customer_email': {
        type: Sequelize.STRING(255),
      },
      'reservation_date': {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      'reservation_time': {
        type: Sequelize.TIME,
        allowNull: false,
      },
      'guest_count': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'duration_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 120,
      },
      'table_id': {
        type: Sequelize.UUID,
      },
      'table_number': {
        type: Sequelize.STRING(20),
      },
      'status': {
        type: Sequelize.ENUM('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no-show'),
        allowNull: false,
        defaultValue: "pending",
      },
      'deposit_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'deposit_paid': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'special_requests': {
        type: Sequelize.TEXT,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'cancellation_reason': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'confirmed_by': {
        type: Sequelize.UUID,
      },
      'seated_by': {
        type: Sequelize.UUID,
      },
      'confirmed_at': {
        type: Sequelize.DATE,
      },
      'seated_at': {
        type: Sequelize.DATE,
      },
      'completed_at': {
        type: Sequelize.DATE,
      },
      'cancelled_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('table_sessions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'table_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'reservation_id': {
        type: Sequelize.UUID,
      },
      'pos_transaction_id': {
        type: Sequelize.UUID,
      },
      'guest_count': {
        type: Sequelize.INTEGER,
      },
      'started_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'ended_at': {
        type: Sequelize.DATE,
      },
      'duration_minutes': {
        type: Sequelize.INTEGER,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('product_cost_history', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'old_hpp': {
        type: Sequelize.DECIMAL,
      },
      'new_hpp': {
        type: Sequelize.DECIMAL,
      },
      'change_amount': {
        type: Sequelize.DECIMAL,
      },
      'change_percentage': {
        type: Sequelize.DECIMAL,
      },
      'purchase_price': {
        type: Sequelize.DECIMAL,
      },
      'packaging_cost': {
        type: Sequelize.DECIMAL,
      },
      'labor_cost': {
        type: Sequelize.DECIMAL,
      },
      'overhead_cost': {
        type: Sequelize.DECIMAL,
      },
      'change_reason': {
        type: Sequelize.STRING(255),
      },
      'source_reference': {
        type: Sequelize.STRING(100),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'changed_by': {
        type: Sequelize.UUID,
      },
      'changed_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('product_cost_components', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'component_type': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'component_name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'component_description': {
        type: Sequelize.TEXT,
      },
      'cost_amount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 1,
      },
      'unit': {
        type: Sequelize.STRING(20),
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('shifts', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'shiftName': {
        type: Sequelize.ENUM('Pagi', 'Siang', 'Malam'),
        allowNull: false,
      },
      'shiftDate': {
        type: Sequelize.DATEONLY,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'startTime': {
        type: Sequelize.TIME,
        allowNull: false,
      },
      'endTime': {
        type: Sequelize.TIME,
        allowNull: false,
      },
      'openedBy': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'openedAt': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'closedBy': {
        type: Sequelize.UUID,
      },
      'closedAt': {
        type: Sequelize.DATE,
      },
      'initialCashAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'finalCashAmount': {
        type: Sequelize.DECIMAL,
      },
      'expectedCashAmount': {
        type: Sequelize.DECIMAL,
      },
      'cashDifference': {
        type: Sequelize.DECIMAL,
      },
      'totalSales': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'totalTransactions': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'status': {
        type: Sequelize.ENUM('open', 'closed'),
        allowNull: false,
        defaultValue: "open",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('tenants', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'business_type_id': {
        type: Sequelize.UUID,
      },
      'business_name': {
        type: Sequelize.STRING(255),
      },
      'business_address': {
        type: Sequelize.TEXT,
      },
      'business_phone': {
        type: Sequelize.STRING(50),
      },
      'business_email': {
        type: Sequelize.STRING(255),
      },
      'setup_completed': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'onboarding_step': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'kyb_status': {
        type: Sequelize.STRING(30),
        defaultValue: "pending_kyb",
      },
      'business_structure': {
        type: Sequelize.STRING(20),
        defaultValue: "single",
      },
      'parent_tenant_id': {
        type: Sequelize.UUID,
      },
      'is_hq': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'activated_at': {
        type: Sequelize.DATE,
      },
      'activated_by': {
        type: Sequelize.UUID,
      },
      'business_code': {
        type: Sequelize.STRING(20),
      },
      'name': {
        type: Sequelize.STRING(255),
      },
      'code': {
        type: Sequelize.STRING(50),
      },
      'status': {
        type: Sequelize.ENUM('active', 'inactive', 'suspended', 'trial'),
        defaultValue: "trial",
      },
      'subscription_plan': {
        type: Sequelize.STRING(50),
      },
      'subscription_start': {
        type: Sequelize.DATE,
      },
      'subscription_end': {
        type: Sequelize.DATE,
      },
      'max_users': {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      },
      'max_branches': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'contact_name': {
        type: Sequelize.STRING(255),
      },
      'contact_email': {
        type: Sequelize.STRING(255),
      },
      'contact_phone': {
        type: Sequelize.STRING(20),
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'city': {
        type: Sequelize.STRING(100),
      },
      'province': {
        type: Sequelize.STRING(100),
      },
      'postal_code': {
        type: Sequelize.STRING(10),
      },
      'settings': {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('business_types', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'icon': {
        type: Sequelize.STRING(50),
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('modules', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'icon': {
        type: Sequelize.STRING(50),
      },
      'route': {
        type: Sequelize.STRING(100),
      },
      'parent_module_id': {
        type: Sequelize.UUID,
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'is_core': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'category': {
        type: Sequelize.STRING(50),
        defaultValue: "operations",
      },
      'features': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'pricing_tier': {
        type: Sequelize.STRING(20),
        defaultValue: "basic",
      },
      'setup_complexity': {
        type: Sequelize.STRING(20),
        defaultValue: "simple",
      },
      'color': {
        type: Sequelize.STRING(20),
        defaultValue: "#3B82F6",
      },
      'preview_image': {
        type: Sequelize.STRING(500),
      },
      'version': {
        type: Sequelize.STRING(20),
        defaultValue: "1.0.0",
      },
      'tags': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('business_type_modules', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'business_type_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'module_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'is_default': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'is_optional': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('tenant_modules', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'module_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'is_enabled': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'enabled_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'disabled_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('module_dependencies', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'module_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'depends_on_module_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'dependency_type': {
        type: Sequelize.ENUM('required', 'optional', 'recommended'),
        defaultValue: "required",
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('shift_handovers', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'shiftId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'handoverFrom': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'handoverTo': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'handoverAt': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'finalCashAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'status': {
        type: Sequelize.ENUM('pending', 'completed', 'rejected'),
        allowNull: false,
        defaultValue: "completed",
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('customer_loyalty', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'customerId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'programId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'currentTierId': {
        type: Sequelize.UUID,
      },
      'totalPoints': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      'availablePoints': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      'lifetimePoints': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      'totalSpending': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'enrollmentDate': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'lastActivityDate': {
        type: Sequelize.DATE,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('loyalty_programs', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'programName': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'pointsPerRupiah': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 1,
      },
      'minimumPurchase': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'pointsExpiry': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 365,
      },
      'autoEnroll': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'startDate': {
        type: Sequelize.DATE,
      },
      'endDate': {
        type: Sequelize.DATE,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('loyalty_tiers', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'programId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'tierName': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'tierLevel': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'minSpending': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'pointMultiplier': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 1,
      },
      'discountPercentage': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'benefits': {
        type: Sequelize.JSON,
      },
      'color': {
        type: Sequelize.STRING(100),
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('loyalty_rewards', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'programId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'rewardName': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'pointsRequired': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'rewardType': {
        type: Sequelize.ENUM('discount', 'product', 'shipping', 'voucher', 'service'),
        allowNull: false,
      },
      'rewardValue': {
        type: Sequelize.DECIMAL,
      },
      'productId': {
        type: Sequelize.UUID,
      },
      'quantity': {
        type: Sequelize.INTEGER,
      },
      'validityDays': {
        type: Sequelize.INTEGER,
      },
      'maxRedemptions': {
        type: Sequelize.INTEGER,
      },
      'currentRedemptions': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'startDate': {
        type: Sequelize.DATE,
      },
      'endDate': {
        type: Sequelize.DATE,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('point_transactions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'customerLoyaltyId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'transactionType': {
        type: Sequelize.ENUM('earn', 'redeem', 'expire', 'adjust', 'refund'),
        allowNull: false,
      },
      'points': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'referenceType': {
        type: Sequelize.ENUM('pos_transaction', 'reward_redemption', 'manual', 'expiry', 'refund'),
        allowNull: false,
      },
      'referenceId': {
        type: Sequelize.UUID,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'balanceBefore': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'balanceAfter': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'expiryDate': {
        type: Sequelize.DATE,
      },
      'processedBy': {
        type: Sequelize.UUID,
      },
      'transactionDate': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('reward_redemptions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'customerLoyaltyId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'rewardId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'pointsUsed': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'redemptionCode': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'status': {
        type: Sequelize.ENUM('pending', 'approved', 'used', 'expired', 'cancelled'),
        allowNull: false,
        defaultValue: "pending",
      },
      'redemptionDate': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'expiryDate': {
        type: Sequelize.DATE,
      },
      'usedDate': {
        type: Sequelize.DATE,
      },
      'usedInTransactionId': {
        type: Sequelize.UUID,
      },
      'processedBy': {
        type: Sequelize.UUID,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('warehouses', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'type': {
        type: Sequelize.ENUM('main', 'branch', 'storage', 'production'),
        defaultValue: "main",
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'city': {
        type: Sequelize.STRING(100),
      },
      'phone': {
        type: Sequelize.STRING(20),
      },
      'manager': {
        type: Sequelize.STRING(100),
      },
      'capacity': {
        type: Sequelize.DECIMAL,
      },
      'status': {
        type: Sequelize.ENUM('active', 'inactive', 'maintenance'),
        defaultValue: "active",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('locations', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'warehouse_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'type': {
        type: Sequelize.ENUM('rack', 'shelf', 'bin', 'pallet', 'floor', 'chiller', 'freezer'),
        defaultValue: "rack",
      },
      'aisle': {
        type: Sequelize.STRING(10),
      },
      'row': {
        type: Sequelize.STRING(10),
      },
      'level': {
        type: Sequelize.STRING(10),
      },
      'capacity': {
        type: Sequelize.DECIMAL,
      },
      'current_usage': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'status': {
        type: Sequelize.ENUM('available', 'occupied', 'reserved', 'maintenance'),
        defaultValue: "available",
      },
      'temperature_controlled': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'temperature_min': {
        type: Sequelize.DECIMAL,
      },
      'temperature_max': {
        type: Sequelize.DECIMAL,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('stock_opnames', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'opname_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'opname_type': {
        type: Sequelize.ENUM('full', 'cycle', 'spot'),
        defaultValue: "full",
      },
      'warehouse_id': {
        type: Sequelize.UUID,
      },
      'location_id': {
        type: Sequelize.UUID,
      },
      'status': {
        type: Sequelize.ENUM('draft', 'in_progress', 'completed', 'approved', 'posted', 'cancelled'),
        defaultValue: "draft",
      },
      'scheduled_date': {
        type: Sequelize.DATEONLY,
      },
      'start_date': {
        type: Sequelize.DATE,
      },
      'end_date': {
        type: Sequelize.DATE,
      },
      'performed_by': {
        type: Sequelize.STRING(100),
      },
      'supervised_by': {
        type: Sequelize.STRING(100),
      },
      'approved_by': {
        type: Sequelize.STRING(100),
      },
      'approved_date': {
        type: Sequelize.DATE,
      },
      'total_items': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'counted_items': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'items_with_variance': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_variance_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'freeze_inventory': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('stock_opname_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'stock_opname_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'location_id': {
        type: Sequelize.UUID,
      },
      'system_stock': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'physical_stock': {
        type: Sequelize.DECIMAL,
      },
      'difference': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'variance_percentage': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'unit_cost': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'variance_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'variance_category': {
        type: Sequelize.ENUM('none', 'minor', 'moderate', 'major'),
        defaultValue: "none",
      },
      'status': {
        type: Sequelize.ENUM('pending', 'counted', 'verified', 'investigated', 'approved'),
        defaultValue: "pending",
      },
      'counted_by': {
        type: Sequelize.STRING(100),
      },
      'count_date': {
        type: Sequelize.DATE,
      },
      'recount_required': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'recount_value': {
        type: Sequelize.DECIMAL,
      },
      'recount_by': {
        type: Sequelize.STRING(100),
      },
      'recount_date': {
        type: Sequelize.DATE,
      },
      'root_cause': {
        type: Sequelize.TEXT,
      },
      'corrective_action': {
        type: Sequelize.TEXT,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('incident_reports', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'incident_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'stock_opname_id': {
        type: Sequelize.UUID,
      },
      'stock_opname_item_id': {
        type: Sequelize.UUID,
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'variance_quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'variance_value': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'variance_category': {
        type: Sequelize.ENUM('minor', 'moderate', 'major'),
        allowNull: false,
      },
      'why_1': {
        type: Sequelize.TEXT,
      },
      'why_2': {
        type: Sequelize.TEXT,
      },
      'why_3': {
        type: Sequelize.TEXT,
      },
      'why_4': {
        type: Sequelize.TEXT,
      },
      'why_5': {
        type: Sequelize.TEXT,
      },
      'root_cause': {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      'evidence_notes': {
        type: Sequelize.TEXT,
      },
      'witness_statement': {
        type: Sequelize.TEXT,
      },
      'immediate_action': {
        type: Sequelize.TEXT,
      },
      'corrective_action': {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      'preventive_action': {
        type: Sequelize.TEXT,
      },
      'responsible_person': {
        type: Sequelize.STRING(100),
      },
      'target_date': {
        type: Sequelize.DATEONLY,
      },
      'approval_level': {
        type: Sequelize.ENUM('Supervisor', 'Manajer', 'Direktur/GM'),
        allowNull: false,
      },
      'approval_status': {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        defaultValue: "pending",
      },
      'approved_by': {
        type: Sequelize.STRING(100),
      },
      'approved_date': {
        type: Sequelize.DATE,
      },
      'approver_comments': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('recipes', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'batch_size': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 1,
      },
      'batch_unit': {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "pcs",
      },
      'estimated_yield': {
        type: Sequelize.DECIMAL,
      },
      'yield_percentage': {
        type: Sequelize.DECIMAL,
        defaultValue: 100,
      },
      'preparation_time_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'cooking_time_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_time_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'labor_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'overhead_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'total_production_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'cost_per_unit': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'difficulty_level': {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        defaultValue: "medium",
      },
      'category': {
        type: Sequelize.STRING(100),
      },
      'status': {
        type: Sequelize.ENUM('draft', 'active', 'archived'),
        defaultValue: "draft",
      },
      'version': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'instructions': {
        type: Sequelize.TEXT,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('recipe_ingredients', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'recipe_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'unit': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'unit_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'subtotal_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'is_optional': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'preparation_notes': {
        type: Sequelize.TEXT,
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('recipe_history', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'recipe_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'version': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      'change_type': {
        type: Sequelize.ENUM('created', 'updated', 'archived', 'restored'),
        allowNull: false,
      },
      'changed_by': {
        type: Sequelize.UUID,
      },
      'changes_summary': {
        type: Sequelize.TEXT,
      },
      'changes_json': {
        type: Sequelize.JSONB,
      },
      'snapshot_data': {
        type: Sequelize.JSONB,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('productions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'batch_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'recipe_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'planned_quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'produced_quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'unit': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'status': {
        type: Sequelize.ENUM('planned', 'in_progress', 'completed', 'cancelled'),
        defaultValue: "planned",
      },
      'production_date': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'start_time': {
        type: Sequelize.DATE,
      },
      'completion_time': {
        type: Sequelize.DATE,
      },
      'total_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'labor_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'overhead_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'waste_quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'waste_percentage': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'quality_grade': {
        type: Sequelize.ENUM('A', 'B', 'C', 'reject'),
      },
      'produced_by': {
        type: Sequelize.UUID,
      },
      'supervisor_id': {
        type: Sequelize.UUID,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'issues': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('production_materials', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'production_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'planned_quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'used_quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'unit': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'unit_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'total_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('production_history', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'production_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'action_type': {
        type: Sequelize.ENUM('created', 'started', 'updated', 'completed', 'cancelled', 'quality_checked'),
        allowNull: false,
      },
      'previous_status': {
        type: Sequelize.STRING(50),
      },
      'new_status': {
        type: Sequelize.STRING(50),
      },
      'changed_by': {
        type: Sequelize.UUID,
      },
      'changes_summary': {
        type: Sequelize.TEXT,
      },
      'changes_json': {
        type: Sequelize.JSONB,
      },
      'snapshot_data': {
        type: Sequelize.JSONB,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('production_waste', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'waste_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'production_id': {
        type: Sequelize.UUID,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'waste_type': {
        type: Sequelize.ENUM('raw_material', 'work_in_progress', 'finished_product', 'packaging', 'other'),
        allowNull: false,
      },
      'waste_category': {
        type: Sequelize.ENUM('defect', 'expired', 'damaged', 'overproduction', 'spillage', 'contamination'),
        allowNull: false,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'unit': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'cost_value': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'disposal_method': {
        type: Sequelize.ENUM('discard', 'recycle', 'rework', 'clearance_sale', 'donation'),
        allowNull: false,
      },
      'clearance_price': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'net_loss': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'reason': {
        type: Sequelize.TEXT,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'recorded_by': {
        type: Sequelize.UUID,
      },
      'waste_date': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'disposal_date': {
        type: Sequelize.DATE,
      },
      'status': {
        type: Sequelize.ENUM('recorded', 'disposed', 'recovered'),
        defaultValue: "recorded",
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('system_alerts', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'alert_type': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'severity': {
        type: Sequelize.ENUM('info', 'warning', 'critical', 'urgent'),
        allowNull: false,
        defaultValue: "info",
      },
      'title': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'message': {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      'category': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'source': {
        type: Sequelize.STRING(100),
      },
      'reference_type': {
        type: Sequelize.STRING(50),
      },
      'reference_id': {
        type: Sequelize.STRING(100),
      },
      'reference_data': {
        type: Sequelize.JSON,
      },
      'action_required': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'action_type': {
        type: Sequelize.STRING(50),
      },
      'action_url': {
        type: Sequelize.STRING(500),
      },
      'priority': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'is_read': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'is_resolved': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'resolved_at': {
        type: Sequelize.DATE,
      },
      'resolved_by': {
        type: Sequelize.UUID,
      },
      'resolution_notes': {
        type: Sequelize.TEXT,
      },
      'assigned_to': {
        type: Sequelize.UUID,
      },
      'expires_at': {
        type: Sequelize.DATE,
      },
      'metadata': {
        type: Sequelize.JSON,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('alert_subscriptions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'user_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'alert_type': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'category': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'is_enabled': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'notify_email': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'notify_sms': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'notify_push': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'min_severity': {
        type: Sequelize.ENUM('info', 'warning', 'critical', 'urgent'),
        defaultValue: "info",
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('alert_actions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'alert_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'user_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'action_type': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'action_data': {
        type: Sequelize.JSON,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('employee_schedules', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'employeeId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'scheduleDate': {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      'shiftType': {
        type: Sequelize.ENUM('pagi', 'siang', 'malam', 'full'),
        allowNull: false,
        defaultValue: "pagi",
      },
      'startTime': {
        type: Sequelize.TIME,
        allowNull: false,
      },
      'endTime': {
        type: Sequelize.TIME,
        allowNull: false,
      },
      'locationId': {
        type: Sequelize.UUID,
      },
      'status': {
        type: Sequelize.ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'absent'),
        allowNull: false,
        defaultValue: "scheduled",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'isRecurring': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'recurringPattern': {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'none'),
        defaultValue: "none",
      },
      'recurringEndDate': {
        type: Sequelize.DATEONLY,
      },
      'createdBy': {
        type: Sequelize.UUID,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'branchId': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('shift_templates', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'shiftType': {
        type: Sequelize.ENUM('pagi', 'siang', 'malam', 'full'),
        allowNull: false,
      },
      'startTime': {
        type: Sequelize.TIME,
        allowNull: false,
      },
      'endTime': {
        type: Sequelize.TIME,
        allowNull: false,
      },
      'breakDuration': {
        type: Sequelize.INTEGER,
      },
      'color': {
        type: Sequelize.STRING(20),
        defaultValue: "#3B82F6",
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('stores', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'city': {
        type: Sequelize.STRING(255),
      },
      'province': {
        type: Sequelize.STRING(255),
      },
      'postal_code': {
        type: Sequelize.STRING(10),
      },
      'phone': {
        type: Sequelize.STRING(20),
      },
      'email': {
        type: Sequelize.STRING(255),
      },
      'owner_id': {
        type: Sequelize.UUID,
      },
      'business_type': {
        type: Sequelize.STRING(50),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'settings': {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('branches', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'store_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'type': {
        type: Sequelize.ENUM('main', 'branch', 'warehouse', 'kiosk'),
        defaultValue: "branch",
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'city': {
        type: Sequelize.STRING(255),
      },
      'province': {
        type: Sequelize.STRING(255),
      },
      'postal_code': {
        type: Sequelize.STRING(10),
      },
      'phone': {
        type: Sequelize.STRING(20),
      },
      'email': {
        type: Sequelize.STRING(255),
      },
      'manager_id': {
        type: Sequelize.UUID,
      },
      'region': {
        type: Sequelize.STRING(100),
      },
      'last_sync_at': {
        type: Sequelize.DATE,
      },
      'sync_status': {
        type: Sequelize.ENUM('synced', 'pending', 'failed', 'never'),
        defaultValue: "never",
      },
      'operating_hours': {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'settings': {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('store_settings', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'store_id': {
        type: Sequelize.UUID,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'category': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'key': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'value': {
        type: Sequelize.TEXT,
      },
      'data_type': {
        type: Sequelize.ENUM('string', 'number', 'boolean', 'json'),
        defaultValue: "string",
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'is_global': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('kitchen_orders', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'order_number': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'pos_transaction_id': {
        type: Sequelize.UUID,
      },
      'table_number': {
        type: Sequelize.STRING(255),
      },
      'order_type': {
        type: Sequelize.ENUM('dine-in', 'takeaway', 'delivery'),
        allowNull: false,
        defaultValue: "dine-in",
      },
      'customer_name': {
        type: Sequelize.STRING(255),
      },
      'status': {
        type: Sequelize.ENUM('new', 'preparing', 'ready', 'served', 'cancelled'),
        allowNull: false,
        defaultValue: "new",
      },
      'priority': {
        type: Sequelize.ENUM('normal', 'urgent'),
        allowNull: false,
        defaultValue: "normal",
      },
      'received_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'started_at': {
        type: Sequelize.DATE,
      },
      'completed_at': {
        type: Sequelize.DATE,
      },
      'served_at': {
        type: Sequelize.DATE,
      },
      'estimated_time': {
        type: Sequelize.INTEGER,
      },
      'actual_prep_time': {
        type: Sequelize.INTEGER,
      },
      'assigned_chef_id': {
        type: Sequelize.UUID,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'total_amount': {
        type: Sequelize.DECIMAL,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'assigned_chef_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('kitchen_order_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'kitchen_order_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'recipe_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'quantity': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'modifiers': {
        type: Sequelize.JSON,
      },
      'status': {
        type: Sequelize.ENUM('pending', 'preparing', 'ready'),
        allowNull: false,
        defaultValue: "pending",
      },
      'prepared_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'kitchen_order_id': {
        type: Sequelize.UUID,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'recipe_id': {
        type: Sequelize.UUID,
      },
      'prepared_by': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('kitchen_inventory_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'category': {
        type: Sequelize.STRING(255),
      },
      'current_stock': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'unit': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'min_stock': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'max_stock': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'reorder_point': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'unit_cost': {
        type: Sequelize.DECIMAL,
      },
      'total_value': {
        type: Sequelize.DECIMAL,
      },
      'last_restocked': {
        type: Sequelize.DATE,
      },
      'status': {
        type: Sequelize.ENUM('good', 'low', 'critical', 'overstock'),
        allowNull: false,
        defaultValue: "good",
      },
      'warehouse_id': {
        type: Sequelize.UUID,
      },
      'location_id': {
        type: Sequelize.UUID,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'warehouse_id': {
        type: Sequelize.UUID,
      },
      'location_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('kitchen_inventory_transactions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'inventory_item_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'transaction_type': {
        type: Sequelize.ENUM('in', 'out', 'adjustment', 'waste', 'transfer'),
        allowNull: false,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'unit': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'previous_stock': {
        type: Sequelize.DECIMAL,
      },
      'new_stock': {
        type: Sequelize.DECIMAL,
      },
      'reference_type': {
        type: Sequelize.STRING(255),
      },
      'reference_id': {
        type: Sequelize.UUID,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'performed_by': {
        type: Sequelize.UUID,
      },
      'transaction_date': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'inventory_item_id': {
        type: Sequelize.UUID,
      },
      'performed_by': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('branch_realtime_metrics', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'branch_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'kitchen_status': {
        type: Sequelize.ENUM('idle', 'normal', 'busy', 'overloaded'),
        defaultValue: "idle",
      },
      'kitchen_active_orders': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'kitchen_pending_orders': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'kitchen_avg_prep_time': {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      'kitchen_sla_compliance': {
        type: Sequelize.FLOAT,
        defaultValue: 100,
      },
      'queue_length': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'queue_avg_wait_time': {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      'queue_served_today': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'orders_online': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'orders_offline': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'orders_dine_in': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'orders_takeaway': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'orders_delivery': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_orders_today': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'table_occupancy': {
        type: Sequelize.FLOAT,
        defaultValue: 0,
      },
      'tables_total': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'tables_occupied': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'tables_available': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'tables_reserved': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'employees_present': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'employees_total': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'employees_on_break': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'kitchen_staff_active': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'cashiers_active': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'waiters_active': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'sales_today': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'sales_this_hour': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'avg_transaction_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'transactions_today': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'last_updated': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('branch_setups', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'branch_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'current_step': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'total_steps': {
        type: Sequelize.INTEGER,
        defaultValue: 6,
      },
      'status': {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'skipped'),
        defaultValue: "pending",
      },
      'basic_info_completed': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'modules_configured': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'users_created': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'inventory_setup': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'payment_configured': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'printer_configured': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'setup_data': {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      'started_at': {
        type: Sequelize.DATE,
      },
      'completed_at': {
        type: Sequelize.DATE,
      },
      'completed_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('branch_modules', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'branch_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'module_code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'module_name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'is_enabled': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'settings': {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      'enabled_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'enabled_by': {
        type: Sequelize.UUID,
      },
      'disabled_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('sync_logs', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'sync_type': {
        type: Sequelize.ENUM('products', 'prices', 'promotions', 'settings', 'inventory', 'full'),
        allowNull: false,
      },
      'direction': {
        type: Sequelize.ENUM('hq_to_branch', 'branch_to_hq'),
        allowNull: false,
      },
      'status': {
        type: Sequelize.ENUM('pending', 'in_progress', 'completed', 'failed'),
        defaultValue: "pending",
      },
      'items_synced': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_items': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'error_message': {
        type: Sequelize.TEXT,
      },
      'started_at': {
        type: Sequelize.DATE,
      },
      'completed_at': {
        type: Sequelize.DATE,
      },
      'initiated_by': {
        type: Sequelize.UUID,
      },
      'metadata': {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('partners', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'business_name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'business_type': {
        type: Sequelize.STRING(100),
      },
      'owner_name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'email': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'phone': {
        type: Sequelize.STRING(50),
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'city': {
        type: Sequelize.STRING(100),
      },
      'province': {
        type: Sequelize.STRING(100),
      },
      'postal_code': {
        type: Sequelize.STRING(20),
      },
      'tax_id': {
        type: Sequelize.STRING(50),
      },
      'status': {
        type: Sequelize.STRING(50),
        defaultValue: "pending",
      },
      'activation_status': {
        type: Sequelize.STRING(50),
        defaultValue: "pending",
      },
      'activation_requested_at': {
        type: Sequelize.DATE,
      },
      'activation_approved_at': {
        type: Sequelize.DATE,
      },
      'activation_approved_by': {
        type: Sequelize.UUID,
      },
      'rejection_reason': {
        type: Sequelize.TEXT,
      },
      'logo_url': {
        type: Sequelize.TEXT,
      },
      'website': {
        type: Sequelize.STRING(255),
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('subscription_packages', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'price_monthly': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'price_yearly': {
        type: Sequelize.DECIMAL,
      },
      'max_outlets': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'max_users': {
        type: Sequelize.INTEGER,
        defaultValue: 3,
      },
      'max_products': {
        type: Sequelize.INTEGER,
        defaultValue: 1000,
      },
      'max_transactions_per_month': {
        type: Sequelize.INTEGER,
      },
      'features': {
        type: Sequelize.JSONB,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('partner_subscriptions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'partner_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'package_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'status': {
        type: Sequelize.STRING(50),
        defaultValue: "active",
      },
      'start_date': {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      'end_date': {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      'auto_renew': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'payment_method': {
        type: Sequelize.STRING(50),
      },
      'last_payment_date': {
        type: Sequelize.DATE,
      },
      'next_billing_date': {
        type: Sequelize.DATEONLY,
      },
      'total_paid': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'partner_id': {
        type: Sequelize.UUID,
      },
      'package_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('partner_outlets', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'partner_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'outlet_name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'outlet_code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'city': {
        type: Sequelize.STRING(100),
      },
      'province': {
        type: Sequelize.STRING(100),
      },
      'phone': {
        type: Sequelize.STRING(50),
      },
      'manager_name': {
        type: Sequelize.STRING(255),
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'pos_device_id': {
        type: Sequelize.STRING(255),
      },
      'last_sync_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'partner_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('partner_users', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'partner_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'outlet_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'email': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'phone': {
        type: Sequelize.STRING(50),
      },
      'role': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'password_hash': {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'last_login_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'partner_id': {
        type: Sequelize.UUID,
      },
      'outlet_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('activation_requests', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'partner_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'package_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'business_documents': {
        type: Sequelize.JSONB,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'status': {
        type: Sequelize.STRING(50),
        defaultValue: "pending",
      },
      'reviewed_by': {
        type: Sequelize.UUID,
      },
      'reviewed_at': {
        type: Sequelize.DATE,
      },
      'review_notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'partner_id': {
        type: Sequelize.UUID,
      },
      'package_id': {
        type: Sequelize.UUID,
      },
      'reviewed_by': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('kyb_applications', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'user_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'business_name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'business_category': {
        type: Sequelize.STRING(100),
      },
      'business_subcategory': {
        type: Sequelize.STRING(100),
      },
      'business_duration': {
        type: Sequelize.STRING(50),
      },
      'business_description': {
        type: Sequelize.TEXT,
      },
      'employee_count': {
        type: Sequelize.STRING(50),
      },
      'annual_revenue': {
        type: Sequelize.STRING(50),
      },
      'legal_entity_type': {
        type: Sequelize.STRING(50),
      },
      'legal_entity_name': {
        type: Sequelize.STRING(255),
      },
      'nib_number': {
        type: Sequelize.STRING(100),
      },
      'siup_number': {
        type: Sequelize.STRING(100),
      },
      'npwp_number': {
        type: Sequelize.STRING(100),
      },
      'ktp_number': {
        type: Sequelize.STRING(50),
      },
      'ktp_name': {
        type: Sequelize.STRING(255),
      },
      'pic_name': {
        type: Sequelize.STRING(255),
      },
      'pic_phone': {
        type: Sequelize.STRING(50),
      },
      'pic_email': {
        type: Sequelize.STRING(255),
      },
      'pic_position': {
        type: Sequelize.STRING(100),
      },
      'business_address': {
        type: Sequelize.TEXT,
      },
      'business_city': {
        type: Sequelize.STRING(100),
      },
      'business_province': {
        type: Sequelize.STRING(100),
      },
      'business_postal_code': {
        type: Sequelize.STRING(20),
      },
      'business_district': {
        type: Sequelize.STRING(100),
      },
      'business_coordinates': {
        type: Sequelize.JSON,
      },
      'business_structure': {
        type: Sequelize.STRING(20),
        defaultValue: "single",
      },
      'planned_branch_count': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'branch_locations': {
        type: Sequelize.JSON,
      },
      'additional_notes': {
        type: Sequelize.TEXT,
      },
      'referral_source': {
        type: Sequelize.STRING(100),
      },
      'expected_start_date': {
        type: Sequelize.DATEONLY,
      },
      'status': {
        type: Sequelize.STRING(30),
        defaultValue: "draft",
      },
      'submitted_at': {
        type: Sequelize.DATE,
      },
      'current_step': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'completion_percentage': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'reviewed_by': {
        type: Sequelize.UUID,
      },
      'reviewed_at': {
        type: Sequelize.DATE,
      },
      'review_notes': {
        type: Sequelize.TEXT,
      },
      'rejection_reason': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'user_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('kyb_documents', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'kyb_application_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'document_type': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'document_name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'file_url': {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      'file_size': {
        type: Sequelize.INTEGER,
      },
      'mime_type': {
        type: Sequelize.STRING(100),
      },
      'verification_status': {
        type: Sequelize.STRING(30),
        defaultValue: "pending",
      },
      'verified_by': {
        type: Sequelize.UUID,
      },
      'verified_at': {
        type: Sequelize.DATE,
      },
      'verification_notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'kyb_application_id': {
        type: Sequelize.UUID,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('employee_attendance', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'employeeId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branchId': {
        type: Sequelize.UUID,
      },
      'date': {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      'clockIn': {
        type: Sequelize.DATE,
      },
      'clockOut': {
        type: Sequelize.DATE,
      },
      'scheduledStart': {
        type: Sequelize.TIME,
      },
      'scheduledEnd': {
        type: Sequelize.TIME,
      },
      'status': {
        type: Sequelize.ENUM('present', 'late', 'absent', 'leave', 'sick', 'holiday', 'work_from_home'),
        allowNull: false,
        defaultValue: "present",
      },
      'lateMinutes': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'earlyLeaveMinutes': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'overtimeMinutes': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'workHours': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'breakMinutes': {
        type: Sequelize.INTEGER,
        defaultValue: 60,
      },
      'leaveType': {
        type: Sequelize.STRING(255),
      },
      'leaveReason': {
        type: Sequelize.TEXT,
      },
      'approvedBy': {
        type: Sequelize.UUID,
      },
      'clockInLocation': {
        type: Sequelize.JSONB,
      },
      'clockOutLocation': {
        type: Sequelize.JSONB,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'tenantId': {
        type: Sequelize.UUID,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('employee_kpis', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'employee_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'period': {
        type: Sequelize.STRING(7),
        allowNull: false,
      },
      'metric_name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'category': {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "operations",
      },
      'target': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'actual': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'unit': {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "%",
      },
      'weight': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      'status': {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "pending",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'reviewed_by': {
        type: Sequelize.UUID,
      },
      'reviewed_at': {
        type: Sequelize.DATE,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'template_id': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('kpi_templates', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'code': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'category': {
        type: Sequelize.ENUM('sales', 'operations', 'customer', 'financial', 'hr', 'quality'),
        allowNull: false,
      },
      'unit': {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "%",
      },
      'data_type': {
        type: Sequelize.ENUM('number', 'percentage', 'currency', 'count', 'ratio'),
        allowNull: false,
        defaultValue: "number",
      },
      'formula_type': {
        type: Sequelize.ENUM('simple', 'weighted', 'cumulative', 'average', 'ratio', 'custom'),
        allowNull: false,
        defaultValue: "simple",
      },
      'formula': {
        type: Sequelize.TEXT,
      },
      'scoring_method': {
        type: Sequelize.ENUM('linear', 'step', 'threshold', 'bell_curve'),
        allowNull: false,
        defaultValue: "linear",
      },
      'scoring_scale': {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {"min":0,"max":100,"excellent":{"min":90,"max":100,"score":5},"good":{"min":75,"max":89,"score":4},"average":{"min":60,"max":74,"score":3},"belowAverage":{"min":40,"max":59,"score":2},"poor":{"min":0,"max":39,"score":1}},
      },
      'default_target': {
        type: Sequelize.DECIMAL,
      },
      'default_weight': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 100,
      },
      'measurement_frequency': {
        type: Sequelize.ENUM('daily', 'weekly', 'monthly', 'quarterly', 'yearly'),
        allowNull: false,
        defaultValue: "monthly",
      },
      'applicable_to': {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: ["all"],
      },
      'parameters': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('kpi_scoring', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'scoring_type': {
        type: Sequelize.ENUM('standard', 'custom'),
        allowNull: false,
        defaultValue: "standard",
      },
      'levels': {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [{"level":5,"label":"Excellent","minPercent":110,"maxPercent":999,"color":"#10B981","description":"Melampaui target secara signifikan"},{"level":4,"label":"Good","minPercent":100,"maxPercent":109,"color":"#3B82F6","description":"Mencapai atau sedikit melampaui target"},{"level":3,"label":"Average","minPercent":80,"maxPercent":99,"color":"#F59E0B","description":"Mendekati target"},{"level":2,"label":"Below Average","minPercent":60,"maxPercent":79,"color":"#F97316","description":"Di bawah target"},{"level":1,"label":"Poor","minPercent":0,"maxPercent":59,"color":"#EF4444","description":"Jauh dari target"}],
      },
      'weighted_scoring': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'bonus_rules': {
        type: Sequelize.JSONB,
        defaultValue: {"enabled":false,"thresholds":[{"minScore":4.5,"bonusPercent":15},{"minScore":4,"bonusPercent":10},{"minScore":3.5,"bonusPercent":5}]},
      },
      'penalty_rules': {
        type: Sequelize.JSONB,
        defaultValue: {"enabled":false,"thresholds":[{"maxScore":2,"penaltyPercent":10},{"maxScore":1.5,"penaltyPercent":15}]},
      },
      'is_default': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('performance_reviews', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'employeeId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branchId': {
        type: Sequelize.UUID,
      },
      'reviewPeriod': {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      'reviewDate': {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      'reviewerId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'reviewerName': {
        type: Sequelize.STRING(255),
      },
      'overallRating': {
        type: Sequelize.DECIMAL,
      },
      'categories': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'strengths': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'areasForImprovement': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'goals': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'achievements': {
        type: Sequelize.TEXT,
      },
      'developmentPlan': {
        type: Sequelize.TEXT,
      },
      'employeeComments': {
        type: Sequelize.TEXT,
      },
      'managerComments': {
        type: Sequelize.TEXT,
      },
      'status': {
        type: Sequelize.ENUM('draft', 'submitted', 'reviewed', 'acknowledged', 'closed'),
        allowNull: false,
        defaultValue: "draft",
      },
      'acknowledgedAt': {
        type: Sequelize.DATE,
      },
      'salaryRecommendation': {
        type: Sequelize.ENUM('no_change', 'increase', 'decrease', 'promotion', 'bonus'),
      },
      'salaryRecommendationAmount': {
        type: Sequelize.DECIMAL,
      },
      'promotionRecommendation': {
        type: Sequelize.STRING(255),
      },
      'tenantId': {
        type: Sequelize.UUID,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('leave_requests', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'employeeId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branchId': {
        type: Sequelize.UUID,
      },
      'leaveType': {
        type: Sequelize.ENUM('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'personal', 'bereavement', 'marriage', 'religious'),
        allowNull: false,
      },
      'startDate': {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      'endDate': {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      'totalDays': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'reason': {
        type: Sequelize.TEXT,
      },
      'attachmentUrl': {
        type: Sequelize.STRING(255),
      },
      'status': {
        type: Sequelize.ENUM('pending', 'approved', 'rejected', 'cancelled'),
        allowNull: false,
        defaultValue: "pending",
      },
      'approvedBy': {
        type: Sequelize.UUID,
      },
      'approvedAt': {
        type: Sequelize.DATE,
      },
      'rejectionReason': {
        type: Sequelize.TEXT,
      },
      'delegateTo': {
        type: Sequelize.UUID,
      },
      'tenantId': {
        type: Sequelize.UUID,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('hris_webhook_logs', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'eventType': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'employeeId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'employeeName': {
        type: Sequelize.STRING(255),
      },
      'branchId': {
        type: Sequelize.UUID,
      },
      'branchName': {
        type: Sequelize.STRING(255),
      },
      'data': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'triggeredBy': {
        type: Sequelize.STRING(255),
      },
      'status': {
        type: Sequelize.ENUM('triggered', 'processed', 'failed'),
        allowNull: false,
        defaultValue: "triggered",
      },
      'tenantId': {
        type: Sequelize.UUID,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('attendance_devices', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branch_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'device_name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'device_type': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'device_brand': {
        type: Sequelize.STRING(100),
      },
      'device_model': {
        type: Sequelize.STRING(100),
      },
      'serial_number': {
        type: Sequelize.STRING(100),
      },
      'ip_address': {
        type: Sequelize.STRING(45),
      },
      'port': {
        type: Sequelize.INTEGER,
        defaultValue: 4370,
      },
      'communication_key': {
        type: Sequelize.STRING(100),
      },
      'connection_type': {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "tcp",
      },
      'api_endpoint': {
        type: Sequelize.STRING(500),
      },
      'api_key': {
        type: Sequelize.STRING(255),
      },
      'webhook_secret': {
        type: Sequelize.STRING(255),
      },
      'sync_mode': {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "push",
      },
      'sync_interval': {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      },
      'last_sync_at': {
        type: Sequelize.DATE,
      },
      'last_sync_status': {
        type: Sequelize.STRING(30),
      },
      'last_sync_message': {
        type: Sequelize.TEXT,
      },
      'total_synced': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'registered_users': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'max_capacity': {
        type: Sequelize.INTEGER,
      },
      'firmware_version': {
        type: Sequelize.STRING(50),
      },
      'location': {
        type: Sequelize.STRING(255),
      },
      'status': {
        type: Sequelize.STRING(30),
        defaultValue: "active",
      },
      'is_online': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'last_heartbeat_at': {
        type: Sequelize.DATE,
      },
      'settings': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('attendance_device_logs', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'device_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'employee_id': {
        type: Sequelize.UUID,
      },
      'device_user_id': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'device_user_name': {
        type: Sequelize.STRING(255),
      },
      'punch_time': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'punch_type': {
        type: Sequelize.STRING(30),
      },
      'verify_mode': {
        type: Sequelize.STRING(30),
      },
      'verify_status': {
        type: Sequelize.INTEGER,
      },
      'process_status': {
        type: Sequelize.STRING(30),
        defaultValue: "pending",
      },
      'processed_at': {
        type: Sequelize.DATE,
      },
      'process_error': {
        type: Sequelize.TEXT,
      },
      'attendance_id': {
        type: Sequelize.UUID,
      },
      'raw_data': {
        type: Sequelize.JSONB,
      },
      'sync_batch_id': {
        type: Sequelize.STRING(100),
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('attendance_settings', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'work_start_time': {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: "08:00:00",
      },
      'work_end_time': {
        type: Sequelize.TIME,
        allowNull: false,
        defaultValue: "17:00:00",
      },
      'break_start_time': {
        type: Sequelize.TIME,
        defaultValue: "12:00:00",
      },
      'break_end_time': {
        type: Sequelize.TIME,
        defaultValue: "13:00:00",
      },
      'break_duration_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 60,
      },
      'work_days': {
        type: Sequelize.JSONB,
        defaultValue: [1,2,3,4,5],
      },
      'late_grace_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 15,
      },
      'early_leave_grace_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 15,
      },
      'auto_absent_after_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 120,
      },
      'overtime_enabled': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'overtime_min_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      'overtime_requires_approval': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'gps_attendance_enabled': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'geo_fence_radius': {
        type: Sequelize.INTEGER,
        defaultValue: 100,
      },
      'require_selfie': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'allow_outside_geofence': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'fingerprint_enabled': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'auto_process_device_logs': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'punch_type_detection': {
        type: Sequelize.STRING(30),
        defaultValue: "auto",
      },
      'annual_leave_quota': {
        type: Sequelize.INTEGER,
        defaultValue: 12,
      },
      'sick_leave_quota': {
        type: Sequelize.INTEGER,
        defaultValue: 14,
      },
      'leave_requires_approval': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'notify_late_to_manager': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'notify_absent_to_manager': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'notify_overtime_to_hr': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('fleet_vehicles', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'vehicle_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'license_plate': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'vehicle_type': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'brand': {
        type: Sequelize.STRING(100),
      },
      'model': {
        type: Sequelize.STRING(100),
      },
      'year': {
        type: Sequelize.INTEGER,
      },
      'color': {
        type: Sequelize.STRING(50),
      },
      'ownership_type': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'purchase_date': {
        type: Sequelize.DATE,
      },
      'purchase_price': {
        type: Sequelize.DECIMAL,
      },
      'lease_start_date': {
        type: Sequelize.DATE,
      },
      'lease_end_date': {
        type: Sequelize.DATE,
      },
      'lease_monthly_cost': {
        type: Sequelize.DECIMAL,
      },
      'max_weight_kg': {
        type: Sequelize.DECIMAL,
      },
      'max_volume_m3': {
        type: Sequelize.DECIMAL,
      },
      'fuel_tank_capacity': {
        type: Sequelize.DECIMAL,
      },
      'registration_number': {
        type: Sequelize.STRING(100),
      },
      'ownership_document': {
        type: Sequelize.STRING(100),
      },
      'registration_expiry': {
        type: Sequelize.DATE,
      },
      'insurance_policy_number': {
        type: Sequelize.STRING(100),
      },
      'insurance_provider': {
        type: Sequelize.STRING(255),
      },
      'insurance_expiry': {
        type: Sequelize.DATE,
      },
      'gps_device_id': {
        type: Sequelize.STRING(100),
      },
      'gps_device_imei': {
        type: Sequelize.STRING(50),
      },
      'status': {
        type: Sequelize.STRING(50),
        defaultValue: "active",
      },
      'current_location': {
        type: Sequelize.STRING(255),
      },
      'current_odometer_km': {
        type: Sequelize.DECIMAL,
      },
      'last_service_date': {
        type: Sequelize.DATE,
      },
      'next_service_due_km': {
        type: Sequelize.DECIMAL,
      },
      'assigned_branch_id': {
        type: Sequelize.UUID,
      },
      'assigned_driver_id': {
        type: Sequelize.UUID,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('fleet_drivers', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'user_id': {
        type: Sequelize.UUID,
      },
      'driver_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'full_name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'phone': {
        type: Sequelize.STRING(50),
      },
      'email': {
        type: Sequelize.STRING(255),
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'date_of_birth': {
        type: Sequelize.DATE,
      },
      'license_number': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'license_type': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'license_issue_date': {
        type: Sequelize.DATE,
      },
      'license_expiry_date': {
        type: Sequelize.DATE,
      },
      'employment_type': {
        type: Sequelize.STRING(50),
      },
      'hire_date': {
        type: Sequelize.DATE,
      },
      'assigned_branch_id': {
        type: Sequelize.UUID,
      },
      'total_deliveries': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'on_time_deliveries': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_distance_km': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'safety_score': {
        type: Sequelize.DECIMAL,
        defaultValue: 100,
      },
      'customer_rating': {
        type: Sequelize.DECIMAL,
      },
      'status': {
        type: Sequelize.STRING(50),
        defaultValue: "active",
      },
      'availability_status': {
        type: Sequelize.STRING(50),
        defaultValue: "available",
      },
      'photo_url': {
        type: Sequelize.TEXT,
      },
      'license_photo_url': {
        type: Sequelize.TEXT,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('fleet_routes', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'route_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'route_name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'route_type': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'start_location': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'end_location': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'total_distance_km': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'estimated_duration_minutes': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'stops': {
        type: Sequelize.JSONB,
      },
      'status': {
        type: Sequelize.STRING(50),
        defaultValue: "active",
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('fleet_route_assignments', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'route_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'vehicle_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'driver_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'shipment_id': {
        type: Sequelize.UUID,
      },
      'scheduled_date': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'scheduled_start_time': {
        type: Sequelize.TIME,
      },
      'actual_start_time': {
        type: Sequelize.DATE,
      },
      'actual_end_time': {
        type: Sequelize.DATE,
      },
      'status': {
        type: Sequelize.STRING(50),
        defaultValue: "scheduled",
      },
      'total_distance_km': {
        type: Sequelize.DECIMAL,
      },
      'fuel_consumed_liters': {
        type: Sequelize.DECIMAL,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('fleet_gps_locations', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'vehicle_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'driver_id': {
        type: Sequelize.UUID,
      },
      'latitude': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'longitude': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'altitude': {
        type: Sequelize.DECIMAL,
      },
      'speed_kmh': {
        type: Sequelize.DECIMAL,
      },
      'heading': {
        type: Sequelize.DECIMAL,
      },
      'accuracy_meters': {
        type: Sequelize.DECIMAL,
      },
      'timestamp': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'is_moving': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'is_idle': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'idle_duration_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('fleet_maintenance_schedules', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'vehicle_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'maintenance_type': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'interval_type': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'interval_kilometers': {
        type: Sequelize.INTEGER,
      },
      'interval_months': {
        type: Sequelize.INTEGER,
      },
      'last_service_date': {
        type: Sequelize.DATE,
      },
      'last_service_odometer': {
        type: Sequelize.DECIMAL,
      },
      'next_service_date': {
        type: Sequelize.DATE,
      },
      'next_service_odometer': {
        type: Sequelize.DECIMAL,
      },
      'status': {
        type: Sequelize.STRING(50),
        defaultValue: "active",
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('fleet_fuel_transactions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'vehicle_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'driver_id': {
        type: Sequelize.UUID,
      },
      'transaction_type': {
        type: Sequelize.STRING(30),
        allowNull: false,
        defaultValue: "refill",
      },
      'transaction_date': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'fuel_station': {
        type: Sequelize.STRING(255),
      },
      'fuel_type': {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "diesel",
      },
      'quantity_liters': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'price_per_liter': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'total_cost': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'odometer_reading': {
        type: Sequelize.DECIMAL,
      },
      'payment_method': {
        type: Sequelize.STRING(20),
      },
      'receipt_number': {
        type: Sequelize.STRING(50),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('integration_providers', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'category': {
        type: Sequelize.ENUM('payment_gateway', 'messaging', 'email', 'delivery', 'accounting', 'marketplace', 'other'),
        allowNull: false,
      },
      'subcategory': {
        type: Sequelize.STRING(50),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'logo': {
        type: Sequelize.STRING(500),
      },
      'website': {
        type: Sequelize.STRING(500),
      },
      'documentation_url': {
        type: Sequelize.STRING(500),
      },
      'api_base_url': {
        type: Sequelize.STRING(500),
      },
      'sandbox_api_url': {
        type: Sequelize.STRING(500),
      },
      'required_credentials': {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      },
      'config_schema': {
        type: Sequelize.JSON,
      },
      'webhook_supported': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'webhook_events': {
        type: Sequelize.JSON,
      },
      'features': {
        type: Sequelize.JSON,
      },
      'pricing': {
        type: Sequelize.JSON,
      },
      'requires_approval': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'application_fields': {
        type: Sequelize.JSON,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('integration_configs', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'provider_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'environment': {
        type: Sequelize.ENUM('sandbox', 'production'),
        defaultValue: "sandbox",
      },
      'credentials': {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: {},
      },
      'settings': {
        type: Sequelize.JSON,
      },
      'webhook_url': {
        type: Sequelize.STRING(500),
      },
      'webhook_secret': {
        type: Sequelize.STRING(255),
      },
      'merchant_id': {
        type: Sequelize.STRING(100),
      },
      'merchant_name': {
        type: Sequelize.STRING(200),
      },
      'status': {
        type: Sequelize.ENUM('pending', 'active', 'suspended', 'expired', 'rejected'),
        defaultValue: "pending",
      },
      'is_default': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'enabled_payment_methods': {
        type: Sequelize.JSON,
      },
      'fee_settings': {
        type: Sequelize.JSON,
      },
      'limits': {
        type: Sequelize.JSON,
      },
      'notification_settings': {
        type: Sequelize.JSON,
      },
      'last_tested_at': {
        type: Sequelize.DATE,
      },
      'last_test_result': {
        type: Sequelize.JSON,
      },
      'activated_at': {
        type: Sequelize.DATE,
      },
      'expires_at': {
        type: Sequelize.DATE,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('integration_requests', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'request_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'provider_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'request_type': {
        type: Sequelize.ENUM('new_merchant', 'upgrade', 'additional_service', 'renewal', 'change_config'),
        allowNull: false,
      },
      'business_info': {
        type: Sequelize.JSON,
        allowNull: false,
      },
      'owner_info': {
        type: Sequelize.JSON,
      },
      'bank_info': {
        type: Sequelize.JSON,
      },
      'documents': {
        type: Sequelize.JSON,
      },
      'requested_services': {
        type: Sequelize.JSON,
      },
      'additional_info': {
        type: Sequelize.JSON,
      },
      'status': {
        type: Sequelize.ENUM('draft', 'submitted', 'under_review', 'pending_documents', 'approved', 'rejected', 'cancelled'),
        defaultValue: "draft",
      },
      'provider_status': {
        type: Sequelize.STRING(50),
      },
      'provider_reference_id': {
        type: Sequelize.STRING(100),
      },
      'review_notes': {
        type: Sequelize.TEXT,
      },
      'rejection_reason': {
        type: Sequelize.TEXT,
      },
      'approved_credentials': {
        type: Sequelize.JSON,
      },
      'submitted_at': {
        type: Sequelize.DATE,
      },
      'reviewed_at': {
        type: Sequelize.DATE,
      },
      'approved_at': {
        type: Sequelize.DATE,
      },
      'config_id': {
        type: Sequelize.UUID,
      },
      'requested_by': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'reviewed_by': {
        type: Sequelize.UUID,
      },
      'approved_by': {
        type: Sequelize.UUID,
      },
      'priority': {
        type: Sequelize.ENUM('low', 'normal', 'high', 'urgent'),
        defaultValue: "normal",
      },
      'estimated_completion_date': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sfa_territories', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'region': {
        type: Sequelize.STRING(100),
      },
      'city': {
        type: Sequelize.STRING(100),
      },
      'province': {
        type: Sequelize.STRING(100),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'parent_territory_id': {
        type: Sequelize.UUID,
      },
      'manager_id': {
        type: Sequelize.UUID,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sfa_leads', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'lead_number': {
        type: Sequelize.STRING(20),
      },
      'company_name': {
        type: Sequelize.STRING(200),
      },
      'contact_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'contact_email': {
        type: Sequelize.STRING(200),
      },
      'contact_phone': {
        type: Sequelize.STRING(30),
      },
      'contact_title': {
        type: Sequelize.STRING(100),
      },
      'industry': {
        type: Sequelize.STRING(100),
      },
      'company_size': {
        type: Sequelize.STRING(30),
      },
      'source': {
        type: Sequelize.STRING(50),
        defaultValue: "manual",
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "new",
      },
      'priority': {
        type: Sequelize.STRING(10),
        defaultValue: "medium",
      },
      'score': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'estimated_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'city': {
        type: Sequelize.STRING(100),
      },
      'province': {
        type: Sequelize.STRING(100),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'tags': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'custom_fields': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'next_follow_up': {
        type: Sequelize.DATE,
      },
      'last_activity_at': {
        type: Sequelize.DATE,
      },
      'converted_at': {
        type: Sequelize.DATE,
      },
      'lost_reason': {
        type: Sequelize.TEXT,
      },
      'campaign_id': {
        type: Sequelize.UUID,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'campaign_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_opportunities', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
      'opportunity_number': {
        type: Sequelize.STRING(20),
      },
      'title': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'customer_name': {
        type: Sequelize.STRING(200),
      },
      'contact_name': {
        type: Sequelize.STRING(200),
      },
      'contact_email': {
        type: Sequelize.STRING(200),
      },
      'contact_phone': {
        type: Sequelize.STRING(30),
      },
      'stage': {
        type: Sequelize.STRING(30),
        defaultValue: "qualification",
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "open",
      },
      'priority': {
        type: Sequelize.STRING(10),
        defaultValue: "medium",
      },
      'probability': {
        type: Sequelize.INTEGER,
        defaultValue: 10,
      },
      'expected_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'actual_value': {
        type: Sequelize.DECIMAL,
      },
      'expected_close_date': {
        type: Sequelize.DATEONLY,
      },
      'actual_close_date': {
        type: Sequelize.DATEONLY,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'source': {
        type: Sequelize.STRING(50),
      },
      'product_interest': {
        type: Sequelize.TEXT,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'next_action': {
        type: Sequelize.STRING(200),
      },
      'next_action_date': {
        type: Sequelize.DATEONLY,
      },
      'lost_reason': {
        type: Sequelize.TEXT,
      },
      'won_reason': {
        type: Sequelize.TEXT,
      },
      'last_activity_at': {
        type: Sequelize.DATE,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_activities', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'activity_type': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'subject': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "planned",
      },
      'priority': {
        type: Sequelize.STRING(10),
        defaultValue: "medium",
      },
      'activity_date': {
        type: Sequelize.DATE,
      },
      'duration_minutes': {
        type: Sequelize.INTEGER,
      },
      'location': {
        type: Sequelize.STRING(300),
      },
      'contact_name': {
        type: Sequelize.STRING(200),
      },
      'contact_phone': {
        type: Sequelize.STRING(30),
      },
      'outcome': {
        type: Sequelize.STRING(30),
      },
      'outcome_notes': {
        type: Sequelize.TEXT,
      },
      'assigned_to': {
        type: Sequelize.INTEGER,
      },
      'completed_at': {
        type: Sequelize.DATE,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_visits', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'salesperson_id': {
        type: Sequelize.UUID,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'customer_name': {
        type: Sequelize.STRING(200),
      },
      'visit_type': {
        type: Sequelize.STRING(30),
        defaultValue: "regular",
      },
      'purpose': {
        type: Sequelize.TEXT,
      },
      'visit_date': {
        type: Sequelize.DATEONLY,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "planned",
      },
      'check_in_time': {
        type: Sequelize.DATE,
      },
      'check_in_lat': {
        type: Sequelize.DECIMAL,
      },
      'check_in_lng': {
        type: Sequelize.DECIMAL,
      },
      'check_in_address': {
        type: Sequelize.TEXT,
      },
      'check_in_photo_url': {
        type: Sequelize.TEXT,
      },
      'check_out_time': {
        type: Sequelize.DATE,
      },
      'check_out_lat': {
        type: Sequelize.DECIMAL,
      },
      'check_out_lng': {
        type: Sequelize.DECIMAL,
      },
      'check_out_address': {
        type: Sequelize.TEXT,
      },
      'check_out_photo_url': {
        type: Sequelize.TEXT,
      },
      'duration_minutes': {
        type: Sequelize.INTEGER,
      },
      'outcome': {
        type: Sequelize.STRING(30),
      },
      'outcome_notes': {
        type: Sequelize.TEXT,
      },
      'order_taken': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'order_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'feedback': {
        type: Sequelize.TEXT,
      },
      'next_visit_date': {
        type: Sequelize.DATEONLY,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_targets', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'target_type': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'period_type': {
        type: Sequelize.STRING(20),
        defaultValue: "monthly",
      },
      'period': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'assigned_to': {
        type: Sequelize.INTEGER,
      },
      'target_value': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'actual_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'achievement_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'unit': {
        type: Sequelize.STRING(20),
        defaultValue: "IDR",
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'product_category': {
        type: Sequelize.STRING(100),
      },
      'customer_segment': {
        type: Sequelize.STRING(100),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_quotations', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'quotation_number': {
        type: Sequelize.STRING(30),
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
      'customer_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'customer_email': {
        type: Sequelize.STRING(200),
      },
      'customer_phone': {
        type: Sequelize.STRING(30),
      },
      'customer_address': {
        type: Sequelize.TEXT,
      },
      'salesperson_id': {
        type: Sequelize.UUID,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'valid_until': {
        type: Sequelize.DATEONLY,
      },
      'subtotal': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'discount_type': {
        type: Sequelize.STRING(20),
        defaultValue: "amount",
      },
      'discount_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'discount_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'tax_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'total': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'terms_conditions': {
        type: Sequelize.TEXT,
      },
      'rejected_reason': {
        type: Sequelize.TEXT,
      },
      'approved_by': {
        type: Sequelize.UUID,
      },
      'approved_at': {
        type: Sequelize.DATE,
      },
      'sent_at': {
        type: Sequelize.DATE,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_quotation_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'quotation_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'product_name': {
        type: Sequelize.STRING(200),
      },
      'product_sku': {
        type: Sequelize.STRING(50),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 1,
      },
      'unit': {
        type: Sequelize.STRING(20),
        defaultValue: "pcs",
      },
      'unit_price': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'discount_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'subtotal': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'quotation_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_route_plans', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'salesperson_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'day_of_week': {
        type: Sequelize.INTEGER,
      },
      'stops': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_teams', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'team_type': {
        type: Sequelize.STRING(30),
        defaultValue: "field_force",
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'parent_team_id': {
        type: Sequelize.UUID,
      },
      'leader_id': {
        type: Sequelize.UUID,
      },
      'max_members': {
        type: Sequelize.INTEGER,
        defaultValue: 20,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'metadata': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'parent_team_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_team_members', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'team_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'user_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'role': {
        type: Sequelize.STRING(30),
        defaultValue: "member",
      },
      'position': {
        type: Sequelize.STRING(100),
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'join_date': {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'leave_date': {
        type: Sequelize.DATEONLY,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'daily_visit_target': {
        type: Sequelize.INTEGER,
        defaultValue: 8,
      },
      'monthly_revenue_target': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'metadata': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_target_groups', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'group_type': {
        type: Sequelize.STRING(30),
        defaultValue: "general",
      },
      'period_type': {
        type: Sequelize.STRING(20),
        defaultValue: "monthly",
      },
      'period': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'year': {
        type: Sequelize.INTEGER,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'total_target_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'total_achieved_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'overall_achievement_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'target_metrics': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'distribution_method': {
        type: Sequelize.STRING(30),
        defaultValue: "manual",
      },
      'auto_distribute_config': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'approved_by': {
        type: Sequelize.UUID,
      },
      'approved_at': {
        type: Sequelize.DATE,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_target_assignments', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'target_group_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'assigned_to': {
        type: Sequelize.INTEGER,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'assignment_type': {
        type: Sequelize.STRING(20),
        defaultValue: "individual",
      },
      'revenue_target': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'revenue_achieved': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'revenue_achievement_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'volume_target': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'volume_achieved': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'volume_unit': {
        type: Sequelize.STRING(20),
        defaultValue: "pcs",
      },
      'volume_achievement_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'visit_target': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'visit_achieved': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'visit_achievement_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'new_customer_target': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'new_customer_achieved': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'effective_call_target': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'effective_call_achieved': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'collection_target': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'collection_achieved': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'weighted_achievement': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'weight_config': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'target_group_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_target_products', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'target_assignment_id': {
        type: Sequelize.UUID,
      },
      'target_group_id': {
        type: Sequelize.UUID,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'assigned_to': {
        type: Sequelize.INTEGER,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'product_name': {
        type: Sequelize.STRING(200),
      },
      'product_sku': {
        type: Sequelize.STRING(50),
      },
      'category_id': {
        type: Sequelize.UUID,
      },
      'category_name': {
        type: Sequelize.STRING(100),
      },
      'target_type': {
        type: Sequelize.STRING(20),
        defaultValue: "product",
      },
      'revenue_target': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'revenue_achieved': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'volume_target': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'volume_achieved': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'volume_unit': {
        type: Sequelize.STRING(20),
        defaultValue: "pcs",
      },
      'achievement_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'priority': {
        type: Sequelize.STRING(10),
        defaultValue: "medium",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'target_group_id': {
        type: Sequelize.UUID,
      },
      'target_assignment_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_achievements', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'target_assignment_id': {
        type: Sequelize.UUID,
      },
      'target_group_id': {
        type: Sequelize.UUID,
      },
      'user_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'period': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'year': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'total_revenue': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'total_volume': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'total_visits': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'completed_visits': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'effective_calls': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'new_customers': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_orders': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_collections': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'revenue_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'volume_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'visit_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'new_customer_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'effective_call_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'collection_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'weighted_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'rating': {
        type: Sequelize.STRING(10),
      },
      'rank_in_team': {
        type: Sequelize.INTEGER,
      },
      'rank_in_company': {
        type: Sequelize.INTEGER,
      },
      'calculated_at': {
        type: Sequelize.DATE,
      },
      'locked': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'target_assignment_id': {
        type: Sequelize.UUID,
      },
      'target_group_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_achievement_details', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'achievement_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'detail_type': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'reference_id': {
        type: Sequelize.UUID,
      },
      'reference_type': {
        type: Sequelize.STRING(30),
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'product_name': {
        type: Sequelize.STRING(200),
      },
      'category_id': {
        type: Sequelize.UUID,
      },
      'category_name': {
        type: Sequelize.STRING(100),
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'customer_name': {
        type: Sequelize.STRING(200),
      },
      'transaction_date': {
        type: Sequelize.DATEONLY,
      },
      'revenue_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'volume_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'volume_unit': {
        type: Sequelize.STRING(20),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'metadata': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'achievement_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_incentive_schemes', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'scheme_type': {
        type: Sequelize.STRING(30),
        defaultValue: "progressive",
      },
      'calculation_basis': {
        type: Sequelize.STRING(30),
        defaultValue: "achievement_pct",
      },
      'applicable_roles': {
        type: Sequelize.JSONB,
        defaultValue: ["sales_staff"],
      },
      'applicable_teams': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'applicable_territories': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'period_type': {
        type: Sequelize.STRING(20),
        defaultValue: "monthly",
      },
      'base_salary_component': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'base_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'currency': {
        type: Sequelize.STRING(10),
        defaultValue: "IDR",
      },
      'min_achievement_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'max_cap': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'overachievement_multiplier': {
        type: Sequelize.DECIMAL,
        defaultValue: 1.5,
      },
      'underachievement_penalty': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'has_product_incentive': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'product_incentive_config': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'has_new_customer_bonus': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'new_customer_bonus_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'has_visit_bonus': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'visit_bonus_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'has_collection_bonus': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'collection_bonus_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'effective_from': {
        type: Sequelize.DATEONLY,
      },
      'effective_to': {
        type: Sequelize.DATEONLY,
      },
      'approved_by': {
        type: Sequelize.UUID,
      },
      'approved_at': {
        type: Sequelize.DATE,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sfa_incentive_tiers', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'scheme_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'tier_name': {
        type: Sequelize.STRING(50),
      },
      'min_achievement': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'max_achievement': {
        type: Sequelize.DECIMAL,
        defaultValue: 999,
      },
      'incentive_type': {
        type: Sequelize.STRING(20),
        defaultValue: "percentage",
      },
      'incentive_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'flat_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'multiplier': {
        type: Sequelize.DECIMAL,
        defaultValue: 1,
      },
      'bonus_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'bonus_description': {
        type: Sequelize.STRING(200),
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'scheme_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_incentive_calculations', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'scheme_id': {
        type: Sequelize.UUID,
      },
      'achievement_id': {
        type: Sequelize.UUID,
      },
      'user_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'period': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'year': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'achievement_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'tier_name': {
        type: Sequelize.STRING(50),
      },
      'base_incentive': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'achievement_incentive': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'product_incentive': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'new_customer_bonus': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'visit_bonus': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'collection_bonus': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'overachievement_bonus': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'special_bonus': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'penalty_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'gross_incentive': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'deductions': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'net_incentive': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'calculated_at': {
        type: Sequelize.DATE,
      },
      'approved_by': {
        type: Sequelize.UUID,
      },
      'approved_at': {
        type: Sequelize.DATE,
      },
      'paid_at': {
        type: Sequelize.DATE,
      },
      'payment_reference': {
        type: Sequelize.STRING(100),
      },
      'calculation_detail': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'scheme_id': {
        type: Sequelize.UUID,
      },
      'achievement_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_plafon', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'plafon_type': {
        type: Sequelize.STRING(30),
        defaultValue: "customer",
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'customer_name': {
        type: Sequelize.STRING(200),
      },
      'user_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'credit_limit': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'used_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'available_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'currency': {
        type: Sequelize.STRING(10),
        defaultValue: "IDR",
      },
      'payment_terms': {
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      'max_overdue_days': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'max_outstanding_invoices': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'risk_level': {
        type: Sequelize.STRING(20),
        defaultValue: "low",
      },
      'risk_score': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'effective_from': {
        type: Sequelize.DATEONLY,
      },
      'effective_to': {
        type: Sequelize.DATEONLY,
      },
      'last_reviewed_at': {
        type: Sequelize.DATE,
      },
      'reviewed_by': {
        type: Sequelize.UUID,
      },
      'auto_adjust': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'auto_adjust_config': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_plafon_usage', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'plafon_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'transaction_type': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'reference_id': {
        type: Sequelize.UUID,
      },
      'reference_number': {
        type: Sequelize.STRING(50),
      },
      'amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'running_balance': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'transaction_date': {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'due_date': {
        type: Sequelize.DATEONLY,
      },
      'is_overdue': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'paid_at': {
        type: Sequelize.DATE,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'plafon_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_parameters', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'category': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'param_key': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'param_value': {
        type: Sequelize.TEXT,
      },
      'value_type': {
        type: Sequelize.STRING(20),
        defaultValue: "string",
      },
      'label': {
        type: Sequelize.STRING(200),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'is_editable': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'display_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'options': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sfa_coverage_plans', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'customer_class': {
        type: Sequelize.STRING(30),
        defaultValue: "general",
      },
      'visit_frequency': {
        type: Sequelize.STRING(20),
        defaultValue: "weekly",
      },
      'visits_per_period': {
        type: Sequelize.INTEGER,
        defaultValue: 4,
      },
      'min_visit_duration': {
        type: Sequelize.INTEGER,
        defaultValue: 15,
      },
      'required_activities': {
        type: Sequelize.JSONB,
        defaultValue: ["order_taking"],
      },
      'priority': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sfa_coverage_assignments', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'coverage_plan_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'customer_name': {
        type: Sequelize.STRING(200),
      },
      'customer_class': {
        type: Sequelize.STRING(30),
        defaultValue: "general",
      },
      'assigned_to': {
        type: Sequelize.INTEGER,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'visit_day': {
        type: Sequelize.STRING(10),
      },
      'visit_week': {
        type: Sequelize.INTEGER,
      },
      'visit_frequency': {
        type: Sequelize.STRING(20),
        defaultValue: "weekly",
      },
      'last_visit_date': {
        type: Sequelize.DATEONLY,
      },
      'next_planned_visit': {
        type: Sequelize.DATEONLY,
      },
      'total_visits_planned': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_visits_actual': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'compliance_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'customer_address': {
        type: Sequelize.TEXT,
      },
      'customer_lat': {
        type: Sequelize.DECIMAL,
      },
      'customer_lng': {
        type: Sequelize.DECIMAL,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'coverage_plan_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_field_orders', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'order_number': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'visit_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'customer_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'customer_address': {
        type: Sequelize.TEXT,
      },
      'salesperson_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'order_date': {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'delivery_date': {
        type: Sequelize.DATEONLY,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'payment_method': {
        type: Sequelize.STRING(30),
        defaultValue: "credit",
      },
      'payment_terms': {
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      'subtotal': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'discount_type': {
        type: Sequelize.STRING(20),
        defaultValue: "amount",
      },
      'discount_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'discount_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'tax_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'total': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'signature_url': {
        type: Sequelize.TEXT,
      },
      'photo_url': {
        type: Sequelize.TEXT,
      },
      'lat': {
        type: Sequelize.DECIMAL,
      },
      'lng': {
        type: Sequelize.DECIMAL,
      },
      'synced_to_so': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'so_reference': {
        type: Sequelize.STRING(30),
      },
      'approved_by': {
        type: Sequelize.UUID,
      },
      'approved_at': {
        type: Sequelize.DATE,
      },
      'rejected_reason': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'visit_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_field_order_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'field_order_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'product_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'product_sku': {
        type: Sequelize.STRING(50),
      },
      'category_name': {
        type: Sequelize.STRING(100),
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 1,
      },
      'unit': {
        type: Sequelize.STRING(20),
        defaultValue: "pcs",
      },
      'unit_price': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'discount_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'discount_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'tax_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'subtotal': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'commission_rate': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'commission_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'field_order_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_display_audits', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'visit_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'customer_name': {
        type: Sequelize.STRING(200),
      },
      'salesperson_id': {
        type: Sequelize.UUID,
      },
      'audit_date': {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'store_type': {
        type: Sequelize.STRING(30),
      },
      'overall_score': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'compliance_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'total_items': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'compliant_items': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'photo_before_url': {
        type: Sequelize.TEXT,
      },
      'photo_after_url': {
        type: Sequelize.TEXT,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "submitted",
      },
      'reviewed_by': {
        type: Sequelize.UUID,
      },
      'reviewed_at': {
        type: Sequelize.DATE,
      },
      'lat': {
        type: Sequelize.DECIMAL,
      },
      'lng': {
        type: Sequelize.DECIMAL,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'visit_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_display_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'audit_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'category': {
        type: Sequelize.STRING(50),
      },
      'check_item': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'is_compliant': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'score': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'max_score': {
        type: Sequelize.DECIMAL,
        defaultValue: 10,
      },
      'facing_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'shelf_position': {
        type: Sequelize.STRING(30),
      },
      'photo_url': {
        type: Sequelize.TEXT,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'audit_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_competitor_activities', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'visit_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'customer_name': {
        type: Sequelize.STRING(200),
      },
      'salesperson_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'reported_date': {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'competitor_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'competitor_brand': {
        type: Sequelize.STRING(200),
      },
      'activity_type': {
        type: Sequelize.STRING(30),
        defaultValue: "promotion",
      },
      'product_category': {
        type: Sequelize.STRING(100),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'competitor_price': {
        type: Sequelize.DECIMAL,
      },
      'our_price': {
        type: Sequelize.DECIMAL,
      },
      'price_difference': {
        type: Sequelize.DECIMAL,
      },
      'promo_type': {
        type: Sequelize.STRING(50),
      },
      'promo_detail': {
        type: Sequelize.TEXT,
      },
      'display_quality': {
        type: Sequelize.STRING(20),
      },
      'stock_availability': {
        type: Sequelize.STRING(20),
      },
      'estimated_market_share': {
        type: Sequelize.DECIMAL,
      },
      'photo_url': {
        type: Sequelize.TEXT,
      },
      'impact_level': {
        type: Sequelize.STRING(10),
        defaultValue: "medium",
      },
      'action_required': {
        type: Sequelize.TEXT,
      },
      'action_taken': {
        type: Sequelize.TEXT,
      },
      'resolved': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'tags': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'visit_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_survey_templates', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'title': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'survey_type': {
        type: Sequelize.STRING(30),
        defaultValue: "general",
      },
      'target_audience': {
        type: Sequelize.STRING(30),
        defaultValue: "customer",
      },
      'is_required': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'trigger_event': {
        type: Sequelize.STRING(30),
      },
      'question_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'estimated_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 5,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'valid_from': {
        type: Sequelize.DATEONLY,
      },
      'valid_to': {
        type: Sequelize.DATEONLY,
      },
      'metadata': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sfa_survey_questions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'template_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'question_text': {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      'question_type': {
        type: Sequelize.STRING(20),
        defaultValue: "text",
      },
      'is_required': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'options': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'min_value': {
        type: Sequelize.DECIMAL,
      },
      'max_value': {
        type: Sequelize.DECIMAL,
      },
      'placeholder': {
        type: Sequelize.TEXT,
      },
      'help_text': {
        type: Sequelize.TEXT,
      },
      'validation_rule': {
        type: Sequelize.TEXT,
      },
      'conditional_on': {
        type: Sequelize.UUID,
      },
      'conditional_value': {
        type: Sequelize.TEXT,
      },
      'section': {
        type: Sequelize.STRING(100),
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'template_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_survey_responses', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'template_id': {
        type: Sequelize.UUID,
      },
      'visit_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'customer_name': {
        type: Sequelize.STRING(200),
      },
      'respondent_id': {
        type: Sequelize.UUID,
      },
      'response_date': {
        type: Sequelize.DATEONLY,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'answers': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'score': {
        type: Sequelize.DECIMAL,
      },
      'completion_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 100,
      },
      'duration_seconds': {
        type: Sequelize.INTEGER,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "completed",
      },
      'lat': {
        type: Sequelize.DECIMAL,
      },
      'lng': {
        type: Sequelize.DECIMAL,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'template_id': {
        type: Sequelize.UUID,
      },
      'visit_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_approval_workflows', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'entity_type': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'condition_rules': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'total_steps': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sfa_approval_steps', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'workflow_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'step_number': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'step_name': {
        type: Sequelize.STRING(100),
      },
      'approver_type': {
        type: Sequelize.STRING(20),
        defaultValue: "role",
      },
      'approver_role': {
        type: Sequelize.STRING(50),
      },
      'approver_user_id': {
        type: Sequelize.UUID,
      },
      'auto_approve_after_hours': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'can_reject': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'can_delegate': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'notify_on_pending': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'notify_channels': {
        type: Sequelize.JSONB,
        defaultValue: ["email","app"],
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'workflow_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_approval_requests', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'workflow_id': {
        type: Sequelize.UUID,
      },
      'entity_type': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'entity_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'entity_number': {
        type: Sequelize.STRING(50),
      },
      'entity_summary': {
        type: Sequelize.TEXT,
      },
      'requested_by': {
        type: Sequelize.UUID,
      },
      'requested_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'current_step': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'total_steps': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "pending",
      },
      'approval_history': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'current_approver_id': {
        type: Sequelize.UUID,
      },
      'current_approver_role': {
        type: Sequelize.STRING(50),
      },
      'final_status': {
        type: Sequelize.STRING(20),
      },
      'completed_at': {
        type: Sequelize.DATE,
      },
      'rejected_by': {
        type: Sequelize.UUID,
      },
      'rejected_reason': {
        type: Sequelize.TEXT,
      },
      'amount': {
        type: Sequelize.DECIMAL,
      },
      'priority': {
        type: Sequelize.STRING(10),
        defaultValue: "normal",
      },
      'due_date': {
        type: Sequelize.DATEONLY,
      },
      'metadata': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'workflow_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_geofences', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'fence_type': {
        type: Sequelize.STRING(20),
        defaultValue: "circle",
      },
      'center_lat': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'center_lng': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'radius_meters': {
        type: Sequelize.INTEGER,
        defaultValue: 200,
      },
      'polygon_coords': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'reference_type': {
        type: Sequelize.STRING(30),
      },
      'reference_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'alert_on_enter': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'alert_on_exit': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_product_commissions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'product_name': {
        type: Sequelize.STRING(200),
      },
      'product_sku': {
        type: Sequelize.STRING(50),
      },
      'category_id': {
        type: Sequelize.UUID,
      },
      'category_name': {
        type: Sequelize.STRING(100),
      },
      'commission_type': {
        type: Sequelize.STRING(20),
        defaultValue: "percentage",
      },
      'commission_rate': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'flat_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'min_quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'bonus_rate': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'bonus_threshold': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'applicable_teams': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'applicable_roles': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'effective_from': {
        type: Sequelize.DATEONLY,
      },
      'effective_to': {
        type: Sequelize.DATEONLY,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'priority': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sfa_commission_groups', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(30),
      },
      'name': {
        type: Sequelize.STRING(200),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'group_type': {
        type: Sequelize.STRING(30),
        defaultValue: "bundle",
      },
      'calculation_method': {
        type: Sequelize.STRING(20),
        defaultValue: "flat",
      },
      'bonus_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'bonus_percentage': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'min_total_quantity': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'min_total_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'period_type': {
        type: Sequelize.STRING(20),
        defaultValue: "monthly",
      },
      'effective_from': {
        type: Sequelize.DATEONLY,
      },
      'effective_to': {
        type: Sequelize.DATEONLY,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'priority': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sfa_commission_group_products', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'group_id': {
        type: Sequelize.UUID,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'product_name': {
        type: Sequelize.STRING(200),
      },
      'product_sku': {
        type: Sequelize.STRING(50),
      },
      'min_quantity': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'weight': {
        type: Sequelize.DECIMAL,
        defaultValue: 1,
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'group_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('sfa_outlet_targets', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(30),
      },
      'name': {
        type: Sequelize.STRING(200),
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'product_name': {
        type: Sequelize.STRING(200),
      },
      'product_sku': {
        type: Sequelize.STRING(50),
      },
      'target_type': {
        type: Sequelize.STRING(30),
        defaultValue: "outlet_count",
      },
      'target_value': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'achieved_value': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'achievement_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'period_type': {
        type: Sequelize.STRING(20),
        defaultValue: "monthly",
      },
      'period': {
        type: Sequelize.STRING(10),
      },
      'year': {
        type: Sequelize.INTEGER,
      },
      'bronze_threshold_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 60,
      },
      'silver_threshold_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 80,
      },
      'gold_threshold_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 100,
      },
      'platinum_threshold_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 120,
      },
      'bronze_bonus': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'silver_bonus': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'gold_bonus': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'platinum_bonus': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'assigned_to': {
        type: Sequelize.INTEGER,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sfa_sales_strategies', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(30),
      },
      'name': {
        type: Sequelize.STRING(200),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'strategy_type': {
        type: Sequelize.STRING(30),
        defaultValue: "balanced",
      },
      'period_type': {
        type: Sequelize.STRING(20),
        defaultValue: "monthly",
      },
      'period': {
        type: Sequelize.STRING(10),
      },
      'year': {
        type: Sequelize.INTEGER,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'total_weight': {
        type: Sequelize.DECIMAL,
        defaultValue: 100,
      },
      'overall_target': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'overall_achieved': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'overall_score': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'kpi_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'assigned_teams': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'assigned_users': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('sfa_strategy_kpis', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'strategy_id': {
        type: Sequelize.UUID,
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'kpi_code': {
        type: Sequelize.STRING(30),
      },
      'kpi_name': {
        type: Sequelize.STRING(200),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'kpi_type': {
        type: Sequelize.STRING(30),
      },
      'target_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'achieved_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'achievement_pct': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'unit': {
        type: Sequelize.STRING(30),
        defaultValue: "",
      },
      'weight': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'scoring_method': {
        type: Sequelize.STRING(20),
        defaultValue: "linear",
      },
      'threshold_bronze': {
        type: Sequelize.DECIMAL,
        defaultValue: 60,
      },
      'threshold_silver': {
        type: Sequelize.DECIMAL,
        defaultValue: 80,
      },
      'threshold_gold': {
        type: Sequelize.DECIMAL,
        defaultValue: 100,
      },
      'threshold_platinum': {
        type: Sequelize.DECIMAL,
        defaultValue: 120,
      },
      'multiplier_bronze': {
        type: Sequelize.DECIMAL,
        defaultValue: 0.6,
      },
      'multiplier_silver': {
        type: Sequelize.DECIMAL,
        defaultValue: 0.8,
      },
      'multiplier_gold': {
        type: Sequelize.DECIMAL,
        defaultValue: 1,
      },
      'multiplier_platinum': {
        type: Sequelize.DECIMAL,
        defaultValue: 1.5,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'strategy_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('mkt_campaigns', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'campaign_number': {
        type: Sequelize.STRING(30),
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'objective': {
        type: Sequelize.STRING(50),
        defaultValue: "brand_awareness",
      },
      'campaign_type': {
        type: Sequelize.STRING(30),
        defaultValue: "multi_channel",
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'priority': {
        type: Sequelize.STRING(10),
        defaultValue: "medium",
      },
      'start_date': {
        type: Sequelize.DATEONLY,
      },
      'end_date': {
        type: Sequelize.DATEONLY,
      },
      'budget': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'spent': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'target_audience': {
        type: Sequelize.TEXT,
      },
      'target_reach': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'actual_reach': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'target_conversions': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'actual_conversions': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'target_revenue': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'actual_revenue': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'roi': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'tags': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'branch_ids': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'territory_ids': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mkt_campaign_channels', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'campaign_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'channel_type': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'channel_name': {
        type: Sequelize.STRING(100),
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'budget_allocated': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'spent': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'impressions': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'clicks': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'conversions': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'revenue_generated': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'ctr': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'cpc': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'cpa': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'content': {
        type: Sequelize.TEXT,
      },
      'content_url': {
        type: Sequelize.TEXT,
      },
      'schedule': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'metadata': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'campaign_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('mkt_segments', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'code': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'segment_type': {
        type: Sequelize.STRING(20),
        defaultValue: "static",
      },
      'criteria': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'customer_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'tags': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'auto_refresh': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'refresh_frequency': {
        type: Sequelize.STRING(20),
        defaultValue: "weekly",
      },
      'last_refreshed_at': {
        type: Sequelize.DATE,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mkt_segment_rules', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'segment_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'rule_group': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'field': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'operator': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'value': {
        type: Sequelize.TEXT,
      },
      'value_type': {
        type: Sequelize.STRING(20),
        defaultValue: "string",
      },
      'logic_operator': {
        type: Sequelize.STRING(5),
        defaultValue: "AND",
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'segment_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('mkt_promotions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'campaign_id': {
        type: Sequelize.UUID,
      },
      'promo_code': {
        type: Sequelize.STRING(30),
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'promo_type': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'discount_type': {
        type: Sequelize.STRING(20),
        defaultValue: "percentage",
      },
      'discount_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'min_purchase': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'max_discount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'buy_quantity': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'get_quantity': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'start_date': {
        type: Sequelize.DATE,
      },
      'end_date': {
        type: Sequelize.DATE,
      },
      'usage_limit': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'usage_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'per_customer_limit': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'applicable_branches': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'applicable_segments': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'applicable_products': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'applicable_categories': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'exclude_products': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'terms': {
        type: Sequelize.TEXT,
      },
      'is_stackable': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'priority': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'auto_apply': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'campaign_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('mkt_promotion_usage', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'promotion_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'order_id': {
        type: Sequelize.UUID,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'discount_applied': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'order_total': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'promotion_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('mkt_content_assets', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'campaign_id': {
        type: Sequelize.UUID,
      },
      'title': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'asset_type': {
        type: Sequelize.STRING(30),
        defaultValue: "image",
      },
      'file_url': {
        type: Sequelize.TEXT,
      },
      'file_name': {
        type: Sequelize.STRING(200),
      },
      'file_size': {
        type: Sequelize.INTEGER,
      },
      'mime_type': {
        type: Sequelize.STRING(100),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'tags': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'campaign_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('mkt_budgets', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'period_type': {
        type: Sequelize.STRING(20),
        defaultValue: "monthly",
      },
      'period': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'total_budget': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'allocated': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'spent': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'remaining': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mkt_budget_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'budget_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'campaign_id': {
        type: Sequelize.UUID,
      },
      'category': {
        type: Sequelize.STRING(50),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'allocated_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'spent_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'budget_id': {
        type: Sequelize.UUID,
      },
      'campaign_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('mkt_campaign_audiences', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'campaign_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'segment_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'sent_at': {
        type: Sequelize.DATE,
      },
      'opened_at': {
        type: Sequelize.DATE,
      },
      'clicked_at': {
        type: Sequelize.DATE,
      },
      'converted_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'campaign_id': {
        type: Sequelize.UUID,
      },
      'segment_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_customers', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'customer_number': {
        type: Sequelize.STRING(30),
      },
      'company_name': {
        type: Sequelize.STRING(300),
      },
      'display_name': {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      'customer_type': {
        type: Sequelize.STRING(30),
        defaultValue: "company",
      },
      'industry': {
        type: Sequelize.STRING(100),
      },
      'company_size': {
        type: Sequelize.STRING(30),
      },
      'website': {
        type: Sequelize.STRING(300),
      },
      'address': {
        type: Sequelize.TEXT,
      },
      'city': {
        type: Sequelize.STRING(100),
      },
      'province': {
        type: Sequelize.STRING(100),
      },
      'postal_code': {
        type: Sequelize.STRING(10),
      },
      'country': {
        type: Sequelize.STRING(60),
        defaultValue: "Indonesia",
      },
      'latitude': {
        type: Sequelize.DECIMAL,
      },
      'longitude': {
        type: Sequelize.DECIMAL,
      },
      'lifecycle_stage': {
        type: Sequelize.STRING(30),
        defaultValue: "prospect",
      },
      'customer_status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'acquisition_source': {
        type: Sequelize.STRING(50),
      },
      'acquisition_date': {
        type: Sequelize.DATEONLY,
      },
      'health_score': {
        type: Sequelize.INTEGER,
        defaultValue: 50,
      },
      'engagement_score': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'ltv': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'segment': {
        type: Sequelize.STRING(50),
      },
      'tier': {
        type: Sequelize.STRING(30),
      },
      'tags': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'custom_fields': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'credit_limit': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'payment_terms': {
        type: Sequelize.STRING(50),
      },
      'tax_id': {
        type: Sequelize.STRING(30),
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'assigned_to': {
        type: Sequelize.INTEGER,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
      'total_revenue': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'total_orders': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'last_order_date': {
        type: Sequelize.DATEONLY,
      },
      'last_interaction_date': {
        type: Sequelize.DATE,
      },
      'avg_order_value': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'updated_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'territory_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_contacts', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'first_name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'last_name': {
        type: Sequelize.STRING(100),
      },
      'title': {
        type: Sequelize.STRING(100),
      },
      'department': {
        type: Sequelize.STRING(100),
      },
      'email': {
        type: Sequelize.STRING(200),
      },
      'phone': {
        type: Sequelize.STRING(30),
      },
      'mobile': {
        type: Sequelize.STRING(30),
      },
      'whatsapp': {
        type: Sequelize.STRING(30),
      },
      'is_primary': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'is_decision_maker': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'role_in_deal': {
        type: Sequelize.STRING(50),
      },
      'communication_preference': {
        type: Sequelize.STRING(30),
        defaultValue: "email",
      },
      'birthday': {
        type: Sequelize.DATEONLY,
      },
      'social_linkedin': {
        type: Sequelize.STRING(200),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'tags': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_interactions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'contact_id': {
        type: Sequelize.UUID,
      },
      'interaction_type': {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      'direction': {
        type: Sequelize.STRING(10),
      },
      'subject': {
        type: Sequelize.STRING(300),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'outcome': {
        type: Sequelize.STRING(50),
      },
      'duration_minutes': {
        type: Sequelize.INTEGER,
      },
      'interaction_date': {
        type: Sequelize.DATE,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'ticket_id': {
        type: Sequelize.UUID,
      },
      'sentiment': {
        type: Sequelize.STRING(20),
      },
      'sentiment_score': {
        type: Sequelize.DECIMAL,
      },
      'channel': {
        type: Sequelize.STRING(30),
      },
      'metadata': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'attachments': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'contact_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_customer_segments', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'code': {
        type: Sequelize.STRING(30),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'segment_type': {
        type: Sequelize.STRING(30),
        defaultValue: "static",
      },
      'rules': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'rfm_recency_weight': {
        type: Sequelize.DECIMAL,
        defaultValue: 0.33,
      },
      'rfm_frequency_weight': {
        type: Sequelize.DECIMAL,
        defaultValue: 0.33,
      },
      'rfm_monetary_weight': {
        type: Sequelize.DECIMAL,
        defaultValue: 0.34,
      },
      'customer_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_revenue': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'avg_health_score': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'color': {
        type: Sequelize.STRING(10),
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'last_refreshed_at': {
        type: Sequelize.DATE,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('crm_customer_tags', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'color': {
        type: Sequelize.STRING(10),
        defaultValue: "#6366f1",
      },
      'category': {
        type: Sequelize.STRING(50),
      },
      'usage_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('crm_communications', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'comm_number': {
        type: Sequelize.STRING(30),
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'contact_id': {
        type: Sequelize.UUID,
      },
      'comm_type': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'direction': {
        type: Sequelize.STRING(10),
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "completed",
      },
      'subject': {
        type: Sequelize.STRING(300),
      },
      'body': {
        type: Sequelize.TEXT,
      },
      'call_duration': {
        type: Sequelize.INTEGER,
      },
      'call_recording_url': {
        type: Sequelize.STRING(500),
      },
      'email_from': {
        type: Sequelize.STRING(200),
      },
      'email_to': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'email_cc': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'email_opened': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'email_clicked': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'meeting_location': {
        type: Sequelize.STRING(300),
      },
      'meeting_start': {
        type: Sequelize.DATE,
      },
      'meeting_end': {
        type: Sequelize.DATE,
      },
      'meeting_attendees': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'campaign_id': {
        type: Sequelize.UUID,
      },
      'template_id': {
        type: Sequelize.UUID,
      },
      'outcome': {
        type: Sequelize.STRING(50),
      },
      'next_action': {
        type: Sequelize.STRING(200),
      },
      'attachments': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'metadata': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'scheduled_at': {
        type: Sequelize.DATE,
      },
      'completed_at': {
        type: Sequelize.DATE,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'contact_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_follow_ups', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'contact_id': {
        type: Sequelize.UUID,
      },
      'title': {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'follow_up_type': {
        type: Sequelize.STRING(30),
      },
      'priority': {
        type: Sequelize.STRING(10),
        defaultValue: "medium",
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "pending",
      },
      'due_date': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'completed_date': {
        type: Sequelize.DATE,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'communication_id': {
        type: Sequelize.UUID,
      },
      'assigned_to': {
        type: Sequelize.INTEGER,
      },
      'reminder_sent': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'reminder_minutes_before': {
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_email_templates', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'category': {
        type: Sequelize.STRING(50),
      },
      'subject': {
        type: Sequelize.STRING(300),
      },
      'body_html': {
        type: Sequelize.TEXT,
      },
      'body_text': {
        type: Sequelize.TEXT,
      },
      'variables': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'channel': {
        type: Sequelize.STRING(20),
        defaultValue: "email",
      },
      'usage_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'open_rate': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'click_rate': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('crm_comm_campaigns', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'campaign_type': {
        type: Sequelize.STRING(30),
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'template_id': {
        type: Sequelize.UUID,
      },
      'segment_id': {
        type: Sequelize.UUID,
      },
      'scheduled_start': {
        type: Sequelize.DATE,
      },
      'scheduled_end': {
        type: Sequelize.DATE,
      },
      'total_recipients': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_sent': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_opened': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_clicked': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_replied': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_bounced': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'settings': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('crm_tasks', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'task_number': {
        type: Sequelize.STRING(20),
      },
      'title': {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'task_type': {
        type: Sequelize.STRING(30),
      },
      'priority': {
        type: Sequelize.STRING(10),
        defaultValue: "medium",
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "open",
      },
      'due_date': {
        type: Sequelize.DATE,
      },
      'start_date': {
        type: Sequelize.DATE,
      },
      'completed_date': {
        type: Sequelize.DATE,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'contact_id': {
        type: Sequelize.UUID,
      },
      'lead_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'ticket_id': {
        type: Sequelize.UUID,
      },
      'assigned_to': {
        type: Sequelize.INTEGER,
      },
      'assigned_team': {
        type: Sequelize.UUID,
      },
      'is_recurring': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'recurrence_pattern': {
        type: Sequelize.JSONB,
      },
      'parent_task_id': {
        type: Sequelize.UUID,
      },
      'estimated_hours': {
        type: Sequelize.DECIMAL,
      },
      'actual_hours': {
        type: Sequelize.DECIMAL,
      },
      'tags': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'checklist': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'result': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'contact_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_task_templates', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'task_type': {
        type: Sequelize.STRING(30),
      },
      'default_priority': {
        type: Sequelize.STRING(10),
        defaultValue: "medium",
      },
      'due_days_offset': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'checklist_template': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'auto_assign_role': {
        type: Sequelize.STRING(50),
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'usage_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('crm_calendar_events', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'title': {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'event_type': {
        type: Sequelize.STRING(30),
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "scheduled",
      },
      'start_time': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'end_time': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'all_day': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'timezone': {
        type: Sequelize.STRING(50),
        defaultValue: "Asia/Jakarta",
      },
      'location': {
        type: Sequelize.STRING(300),
      },
      'is_virtual': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'meeting_url': {
        type: Sequelize.STRING(500),
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'contact_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'task_id': {
        type: Sequelize.UUID,
      },
      'organizer_id': {
        type: Sequelize.UUID,
      },
      'attendees': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'is_recurring': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'recurrence_rule': {
        type: Sequelize.JSONB,
      },
      'reminders': {
        type: Sequelize.JSONB,
        defaultValue: [{"minutes":15}],
      },
      'outcome': {
        type: Sequelize.TEXT,
      },
      'color': {
        type: Sequelize.STRING(10),
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_forecasts', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'forecast_period': {
        type: Sequelize.STRING(20),
      },
      'period_start': {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      'period_end': {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'target_revenue': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'target_deals': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'target_new_customers': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'actual_revenue': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'actual_deals': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'actual_new_customers': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'best_case': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'most_likely': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'worst_case': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'accuracy_score': {
        type: Sequelize.DECIMAL,
      },
      'owner_id': {
        type: Sequelize.UUID,
      },
      'team_id': {
        type: Sequelize.UUID,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('crm_forecast_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'forecast_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'description': {
        type: Sequelize.STRING(300),
      },
      'forecast_category': {
        type: Sequelize.STRING(30),
      },
      'amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'probability': {
        type: Sequelize.INTEGER,
        defaultValue: 50,
      },
      'weighted_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'expected_close_date': {
        type: Sequelize.DATEONLY,
      },
      'stage': {
        type: Sequelize.STRING(30),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'forecast_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_deal_scores', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'engagement_score': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'fit_score': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'behavior_score': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'timing_score': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'overall_score': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'positive_signals': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'negative_signals': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'recommendations': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'win_probability': {
        type: Sequelize.DECIMAL,
      },
      'risk_level': {
        type: Sequelize.STRING(10),
      },
      'risk_factors': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'score_date': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('crm_tickets', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'ticket_number': {
        type: Sequelize.STRING(20),
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'contact_id': {
        type: Sequelize.UUID,
      },
      'subject': {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'category': {
        type: Sequelize.STRING(50),
      },
      'subcategory': {
        type: Sequelize.STRING(50),
      },
      'priority': {
        type: Sequelize.STRING(10),
        defaultValue: "medium",
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "open",
      },
      'severity': {
        type: Sequelize.STRING(10),
      },
      'source_channel': {
        type: Sequelize.STRING(20),
      },
      'assigned_to': {
        type: Sequelize.INTEGER,
      },
      'assigned_team': {
        type: Sequelize.UUID,
      },
      'escalation_level': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'sla_policy_id': {
        type: Sequelize.UUID,
      },
      'first_response_due': {
        type: Sequelize.DATE,
      },
      'first_response_at': {
        type: Sequelize.DATE,
      },
      'resolution_due': {
        type: Sequelize.DATE,
      },
      'resolved_at': {
        type: Sequelize.DATE,
      },
      'sla_breached': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'resolution': {
        type: Sequelize.TEXT,
      },
      'resolution_type': {
        type: Sequelize.STRING(30),
      },
      'satisfaction_rating': {
        type: Sequelize.INTEGER,
      },
      'satisfaction_comment': {
        type: Sequelize.TEXT,
      },
      'tags': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'attachments': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'related_ticket_id': {
        type: Sequelize.UUID,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'closed_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'sla_policy_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_ticket_comments', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'ticket_id': {
        type: Sequelize.UUID,
      },
      'comment_type': {
        type: Sequelize.STRING(20),
        defaultValue: "reply",
      },
      'body': {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      'is_public': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'attachments': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'ticket_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_sla_policies', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'first_response_critical': {
        type: Sequelize.INTEGER,
        defaultValue: 30,
      },
      'first_response_major': {
        type: Sequelize.INTEGER,
        defaultValue: 120,
      },
      'first_response_minor': {
        type: Sequelize.INTEGER,
        defaultValue: 480,
      },
      'resolution_critical': {
        type: Sequelize.INTEGER,
        defaultValue: 240,
      },
      'resolution_major': {
        type: Sequelize.INTEGER,
        defaultValue: 1440,
      },
      'resolution_minor': {
        type: Sequelize.INTEGER,
        defaultValue: 2880,
      },
      'escalation_rules': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'business_hours': {
        type: Sequelize.JSONB,
        defaultValue: {"start":"08:00","end":"17:00","days":[1,2,3,4,5]},
      },
      'applies_to_segments': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'applies_to_categories': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'is_default': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('crm_satisfaction', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'survey_type': {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      'score': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'comment': {
        type: Sequelize.TEXT,
      },
      'trigger_event': {
        type: Sequelize.STRING(30),
      },
      'related_ticket_id': {
        type: Sequelize.UUID,
      },
      'related_order_id': {
        type: Sequelize.UUID,
      },
      'channel': {
        type: Sequelize.STRING(20),
      },
      'response_date': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_automation_rules', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'rule_type': {
        type: Sequelize.STRING(30),
      },
      'trigger_event': {
        type: Sequelize.STRING(50),
      },
      'trigger_entity': {
        type: Sequelize.STRING(30),
      },
      'trigger_conditions': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'actions': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'schedule_cron': {
        type: Sequelize.STRING(50),
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'execution_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'last_executed_at': {
        type: Sequelize.DATE,
      },
      'error_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'priority': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'stop_on_match': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('crm_automation_logs', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'rule_id': {
        type: Sequelize.UUID,
      },
      'trigger_event': {
        type: Sequelize.STRING(50),
      },
      'entity_type': {
        type: Sequelize.STRING(30),
      },
      'entity_id': {
        type: Sequelize.UUID,
      },
      'status': {
        type: Sequelize.STRING(20),
      },
      'actions_executed': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'error_message': {
        type: Sequelize.TEXT,
      },
      'execution_time_ms': {
        type: Sequelize.INTEGER,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'rule_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_documents', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'document_number': {
        type: Sequelize.STRING(30),
      },
      'title': {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      'document_type': {
        type: Sequelize.STRING(30),
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'version': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'file_url': {
        type: Sequelize.STRING(500),
      },
      'file_size': {
        type: Sequelize.INTEGER,
      },
      'file_type': {
        type: Sequelize.STRING(20),
      },
      'content_html': {
        type: Sequelize.TEXT,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
      'opportunity_id': {
        type: Sequelize.UUID,
      },
      'template_id': {
        type: Sequelize.UUID,
      },
      'sent_at': {
        type: Sequelize.DATE,
      },
      'viewed_at': {
        type: Sequelize.DATE,
      },
      'signed_at': {
        type: Sequelize.DATE,
      },
      'expires_at': {
        type: Sequelize.DATE,
      },
      'view_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'total_value': {
        type: Sequelize.DECIMAL,
      },
      'tags': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'metadata': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'customer_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('crm_document_templates', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'document_type': {
        type: Sequelize.STRING(30),
      },
      'content_html': {
        type: Sequelize.TEXT,
      },
      'variables': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'usage_count': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('crm_saved_reports', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'report_type': {
        type: Sequelize.STRING(30),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'config': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'schedule': {
        type: Sequelize.JSONB,
      },
      'is_public': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'is_favorite': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'last_run_at': {
        type: Sequelize.DATE,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('crm_custom_dashboards', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'layout': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'is_default': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'is_public': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'owner_id': {
        type: Sequelize.UUID,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_work_centers', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'type': {
        type: Sequelize.STRING(50),
        defaultValue: "production",
      },
      'capacity_per_hour': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'operating_cost_per_hour': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'setup_time_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'location': {
        type: Sequelize.STRING(200),
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'manager_id': {
        type: Sequelize.UUID,
      },
      'shift_count': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'efficiency_target': {
        type: Sequelize.DECIMAL,
        defaultValue: 85,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_bom', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'bom_code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'bom_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'version': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'bom_type': {
        type: Sequelize.STRING(20),
        defaultValue: "standard",
      },
      'effective_date': {
        type: Sequelize.DATE,
      },
      'expiry_date': {
        type: Sequelize.DATE,
      },
      'base_quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 1,
      },
      'base_uom': {
        type: Sequelize.STRING(20),
        defaultValue: "pcs",
      },
      'yield_percentage': {
        type: Sequelize.DECIMAL,
        defaultValue: 100,
      },
      'routing_id': {
        type: Sequelize.UUID,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'approved_by': {
        type: Sequelize.UUID,
      },
      'approved_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_bom_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'bom_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'item_type': {
        type: Sequelize.STRING(20),
        defaultValue: "raw_material",
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'sub_bom_id': {
        type: Sequelize.UUID,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'uom': {
        type: Sequelize.STRING(20),
        defaultValue: "pcs",
      },
      'waste_percentage': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'scrap_percentage': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'is_critical': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'cost_per_unit': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'lead_time_days': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_routings', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'routing_code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'routing_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'total_time_minutes': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'total_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_routing_operations', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'routing_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'operation_number': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'operation_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'work_center_id': {
        type: Sequelize.UUID,
      },
      'setup_time_minutes': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'run_time_per_unit': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'quality_check_required': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'tools_required': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'skill_required': {
        type: Sequelize.STRING(100),
      },
      'cost_per_unit': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'sort_order': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_work_orders', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'wo_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'bom_id': {
        type: Sequelize.UUID,
      },
      'routing_id': {
        type: Sequelize.UUID,
      },
      'planned_quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'actual_quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'rejected_quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'uom': {
        type: Sequelize.STRING(20),
        defaultValue: "pcs",
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'priority': {
        type: Sequelize.STRING(20),
        defaultValue: "normal",
      },
      'planned_start': {
        type: Sequelize.DATE,
      },
      'planned_end': {
        type: Sequelize.DATE,
      },
      'actual_start': {
        type: Sequelize.DATE,
      },
      'actual_end': {
        type: Sequelize.DATE,
      },
      'work_center_id': {
        type: Sequelize.UUID,
      },
      'assigned_to': {
        type: Sequelize.INTEGER,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'parent_wo_id': {
        type: Sequelize.UUID,
      },
      'source_type': {
        type: Sequelize.STRING(20),
        defaultValue: "manual",
      },
      'source_id': {
        type: Sequelize.UUID,
      },
      'batch_number': {
        type: Sequelize.STRING(100),
      },
      'lot_number': {
        type: Sequelize.STRING(100),
      },
      'estimated_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'actual_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'yield_percentage': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'approved_by': {
        type: Sequelize.UUID,
      },
      'approved_at': {
        type: Sequelize.DATE,
      },
      'completed_by': {
        type: Sequelize.UUID,
      },
      'completed_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_wo_materials', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'work_order_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'bom_item_id': {
        type: Sequelize.UUID,
      },
      'planned_quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'issued_quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'consumed_quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'uom': {
        type: Sequelize.STRING(20),
        defaultValue: "pcs",
      },
      'cost_per_unit': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'warehouse_id': {
        type: Sequelize.UUID,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "pending",
      },
      'issued_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_wo_operations', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'work_order_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'routing_operation_id': {
        type: Sequelize.UUID,
      },
      'operation_number': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'operation_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'work_center_id': {
        type: Sequelize.UUID,
      },
      'operator_id': {
        type: Sequelize.UUID,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "pending",
      },
      'planned_start': {
        type: Sequelize.DATE,
      },
      'planned_end': {
        type: Sequelize.DATE,
      },
      'actual_start': {
        type: Sequelize.DATE,
      },
      'actual_end': {
        type: Sequelize.DATE,
      },
      'setup_time': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'run_time': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'output_quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'reject_quantity': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_wo_outputs', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'work_order_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'quality_status': {
        type: Sequelize.STRING(20),
        defaultValue: "pending",
      },
      'warehouse_id': {
        type: Sequelize.UUID,
      },
      'batch_number': {
        type: Sequelize.STRING(100),
      },
      'lot_number': {
        type: Sequelize.STRING(100),
      },
      'expiry_date': {
        type: Sequelize.DATE,
      },
      'received_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_qc_templates', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'template_code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'template_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'inspection_type': {
        type: Sequelize.STRING(20),
        defaultValue: "in_process",
      },
      'product_category': {
        type: Sequelize.STRING(100),
      },
      'parameters': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'sampling_method': {
        type: Sequelize.STRING(50),
        defaultValue: "random",
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "active",
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_qc_inspections', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'inspection_number': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'work_order_id': {
        type: Sequelize.UUID,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'template_id': {
        type: Sequelize.UUID,
      },
      'inspection_type': {
        type: Sequelize.STRING(20),
        defaultValue: "in_process",
      },
      'inspector_id': {
        type: Sequelize.UUID,
      },
      'inspection_date': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "pending",
      },
      'overall_result': {
        type: Sequelize.STRING(20),
      },
      'sample_size': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'defects_found': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'defect_rate': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'batch_number': {
        type: Sequelize.STRING(100),
      },
      'disposition': {
        type: Sequelize.STRING(20),
      },
      'corrective_action': {
        type: Sequelize.TEXT,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'completed_at': {
        type: Sequelize.DATE,
      },
      'reviewed_by': {
        type: Sequelize.UUID,
      },
      'reviewed_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_qc_results', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'inspection_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'parameter_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'parameter_type': {
        type: Sequelize.STRING(20),
        defaultValue: "numeric",
      },
      'expected_value': {
        type: Sequelize.STRING(200),
      },
      'actual_value': {
        type: Sequelize.STRING(200),
      },
      'uom': {
        type: Sequelize.STRING(20),
      },
      'min_value': {
        type: Sequelize.DECIMAL,
      },
      'max_value': {
        type: Sequelize.DECIMAL,
      },
      'result': {
        type: Sequelize.STRING(20),
      },
      'severity': {
        type: Sequelize.STRING(20),
        defaultValue: "minor",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_machines', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'machine_code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'machine_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'type': {
        type: Sequelize.STRING(50),
      },
      'manufacturer': {
        type: Sequelize.STRING(100),
      },
      'model': {
        type: Sequelize.STRING(100),
      },
      'serial_number': {
        type: Sequelize.STRING(100),
      },
      'purchase_date': {
        type: Sequelize.DATE,
      },
      'warranty_expiry': {
        type: Sequelize.DATE,
      },
      'location': {
        type: Sequelize.STRING(200),
      },
      'work_center_id': {
        type: Sequelize.UUID,
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "operational",
      },
      'operating_hours': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'maintenance_interval_hours': {
        type: Sequelize.INTEGER,
        defaultValue: 500,
      },
      'last_maintenance_date': {
        type: Sequelize.DATE,
      },
      'next_maintenance_date': {
        type: Sequelize.DATE,
      },
      'cost_per_hour': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'purchase_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'depreciation_rate': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'power_consumption_kw': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'specifications': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'image_url': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_maintenance_records', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'machine_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'maintenance_type': {
        type: Sequelize.STRING(20),
        defaultValue: "preventive",
      },
      'maintenance_number': {
        type: Sequelize.STRING(50),
      },
      'description': {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      'scheduled_date': {
        type: Sequelize.DATE,
      },
      'started_at': {
        type: Sequelize.DATE,
      },
      'completed_at': {
        type: Sequelize.DATE,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "scheduled",
      },
      'priority': {
        type: Sequelize.STRING(20),
        defaultValue: "normal",
      },
      'performed_by': {
        type: Sequelize.UUID,
      },
      'cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'parts_used': {
        type: Sequelize.JSONB,
        defaultValue: [],
      },
      'parts_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'labor_cost': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'downtime_hours': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'root_cause': {
        type: Sequelize.TEXT,
      },
      'findings': {
        type: Sequelize.TEXT,
      },
      'recommendations': {
        type: Sequelize.TEXT,
      },
      'vendor_name': {
        type: Sequelize.STRING(200),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_production_plans', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'plan_code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'plan_name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'plan_type': {
        type: Sequelize.STRING(20),
        defaultValue: "weekly",
      },
      'period_start': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'period_end': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "draft",
      },
      'total_planned_qty': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_by': {
        type: Sequelize.UUID,
      },
      'approved_by': {
        type: Sequelize.UUID,
      },
      'approved_at': {
        type: Sequelize.DATE,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_production_plan_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'plan_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'bom_id': {
        type: Sequelize.UUID,
      },
      'planned_quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'scheduled_date': {
        type: Sequelize.DATE,
      },
      'work_center_id': {
        type: Sequelize.UUID,
      },
      'priority': {
        type: Sequelize.STRING(20),
        defaultValue: "normal",
      },
      'work_order_id': {
        type: Sequelize.UUID,
      },
      'status': {
        type: Sequelize.STRING(20),
        defaultValue: "pending",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_waste_records', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'work_order_id': {
        type: Sequelize.UUID,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'waste_type': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'uom': {
        type: Sequelize.STRING(20),
        defaultValue: "pcs",
      },
      'reason': {
        type: Sequelize.TEXT,
      },
      'category': {
        type: Sequelize.STRING(50),
      },
      'cost_impact': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'disposal_method': {
        type: Sequelize.STRING(50),
      },
      'work_center_id': {
        type: Sequelize.UUID,
      },
      'operation_id': {
        type: Sequelize.UUID,
      },
      'recorded_by': {
        type: Sequelize.UUID,
      },
      'recorded_at': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_production_costs', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'work_order_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'cost_type': {
        type: Sequelize.STRING(20),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'planned_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'actual_amount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'variance': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'reference_type': {
        type: Sequelize.STRING(50),
      },
      'reference_id': {
        type: Sequelize.UUID,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_shift_productions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'work_order_id': {
        type: Sequelize.UUID,
      },
      'work_center_id': {
        type: Sequelize.UUID,
      },
      'machine_id': {
        type: Sequelize.UUID,
      },
      'shift_date': {
        type: Sequelize.DATEONLY,
        allowNull: false,
      },
      'shift_name': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'operator_id': {
        type: Sequelize.UUID,
      },
      'start_time': {
        type: Sequelize.DATE,
      },
      'end_time': {
        type: Sequelize.DATE,
      },
      'planned_output': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'actual_output': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'good_output': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'reject_count': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'downtime_minutes': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'downtime_reason': {
        type: Sequelize.TEXT,
      },
      'oee_availability': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'oee_performance': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'oee_quality': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'oee_overall': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('mfg_settings', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'setting_key': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'setting_value': {
        type: Sequelize.JSONB,
        defaultValue: {},
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('finance_accounts', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'accountNumber': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'accountName': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'accountType': {
        type: Sequelize.ENUM('asset', 'liability', 'equity', 'revenue', 'expense'),
        allowNull: false,
      },
      'category': {
        type: Sequelize.STRING(100),
      },
      'parentAccountId': {
        type: Sequelize.UUID,
      },
      'balance': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'currency': {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: "IDR",
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('finance_budgets', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'budgetName': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'budgetPeriod': {
        type: Sequelize.ENUM('monthly', 'quarterly', 'yearly'),
        allowNull: false,
      },
      'startDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'endDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'category': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'accountId': {
        type: Sequelize.UUID,
      },
      'budgetAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'spentAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'remainingAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'alertThreshold': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 80,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'status': {
        type: Sequelize.ENUM('active', 'completed', 'exceeded', 'cancelled'),
        allowNull: false,
        defaultValue: "active",
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('finance_invoices', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'invoiceNumber': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'type': {
        type: Sequelize.ENUM('supplier', 'customer'),
        allowNull: false,
      },
      'supplierId': {
        type: Sequelize.UUID,
      },
      'supplierName': {
        type: Sequelize.STRING(200),
      },
      'customerId': {
        type: Sequelize.UUID,
      },
      'customerName': {
        type: Sequelize.STRING(200),
      },
      'purchaseOrderId': {
        type: Sequelize.UUID,
      },
      'purchaseOrderNumber': {
        type: Sequelize.STRING(50),
      },
      'invoiceDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'dueDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'totalAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'paidAmount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'remainingAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'paymentStatus': {
        type: Sequelize.ENUM('unpaid', 'partial', 'paid'),
        defaultValue: "unpaid",
      },
      'inventoryStatus': {
        type: Sequelize.ENUM('pending', 'partial', 'complete'),
        defaultValue: "pending",
      },
      'status': {
        type: Sequelize.ENUM('pending', 'received', 'delivered', 'cancelled'),
        defaultValue: "pending",
      },
      'paymentTerms': {
        type: Sequelize.STRING(50),
        defaultValue: "NET 30",
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('finance_invoice_items', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'invoiceId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'productId': {
        type: Sequelize.UUID,
      },
      'productName': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'quantity': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'price': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'total': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'receivedQuantity': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('finance_invoice_payments', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'invoiceId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'paymentDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'amount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'paymentMethod': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'reference': {
        type: Sequelize.STRING(100),
      },
      'receivedBy': {
        type: Sequelize.STRING(100),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('finance_payables', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'supplierId': {
        type: Sequelize.UUID,
      },
      'supplierName': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'supplierPhone': {
        type: Sequelize.STRING(50),
      },
      'invoiceNumber': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'purchaseOrderNumber': {
        type: Sequelize.STRING(50),
      },
      'invoiceDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'dueDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'totalAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'paidAmount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'remainingAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'status': {
        type: Sequelize.ENUM('unpaid', 'partial', 'paid', 'overdue'),
        defaultValue: "unpaid",
      },
      'paymentTerms': {
        type: Sequelize.STRING(50),
        defaultValue: "NET 30",
      },
      'daysPastDue': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('finance_payable_payments', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'payableId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'paymentDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'amount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'paymentMethod': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'reference': {
        type: Sequelize.STRING(100),
      },
      'paidBy': {
        type: Sequelize.STRING(100),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('finance_receivables', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'customerId': {
        type: Sequelize.UUID,
      },
      'customerName': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'customerPhone': {
        type: Sequelize.STRING(50),
      },
      'invoiceId': {
        type: Sequelize.UUID,
      },
      'invoiceNumber': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'salesOrderNumber': {
        type: Sequelize.STRING(50),
      },
      'invoiceDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'dueDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'totalAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'paidAmount': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'remainingAmount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'status': {
        type: Sequelize.ENUM('unpaid', 'partial', 'paid', 'overdue'),
        defaultValue: "unpaid",
      },
      'paymentTerms': {
        type: Sequelize.STRING(50),
        defaultValue: "NET 30",
      },
      'daysPastDue': {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('finance_receivable_payments', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'receivableId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'paymentDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'amount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'paymentMethod': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'reference': {
        type: Sequelize.STRING(100),
      },
      'receivedBy': {
        type: Sequelize.STRING(100),
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('finance_transactions', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'transactionNumber': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'transactionDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'transactionType': {
        type: Sequelize.ENUM('income', 'expense', 'transfer'),
        allowNull: false,
      },
      'accountId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'category': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'subcategory': {
        type: Sequelize.STRING(100),
      },
      'amount': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'referenceType': {
        type: Sequelize.ENUM('invoice', 'bill', 'order', 'manual', 'other'),
      },
      'referenceId': {
        type: Sequelize.UUID,
      },
      'paymentMethod': {
        type: Sequelize.ENUM('cash', 'bank_transfer', 'credit_card', 'debit_card', 'e_wallet', 'other'),
      },
      'contactId': {
        type: Sequelize.UUID,
      },
      'contactName': {
        type: Sequelize.STRING(200),
      },
      'branch_id': {
        type: Sequelize.UUID,
      },
      'attachments': {
        type: Sequelize.JSON,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'tags': {
        type: Sequelize.JSON,
      },
      'status': {
        type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
        allowNull: false,
        defaultValue: "completed",
      },
      'createdBy': {
        type: Sequelize.UUID,
      },
      'isRecurring': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      'recurringPattern': {
        type: Sequelize.JSON,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('kitchen_recipes', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'category': {
        type: Sequelize.STRING(255),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'prep_time': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'cook_time': {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      'servings': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      'difficulty': {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        allowNull: false,
        defaultValue: "medium",
      },
      'instructions': {
        type: Sequelize.JSON,
      },
      'total_cost': {
        type: Sequelize.DECIMAL,
      },
      'selling_price': {
        type: Sequelize.DECIMAL,
      },
      'image_url': {
        type: Sequelize.STRING(255),
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'product_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('kitchen_recipe_ingredients', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'recipe_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'inventory_item_id': {
        type: Sequelize.UUID,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'quantity': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'unit': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'unit_cost': {
        type: Sequelize.DECIMAL,
      },
      'total_cost': {
        type: Sequelize.DECIMAL,
      },
      'notes': {
        type: Sequelize.TEXT,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'recipe_id': {
        type: Sequelize.UUID,
      },
      'inventory_item_id': {
        type: Sequelize.UUID,
      },
      'product_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('kitchen_settings', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'auto_accept_orders': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      'default_prep_time': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 15,
      },
      'enable_kds': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'kds_refresh_interval': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 30,
      },
      'sound_notifications': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'auto_deduct_inventory': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'low_stock_alert': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'critical_stock_alert': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'waste_tracking': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      'performance_tracking': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'order_priority_rules': {
        type: Sequelize.JSON,
      },
      'working_hours': {
        type: Sequelize.JSON,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('kitchen_staff', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'tenant_id': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'user_id': {
        type: Sequelize.UUID,
      },
      'name': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'role': {
        type: Sequelize.ENUM('head_chef', 'sous_chef', 'line_cook', 'prep_cook'),
        allowNull: false,
        defaultValue: "line_cook",
      },
      'shift': {
        type: Sequelize.ENUM('morning', 'afternoon', 'night'),
        allowNull: false,
        defaultValue: "morning",
      },
      'status': {
        type: Sequelize.ENUM('active', 'off', 'leave'),
        allowNull: false,
        defaultValue: "active",
      },
      'performance': {
        type: Sequelize.DECIMAL,
        defaultValue: 0,
      },
      'orders_completed': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      'avg_prep_time': {
        type: Sequelize.INTEGER,
      },
      'join_date': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'phone': {
        type: Sequelize.STRING(255),
      },
      'email': {
        type: Sequelize.STRING(255),
      },
      'is_active': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'created_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updated_at': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'user_id': {
        type: Sequelize.UUID,
      },
    });

    await queryInterface.createTable('promos', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'type': {
        type: Sequelize.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: "percentage",
      },
      'value': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'minPurchase': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'maxDiscount': {
        type: Sequelize.DECIMAL,
      },
      'startDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'endDate': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'usageLimit': {
        type: Sequelize.INTEGER,
      },
      'usageCount': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      'perUserLimit': {
        type: Sequelize.INTEGER,
      },
      'applicableProducts': {
        type: Sequelize.JSON,
      },
      'applicableCategories': {
        type: Sequelize.JSON,
      },
      'status': {
        type: Sequelize.ENUM('active', 'inactive', 'expired'),
        allowNull: false,
        defaultValue: "active",
      },
      'promoScope': {
        type: Sequelize.ENUM('general', 'product_specific', 'category', 'bundle'),
        allowNull: false,
        defaultValue: "general",
      },
      'autoApply': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      'stackable': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      'priority': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('promo_bundles', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'promoId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'name': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'bundleType': {
        type: Sequelize.ENUM('fixed_bundle', 'mix_match', 'buy_x_get_y', 'quantity_discount'),
        allowNull: false,
        defaultValue: "fixed_bundle",
      },
      'bundleProducts': {
        type: Sequelize.JSON,
        allowNull: false,
      },
      'minQuantity': {
        type: Sequelize.INTEGER,
      },
      'maxQuantity': {
        type: Sequelize.INTEGER,
      },
      'bundlePrice': {
        type: Sequelize.DECIMAL,
      },
      'discountType': {
        type: Sequelize.ENUM('percentage', 'fixed', 'free_item'),
        allowNull: false,
        defaultValue: "percentage",
      },
      'discountValue': {
        type: Sequelize.DECIMAL,
      },
      'requireAllProducts': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'checkStock': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('promo_categories', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'promoId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'categoryId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'categoryName': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'discountType': {
        type: Sequelize.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: "percentage",
      },
      'discountValue': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'minQuantity': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'maxDiscount': {
        type: Sequelize.DECIMAL,
      },
      'allowMixMatch': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('promo_products', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'promoId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'productId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'productName': {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      'productSku': {
        type: Sequelize.STRING(100),
      },
      'discountType': {
        type: Sequelize.ENUM('percentage', 'fixed', 'override_price'),
        allowNull: false,
        defaultValue: "percentage",
      },
      'discountValue': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'minQuantity': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'maxQuantity': {
        type: Sequelize.INTEGER,
      },
      'overridePrice': {
        type: Sequelize.DECIMAL,
      },
      'quantityTiers': {
        type: Sequelize.JSON,
      },
      'checkStock': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    await queryInterface.createTable('audit_logs', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'userId': {
        type: Sequelize.UUID,
      },
      'action': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'resource': {
        type: Sequelize.STRING(100),
      },
      'resourceId': {
        type: Sequelize.UUID,
      },
      'details': {
        type: Sequelize.JSON,
      },
      'ipAddress': {
        type: Sequelize.STRING(45),
      },
      'userAgent': {
        type: Sequelize.TEXT,
      },
      'is_hq_intervention': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'target_branch_id': {
        type: Sequelize.UUID,
      },
      'user_role': {
        type: Sequelize.STRING(50),
      },
      'old_values': {
        type: Sequelize.JSON,
      },
      'new_values': {
        type: Sequelize.JSON,
      },
      'intervention_reason': {
        type: Sequelize.TEXT,
      },
      'affected_records': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'createdAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('notification_settings', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'userId': {
        type: Sequelize.UUID,
        allowNull: false,
      },
      'emailSettings': {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      'smsSettings': {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      'pushSettings': {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      'emailConfig': {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      'createdAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updatedAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('printer_configs', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'type': {
        type: Sequelize.STRING(50),
        defaultValue: "thermal",
      },
      'connectionType': {
        type: Sequelize.STRING(50),
        defaultValue: "network",
      },
      'ipAddress': {
        type: Sequelize.STRING(45),
      },
      'port': {
        type: Sequelize.INTEGER,
        defaultValue: 9100,
      },
      'settings': {
        type: Sequelize.JSON,
      },
      'isDefault': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updatedAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('roles', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'permissions': {
        type: Sequelize.JSON,
        defaultValue: {},
      },
      'isSystem': {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      'createdAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updatedAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('system_backups', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'filename': {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      'filePath': {
        type: Sequelize.STRING(500),
      },
      'fileSize': {
        type: Sequelize.BIGINT,
        defaultValue: 0,
      },
      'backupType': {
        type: Sequelize.STRING(50),
        defaultValue: "full",
      },
      'status': {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: "pending",
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'createdBy': {
        type: Sequelize.UUID,
      },
      'createdAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updatedAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('units', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'name': {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      'symbol': {
        type: Sequelize.STRING(20),
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'createdAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'updatedAt': {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });

    await queryInterface.createTable('vouchers', {
      'id': {
        type: Sequelize.UUID,
        primaryKey: true,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      'code': {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      'description': {
        type: Sequelize.TEXT,
      },
      'category': {
        type: Sequelize.ENUM('welcome', 'member', 'birthday', 'referral', 'seasonal', 'custom'),
        allowNull: false,
        defaultValue: "custom",
      },
      'type': {
        type: Sequelize.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: "fixed",
      },
      'value': {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      'minPurchase': {
        type: Sequelize.DECIMAL,
        allowNull: false,
        defaultValue: 0,
      },
      'maxDiscount': {
        type: Sequelize.DECIMAL,
      },
      'validFrom': {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      'validUntil': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'usageLimit': {
        type: Sequelize.INTEGER,
      },
      'usageCount': {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      'perUserLimit': {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      'applicableFor': {
        type: Sequelize.ENUM('all', 'new_customer', 'existing_customer', 'specific_customer'),
        allowNull: false,
        defaultValue: "all",
      },
      'specificCustomers': {
        type: Sequelize.JSON,
      },
      'applicableProducts': {
        type: Sequelize.JSON,
      },
      'applicableCategories': {
        type: Sequelize.JSON,
      },
      'status': {
        type: Sequelize.ENUM('active', 'inactive', 'expired'),
        allowNull: false,
        defaultValue: "active",
      },
      'isActive': {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      'createdAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
      'updatedAt': {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });



    // 2. Add foreign key constraints
    await queryInterface.addConstraint('users', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_users_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('users', {
      fields: ['assigned_branch_id'],
      type: 'foreign key',
      name: 'fk_users_assigned_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('employees', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_employees_userId',
      references: {
        table: 'users',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('employees', {
      fields: ['branchId'],
      type: 'foreign key',
      name: 'fk_employees_branchId',
      references: {
        table: 'branches',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('products', {
      fields: ['supplier_id'],
      type: 'foreign key',
      name: 'fk_products_supplier_id',
      references: {
        table: 'suppliers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('inventory_stock', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_inventory_stock_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('inventory_stock', {
      fields: ['location_id'],
      type: 'foreign key',
      name: 'fk_inventory_stock_location_id',
      references: {
        table: 'locations',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('inventory_stock', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_inventory_stock_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('stock_movements', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_stock_movements_productId',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('stock_movements', {
      fields: ['branchId'],
      type: 'foreign key',
      name: 'fk_stock_movements_branchId',
      references: {
        table: 'branches',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_movements', {
      fields: ['fromBranchId'],
      type: 'foreign key',
      name: 'fk_stock_movements_fromBranchId',
      references: {
        table: 'branches',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_movements', {
      fields: ['toBranchId'],
      type: 'foreign key',
      name: 'fk_stock_movements_toBranchId',
      references: {
        table: 'branches',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_movements', {
      fields: ['performedBy'],
      type: 'foreign key',
      name: 'fk_stock_movements_performedBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_movements', {
      fields: ['approvedBy'],
      type: 'foreign key',
      name: 'fk_stock_movements_approvedBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_adjustments', {
      fields: ['branchId'],
      type: 'foreign key',
      name: 'fk_stock_adjustments_branchId',
      references: {
        table: 'branches',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_adjustments', {
      fields: ['createdBy'],
      type: 'foreign key',
      name: 'fk_stock_adjustments_createdBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_adjustments', {
      fields: ['approvedBy'],
      type: 'foreign key',
      name: 'fk_stock_adjustments_approvedBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_adjustment_items', {
      fields: ['stockAdjustmentId'],
      type: 'foreign key',
      name: 'fk_stock_adjustment_items_stockAdjustmentId',
      references: {
        table: 'stock_adjustments',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_adjustment_items', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_stock_adjustment_items_productId',
      references: {
        table: 'products',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('purchase_orders', {
      fields: ['supplierId'],
      type: 'foreign key',
      name: 'fk_purchase_orders_supplierId',
      references: {
        table: 'suppliers',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('purchase_orders', {
      fields: ['branchId'],
      type: 'foreign key',
      name: 'fk_purchase_orders_branchId',
      references: {
        table: 'branches',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('purchase_orders', {
      fields: ['createdBy'],
      type: 'foreign key',
      name: 'fk_purchase_orders_createdBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('purchase_orders', {
      fields: ['approvedBy'],
      type: 'foreign key',
      name: 'fk_purchase_orders_approvedBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('purchase_orders', {
      fields: ['cancelledBy'],
      type: 'foreign key',
      name: 'fk_purchase_orders_cancelledBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('purchase_order_items', {
      fields: ['purchaseOrderId'],
      type: 'foreign key',
      name: 'fk_purchase_order_items_purchaseOrderId',
      references: {
        table: 'purchase_orders',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('purchase_order_items', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_purchase_order_items_productId',
      references: {
        table: 'products',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('sales_orders', {
      fields: ['customerId'],
      type: 'foreign key',
      name: 'fk_sales_orders_customerId',
      references: {
        table: 'customers',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('sales_orders', {
      fields: ['branchId'],
      type: 'foreign key',
      name: 'fk_sales_orders_branchId',
      references: {
        table: 'branches',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('sales_orders', {
      fields: ['createdBy'],
      type: 'foreign key',
      name: 'fk_sales_orders_createdBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('sales_orders', {
      fields: ['approvedBy'],
      type: 'foreign key',
      name: 'fk_sales_orders_approvedBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('sales_orders', {
      fields: ['cancelledBy'],
      type: 'foreign key',
      name: 'fk_sales_orders_cancelledBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('sales_order_items', {
      fields: ['salesOrderId'],
      type: 'foreign key',
      name: 'fk_sales_order_items_salesOrderId',
      references: {
        table: 'sales_orders',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('sales_order_items', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_sales_order_items_productId',
      references: {
        table: 'products',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('goods_receipts', {
      fields: ['purchaseOrderId'],
      type: 'foreign key',
      name: 'fk_goods_receipts_purchaseOrderId',
      references: {
        table: 'purchase_orders',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('goods_receipts', {
      fields: ['receivedBy'],
      type: 'foreign key',
      name: 'fk_goods_receipts_receivedBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('goods_receipt_items', {
      fields: ['goodsReceiptId'],
      type: 'foreign key',
      name: 'fk_goods_receipt_items_goodsReceiptId',
      references: {
        table: 'goods_receipts',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('goods_receipt_items', {
      fields: ['purchaseOrderItemId'],
      type: 'foreign key',
      name: 'fk_goods_receipt_items_purchaseOrderItemId',
      references: {
        table: 'purchase_order_items',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('goods_receipt_items', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_goods_receipt_items_productId',
      references: {
        table: 'products',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('pos_transactions', {
      fields: ['shiftId'],
      type: 'foreign key',
      name: 'fk_pos_transactions_shiftId',
      references: {
        table: 'shifts',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('pos_transactions', {
      fields: ['customerId'],
      type: 'foreign key',
      name: 'fk_pos_transactions_customerId',
      references: {
        table: 'customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('pos_transactions', {
      fields: ['cashierId'],
      type: 'foreign key',
      name: 'fk_pos_transactions_cashierId',
      references: {
        table: 'employees',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('pos_transactions', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_pos_transactions_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('pos_transactions', {
      fields: ['heldTransactionId'],
      type: 'foreign key',
      name: 'fk_pos_transactions_heldTransactionId',
      references: {
        table: 'held_transactions',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('pos_transaction_items', {
      fields: ['transactionId'],
      type: 'foreign key',
      name: 'fk_pos_transaction_items_transactionId',
      references: {
        table: 'pos_transactions',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('pos_transaction_items', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_pos_transaction_items_productId',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('held_transactions', {
      fields: ['cashier_id'],
      type: 'foreign key',
      name: 'fk_held_transactions_cashier_id',
      references: {
        table: 'employees',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('held_transactions', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_held_transactions_customer_id',
      references: {
        table: 'customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('reservations', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_reservations_customer_id',
      references: {
        table: 'customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('reservations', {
      fields: ['table_id'],
      type: 'foreign key',
      name: 'fk_reservations_table_id',
      references: {
        table: 'tables',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('reservations', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_reservations_created_by',
      references: {
        table: 'employees',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('reservations', {
      fields: ['confirmed_by'],
      type: 'foreign key',
      name: 'fk_reservations_confirmed_by',
      references: {
        table: 'employees',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('reservations', {
      fields: ['seated_by'],
      type: 'foreign key',
      name: 'fk_reservations_seated_by',
      references: {
        table: 'employees',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('table_sessions', {
      fields: ['table_id'],
      type: 'foreign key',
      name: 'fk_table_sessions_table_id',
      references: {
        table: 'tables',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('table_sessions', {
      fields: ['reservation_id'],
      type: 'foreign key',
      name: 'fk_table_sessions_reservation_id',
      references: {
        table: 'reservations',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('table_sessions', {
      fields: ['pos_transaction_id'],
      type: 'foreign key',
      name: 'fk_table_sessions_pos_transaction_id',
      references: {
        table: 'pos_transactions',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('product_cost_history', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_product_cost_history_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('product_cost_history', {
      fields: ['changed_by'],
      type: 'foreign key',
      name: 'fk_product_cost_history_changed_by',
      references: {
        table: 'employees',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('product_cost_components', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_product_cost_components_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('shifts', {
      fields: ['openedBy'],
      type: 'foreign key',
      name: 'fk_shifts_openedBy',
      references: {
        table: 'employees',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('shifts', {
      fields: ['closedBy'],
      type: 'foreign key',
      name: 'fk_shifts_closedBy',
      references: {
        table: 'employees',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('shifts', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_shifts_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('tenants', {
      fields: ['business_type_id'],
      type: 'foreign key',
      name: 'fk_tenants_business_type_id',
      references: {
        table: 'business_types',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('tenants', {
      fields: ['parent_tenant_id'],
      type: 'foreign key',
      name: 'fk_tenants_parent_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('modules', {
      fields: ['parent_module_id'],
      type: 'foreign key',
      name: 'fk_modules_parent_module_id',
      references: {
        table: 'modules',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('business_type_modules', {
      fields: ['business_type_id'],
      type: 'foreign key',
      name: 'fk_business_type_modules_business_type_id',
      references: {
        table: 'business_types',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('business_type_modules', {
      fields: ['module_id'],
      type: 'foreign key',
      name: 'fk_business_type_modules_module_id',
      references: {
        table: 'modules',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('tenant_modules', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_tenant_modules_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('tenant_modules', {
      fields: ['module_id'],
      type: 'foreign key',
      name: 'fk_tenant_modules_module_id',
      references: {
        table: 'modules',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('module_dependencies', {
      fields: ['module_id'],
      type: 'foreign key',
      name: 'fk_module_dependencies_module_id',
      references: {
        table: 'modules',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('module_dependencies', {
      fields: ['depends_on_module_id'],
      type: 'foreign key',
      name: 'fk_module_dependencies_depends_on_module_id',
      references: {
        table: 'modules',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('shift_handovers', {
      fields: ['shiftId'],
      type: 'foreign key',
      name: 'fk_shift_handovers_shiftId',
      references: {
        table: 'shifts',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('shift_handovers', {
      fields: ['handoverFrom'],
      type: 'foreign key',
      name: 'fk_shift_handovers_handoverFrom',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('shift_handovers', {
      fields: ['handoverTo'],
      type: 'foreign key',
      name: 'fk_shift_handovers_handoverTo',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('customer_loyalty', {
      fields: ['customerId'],
      type: 'foreign key',
      name: 'fk_customer_loyalty_customerId',
      references: {
        table: 'customers',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('customer_loyalty', {
      fields: ['programId'],
      type: 'foreign key',
      name: 'fk_customer_loyalty_programId',
      references: {
        table: 'loyalty_programs',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('customer_loyalty', {
      fields: ['currentTierId'],
      type: 'foreign key',
      name: 'fk_customer_loyalty_currentTierId',
      references: {
        table: 'loyalty_tiers',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('loyalty_tiers', {
      fields: ['programId'],
      type: 'foreign key',
      name: 'fk_loyalty_tiers_programId',
      references: {
        table: 'loyalty_programs',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('loyalty_rewards', {
      fields: ['programId'],
      type: 'foreign key',
      name: 'fk_loyalty_rewards_programId',
      references: {
        table: 'loyalty_programs',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('loyalty_rewards', {
      fields: ['productId'],
      type: 'foreign key',
      name: 'fk_loyalty_rewards_productId',
      references: {
        table: 'products',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('point_transactions', {
      fields: ['customerLoyaltyId'],
      type: 'foreign key',
      name: 'fk_point_transactions_customerLoyaltyId',
      references: {
        table: 'customer_loyalty',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('point_transactions', {
      fields: ['processedBy'],
      type: 'foreign key',
      name: 'fk_point_transactions_processedBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('reward_redemptions', {
      fields: ['customerLoyaltyId'],
      type: 'foreign key',
      name: 'fk_reward_redemptions_customerLoyaltyId',
      references: {
        table: 'customer_loyalty',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('reward_redemptions', {
      fields: ['rewardId'],
      type: 'foreign key',
      name: 'fk_reward_redemptions_rewardId',
      references: {
        table: 'loyalty_rewards',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('reward_redemptions', {
      fields: ['usedInTransactionId'],
      type: 'foreign key',
      name: 'fk_reward_redemptions_usedInTransactionId',
      references: {
        table: 'pos_transactions',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('reward_redemptions', {
      fields: ['processedBy'],
      type: 'foreign key',
      name: 'fk_reward_redemptions_processedBy',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('locations', {
      fields: ['warehouse_id'],
      type: 'foreign key',
      name: 'fk_locations_warehouse_id',
      references: {
        table: 'warehouses',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_opnames', {
      fields: ['warehouse_id'],
      type: 'foreign key',
      name: 'fk_stock_opnames_warehouse_id',
      references: {
        table: 'warehouses',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_opnames', {
      fields: ['location_id'],
      type: 'foreign key',
      name: 'fk_stock_opnames_location_id',
      references: {
        table: 'locations',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_opnames', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_stock_opnames_created_by',
      references: {
        table: 'users',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_opname_items', {
      fields: ['stock_opname_id'],
      type: 'foreign key',
      name: 'fk_stock_opname_items_stock_opname_id',
      references: {
        table: 'stock_opnames',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_opname_items', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_stock_opname_items_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('stock_opname_items', {
      fields: ['location_id'],
      type: 'foreign key',
      name: 'fk_stock_opname_items_location_id',
      references: {
        table: 'locations',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('incident_reports', {
      fields: ['stock_opname_id'],
      type: 'foreign key',
      name: 'fk_incident_reports_stock_opname_id',
      references: {
        table: 'stock_opnames',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('incident_reports', {
      fields: ['stock_opname_item_id'],
      type: 'foreign key',
      name: 'fk_incident_reports_stock_opname_item_id',
      references: {
        table: 'stock_opname_items',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('incident_reports', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_incident_reports_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('incident_reports', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_incident_reports_created_by',
      references: {
        table: 'users',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('recipes', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_recipes_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('recipes', {
      fields: ['created_by'],
      type: 'foreign key',
      name: 'fk_recipes_created_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('recipe_ingredients', {
      fields: ['recipe_id'],
      type: 'foreign key',
      name: 'fk_recipe_ingredients_recipe_id',
      references: {
        table: 'recipes',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('recipe_ingredients', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_recipe_ingredients_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('recipe_history', {
      fields: ['recipe_id'],
      type: 'foreign key',
      name: 'fk_recipe_history_recipe_id',
      references: {
        table: 'recipes',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('recipe_history', {
      fields: ['changed_by'],
      type: 'foreign key',
      name: 'fk_recipe_history_changed_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('productions', {
      fields: ['recipe_id'],
      type: 'foreign key',
      name: 'fk_productions_recipe_id',
      references: {
        table: 'recipes',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('productions', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_productions_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('productions', {
      fields: ['produced_by'],
      type: 'foreign key',
      name: 'fk_productions_produced_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('productions', {
      fields: ['supervisor_id'],
      type: 'foreign key',
      name: 'fk_productions_supervisor_id',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('productions', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_productions_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('production_materials', {
      fields: ['production_id'],
      type: 'foreign key',
      name: 'fk_production_materials_production_id',
      references: {
        table: 'productions',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('production_materials', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_production_materials_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('production_history', {
      fields: ['production_id'],
      type: 'foreign key',
      name: 'fk_production_history_production_id',
      references: {
        table: 'productions',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('production_history', {
      fields: ['changed_by'],
      type: 'foreign key',
      name: 'fk_production_history_changed_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('production_waste', {
      fields: ['production_id'],
      type: 'foreign key',
      name: 'fk_production_waste_production_id',
      references: {
        table: 'productions',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('production_waste', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_production_waste_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('production_waste', {
      fields: ['recorded_by'],
      type: 'foreign key',
      name: 'fk_production_waste_recorded_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('employee_schedules', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'fk_employee_schedules_employeeId',
      references: {
        table: 'employees',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('employee_schedules', {
      fields: ['locationId'],
      type: 'foreign key',
      name: 'fk_employee_schedules_locationId',
      references: {
        table: 'locations',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('employee_schedules', {
      fields: ['createdBy'],
      type: 'foreign key',
      name: 'fk_employee_schedules_createdBy',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('employee_schedules', {
      fields: ['branchId'],
      type: 'foreign key',
      name: 'fk_employee_schedules_branchId',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('stores', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_stores_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('stores', {
      fields: ['owner_id'],
      type: 'foreign key',
      name: 'fk_stores_owner_id',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('branches', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_branches_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('branches', {
      fields: ['store_id'],
      type: 'foreign key',
      name: 'fk_branches_store_id',
      references: {
        table: 'stores',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('branches', {
      fields: ['manager_id'],
      type: 'foreign key',
      name: 'fk_branches_manager_id',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('store_settings', {
      fields: ['store_id'],
      type: 'foreign key',
      name: 'fk_store_settings_store_id',
      references: {
        table: 'stores',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('store_settings', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_store_settings_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('kitchen_orders', {
      fields: ['pos_transaction_id'],
      type: 'foreign key',
      name: 'fk_kitchen_orders_pos_transaction_id',
      references: {
        table: 'pos_transactions',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_orders', {
      fields: ['assigned_chef_id'],
      type: 'foreign key',
      name: 'fk_kitchen_orders_assigned_chef_id',
      references: {
        table: 'kitchen_staff',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_order_items', {
      fields: ['kitchen_order_id'],
      type: 'foreign key',
      name: 'fk_kitchen_order_items_kitchen_order_id',
      references: {
        table: 'kitchen_orders',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_order_items', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_kitchen_order_items_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_order_items', {
      fields: ['recipe_id'],
      type: 'foreign key',
      name: 'fk_kitchen_order_items_recipe_id',
      references: {
        table: 'kitchen_recipes',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_order_items', {
      fields: ['prepared_by'],
      type: 'foreign key',
      name: 'fk_kitchen_order_items_prepared_by',
      references: {
        table: 'kitchen_staff',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_inventory_items', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_kitchen_inventory_items_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_inventory_items', {
      fields: ['warehouse_id'],
      type: 'foreign key',
      name: 'fk_kitchen_inventory_items_warehouse_id',
      references: {
        table: 'warehouses',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_inventory_items', {
      fields: ['location_id'],
      type: 'foreign key',
      name: 'fk_kitchen_inventory_items_location_id',
      references: {
        table: 'locations',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_inventory_transactions', {
      fields: ['inventory_item_id'],
      type: 'foreign key',
      name: 'fk_kitchen_inventory_transactions_inventory_item_id',
      references: {
        table: 'kitchen_inventory_items',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_inventory_transactions', {
      fields: ['performed_by'],
      type: 'foreign key',
      name: 'fk_kitchen_inventory_transactions_performed_by',
      references: {
        table: 'users',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('branch_realtime_metrics', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_branch_realtime_metrics_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('branch_setups', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_branch_setups_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('branch_setups', {
      fields: ['completed_by'],
      type: 'foreign key',
      name: 'fk_branch_setups_completed_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('branch_modules', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_branch_modules_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('branch_modules', {
      fields: ['enabled_by'],
      type: 'foreign key',
      name: 'fk_branch_modules_enabled_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('sync_logs', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_sync_logs_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('sync_logs', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_sync_logs_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sync_logs', {
      fields: ['initiated_by'],
      type: 'foreign key',
      name: 'fk_sync_logs_initiated_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('partner_subscriptions', {
      fields: ['partner_id'],
      type: 'foreign key',
      name: 'fk_partner_subscriptions_partner_id',
      references: {
        table: 'partners',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('partner_subscriptions', {
      fields: ['package_id'],
      type: 'foreign key',
      name: 'fk_partner_subscriptions_package_id',
      references: {
        table: 'subscription_packages',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('partner_outlets', {
      fields: ['partner_id'],
      type: 'foreign key',
      name: 'fk_partner_outlets_partner_id',
      references: {
        table: 'partners',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('partner_users', {
      fields: ['partner_id'],
      type: 'foreign key',
      name: 'fk_partner_users_partner_id',
      references: {
        table: 'partners',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('partner_users', {
      fields: ['outlet_id'],
      type: 'foreign key',
      name: 'fk_partner_users_outlet_id',
      references: {
        table: 'partner_outlets',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('activation_requests', {
      fields: ['partner_id'],
      type: 'foreign key',
      name: 'fk_activation_requests_partner_id',
      references: {
        table: 'partners',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('activation_requests', {
      fields: ['package_id'],
      type: 'foreign key',
      name: 'fk_activation_requests_package_id',
      references: {
        table: 'subscription_packages',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('activation_requests', {
      fields: ['reviewed_by'],
      type: 'foreign key',
      name: 'fk_activation_requests_reviewed_by',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('kyb_applications', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_kyb_applications_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('kyb_applications', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_kyb_applications_user_id',
      references: {
        table: 'users',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kyb_documents', {
      fields: ['kyb_application_id'],
      type: 'foreign key',
      name: 'fk_kyb_documents_kyb_application_id',
      references: {
        table: 'kyb_applications',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kyb_documents', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_kyb_documents_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('employee_attendance', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'fk_employee_attendance_employeeId',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('employee_attendance', {
      fields: ['branchId'],
      type: 'foreign key',
      name: 'fk_employee_attendance_branchId',
      references: {
        table: 'branches',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('employee_attendance', {
      fields: ['approvedBy'],
      type: 'foreign key',
      name: 'fk_employee_attendance_approvedBy',
      references: {
        table: 'users',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('performance_reviews', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'fk_performance_reviews_employeeId',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('performance_reviews', {
      fields: ['branchId'],
      type: 'foreign key',
      name: 'fk_performance_reviews_branchId',
      references: {
        table: 'branches',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('performance_reviews', {
      fields: ['reviewerId'],
      type: 'foreign key',
      name: 'fk_performance_reviews_reviewerId',
      references: {
        table: 'users',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('leave_requests', {
      fields: ['employeeId'],
      type: 'foreign key',
      name: 'fk_leave_requests_employeeId',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('leave_requests', {
      fields: ['branchId'],
      type: 'foreign key',
      name: 'fk_leave_requests_branchId',
      references: {
        table: 'branches',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('leave_requests', {
      fields: ['approvedBy'],
      type: 'foreign key',
      name: 'fk_leave_requests_approvedBy',
      references: {
        table: 'users',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('leave_requests', {
      fields: ['delegateTo'],
      type: 'foreign key',
      name: 'fk_leave_requests_delegateTo',
      references: {
        table: 'employees',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('attendance_devices', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_attendance_devices_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('attendance_devices', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_attendance_devices_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('attendance_device_logs', {
      fields: ['device_id'],
      type: 'foreign key',
      name: 'fk_attendance_device_logs_device_id',
      references: {
        table: 'attendance_devices',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('attendance_settings', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_attendance_settings_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('attendance_settings', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_attendance_settings_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('fleet_vehicles', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_fleet_vehicles_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('fleet_vehicles', {
      fields: ['assigned_branch_id'],
      type: 'foreign key',
      name: 'fk_fleet_vehicles_assigned_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('fleet_vehicles', {
      fields: ['assigned_driver_id'],
      type: 'foreign key',
      name: 'fk_fleet_vehicles_assigned_driver_id',
      references: {
        table: 'fleet_drivers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('fleet_drivers', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_fleet_drivers_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('fleet_drivers', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_fleet_drivers_user_id',
      references: {
        table: 'users',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('fleet_drivers', {
      fields: ['assigned_branch_id'],
      type: 'foreign key',
      name: 'fk_fleet_drivers_assigned_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('fleet_routes', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_fleet_routes_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('fleet_route_assignments', {
      fields: ['route_id'],
      type: 'foreign key',
      name: 'fk_fleet_route_assignments_route_id',
      references: {
        table: 'fleet_routes',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('fleet_route_assignments', {
      fields: ['vehicle_id'],
      type: 'foreign key',
      name: 'fk_fleet_route_assignments_vehicle_id',
      references: {
        table: 'fleet_vehicles',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('fleet_route_assignments', {
      fields: ['driver_id'],
      type: 'foreign key',
      name: 'fk_fleet_route_assignments_driver_id',
      references: {
        table: 'fleet_drivers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('fleet_gps_locations', {
      fields: ['vehicle_id'],
      type: 'foreign key',
      name: 'fk_fleet_gps_locations_vehicle_id',
      references: {
        table: 'fleet_vehicles',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('fleet_gps_locations', {
      fields: ['driver_id'],
      type: 'foreign key',
      name: 'fk_fleet_gps_locations_driver_id',
      references: {
        table: 'fleet_drivers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('fleet_maintenance_schedules', {
      fields: ['vehicle_id'],
      type: 'foreign key',
      name: 'fk_fleet_maintenance_schedules_vehicle_id',
      references: {
        table: 'fleet_vehicles',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('fleet_fuel_transactions', {
      fields: ['vehicle_id'],
      type: 'foreign key',
      name: 'fk_fleet_fuel_transactions_vehicle_id',
      references: {
        table: 'fleet_vehicles',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('fleet_fuel_transactions', {
      fields: ['driver_id'],
      type: 'foreign key',
      name: 'fk_fleet_fuel_transactions_driver_id',
      references: {
        table: 'fleet_drivers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('integration_configs', {
      fields: ['provider_id'],
      type: 'foreign key',
      name: 'fk_integration_configs_provider_id',
      references: {
        table: 'integration_providers',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('integration_requests', {
      fields: ['provider_id'],
      type: 'foreign key',
      name: 'fk_integration_requests_provider_id',
      references: {
        table: 'integration_providers',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('sfa_territories', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_sfa_territories_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('sfa_leads', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_sfa_leads_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_leads', {
      fields: ['campaign_id'],
      type: 'foreign key',
      name: 'fk_sfa_leads_campaign_id',
      references: {
        table: 'mkt_campaigns',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_opportunities', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_sfa_opportunities_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_opportunities', {
      fields: ['lead_id'],
      type: 'foreign key',
      name: 'fk_sfa_opportunities_lead_id',
      references: {
        table: 'sfa_leads',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_activities', {
      fields: ['lead_id'],
      type: 'foreign key',
      name: 'fk_sfa_activities_lead_id',
      references: {
        table: 'sfa_leads',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_activities', {
      fields: ['opportunity_id'],
      type: 'foreign key',
      name: 'fk_sfa_activities_opportunity_id',
      references: {
        table: 'sfa_opportunities',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_visits', {
      fields: ['lead_id'],
      type: 'foreign key',
      name: 'fk_sfa_visits_lead_id',
      references: {
        table: 'sfa_leads',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_visits', {
      fields: ['opportunity_id'],
      type: 'foreign key',
      name: 'fk_sfa_visits_opportunity_id',
      references: {
        table: 'sfa_opportunities',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_targets', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_sfa_targets_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_quotations', {
      fields: ['opportunity_id'],
      type: 'foreign key',
      name: 'fk_sfa_quotations_opportunity_id',
      references: {
        table: 'sfa_opportunities',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_quotations', {
      fields: ['lead_id'],
      type: 'foreign key',
      name: 'fk_sfa_quotations_lead_id',
      references: {
        table: 'sfa_leads',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_quotation_items', {
      fields: ['quotation_id'],
      type: 'foreign key',
      name: 'fk_sfa_quotation_items_quotation_id',
      references: {
        table: 'sfa_quotations',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_route_plans', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_sfa_route_plans_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_teams', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_sfa_teams_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_teams', {
      fields: ['parent_team_id'],
      type: 'foreign key',
      name: 'fk_sfa_teams_parent_team_id',
      references: {
        table: 'sfa_teams',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_team_members', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_sfa_team_members_team_id',
      references: {
        table: 'sfa_teams',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_target_groups', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_sfa_target_groups_team_id',
      references: {
        table: 'sfa_teams',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_target_groups', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_sfa_target_groups_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_target_assignments', {
      fields: ['target_group_id'],
      type: 'foreign key',
      name: 'fk_sfa_target_assignments_target_group_id',
      references: {
        table: 'sfa_target_groups',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_target_assignments', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_sfa_target_assignments_team_id',
      references: {
        table: 'sfa_teams',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_target_products', {
      fields: ['target_group_id'],
      type: 'foreign key',
      name: 'fk_sfa_target_products_target_group_id',
      references: {
        table: 'sfa_target_groups',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_target_products', {
      fields: ['target_assignment_id'],
      type: 'foreign key',
      name: 'fk_sfa_target_products_target_assignment_id',
      references: {
        table: 'sfa_target_assignments',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_achievements', {
      fields: ['target_assignment_id'],
      type: 'foreign key',
      name: 'fk_sfa_achievements_target_assignment_id',
      references: {
        table: 'sfa_target_assignments',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_achievements', {
      fields: ['target_group_id'],
      type: 'foreign key',
      name: 'fk_sfa_achievements_target_group_id',
      references: {
        table: 'sfa_target_groups',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_achievements', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_sfa_achievements_team_id',
      references: {
        table: 'sfa_teams',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_achievement_details', {
      fields: ['achievement_id'],
      type: 'foreign key',
      name: 'fk_sfa_achievement_details_achievement_id',
      references: {
        table: 'sfa_achievements',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_incentive_tiers', {
      fields: ['scheme_id'],
      type: 'foreign key',
      name: 'fk_sfa_incentive_tiers_scheme_id',
      references: {
        table: 'sfa_incentive_schemes',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_incentive_calculations', {
      fields: ['scheme_id'],
      type: 'foreign key',
      name: 'fk_sfa_incentive_calculations_scheme_id',
      references: {
        table: 'sfa_incentive_schemes',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_incentive_calculations', {
      fields: ['achievement_id'],
      type: 'foreign key',
      name: 'fk_sfa_incentive_calculations_achievement_id',
      references: {
        table: 'sfa_achievements',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_incentive_calculations', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_sfa_incentive_calculations_team_id',
      references: {
        table: 'sfa_teams',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_plafon', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_sfa_plafon_team_id',
      references: {
        table: 'sfa_teams',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_plafon', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_sfa_plafon_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_plafon_usage', {
      fields: ['plafon_id'],
      type: 'foreign key',
      name: 'fk_sfa_plafon_usage_plafon_id',
      references: {
        table: 'sfa_plafon',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_coverage_assignments', {
      fields: ['coverage_plan_id'],
      type: 'foreign key',
      name: 'fk_sfa_coverage_assignments_coverage_plan_id',
      references: {
        table: 'sfa_coverage_plans',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_coverage_assignments', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_sfa_coverage_assignments_team_id',
      references: {
        table: 'sfa_teams',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_coverage_assignments', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_sfa_coverage_assignments_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_field_orders', {
      fields: ['visit_id'],
      type: 'foreign key',
      name: 'fk_sfa_field_orders_visit_id',
      references: {
        table: 'sfa_visits',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_field_orders', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_sfa_field_orders_team_id',
      references: {
        table: 'sfa_teams',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_field_orders', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_sfa_field_orders_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_field_order_items', {
      fields: ['field_order_id'],
      type: 'foreign key',
      name: 'fk_sfa_field_order_items_field_order_id',
      references: {
        table: 'sfa_field_orders',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_display_audits', {
      fields: ['visit_id'],
      type: 'foreign key',
      name: 'fk_sfa_display_audits_visit_id',
      references: {
        table: 'sfa_visits',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_display_items', {
      fields: ['audit_id'],
      type: 'foreign key',
      name: 'fk_sfa_display_items_audit_id',
      references: {
        table: 'sfa_display_audits',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_competitor_activities', {
      fields: ['visit_id'],
      type: 'foreign key',
      name: 'fk_sfa_competitor_activities_visit_id',
      references: {
        table: 'sfa_visits',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_competitor_activities', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_sfa_competitor_activities_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_survey_questions', {
      fields: ['template_id'],
      type: 'foreign key',
      name: 'fk_sfa_survey_questions_template_id',
      references: {
        table: 'sfa_survey_templates',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_survey_responses', {
      fields: ['template_id'],
      type: 'foreign key',
      name: 'fk_sfa_survey_responses_template_id',
      references: {
        table: 'sfa_survey_templates',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_survey_responses', {
      fields: ['visit_id'],
      type: 'foreign key',
      name: 'fk_sfa_survey_responses_visit_id',
      references: {
        table: 'sfa_visits',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_approval_steps', {
      fields: ['workflow_id'],
      type: 'foreign key',
      name: 'fk_sfa_approval_steps_workflow_id',
      references: {
        table: 'sfa_approval_workflows',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_approval_requests', {
      fields: ['workflow_id'],
      type: 'foreign key',
      name: 'fk_sfa_approval_requests_workflow_id',
      references: {
        table: 'sfa_approval_workflows',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_geofences', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_sfa_geofences_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_commission_group_products', {
      fields: ['group_id'],
      type: 'foreign key',
      name: 'fk_sfa_commission_group_products_group_id',
      references: {
        table: 'sfa_commission_groups',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('sfa_strategy_kpis', {
      fields: ['strategy_id'],
      type: 'foreign key',
      name: 'fk_sfa_strategy_kpis_strategy_id',
      references: {
        table: 'sfa_sales_strategies',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('mkt_campaign_channels', {
      fields: ['campaign_id'],
      type: 'foreign key',
      name: 'fk_mkt_campaign_channels_campaign_id',
      references: {
        table: 'mkt_campaigns',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('mkt_segment_rules', {
      fields: ['segment_id'],
      type: 'foreign key',
      name: 'fk_mkt_segment_rules_segment_id',
      references: {
        table: 'mkt_segments',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('mkt_promotions', {
      fields: ['campaign_id'],
      type: 'foreign key',
      name: 'fk_mkt_promotions_campaign_id',
      references: {
        table: 'mkt_campaigns',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('mkt_promotion_usage', {
      fields: ['promotion_id'],
      type: 'foreign key',
      name: 'fk_mkt_promotion_usage_promotion_id',
      references: {
        table: 'mkt_promotions',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('mkt_content_assets', {
      fields: ['campaign_id'],
      type: 'foreign key',
      name: 'fk_mkt_content_assets_campaign_id',
      references: {
        table: 'mkt_campaigns',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('mkt_budget_items', {
      fields: ['budget_id'],
      type: 'foreign key',
      name: 'fk_mkt_budget_items_budget_id',
      references: {
        table: 'mkt_budgets',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('mkt_budget_items', {
      fields: ['campaign_id'],
      type: 'foreign key',
      name: 'fk_mkt_budget_items_campaign_id',
      references: {
        table: 'mkt_campaigns',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('mkt_campaign_audiences', {
      fields: ['campaign_id'],
      type: 'foreign key',
      name: 'fk_mkt_campaign_audiences_campaign_id',
      references: {
        table: 'mkt_campaigns',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('mkt_campaign_audiences', {
      fields: ['segment_id'],
      type: 'foreign key',
      name: 'fk_mkt_campaign_audiences_segment_id',
      references: {
        table: 'mkt_segments',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_customers', {
      fields: ['territory_id'],
      type: 'foreign key',
      name: 'fk_crm_customers_territory_id',
      references: {
        table: 'sfa_territories',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_customers', {
      fields: ['team_id'],
      type: 'foreign key',
      name: 'fk_crm_customers_team_id',
      references: {
        table: 'sfa_teams',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_customers', {
      fields: ['lead_id'],
      type: 'foreign key',
      name: 'fk_crm_customers_lead_id',
      references: {
        table: 'sfa_leads',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_contacts', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_crm_contacts_customer_id',
      references: {
        table: 'crm_customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_interactions', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_crm_interactions_customer_id',
      references: {
        table: 'crm_customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_interactions', {
      fields: ['contact_id'],
      type: 'foreign key',
      name: 'fk_crm_interactions_contact_id',
      references: {
        table: 'crm_contacts',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_communications', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_crm_communications_customer_id',
      references: {
        table: 'crm_customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_communications', {
      fields: ['contact_id'],
      type: 'foreign key',
      name: 'fk_crm_communications_contact_id',
      references: {
        table: 'crm_contacts',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_follow_ups', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_crm_follow_ups_customer_id',
      references: {
        table: 'crm_customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_tasks', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_crm_tasks_customer_id',
      references: {
        table: 'crm_customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_tasks', {
      fields: ['contact_id'],
      type: 'foreign key',
      name: 'fk_crm_tasks_contact_id',
      references: {
        table: 'crm_contacts',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_calendar_events', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_crm_calendar_events_customer_id',
      references: {
        table: 'crm_customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_forecast_items', {
      fields: ['forecast_id'],
      type: 'foreign key',
      name: 'fk_crm_forecast_items_forecast_id',
      references: {
        table: 'crm_forecasts',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_tickets', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_crm_tickets_customer_id',
      references: {
        table: 'crm_customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_tickets', {
      fields: ['sla_policy_id'],
      type: 'foreign key',
      name: 'fk_crm_tickets_sla_policy_id',
      references: {
        table: 'crm_sla_policies',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_ticket_comments', {
      fields: ['ticket_id'],
      type: 'foreign key',
      name: 'fk_crm_ticket_comments_ticket_id',
      references: {
        table: 'crm_tickets',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_satisfaction', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_crm_satisfaction_customer_id',
      references: {
        table: 'crm_customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_automation_logs', {
      fields: ['rule_id'],
      type: 'foreign key',
      name: 'fk_crm_automation_logs_rule_id',
      references: {
        table: 'crm_automation_rules',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('crm_documents', {
      fields: ['customer_id'],
      type: 'foreign key',
      name: 'fk_crm_documents_customer_id',
      references: {
        table: 'crm_customers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('mfg_work_centers', {
      fields: ['tenant_id'],
      type: 'foreign key',
      name: 'fk_mfg_work_centers_tenant_id',
      references: {
        table: 'tenants',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_work_centers', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_mfg_work_centers_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_bom', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_mfg_bom_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_bom', {
      fields: ['routing_id'],
      type: 'foreign key',
      name: 'fk_mfg_bom_routing_id',
      references: {
        table: 'mfg_routings',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_bom_items', {
      fields: ['bom_id'],
      type: 'foreign key',
      name: 'fk_mfg_bom_items_bom_id',
      references: {
        table: 'mfg_bom',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('mfg_bom_items', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_mfg_bom_items_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_routings', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_mfg_routings_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_routing_operations', {
      fields: ['routing_id'],
      type: 'foreign key',
      name: 'fk_mfg_routing_operations_routing_id',
      references: {
        table: 'mfg_routings',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('mfg_routing_operations', {
      fields: ['work_center_id'],
      type: 'foreign key',
      name: 'fk_mfg_routing_operations_work_center_id',
      references: {
        table: 'mfg_work_centers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_work_orders', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_mfg_work_orders_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_work_orders', {
      fields: ['bom_id'],
      type: 'foreign key',
      name: 'fk_mfg_work_orders_bom_id',
      references: {
        table: 'mfg_bom',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_work_orders', {
      fields: ['routing_id'],
      type: 'foreign key',
      name: 'fk_mfg_work_orders_routing_id',
      references: {
        table: 'mfg_routings',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_work_orders', {
      fields: ['work_center_id'],
      type: 'foreign key',
      name: 'fk_mfg_work_orders_work_center_id',
      references: {
        table: 'mfg_work_centers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('mfg_work_orders', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_mfg_work_orders_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_wo_materials', {
      fields: ['work_order_id'],
      type: 'foreign key',
      name: 'fk_mfg_wo_materials_work_order_id',
      references: {
        table: 'mfg_work_orders',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('mfg_wo_materials', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_mfg_wo_materials_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_wo_operations', {
      fields: ['work_order_id'],
      type: 'foreign key',
      name: 'fk_mfg_wo_operations_work_order_id',
      references: {
        table: 'mfg_work_orders',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('mfg_wo_operations', {
      fields: ['work_center_id'],
      type: 'foreign key',
      name: 'fk_mfg_wo_operations_work_center_id',
      references: {
        table: 'mfg_work_centers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_wo_outputs', {
      fields: ['work_order_id'],
      type: 'foreign key',
      name: 'fk_mfg_wo_outputs_work_order_id',
      references: {
        table: 'mfg_work_orders',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('mfg_wo_outputs', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_mfg_wo_outputs_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_qc_inspections', {
      fields: ['work_order_id'],
      type: 'foreign key',
      name: 'fk_mfg_qc_inspections_work_order_id',
      references: {
        table: 'mfg_work_orders',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_qc_inspections', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_mfg_qc_inspections_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_qc_inspections', {
      fields: ['template_id'],
      type: 'foreign key',
      name: 'fk_mfg_qc_inspections_template_id',
      references: {
        table: 'mfg_qc_templates',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('mfg_qc_results', {
      fields: ['inspection_id'],
      type: 'foreign key',
      name: 'fk_mfg_qc_results_inspection_id',
      references: {
        table: 'mfg_qc_inspections',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('mfg_machines', {
      fields: ['work_center_id'],
      type: 'foreign key',
      name: 'fk_mfg_machines_work_center_id',
      references: {
        table: 'mfg_work_centers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('mfg_machines', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_mfg_machines_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_maintenance_records', {
      fields: ['machine_id'],
      type: 'foreign key',
      name: 'fk_mfg_maintenance_records_machine_id',
      references: {
        table: 'mfg_machines',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('mfg_production_plan_items', {
      fields: ['plan_id'],
      type: 'foreign key',
      name: 'fk_mfg_production_plan_items_plan_id',
      references: {
        table: 'mfg_production_plans',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('mfg_production_plan_items', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_mfg_production_plan_items_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_production_plan_items', {
      fields: ['work_order_id'],
      type: 'foreign key',
      name: 'fk_mfg_production_plan_items_work_order_id',
      references: {
        table: 'mfg_work_orders',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_waste_records', {
      fields: ['work_order_id'],
      type: 'foreign key',
      name: 'fk_mfg_waste_records_work_order_id',
      references: {
        table: 'mfg_work_orders',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_waste_records', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_mfg_waste_records_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_waste_records', {
      fields: ['work_center_id'],
      type: 'foreign key',
      name: 'fk_mfg_waste_records_work_center_id',
      references: {
        table: 'mfg_work_centers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_production_costs', {
      fields: ['work_order_id'],
      type: 'foreign key',
      name: 'fk_mfg_production_costs_work_order_id',
      references: {
        table: 'mfg_work_orders',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_shift_productions', {
      fields: ['work_order_id'],
      type: 'foreign key',
      name: 'fk_mfg_shift_productions_work_order_id',
      references: {
        table: 'mfg_work_orders',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_shift_productions', {
      fields: ['work_center_id'],
      type: 'foreign key',
      name: 'fk_mfg_shift_productions_work_center_id',
      references: {
        table: 'mfg_work_centers',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('mfg_shift_productions', {
      fields: ['machine_id'],
      type: 'foreign key',
      name: 'fk_mfg_shift_productions_machine_id',
      references: {
        table: 'mfg_machines',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('finance_accounts', {
      fields: ['parentAccountId'],
      type: 'foreign key',
      name: 'fk_finance_accounts_parentAccountId',
      references: {
        table: 'finance_accounts',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('finance_budgets', {
      fields: ['accountId'],
      type: 'foreign key',
      name: 'fk_finance_budgets_accountId',
      references: {
        table: 'finance_accounts',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('finance_invoice_items', {
      fields: ['invoiceId'],
      type: 'foreign key',
      name: 'fk_finance_invoice_items_invoiceId',
      references: {
        table: 'finance_invoices',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('finance_invoice_payments', {
      fields: ['invoiceId'],
      type: 'foreign key',
      name: 'fk_finance_invoice_payments_invoiceId',
      references: {
        table: 'finance_invoices',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('finance_payable_payments', {
      fields: ['payableId'],
      type: 'foreign key',
      name: 'fk_finance_payable_payments_payableId',
      references: {
        table: 'finance_payables',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('finance_receivable_payments', {
      fields: ['receivableId'],
      type: 'foreign key',
      name: 'fk_finance_receivable_payments_receivableId',
      references: {
        table: 'finance_receivables',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('finance_transactions', {
      fields: ['accountId'],
      type: 'foreign key',
      name: 'fk_finance_transactions_accountId',
      references: {
        table: 'finance_accounts',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('finance_transactions', {
      fields: ['branch_id'],
      type: 'foreign key',
      name: 'fk_finance_transactions_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('kitchen_recipes', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_kitchen_recipes_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_recipe_ingredients', {
      fields: ['recipe_id'],
      type: 'foreign key',
      name: 'fk_kitchen_recipe_ingredients_recipe_id',
      references: {
        table: 'kitchen_recipes',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_recipe_ingredients', {
      fields: ['inventory_item_id'],
      type: 'foreign key',
      name: 'fk_kitchen_recipe_ingredients_inventory_item_id',
      references: {
        table: 'kitchen_inventory_items',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_recipe_ingredients', {
      fields: ['product_id'],
      type: 'foreign key',
      name: 'fk_kitchen_recipe_ingredients_product_id',
      references: {
        table: 'products',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('kitchen_staff', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'fk_kitchen_staff_user_id',
      references: {
        table: 'users',
        field: 'id'
      },
    });

    await queryInterface.addConstraint('promo_bundles', {
      fields: ['promoId'],
      type: 'foreign key',
      name: 'fk_promo_bundles_promoId',
      references: {
        table: 'promos',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('promo_categories', {
      fields: ['promoId'],
      type: 'foreign key',
      name: 'fk_promo_categories_promoId',
      references: {
        table: 'promos',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('promo_products', {
      fields: ['promoId'],
      type: 'foreign key',
      name: 'fk_promo_products_promoId',
      references: {
        table: 'promos',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    await queryInterface.addConstraint('audit_logs', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_audit_logs_userId',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('audit_logs', {
      fields: ['target_branch_id'],
      type: 'foreign key',
      name: 'fk_audit_logs_target_branch_id',
      references: {
        table: 'branches',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    await queryInterface.addConstraint('notification_settings', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_notification_settings_userId',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'NO ACTION',
    });

    await queryInterface.addConstraint('system_backups', {
      fields: ['createdBy'],
      type: 'foreign key',
      name: 'fk_system_backups_createdBy',
      references: {
        table: 'users',
        field: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });


  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('vouchers', { cascade: true });
    await queryInterface.dropTable('units', { cascade: true });
    await queryInterface.dropTable('system_backups', { cascade: true });
    await queryInterface.dropTable('roles', { cascade: true });
    await queryInterface.dropTable('printer_configs', { cascade: true });
    await queryInterface.dropTable('notification_settings', { cascade: true });
    await queryInterface.dropTable('audit_logs', { cascade: true });
    await queryInterface.dropTable('promo_products', { cascade: true });
    await queryInterface.dropTable('promo_categories', { cascade: true });
    await queryInterface.dropTable('promo_bundles', { cascade: true });
    await queryInterface.dropTable('promos', { cascade: true });
    await queryInterface.dropTable('kitchen_staff', { cascade: true });
    await queryInterface.dropTable('kitchen_settings', { cascade: true });
    await queryInterface.dropTable('kitchen_recipe_ingredients', { cascade: true });
    await queryInterface.dropTable('kitchen_recipes', { cascade: true });
    await queryInterface.dropTable('finance_transactions', { cascade: true });
    await queryInterface.dropTable('finance_receivable_payments', { cascade: true });
    await queryInterface.dropTable('finance_receivables', { cascade: true });
    await queryInterface.dropTable('finance_payable_payments', { cascade: true });
    await queryInterface.dropTable('finance_payables', { cascade: true });
    await queryInterface.dropTable('finance_invoice_payments', { cascade: true });
    await queryInterface.dropTable('finance_invoice_items', { cascade: true });
    await queryInterface.dropTable('finance_invoices', { cascade: true });
    await queryInterface.dropTable('finance_budgets', { cascade: true });
    await queryInterface.dropTable('finance_accounts', { cascade: true });
    await queryInterface.dropTable('mfg_settings', { cascade: true });
    await queryInterface.dropTable('mfg_shift_productions', { cascade: true });
    await queryInterface.dropTable('mfg_production_costs', { cascade: true });
    await queryInterface.dropTable('mfg_waste_records', { cascade: true });
    await queryInterface.dropTable('mfg_production_plan_items', { cascade: true });
    await queryInterface.dropTable('mfg_production_plans', { cascade: true });
    await queryInterface.dropTable('mfg_maintenance_records', { cascade: true });
    await queryInterface.dropTable('mfg_machines', { cascade: true });
    await queryInterface.dropTable('mfg_qc_results', { cascade: true });
    await queryInterface.dropTable('mfg_qc_inspections', { cascade: true });
    await queryInterface.dropTable('mfg_qc_templates', { cascade: true });
    await queryInterface.dropTable('mfg_wo_outputs', { cascade: true });
    await queryInterface.dropTable('mfg_wo_operations', { cascade: true });
    await queryInterface.dropTable('mfg_wo_materials', { cascade: true });
    await queryInterface.dropTable('mfg_work_orders', { cascade: true });
    await queryInterface.dropTable('mfg_routing_operations', { cascade: true });
    await queryInterface.dropTable('mfg_routings', { cascade: true });
    await queryInterface.dropTable('mfg_bom_items', { cascade: true });
    await queryInterface.dropTable('mfg_bom', { cascade: true });
    await queryInterface.dropTable('mfg_work_centers', { cascade: true });
    await queryInterface.dropTable('crm_custom_dashboards', { cascade: true });
    await queryInterface.dropTable('crm_saved_reports', { cascade: true });
    await queryInterface.dropTable('crm_document_templates', { cascade: true });
    await queryInterface.dropTable('crm_documents', { cascade: true });
    await queryInterface.dropTable('crm_automation_logs', { cascade: true });
    await queryInterface.dropTable('crm_automation_rules', { cascade: true });
    await queryInterface.dropTable('crm_satisfaction', { cascade: true });
    await queryInterface.dropTable('crm_sla_policies', { cascade: true });
    await queryInterface.dropTable('crm_ticket_comments', { cascade: true });
    await queryInterface.dropTable('crm_tickets', { cascade: true });
    await queryInterface.dropTable('crm_deal_scores', { cascade: true });
    await queryInterface.dropTable('crm_forecast_items', { cascade: true });
    await queryInterface.dropTable('crm_forecasts', { cascade: true });
    await queryInterface.dropTable('crm_calendar_events', { cascade: true });
    await queryInterface.dropTable('crm_task_templates', { cascade: true });
    await queryInterface.dropTable('crm_tasks', { cascade: true });
    await queryInterface.dropTable('crm_comm_campaigns', { cascade: true });
    await queryInterface.dropTable('crm_email_templates', { cascade: true });
    await queryInterface.dropTable('crm_follow_ups', { cascade: true });
    await queryInterface.dropTable('crm_communications', { cascade: true });
    await queryInterface.dropTable('crm_customer_tags', { cascade: true });
    await queryInterface.dropTable('crm_customer_segments', { cascade: true });
    await queryInterface.dropTable('crm_interactions', { cascade: true });
    await queryInterface.dropTable('crm_contacts', { cascade: true });
    await queryInterface.dropTable('crm_customers', { cascade: true });
    await queryInterface.dropTable('mkt_campaign_audiences', { cascade: true });
    await queryInterface.dropTable('mkt_budget_items', { cascade: true });
    await queryInterface.dropTable('mkt_budgets', { cascade: true });
    await queryInterface.dropTable('mkt_content_assets', { cascade: true });
    await queryInterface.dropTable('mkt_promotion_usage', { cascade: true });
    await queryInterface.dropTable('mkt_promotions', { cascade: true });
    await queryInterface.dropTable('mkt_segment_rules', { cascade: true });
    await queryInterface.dropTable('mkt_segments', { cascade: true });
    await queryInterface.dropTable('mkt_campaign_channels', { cascade: true });
    await queryInterface.dropTable('mkt_campaigns', { cascade: true });
    await queryInterface.dropTable('sfa_strategy_kpis', { cascade: true });
    await queryInterface.dropTable('sfa_sales_strategies', { cascade: true });
    await queryInterface.dropTable('sfa_outlet_targets', { cascade: true });
    await queryInterface.dropTable('sfa_commission_group_products', { cascade: true });
    await queryInterface.dropTable('sfa_commission_groups', { cascade: true });
    await queryInterface.dropTable('sfa_product_commissions', { cascade: true });
    await queryInterface.dropTable('sfa_geofences', { cascade: true });
    await queryInterface.dropTable('sfa_approval_requests', { cascade: true });
    await queryInterface.dropTable('sfa_approval_steps', { cascade: true });
    await queryInterface.dropTable('sfa_approval_workflows', { cascade: true });
    await queryInterface.dropTable('sfa_survey_responses', { cascade: true });
    await queryInterface.dropTable('sfa_survey_questions', { cascade: true });
    await queryInterface.dropTable('sfa_survey_templates', { cascade: true });
    await queryInterface.dropTable('sfa_competitor_activities', { cascade: true });
    await queryInterface.dropTable('sfa_display_items', { cascade: true });
    await queryInterface.dropTable('sfa_display_audits', { cascade: true });
    await queryInterface.dropTable('sfa_field_order_items', { cascade: true });
    await queryInterface.dropTable('sfa_field_orders', { cascade: true });
    await queryInterface.dropTable('sfa_coverage_assignments', { cascade: true });
    await queryInterface.dropTable('sfa_coverage_plans', { cascade: true });
    await queryInterface.dropTable('sfa_parameters', { cascade: true });
    await queryInterface.dropTable('sfa_plafon_usage', { cascade: true });
    await queryInterface.dropTable('sfa_plafon', { cascade: true });
    await queryInterface.dropTable('sfa_incentive_calculations', { cascade: true });
    await queryInterface.dropTable('sfa_incentive_tiers', { cascade: true });
    await queryInterface.dropTable('sfa_incentive_schemes', { cascade: true });
    await queryInterface.dropTable('sfa_achievement_details', { cascade: true });
    await queryInterface.dropTable('sfa_achievements', { cascade: true });
    await queryInterface.dropTable('sfa_target_products', { cascade: true });
    await queryInterface.dropTable('sfa_target_assignments', { cascade: true });
    await queryInterface.dropTable('sfa_target_groups', { cascade: true });
    await queryInterface.dropTable('sfa_team_members', { cascade: true });
    await queryInterface.dropTable('sfa_teams', { cascade: true });
    await queryInterface.dropTable('sfa_route_plans', { cascade: true });
    await queryInterface.dropTable('sfa_quotation_items', { cascade: true });
    await queryInterface.dropTable('sfa_quotations', { cascade: true });
    await queryInterface.dropTable('sfa_targets', { cascade: true });
    await queryInterface.dropTable('sfa_visits', { cascade: true });
    await queryInterface.dropTable('sfa_activities', { cascade: true });
    await queryInterface.dropTable('sfa_opportunities', { cascade: true });
    await queryInterface.dropTable('sfa_leads', { cascade: true });
    await queryInterface.dropTable('sfa_territories', { cascade: true });
    await queryInterface.dropTable('integration_requests', { cascade: true });
    await queryInterface.dropTable('integration_configs', { cascade: true });
    await queryInterface.dropTable('integration_providers', { cascade: true });
    await queryInterface.dropTable('fleet_fuel_transactions', { cascade: true });
    await queryInterface.dropTable('fleet_maintenance_schedules', { cascade: true });
    await queryInterface.dropTable('fleet_gps_locations', { cascade: true });
    await queryInterface.dropTable('fleet_route_assignments', { cascade: true });
    await queryInterface.dropTable('fleet_routes', { cascade: true });
    await queryInterface.dropTable('fleet_drivers', { cascade: true });
    await queryInterface.dropTable('fleet_vehicles', { cascade: true });
    await queryInterface.dropTable('attendance_settings', { cascade: true });
    await queryInterface.dropTable('attendance_device_logs', { cascade: true });
    await queryInterface.dropTable('attendance_devices', { cascade: true });
    await queryInterface.dropTable('hris_webhook_logs', { cascade: true });
    await queryInterface.dropTable('leave_requests', { cascade: true });
    await queryInterface.dropTable('performance_reviews', { cascade: true });
    await queryInterface.dropTable('kpi_scoring', { cascade: true });
    await queryInterface.dropTable('kpi_templates', { cascade: true });
    await queryInterface.dropTable('employee_kpis', { cascade: true });
    await queryInterface.dropTable('employee_attendance', { cascade: true });
    await queryInterface.dropTable('kyb_documents', { cascade: true });
    await queryInterface.dropTable('kyb_applications', { cascade: true });
    await queryInterface.dropTable('activation_requests', { cascade: true });
    await queryInterface.dropTable('partner_users', { cascade: true });
    await queryInterface.dropTable('partner_outlets', { cascade: true });
    await queryInterface.dropTable('partner_subscriptions', { cascade: true });
    await queryInterface.dropTable('subscription_packages', { cascade: true });
    await queryInterface.dropTable('partners', { cascade: true });
    await queryInterface.dropTable('sync_logs', { cascade: true });
    await queryInterface.dropTable('branch_modules', { cascade: true });
    await queryInterface.dropTable('branch_setups', { cascade: true });
    await queryInterface.dropTable('branch_realtime_metrics', { cascade: true });
    await queryInterface.dropTable('kitchen_inventory_transactions', { cascade: true });
    await queryInterface.dropTable('kitchen_inventory_items', { cascade: true });
    await queryInterface.dropTable('kitchen_order_items', { cascade: true });
    await queryInterface.dropTable('kitchen_orders', { cascade: true });
    await queryInterface.dropTable('store_settings', { cascade: true });
    await queryInterface.dropTable('branches', { cascade: true });
    await queryInterface.dropTable('stores', { cascade: true });
    await queryInterface.dropTable('shift_templates', { cascade: true });
    await queryInterface.dropTable('employee_schedules', { cascade: true });
    await queryInterface.dropTable('alert_actions', { cascade: true });
    await queryInterface.dropTable('alert_subscriptions', { cascade: true });
    await queryInterface.dropTable('system_alerts', { cascade: true });
    await queryInterface.dropTable('production_waste', { cascade: true });
    await queryInterface.dropTable('production_history', { cascade: true });
    await queryInterface.dropTable('production_materials', { cascade: true });
    await queryInterface.dropTable('productions', { cascade: true });
    await queryInterface.dropTable('recipe_history', { cascade: true });
    await queryInterface.dropTable('recipe_ingredients', { cascade: true });
    await queryInterface.dropTable('recipes', { cascade: true });
    await queryInterface.dropTable('incident_reports', { cascade: true });
    await queryInterface.dropTable('stock_opname_items', { cascade: true });
    await queryInterface.dropTable('stock_opnames', { cascade: true });
    await queryInterface.dropTable('locations', { cascade: true });
    await queryInterface.dropTable('warehouses', { cascade: true });
    await queryInterface.dropTable('reward_redemptions', { cascade: true });
    await queryInterface.dropTable('point_transactions', { cascade: true });
    await queryInterface.dropTable('loyalty_rewards', { cascade: true });
    await queryInterface.dropTable('loyalty_tiers', { cascade: true });
    await queryInterface.dropTable('loyalty_programs', { cascade: true });
    await queryInterface.dropTable('customer_loyalty', { cascade: true });
    await queryInterface.dropTable('shift_handovers', { cascade: true });
    await queryInterface.dropTable('module_dependencies', { cascade: true });
    await queryInterface.dropTable('tenant_modules', { cascade: true });
    await queryInterface.dropTable('business_type_modules', { cascade: true });
    await queryInterface.dropTable('modules', { cascade: true });
    await queryInterface.dropTable('business_types', { cascade: true });
    await queryInterface.dropTable('tenants', { cascade: true });
    await queryInterface.dropTable('shifts', { cascade: true });
    await queryInterface.dropTable('product_cost_components', { cascade: true });
    await queryInterface.dropTable('product_cost_history', { cascade: true });
    await queryInterface.dropTable('table_sessions', { cascade: true });
    await queryInterface.dropTable('reservations', { cascade: true });
    await queryInterface.dropTable('tables', { cascade: true });
    await queryInterface.dropTable('held_transactions', { cascade: true });
    await queryInterface.dropTable('pos_transaction_items', { cascade: true });
    await queryInterface.dropTable('pos_transactions', { cascade: true });
    await queryInterface.dropTable('goods_receipt_items', { cascade: true });
    await queryInterface.dropTable('goods_receipts', { cascade: true });
    await queryInterface.dropTable('sales_order_items', { cascade: true });
    await queryInterface.dropTable('sales_orders', { cascade: true });
    await queryInterface.dropTable('purchase_order_items', { cascade: true });
    await queryInterface.dropTable('purchase_orders', { cascade: true });
    await queryInterface.dropTable('stock_adjustment_items', { cascade: true });
    await queryInterface.dropTable('stock_adjustments', { cascade: true });
    await queryInterface.dropTable('stock_movements', { cascade: true });
    await queryInterface.dropTable('inventory_stock', { cascade: true });
    await queryInterface.dropTable('suppliers', { cascade: true });
    await queryInterface.dropTable('products', { cascade: true });
    await queryInterface.dropTable('categories', { cascade: true });
    await queryInterface.dropTable('employees', { cascade: true });
    await queryInterface.dropTable('customers', { cascade: true });
    await queryInterface.dropTable('users', { cascade: true });

  }
};
  