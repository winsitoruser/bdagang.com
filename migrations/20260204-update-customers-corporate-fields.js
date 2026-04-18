'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    let d;
    try {
      d = await queryInterface.describeTable('customers');
    } catch (_) {
      console.warn(
        '⚠️  Skipping corporate fields migration: customers table missing'
      );
      return;
    }

    const addIfMissing = async (column, options) => {
      if (d[column]) return;
      await queryInterface.addColumn('customers', column, options);
      d[column] = true;
    };

    await addIfMissing('customerType', {
      type: Sequelize.ENUM('individual', 'corporate'),
      defaultValue: 'individual',
      allowNull: false
    });

    await addIfMissing('companyName', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await addIfMissing('picName', {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Person In Charge Name'
    });

    await addIfMissing('picPosition', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Person In Charge Position'
    });

    await addIfMissing('contact1', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Primary Contact Number'
    });

    await addIfMissing('contact2', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Secondary Contact Number'
    });

    await addIfMissing('companyEmail', {
      type: Sequelize.STRING(255),
      allowNull: true
    });

    await addIfMissing('companyAddress', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await addIfMissing('taxId', {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'NPWP or Tax ID'
    });

    const seq = queryInterface.sequelize;
    if (d.customerType) {
      await seq.query(
        `CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON customers ("customerType");`
      );
    }
    if (d.companyName) {
      await seq.query(
        `CREATE INDEX IF NOT EXISTS idx_customers_company_name ON customers ("companyName");`
      );
    }

    console.log('✅ Customer table updated with corporate fields');
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('customers', 'idx_customers_customer_type');
    await queryInterface.removeIndex('customers', 'idx_customers_company_name');

    await queryInterface.removeColumn('customers', 'taxId');
    await queryInterface.removeColumn('customers', 'companyAddress');
    await queryInterface.removeColumn('customers', 'companyEmail');
    await queryInterface.removeColumn('customers', 'contact2');
    await queryInterface.removeColumn('customers', 'contact1');
    await queryInterface.removeColumn('customers', 'picPosition');
    await queryInterface.removeColumn('customers', 'picName');
    await queryInterface.removeColumn('customers', 'companyName');
    await queryInterface.removeColumn('customers', 'customerType');
  }
};
