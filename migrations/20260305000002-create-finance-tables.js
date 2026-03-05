'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. plans
        await queryInterface.createTable('plans', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            name: { type: Sequelize.STRING(100), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            code: { type: Sequelize.STRING(50), allowNull: false, unique: true },
            price: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            currency: { type: Sequelize.STRING(10), defaultValue: 'IDR' },
            billing_interval: { type: Sequelize.STRING(20), defaultValue: 'monthly' },
            trial_days: { type: Sequelize.INTEGER, defaultValue: 14 },
            max_users: { type: Sequelize.INTEGER, defaultValue: 5 },
            max_branches: { type: Sequelize.INTEGER, defaultValue: 1 },
            features: { type: Sequelize.JSONB, defaultValue: {} },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            is_public: { type: Sequelize.BOOLEAN, defaultValue: true },
            sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 2. price_tiers
        await queryInterface.createTable('price_tiers', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            code: { type: Sequelize.STRING(50), allowNull: false, unique: true },
            name: { type: Sequelize.STRING(255), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            multiplier: { type: Sequelize.DECIMAL(5, 2), defaultValue: 1.00 },
            markup_percentage: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
            markup_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            region: { type: Sequelize.STRING(100), allowNull: true },
            city: { type: Sequelize.STRING(100), allowNull: true },
            province: { type: Sequelize.STRING(100), allowNull: true },
            location_type: { type: Sequelize.STRING(30), defaultValue: 'custom' },
            priority: { type: Sequelize.INTEGER, defaultValue: 0 },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            effective_from: { type: Sequelize.DATE, allowNull: true },
            effective_until: { type: Sequelize.DATE, allowNull: true },
            created_by: { type: Sequelize.UUID, allowNull: true },
            updated_by: { type: Sequelize.UUID, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 3. subscriptions
        await queryInterface.createTable('subscriptions', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: false },
            plan_id: { type: Sequelize.UUID, allowNull: false },
            status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'trial' },
            started_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            trial_ends_at: { type: Sequelize.DATE, allowNull: true },
            current_period_start: { type: Sequelize.DATE, allowNull: false },
            current_period_end: { type: Sequelize.DATE, allowNull: false },
            cancel_at_period_end: { type: Sequelize.BOOLEAN, defaultValue: false },
            cancelled_at: { type: Sequelize.DATE, allowNull: true },
            metadata: { type: Sequelize.JSONB, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 4. billing_cycles
        await queryInterface.createTable('billing_cycles', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            subscription_id: { type: Sequelize.UUID, allowNull: false },
            period_start: { type: Sequelize.DATE, allowNull: false },
            period_end: { type: Sequelize.DATE, allowNull: false },
            due_date: { type: Sequelize.DATE, allowNull: false },
            base_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            overage_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            tax_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            discount_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            total_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            currency: { type: Sequelize.STRING(10), defaultValue: 'IDR' },
            status: { type: Sequelize.STRING(20), defaultValue: 'pending' },
            invoice_id: { type: Sequelize.UUID, allowNull: true },
            paid_at: { type: Sequelize.DATE, allowNull: true },
            metadata: { type: Sequelize.JSONB, defaultValue: {} },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 5. invoices
        await queryInterface.createTable('invoices', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: false },
            billing_cycle_id: { type: Sequelize.UUID, allowNull: true },
            subscription_id: { type: Sequelize.UUID, allowNull: true },
            invoice_number: { type: Sequelize.STRING(50), allowNull: false, unique: true },
            status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'draft' },
            issued_date: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            due_date: { type: Sequelize.DATE, allowNull: false },
            paid_date: { type: Sequelize.DATE, allowNull: true },
            subtotal: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            tax_amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            discount_amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            total_amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            currency: { type: Sequelize.STRING(3), allowNull: false, defaultValue: 'IDR' },
            payment_provider: { type: Sequelize.STRING(50), allowNull: true },
            payment_method: { type: Sequelize.STRING(50), allowNull: true },
            external_id: { type: Sequelize.STRING(100), allowNull: true },
            payment_fee: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            customer_name: { type: Sequelize.STRING(255), allowNull: true },
            customer_email: { type: Sequelize.STRING(255), allowNull: true },
            customer_phone: { type: Sequelize.STRING(50), allowNull: true },
            customer_address: { type: Sequelize.TEXT, allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            metadata: { type: Sequelize.JSONB, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 6. product_prices
        await queryInterface.createTable('product_prices', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            product_id: { type: Sequelize.UUID, allowNull: false },
            price_type: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'regular' },
            tier_id: { type: Sequelize.UUID, allowNull: true },
            price: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
            discount_percentage: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
            discount_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            min_quantity: { type: Sequelize.INTEGER, defaultValue: 1 },
            max_quantity: { type: Sequelize.INTEGER, allowNull: true },
            start_date: { type: Sequelize.DATE, allowNull: true },
            end_date: { type: Sequelize.DATE, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            priority: { type: Sequelize.INTEGER, defaultValue: 0 },
            notes: { type: Sequelize.TEXT, allowNull: true },
            is_standard: { type: Sequelize.BOOLEAN, defaultValue: false },
            branch_id: { type: Sequelize.UUID, allowNull: true },
            price_tier_id: { type: Sequelize.UUID, allowNull: true },
            locked_by: { type: Sequelize.UUID, allowNull: true },
            locked_at: { type: Sequelize.DATE, allowNull: true },
            requires_approval: { type: Sequelize.BOOLEAN, defaultValue: false },
            approval_status: { type: Sequelize.STRING(20), allowNull: true },
            approved_by: { type: Sequelize.UUID, allowNull: true },
            approved_at: { type: Sequelize.DATE, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 7. product_variants
        await queryInterface.createTable('product_variants', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            product_id: { type: Sequelize.UUID, allowNull: false },
            variant_name: { type: Sequelize.STRING(100), allowNull: false },
            variant_type: { type: Sequelize.STRING(50), allowNull: false },
            sku: { type: Sequelize.STRING(100), allowNull: true, unique: true },
            barcode: { type: Sequelize.STRING(100), allowNull: true },
            price: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            cost: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            stock: { type: Sequelize.DECIMAL(10, 2), defaultValue: 0 },
            weight: { type: Sequelize.DECIMAL(10, 3), allowNull: true },
            dimensions: { type: Sequelize.JSONB, allowNull: true },
            image_url: { type: Sequelize.STRING(500), allowNull: true },
            attributes: { type: Sequelize.JSONB, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 8. partner_integrations
        await queryInterface.createTable('partner_integrations', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            partner_id: { type: Sequelize.UUID, allowNull: false },
            integration_type: { type: Sequelize.STRING(30), allowNull: false },
            provider: { type: Sequelize.STRING, allowNull: false },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            configuration: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
            test_mode: { type: Sequelize.BOOLEAN, defaultValue: true },
            last_tested_at: { type: Sequelize.DATE, allowNull: true },
            last_test_status: { type: Sequelize.STRING(20), allowNull: true },
            last_test_message: { type: Sequelize.TEXT, allowNull: true },
            created_by: { type: Sequelize.UUID, allowNull: true },
            updated_by: { type: Sequelize.UUID, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 9. outlet_integrations
        await queryInterface.createTable('outlet_integrations', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            outlet_id: { type: Sequelize.UUID, allowNull: false },
            integration_type: { type: Sequelize.STRING(30), allowNull: false },
            provider: { type: Sequelize.STRING, allowNull: false },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            configuration: { type: Sequelize.JSONB, allowNull: false, defaultValue: {} },
            test_mode: { type: Sequelize.BOOLEAN, defaultValue: true },
            use_partner_config: { type: Sequelize.BOOLEAN, defaultValue: false },
            last_tested_at: { type: Sequelize.DATE, allowNull: true },
            last_test_status: { type: Sequelize.STRING(20), allowNull: true },
            last_test_message: { type: Sequelize.TEXT, allowNull: true },
            created_by: { type: Sequelize.UUID, allowNull: true },
            updated_by: { type: Sequelize.UUID, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 10. webhooks
        await queryInterface.createTable('webhooks', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            name: { type: Sequelize.STRING, allowNull: false },
            url: { type: Sequelize.STRING, allowNull: false },
            events: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
            secret: { type: Sequelize.STRING, allowNull: false },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            last_triggered: { type: Sequelize.DATE, allowNull: true },
            success_count: { type: Sequelize.INTEGER, defaultValue: 0 },
            failure_count: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 11. integration_logs
        await queryInterface.createTable('integration_logs', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            integration_id: { type: Sequelize.UUID, allowNull: false },
            direction: { type: Sequelize.STRING(10), defaultValue: 'outbound' },
            action: { type: Sequelize.STRING(50), allowNull: false },
            entity_type: { type: Sequelize.STRING(50), allowNull: true },
            entity_id: { type: Sequelize.STRING(100), allowNull: true },
            status: { type: Sequelize.STRING(20), defaultValue: 'pending' },
            request_payload: { type: Sequelize.JSONB, allowNull: true },
            response_payload: { type: Sequelize.JSONB, allowNull: true },
            status_code: { type: Sequelize.INTEGER, allowNull: true },
            error_message: { type: Sequelize.TEXT, allowNull: true },
            duration_ms: { type: Sequelize.INTEGER, allowNull: true },
            retry_count: { type: Sequelize.INTEGER, defaultValue: 0 },
            next_retry_at: { type: Sequelize.DATE, allowNull: true },
            metadata: { type: Sequelize.JSONB, defaultValue: {} },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 12. integration_webhooks
        await queryInterface.createTable('integration_webhooks', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            integration_id: { type: Sequelize.UUID, allowNull: false },
            webhook_url: { type: Sequelize.STRING(500), allowNull: false },
            secret_key: { type: Sequelize.STRING(255), allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            events: { type: Sequelize.JSONB, defaultValue: ['*'] },
            description: { type: Sequelize.TEXT, allowNull: true },
            last_triggered_at: { type: Sequelize.DATE, allowNull: true },
            last_status: { type: Sequelize.STRING(20), allowNull: true },
            failure_count: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 13. geofence_locations
        await queryInterface.createTable('geofence_locations', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            name: { type: Sequelize.STRING(100), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            type: { type: Sequelize.STRING(20), defaultValue: 'circle' },
            coordinates: { type: Sequelize.JSONB, allowNull: false },
            radius_meters: { type: Sequelize.DECIMAL(10, 2), allowNull: true },
            address: { type: Sequelize.TEXT, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            metadata: { type: Sequelize.JSONB, defaultValue: {} },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('geofence_locations');
        await queryInterface.dropTable('integration_webhooks');
        await queryInterface.dropTable('integration_logs');
        await queryInterface.dropTable('webhooks');
        await queryInterface.dropTable('outlet_integrations');
        await queryInterface.dropTable('partner_integrations');
        await queryInterface.dropTable('product_variants');
        await queryInterface.dropTable('product_prices');
        await queryInterface.dropTable('invoices');
        await queryInterface.dropTable('billing_cycles');
        await queryInterface.dropTable('subscriptions');
        await queryInterface.dropTable('price_tiers');
        await queryInterface.dropTable('plans');
    }
};
