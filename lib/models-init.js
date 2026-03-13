/**
 * Initialize Sequelize models and associations
 * This file should be imported before using any models
 */

const FinanceAccount = require('../models/FinanceAccount');
const FinanceTransaction = require('../models/FinanceTransaction');
const FinanceBudget = require('../models/FinanceBudget');
const FinanceReceivable = require('../models/FinanceReceivable');
const FinancePayable = require('../models/FinancePayable');
const FinanceInvoice = require('../models/FinanceInvoice');
const FinanceInvoiceItem = require('../models/FinanceInvoiceItem');
const FinanceInvoicePayment = require('../models/FinanceInvoicePayment');
const FinanceReceivablePayment = require('../models/FinanceReceivablePayment');
const FinancePayablePayment = require('../models/FinancePayablePayment');

// Initialize associations if they have associate method
const models = {
  FinanceAccount,
  FinanceTransaction,
  FinanceBudget,
  FinanceReceivable,
  FinancePayable,
  FinanceInvoice,
  FinanceInvoiceItem,
  FinanceInvoicePayment,
  FinanceReceivablePayment,
  FinancePayablePayment
};

// Call associate methods if they exist and haven't been called yet
if (!global.__financeModelsInitialized) {
  Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
      try {
        if (!models[modelName].associations || Object.keys(models[modelName].associations).length === 0) {
          models[modelName].associate(models);
        }
      } catch (error) {
        console.warn(`Warning: Could not load associations for ${modelName} in models-init:`, error.message);
      }
    }
  });
  global.__financeModelsInitialized = true;
}

module.exports = models;
