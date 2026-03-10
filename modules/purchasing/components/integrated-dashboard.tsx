import React from 'react';

export const IntegratedDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Dashboard Terintegrasi</h2>
        <p className="text-gray-600 mb-6">
          Modul dashboard terintegrasi untuk purchasing dan finance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Purchase Orders</h3>
            <p className="text-sm text-gray-600">Kelola purchase order Anda</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Suppliers</h3>
            <p className="text-sm text-gray-600">Kelola daftar supplier</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold mb-2">Laporan Keuangan</h3>
            <p className="text-sm text-gray-600">Analisis dan laporan keuangan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedDashboard;
