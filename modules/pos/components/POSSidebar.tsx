import React from 'react';
import { FaBars, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface POSSidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const POSSidebar: React.FC<POSSidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  return (
    <div
      className={`${
        isCollapsed ? 'w-16' : 'w-64'
      } bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}
    >
      {/* Toggle Button */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && <h2 className="text-lg font-bold text-gray-800">POS Menu</h2>}
        <button
          onClick={toggleSidebar}
          className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-md"
        >
          {isCollapsed ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />}
        </button>
      </div>

      {/* Sidebar Content */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          <li>
            <a
              href="/pos/transaksi"
              className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="text-gray-600">Transaksi</span>
            </a>
          </li>
          <li>
            <a
              href="/pos/inventory"
              className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="text-gray-600">Inventory</span>
            </a>
          </li>
          <li>
            <a
              href="/pos/settings"
              className="flex items-center px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <span className="text-gray-600">Pengaturan</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default POSSidebar;
