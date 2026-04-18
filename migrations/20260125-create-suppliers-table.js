'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const seq = queryInterface.sequelize;
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((t) =>
      typeof t === 'string' ? t : String(Object.values(t)[0] ?? '')
    );
    const hasSuppliers = tableNames.some(
      (n) => String(n).toLowerCase() === 'suppliers'
    );

    await seq.query(`
      DO 'BEGIN CREATE TYPE "public"."enum_suppliers_supplier_type" AS ENUM(''manufacturer'', ''distributor'', ''wholesaler'', ''retailer'', ''other''); EXCEPTION WHEN duplicate_object THEN null; END';
    `);

    if (!hasSuppliers) {
      await queryInterface.createTable('suppliers', {
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
        company_name: {
          type: Sequelize.STRING(255),
          allowNull: true
        },
        supplier_type: {
          type: Sequelize.ENUM(
            'manufacturer',
            'distributor',
            'wholesaler',
            'retailer',
            'other'
          ),
          defaultValue: 'distributor'
        },
        contact_person: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        phone: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        address: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        city: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        province: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        postal_code: {
          type: Sequelize.STRING(10),
          allowNull: true
        },
        country: {
          type: Sequelize.STRING(100),
          defaultValue: 'Indonesia'
        },
        tax_id: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'NPWP atau Tax ID'
        },
        payment_terms: {
          type: Sequelize.STRING(100),
          allowNull: true,
          comment: 'e.g., "Net 30", "COD", "Net 60"'
        },
        payment_method: {
          type: Sequelize.STRING(50),
          allowNull: true,
          comment: 'e.g., "Transfer", "Cash", "Credit"'
        },
        credit_limit: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        current_balance: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        currency: {
          type: Sequelize.STRING(3),
          defaultValue: 'IDR'
        },
        lead_time_days: {
          type: Sequelize.INTEGER,
          defaultValue: 0,
          comment: 'Default lead time untuk supplier ini'
        },
        minimum_order_value: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        rating: {
          type: Sequelize.DECIMAL(3, 2),
          defaultValue: 0,
          comment: 'Rating supplier (0-5)'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        is_preferred: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
          comment: 'Supplier pilihan utama'
        },
        notes: {
          type: Sequelize.TEXT,
          allowNull: true
        },
        bank_name: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        bank_account_number: {
          type: Sequelize.STRING(50),
          allowNull: true
        },
        bank_account_name: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        website: {
          type: Sequelize.STRING(255),
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
      const d = await queryInterface.describeTable('suppliers');
      const addIfMissing = async (column, options) => {
        if (d[column]) return;
        await queryInterface.addColumn('suppliers', column, options);
        d[column] = true;
      };

      await addIfMissing('code', {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      });
      await addIfMissing('name', {
        type: Sequelize.STRING(255),
        allowNull: false
      });
      await addIfMissing('company_name', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
      await addIfMissing('supplier_type', {
        type: Sequelize.ENUM(
          'manufacturer',
          'distributor',
          'wholesaler',
          'retailer',
          'other'
        ),
        defaultValue: 'distributor'
      });
      await addIfMissing('contact_person', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      await addIfMissing('phone', {
        type: Sequelize.STRING(20),
        allowNull: true
      });
      await addIfMissing('email', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      await addIfMissing('address', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      await addIfMissing('city', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      await addIfMissing('province', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      await addIfMissing('postal_code', {
        type: Sequelize.STRING(10),
        allowNull: true
      });
      await addIfMissing('country', {
        type: Sequelize.STRING(100),
        defaultValue: 'Indonesia'
      });
      await addIfMissing('tax_id', {
        type: Sequelize.STRING(50),
        allowNull: true
      });
      await addIfMissing('payment_terms', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      await addIfMissing('payment_method', {
        type: Sequelize.STRING(50),
        allowNull: true
      });
      await addIfMissing('credit_limit', {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      });
      await addIfMissing('current_balance', {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      });
      await addIfMissing('currency', {
        type: Sequelize.STRING(3),
        defaultValue: 'IDR'
      });
      await addIfMissing('lead_time_days', {
        type: Sequelize.INTEGER,
        defaultValue: 0
      });
      await addIfMissing('minimum_order_value', {
        type: Sequelize.DECIMAL(15, 2),
        defaultValue: 0
      });
      await addIfMissing('rating', {
        type: Sequelize.DECIMAL(3, 2),
        defaultValue: 0
      });
      await addIfMissing('is_active', {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      });
      await addIfMissing('is_preferred', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      });
      await addIfMissing('notes', {
        type: Sequelize.TEXT,
        allowNull: true
      });
      await addIfMissing('bank_name', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      await addIfMissing('bank_account_number', {
        type: Sequelize.STRING(50),
        allowNull: true
      });
      await addIfMissing('bank_account_name', {
        type: Sequelize.STRING(100),
        allowNull: true
      });
      await addIfMissing('website', {
        type: Sequelize.STRING(255),
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

    await seq.query(`
      CREATE INDEX IF NOT EXISTS suppliers_code_idx ON suppliers (code);
      CREATE INDEX IF NOT EXISTS suppliers_name_idx ON suppliers (name);
      CREATE INDEX IF NOT EXISTS suppliers_supplier_type_idx ON suppliers (supplier_type);
      CREATE INDEX IF NOT EXISTS suppliers_is_active_idx ON suppliers (is_active);
      CREATE INDEX IF NOT EXISTS suppliers_is_preferred_idx ON suppliers (is_preferred);
    `);

    const countRows = await seq.query(
      'SELECT COUNT(*)::int AS c FROM suppliers',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const n = countRows[0]?.c;
    if (Number(n) === 0) {
      await queryInterface.bulkInsert('suppliers', [
        {
          code: 'SUP-001',
          name: 'PT Bahan Baku Nusantara',
          company_name: 'PT Bahan Baku Nusantara',
          supplier_type: 'manufacturer',
          contact_person: 'Budi Santoso',
          phone: '021-12345678',
          email: 'info@bahanbaku.com',
          address: 'Jl. Industri No. 123',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          payment_terms: 'Net 30',
          lead_time_days: 7,
          is_active: true,
          is_preferred: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          code: 'SUP-002',
          name: 'CV Distributor Makanan',
          company_name: 'CV Distributor Makanan Sejahtera',
          supplier_type: 'distributor',
          contact_person: 'Siti Rahayu',
          phone: '021-87654321',
          email: 'sales@distributormakanan.com',
          address: 'Jl. Perdagangan No. 456',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          payment_terms: 'Net 14',
          lead_time_days: 3,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          code: 'SUP-003',
          name: 'Toko Grosir Sentosa',
          company_name: 'Toko Grosir Sentosa',
          supplier_type: 'wholesaler',
          contact_person: 'Ahmad Wijaya',
          phone: '021-55667788',
          email: 'sentosa@gmail.com',
          address: 'Jl. Pasar Besar No. 789',
          city: 'Jakarta',
          province: 'DKI Jakarta',
          payment_terms: 'COD',
          lead_time_days: 1,
          is_active: true,
          created_at: new Date(),
          updated_at: new Date()
        }
      ]);
    }
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('suppliers');
  }
};
