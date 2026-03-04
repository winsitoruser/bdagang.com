const db = require('../models');
const fs = require('fs');
const path = require('path');

async function generateMigration() {
    const models = Object.keys(db).filter(k => k !== 'sequelize' && k !== 'Sequelize');

    let upTables = '';
    let upConstraints = '';
    let downContent = '';
    let addedConstraints = new Set(); // Global set to prevent absolute duplicates across entire db, or per table? Actually constraint names must be globally unique in PG anyway.

    for (const modelName of models) {
        const model = db[modelName];
        if (!model.getAttributes) continue;

        let tableName = model.getTableName();
        if (typeof tableName === 'object') tableName = tableName.tableName;

        const attributes = model.getAttributes();

        upTables += `    await queryInterface.createTable('${tableName}', {\n`;

        for (const [attrName, attr] of Object.entries(attributes)) {
            if (attr.type && attr.type.key === 'VIRTUAL') continue;

            upTables += `      '${attr.field || attrName}': {\n`;

            let typeStr = 'Sequelize.STRING';
            const typeKey = (attr.type && attr.type.key) ? attr.type.key : '';

            if (typeKey) {
                typeStr = `Sequelize.${typeKey}`;
                if (typeKey === 'ENUM' && attr.values) {
                    typeStr += `(${attr.values.map(v => `'${v}'`).join(', ')})`;
                } else if (attr.type._length) {
                    typeStr += `(${attr.type._length})`;
                } else if (attr.type.options && attr.type.options.length) {
                    typeStr += `(${attr.type.options.length})`;
                }
            }

            upTables += `        type: ${typeStr},\n`;
            if (attr.primaryKey) upTables += `        primaryKey: true,\n`;
            if (attr.autoIncrement) upTables += `        autoIncrement: true,\n`;
            if (attr.allowNull === false) upTables += `        allowNull: false,\n`;

            if (attr.defaultValue !== undefined) {
                if (typeof attr.defaultValue === 'function') {
                    if (typeKey === 'DATE' || typeKey === 'DATEONLY') {
                        upTables += `        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),\n`;
                    } else {
                        upTables += `        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),\n`;
                    }
                } else if (attr.defaultValue && typeof attr.defaultValue === 'object') {
                    if (typeKey === 'UUID') {
                        upTables += `        defaultValue: Sequelize.literal('gen_random_uuid()'),\n`;
                    } else if (typeKey === 'JSON' || typeKey === 'JSONB') {
                        upTables += `        defaultValue: ${JSON.stringify(attr.defaultValue)},\n`;
                    } else if (typeKey === 'DATE' || typeKey === 'DATEONLY') {
                        upTables += `        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),\n`;
                    } else if (attr.defaultValue.constructor && attr.defaultValue.constructor.name === 'Fn') {
                        upTables += `        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),\n`;
                    } else {
                        if (Object.keys(attr.defaultValue).length === 0) {
                            upTables += `        defaultValue: ${JSON.stringify(attr.defaultValue)},\n`;
                        } else {
                            upTables += `        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),\n`;
                        }
                    }
                } else {
                    upTables += `        defaultValue: ${JSON.stringify(attr.defaultValue)},\n`;
                }
            }
            upTables += `      },\n`;

            if (attr.references) {
                let refModel = attr.references.model;
                if (typeof refModel === 'object' && refModel.tableName) refModel = refModel.tableName;

                if (typeof refModel === 'string') {
                    refModel = refModel.toLowerCase();
                    if (refModel === 'products') refModel = 'products';
                    if (refModel === 'branches') refModel = 'branches';
                }

                // If refModel is still somehow upper case like 'Users', lowercase it
                refModel = refModel && typeof refModel === 'string' ? refModel.toLowerCase() : refModel;

                const constraintName = `fk_${tableName}_${attr.field || attrName}`;
                if (!addedConstraints.has(constraintName)) {
                    addedConstraints.add(constraintName);
                    upConstraints += `    await queryInterface.addConstraint('${tableName}', {\n`;
                    upConstraints += `      fields: ['${attr.field || attrName}'],\n`;
                    upConstraints += `      type: 'foreign key',\n`;
                    upConstraints += `      name: '${constraintName}',\n`;
                    upConstraints += `      references: {\n`;
                    upConstraints += `        table: '${refModel}',\n`;
                    upConstraints += `        field: '${attr.references.key}'\n`;
                    upConstraints += `      },\n`;
                    if (attr.onUpdate) upConstraints += `      onUpdate: '${attr.onUpdate}',\n`;
                    if (attr.onDelete) upConstraints += `      onDelete: '${attr.onDelete}',\n`;
                    upConstraints += `    });\n\n`;
                }
            }
        }

        upTables += `    });\n\n`;
        downContent = `    await queryInterface.dropTable('${tableName}', { cascade: true });\n` + downContent;
    }

    const migrationFile = `
'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 1. Create all tables first
${upTables}

    // 2. Add foreign key constraints
${upConstraints}
  },

  down: async (queryInterface, Sequelize) => {
${downContent}
  }
};
  `;

    const migrationPath = path.join(__dirname, '..', 'migrations', '20260304000000-initial-schema.js');
    fs.writeFileSync(migrationPath, migrationFile);
    console.log('Migration generated at:', migrationPath);
}

generateMigration().catch(console.error);
