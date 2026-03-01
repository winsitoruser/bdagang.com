/**
 * HRIS Training & Certification API
 * 
 * Handles CRUD operations for training programs, schedules, and certifications.
 * Uses database when available, falls back to in-memory store with mock seed data.
 * 
 * GET    ?action=programs           - List all training programs
 * GET    ?action=certifications     - List all employee certifications
 * GET    ?action=schedule           - Get upcoming training schedule
 * GET    ?action=analytics          - Get training analytics
 * POST   ?action=create-program     - Create a new training program
 * POST   ?action=create-cert        - Add a certification record
 * POST   ?action=enroll             - Enroll employee in a program
 * PUT    ?action=update-program     - Update a training program
 * PUT    ?action=update-cert        - Update a certification record
 * DELETE ?action=delete-program     - Delete a training program
 * DELETE ?action=delete-cert        - Delete a certification record
 */
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]';

let sequelize: any;
try { sequelize = require('../../../../lib/sequelize'); } catch (e) {}

// In-memory store with mock seed data
let programs: any[] = [
  { id: 'TP-1', title: 'Customer Service Excellence', category: 'soft_skill', type: 'workshop', trainer: 'PT Training Indonesia', location: 'Jakarta', status: 'active', start_date: '2026-03-12', end_date: '2026-03-13', max_participants: 30, enrolled: 18, completed: 0, cost_per_person: 500000, rating: 4.5, description: 'Pelatihan pelayanan pelanggan untuk semua staff', created_at: '2026-02-01T00:00:00Z' },
  { id: 'TP-2', title: 'Leadership & Management', category: 'leadership', type: 'training', trainer: 'Trainer Profesional Group', location: 'Bandung', status: 'upcoming', start_date: '2026-03-20', end_date: '2026-03-22', max_participants: 20, enrolled: 12, completed: 0, cost_per_person: 1500000, rating: 0, description: 'Program kepemimpinan untuk level supervisor ke atas', created_at: '2026-02-10T00:00:00Z' },
  { id: 'TP-3', title: 'POS System Advanced', category: 'technical', type: 'training', trainer: 'Internal IT', location: 'Online', status: 'active', start_date: '2026-03-05', end_date: '2026-03-05', max_participants: 50, enrolled: 35, completed: 20, cost_per_person: 0, rating: 4.2, description: 'Pelatihan fitur lanjutan sistem POS', created_at: '2026-02-15T00:00:00Z' },
  { id: 'TP-4', title: 'Food Safety & Hygiene', category: 'compliance', type: 'certification', trainer: 'BPOM Training Center', location: 'Jakarta', status: 'completed', start_date: '2026-02-01', end_date: '2026-02-02', max_participants: 25, enrolled: 25, completed: 24, cost_per_person: 750000, rating: 4.8, description: 'Sertifikasi keamanan pangan wajib untuk staf F&B', created_at: '2026-01-15T00:00:00Z' },
  { id: 'TP-5', title: 'Excel & Data Analytics', category: 'technical', type: 'workshop', trainer: 'Digital Academy', location: 'Online', status: 'upcoming', start_date: '2026-04-01', end_date: '2026-04-03', max_participants: 40, enrolled: 8, completed: 0, cost_per_person: 350000, rating: 0, description: 'Analisis data menggunakan Excel dan tools analytics', created_at: '2026-02-20T00:00:00Z' },
];
let certifications: any[] = [
  { id: 'CE-1', employee_id: 'EMP001', employee_name: 'Ahmad Wijaya', cert_name: 'Food Safety Level 2', issuer: 'BPOM', issued_date: '2026-02-02', expiry_date: '2028-02-02', status: 'active', cert_number: 'FS-2026-001', created_at: '2026-02-02T00:00:00Z' },
  { id: 'CE-2', employee_id: 'EMP003', employee_name: 'Budi Santoso', cert_name: 'Fire Safety Certified', issuer: 'Dinas PMK', issued_date: '2025-06-15', expiry_date: '2026-06-15', status: 'active', cert_number: 'PMK-2025-123', created_at: '2025-06-15T00:00:00Z' },
  { id: 'CE-3', employee_id: 'EMP005', employee_name: 'Eko Prasetyo', cert_name: 'POS Advanced Operator', issuer: 'Bedagang Academy', issued_date: '2026-03-05', expiry_date: '2028-03-05', status: 'active', cert_number: 'POS-ADV-056', created_at: '2026-03-05T00:00:00Z' },
  { id: 'CE-4', employee_id: 'EMP002', employee_name: 'Siti Rahayu', cert_name: 'First Aid CPR', issuer: 'PMI', issued_date: '2025-01-10', expiry_date: '2026-01-10', status: 'expired', cert_number: 'PMI-FA-789', created_at: '2025-01-10T00:00:00Z' },
  { id: 'CE-5', employee_id: 'EMP004', employee_name: 'Dewi Lestari', cert_name: 'Customer Service Professional', issuer: 'BNSP', issued_date: '2025-09-20', expiry_date: '2026-03-20', status: 'expiring_soon', cert_number: 'BNSP-CS-456', created_at: '2025-09-20T00:00:00Z' },
];
let enrollments: any[] = [
  { id: 'EN-1', program_id: 'TP-1', employee_id: 'EMP001', employee_name: 'Ahmad Wijaya', enrolled_at: '2026-02-05', completed: false },
  { id: 'EN-2', program_id: 'TP-1', employee_id: 'EMP005', employee_name: 'Eko Prasetyo', enrolled_at: '2026-02-06', completed: false },
  { id: 'EN-3', program_id: 'TP-3', employee_id: 'EMP002', employee_name: 'Siti Rahayu', enrolled_at: '2026-02-18', completed: true },
  { id: 'EN-4', program_id: 'TP-2', employee_id: 'EMP003', employee_name: 'Budi Santoso', enrolled_at: '2026-02-12', completed: false },
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
      const check = await tryDbQuery("SELECT to_regclass('public.hris_training_programs') as t");
      if (check && check[0]?.t) dbAvailable = true;
    }

    // ── GET ──
    if (method === 'GET') {
      if (action === 'programs') {
        const { category, status } = req.query;
        if (dbAvailable) {
          let q = 'SELECT * FROM hris_training_programs WHERE (tenant_id = :tid OR tenant_id IS NULL)';
          const repl: any = { tid: tenantId };
          if (category && category !== 'all') { q += ' AND category = :cat'; repl.cat = category; }
          if (status && status !== 'all') { q += ' AND status = :st'; repl.st = status; }
          q += ' ORDER BY start_date DESC';
          const rows = await tryDbQuery(q, repl);
          if (rows && rows.length > 0) return res.json({ success: true, data: rows, total: rows.length });
        }
        let filtered = [...programs];
        if (category && category !== 'all') filtered = filtered.filter(p => p.category === category);
        if (status && status !== 'all') filtered = filtered.filter(p => p.status === status);
        return res.json({ success: true, data: filtered, total: filtered.length });
      }
      if (action === 'certifications') {
        const { employee_id, status } = req.query;
        if (dbAvailable) {
          let q = 'SELECT c.*, e.name as employee_name FROM hris_certifications c LEFT JOIN employees e ON c.employee_id = e.id WHERE (c.tenant_id = :tid OR c.tenant_id IS NULL)';
          const repl: any = { tid: tenantId };
          if (employee_id) { q += ' AND c.employee_id = :eid'; repl.eid = employee_id; }
          if (status && status !== 'all') { q += ' AND c.status = :st'; repl.st = status; }
          q += ' ORDER BY c.expiry_date ASC';
          const rows = await tryDbQuery(q, repl);
          if (rows && rows.length > 0) return res.json({ success: true, data: rows, total: rows.length });
        }
        let filtered = [...certifications];
        if (employee_id) filtered = filtered.filter(c => c.employee_id === employee_id);
        if (status && status !== 'all') filtered = filtered.filter(c => c.status === status);
        return res.json({ success: true, data: filtered, total: filtered.length });
      }
      if (action === 'schedule') {
        if (dbAvailable) {
          const rows = await tryDbQuery("SELECT * FROM hris_training_programs WHERE status IN ('active', 'upcoming') AND (tenant_id = :tid OR tenant_id IS NULL) ORDER BY start_date ASC", { tid: tenantId });
          if (rows && rows.length > 0) return res.json({ success: true, data: rows });
        }
        const upcoming = programs
          .filter(p => p.status === 'active' || p.status === 'upcoming')
          .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
        return res.json({ success: true, data: upcoming });
      }
      if (action === 'enrollments') {
        const { program_id } = req.query;
        if (dbAvailable) {
          let q = 'SELECT te.*, e.name as employee_name, tp.title as program_title FROM hris_training_enrollments te LEFT JOIN employees e ON te.employee_id = e.id LEFT JOIN hris_training_programs tp ON te.training_program_id = tp.id WHERE (te.tenant_id = :tid OR te.tenant_id IS NULL)';
          const repl: any = { tid: tenantId };
          if (program_id) { q += ' AND te.training_program_id = :pid'; repl.pid = program_id; }
          q += ' ORDER BY te.enrolled_at DESC';
          const rows = await tryDbQuery(q, repl);
          if (rows && rows.length > 0) return res.json({ success: true, data: rows, total: rows.length });
        }
        let filtered = [...enrollments];
        if (program_id) filtered = filtered.filter(e => e.program_id === program_id);
        return res.json({ success: true, data: filtered, total: filtered.length });
      }
      if (action === 'analytics') {
        const srcPgm = dbAvailable
          ? (await tryDbQuery('SELECT * FROM hris_training_programs WHERE tenant_id = :tid OR tenant_id IS NULL', { tid: tenantId })) || programs
          : programs;
        const srcCert = dbAvailable
          ? (await tryDbQuery('SELECT * FROM hris_certifications WHERE tenant_id = :tid OR tenant_id IS NULL', { tid: tenantId })) || certifications
          : certifications;
        const srcEnroll = dbAvailable
          ? (await tryDbQuery('SELECT * FROM hris_training_enrollments WHERE tenant_id = :tid OR tenant_id IS NULL', { tid: tenantId })) || enrollments
          : enrollments;
        const totalPrograms = srcPgm.length;
        const activePrograms = srcPgm.filter((p: any) => p.status === 'active').length;
        const totalEnrolled = srcEnroll.length;
        const totalCompleted = srcEnroll.filter((e: any) => e.completed || e.status === 'completed').length;
        const activeCerts = srcCert.filter((c: any) => c.status === 'active').length;
        const expiringCerts = srcCert.filter((c: any) => c.status === 'expiring_soon').length;
        const expiredCerts = srcCert.filter((c: any) => c.status === 'expired').length;
        const totalBudget = srcPgm.reduce((s: number, p: any) => s + ((p.cost_per_person || 0) * (p.enrolled || 0)), 0);
        return res.json({
          success: true,
          data: {
            totalPrograms, activePrograms, totalEnrolled, totalCompleted,
            completionRate: totalEnrolled > 0 ? Math.round(totalCompleted / totalEnrolled * 100) : 0,
            activeCerts, expiringCerts, expiredCerts, totalBudget
          }
        });
      }
      return res.json({ success: true, data: { programs: programs.length, certifications: certifications.length, enrollments: enrollments.length } });
    }

    // ── POST ──
    if (method === 'POST') {
      const body = req.body;
      if (action === 'create-program') {
        if (!body.title) return res.status(400).json({ error: 'title is required' });
        if (dbAvailable) {
          const rows = await tryDbQuery(`
            INSERT INTO hris_training_programs (id, tenant_id, title, category, training_type, trainer_name,
              location, status, start_date, end_date, max_participants, cost_per_person, description, created_at, updated_at)
            VALUES (uuid_generate_v4(), :tid, :title, :cat, :type, :trainer, :loc, :status,
              :startDate, :endDate, :maxPart, :cost, :desc, NOW(), NOW())
            RETURNING *
          `, {
            tid: tenantId, title: body.title, cat: body.category || 'technical',
            type: body.type || 'training', trainer: body.trainer || '', loc: body.location || '',
            status: body.status || 'upcoming', startDate: body.start_date || null,
            endDate: body.end_date || null, maxPart: body.max_participants || 30,
            cost: body.cost_per_person || 0, desc: body.description || ''
          });
          if (rows && rows[0]) return res.status(201).json({ success: true, data: rows[0] });
        }
        const program = { id: `TP-${Date.now()}`, ...body, enrolled: 0, completed: 0, created_at: new Date().toISOString() };
        programs.push(program);
        return res.status(201).json({ success: true, data: program });
      }
      if (action === 'create-cert') {
        if (!body.employee_id || !body.cert_name) return res.status(400).json({ error: 'employee_id and cert_name are required' });
        if (dbAvailable) {
          const rows = await tryDbQuery(`
            INSERT INTO hris_certifications (id, tenant_id, employee_id, certification_name, issuing_organization,
              issued_date, expiry_date, status, credential_id, created_at, updated_at)
            VALUES (uuid_generate_v4(), :tid, :eid, :name, :issuer, :issuedDate, :expiryDate, :status, :credId, NOW(), NOW())
            RETURNING *
          `, {
            tid: tenantId, eid: body.employee_id, name: body.cert_name,
            issuer: body.issuer || '', issuedDate: body.issued_date || null,
            expiryDate: body.expiry_date || null, status: body.status || 'active',
            credId: body.cert_number || null
          });
          if (rows && rows[0]) return res.status(201).json({ success: true, data: rows[0] });
        }
        const cert = { id: `CE-${Date.now()}`, ...body, created_at: new Date().toISOString() };
        certifications.push(cert);
        return res.status(201).json({ success: true, data: cert });
      }
      if (action === 'enroll') {
        const { program_id, employee_id, employee_name } = body;
        if (!program_id || !employee_id) return res.status(400).json({ error: 'program_id and employee_id are required' });
        if (dbAvailable) {
          const rows = await tryDbQuery(`
            INSERT INTO hris_training_enrollments (id, tenant_id, training_program_id, employee_id, status, enrolled_at, created_at, updated_at)
            VALUES (uuid_generate_v4(), :tid, :pid, :eid, 'enrolled', NOW(), NOW(), NOW())
            RETURNING *
          `, { tid: tenantId, pid: program_id, eid: employee_id });
          if (rows && rows[0]) {
            await tryDbQuery('UPDATE hris_training_programs SET current_participants = COALESCE(current_participants, 0) + 1 WHERE id = :pid', { pid: program_id });
            return res.status(201).json({ success: true, data: rows[0] });
          }
        }
        const pgm = programs.find(p => p.id === program_id);
        if (!pgm) return res.status(404).json({ error: 'Program not found' });
        if (pgm.max_participants && pgm.enrolled >= pgm.max_participants) return res.status(400).json({ error: 'Program sudah penuh' });
        const enrollment = { id: `EN-${Date.now()}`, program_id, employee_id, employee_name: employee_name || '', enrolled_at: new Date().toISOString(), completed: false };
        enrollments.push(enrollment);
        pgm.enrolled = (pgm.enrolled || 0) + 1;
        return res.status(201).json({ success: true, data: enrollment });
      }
      return res.status(400).json({ error: 'Unknown POST action' });
    }

    // ── PUT ──
    if (method === 'PUT') {
      const body = req.body;
      if (action === 'update-program') {
        if (!body.id) return res.status(400).json({ error: 'id is required' });
        if (dbAvailable) {
          const rows = await tryDbQuery(`
            UPDATE hris_training_programs SET title = COALESCE(:title, title), category = COALESCE(:cat, category),
              status = COALESCE(:status, status), trainer_name = COALESCE(:trainer, trainer_name),
              location = COALESCE(:loc, location), description = COALESCE(:desc, description), updated_at = NOW()
            WHERE id = :id RETURNING *
          `, { id: body.id, title: body.title || null, cat: body.category || null, status: body.status || null, trainer: body.trainer || null, loc: body.location || null, desc: body.description || null });
          if (rows && rows[0]) return res.json({ success: true, data: rows[0] });
        }
        const idx = programs.findIndex(p => p.id === body.id);
        if (idx === -1) return res.status(404).json({ error: 'Program not found' });
        programs[idx] = { ...programs[idx], ...body, updated_at: new Date().toISOString() };
        return res.json({ success: true, data: programs[idx] });
      }
      if (action === 'update-cert') {
        if (!body.id) return res.status(400).json({ error: 'id is required' });
        if (dbAvailable) {
          const rows = await tryDbQuery(`
            UPDATE hris_certifications SET status = COALESCE(:status, status),
              expiry_date = COALESCE(:expiryDate, expiry_date), updated_at = NOW()
            WHERE id = :id RETURNING *
          `, { id: body.id, status: body.status || null, expiryDate: body.expiry_date || null });
          if (rows && rows[0]) return res.json({ success: true, data: rows[0] });
        }
        const idx = certifications.findIndex(c => c.id === body.id);
        if (idx === -1) return res.status(404).json({ error: 'Certification not found' });
        certifications[idx] = { ...certifications[idx], ...body, updated_at: new Date().toISOString() };
        return res.json({ success: true, data: certifications[idx] });
      }
      if (action === 'update-enrollment') {
        if (!body.id) return res.status(400).json({ error: 'id is required' });
        if (dbAvailable) {
          const rows = await tryDbQuery(`
            UPDATE hris_training_enrollments SET status = COALESCE(:status, status),
              completion_date = COALESCE(:completionDate, completion_date), score = COALESCE(:score, score), updated_at = NOW()
            WHERE id = :id RETURNING *
          `, { id: body.id, status: body.status || null, completionDate: body.completion_date || null, score: body.score || null });
          if (rows && rows[0]) return res.json({ success: true, data: rows[0] });
        }
        const idx = enrollments.findIndex(e => e.id === body.id);
        if (idx === -1) return res.status(404).json({ error: 'Enrollment not found' });
        enrollments[idx] = { ...enrollments[idx], ...body, updated_at: new Date().toISOString() };
        return res.json({ success: true, data: enrollments[idx] });
      }
      return res.status(400).json({ error: 'Unknown PUT action' });
    }

    // ── DELETE ──
    if (method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'id is required' });
      if (action === 'delete-program') {
        if (dbAvailable) {
          await tryDbQuery('DELETE FROM hris_training_enrollments WHERE training_program_id = :id', { id });
          await tryDbQuery('DELETE FROM hris_training_programs WHERE id = :id', { id });
        }
        programs = programs.filter(p => p.id !== id);
        enrollments = enrollments.filter(e => e.program_id !== id);
        return res.json({ success: true, message: 'Program pelatihan berhasil dihapus' });
      }
      if (action === 'delete-cert') {
        if (dbAvailable) await tryDbQuery('DELETE FROM hris_certifications WHERE id = :id', { id });
        certifications = certifications.filter(c => c.id !== id);
        return res.json({ success: true, message: 'Sertifikasi berhasil dihapus' });
      }
      return res.status(400).json({ error: 'Unknown DELETE action' });
    }

    return res.status(405).json({ error: `Method ${method} not allowed` });
  } catch (error: any) {
    console.error('[training API]', error);
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
