/** Payload API & UI: tim / jadwal / login opanel (multi-cabang). */

export type OpanelWorkforceScheduleRow = {
  scheduleId: string;
  employeeId: string;
  employeeName: string;
  position?: string;
  department?: string;
  employeeStatus?: string;
  shiftType: string;
  startTime: string;
  endTime: string;
  scheduleStatus: string;
  branchId: string | null;
  branchName: string;
  branchCode?: string;
  onDutyNow: boolean;
};

export type OpanelWorkforceLoginRow = {
  userId: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string | null;
  lastLoginLabel: string | null;
  minutesSinceLogin: number | null;
  likelyActiveOnline: boolean;
  branchId: string | null;
  branchName: string;
  branchCode?: string;
};

export type OpanelWorkforceByBranchRow = {
  branchId: string | null;
  branchName: string;
  branchCode?: string;
  scheduledToday: number;
  onDutyNow: number;
};

export type OpanelWorkforceInsight = {
  timezone: string;
  dateLocal: string;
  schedulesToday: OpanelWorkforceScheduleRow[];
  onDutyNow: OpanelWorkforceScheduleRow[];
  byBranch: OpanelWorkforceByBranchRow[];
  recentLogins: OpanelWorkforceLoginRow[];
  onlineThresholdMinutes: number;
  note: string;
};
