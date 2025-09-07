export enum ThemeMode {
  Light = "light",
  Dark = "dark",
}

export enum StorageEnum {
  Settings = "settings",
  User = "user",
  Language = "language",
}

export enum UserRole {
  USER = "USER",
  SUPERVISOR = "SUPERVISOR", 
  ADMIN = "ADMIN",
  SUPER_ADMIN = "SUPER_ADMIN",
  DEVELOPER = "DEVELOPER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE", 
  PENDING = "PENDING",
}

export enum ReportStatus {
  PENDING = "pending",
  RESPONDED = "responded",
  ARCHIVED = "archived",
}

export enum GoalStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  ON_HOLD = "on_hold",
  AWAITING = "awaiting",
  DONE = "done",
  COMPLETED = "completed",
}

export enum GoalPriority {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export enum NotificationType {
  REPORT_SUBMITTED = "report_submitted",
  GOAL_UPDATED = "goal_updated",
  USER_REQUEST = "user_request",
  SYSTEM_ALERT = "system_alert",
  NEW_FILE = "new_file",
  RESPONSE_RECEIVED = "response_received",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  departmentId?: string;
  department?: {
    id: string;
    name: string;
    description?: string;
    canSeeTemperatureMenu?: boolean;
  };
  avatar?: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  lastLogin?: string;
  isDepartmentAdmin?: boolean; // New field for department admin role
  managedDepartments?: string[]; // Departments this user can manage
  sucursal?: {
    id: string;
    name: string;
    serverUrl?: string;
  };
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  adminId?: string; // User ID of department admin
  adminUser?: User; // Department admin user
  canSeeTemperatureMenu?: boolean;
  createdBy: User;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  memberCount: number;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  type: string;
  status: ReportStatus;
  submittedBy: User;
  submittedTo?: User;
  submittedAt: Date;
  respondedAt?: Date;
  response?: string;
  attachments?: File[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  assignedTo?: User[]; // Array for multiple users assignment
  assignedDepartment?: string; // For department-wide goals
  createdBy: User;
  startDate: Date;
  endDate: Date;
  progress: number; // Calculated percentage
  status: GoalStatus;
  priority: GoalPriority;
  department: string;
  createdAt: Date;
  updatedAt: Date;
  reports: GoalReport[];
  isCompleted: boolean;
  requiresReportOnCompletion: boolean; // New field
  completionReportSubmitted: boolean; // Track if completion report was submitted
}

export interface GoalReport {
  id: string;
  goalId: string;
  title: string;
  description: string;
  submittedBy: User;
  submittedAt: Date;
  version: number;
  attachments: FileItem[];
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  approvedBy?: User;
  approvedAt?: Date;
  isCompletionReport: boolean; // Mark reports that were submitted upon goal completion
  reportType: 'progress' | 'completion' | 'update'; // Different types of reports
}

export interface Sucursal {
  id: string;
  name: string;
  serverUrl: string;
  description: string;
  createdBy: User;
  createdAt: Date;
  isActive: boolean;
  lastPing?: Date;
  diagnostics: SucursalDiagnostics;
}

export interface SucursalDiagnostics {
  isOnline: boolean;
  responseTime?: number;
  lastCheck: Date;
  logs: SucursalLog[];
  uptime: number; // in percentage
  errorCount: number;
}

export interface SucursalLog {
  id: string;
  timestamp: Date;
  level: 'info' | 'warning' | 'error';
  message: string;
  details?: any;
}

export interface Library {
  id: string;
  name: string;
  description?: string;
  createdBy: User;
  createdAt: Date;
  permissions: LibraryPermission[];
  fileCount: number;
  memberSelection?: LibraryMemberSelection;
}

export interface LibraryMemberSelection {
  includeCreator: boolean;
  selectedUsers: string[];  // User IDs
  selectedDepartments: string[];  // Department names
}

export interface LibraryPermission {
  id: string;
  type: 'user' | 'department';
  targetId: string;  // User ID or Department name
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  description?: string;
  size: number;
  type: string;
  url: string;
  libraryId: string;
  uploadedBy: User;
  uploadedAt: Date;
  parentFolderId?: string; // For nested folder structure
  path: string; // Full path for navigation
  isFolder: boolean;
  children?: FileItem[]; // For folder contents
  permissions?: FilePermission[];
}

export interface FilePermission {
  id: string;
  userId: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canShare: boolean;
}

export interface FolderItem {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  libraryId: string;
  createdBy: User;
  createdAt: Date;
  path: string;
  children: (FolderItem | FileItem)[];
  permissions?: FolderPermission[];
}

export interface FolderPermission {
  id: string;
  userId: string;
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
  canCreateFiles: boolean;
  canCreateFolders: boolean;
}

export interface FileManagerState {
  currentPath: string;
  selectedItems: string[];
  clipboard: {
    items: (FileItem | FolderItem)[];
    operation: 'cut' | 'copy' | null;
  };
  viewMode: 'list' | 'grid' | 'tree';
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortOrder: 'asc' | 'desc';
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt: Date;
  relatedId?: string; // ID of related entity (report, goal, etc.)
}

export interface UserRequest {
  id: string;
  name: string;
  email: string;
  department: string;
  requestedRole: UserRole;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  processedAt?: Date;
  processedBy?: User;
}

export interface DashboardStats {
  totalUsers: number;
  storedFiles: number;
  pendingReports: number;
  activeGoals: number;
  newUsers: number;
  recentActivity: Activity[];
}

export interface Activity {
  id: string;
  type: 'report' | 'goal' | 'file' | 'user';
  description: string;
  user: User;
  timestamp: Date;
}
