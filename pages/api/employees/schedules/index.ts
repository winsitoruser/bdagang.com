import { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';
import { Op } from 'sequelize';
import { getSessionBranchId, getSessionDataScope, getSessionTenantId } from '@/lib/session-scope';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const tenantId = getSessionTenantId(session);
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant tidak ditemukan pada sesi. Silakan login ulang.'
      });
    }

    const EmployeeSchedule = require('@/models/EmployeeSchedule');
    const Employee = require('@/models/Employee');
    const Location = require('@/models/Location');

    const branchId = getSessionBranchId(session);
    const scopeOwnBranch = getSessionDataScope(session) === 'own_branch' && !!branchId;

    const buildEmployeeScope = () => {
      const w: Record<string, unknown> = { tenantId };
      if (scopeOwnBranch) {
        w.branchId = branchId;
      }
      return w;
    };

    const employeeInclude = {
      model: Employee,
      as: 'employee',
      required: true,
      attributes: ['id', 'name', 'employeeId', 'position', 'branchId']
    };

    if (req.method === 'GET') {
      const { 
        employeeId, 
        startDate, 
        endDate, 
        status, 
        shiftType,
        limit = 100,
        offset = 0 
      } = req.query;

      const scopedEmployees = await Employee.findAll({
        attributes: ['id'],
        where: buildEmployeeScope()
      });
      const allowedIds: string[] = scopedEmployees.map((e: { id: string }) => e.id);

      if (allowedIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          total: 0,
          limit: parseInt(limit as string, 10),
          offset: parseInt(offset as string, 10)
        });
      }

      const where: Record<string, unknown> = {
        employeeId: { [Op.in]: allowedIds }
      };

      if (employeeId) {
        if (!allowedIds.includes(employeeId as string)) {
          return res.status(403).json({ success: false, error: 'Akses ditolak untuk karyawan ini' });
        }
        where.employeeId = employeeId;
      }

      if (startDate && endDate) {
        where.scheduleDate = {
          [Op.between]: [startDate, endDate]
        };
      } else if (startDate) {
        where.scheduleDate = {
          [Op.gte]: startDate
        };
      } else if (endDate) {
        where.scheduleDate = {
          [Op.lte]: endDate
        };
      }

      if (status) {
        where.status = status;
      }

      if (shiftType) {
        where.shiftType = shiftType;
      }

      const schedules = await EmployeeSchedule.findAll({
        where,
        include: [
          employeeInclude,
          {
            model: Location,
            as: 'location',
            attributes: ['id', 'name'],
            required: false
          }
        ],
        order: [['scheduleDate', 'ASC'], ['startTime', 'ASC']],
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      });

      const total = await EmployeeSchedule.count({ where });

      return res.status(200).json({
        success: true,
        data: schedules,
        total,
        limit: parseInt(limit as string, 10),
        offset: parseInt(offset as string, 10)
      });

    } else if (req.method === 'POST') {
      const {
        employeeId,
        scheduleDate,
        shiftType,
        startTime,
        endTime,
        locationId,
        notes,
        isRecurring,
        recurringPattern,
        recurringEndDate
      } = req.body;

      if (!employeeId || !scheduleDate || !shiftType || !startTime || !endTime) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }

      const empWhere: Record<string, unknown> = {
        id: employeeId,
        ...buildEmployeeScope()
      };

      const employee = await Employee.findOne({ where: empWhere });
      if (!employee) {
        return res.status(404).json({
          success: false,
          error: 'Employee not found'
        });
      }

      const existingSchedule = await EmployeeSchedule.findOne({
        where: {
          employeeId,
          scheduleDate,
          status: { [Op.notIn]: ['cancelled'] }
        }
      });

      if (existingSchedule) {
        return res.status(400).json({
          success: false,
          error: 'Employee already has a schedule for this date'
        });
      }

      const schedule = await EmployeeSchedule.create({
        employeeId,
        scheduleDate,
        shiftType,
        startTime,
        endTime,
        locationId: locationId || null,
        notes: notes || null,
        isRecurring: isRecurring || false,
        recurringPattern: recurringPattern || 'none',
        recurringEndDate: recurringEndDate || null,
        status: 'scheduled',
        createdBy: session.user?.id || null
      });

      if (isRecurring && recurringPattern !== 'none' && recurringEndDate) {
        const schedulesToCreate = [];
        let currentDate = new Date(scheduleDate);
        const endDate = new Date(recurringEndDate);

        while (currentDate < endDate) {
          if (recurringPattern === 'daily') {
            currentDate.setDate(currentDate.getDate() + 1);
          } else if (recurringPattern === 'weekly') {
            currentDate.setDate(currentDate.getDate() + 7);
          } else if (recurringPattern === 'monthly') {
            currentDate.setMonth(currentDate.getMonth() + 1);
          }

          if (currentDate <= endDate) {
            schedulesToCreate.push({
              employeeId,
              scheduleDate: currentDate.toISOString().split('T')[0],
              shiftType,
              startTime,
              endTime,
              locationId: locationId || null,
              notes: notes || null,
              isRecurring: true,
              recurringPattern,
              recurringEndDate,
              status: 'scheduled',
              createdBy: session.user?.id || null
            });
          }
        }

        if (schedulesToCreate.length > 0) {
          await EmployeeSchedule.bulkCreate(schedulesToCreate);
        }
      }

      const createdSchedule = await EmployeeSchedule.findByPk(schedule.id, {
        include: [
          {
            model: Employee,
            as: 'employee',
            required: true,
            attributes: ['id', 'name', 'employeeId', 'position']
          },
          {
            model: Location,
            as: 'location',
            attributes: ['id', 'name'],
            required: false
          }
        ]
      });

      return res.status(201).json({
        success: true,
        data: createdSchedule,
        message: 'Schedule created successfully'
      });

    } else {
      return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

  } catch (error: any) {
    console.error('Employee Schedules API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
