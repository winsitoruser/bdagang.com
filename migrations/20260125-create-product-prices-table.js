'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const seq = queryInterface.sequelize;
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((t) =>
      typeof t === 'string' ? t : String(Object.values(t)[0] ?? '')
    );
    const hasProductPrices = tableNames.some(
      (n) => String(n).toLowerCase() === 'product_prices'
    );
    const hasLoyaltyTiers = tableNames.some(
      (n) => String(n).toLowerCase() === 'loyalty_tiers'
    );
    const tierIdOpts = {
      type: Sequelize.UUID,
      allowNull: true,
      comment: 'Link to specific loyalty tier (optional)',
      ...(hasLoyaltyTiers
        ? {
            references: { model: 'loyalty_tiers', key: 'id' },
            onUpdate: 'CASCADE',
            onDelete: 'SET NULL'
          }
        : {})
    };

    await seq.query(`
      DO 'BEGIN CREATE TYPE "public"."enum_product_prices_price_type" AS ENUM(''regular'', ''member'', ''tier_bronze'', ''tier_silver'', ''tier_gold'', ''tier_platinum''); EXCEPTION WHEN duplicate_object THEN null; END';
    `);

    if (!hasProductPrices) {
      await queryInterface.createTable('product_prices', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        product_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id'
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE'
        },
        price_type: {
          type: Sequelize.ENUM(
            'regular',
            'member',
            'tier_bronze',
            'tier_silver',
            'tier_gold',
            'tier_platinum'
          ),
          allowNull: false,
          defaultValue: 'regular',
          comment:
            'Tipe harga: regular (non-member), member (all members), atau tier-specific'
        },
        tier_id: tierIdOpts,
        price: {
          type: Sequelize.DECIMAL(15, 2),
          allowNull: false,
          comment: 'Harga untuk tipe/tier ini'
        },
        discount_percentage: {
          type: Sequelize.DECIMAL(5, 2),
          defaultValue: 0,
          comment: 'Diskon dalam persen dari harga regular'
        },
        discount_amount: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0,
          comment: 'Diskon dalam nominal rupiah'
        },
        min_quantity: {
          type: Sequelize.INTEGER,
          defaultValue: 1,
          comment: 'Minimum quantity untuk harga ini'
        },
        max_quantity: {
          type: Sequelize.INTEGER,
          allowNull: true,
          comment: 'Maximum quantity untuk harga ini (null = unlimited)'
        },
        start_date: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Tanggal mulai berlaku'
        },
        end_date: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: 'Tanggal berakhir (null = permanent)'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        priority: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          comment:
            'Priority untuk menentukan harga mana yang digunakan (higher = higher priority)'
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
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
      });
    } else {
      const d = await queryInterface.describeTable('product_prices');
      const addIfMissing = async (column, options) => {
        if (d[column]) return;
        await queryInterface.addColumn('product_prices', column, options);
        d[column] = true;
      };

      await addIfMissing('product_id', {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      });
      await addIfMissing('price_type', {
        type: Sequelize.ENUM(
          'regular',
          'member',
          'tier_bronze',
          'tier_silver',
          'tier_gold',
          'tier_platinum'
        ),
        allowNull: false,
        defaultValue: 'regular'
      });
      await addIfMissing('tier_id', tierIdOpts);
      await addIfMissing('price', {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false
      });
      await addIfMissing('discount_percentage', {
        type: Sequelize.DECIMAL(5, 2),
        defaultValue: 0
      });
      await addIfMissing('discount_amount', {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      });
      await addIfMissing('min_quantity', {
        type: Sequelize.INTEGER,
        defaultValue: 1
      });
      await addIfMissing('max_quantity', {
        type: Sequelize.INTEGER,
        allowNull: true
      });
      await addIfMissing('start_date', {
        type: Sequelize.DATE,
        allowNull: true
      });
      await addIfMissing('end_date', {
        type: Sequelize.DATE,
        allowNull: true
      });
      await addIfMissing('is_active', {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      });
      await addIfMissing('priority', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      });
      await addIfMissing('notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      await addIfMissing('created_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
      await addIfMissing('updated_at', {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      });
    }

    const ppDesc = await queryInterface.describeTable('product_prices');
    const idxSpecs = [
      ['product_prices_product_id_idx', ['product_id']],
      ['product_prices_price_type_idx', ['price_type']],
      ['product_prices_tier_id_idx', ['tier_id']],
      ['product_prices_is_active_idx', ['is_active']],
      ['product_price_type_idx', ['product_id', 'price_type']]
    ];
    for (const [idxName, fields] of idxSpecs) {
      const ok = fields.every((f) => ppDesc[f]);
      if (ok) {
        const cols = fields.map((c) => `"${c}"`).join(', ');
        await seq.query(
          `CREATE INDEX IF NOT EXISTS "${idxName}" ON product_prices (${cols});`
        );
      }
    }

    if (ppDesc.product_id && ppDesc.price_type && ppDesc.tier_id) {
      await seq.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS product_price_type_unique
        ON product_prices ("product_id", "price_type")
        WHERE tier_id IS NULL;
      `);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('product_prices');
  }
};
