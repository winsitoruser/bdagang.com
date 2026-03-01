/**
 * HRIS Recruitment API
 * 
 * Handles CRUD operations for job openings and candidates.
 * Uses database when available, falls back to in-memory store with mock seed data.
 * 
 * GET    ?action=openings          - List all job openings
 * GET    ?action=candidates        - List all candidates
 * GET    ?action=pipeline          - Get pipeline stats
 * GET    ?action=analytics         - Get recruitment analytics
 * POST   ?action=create-opening    - Create a new job opening
 * POST   ?action=create-candidate  - Add a new candidate
 * PUT    ?action=update-opening    - Update a job opening
 * PUT    ?action=update-candidate  - Update candidate (stage, status, etc.)
 * DELETE ?action=delete-opening    - Delete a job opening
 * DELETE ?action=delete-candidate  - Delete a candidate
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

let sequelize: any;
try { sequelize = require('../../../../lib/sequelize'); } catch (e) {}

// In-memory store with mock seed data (used when DB not available)
let jobOpenings: any[] = [
  { id: 'JO-1', title: 'Kasir Senior', department: 'Sales', location: 'Jakarta', type: 'full_time', status: 'open', priority: 'high', salary_min: 5000000, salary_max: 7000000, applicants: 12, posted_date: '2026-02-15', deadline: '2026-03-15', description: 'Dibutuhkan kasir senior berpengalaman minimal 2 tahun', requirements: 'Pengalaman kasir 2+ tahun, jujur, teliti', created_at: '2026-02-15T00:00:00Z' },
  { id: 'JO-2', title: 'Staff Gudang', department: 'Warehouse', location: 'Bandung', type: 'full_time', status: 'open', priority: 'medium', salary_min: 4500000, salary_max: 6000000, applicants: 8, posted_date: '2026-02-20', deadline: '2026-03-20', description: 'Dibutuhkan staff gudang untuk cabang Bandung', requirements: 'Fisik sehat, mampu bekerja shift', created_at: '2026-02-20T00:00:00Z' },
  { id: 'JO-3', title: 'Branch Manager', department: 'Operations', location: 'Surabaya', type: 'full_time', status: 'open', priority: 'high', salary_min: 12000000, salary_max: 18000000, applicants: 5, posted_date: '2026-02-10', deadline: '2026-03-10', description: 'Memimpin operasional cabang baru di Surabaya', requirements: 'Pengalaman manajemen 5+ tahun, leadership', created_at: '2026-02-10T00:00:00Z' },
  { id: 'JO-4', title: 'Admin Finance', department: 'Finance', location: 'Jakarta', type: 'full_time', status: 'closed', priority: 'low', salary_min: 5500000, salary_max: 7500000, applicants: 15, posted_date: '2026-01-15', deadline: '2026-02-15', description: 'Admin keuangan untuk divisi Finance HQ', requirements: 'S1 Akuntansi, pengalaman 1+ tahun', created_at: '2026-01-15T00:00:00Z' },
];
let candidates: any[] = [
  { id: 'CA-1', name: 'Rina Wulandari', email: 'rina@email.com', phone: '081234567890', job_id: 'JO-1', position: 'Kasir Senior', stage: 'interview', status: 'active', source: 'Jobstreet', rating: 4, experience: '3 tahun kasir', education: 'SMA', applied_date: '2026-02-16', notes: 'Pengalaman bagus, komunikatif', created_at: '2026-02-16T00:00:00Z' },
  { id: 'CA-2', name: 'Dedi Kurniawan', email: 'dedi@email.com', phone: '081234567891', job_id: 'JO-1', position: 'Kasir Senior', stage: 'screening', status: 'active', source: 'LinkedIn', rating: 3, experience: '1 tahun kasir', education: 'SMK', applied_date: '2026-02-18', notes: '', created_at: '2026-02-18T00:00:00Z' },
  { id: 'CA-3', name: 'Sari Indah', email: 'sari@email.com', phone: '081234567892', job_id: 'JO-2', position: 'Staff Gudang', stage: 'applied', status: 'active', source: 'Walk-in', rating: 0, experience: 'Fresh graduate', education: 'SMA', applied_date: '2026-02-22', notes: '', created_at: '2026-02-22T00:00:00Z' },
  { id: 'CA-4', name: 'Agus Prasetyo', email: 'agus@email.com', phone: '081234567893', job_id: 'JO-3', position: 'Branch Manager', stage: 'offer', status: 'active', source: 'LinkedIn', rating: 5, experience: '7 tahun management retail', education: 'S1 Manajemen', applied_date: '2026-02-12', notes: 'Strong candidate', created_at: '2026-02-12T00:00:00Z' },
  { id: 'CA-5', name: 'Maya Putri', email: 'maya@email.com', phone: '081234567894', job_id: 'JO-1', position: 'Kasir Senior', stage: 'test', status: 'active', source: 'Referral', rating: 4, experience: '2 tahun kasir', education: 'D3', applied_date: '2026-02-17', notes: 'Referensi dari Eko', created_at: '2026-02-17T00:00:00Z' },
  { id: 'CA-6', name: 'Bima Aditya', email: 'bima@email.com', phone: '081234567895', job_id: 'JO-4', position: 'Admin Finance', stage: 'hired', status: 'active', source: 'Jobstreet', rating: 5, experience: '2 tahun admin keuangan', education: 'S1 Akuntansi', applied_date: '2026-01-20', notes: 'Sudah bergabung', created_at: '2026-01-20T00:00:00Z' },
  { id: 'CA-7', name: 'Lina Marlina', email: 'lina@email.com', phone: '081234567896', job_id: 'JO-2', position: 'Staff Gudang', stage: 'rejected', status: 'inactive', source: 'Walk-in', rating: 2, experience: 'Tidak relevan', education: 'SMA', applied_date: '2026-02-21', notes: 'Tidak memenuhi syarat', created_at: '2026-02-21T00:00:00Z' },
];
let dbAvailable = false;

async function tryDbQuery(query: string, replacements?: any): Promise<any[] | null> {
  if (!sequelize) return null;
  try {
    const [rows] = await sequelize.query(query, replacements ? { replacements } : undefined);
    return rows;
  } catch (e) {
    return null;
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) return res.status(401).json({ error: 'Unauthorized' });

    const tenantId = (session.user as any).tenantId || null;
    const { action } = req.query;
    const method = req.method;

    // Check DB availability once
    if (!dbAvailable && sequelize) {
      const check = await tryDbQuery("SELECT to_regclass('public.hris_job_openings') as t");
      if (check && check[0]?.t) dbAvailable = true;
    }

    // ── GET ──
    if (method === 'GET') {
      if (action === 'openings') {
        if (dbAvailable) {
          const rows = await tryDbQuery('SELECT * FROM hris_job_openings WHERE tenant_id = :tid OR tenant_id IS NULL ORDER BY created_at DESC', { tid: tenantId });
          if (rows && rows.length > 0) return res.json({ success: true, data: rows, total: rows.length });
        }
        return res.json({ success: true, data: jobOpenings, total: jobOpenings.length });
      }
      if (action === 'candidates') {
        const { job_id, stage, status } = req.query;
        if (dbAvailable) {
          let q = 'SELECT * FROM hris_candidates WHERE (tenant_id = :tid OR tenant_id IS NULL)';
          const repl: any = { tid: tenantId };
          if (job_id) { q += ' AND job_opening_id = :jid'; repl.jid = job_id; }
          if (stage) { q += ' AND current_stage = :stage'; repl.stage = stage; }
          if (status) { q += ' AND status = :status'; repl.status = status; }
          q += ' ORDER BY applied_date DESC';
          const rows = await tryDbQuery(q, repl);
          if (rows && rows.length > 0) return res.json({ success: true, data: rows, total: rows.length });
        }
        let filtered = [...candidates];
        if (job_id) filtered = filtered.filter(c => c.job_id === job_id);
        if (stage) filtered = filtered.filter(c => c.stage === stage);
        if (status) filtered = filtered.filter(c => c.status === status);
        return res.json({ success: true, data: filtered, total: filtered.length });
      }
      if (action === 'pipeline') {
        const stages = ['applied', 'screening', 'test', 'interview', 'offer', 'hired', 'rejected'];
        const src = dbAvailable
          ? (await tryDbQuery('SELECT * FROM hris_candidates WHERE tenant_id = :tid OR tenant_id IS NULL', { tid: tenantId })) || candidates
          : candidates;
        const pipeline = stages.map(stage => ({
          stage,
          count: src.filter((c: any) => (c.stage || c.current_stage) === stage).length,
          candidates: src.filter((c: any) => (c.stage || c.current_stage) === stage)
        }));
        return res.json({ success: true, data: pipeline });
      }
      if (action === 'analytics') {
        const srcCands = dbAvailable
          ? (await tryDbQuery('SELECT * FROM hris_candidates WHERE tenant_id = :tid OR tenant_id IS NULL', { tid: tenantId })) || candidates
          : candidates;
        const srcJobs = dbAvailable
          ? (await tryDbQuery('SELECT * FROM hris_job_openings WHERE tenant_id = :tid OR tenant_id IS NULL', { tid: tenantId })) || jobOpenings
          : jobOpenings;
        const totalApplicants = srcCands.length;
        const hired = srcCands.filter((c: any) => (c.stage || c.current_stage) === 'hired').length;
        const openPositions = srcJobs.filter((o: any) => o.status === 'open').length;
        const sources = ['LinkedIn', 'Jobstreet', 'Walk-in', 'Referral', 'Other'];
        const sourceStats = sources.map(s => ({ source: s, count: srcCands.filter((c: any) => c.source === s).length }));
        return res.json({
          success: true,
          data: {
            totalApplicants, hired, openPositions,
            acceptanceRate: totalApplicants > 0 ? Math.round(hired / totalApplicants * 100) : 0,
            avgTimeToHire: 21,
            sourceStats
          }
        });
      }
      return res.json({ success: true, data: { openings: jobOpenings.length, candidates: candidates.length } });
    }

    // ── POST ──
    if (method === 'POST') {
      const body = req.body;
      if (action === 'create-opening') {
        if (dbAvailable) {
          const rows = await tryDbQuery(`
            INSERT INTO hris_job_openings (id, tenant_id, title, department, location, employment_type, status, priority,
              salary_min, salary_max, description, requirements, posted_date, deadline, created_at, updated_at)
            VALUES (uuid_generate_v4(), :tid, :title, :dept, :loc, :type, 'open', :priority,
              :salMin, :salMax, :desc, :reqs, CURRENT_DATE, :deadline, NOW(), NOW())
            RETURNING *
          `, {
            tid: tenantId, title: body.title, dept: body.department, loc: body.location,
            type: body.type || 'full_time', priority: body.priority || 'medium',
            salMin: body.salary_min || 0, salMax: body.salary_max || 0,
            desc: body.description || '', reqs: body.requirements || '',
            deadline: body.deadline || null
          });
          if (rows && rows[0]) return res.status(201).json({ success: true, data: rows[0] });
        }
        const opening = { id: `JO-${Date.now()}`, ...body, status: body.status || 'open', applicants: 0, created_at: new Date().toISOString() };
        jobOpenings.push(opening);
        return res.status(201).json({ success: true, data: opening });
      }
      if (action === 'create-candidate') {
        if (dbAvailable) {
          const rows = await tryDbQuery(`
            INSERT INTO hris_candidates (id, tenant_id, job_opening_id, full_name, email, phone,
              current_stage, status, source, rating, experience_summary, education_level, applied_date, notes, created_at, updated_at)
            VALUES (uuid_generate_v4(), :tid, :jid, :name, :email, :phone,
              :stage, 'active', :source, :rating, :exp, :edu, CURRENT_DATE, :notes, NOW(), NOW())
            RETURNING *
          `, {
            tid: tenantId, jid: body.job_id || null, name: body.name, email: body.email,
            phone: body.phone || '', stage: body.stage || 'applied', source: body.source || 'Other',
            rating: body.rating || 0, exp: body.experience || '', edu: body.education || '',
            notes: body.notes || ''
          });
          if (rows && rows[0]) return res.status(201).json({ success: true, data: rows[0] });
        }
        const candidate = { id: `CA-${Date.now()}`, ...body, stage: body.stage || 'applied', status: 'active', created_at: new Date().toISOString() };
        candidates.push(candidate);
        return res.status(201).json({ success: true, data: candidate });
      }
      return res.status(400).json({ error: 'Unknown POST action' });
    }

    // ── PUT ──
    if (method === 'PUT') {
      const body = req.body;
      if (action === 'update-opening') {
        if (!body.id) return res.status(400).json({ error: 'id is required' });
        if (dbAvailable) {
          const rows = await tryDbQuery(`
            UPDATE hris_job_openings SET title = COALESCE(:title, title), department = COALESCE(:dept, department),
              status = COALESCE(:status, status), priority = COALESCE(:priority, priority),
              salary_min = COALESCE(:salMin, salary_min), salary_max = COALESCE(:salMax, salary_max),
              description = COALESCE(:desc, description), updated_at = NOW()
            WHERE id = :id RETURNING *
          `, { id: body.id, title: body.title || null, dept: body.department || null, status: body.status || null, priority: body.priority || null, salMin: body.salary_min || null, salMax: body.salary_max || null, desc: body.description || null });
          if (rows && rows[0]) return res.json({ success: true, data: rows[0] });
        }
        const idx = jobOpenings.findIndex(o => o.id === body.id);
        if (idx === -1) return res.status(404).json({ error: 'Opening not found' });
        jobOpenings[idx] = { ...jobOpenings[idx], ...body, updated_at: new Date().toISOString() };
        return res.json({ success: true, data: jobOpenings[idx] });
      }
      if (action === 'update-candidate') {
        if (!body.id) return res.status(400).json({ error: 'id is required' });
        if (dbAvailable) {
          const rows = await tryDbQuery(`
            UPDATE hris_candidates SET current_stage = COALESCE(:stage, current_stage),
              status = COALESCE(:status, status), rating = COALESCE(:rating, rating),
              notes = COALESCE(:notes, notes), updated_at = NOW()
            WHERE id = :id RETURNING *
          `, { id: body.id, stage: body.stage || null, status: body.status || null, rating: body.rating || null, notes: body.notes || null });
          if (rows && rows[0]) return res.json({ success: true, data: rows[0] });
        }
        const idx = candidates.findIndex(c => c.id === body.id);
        if (idx === -1) return res.status(404).json({ error: 'Candidate not found' });
        candidates[idx] = { ...candidates[idx], ...body, updated_at: new Date().toISOString() };
        return res.json({ success: true, data: candidates[idx] });
      }
      return res.status(400).json({ error: 'Unknown PUT action' });
    }

    // ── DELETE ──
    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      if (action === 'delete-opening') {
        if (dbAvailable) await tryDbQuery('DELETE FROM hris_job_openings WHERE id = :id', { id });
        jobOpenings = jobOpenings.filter(o => o.id !== id);
        return res.json({ success: true, message: 'Lowongan berhasil dihapus' });
      }
      if (action === 'delete-candidate') {
        if (dbAvailable) await tryDbQuery('DELETE FROM hris_candidates WHERE id = :id', { id });
        candidates = candidates.filter(c => c.id !== id);
        return res.json({ success: true, message: 'Kandidat berhasil dihapus' });
      }
      return res.status(400).json({ error: 'Unknown DELETE action' });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error: any) {
    console.error('[recruitment API]', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
