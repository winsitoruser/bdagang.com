'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Create recipes table
    await queryInterface.createTable('recipes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      code: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      batch_size: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1
      },
      batch_unit: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pcs'
      },
      estimated_yield: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      yield_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 100
      },
      preparation_time_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      cooking_time_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_time_minutes: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      total_cost: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      labor_cost: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      overhead_cost: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      total_production_cost: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      cost_per_unit: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      difficulty_level: {
        type: Sequelize.ENUM('easy', 'medium', 'hard'),
        defaultValue: 'medium'
      },
      category: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'archived'),
        defaultValue: 'draft'
      },
      version: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      instructions: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create recipe_ingredients table
    await queryInterface.createTable('recipe_ingredients', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      recipe_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'recipes',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'products',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      quantity: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false
      },
      unit: {
        type: Sequelize.STRING(20),
        allowNull: false
      },
      unit_cost: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      subtotal_cost: {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      },
      is_optional: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      preparation_notes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    const sequelize = queryInterface.sequelize;

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS recipes_code ON "recipes" ("code")'
    );
    await sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'category'
        ) THEN
          EXECUTE 'CREATE INDEX IF NOT EXISTS recipes_category ON "recipes" ("category")';
        END IF;
      END $$;
    `);
    await sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'status'
        ) THEN
          EXECUTE 'CREATE INDEX IF NOT EXISTS recipes_status ON "recipes" ("status")';
        END IF;
      END $$;
    `);
    await sequelize.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public' AND table_name = 'recipes' AND column_name = 'created_by'
        ) THEN
          EXECUTE 'CREATE INDEX IF NOT EXISTS recipes_created_by ON "recipes" ("created_by")';
        END IF;
      END $$;
    `);

    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS recipe_ingredients_recipe_id ON "recipe_ingredients" ("recipe_id")'
    );
    await sequelize.query(
      'CREATE INDEX IF NOT EXISTS recipe_ingredients_product_id ON "recipe_ingredients" ("product_id")'
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('recipe_ingredients');
    await queryInterface.dropTable('recipes');
  }
};
