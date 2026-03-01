/**
 * Module Registry System
 * Central registry for managing all modules in the system
 */

export interface ModuleDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'core' | 'fnb' | 'optional' | 'addon';
  version: string;
  
  // Dependencies
  dependencies: string[];
  optionalDependencies: string[];
  
  // Business Type Configuration
  businessTypeConfig: {
    [businessType: string]: {
      isRequired: boolean;
      isRecommended: boolean;
      isOptional: boolean;
      features: string[];
      defaultConfig: Record<string, any>;
    };
  };
  
  // Integration Points
  integrationPoints: {
    provides: IntegrationPoint[];
    consumes: IntegrationPoint[];
  };
  
  // Features
  features: FeatureDefinition[];
  
  // API Routes
  routes: RouteDefinition[];
  
  // Database Models
  models: string[];
  
  // UI Components
  components: ComponentDefinition[];
}

export interface IntegrationPoint {
  name: string;
  type: 'event' | 'api' | 'data';
  description: string;
  schema: any;
}

export interface FeatureDefinition {
  code: string;
  name: string;
  description: string;
  isDefault: boolean;
  businessTypes: string[];
  config: Record<string, any>;
}

export interface RouteDefinition {
  path: string;
  method: string;
  handler: string;
}

export interface ComponentDefinition {
  name: string;
  path: string;
  type: 'page' | 'component' | 'widget';
}

export class ModuleRegistry {
  private static instance: ModuleRegistry;
  private modules: Map<string, ModuleDefinition> = new Map();
  private integrations: Map<string, IntegrationPoint[]> = new Map();
  
  private constructor() {
    this.initializeModules();
  }
  
  public static getInstance(): ModuleRegistry {
    if (!ModuleRegistry.instance) {
      ModuleRegistry.instance = new ModuleRegistry();
    }
    return ModuleRegistry.instance;
  }
  
  private initializeModules(): void {
    // Register core modules
    this.registerCoreModules();
    
    // Register F&B specific modules
    this.registerFnBModules();
    
    // Register optional modules
    this.registerOptionalModules();
  }
  
  public registerModule(module: ModuleDefinition): void {
    // Validate module definition
    this.validateModule(module);
    
    // Check dependencies
    this.checkDependencies(module);
    
    // Register module
    this.modules.set(module.code, module);
    
    // Setup integration hooks
    this.setupIntegrationHooks(module);
    
    console.log(`Module registered: ${module.name} (${module.code})`);
  }
  
  private validateModule(module: ModuleDefinition): void {
    if (!module.code || !module.name) {
      throw new Error('Module must have code and name');
    }
    
    if (this.modules.has(module.code)) {
      throw new Error(`Module ${module.code} already registered`);
    }
  }
  
  private checkDependencies(module: ModuleDefinition): void {
    for (const depCode of module.dependencies) {
      if (!this.modules.has(depCode)) {
        console.warn(`Dependency ${depCode} not found for module ${module.code}`);
      }
    }
  }
  
  private setupIntegrationHooks(module: ModuleDefinition): void {
    // Register provided integration points
    if (module.integrationPoints.provides) {
      module.integrationPoints.provides.forEach(point => {
        const key = `${module.code}.${point.name}`;
        if (!this.integrations.has(key)) {
          this.integrations.set(key, []);
        }
        this.integrations.get(key)!.push(point);
      });
    }
  }
  
  public getModule(code: string): ModuleDefinition | undefined {
    return this.modules.get(code);
  }
  
  public getAllModules(): ModuleDefinition[] {
    return Array.from(this.modules.values());
  }
  
  public getModulesByCategory(category: string): ModuleDefinition[] {
    return Array.from(this.modules.values()).filter(
      m => m.category === category
    );
  }
  
  public getModulesForBusinessType(
    businessType: string,
    includeOptional: boolean = false
  ): ModuleDefinition[] {
    const modules = Array.from(this.modules.values());
    
    return modules.filter(module => {
      const config = module.businessTypeConfig[businessType];
      if (!config) return false;
      
      if (config.isRequired) return true;
      if (config.isRecommended) return true;
      if (includeOptional && config.isOptional) return true;
      
      return false;
    });
  }
  
  public resolveDependencies(moduleIds: string[]): string[] {
    const resolved = new Set<string>();
    const queue = [...moduleIds];
    
    while (queue.length > 0) {
      const moduleId = queue.shift()!;
      if (resolved.has(moduleId)) continue;
      
      resolved.add(moduleId);
      
      const module = this.modules.get(moduleId);
      if (module?.dependencies) {
        queue.push(...module.dependencies);
      }
    }
    
    return Array.from(resolved);
  }
  
  public validateModulesForBusinessType(
    moduleIds: string[],
    businessType: string
  ): { valid: string[]; invalid: string[] } {
    const valid: string[] = [];
    const invalid: string[] = [];
    
    for (const moduleId of moduleIds) {
      const module = this.modules.get(moduleId);
      if (!module) {
        invalid.push(moduleId);
        continue;
      }
      
      const config = module.businessTypeConfig[businessType];
      if (config) {
        valid.push(moduleId);
      } else {
        invalid.push(moduleId);
      }
    }
    
    return { valid, invalid };
  }
  
  public getIntegrationPoint(moduleCode: string, pointName: string): IntegrationPoint | undefined {
    const key = `${moduleCode}.${pointName}`;
    const points = this.integrations.get(key);
    return points?.[0];
  }
  
  // Register Core Modules
  private registerCoreModules(): void {
    // POS Core Module
    this.registerModule({
      id: 'pos-core',
      code: 'POS_CORE',
      name: 'Point of Sale',
      description: 'Core POS functionality for order taking and payment processing',
      category: 'core',
      version: '1.0.0',
      dependencies: [],
      optionalDependencies: ['INVENTORY_CORE', 'CUSTOMER'],
      businessTypeConfig: {
        fine_dining: { isRequired: true, isRecommended: true, isOptional: false, features: ['dine_in', 'split_bill', 'course_tracking'], defaultConfig: {} },
        cloud_kitchen: { isRequired: true, isRecommended: true, isOptional: false, features: ['delivery_mode', 'quick_order'], defaultConfig: {} },
        qsr: { isRequired: true, isRecommended: true, isOptional: false, features: ['quick_mode', 'combo_meals'], defaultConfig: {} },
        cafe: { isRequired: true, isRecommended: true, isOptional: false, features: ['beverage_focus', 'customization'], defaultConfig: {} }
      },
      integrationPoints: {
        provides: [
          { name: 'order.created', type: 'event', description: 'Fired when new order is created', schema: {} },
          { name: 'payment.completed', type: 'event', description: 'Fired when payment is completed', schema: {} }
        ],
        consumes: [
          { name: 'inventory.stock', type: 'data', description: 'Stock availability data', schema: {} }
        ]
      },
      features: [],
      routes: [
        { path: '/api/pos/orders', method: 'POST', handler: 'createOrder' },
        { path: '/api/pos/payment', method: 'POST', handler: 'processPayment' }
      ],
      models: ['Order', 'OrderItem', 'Payment'],
      components: [
        { name: 'POSInterface', path: '/components/pos/POSInterface', type: 'page' }
      ]
    });
    
    // Inventory Core Module
    this.registerModule({
      id: 'inventory-core',
      code: 'INVENTORY_CORE',
      name: 'Inventory Management',
      description: 'Stock tracking and inventory management',
      category: 'core',
      version: '1.0.0',
      dependencies: [],
      optionalDependencies: ['RECIPE_MANAGEMENT'],
      businessTypeConfig: {
        fine_dining: { isRequired: true, isRecommended: true, isOptional: false, features: ['ingredient_tracking', 'waste_management'], defaultConfig: {} },
        cloud_kitchen: { isRequired: true, isRecommended: true, isOptional: false, features: ['packaging_tracking'], defaultConfig: {} },
        qsr: { isRequired: true, isRecommended: true, isOptional: false, features: ['standardized_portions'], defaultConfig: {} },
        cafe: { isRequired: true, isRecommended: true, isOptional: false, features: ['beverage_inventory'], defaultConfig: {} }
      },
      integrationPoints: {
        provides: [
          { name: 'stock.deducted', type: 'event', description: 'Fired when stock is deducted', schema: {} },
          { name: 'stock.low', type: 'event', description: 'Fired when stock is low', schema: {} }
        ],
        consumes: [
          { name: 'order.created', type: 'event', description: 'Listen to order creation', schema: {} }
        ]
      },
      features: [],
      routes: [],
      models: ['Stock', 'StockMovement'],
      components: []
    });
  }
  
  // Register F&B Specific Modules
  private registerFnBModules(): void {
    // Table Management Module
    this.registerModule({
      id: 'table-management',
      code: 'TABLE_MANAGEMENT',
      name: 'Table Management',
      description: 'Floor plan and table management for dine-in',
      category: 'fnb',
      version: '1.0.0',
      dependencies: ['POS_CORE'],
      optionalDependencies: ['RESERVATION'],
      businessTypeConfig: {
        fine_dining: { isRequired: true, isRecommended: true, isOptional: false, features: ['floor_plan', 'table_merging', 'waiter_assignment'], defaultConfig: {} },
        cloud_kitchen: { isRequired: false, isRecommended: false, isOptional: false, features: [], defaultConfig: {} },
        qsr: { isRequired: false, isRecommended: false, isOptional: true, features: ['basic_table'], defaultConfig: {} },
        cafe: { isRequired: false, isRecommended: true, isOptional: true, features: ['simple_table'], defaultConfig: {} }
      },
      integrationPoints: {
        provides: [
          { name: 'table.occupied', type: 'event', description: 'Fired when table is occupied', schema: {} },
          { name: 'table.released', type: 'event', description: 'Fired when table is released', schema: {} }
        ],
        consumes: [
          { name: 'order.created', type: 'event', description: 'Listen to order creation', schema: {} }
        ]
      },
      features: [],
      routes: [],
      models: ['Table', 'FloorPlan'],
      components: []
    });
    
    // Kitchen Display System Module
    this.registerModule({
      id: 'kitchen-display',
      code: 'KITCHEN_DISPLAY',
      name: 'Kitchen Display System',
      description: 'Kitchen order management and display',
      category: 'fnb',
      version: '1.0.0',
      dependencies: ['POS_CORE'],
      optionalDependencies: ['RECIPE_MANAGEMENT'],
      businessTypeConfig: {
        fine_dining: { isRequired: true, isRecommended: true, isOptional: false, features: ['multi_station', 'plating_instructions'], defaultConfig: {} },
        cloud_kitchen: { isRequired: true, isRecommended: true, isOptional: false, features: ['packing_station', 'delivery_priority'], defaultConfig: {} },
        qsr: { isRequired: true, isRecommended: true, isOptional: false, features: ['simplified_display', 'fast_prep'], defaultConfig: {} },
        cafe: { isRequired: false, isRecommended: true, isOptional: true, features: ['beverage_station'], defaultConfig: {} }
      },
      integrationPoints: {
        provides: [
          { name: 'kitchen.order.received', type: 'event', description: 'Fired when kitchen receives order', schema: {} },
          { name: 'kitchen.item.ready', type: 'event', description: 'Fired when item is ready', schema: {} }
        ],
        consumes: [
          { name: 'order.created', type: 'event', description: 'Listen to order creation', schema: {} }
        ]
      },
      features: [],
      routes: [],
      models: ['KitchenOrder', 'KitchenStation'],
      components: []
    });
    
    // Recipe Management Module
    this.registerModule({
      id: 'recipe-management',
      code: 'RECIPE_MANAGEMENT',
      name: 'Recipe Management',
      description: 'Recipe cards and ingredient management',
      category: 'fnb',
      version: '1.0.0',
      dependencies: ['INVENTORY_CORE'],
      optionalDependencies: [],
      businessTypeConfig: {
        fine_dining: { isRequired: true, isRecommended: true, isOptional: false, features: ['detailed_recipes', 'plating_guide'], defaultConfig: {} },
        cloud_kitchen: { isRequired: true, isRecommended: true, isOptional: false, features: ['standardized_recipes'], defaultConfig: {} },
        qsr: { isRequired: false, isRecommended: true, isOptional: true, features: ['simple_recipes'], defaultConfig: {} },
        cafe: { isRequired: false, isRecommended: true, isOptional: true, features: ['beverage_recipes'], defaultConfig: {} }
      },
      integrationPoints: {
        provides: [
          { name: 'recipe.data', type: 'data', description: 'Recipe information', schema: {} }
        ],
        consumes: [
          { name: 'inventory.stock', type: 'data', description: 'Stock availability', schema: {} }
        ]
      },
      features: [],
      routes: [],
      models: ['Recipe', 'RecipeIngredient'],
      components: []
    });
  }
  
  // Register Optional Modules
  private registerOptionalModules(): void {
    // Reservation Module
    this.registerModule({
      id: 'reservation',
      code: 'RESERVATION',
      name: 'Reservation System',
      description: 'Table reservation and booking management',
      category: 'optional',
      version: '1.0.0',
      dependencies: ['TABLE_MANAGEMENT'],
      optionalDependencies: [],
      businessTypeConfig: {
        fine_dining: { isRequired: false, isRecommended: true, isOptional: true, features: ['advanced_booking', 'deposit'], defaultConfig: {} },
        cloud_kitchen: { isRequired: false, isRecommended: false, isOptional: false, features: [], defaultConfig: {} },
        qsr: { isRequired: false, isRecommended: false, isOptional: false, features: [], defaultConfig: {} },
        cafe: { isRequired: false, isRecommended: false, isOptional: true, features: ['simple_booking'], defaultConfig: {} }
      },
      integrationPoints: {
        provides: [
          { name: 'reservation.created', type: 'event', description: 'Fired when reservation is created', schema: {} }
        ],
        consumes: [
          { name: 'table.occupied', type: 'event', description: 'Listen to table occupation', schema: {} }
        ]
      },
      features: [],
      routes: [],
      models: ['Reservation'],
      components: []
    });
    
    // Online Ordering Module
    this.registerModule({
      id: 'online-ordering',
      code: 'ONLINE_ORDERING',
      name: 'Online Ordering',
      description: 'Web and mobile ordering platform',
      category: 'optional',
      version: '1.0.0',
      dependencies: ['POS_CORE'],
      optionalDependencies: ['DELIVERY_MANAGEMENT'],
      businessTypeConfig: {
        fine_dining: { isRequired: false, isRecommended: false, isOptional: true, features: ['limited_menu'], defaultConfig: {} },
        cloud_kitchen: { isRequired: true, isRecommended: true, isOptional: false, features: ['full_ordering', 'tracking'], defaultConfig: {} },
        qsr: { isRequired: false, isRecommended: true, isOptional: true, features: ['quick_order'], defaultConfig: {} },
        cafe: { isRequired: false, isRecommended: true, isOptional: true, features: ['pickup_order'], defaultConfig: {} }
      },
      integrationPoints: {
        provides: [
          { name: 'online.order.created', type: 'event', description: 'Fired when online order is created', schema: {} }
        ],
        consumes: [
          { name: 'order.created', type: 'event', description: 'Listen to order creation', schema: {} }
        ]
      },
      features: [],
      routes: [],
      models: ['OnlineOrder'],
      components: []
    });

    // ─── CRM Module (pluggable) ───
    this.registerModule({
      id: 'crm',
      code: 'CRM',
      name: 'Customer Relationship Management',
      description: 'Customer 360°, komunikasi, task & kalender, tiket & SLA, forecasting, automasi CRM',
      category: 'addon',
      version: '1.0.0',
      dependencies: [],
      optionalDependencies: ['SFA', 'MARKETING'],
      businessTypeConfig: {
        fine_dining: { isRequired: false, isRecommended: true, isOptional: true, features: ['customer_360', 'communications', 'tickets'], defaultConfig: {} },
        cloud_kitchen: { isRequired: false, isRecommended: false, isOptional: true, features: ['customer_360', 'tickets'], defaultConfig: {} },
        qsr: { isRequired: false, isRecommended: false, isOptional: true, features: ['customer_360'], defaultConfig: {} },
        cafe: { isRequired: false, isRecommended: true, isOptional: true, features: ['customer_360', 'communications'], defaultConfig: {} },
        retail: { isRequired: false, isRecommended: true, isOptional: true, features: ['customer_360', 'communications', 'tickets', 'forecasting'], defaultConfig: {} },
        distribution: { isRequired: true, isRecommended: true, isOptional: false, features: ['customer_360', 'communications', 'tasks', 'tickets', 'forecasting', 'automation'], defaultConfig: {} },
        manufacturing: { isRequired: false, isRecommended: true, isOptional: true, features: ['customer_360', 'communications', 'tickets'], defaultConfig: {} },
        services: { isRequired: true, isRecommended: true, isOptional: false, features: ['customer_360', 'communications', 'tasks', 'tickets', 'forecasting', 'automation'], defaultConfig: {} }
      },
      integrationPoints: {
        provides: [
          { name: 'crm.customer.created', type: 'event', description: 'Fired when CRM customer is created', schema: {} },
          { name: 'crm.ticket.created', type: 'event', description: 'Fired when support ticket is created', schema: {} },
          { name: 'crm.task.completed', type: 'event', description: 'Fired when CRM task is completed', schema: {} },
          { name: 'crm.customer.data', type: 'data', description: 'Customer 360° data provider', schema: {} }
        ],
        consumes: [
          { name: 'sfa.lead.converted', type: 'event', description: 'Listen to lead conversion from SFA', schema: {} },
          { name: 'order.created', type: 'event', description: 'Listen to POS orders for customer tracking', schema: {} }
        ]
      },
      features: [
        { code: 'customer_360', name: 'Customer 360°', description: 'Full customer profile with health score, lifecycle, segmentation', isDefault: true, businessTypes: ['all'], config: {} },
        { code: 'communications', name: 'Communication Hub', description: 'Multi-channel communication tracking (call, email, meeting, WhatsApp)', isDefault: true, businessTypes: ['all'], config: {} },
        { code: 'tasks', name: 'Task & Calendar', description: 'Task management with calendar integration', isDefault: true, businessTypes: ['all'], config: {} },
        { code: 'tickets', name: 'Ticket & SLA', description: 'Support ticketing system with SLA tracking', isDefault: true, businessTypes: ['all'], config: {} },
        { code: 'forecasting', name: 'Sales Forecasting', description: 'Revenue prediction and deal scoring', isDefault: false, businessTypes: ['distribution', 'services', 'retail'], config: {} },
        { code: 'automation', name: 'CRM Automation', description: 'Workflow automation rules and triggers', isDefault: false, businessTypes: ['distribution', 'services'], config: {} },
        { code: 'documents', name: 'Document Management', description: 'CRM-related document storage and templates', isDefault: false, businessTypes: ['all'], config: {} }
      ],
      routes: [
        { path: '/api/hq/sfa/crm', method: 'ALL', handler: 'crmHandler' },
        { path: '/api/hq/sfa/import-export', method: 'ALL', handler: 'importExportHandler' }
      ],
      models: [
        'CrmCustomer', 'CrmContact', 'CrmInteraction', 'CrmCustomerSegment', 'CrmCustomerTag',
        'CrmCommunication', 'CrmFollowUp', 'CrmEmailTemplate', 'CrmCommCampaign',
        'CrmTask', 'CrmTaskTemplate', 'CrmCalendarEvent',
        'CrmForecast', 'CrmForecastItem', 'CrmDealScore',
        'CrmTicket', 'CrmTicketComment', 'CrmSlaPolicy', 'CrmSatisfaction',
        'CrmAutomationRule', 'CrmAutomationLog',
        'CrmDocument', 'CrmDocumentTemplate', 'CrmSavedReport', 'CrmCustomDashboard'
      ],
      components: [
        { name: 'CRMPage', path: '/pages/hq/sfa/index', type: 'page' }
      ]
    });

    // ─── SFA Module (pluggable) ───
    this.registerModule({
      id: 'sfa',
      code: 'SFA',
      name: 'Sales Force Automation',
      description: 'Lead management, pipeline, tim & territory, kunjungan, order, target, insentif, coverage',
      category: 'addon',
      version: '1.0.0',
      dependencies: [],
      optionalDependencies: ['CRM', 'MARKETING'],
      businessTypeConfig: {
        fine_dining: { isRequired: false, isRecommended: false, isOptional: true, features: ['leads', 'pipeline'], defaultConfig: {} },
        cloud_kitchen: { isRequired: false, isRecommended: false, isOptional: true, features: ['leads'], defaultConfig: {} },
        qsr: { isRequired: false, isRecommended: false, isOptional: true, features: ['leads', 'visits'], defaultConfig: {} },
        cafe: { isRequired: false, isRecommended: false, isOptional: true, features: ['leads'], defaultConfig: {} },
        retail: { isRequired: false, isRecommended: true, isOptional: true, features: ['leads', 'pipeline', 'visits', 'targets'], defaultConfig: {} },
        distribution: { isRequired: true, isRecommended: true, isOptional: false, features: ['leads', 'pipeline', 'teams', 'visits', 'orders', 'targets', 'incentives', 'coverage', 'geofence', 'approval'], defaultConfig: {} },
        manufacturing: { isRequired: false, isRecommended: true, isOptional: true, features: ['leads', 'pipeline', 'teams', 'visits', 'orders', 'targets'], defaultConfig: {} },
        services: { isRequired: false, isRecommended: true, isOptional: true, features: ['leads', 'pipeline', 'teams', 'visits', 'targets'], defaultConfig: {} }
      },
      integrationPoints: {
        provides: [
          { name: 'sfa.lead.created', type: 'event', description: 'Fired when new lead is created', schema: {} },
          { name: 'sfa.lead.converted', type: 'event', description: 'Fired when lead is converted to opportunity', schema: {} },
          { name: 'sfa.visit.completed', type: 'event', description: 'Fired when field visit is completed', schema: {} },
          { name: 'sfa.order.created', type: 'event', description: 'Fired when field order is created', schema: {} },
          { name: 'sfa.target.achieved', type: 'event', description: 'Fired when sales target is achieved', schema: {} }
        ],
        consumes: [
          { name: 'crm.customer.data', type: 'data', description: 'Customer data from CRM module', schema: {} },
          { name: 'inventory.stock', type: 'data', description: 'Stock availability for field orders', schema: {} }
        ]
      },
      features: [
        { code: 'leads', name: 'Lead Management', description: 'Lead capture, scoring, and conversion tracking', isDefault: true, businessTypes: ['all'], config: {} },
        { code: 'pipeline', name: 'Pipeline Management', description: 'Visual sales pipeline with deal stages', isDefault: true, businessTypes: ['all'], config: {} },
        { code: 'teams', name: 'Team & Territory', description: 'Sales team management and territory assignment', isDefault: false, businessTypes: ['distribution', 'manufacturing'], config: {} },
        { code: 'visits', name: 'Visit & Coverage', description: 'Field visit tracking with check-in/out and GPS', isDefault: false, businessTypes: ['distribution', 'retail'], config: {} },
        { code: 'orders', name: 'Field Orders', description: 'On-the-go order creation and quotation', isDefault: false, businessTypes: ['distribution', 'manufacturing'], config: {} },
        { code: 'targets', name: 'Target & Achievement', description: 'Sales target setting and achievement tracking', isDefault: false, businessTypes: ['distribution', 'retail'], config: {} },
        { code: 'incentives', name: 'Incentive & Commission', description: 'Commission calculation and incentive schemes', isDefault: false, businessTypes: ['distribution'], config: {} },
        { code: 'coverage', name: 'Coverage Planning', description: 'Customer coverage plans and route optimization', isDefault: false, businessTypes: ['distribution'], config: {} },
        { code: 'geofence', name: 'Geofence', description: 'Location-based visit validation', isDefault: false, businessTypes: ['distribution'], config: {} },
        { code: 'approval', name: 'Approval Workflow', description: 'Multi-level approval for orders and expenses', isDefault: false, businessTypes: ['distribution', 'manufacturing'], config: {} }
      ],
      routes: [
        { path: '/api/hq/sfa', method: 'ALL', handler: 'sfaCoreHandler' },
        { path: '/api/hq/sfa/enhanced', method: 'ALL', handler: 'sfaEnhancedHandler' },
        { path: '/api/hq/sfa/advanced', method: 'ALL', handler: 'sfaAdvancedHandler' },
        { path: '/api/hq/sfa/import-export', method: 'ALL', handler: 'importExportHandler' }
      ],
      models: [
        'SfaLead', 'SfaOpportunity', 'SfaActivity', 'SfaVisit', 'SfaQuotation',
        'SfaTerritory', 'SfaRoutePlan', 'SfaTarget',
        'SfaTeam', 'SfaTeamMember', 'SfaTargetGroup', 'SfaTargetAssignment', 'SfaTargetProduct',
        'SfaAchievement', 'SfaIncentiveScheme', 'SfaIncentiveTier', 'SfaPlafon',
        'SfaCoveragePlan', 'SfaCoverageAssignment', 'SfaFieldOrder', 'SfaFieldOrderItem',
        'SfaMerchandising', 'SfaCompetitor', 'SfaCompetitorProduct', 'SfaSurvey', 'SfaSurveyResponse',
        'SfaApproval', 'SfaGeofence', 'SfaProductCommission', 'SfaParameter'
      ],
      components: [
        { name: 'SFAPage', path: '/pages/hq/sfa/index', type: 'page' }
      ]
    });

    // ─── Marketing Module (pluggable) ───
    this.registerModule({
      id: 'marketing',
      code: 'MARKETING',
      name: 'Marketing & Campaign',
      description: 'Campaign management, promosi, segmentasi pelanggan, budget marketing',
      category: 'addon',
      version: '1.0.0',
      dependencies: [],
      optionalDependencies: ['CRM', 'SFA'],
      businessTypeConfig: {
        fine_dining: { isRequired: false, isRecommended: true, isOptional: true, features: ['campaigns', 'promotions'], defaultConfig: {} },
        cloud_kitchen: { isRequired: false, isRecommended: true, isOptional: true, features: ['campaigns', 'promotions'], defaultConfig: {} },
        qsr: { isRequired: false, isRecommended: true, isOptional: true, features: ['campaigns', 'promotions'], defaultConfig: {} },
        cafe: { isRequired: false, isRecommended: true, isOptional: true, features: ['campaigns', 'promotions'], defaultConfig: {} },
        retail: { isRequired: false, isRecommended: true, isOptional: true, features: ['campaigns', 'promotions', 'segments', 'budgets'], defaultConfig: {} },
        distribution: { isRequired: false, isRecommended: true, isOptional: true, features: ['campaigns', 'promotions', 'segments', 'budgets'], defaultConfig: {} },
        manufacturing: { isRequired: false, isRecommended: false, isOptional: true, features: ['campaigns'], defaultConfig: {} },
        services: { isRequired: false, isRecommended: true, isOptional: true, features: ['campaigns', 'promotions', 'segments'], defaultConfig: {} }
      },
      integrationPoints: {
        provides: [
          { name: 'marketing.campaign.created', type: 'event', description: 'Fired when campaign is created', schema: {} },
          { name: 'marketing.promotion.activated', type: 'event', description: 'Fired when promotion is activated', schema: {} }
        ],
        consumes: [
          { name: 'crm.customer.data', type: 'data', description: 'Customer data for targeting', schema: {} },
          { name: 'sfa.lead.created', type: 'event', description: 'Listen to leads for campaign attribution', schema: {} }
        ]
      },
      features: [
        { code: 'campaigns', name: 'Campaign Management', description: 'Create and manage marketing campaigns', isDefault: true, businessTypes: ['all'], config: {} },
        { code: 'promotions', name: 'Promotions', description: 'Promotional offers and discount management', isDefault: true, businessTypes: ['all'], config: {} },
        { code: 'segments', name: 'Customer Segmentation', description: 'Segment customers for targeted marketing', isDefault: false, businessTypes: ['retail', 'distribution', 'services'], config: {} },
        { code: 'budgets', name: 'Marketing Budget', description: 'Budget allocation and tracking for campaigns', isDefault: false, businessTypes: ['retail', 'distribution'], config: {} }
      ],
      routes: [
        { path: '/api/hq/marketing', method: 'ALL', handler: 'marketingHandler' }
      ],
      models: [
        'MktCampaign', 'MktCampaignChannel', 'MktPromotion', 'MktPromotionUsage',
        'MktSegment', 'MktSegmentRule', 'MktBudget', 'MktBudgetAllocation',
        'MktLeadSource', 'MktAttribution'
      ],
      components: [
        { name: 'MarketingPage', path: '/pages/hq/marketing/index', type: 'page' }
      ]
    });
  }
}

// Export singleton instance
export const moduleRegistry = ModuleRegistry.getInstance();
