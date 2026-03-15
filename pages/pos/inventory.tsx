import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import PosLayout from "@/components/layouts/pos-layout";
import { useTranslation } from '@/lib/i18n';

const InventoryPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  
  return (
    <PosLayout>
      <Head>
        <title>Modul Telah Dihapus</title>
      </Head>
      <div className="flex flex-col items-center justify-center w-full h-screen bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden">
          {/* Orange/amber decorative element */}
          <div className="h-2 bg-gradient-to-r from-orange-500 to-amber-500"></div>
          
          <div className="p-6">
            <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
              Modul Inventory Telah Dihapus
            </h1>
            
            <p className="text-gray-600 text-center mb-6">
              Modul inventory tidak tersedia saat ini karena telah dihapus total.
            </p>
            
            <div className="flex justify-center">
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-md hover:from-orange-600 hover:to-amber-600 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </PosLayout>
  );
};

export default InventoryPage;
