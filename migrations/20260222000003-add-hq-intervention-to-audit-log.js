'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;
    const pgUdtToSequelizeType = (udt) => {
      if (!udt) return Sequelize.UUID;
      const u = String(udt).toLowerCase();
      if (u === 'uuid') return Sequelize.UUID;
      if (u === 'int4' || u === 'integer') return Sequelize.INTEGER;
      if (u === 'int8') return Sequelize.BIGINT;
      return Sequelize.UUID;
    };
    const fkTypeFor = async (tableName, columnName = 'id') => {
      const [rows] = await sequelize.query(
        `SELECT udt_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName}' AND column_name = '${columnName}'`
      );
      return pgUdtToSequelizeType(rows[0]?.udt_name);
    };
    const branchFkType = await fkTypeFor('branches', 'id');

    const d = await queryInterface.describeTable('audit_logs');

    if (!d.is_hq_intervention) {
      await queryInterface.addColumn('audit_logs', 'is_hq_intervention', {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        comment: 'True jika aksi dilakukan oleh Admin Pusat ke data cabang'
      });
    }

    if (!d.target_branch_id) {
      await queryInterface.addColumn('audit_logs', 'target_branch_id', {
        type: branchFkType,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID cabang yang datanya diintervensi oleh Pusat'
      });
    }

    if (!d.user_role) {
      await queryInterface.addColumn('audit_logs', 'user_role', {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Role user yang melakukan aksi'
      });
    }

    if (!d.old_values) {
      await queryInterface.addColumn('audit_logs', 'old_values', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Nilai sebelum perubahan'
      });
    }

    if (!d.new_values) {
      await queryInterface.addColumn('audit_logs', 'new_values', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Nilai setelah perubahan'
      });
    }

    if (!d.intervention_reason) {
      await queryInterface.addColumn('audit_logs', 'intervention_reason', {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Alasan intervensi dari Pusat'
      });
    }

    if (!d.affected_records) {
      await queryInterface.addColumn('audit_logs', 'affected_records', {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        comment: 'Jumlah record yang terpengaruh'
      });
    }

    await sequelize.query(`
      CREATE INDEX IF NOT EXISTS audit_logs_is_hq_intervention_idx ON audit_logs (is_hq_intervention);
      CREATE INDEX IF NOT EXISTS audit_logs_target_branch_id_idx ON audit_logs (target_branch_id);
      CREATE INDEX IF NOT EXISTS audit_logs_user_role_idx ON audit_logs (user_role);
      CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON audit_logs (created_at);
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS audit_logs_created_at_idx;
      DROP INDEX IF EXISTS audit_logs_user_role_idx;
      DROP INDEX IF EXISTS audit_logs_target_branch_id_idx;
      DROP INDEX IF EXISTS audit_logs_is_hq_intervention_idx;
    `);

    const d = await queryInterface.describeTable('audit_logs');
    const rm = async (col) => {
      if (d[col]) await queryInterface.removeColumn('audit_logs', col);
    };
    await rm('affected_records');
    await rm('intervention_reason');
    await rm('new_values');
    await rm('old_values');
    await rm('user_role');
    await rm('target_branch_id');
    await rm('is_hq_intervention');
  }
};
