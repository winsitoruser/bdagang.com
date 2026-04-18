'use strict';

/**
 * Migration: Add HPP (Harga Pokok Penjualan) Fields to Products
 * 
 * This migration adds:
 * 1. HPP-related fields to products table
 * 2. product_cost_history table for tracking HPP changes
 * 3. product_cost_components table for detailed cost breakdown
 */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      const sequelize = queryInterface.sequelize;

      // 1. Add HPP fields to products table (skip columns already present from earlier migrations)
      const pd = await queryInterface.describeTable('products', { transaction });
      const addIfMissing = async (col, def) => {
        if (pd[col]) return;
        const { comment: _c, ...rest } = def;
        await queryInterface.addColumn('products', col, rest, { transaction });
        pd[col] = true;
      };

      await addIfMissing('hpp', {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
        comment: 'Harga Pokok Penjualan (Cost of Goods Sold)'
      });

      await addIfMissing('hpp_method', {
        type: Sequelize.STRING(20),
        defaultValue: 'average',
        comment: 'fifo, lifo, average, standard'
      });

      await addIfMissing('last_purchase_price', {
        type: Sequelize.DECIMAL(15, 2),
        comment: 'Last purchase price from PO'
      });

      await addIfMissing('average_purchase_price', {
        type: Sequelize.DECIMAL(15, 2),
        comment: 'Average purchase price'
      });

      await addIfMissing('standard_cost', {
        type: Sequelize.DECIMAL(15, 2),
        comment: 'Standard/predetermined cost'
      });

      await addIfMissing('margin_amount', {
        type: Sequelize.DECIMAL(15, 2),
        comment: 'Selling Price - HPP'
      });

      await addIfMissing('margin_percentage', {
        type: Sequelize.DECIMAL(5, 2),
        comment: 'Margin / Selling Price * 100'
      });

      await addIfMissing('markup_percentage', {
        type: Sequelize.DECIMAL(5, 2),
        comment: 'Margin / HPP * 100'
      });

      await addIfMissing('min_margin_percentage', {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 20,
        comment: 'Minimum acceptable margin percentage'
      });

      await addIfMissing('packaging_cost', {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
        comment: 'Packaging cost per unit'
      });

      await addIfMissing('labor_cost', {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
        comment: 'Labor cost per unit'
      });

      await addIfMissing('overhead_cost', {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0,
        comment: 'Overhead cost per unit'
      });

      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_products_hpp ON "products" ("hpp")',
        { transaction }
      );

      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_products_margin ON "products" ("margin_percentage")',
        { transaction }
      );

      const pgUdtToSequelizeType = (udt) => {
        if (!udt) return Sequelize.UUID;
        const u = String(udt).toLowerCase();
        if (u === 'uuid') return Sequelize.UUID;
        if (u === 'int4' || u === 'integer') return Sequelize.INTEGER;
        if (u === 'int8') return Sequelize.BIGINT;
        return Sequelize.UUID;
      };

      const [productIdUdtRows] = await sequelize.query(
        `SELECT udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'id'`,
        { transaction }
      );
      const productIdType = pgUdtToSequelizeType(productIdUdtRows[0]?.udt_name);

      const ensureTableMerge = async (tableName, tableDef) => {
        const tableList = await queryInterface.showAllTables({ transaction });
        if (!tableList.includes(tableName)) {
          await queryInterface.createTable(tableName, tableDef, { transaction });
          return;
        }
        const d = await queryInterface.describeTable(tableName, { transaction });
        for (const [col, def] of Object.entries(tableDef)) {
          if (d[col]) continue;
          const { comment: _c, ...rest } = def;
          await queryInterface.addColumn(tableName, col, rest, { transaction });
          d[col] = true;
        }
      };

      // 2. Create product_cost_history table
      const productCostHistoryDef = {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true
        },
        product_id: {
          type: productIdType,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },

        old_hpp: {
          type: Sequelize.DECIMAL(15, 2)
        },
        new_hpp: {
          type: Sequelize.DECIMAL(15, 2)
        },
        change_amount: {
          type: Sequelize.DECIMAL(15, 2),
          comment: 'new_hpp - old_hpp'
        },
        change_percentage: {
          type: Sequelize.DECIMAL(5, 2),
          comment: 'Percentage change'
        },

        purchase_price: {
          type: Sequelize.DECIMAL(15, 2)
        },
        packaging_cost: {
          type: Sequelize.DECIMAL(15, 2)
        },
        labor_cost: {
          type: Sequelize.DECIMAL(15, 2)
        },
        overhead_cost: {
          type: Sequelize.DECIMAL(15, 2)
        },

        change_reason: {
          type: Sequelize.STRING(255),
          comment: 'purchase, adjustment, recipe_update, manual'
        },
        source_reference: {
          type: Sequelize.STRING(100),
          comment: 'PO number, adjustment ID, etc.'
        },
        notes: {
          type: Sequelize.TEXT
        },

        changed_by: {
          type: Sequelize.UUID
        },
        changed_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      };
      await ensureTableMerge('product_cost_history', productCostHistoryDef);

      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_cost_history_product ON "product_cost_history" ("product_id")',
        { transaction }
      );

      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_cost_history_date ON "product_cost_history" ("changed_at")',
        { transaction }
      );

      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_cost_history_reason ON "product_cost_history" ("change_reason")',
        { transaction }
      );

      // 3. Create product_cost_components table
      const productCostComponentsDef = {
        id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true
        },
        product_id: {
          type: productIdType,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE'
        },

        component_type: {
          type: Sequelize.STRING(50),
          allowNull: false,
          comment: 'material, packaging, labor, overhead, other'
        },
        component_name: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        component_description: {
          type: Sequelize.TEXT
        },

        cost_amount: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false
        },
        quantity: {
          type: Sequelize.DECIMAL(10, 3),
          defaultValue: 1
        },
        unit: {
          type: Sequelize.STRING(20)
        },

        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
      };
      await ensureTableMerge('product_cost_components', productCostComponentsDef);

      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_cost_components_product ON "product_cost_components" ("product_id")',
        { transaction }
      );

      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_cost_components_type ON "product_cost_components" ("component_type")',
        { transaction }
      );

      await sequelize.query(
        'CREATE INDEX IF NOT EXISTS idx_cost_components_active ON "product_cost_components" ("is_active")',
        { transaction }
      );

      await transaction.commit();
      console.log('✅ HPP fields migration completed successfully');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Migration failed:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    
    try {
      // Drop tables
      await queryInterface.dropTable('product_cost_components', { transaction });
      await queryInterface.dropTable('product_cost_history', { transaction });

      // Remove columns from products
      const columns = [
        'hpp',
        'hpp_method',
        'last_purchase_price',
        'average_purchase_price',
        'standard_cost',
        'margin_amount',
        'margin_percentage',
        'markup_percentage',
        'min_margin_percentage',
        'packaging_cost',
        'labor_cost',
        'overhead_cost'
      ];

      for (const column of columns) {
        await queryInterface.removeColumn('products', column, { transaction });
      }

      await transaction.commit();
      console.log('✅ HPP fields rollback completed');
      
    } catch (error) {
      await transaction.rollback();
      console.error('❌ Rollback failed:', error);
      throw error;
    }
  }
};
