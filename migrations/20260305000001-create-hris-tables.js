'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // 1. job_grades
        await queryInterface.createTable('job_grades', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            code: { type: Sequelize.STRING(20), allowNull: false },
            name: { type: Sequelize.STRING(100), allowNull: false },
            level: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 1 },
            min_salary: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            max_salary: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            benefits: { type: Sequelize.JSONB, defaultValue: [] },
            leave_quota: { type: Sequelize.JSONB, defaultValue: {} },
            description: { type: Sequelize.TEXT, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 2. org_structures
        await queryInterface.createTable('org_structures', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            name: { type: Sequelize.STRING(100), allowNull: false },
            code: { type: Sequelize.STRING(50), allowNull: true },
            parent_id: { type: Sequelize.UUID, allowNull: true },
            level: { type: Sequelize.INTEGER, defaultValue: 0 },
            sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            head_employee_id: { type: Sequelize.UUID, allowNull: true },
            description: { type: Sequelize.TEXT, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            metadata: { type: Sequelize.JSONB, defaultValue: {} },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 3. employee_certifications
        await queryInterface.createTable('employee_certifications', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            name: { type: Sequelize.STRING(200), allowNull: false },
            issuing_organization: { type: Sequelize.STRING(200), allowNull: true },
            credential_id: { type: Sequelize.STRING(100), allowNull: true },
            issue_date: { type: Sequelize.DATEONLY, allowNull: true },
            expiry_date: { type: Sequelize.DATEONLY, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            document_url: { type: Sequelize.TEXT, allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 4. employee_contracts
        await queryInterface.createTable('employee_contracts', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            contract_type: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'PKWTT' },
            contract_number: { type: Sequelize.STRING(100), allowNull: true },
            start_date: { type: Sequelize.DATEONLY, allowNull: false },
            end_date: { type: Sequelize.DATEONLY, allowNull: true },
            probation_end: { type: Sequelize.DATEONLY, allowNull: true },
            status: { type: Sequelize.STRING(20), defaultValue: 'active' },
            salary: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            position: { type: Sequelize.STRING(100), allowNull: true },
            department: { type: Sequelize.STRING(50), allowNull: true },
            branch_id: { type: Sequelize.UUID, allowNull: true },
            document_id: { type: Sequelize.UUID, allowNull: true },
            renewal_count: { type: Sequelize.INTEGER, defaultValue: 0 },
            previous_contract_id: { type: Sequelize.UUID, allowNull: true },
            termination_date: { type: Sequelize.DATEONLY, allowNull: true },
            termination_reason: { type: Sequelize.TEXT, allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_by: { type: Sequelize.UUID, allowNull: true },
            approved_by: { type: Sequelize.UUID, allowNull: true },
            approved_at: { type: Sequelize.DATE, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 5. employee_documents
        await queryInterface.createTable('employee_documents', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            document_type: { type: Sequelize.STRING(50), allowNull: false },
            document_number: { type: Sequelize.STRING(100), allowNull: true },
            title: { type: Sequelize.STRING(200), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            file_url: { type: Sequelize.TEXT, allowNull: true },
            file_name: { type: Sequelize.STRING(200), allowNull: true },
            file_size: { type: Sequelize.INTEGER, allowNull: true },
            mime_type: { type: Sequelize.STRING(100), allowNull: true },
            issue_date: { type: Sequelize.DATEONLY, allowNull: true },
            expiry_date: { type: Sequelize.DATEONLY, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            status: { type: Sequelize.STRING(20), defaultValue: 'active' },
            signed_by: { type: Sequelize.STRING(200), allowNull: true },
            signed_date: { type: Sequelize.DATEONLY, allowNull: true },
            version: { type: Sequelize.INTEGER, defaultValue: 1 },
            tags: { type: Sequelize.ARRAY(Sequelize.TEXT), defaultValue: [] },
            metadata: { type: Sequelize.JSONB, defaultValue: {} },
            created_by: { type: Sequelize.UUID, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 6. employee_educations
        await queryInterface.createTable('employee_educations', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            level: { type: Sequelize.STRING(30), allowNull: false },
            institution: { type: Sequelize.STRING(200), allowNull: false },
            major: { type: Sequelize.STRING(100), allowNull: true },
            degree: { type: Sequelize.STRING(50), allowNull: true },
            start_year: { type: Sequelize.INTEGER, allowNull: true },
            end_year: { type: Sequelize.INTEGER, allowNull: true },
            gpa: { type: Sequelize.DECIMAL(4, 2), allowNull: true },
            is_highest: { type: Sequelize.BOOLEAN, defaultValue: false },
            certificate_number: { type: Sequelize.STRING(100), allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 7. employee_families
        await queryInterface.createTable('employee_families', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            name: { type: Sequelize.STRING(100), allowNull: false },
            relationship: { type: Sequelize.STRING(30), allowNull: false },
            gender: { type: Sequelize.STRING(10), allowNull: true },
            date_of_birth: { type: Sequelize.DATEONLY, allowNull: true },
            place_of_birth: { type: Sequelize.STRING(100), allowNull: true },
            national_id: { type: Sequelize.STRING(30), allowNull: true },
            phone_number: { type: Sequelize.STRING(20), allowNull: true },
            occupation: { type: Sequelize.STRING(100), allowNull: true },
            is_emergency_contact: { type: Sequelize.BOOLEAN, defaultValue: false },
            is_dependent: { type: Sequelize.BOOLEAN, defaultValue: false },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 8. employee_mutations
        await queryInterface.createTable('employee_mutations', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            mutation_type: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'transfer' },
            mutation_number: { type: Sequelize.STRING(50), allowNull: true },
            effective_date: { type: Sequelize.DATEONLY, allowNull: false },
            status: { type: Sequelize.STRING(20), defaultValue: 'pending' },
            from_branch_id: { type: Sequelize.UUID, allowNull: true },
            from_department: { type: Sequelize.STRING(50), allowNull: true },
            from_position: { type: Sequelize.STRING(100), allowNull: true },
            from_job_grade_id: { type: Sequelize.UUID, allowNull: true },
            from_org_structure_id: { type: Sequelize.UUID, allowNull: true },
            to_branch_id: { type: Sequelize.UUID, allowNull: true },
            to_department: { type: Sequelize.STRING(50), allowNull: true },
            to_position: { type: Sequelize.STRING(100), allowNull: true },
            to_job_grade_id: { type: Sequelize.UUID, allowNull: true },
            to_org_structure_id: { type: Sequelize.UUID, allowNull: true },
            salary_change: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            new_salary: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            reason: { type: Sequelize.TEXT, allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            document_url: { type: Sequelize.TEXT, allowNull: true },
            requested_by: { type: Sequelize.UUID, allowNull: true },
            current_approval_step: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 9. employee_salaries
        await queryInterface.createTable('employee_salaries', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            pay_type: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'monthly' },
            base_salary: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            hourly_rate: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            daily_rate: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            weekly_hours: { type: Sequelize.DECIMAL(5, 1), defaultValue: 40 },
            overtime_rate_multiplier: { type: Sequelize.DECIMAL(5, 2), defaultValue: 1.5 },
            overtime_holiday_multiplier: { type: Sequelize.DECIMAL(5, 2), defaultValue: 2.0 },
            tax_status: { type: Sequelize.STRING(20), defaultValue: 'TK/0' },
            tax_method: { type: Sequelize.STRING(20), defaultValue: 'gross_up' },
            bank_name: { type: Sequelize.STRING(50), allowNull: true },
            bank_account_number: { type: Sequelize.STRING(50), allowNull: true },
            bank_account_name: { type: Sequelize.STRING(100), allowNull: true },
            bpjs_kesehatan_number: { type: Sequelize.STRING(30), allowNull: true },
            bpjs_ketenagakerjaan_number: { type: Sequelize.STRING(30), allowNull: true },
            bpjs_kesehatan_class: { type: Sequelize.INTEGER, defaultValue: 1 },
            npwp: { type: Sequelize.STRING(30), allowNull: true },
            effective_date: { type: Sequelize.DATEONLY, allowNull: true },
            end_date: { type: Sequelize.DATEONLY, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 10. employee_skills
        await queryInterface.createTable('employee_skills', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            name: { type: Sequelize.STRING(100), allowNull: false },
            category: { type: Sequelize.STRING(50), allowNull: true },
            proficiency_level: { type: Sequelize.STRING(20), defaultValue: 'intermediate' },
            years_experience: { type: Sequelize.INTEGER, defaultValue: 0 },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 11. employee_work_experiences
        await queryInterface.createTable('employee_work_experiences', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            company_name: { type: Sequelize.STRING(200), allowNull: false },
            position: { type: Sequelize.STRING(100), allowNull: false },
            department: { type: Sequelize.STRING(100), allowNull: true },
            start_date: { type: Sequelize.DATEONLY, allowNull: true },
            end_date: { type: Sequelize.DATEONLY, allowNull: true },
            is_current: { type: Sequelize.BOOLEAN, defaultValue: false },
            salary: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            reason_leaving: { type: Sequelize.TEXT, allowNull: true },
            description: { type: Sequelize.TEXT, allowNull: true },
            reference_name: { type: Sequelize.STRING(100), allowNull: true },
            reference_phone: { type: Sequelize.STRING(20), allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 12. leave_types
        await queryInterface.createTable('leave_types', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            code: { type: Sequelize.STRING(30), allowNull: false },
            name: { type: Sequelize.STRING(100), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            category: { type: Sequelize.STRING(30), defaultValue: 'regular' },
            max_days_per_year: { type: Sequelize.INTEGER, defaultValue: 12 },
            min_days_per_request: { type: Sequelize.INTEGER, defaultValue: 1 },
            max_days_per_request: { type: Sequelize.INTEGER, defaultValue: 14 },
            carry_forward: { type: Sequelize.BOOLEAN, defaultValue: false },
            max_carry_forward_days: { type: Sequelize.INTEGER, defaultValue: 0 },
            requires_attachment: { type: Sequelize.BOOLEAN, defaultValue: false },
            requires_medical_cert: { type: Sequelize.BOOLEAN, defaultValue: false },
            is_paid: { type: Sequelize.BOOLEAN, defaultValue: true },
            salary_deduction_percent: { type: Sequelize.DECIMAL(5, 2), defaultValue: 0 },
            applicable_gender: { type: Sequelize.STRING(10), allowNull: true },
            min_service_months: { type: Sequelize.INTEGER, defaultValue: 0 },
            applicable_departments: { type: Sequelize.JSONB, defaultValue: [] },
            applicable_positions: { type: Sequelize.JSONB, defaultValue: [] },
            color: { type: Sequelize.STRING(20), defaultValue: '#3B82F6' },
            icon: { type: Sequelize.STRING(30), defaultValue: 'calendar' },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 13. leave_balances
        await queryInterface.createTable('leave_balances', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            leave_type_id: { type: Sequelize.UUID, allowNull: false },
            year: { type: Sequelize.INTEGER, allowNull: false },
            entitled_days: { type: Sequelize.DECIMAL(5, 1), defaultValue: 0 },
            used_days: { type: Sequelize.DECIMAL(5, 1), defaultValue: 0 },
            pending_days: { type: Sequelize.DECIMAL(5, 1), defaultValue: 0 },
            carried_forward_days: { type: Sequelize.DECIMAL(5, 1), defaultValue: 0 },
            adjustment_days: { type: Sequelize.DECIMAL(5, 1), defaultValue: 0 },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 14. leave_approval_configs
        await queryInterface.createTable('leave_approval_configs', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            name: { type: Sequelize.STRING(100), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            department: { type: Sequelize.STRING(50), allowNull: true },
            division: { type: Sequelize.STRING(50), allowNull: true },
            branch_id: { type: Sequelize.UUID, allowNull: true },
            leave_type_code: { type: Sequelize.STRING(30), allowNull: true },
            min_days_trigger: { type: Sequelize.INTEGER, defaultValue: 1 },
            max_auto_approve_days: { type: Sequelize.INTEGER, defaultValue: 0 },
            approval_levels: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
            escalation_hours: { type: Sequelize.INTEGER, defaultValue: 48 },
            notify_hr: { type: Sequelize.BOOLEAN, defaultValue: true },
            notify_manager: { type: Sequelize.BOOLEAN, defaultValue: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            priority: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 15. payroll_components
        await queryInterface.createTable('payroll_components', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            code: { type: Sequelize.STRING(30), allowNull: false },
            name: { type: Sequelize.STRING(100), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            type: { type: Sequelize.STRING(20), allowNull: false, defaultValue: 'earning' },
            category: { type: Sequelize.STRING(30), defaultValue: 'fixed' },
            calculation_type: { type: Sequelize.STRING(20), defaultValue: 'fixed' },
            default_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            percentage_base: { type: Sequelize.STRING(50), allowNull: true },
            percentage_value: { type: Sequelize.DECIMAL(8, 4), defaultValue: 0 },
            formula: { type: Sequelize.TEXT, allowNull: true },
            is_taxable: { type: Sequelize.BOOLEAN, defaultValue: true },
            is_mandatory: { type: Sequelize.BOOLEAN, defaultValue: false },
            applies_to_pay_types: { type: Sequelize.JSONB, defaultValue: ['monthly'] },
            applicable_departments: { type: Sequelize.JSONB, defaultValue: [] },
            sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 16. payroll_runs
        await queryInterface.createTable('payroll_runs', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            run_code: { type: Sequelize.STRING(30), allowNull: false },
            name: { type: Sequelize.STRING(100), allowNull: true },
            period_start: { type: Sequelize.DATEONLY, allowNull: false },
            period_end: { type: Sequelize.DATEONLY, allowNull: false },
            pay_date: { type: Sequelize.DATEONLY, allowNull: true },
            pay_type: { type: Sequelize.STRING(20), defaultValue: 'monthly' },
            branch_id: { type: Sequelize.UUID, allowNull: true },
            department: { type: Sequelize.STRING(50), allowNull: true },
            total_employees: { type: Sequelize.INTEGER, defaultValue: 0 },
            total_gross: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
            total_deductions: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
            total_net: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
            total_tax: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
            total_bpjs: { type: Sequelize.DECIMAL(18, 2), defaultValue: 0 },
            status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
            approved_by: { type: Sequelize.UUID, allowNull: true },
            approved_at: { type: Sequelize.DATE, allowNull: true },
            paid_at: { type: Sequelize.DATE, allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            metadata: { type: Sequelize.JSONB, defaultValue: {} },
            created_by: { type: Sequelize.UUID, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 17. termination_requests
        await queryInterface.createTable('termination_requests', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            termination_type: { type: Sequelize.STRING(30), allowNull: false, defaultValue: 'resignation' },
            reason: { type: Sequelize.TEXT, allowNull: false },
            effective_date: { type: Sequelize.DATEONLY, allowNull: true },
            notice_date: { type: Sequelize.DATEONLY, allowNull: true },
            notice_period_days: { type: Sequelize.INTEGER, defaultValue: 30 },
            last_working_day: { type: Sequelize.DATEONLY, allowNull: true },
            severance_amount: { type: Sequelize.DECIMAL(15, 2), defaultValue: 0 },
            compensation_details: { type: Sequelize.JSONB, defaultValue: {} },
            status: { type: Sequelize.STRING(20), defaultValue: 'draft' },
            requested_by: { type: Sequelize.UUID, allowNull: true },
            approved_by: { type: Sequelize.UUID, allowNull: true },
            approved_at: { type: Sequelize.DATE, allowNull: true },
            exit_interview_done: { type: Sequelize.BOOLEAN, defaultValue: false },
            exit_interview_notes: { type: Sequelize.TEXT, allowNull: true },
            exit_interview_date: { type: Sequelize.DATEONLY, allowNull: true },
            clearance_status: { type: Sequelize.JSONB, defaultValue: { it: false, finance: false, hr: false, assets: false, admin: false } },
            final_settlement: { type: Sequelize.JSONB, defaultValue: {} },
            related_warning_ids: { type: Sequelize.JSONB, defaultValue: [] },
            related_case_id: { type: Sequelize.UUID, allowNull: true },
            attachments: { type: Sequelize.JSONB, defaultValue: [] },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 18. warning_letters
        await queryInterface.createTable('warning_letters', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            warning_type: { type: Sequelize.STRING(10), allowNull: false, defaultValue: 'SP1' },
            letter_number: { type: Sequelize.STRING(50), allowNull: true },
            issue_date: { type: Sequelize.DATEONLY, allowNull: false },
            expiry_date: { type: Sequelize.DATEONLY, allowNull: true },
            violation_type: { type: Sequelize.STRING(50), defaultValue: 'discipline' },
            violation_description: { type: Sequelize.TEXT, allowNull: false },
            regulation_id: { type: Sequelize.UUID, allowNull: true },
            previous_warning_id: { type: Sequelize.UUID, allowNull: true },
            issued_by: { type: Sequelize.UUID, allowNull: true },
            acknowledged: { type: Sequelize.BOOLEAN, defaultValue: false },
            acknowledged_at: { type: Sequelize.DATE, allowNull: true },
            status: { type: Sequelize.STRING(20), defaultValue: 'active' },
            attachments: { type: Sequelize.JSONB, defaultValue: [] },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 19. work_shifts
        await queryInterface.createTable('work_shifts', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            code: { type: Sequelize.STRING(30), allowNull: false },
            name: { type: Sequelize.STRING(100), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            shift_type: { type: Sequelize.STRING(30), defaultValue: 'regular' },
            start_time: { type: Sequelize.TIME, allowNull: false },
            end_time: { type: Sequelize.TIME, allowNull: false },
            break_start: { type: Sequelize.TIME, allowNull: true },
            break_end: { type: Sequelize.TIME, allowNull: true },
            break_duration_minutes: { type: Sequelize.INTEGER, defaultValue: 60 },
            is_cross_day: { type: Sequelize.BOOLEAN, defaultValue: false },
            work_hours_per_day: { type: Sequelize.DECIMAL(4, 2), defaultValue: 8.00 },
            color: { type: Sequelize.STRING(20), defaultValue: '#3B82F6' },
            tolerance_late_minutes: { type: Sequelize.INTEGER, defaultValue: 15 },
            tolerance_early_leave_minutes: { type: Sequelize.INTEGER, defaultValue: 15 },
            overtime_after_minutes: { type: Sequelize.INTEGER, defaultValue: 30 },
            applicable_days: { type: Sequelize.JSONB, defaultValue: [1, 2, 3, 4, 5] },
            applicable_departments: { type: Sequelize.JSONB, defaultValue: [] },
            applicable_branches: { type: Sequelize.JSONB, defaultValue: [] },
            max_employees_per_shift: { type: Sequelize.INTEGER, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 20. shift_rotations
        await queryInterface.createTable('shift_rotations', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            name: { type: Sequelize.STRING(100), allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            rotation_type: { type: Sequelize.STRING(30), defaultValue: 'weekly' },
            rotation_pattern: { type: Sequelize.JSONB, allowNull: false, defaultValue: [] },
            applicable_departments: { type: Sequelize.JSONB, defaultValue: [] },
            applicable_branches: { type: Sequelize.JSONB, defaultValue: [] },
            employee_ids: { type: Sequelize.JSONB, defaultValue: [] },
            start_date: { type: Sequelize.DATEONLY, allowNull: true },
            end_date: { type: Sequelize.DATEONLY, allowNull: true },
            is_active: { type: Sequelize.BOOLEAN, defaultValue: true },
            auto_generate: { type: Sequelize.BOOLEAN, defaultValue: true },
            generate_weeks_ahead: { type: Sequelize.INTEGER, defaultValue: 2 },
            last_generated_date: { type: Sequelize.DATEONLY, allowNull: true },
            created_by: { type: Sequelize.UUID, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 21. shift_schedules
        await queryInterface.createTable('shift_schedules', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            work_shift_id: { type: Sequelize.UUID, allowNull: true },
            schedule_date: { type: Sequelize.DATEONLY, allowNull: false },
            custom_start_time: { type: Sequelize.TIME, allowNull: true },
            custom_end_time: { type: Sequelize.TIME, allowNull: true },
            status: { type: Sequelize.STRING(20), defaultValue: 'scheduled' },
            swap_requested_with: { type: Sequelize.INTEGER, allowNull: true },
            swap_status: { type: Sequelize.STRING(20), allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            assigned_by: { type: Sequelize.UUID, allowNull: true },
            rotation_id: { type: Sequelize.UUID, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });

        // 22. employee_claims
        await queryInterface.createTable('employee_claims', {
            id: { type: Sequelize.UUID, defaultValue: Sequelize.literal('gen_random_uuid()'), primaryKey: true },
            tenant_id: { type: Sequelize.UUID, allowNull: true },
            employee_id: { type: Sequelize.UUID, allowNull: false },
            claim_number: { type: Sequelize.STRING(50), allowNull: true },
            claim_type: { type: Sequelize.STRING(50), allowNull: false },
            amount: { type: Sequelize.DECIMAL(15, 2), allowNull: false, defaultValue: 0 },
            approved_amount: { type: Sequelize.DECIMAL(15, 2), allowNull: true },
            currency: { type: Sequelize.STRING(5), defaultValue: 'IDR' },
            claim_date: { type: Sequelize.DATEONLY, allowNull: false },
            description: { type: Sequelize.TEXT, allowNull: true },
            receipt_url: { type: Sequelize.TEXT, allowNull: true },
            receipt_number: { type: Sequelize.STRING(100), allowNull: true },
            status: { type: Sequelize.STRING(20), defaultValue: 'pending' },
            current_approval_step: { type: Sequelize.INTEGER, defaultValue: 0 },
            paid_date: { type: Sequelize.DATEONLY, allowNull: true },
            paid_by: { type: Sequelize.UUID, allowNull: true },
            payment_ref: { type: Sequelize.STRING(100), allowNull: true },
            notes: { type: Sequelize.TEXT, allowNull: true },
            created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
            updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('employee_claims');
        await queryInterface.dropTable('shift_schedules');
        await queryInterface.dropTable('shift_rotations');
        await queryInterface.dropTable('work_shifts');
        await queryInterface.dropTable('warning_letters');
        await queryInterface.dropTable('termination_requests');
        await queryInterface.dropTable('payroll_runs');
        await queryInterface.dropTable('payroll_components');
        await queryInterface.dropTable('leave_approval_configs');
        await queryInterface.dropTable('leave_balances');
        await queryInterface.dropTable('leave_types');
        await queryInterface.dropTable('employee_work_experiences');
        await queryInterface.dropTable('employee_skills');
        await queryInterface.dropTable('employee_salaries');
        await queryInterface.dropTable('employee_mutations');
        await queryInterface.dropTable('employee_families');
        await queryInterface.dropTable('employee_educations');
        await queryInterface.dropTable('employee_documents');
        await queryInterface.dropTable('employee_contracts');
        await queryInterface.dropTable('employee_certifications');
        await queryInterface.dropTable('org_structures');
        await queryInterface.dropTable('job_grades');
    }
};
