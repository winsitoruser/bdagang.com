'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. projects
        await queryInterface.createTable('projects', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            project_code: { type: Sequelize.STRING(50), allowNull: true },
            name: { type: Sequelize.STRING(200), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            client_name: { type: Sequelize.STRING(200), allowNull: true },
            client_contact: { type: Sequelize.STRING(200), allowNull: true },
            location: { type: Sequelize.STRING(200), allowNull: true },
            start_date: { type: Sequelize.DATEONLY, allowNull: true },
            end_date: { type: Sequelize.DATEONLY, allowNull: true },
            actual_end_date: { type: Sequelize.DATEONLY, allowNull: true },
            status: { type: Sequelize.STRING(20), defaultValue: 'planning' },
            budget_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            actual_cost: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            budget_currency: { type: Sequelize.STRING(10), defaultValue: 'IDR' },
            project_manager_id: { type: Sequelize.UUID, allowNull: true },
            department: { type: Sequelize.STRING(100), allowNull: true },
            industry: { type: Sequelize.STRING(50), allowNull: true },
            contract_number: { type: Sequelize.STRING(100), allowNull: true },
            contract_value: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            completion_percent: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
            priority: { type: Sequelize.STRING(20), defaultValue: 'medium' },
            tags: { type: Sequelize.JSONB, defaultValue: [] },
            milestones: { type: Sequelize.JSONB, defaultValue: [] },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 2. project_workers
        await queryInterface.createTable('project_workers', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            project_id: { type: Sequelize.UUID, allowNull: false },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            role: { type: Sequelize.STRING(100), allowNull: true },
            assignment_start: { type: Sequelize.DATEONLY, allowNull: true },
            assignment_end: { type: Sequelize.DATEONLY, allowNull: true },
            daily_rate: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            hourly_rate: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            allocation_percent: { type: Sequelize.DECIMAL(5, 2), defaultValue: 100 },
            status: { type: Sequelize.STRING(20), defaultValue: 'active' },
            worker_type: { type: Sequelize.STRING(30), defaultValue: 'permanent' },
            contract_id: { type: Sequelize.UUID, allowNull: true },
            contract_number: { type: Sequelize.STRING(100), allowNull: true },
            skills: { type: Sequelize.JSONB, defaultValue: [] },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 3. project_timesheets
        await queryInterface.createTable('project_timesheets', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            project_id: { type: Sequelize.UUID, allowNull: false },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            timesheet_date: { type: Sequelize.DATEONLY, allowNull: false },
            hours_worked: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
            overtime_hours: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
            activity_description: { type: Sequelize.TEXT, allowNull: true },
            task_category: { type: Sequelize.STRING(50), allowNull: true },
            location: { type: Sequelize.STRING(200), allowNull: true },
            status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
            approved_by: { type: Sequelize.UUID, allowNull: true },
            approved_at: { type: Sequelize.DATE, allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 4. project_payroll
        await queryInterface.createTable('project_payroll', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            project_id: { type: Sequelize.UUID, allowNull: false },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            period_start: { type: Sequelize.DATEONLY, allowNull: false },
            period_end: { type: Sequelize.DATEONLY, allowNull: false },
            regular_hours: { type: Sequelize.DECIMAL(7, 2), defaultValue: 0 },
            overtime_hours: { type: Sequelize.DECIMAL(7, 2), defaultValue: 0 },
            daily_rate: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            overtime_rate: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            days_worked: { type: Sequelize.INTEGER, defaultValue: 0 },
            gross_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            deductions: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            allowances: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            net_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            currency: { type: Sequelize.STRING(10), defaultValue: 'IDR' },
            status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
            approved_by: { type: Sequelize.UUID, allowNull: true },
            approved_at: { type: Sequelize.DATE, allowNull: true },
            paid_at: { type: Sequelize.DATE, allowNull: true },
            payment_ref: { type: Sequelize.STRING(100), allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 5. internal_requisitions
        await queryInterface.createTable('internal_requisitions', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            ir_number: { type: Sequelize.STRING(50), allowNull: false, unique: true },
            requesting_branch_id: { type: Sequelize.UUID, allowNull: false },
            fulfilling_branch_id: { type: Sequelize.UUID, allowNull: true },
            request_type: { type: Sequelize.STRING(20), defaultValue: 'restock' },
            priority: { type: Sequelize.STRING(20), defaultValue: 'normal' },
            status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
            requested_delivery_date: { type: Sequelize.DATE, allowNull: true },
            actual_delivery_date: { type: Sequelize.DATE, allowNull: true },
            total_items: { type: Sequelize.INTEGER, defaultValue: 0 },
            total_quantity: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            estimated_value: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            notes: { type: Sequelize.TEXT, allowNull: true },
            rejection_reason: { type: Sequelize.TEXT, allowNull: true },
            requested_by: { type: Sequelize.UUID, allowNull: false },
            reviewed_by: { type: Sequelize.UUID, allowNull: true },
            reviewed_at: { type: Sequelize.DATE, allowNull: true },
            approved_by: { type: Sequelize.UUID, allowNull: true },
            approved_at: { type: Sequelize.DATE, allowNull: true },
            consolidated_po_id: { type: Sequelize.UUID, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 6. internal_requisition_items
        await queryInterface.createTable('internal_requisition_items', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            requisition_id: { type: Sequelize.UUID, allowNull: false },
            product_id: { type: Sequelize.UUID, allowNull: false },
            requested_quantity: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
            approved_quantity: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            fulfilled_quantity: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            unit: { type: Sequelize.STRING(50), allowNull: true },
            current_stock: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            min_stock: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            estimated_unit_cost: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            estimated_total_cost: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            status: { type: Sequelize.STRING(20), defaultValue: 'pending' },
            notes: { type: Sequelize.TEXT, allowNull: true },
            rejection_reason: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 7. surveys
        await queryInterface.createTable('surveys', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            title: { type: Sequelize.STRING(200), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            survey_type: { type: Sequelize.STRING(30), defaultValue: 'engagement' },
            status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
            start_date: { type: Sequelize.DATE, allowNull: true },
            end_date: { type: Sequelize.DATE, allowNull: true },
            is_anonymous: { type: Sequelize.BOOLEAN, defaultValue: true },
            is_mandatory: { type: Sequelize.BOOLEAN, defaultValue: false },
            target_departments: { type: Sequelize.JSONB, defaultValue: [] },
            target_positions: { type: Sequelize.JSONB, defaultValue: [] },
            target_branches: { type: Sequelize.JSONB, defaultValue: [] },
            questions: { type: Sequelize.JSONB, defaultValue: [] },
            created_by: { type: Sequelize.UUID, allowNull: true },
            total_responses: { type: Sequelize.INTEGER, defaultValue: 0 },
            reminder_enabled: { type: Sequelize.BOOLEAN, defaultValue: false },
            reminder_frequency: { type: Sequelize.STRING(20), defaultValue: 'weekly' },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 8. survey_responses
        await queryInterface.createTable('survey_responses', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            survey_id: { type: Sequelize.UUID, allowNull: false },
            employee_id: { type: Sequelize.UUID, allowNull: true },
            answers: { type: Sequelize.JSONB, defaultValue: [] },
            submitted_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            is_anonymous: { type: Sequelize.BOOLEAN, defaultValue: true },
            completion_time_minutes: { type: Sequelize.INTEGER, allowNull: true },
            feedback: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 9. announcements
        await queryInterface.createTable('announcements', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            title: { type: Sequelize.STRING(200), allowNull: false },
            content: { type: Sequelize.TEXT, allowNull: false },
            category: { type: Sequelize.STRING(30), defaultValue: 'general' },
            priority: { type: Sequelize.STRING(20), defaultValue: 'normal' },
            status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
            start_date: { type: Sequelize.DATE, allowNull: true },
            end_date: { type: Sequelize.DATE, allowNull: true },
            target_departments: { type: Sequelize.JSONB, defaultValue: [] },
            target_branches: { type: Sequelize.JSONB, defaultValue: [] },
            target_roles: { type: Sequelize.JSONB, defaultValue: [] },
            is_pinned: { type: Sequelize.BOOLEAN, defaultValue: false },
            notify_email: { type: Sequelize.BOOLEAN, defaultValue: false },
            notify_push: { type: Sequelize.BOOLEAN, defaultValue: true },
            attachment_url: { type: Sequelize.TEXT, allowNull: true },
            created_by: { type: Sequelize.UUID, allowNull: true },
            views_count: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 10. company_regulations
        await queryInterface.createTable('company_regulations', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            title: { type: Sequelize.STRING(200), allowNull: false },
            regulation_number: { type: Sequelize.STRING(100), allowNull: true },
            category: { type: Sequelize.STRING(50), defaultValue: 'general' },
            description: { type: Sequelize.TEXT, allowNull: true },
            content: { type: Sequelize.TEXT, allowNull: true },
            file_url: { type: Sequelize.TEXT, allowNull: true },
            effective_date: { type: Sequelize.DATEONLY, allowNull: true },
            expiry_date: { type: Sequelize.DATEONLY, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            version: { type: Sequelize.STRING(20), defaultValue: '1.0' },
            created_by: { type: Sequelize.UUID, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 11. compliance_checklists
        await queryInterface.createTable('compliance_checklists', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            title: { type: Sequelize.STRING(200), allowNull: false },
            category: { type: Sequelize.STRING(50), defaultValue: 'legal' },
            description: { type: Sequelize.TEXT, allowNull: true },
            frequency: { type: Sequelize.STRING(20), defaultValue: 'annual' },
            items: { type: Sequelize.JSONB, defaultValue: [] },
            status: { type: Sequelize.STRING(20), defaultValue: 'active' },
            assigned_to: { type: Sequelize.UUID, allowNull: true },
            next_due_date: { type: Sequelize.DATEONLY, allowNull: true },
            is_mandatory: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 12. contract_reminders
        await queryInterface.createTable('contract_reminders', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            contract_id: { type: Sequelize.UUID, allowNull: false },
            reminder_days_before: { type: Sequelize.ARRAY(Sequelize.INTEGER), defaultValue: [30, 14, 7] },
            notify_hr: { type: Sequelize.BOOLEAN, defaultValue: true },
            notify_manager: { type: Sequelize.BOOLEAN, defaultValue: true },
            notify_employee: { type: Sequelize.BOOLEAN, defaultValue: false },
            status: { type: Sequelize.STRING(20), defaultValue: 'active' },
            last_sent_at: { type: Sequelize.DATE, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 13. manpower_budgets
        await queryInterface.createTable('manpower_budgets', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            fiscal_year: { type: Sequelize.INTEGER, allowNull: false },
            department: { type: Sequelize.STRING(100), allowNull: true },
            branch_id: { type: Sequelize.UUID, allowNull: true },
            budget_category: { type: Sequelize.STRING(50), defaultValue: 'salary' },
            planned_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            actual_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            variance: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            currency: { type: Sequelize.STRING(10), defaultValue: 'IDR' },
            status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
            approved_by: { type: Sequelize.UUID, allowNull: true },
            approved_at: { type: Sequelize.DATE, allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            breakdown: { type: Sequelize.JSONB, defaultValue: [] },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 14. headcount_plans
        await queryInterface.createTable('headcount_plans', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            budget_id: { type: Sequelize.UUID, allowNull: true },
            department: { type: Sequelize.STRING(100), allowNull: true },
            job_grade_id: { type: Sequelize.UUID, allowNull: true },
            current_count: { type: Sequelize.INTEGER, defaultValue: 0 },
            planned_count: { type: Sequelize.INTEGER, defaultValue: 0 },
            hiring_status: { type: Sequelize.STRING(20), defaultValue: 'planned' },
            priority: { type: Sequelize.STRING(20), defaultValue: 'medium' },
            estimated_salary: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            target_hire_date: { type: Sequelize.DATEONLY, allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 15. expense_budgets
        await queryInterface.createTable('expense_budgets', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            fiscal_year: { type: Sequelize.INTEGER, allowNull: false },
            category: { type: Sequelize.STRING(50), allowNull: false },
            department: { type: Sequelize.STRING(100), allowNull: true },
            planned_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            actual_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            currency: { type: Sequelize.STRING(10), defaultValue: 'IDR' },
            status: { type: Sequelize.STRING(20), defaultValue: 'active' },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 16. ir_cases
        await queryInterface.createTable('ir_cases', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            case_number: { type: Sequelize.STRING(50), allowNull: true },
            title: { type: Sequelize.STRING(200), allowNull: false },
            category: { type: Sequelize.STRING(50), defaultValue: 'misconduct' },
            priority: { type: Sequelize.STRING(20), defaultValue: 'medium' },
            status: { type: Sequelize.STRING(30), defaultValue: 'open' },
            reported_by: { type: Sequelize.UUID, allowNull: true },
            reported_date: { type: Sequelize.DATEONLY, allowNull: false },
            involved_employees: { type: Sequelize.JSONB, defaultValue: [] },
            description: { type: Sequelize.TEXT, allowNull: true },
            investigation_notes: { type: Sequelize.TEXT, allowNull: true },
            resolution: { type: Sequelize.TEXT, allowNull: true },
            resolution_date: { type: Sequelize.DATEONLY, allowNull: true },
            investigator_id: { type: Sequelize.UUID, allowNull: true },
            hearing_date: { type: Sequelize.DATE, allowNull: true },
            hearing_notes: { type: Sequelize.TEXT, allowNull: true },
            actions_taken: { type: Sequelize.JSONB, defaultValue: [] },
            attachments: { type: Sequelize.JSONB, defaultValue: [] },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 17. recognitions
        await queryInterface.createTable('recognitions', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            from_employee_id: { type: Sequelize.UUID, allowNull: false },
            to_employee_id: { type: Sequelize.UUID, allowNull: false },
            recognition_type: { type: Sequelize.STRING(30), defaultValue: 'kudos' },
            title: { type: Sequelize.STRING(200), allowNull: true },
            message: { type: Sequelize.TEXT, allowNull: true },
            points: { type: Sequelize.INTEGER, defaultValue: 0 },
            badge: { type: Sequelize.STRING(50), allowNull: true },
            category: { type: Sequelize.STRING(50), defaultValue: 'general' },
            is_public: { type: Sequelize.BOOLEAN, defaultValue: true },
            likes_count: { type: Sequelize.INTEGER, defaultValue: 0 },
            liked_by: { type: Sequelize.JSONB, defaultValue: [] },
            approved: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 18. travel_requests
        await queryInterface.createTable('travel_requests', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            request_number: { type: Sequelize.STRING(50), allowNull: true },
            destination: { type: Sequelize.STRING(200), allowNull: false },
            departure_city: { type: Sequelize.STRING(100), allowNull: true },
            purpose: { type: Sequelize.TEXT, allowNull: false },
            departure_date: { type: Sequelize.DATEONLY, allowNull: false },
            return_date: { type: Sequelize.DATEONLY, allowNull: false },
            travel_type: { type: Sequelize.STRING(30), defaultValue: 'domestic' },
            transportation: { type: Sequelize.STRING(30), defaultValue: 'flight' },
            accommodation_needed: { type: Sequelize.BOOLEAN, defaultValue: true },
            hotel_name: { type: Sequelize.STRING(200), allowNull: true },
            estimated_budget: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            actual_cost: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            advance_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            advance_status: { type: Sequelize.STRING(20), defaultValue: 'none' },
            currency: { type: Sequelize.STRING(10), defaultValue: 'IDR' },
            status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
            approved_by: { type: Sequelize.UUID, allowNull: true },
            approved_at: { type: Sequelize.DATE, allowNull: true },
            itinerary: { type: Sequelize.JSONB, defaultValue: [] },
            companions: { type: Sequelize.JSONB, defaultValue: [] },
            project_id: { type: Sequelize.UUID, allowNull: true },
            department: { type: Sequelize.STRING(100), allowNull: true },
            attachments: { type: Sequelize.JSONB, defaultValue: [] },
            notes: { type: Sequelize.TEXT, allowNull: true },
            completed_at: { type: Sequelize.DATE, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 19. travel_expenses
        await queryInterface.createTable('travel_expenses', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            travel_request_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            expense_date: { type: Sequelize.DATEONLY, allowNull: false },
            category: { type: Sequelize.STRING(50), defaultValue: 'other' },
            description: { type: Sequelize.TEXT, allowNull: true },
            amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
            currency: { type: Sequelize.STRING(10), defaultValue: 'IDR' },
            receipt_url: { type: Sequelize.TEXT, allowNull: true },
            receipt_number: { type: Sequelize.STRING(100), allowNull: true },
            status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
            approved_by: { type: Sequelize.UUID, allowNull: true },
            approved_at: { type: Sequelize.DATE, allowNull: true },
            reimbursed_at: { type: Sequelize.DATE, allowNull: true },
            claim_id: { type: Sequelize.UUID, allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 20. wastes
        await queryInterface.createTable('wastes', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            waste_number: { type: Sequelize.STRING(50), allowNull: false, unique: true },
            product_id: { type: Sequelize.UUID, allowNull: true },
            product_name: { type: Sequelize.STRING(255), allowNull: true },
            product_sku: { type: Sequelize.STRING(100), allowNull: true },
            waste_type: { type: Sequelize.STRING(30), allowNull: false },
            quantity: { type: Sequelize.DECIMAL(10, 2), allowNull: false },
            unit: { type: Sequelize.STRING(20), allowNull: false },
            cost_value: { type: Sequelize.DECIMAL(15, 2), allowNull: false },
            reason: { type: Sequelize.TEXT, allowNull: false },
            disposal_method: { type: Sequelize.STRING(30), allowNull: false },
            clearance_price: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            waste_date: { type: Sequelize.DATE, allowNull: false },
            status: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'recorded' },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_by: { type: Sequelize.STRING(100), allowNull: false },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('wastes');
        await queryInterface.dropTable('travel_expenses');
        await queryInterface.dropTable('travel_requests');
        await queryInterface.dropTable('recognitions');
        await queryInterface.dropTable('ir_cases');
        await queryInterface.dropTable('expense_budgets');
        await queryInterface.dropTable('headcount_plans');
        await queryInterface.dropTable('manpower_budgets');
        await queryInterface.dropTable('contract_reminders');
        await queryInterface.dropTable('compliance_checklists');
        await queryInterface.dropTable('company_regulations');
        await queryInterface.dropTable('announcements');
        await queryInterface.dropTable('survey_responses');
        await queryInterface.dropTable('surveys');
        await queryInterface.dropTable('internal_requisition_items');
        await queryInterface.dropTable('internal_requisitions');
        await queryInterface.dropTable('project_payroll');
        await queryInterface.dropTable('project_timesheets');
        await queryInterface.dropTable('project_workers');
        await queryInterface.dropTable('projects');
    }
};
