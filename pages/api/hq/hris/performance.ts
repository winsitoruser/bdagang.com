import type { NextApiRequest, NextApiResponse } from 'next';

let PerformanceReview: any, Employee: any, triggerHRISWebhook: any;
try {
  const models = require('../../../../models');
  PerformanceReview = models.PerformanceReview;
  Employee = models.Employee;
} catch (e) {
  console.warn('Performance models not available:', e);
}
try {
  const webhooks = require('./webhooks');
  triggerHRISWebhook = webhooks.triggerHRISWebhook;
} catch (e) {
  triggerHRISWebhook = async () => {};
}

const mockReviews = [
  {
    id: '1', employeeId: '1', employeeName: 'Ahmad Wijaya', position: 'Branch Manager', branchName: 'Cabang Pusat Jakarta', department: 'Operations',
    reviewPeriod: 'Q4 2025', reviewDate: '2026-01-15', reviewer: 'Super Admin', overallRating: 4.8,
    categories: [
      { name: 'Kepemimpinan', rating: 5, weight: 25, comments: 'Excellent leadership skills' },
      { name: 'Pencapaian Target', rating: 4.5, weight: 30, comments: 'Consistently exceeds targets' },
      { name: 'Komunikasi', rating: 4.8, weight: 15, comments: 'Great communicator' },
      { name: 'Problem Solving', rating: 4.7, weight: 15, comments: 'Quick problem resolution' },
      { name: 'Teamwork', rating: 5, weight: 15, comments: 'Excellent team player' }
    ],
    strengths: ['Strategic thinking', 'Team motivation', 'Customer focus'],
    areasForImprovement: ['Delegation skills', 'Work-life balance'],
    goals: ['Expand branch revenue by 15%', 'Develop 2 future managers'],
    status: 'acknowledged'
  },
  {
    id: '2', employeeId: '2', employeeName: 'Siti Rahayu', position: 'Branch Manager', branchName: 'Cabang Bandung', department: 'Operations',
    reviewPeriod: 'Q4 2025', reviewDate: '2026-01-18', reviewer: 'Super Admin', overallRating: 4.5,
    categories: [
      { name: 'Kepemimpinan', rating: 4.5, weight: 25, comments: 'Good leadership' },
      { name: 'Pencapaian Target', rating: 4.5, weight: 30, comments: 'Meets targets consistently' },
      { name: 'Komunikasi', rating: 4.5, weight: 15, comments: 'Effective communicator' },
      { name: 'Problem Solving', rating: 4.3, weight: 15, comments: 'Good analytical skills' },
      { name: 'Teamwork', rating: 4.7, weight: 15, comments: 'Strong team builder' }
    ],
    strengths: ['Process improvement', 'Team development', 'Customer service'],
    areasForImprovement: ['Time management', 'Strategic planning'],
    goals: ['Improve customer satisfaction to 95%', 'Reduce operational costs by 10%'],
    status: 'reviewed'
  },
  {
    id: '3', employeeId: '3', employeeName: 'Budi Santoso', position: 'Branch Manager', branchName: 'Cabang Surabaya', department: 'Operations',
    reviewPeriod: 'Q4 2025', reviewDate: '2026-01-20', reviewer: 'Super Admin', overallRating: 3.8,
    categories: [
      { name: 'Kepemimpinan', rating: 3.5, weight: 25, comments: 'Needs improvement' },
      { name: 'Pencapaian Target', rating: 3.8, weight: 30, comments: 'Below target' },
      { name: 'Komunikasi', rating: 4.0, weight: 15, comments: 'Adequate' },
      { name: 'Problem Solving', rating: 3.7, weight: 15, comments: 'Slow response' },
      { name: 'Teamwork', rating: 4.2, weight: 15, comments: 'Good collaboration' }
    ],
    strengths: ['Technical knowledge', 'Product expertise'],
    areasForImprovement: ['Sales management', 'Team motivation', 'Target achievement'],
    goals: ['Achieve 100% sales target', 'Improve team productivity by 20%'],
    status: 'submitted'
  }
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getPerformanceReviews(req, res);
      case 'POST':
        return await createPerformanceReview(req, res);
      case 'PUT':
        return await updatePerformanceReview(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Performance Review API Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getPerformanceReviews(req: NextApiRequest, res: NextApiResponse) {
  const { employeeId, period, status } = req.query;

  // Try DB first
  if (PerformanceReview && Employee) {
    try {
      const where: any = {};
      if (employeeId) where.employeeId = employeeId;
      if (period) where.reviewPeriod = period;
      if (status) where.status = status;

      const dbReviews = await PerformanceReview.findAll({
        where,
        order: [['reviewDate', 'DESC']]
      });

      if (dbReviews.length > 0) {
        const { Op } = require('sequelize');
        const empIds = [...new Set(dbReviews.map((r: any) => r.employeeId))];
        const employees = await Employee.findAll({
          where: { id: { [Op.in]: empIds } },
          attributes: ['id', 'name', 'position', 'department', 'workLocation']
        });
        const empMap: Record<string, any> = {};
        employees.forEach((e: any) => { empMap[e.id] = e; });

        const reviews = dbReviews.map((r: any) => {
          const emp = empMap[r.employeeId] || {};
          return {
            id: r.id,
            employeeId: r.employeeId,
            employeeName: emp.name || 'Unknown',
            position: emp.position || '-',
            branchName: emp.workLocation || '-',
            department: emp.department || '-',
            reviewPeriod: r.reviewPeriod,
            reviewDate: r.reviewDate,
            reviewer: r.reviewerName || 'Admin',
            overallRating: parseFloat(r.overallRating) || 0,
            categories: r.categories || [],
            strengths: r.strengths || [],
            areasForImprovement: r.areasForImprovement || [],
            goals: r.goals || [],
            status: r.status
          };
        });

        const ratings = reviews.map((r: any) => r.overallRating);
        return res.status(200).json({
          reviews,
          summary: {
            total: reviews.length,
            avgRating: ratings.reduce((s: number, r: number) => s + r, 0) / (ratings.length || 1),
            excellent: ratings.filter((r: number) => r >= 4.5).length,
            good: ratings.filter((r: number) => r >= 3.5 && r < 4.5).length,
            needsImprovement: ratings.filter((r: number) => r < 3.5).length
          }
        });
      }
    } catch (e) {
      console.warn('Performance DB query failed, using mock:', (e as any).message);
    }
  }

  // Fallback to mock
  let filtered = mockReviews;
  if (employeeId) filtered = filtered.filter(r => r.employeeId === employeeId);
  if (period) filtered = filtered.filter(r => r.reviewPeriod === period);
  if (status) filtered = filtered.filter(r => r.status === status);

  return res.status(200).json({
    reviews: filtered,
    summary: {
      total: filtered.length,
      avgRating: filtered.reduce((sum, r) => sum + r.overallRating, 0) / (filtered.length || 1),
      excellent: filtered.filter(r => r.overallRating >= 4.5).length,
      good: filtered.filter(r => r.overallRating >= 3.5 && r.overallRating < 4.5).length,
      needsImprovement: filtered.filter(r => r.overallRating < 3.5).length
    }
  });
}

async function createPerformanceReview(req: NextApiRequest, res: NextApiResponse) {
  const { employeeId, employeeName, branchId, branchName, reviewPeriod, reviewerId, reviewerName, categories, strengths, areasForImprovement, goals } = req.body;

  if (!employeeId || !reviewPeriod || !reviewerId) {
    return res.status(400).json({ error: 'Employee ID, review period, and reviewer ID are required' });
  }

  // Calculate overall rating
  let totalWeight = 0;
  let weightedSum = 0;
  if (categories && categories.length > 0) {
    categories.forEach((cat: any) => {
      totalWeight += cat.weight || 0;
      weightedSum += (cat.rating || 0) * (cat.weight || 0);
    });
  }
  const overallRating = totalWeight > 0 ? Math.round((weightedSum / totalWeight) * 10) / 10 : 0;

  if (PerformanceReview) {
    try {
      const review = await PerformanceReview.create({
        employeeId,
        branchId: branchId || null,
        reviewPeriod,
        reviewDate: new Date().toISOString().split('T')[0],
        reviewerId,
        reviewerName: reviewerName || 'Admin',
        overallRating,
        categories: categories || [],
        strengths: strengths || [],
        areasForImprovement: areasForImprovement || [],
        goals: goals || [],
        status: 'draft',
        tenantId: req.body.tenantId || null
      });

      await triggerHRISWebhook('performance.review_created', employeeId, employeeName || 'Unknown', review, branchId, branchName);
      return res.status(201).json({ review, message: 'Performance review created successfully' });
    } catch (e: any) {
      if (e.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'Review already exists for this employee and period' });
      }
      console.error('Performance create error:', e.message);
      return res.status(500).json({ error: 'Failed to create review', details: e.message });
    }
  }

  // Fallback mock
  const newReview = {
    id: Date.now().toString(), employeeId, reviewPeriod,
    reviewDate: new Date().toISOString().split('T')[0],
    categories, strengths, areasForImprovement, goals,
    overallRating, status: 'draft'
  };
  await triggerHRISWebhook('performance.review_created', employeeId, employeeName || 'Unknown', newReview, branchId, branchName);
  return res.status(201).json({ review: newReview, message: 'Performance review created successfully (mock)' });
}

async function updatePerformanceReview(req: NextApiRequest, res: NextApiResponse) {
  const { id, status, employeeComments, managerComments, categories, overallRating } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Review ID is required' });
  }

  if (PerformanceReview) {
    try {
      const review = await PerformanceReview.findByPk(id);
      if (!review) return res.status(404).json({ error: 'Review not found' });

      const updateData: any = {};
      if (status) updateData.status = status;
      if (employeeComments !== undefined) updateData.employeeComments = employeeComments;
      if (managerComments !== undefined) updateData.managerComments = managerComments;
      if (categories) {
        updateData.categories = categories;
        // Recalculate rating
        let tw = 0, ws = 0;
        categories.forEach((c: any) => { tw += c.weight || 0; ws += (c.rating || 0) * (c.weight || 0); });
        if (tw > 0) updateData.overallRating = Math.round((ws / tw) * 10) / 10;
      }
      if (overallRating !== undefined) updateData.overallRating = overallRating;
      if (status === 'acknowledged') updateData.acknowledgedAt = new Date();

      await review.update(updateData);

      if (status === 'submitted') {
        await triggerHRISWebhook('performance.review_submitted', review.employeeId, 'Employee', review);
      } else if (status === 'acknowledged') {
        await triggerHRISWebhook('performance.review_acknowledged', review.employeeId, 'Employee', review);
      }

      return res.status(200).json({ review, message: 'Performance review updated successfully' });
    } catch (e: any) {
      return res.status(500).json({ error: 'Failed to update review', details: e.message });
    }
  }

  // Fallback mock
  const updatedReview = { id, status, employeeComments, managerComments, categories, overallRating, updatedAt: new Date().toISOString() };
  if (status === 'submitted') await triggerHRISWebhook('performance.review_submitted', 'emp', 'Employee', updatedReview);
  if (status === 'acknowledged') await triggerHRISWebhook('performance.review_acknowledged', 'emp', 'Employee', updatedReview);
  return res.status(200).json({ review: updatedReview, message: 'Performance review updated (mock)' });
}
