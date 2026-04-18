'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const promoFkType = await (async () => {
      try {
        const d = await queryInterface.describeTable('promos');
        const ty = String(d.id?.type || '').toLowerCase();
        if (/int|serial|bigint|smallint/.test(ty)) return Sequelize.INTEGER;
      } catch (_) {}
      return Sequelize.UUID;
    })();

    const productFkType = await (async () => {
      try {
        const d = await queryInterface.describeTable('products');
        const ty = String(d.id?.type || '').toLowerCase();
        if (/int|serial|bigint|smallint/.test(ty)) return Sequelize.INTEGER;
      } catch (_) {}
      return Sequelize.UUID;
    })();

    const categoryFkType = await (async () => {
      try {
        const d = await queryInterface.describeTable('categories');
        const ty = String(d.id?.type || '').toLowerCase();
        if (/int|serial|bigint|smallint/.test(ty)) return Sequelize.INTEGER;
      } catch (_) {}
      return Sequelize.UUID;
    })();

    // Create promo_products table
    await queryInterface.createTable('promo_products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      promoId: {
        type: promoFkType,
        allowNull: false,
        references: {
          model: 'promos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Reference to promo'
      },
      productId: {
        type: productFkType,
        allowNull: false,
        comment: 'Product ID from inventory'
      },
      productName: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Product name (cached for performance)'
      },
      productSku: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Product SKU'
      },
      discountType: {
        type: Sequelize.ENUM('percentage', 'fixed', 'override_price'),
        allowNull: false,
        defaultValue: 'percentage',
        comment: 'Type of discount for this product'
      },
      discountValue: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Discount value (percentage or amount)'
      },
      minQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Minimum quantity to get discount'
      },
      maxQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Maximum quantity eligible for discount'
      },
      overridePrice: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Override price (if discountType is override_price)'
      },
      quantityTiers: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Quantity-based discount tiers: [{minQty, maxQty, discount}]'
      },
      checkStock: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Check stock before applying promo'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create promo_bundles table
    await queryInterface.createTable('promo_bundles', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      promoId: {
        type: promoFkType,
        allowNull: false,
        references: {
          model: 'promos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Reference to promo'
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Bundle name'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Bundle description'
      },
      bundleType: {
        type: Sequelize.ENUM('fixed_bundle', 'mix_match', 'buy_x_get_y', 'quantity_discount'),
        allowNull: false,
        defaultValue: 'fixed_bundle',
        comment: 'Type of bundle'
      },
      bundleProducts: {
        type: Sequelize.JSON,
        allowNull: false,
        comment: 'Array of {productId, quantity, isFree, discountPercent}'
      },
      minQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Minimum quantity to qualify'
      },
      maxQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Maximum quantity allowed'
      },
      bundlePrice: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Fixed bundle price (if applicable)'
      },
      discountType: {
        type: Sequelize.ENUM('percentage', 'fixed', 'free_item'),
        allowNull: false,
        defaultValue: 'percentage'
      },
      discountValue: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Discount value for bundle'
      },
      requireAllProducts: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Must buy all products in bundle'
      },
      checkStock: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Check stock availability'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    // Create promo_categories table
    await queryInterface.createTable('promo_categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      promoId: {
        type: promoFkType,
        allowNull: false,
        references: {
          model: 'promos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Reference to promo'
      },
      categoryId: {
        type: categoryFkType,
        allowNull: false,
        comment: 'Category ID from inventory'
      },
      categoryName: {
        type: Sequelize.STRING(200),
        allowNull: false,
        comment: 'Category name (cached)'
      },
      discountType: {
        type: Sequelize.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'percentage'
      },
      discountValue: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Discount value'
      },
      minQuantity: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: 'Min quantity from this category'
      },
      maxDiscount: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Max discount for this category'
      },
      allowMixMatch: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Allow mixing products from this category'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW
      }
    });

    const seq = queryInterface.sequelize;
    await seq.query(`
      CREATE INDEX IF NOT EXISTS promo_products_promo_id_index ON promo_products ("promoId");
      CREATE INDEX IF NOT EXISTS promo_products_product_id_index ON promo_products ("productId");
      CREATE UNIQUE INDEX IF NOT EXISTS promo_products_promo_product_unique ON promo_products ("promoId", "productId");
      CREATE INDEX IF NOT EXISTS promo_bundles_promo_id_index ON promo_bundles ("promoId");
      CREATE INDEX IF NOT EXISTS promo_bundles_type_index ON promo_bundles ("bundleType");
      CREATE INDEX IF NOT EXISTS promo_categories_promo_id_index ON promo_categories ("promoId");
      CREATE INDEX IF NOT EXISTS promo_categories_category_id_index ON promo_categories ("categoryId");
    `);

    const pd = await queryInterface.describeTable('promos');
    const addCol = async (col, opts) => {
      if (pd[col]) return;
      await queryInterface.addColumn('promos', col, opts);
      pd[col] = true;
    };

    // Update promos table - add new fields
    await addCol('promoScope', {
      type: Sequelize.ENUM('general', 'product_specific', 'category', 'bundle'),
      allowNull: false,
      defaultValue: 'general',
      comment: 'Scope of promo application'
    });

    await addCol('autoApply', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Auto-apply promo at checkout'
    });

    await addCol('stackable', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Can be combined with other promos'
    });

    await addCol('priority', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Priority for auto-apply (higher = first)'
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove columns from promos
    await queryInterface.removeColumn('promos', 'priority');
    await queryInterface.removeColumn('promos', 'stackable');
    await queryInterface.removeColumn('promos', 'autoApply');
    await queryInterface.removeColumn('promos', 'promoScope');

    // Drop tables
    await queryInterface.dropTable('promo_categories');
    await queryInterface.dropTable('promo_bundles');
    await queryInterface.dropTable('promo_products');
  }
};
