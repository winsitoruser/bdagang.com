'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. Remove type column (or make it nullable if preferred, but user said "remove this")
        await queryInterface.removeColumn('categories', 'type');
    },

    down: async (queryInterface, Sequelize) => {
        // 1. Re-add type column
        await queryInterface.addColumn('categories', 'type', {
            type: Sequelize.ENUM('income', 'expense'),
            allowNull: true // Changed to true in case there's no data to fill back
        });
    }
};
