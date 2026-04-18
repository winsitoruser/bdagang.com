import type { NextPage } from 'next';
import Head from 'next/head';
import OpanelLayout from '@/components/opanel/OpanelLayout';
import OwnerRestaurantDashboard from '@/components/opanel/OwnerRestaurantDashboard';

const OwnerPanelDashboard: NextPage = () => {
  return (
    <>
      <Head>
        <title>Panel pemilik | Manajemen bisnis | BEDAGANG</title>
        <meta
          name="description"
          content="Dasbor pemilik restoran: ringkasan penjualan, cabang, dan akses cepat operasional outlet."
        />
      </Head>
      <OpanelLayout title="Dasbor">
        <OwnerRestaurantDashboard />
      </OpanelLayout>
    </>
  );
};

export default OwnerPanelDashboard;
