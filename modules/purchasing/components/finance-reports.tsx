import React from 'react';
import ReportsComponent from '@/components/finance/ReportsComponent';

export const FinanceReports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Laporan Keuangan</h2>
        <p className="text-gray-600 mb-6">
          Modul laporan keuangan untuk purchasing dan finance.
        </p>
        <ReportsComponent />
      </div>
    </div>
  );
};

export default FinanceReports;
