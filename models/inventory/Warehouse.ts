/**
 * Warehouse Model
 * Placeholder for warehouse management
 */

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  address?: string;
  isActive: boolean;
}

export default Warehouse;

// Named export for compatibility
export { Warehouse as default };
