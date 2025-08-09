import { Goal, GoalStatus, GoalReport } from '@/types';

/**
 * Utility functions for goal management and completion requirements
 */

export interface GoalCompletionValidation {
  canComplete: boolean;
  requiresReport: boolean;
  hasCompletionReport: boolean;
  message?: string;
}

/**
 * Validates if a goal can be marked as complete based on its requirements
 */
export function validateGoalCompletion(goal: Goal): GoalCompletionValidation {
  const result: GoalCompletionValidation = {
    canComplete: true,
    requiresReport: goal.requiresReportOnCompletion || false,
    hasCompletionReport: goal.completionReportSubmitted || false,
  };

  // Check if goal requires a completion report
  if (result.requiresReport && !result.hasCompletionReport) {
    result.canComplete = false;
    result.message = 'A completion report must be submitted before this goal can be marked as complete.';
  }

  // Check if goal is already completed
  if (goal.isCompleted || goal.status === GoalStatus.COMPLETED) {
    result.canComplete = false;
    result.message = 'This goal is already marked as complete.';
  }

  return result;
}

/**
 * Checks if a goal needs a completion report when progress reaches 100%
 */
export function shouldShowCompletionModal(goal: Goal, newProgress: number): boolean {
  const isBeingCompleted = newProgress === 100 && !goal.isCompleted;
  const requiresReport = goal.requiresReportOnCompletion || false;
  const hasReport = goal.completionReportSubmitted || false;
  
  return isBeingCompleted && requiresReport && !hasReport;
}

/**
 * Gets the completion status text for display
 */
export function getCompletionStatusText(goal: Goal): string {
  if (goal.isCompleted) {
    return 'Completed';
  }
  
  if (goal.progress === 100) {
    if (goal.requiresReportOnCompletion && !goal.completionReportSubmitted) {
      return 'Pending Report';
    }
    return 'Ready to Complete';
  }
  
  return `${goal.progress}% Complete`;
}

/**
 * Gets the completion status color for display
 */
export function getCompletionStatusColor(goal: Goal): string {
  if (goal.isCompleted) {
    return 'success';
  }
  
  if (goal.progress === 100) {
    if (goal.requiresReportOnCompletion && !goal.completionReportSubmitted) {
      return 'warning';
    }
    return 'success';
  }
  
  if (goal.progress >= 75) {
    return 'processing';
  }
  
  if (goal.progress >= 50) {
    return 'normal';
  }
  
  return 'exception';
}

/**
 * Filters reports to get only completion reports
 */
export function getCompletionReports(goal: Goal): GoalReport[] {
  return (goal.reports || []).filter(report => report.isCompletionReport);
}

/**
 * Gets the latest completion report for a goal
 */
export function getLatestCompletionReport(goal: Goal): GoalReport | null {
  const completionReports = getCompletionReports(goal);
  if (completionReports.length === 0) {
    return null;
  }
  
  return completionReports.reduce((latest, current) => 
    current.submittedAt > latest.submittedAt ? current : latest
  );
}

/**
 * Calculates completion statistics for a list of goals
 */
export function calculateCompletionStats(goals: Goal[]) {
  const total = goals.length;
  const completed = goals.filter(g => g.isCompleted).length;
  const pendingReports = goals.filter(g => 
    g.progress === 100 && 
    g.requiresReportOnCompletion && 
    !g.completionReportSubmitted
  ).length;
  
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  return {
    total,
    completed,
    pendingReports,
    completionRate,
    inProgress: total - completed - pendingReports,
  };
}

/**
 * Generates warning messages for goals that need attention
 */
export function getGoalWarnings(goal: Goal): string[] {
  const warnings: string[] = [];
  
  // Check for completion report requirement
  if (goal.progress === 100 && goal.requiresReportOnCompletion && !goal.completionReportSubmitted) {
    warnings.push('Completion report required to finish this goal');
  }
  
  // Check for overdue goals
  if (goal.endDate < new Date() && !goal.isCompleted) {
    warnings.push('This goal is overdue');
  }
  
  // Check for goals with no recent reports
  const lastReport = goal.reports && goal.reports.length > 0 
    ? goal.reports[goal.reports.length - 1] 
    : null;
  
  if (lastReport) {
    const daysSinceLastReport = Math.floor(
      (new Date().getTime() - lastReport.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysSinceLastReport > 14 && goal.progress < 100) {
      warnings.push('No recent progress reports');
    }
  }
  
  return warnings;
}
