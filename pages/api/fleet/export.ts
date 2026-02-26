import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]';
import { mockVehicles, mockDrivers } from '@/lib/mockData/fleet';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { type, format } = req.body; // type: 'vehicles' or 'drivers', format: 'csv' or 'json'

    if (format === 'csv') {
      let csvContent = '';
      
      if (type === 'vehicles') {
        // CSV Headers
        csvContent = 'No. Plat,Tipe,Merk,Model,Tahun,Warna,Kepemilikan,Status,Odometer (km),Service Berikutnya (km),Lokasi\n';
        
        // CSV Data
        mockVehicles.forEach(vehicle => {
          csvContent += `"${vehicle.licensePlate}","${vehicle.vehicleType}","${vehicle.brand}","${vehicle.model}",${vehicle.year},"${vehicle.color}","${vehicle.ownershipType}","${vehicle.status}",${vehicle.currentOdometerKm},${vehicle.nextServiceDueKm},"${vehicle.currentLocation}"\n`;
        });
      } else if (type === 'drivers') {
        // CSV Headers
        csvContent = 'Nama,No. Driver,Telepon,Email,Tipe SIM,Total Pengiriman,On-Time,Safety Score,Status,Availability\n';
        
        // CSV Data
        mockDrivers.forEach(driver => {
          const onTimeRate = driver.totalDeliveries > 0 
            ? Math.round((driver.onTimeDeliveries / driver.totalDeliveries) * 100) 
            : 0;
          csvContent += `"${driver.fullName}","${driver.driverNumber}","${driver.phone}","${driver.email}","${driver.licenseType}",${driver.totalDeliveries},${onTimeRate}%,${driver.safetyScore},"${driver.status}","${driver.availabilityStatus}"\n`;
        });
      }

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=fleet-${type}-${Date.now()}.csv`);
      return res.status(200).send('\uFEFF' + csvContent); // UTF-8 BOM for Excel

    } else if (format === 'json') {
      const data = type === 'vehicles' ? mockVehicles : mockDrivers;
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=fleet-${type}-${Date.now()}.json`);
      return res.status(200).json(data);

    } else {
      return res.status(400).json({ error: 'Invalid format. Use csv or json' });
    }

  } catch (error: any) {
    console.error('Export API error:', error);
    return res.status(500).json({ error: error.message });
  }
}
