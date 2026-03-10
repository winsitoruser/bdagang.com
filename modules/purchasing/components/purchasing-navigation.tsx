import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const PurchasingNavigation: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/purchasing/finance-integration', label: 'Laporan Keuangan' },
    { href: '/purchasing/orders', label: 'Purchase Orders' },
    { href: '/purchasing/suppliers', label: 'Suppliers' },
  ];

  return (
    <div className="mb-6">
      <nav className="flex space-x-4 border-b border-gray-200">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`px-4 py-2 text-sm font-medium ${
              pathname === item.href
                ? 'border-b-2 border-orange-500 text-orange-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default PurchasingNavigation;
