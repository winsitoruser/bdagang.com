'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create loyalty_programs table
    await queryInterface.createTable('loyalty_programs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      programName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      pointsPerCurrency: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 1.0
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    const { loyaltyProgramFkType, seedProgramId } = await (async () => {
      try {
        const d = await queryInterface.describeTable('loyalty_programs');
        const ty = String(d.id?.type || '').toLowerCase();
        if (/int|serial|bigint|smallint/.test(ty)) {
          return {
            loyaltyProgramFkType: Sequelize.INTEGER,
            seedProgramId: 1
          };
        }
      } catch (_) {
        /* table missing */
      }
      return {
        loyaltyProgramFkType: Sequelize.UUID,
        seedProgramId: '00000000-0000-0000-0000-000000000001'
      };
    })();

    // Create loyalty_tiers table
    await queryInterface.createTable('loyalty_tiers', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      programId: {
        type: loyaltyProgramFkType,
        allowNull: false,
        references: {
          model: 'loyalty_programs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      tierName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      tierLevel: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      minSpending: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: false,
        defaultValue: 0
      },
      pointMultiplier: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 1.0
      },
      discountPercentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0
      },
      benefits: {
        type: Sequelize.JSON
      },
      color: {
        type: Sequelize.STRING(100)
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    // Create loyalty_rewards table
    await queryInterface.createTable('loyalty_rewards', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      programId: {
        type: loyaltyProgramFkType,
        allowNull: false,
        references: {
          model: 'loyalty_programs',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      rewardName: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      pointsCost: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      rewardType: {
        type: Sequelize.ENUM('voucher', 'product', 'discount', 'merchandise'),
        allowNull: false,
        defaultValue: 'voucher'
      },
      rewardValue: {
        type: Sequelize.DECIMAL(15, 2)
      },
      stockQuantity: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      claimedCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      expiryDate: {
        type: Sequelize.DATE
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    const seq = queryInterface.sequelize;
    await seq.query(`
      CREATE INDEX IF NOT EXISTS loyalty_tiers_program_id_tier_level ON loyalty_tiers ("programId", "tierLevel");
      CREATE INDEX IF NOT EXISTS loyalty_tiers_min_spending ON loyalty_tiers ("minSpending");
      CREATE INDEX IF NOT EXISTS loyalty_rewards_program_id ON loyalty_rewards ("programId");
      CREATE INDEX IF NOT EXISTS loyalty_rewards_points_cost ON loyalty_rewards ("pointsCost");
      CREATE INDEX IF NOT EXISTS loyalty_rewards_reward_type ON loyalty_rewards ("rewardType");
    `);

    const lpCols = await queryInterface.describeTable('loyalty_programs').catch(() => ({}));
    const seedCamelLp =
      lpCols.programName &&
      lpCols.pointsPerCurrency !== undefined;
    const [[{ progCnt }]] = await seq.query(
      'SELECT COUNT(*)::int AS "progCnt" FROM loyalty_programs'
    );

    // Insert default program (only if schema matches this migration's camelCase columns)
    if (seedCamelLp && Number(progCnt) === 0) {
      await queryInterface.bulkInsert('loyalty_programs', [{
      id: seedProgramId,
      programName: 'BEDAGANG Loyalty Program',
      description: 'Program loyalitas untuk pelanggan setia BEDAGANG',
      pointsPerCurrency: 1.0,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
      }]);
    }

    const ltCols = await queryInterface.describeTable('loyalty_tiers').catch(() => ({}));
    const seedCamelLt = ltCols.tierName && ltCols.programId !== undefined;
    const [[{ tierCnt }]] = await seq.query(
      'SELECT COUNT(*)::int AS "tierCnt" FROM loyalty_tiers'
    );

    // Insert default tiers
    if (seedCamelLt && Number(tierCnt) === 0 && seedCamelLp) {
      await queryInterface.bulkInsert('loyalty_tiers', [
      {
        id: Sequelize.literal('UUID()'),
        programId: seedProgramId,
        tierName: 'Bronze',
        tierLevel: 1,
        minSpending: 0,
        pointMultiplier: 1.0,
        discountPercentage: 5,
        benefits: JSON.stringify(['Diskon 5%', 'Poin 1x']),
        color: 'bg-orange-600',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        programId: seedProgramId,
        tierName: 'Silver',
        tierLevel: 2,
        minSpending: 1000000,
        pointMultiplier: 1.5,
        discountPercentage: 10,
        benefits: JSON.stringify(['Diskon 10%', 'Poin 1.5x', 'Free Shipping']),
        color: 'bg-gray-400',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        programId: seedProgramId,
        tierName: 'Gold',
        tierLevel: 3,
        minSpending: 5000000,
        pointMultiplier: 2.0,
        discountPercentage: 15,
        benefits: JSON.stringify(['Diskon 15%', 'Poin 2x', 'Free Shipping', 'Priority Support']),
        color: 'bg-yellow-500',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        programId: seedProgramId,
        tierName: 'Platinum',
        tierLevel: 4,
        minSpending: 10000000,
        pointMultiplier: 3.0,
        discountPercentage: 20,
        benefits: JSON.stringify(['Diskon 20%', 'Poin 3x', 'Free Shipping', 'Priority Support', 'Exclusive Deals']),
        color: 'bg-purple-600',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      ]);
    }

    const lrCols = await queryInterface.describeTable('loyalty_rewards').catch(() => ({}));
    const seedCamelLr =
      lrCols.rewardName && lrCols.programId !== undefined;
    const [[{ rewCnt }]] = await seq.query(
      'SELECT COUNT(*)::int AS "rewCnt" FROM loyalty_rewards'
    );

    // Insert default rewards
    if (seedCamelLr && Number(rewCnt) === 0 && seedCamelLp) {
      await queryInterface.bulkInsert('loyalty_rewards', [
      {
        id: Sequelize.literal('UUID()'),
        programId: seedProgramId,
        rewardName: 'Voucher Rp 50.000',
        description: 'Voucher belanja senilai Rp 50.000',
        pointsCost: 500,
        rewardType: 'voucher',
        rewardValue: 50000,
        stockQuantity: 100,
        claimedCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        programId: seedProgramId,
        rewardName: 'Voucher Rp 100.000',
        description: 'Voucher belanja senilai Rp 100.000',
        pointsCost: 1000,
        rewardType: 'voucher',
        rewardValue: 100000,
        stockQuantity: 50,
        claimedCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        programId: seedProgramId,
        rewardName: 'Free Product Sample',
        description: 'Sample produk gratis pilihan',
        pointsCost: 250,
        rewardType: 'product',
        stockQuantity: 200,
        claimedCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: Sequelize.literal('UUID()'),
        programId: seedProgramId,
        rewardName: 'Exclusive Merchandise',
        description: 'Merchandise eksklusif BEDAGANG',
        pointsCost: 2000,
        rewardType: 'merchandise',
        stockQuantity: 30,
        claimedCount: 0,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      ]);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('loyalty_rewards');
    await queryInterface.dropTable('loyalty_tiers');
    await queryInterface.dropTable('loyalty_programs');
  }
};
