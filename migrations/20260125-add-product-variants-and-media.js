'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const addIfMissing = async (column, options) => {
      const d = await queryInterface.describeTable('products');
      if (d[column]) return;
      await queryInterface.addColumn('products', column, options);
    };

    // Add detailed product information fields
    await addIfMissing('long_description', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Deskripsi lengkap produk'
    });

    await addIfMissing('specifications', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Spesifikasi teknis produk (JSON format)'
    });

    await addIfMissing('features', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Fitur-fitur produk (array)'
    });

    await addIfMissing('ingredients', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Komposisi/bahan-bahan produk'
    });

    await addIfMissing('usage_instructions', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Cara penggunaan produk'
    });

    await addIfMissing('warnings', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Peringatan dan perhatian khusus'
    });

    await addIfMissing('internal_notes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Catatan internal (tidak tampil ke customer)'
    });

    // Dimensions and physical properties
    await addIfMissing('weight', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Berat produk (kg)'
    });

    await addIfMissing('weight_unit', {
      type: Sequelize.STRING(10),
      defaultValue: 'kg',
      comment: 'Unit berat (kg, gram, lb)'
    });

    await addIfMissing('length', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Panjang (cm)'
    });

    await addIfMissing('width', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Lebar (cm)'
    });

    await addIfMissing('height', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Tinggi (cm)'
    });

    await addIfMissing('dimension_unit', {
      type: Sequelize.STRING(10),
      defaultValue: 'cm',
      comment: 'Unit dimensi (cm, m, inch)'
    });

    await addIfMissing('volume', {
      type: Sequelize.DECIMAL(10, 3),
      allowNull: true,
      comment: 'Volume (liter)'
    });

    await addIfMissing('volume_unit', {
      type: Sequelize.STRING(10),
      defaultValue: 'liter',
      comment: 'Unit volume (liter, ml, gallon)'
    });

    // Media fields
    await addIfMissing('images', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of image URLs'
    });

    await addIfMissing('thumbnail', {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'URL thumbnail utama'
    });

    await addIfMissing('videos', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of video URLs'
    });

    await addIfMissing('documents', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Array of document URLs (PDF, etc)'
    });

    // Tags and categorization
    await addIfMissing('tags', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Tags untuk search dan filter'
    });

    await addIfMissing('brand', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Brand/merek produk'
    });

    await addIfMissing('manufacturer', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Nama produsen'
    });

    await addIfMissing('country_of_origin', {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Negara asal produk'
    });

    // Create product_variants table
    const seq = queryInterface.sequelize;
    const tables = await queryInterface.showAllTables();
    const tableNames = tables.map((t) =>
      typeof t === 'string' ? t : String(Object.values(t)[0] ?? '')
    );
    const hasProductVariants = tableNames.some(
      (n) => String(n).toLowerCase() === 'product_variants'
    );

    if (!hasProductVariants) {
      await queryInterface.createTable('product_variants', {
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
      variant_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nama varian (e.g., "Small", "Red", "250ml")'
      },
      variant_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Tipe varian (size, color, flavor, etc)'
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'SKU khusus untuk varian ini'
      },
      barcode: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Barcode khusus untuk varian'
      },
      price: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Harga khusus varian (override base price)'
      },
      cost: {
        type: Sequelize.DECIMAL(15, 2),
        allowNull: true,
        comment: 'Cost khusus varian'
      },
      stock: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        comment: 'Stock khusus varian'
      },
      weight: {
        type: Sequelize.DECIMAL(10, 3),
        allowNull: true,
        comment: 'Berat khusus varian'
      },
      dimensions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Dimensi khusus varian {length, width, height}'
      },
      image_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Image khusus varian'
      },
      attributes: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Atribut tambahan varian'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      sort_order: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        comment: 'Urutan tampilan varian'
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
    }

    const pvDesc = await queryInterface.describeTable('product_variants');
    const indexSpecs = [
      ['product_variants_product_id_idx', 'product_id'],
      ['product_variants_variant_type_idx', 'variant_type'],
      ['product_variants_sku_idx', 'sku'],
      ['product_variants_is_active_idx', 'is_active'],
    ];
    for (const [idxName, col] of indexSpecs) {
      if (pvDesc[col]) {
        await seq.query(
          `CREATE INDEX IF NOT EXISTS "${idxName}" ON product_variants ("${col}");`
        );
      }
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Drop product_variants table
    await queryInterface.dropTable('product_variants');

    // Remove columns from products
    await queryInterface.removeColumn('products', 'long_description');
    await queryInterface.removeColumn('products', 'specifications');
    await queryInterface.removeColumn('products', 'features');
    await queryInterface.removeColumn('products', 'ingredients');
    await queryInterface.removeColumn('products', 'usage_instructions');
    await queryInterface.removeColumn('products', 'warnings');
    await queryInterface.removeColumn('products', 'internal_notes');
    await queryInterface.removeColumn('products', 'weight');
    await queryInterface.removeColumn('products', 'weight_unit');
    await queryInterface.removeColumn('products', 'length');
    await queryInterface.removeColumn('products', 'width');
    await queryInterface.removeColumn('products', 'height');
    await queryInterface.removeColumn('products', 'dimension_unit');
    await queryInterface.removeColumn('products', 'volume');
    await queryInterface.removeColumn('products', 'volume_unit');
    await queryInterface.removeColumn('products', 'images');
    await queryInterface.removeColumn('products', 'thumbnail');
    await queryInterface.removeColumn('products', 'videos');
    await queryInterface.removeColumn('products', 'documents');
    await queryInterface.removeColumn('products', 'tags');
    await queryInterface.removeColumn('products', 'brand');
    await queryInterface.removeColumn('products', 'manufacturer');
    await queryInterface.removeColumn('products', 'country_of_origin');
  }
};
