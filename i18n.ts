export const locales = ['en', 'pt'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'pt';

export interface Dictionary {
  navigation: {
    dashboard: string;
    homepage: string;
    reports: string;
    submitReports: string;
    viewReports: string;
    goals: string;
    viewGoals: string;
    createGoals: string;
    editGoals: string;
    scanner: string;
    scan: string;

    fileManagement: string;
    libraries: string;
    documents: string;
    management: string;
    users: string;
    departments: string;
    sucursals: string;
    generalPanel: string;
    notifications: string;
    requests: string;
    profile: string;
  };
  common: {
    login: string;
    logout: string;
    save: string;
    cancel: string;
    "delete": string;
    edit: string;
    view: string;
    create: string;
    upload: string;
    download: string;
    search: string;
    filter: string;
    approve: string;
    reject: string;
    pending: string;
    completed: string;
    active: string;
    inactive: string;
    loading: string;
    error: string;
    success: string;
    submit: string;
    close: string;
    open: string;
    yes: string;
    no: string;
    reload: string;
    refresh: string;
    platformName: string;
    approved: string;
    rejected: string;
    response: string;
    all: string;
    status: string;
    required: string;
    accessDenied: string;
    startDate: string;
    endDate: string;
    department: string;
    logoutSuccess: string;
    logoutError: string;
  };
  users: {
    status: {
      active: string;
      inactive: string;
      pending: string;
    };
    role: {
      super_admin: string;
      admin: string;
      user: string;
      supervisor: string;
    };
    department: string;
    createdAt: string;
    actions: string;
    userDetails: string;
    selectStatus: string;
    passwordReset: string;
    email: string;
    temporaryPassword: string;
    emailSent: string;
    superAdmins: string;
    admins: string;
    normalUsers: string;
    supervisors: string;
    editUser: string;
    viewFiles: string;
    promoteToSuperAdmin: string;
    resetPassword: string;
    removeUserConfirm: string;
    removeUserWarning: string;
    removeUser: string;
    user: string;
    phone: string;
    userManagement: string;
    manageUsers: string;
    exportUsers: string;
    createUser: string;
    totalUsers: string;
    usersList: string;
    searchByName: string;
    filterByStatus: string;
    filterByDepartment: string;
    enterUserName: string;
    enterEmailAddress: string;
    selectRole: string;
    selectDepartment: string;
    promoteToSupervisor: string;
    departmentAdminDescription: string;
    enterPhoneNumber: string;
    files: string;
    viewingFilesFor: string;
    fileManagerDescription: string;
  };
  auth: {
    welcomeBack: string;
    enterCredentials: string;
    email: string;
    password: string;
    rememberMe: string;
    forgotPassword: string;
    dontHaveAccount: string;
    signUp: string;
    createAccount: string;
    confirmPassword: string;
    fullName: string;
    department: string;
    selectDepartment: string;
    userType: string;
    requestAccess: string;
    accountRequested: string;
    waitingApproval: string;
    invalidCredentials: string;
    loginFailed: string;
    checkFormFields: string;
    passwordTooShort: string;
    passwordsDoNotMatch: string;
    registrationFailed: string;
    emailRequired: string;
    invalidEmailFormat: string;
    passwordRequired: string;
    confirmPasswordRequired: string;
    departmentRequired: string;
  };
  dashboard: {
    welcomeTo: string;
    totalUsers: string;
    storedFiles: string;
    recentActivity: string;
    pendingReports: string;
    activeGoals: string;
    newUsers: string;
    quickActions: string;
    addFiles: string;
    createLibrary: string;
    scanDocument: string;
    submitReport: string;
    companyOverview: string;
    newUsersThisMonth: string;
    storageUsage: string;
    reportsResponseRate: string;
    libraries: string;
    documents: string;
  };
  departments: {
    title: string;
    name: string;
    description: string;
    supervisor: string;
    usersCount: string;
    createdAt: string;
    actions: string;
    create: string;
    edit: string;
    "delete": string;
    save: string;
    cancel: string;
    addDepartment: string;
    editDepartment: string;
    createDepartment: string;
    departmentName: string;
    departmentDescription: string;
    selectSupervisor: string;
    noSupervisor: string;
    selectDepartmentFirst: string;
    supervisorNote: string;
    confirmDelete: string;
    users: string;
    manageDepartments: string;
    departmentManagement: string;
  };
  users: {
    title: string;
    create: string;
    edit: string;
    "delete": string;
    passwordReset: string;
    temporaryPassword: string;
    emailSent: string;
    promoteToSuperAdmin: string;
    removeUser: string;
    resetPassword: string;
    userFiles: string;
    exportUsers: string;
    totalUsers: string;
    superAdmins: string;
    admins: string;
    supervisors: string;
    normalUsers: string;
    active: string;
    inactive: string;
    pending: string;
    userDetails: string;
    role: string;
    department: string;
    phone: string;
    createdAt: string;
    actions: string;
    usersList: string;
    userManagement: string;
    manageUsers: string;
    selectDepartment: string;
    selectRole: string;
    selectStatus: string;
    setAsDepartmentAdmin: string;
    managedDepartments: string;
    departmentAdminDescription: string;
    userForm: string;
    // Additional user management keys
    editUser: string;
    viewFiles: string;
    promoteToSupervisor: string;
    name: string;
    email: string;
    lastLogin: string;
    user: string;
    createUser: string;
    enterUserName: string;
    enterEmailAddress: string;
    enterPhoneNumber: string;
    selectDepartmentsToManage: string;
    files: string;
    folders: string;
    createFolder: string;
    userTypes: {
      SUPER_ADMIN: string;
      ADMIN: string;
      USER: string;
      SUPERVISOR: string;
      DEVELOPER: string;
    };
  };
  notifications: {
    notifications: string;
    markAsRead: string;
    markAllAsRead: string;
    noNotifications: string;
    noUnreadNotifications: string;
    noReadNotifications: string;
    all: string;
    unread: string;
    read: string;
    stayUpdated: string;
    "delete": string;
    timeAgo: {
      justNow: string;
      minutesAgo: string;
      hoursAgo: string;
      daysAgo: string;
    };
    types: {
      reportSubmitted: string;
      goalUpdated: string;
      userRequest: string;
      systemAlert: string;
      newFile: string;
      responseReceived: string;
    };
  };
    uploadFile: string;
    folderName: string;
    enterFolderName: string;
    fileSize: string;
    lastModified: string;
    noFiles: string;
    noFolders: string;
    rootFolder: string;
    searchByName: string;
    filterByStatus: string;
    filterByDepartment: string;
    removeUserConfirm: string;
    removeUserWarning: string;
  reports: {
    submitReport: string;
    reportType: string;
    title: string;
    description: string;
    attachFiles: string;
    selectSupervisor: string;
    selectSupervisors: string;
    selectSupervisorsPlaceholder: string;
    reportSubmitted: string;
    myReports: string;
    teamReports: string;
    allReports: string;
    reportDetails: string;
    respond: string;
    response: string;
    status: string;
    submittedBy: string;
    submittedAt: string;
    type: string;
    blocked: string;
    onHold: string;
    respondedAt: string;
    viewReports: string;
    submitReportDescription: string;
    selectReportType: string;
    selectSupervisorPlaceholder: string;
    pleaseSelectReportType: string;
    pleaseSelectSupervisor: string;
    reportTitlePlaceholder: string;
    reportDescriptionPlaceholder: string;
    failedToLoadSupervisors: string;
    failedToSubmitReport: string;
    uploadProgress: string;
    pending: string;
    responded: string;
    archived: string;
    allReportsTab: string;
    pendingTab: string;
    respondedTab: string;
    archivedTab: string;
    loadingUserData: string;
    actions: string;
    viewReport: string;
    respondToReport: string;
    submitResponse: string;
    responseModalTitle: string;
    writeResponse: string;
    reportResponseSubmitted: string;
    failedToRespond: string;
    noReportsFound: string;
    clickToUploadFiles: string;
    supportedFormats: string;
    pleaseEnterTitle: string;
    pleaseEnterDescription: string;
    describeReportDetail: string;
    failedToLoadReports: string;
    monthlyProgressReport: string;
    issueReport: string;
    projectUpdate: string;
    expenseReport: string;
    performanceReview: string;
    incidentReport: string;
    other: string;
    predefinedTypes: string;
    customType: string;
    enterCustomType: string;
    pleaseEnterCustomType: string;
    enterReportType: string;
    pleaseEnterReportType: string;
  };
  requests: {
    title: string;
    type: string;
    by: string;
    priority: string;
    viewDetails: string;
    quickApprove: string;
    quickReject: string;
    requestDetails: string;
    requestInformation: string;
    reviewRequests: string;
    allRequests: string;
    myRequests: string;
    userRequests: string;
    pendingRequests: string;
    approvedRequests: string;
    rejectedRequests: string;
    updateRequest: string;
    reviewedAt: string;
    reviewedBy: string;
    userRequestsManagement: string;
    pending: string;
    inReview: string;
    approved: string;
    rejected: string;
    createRequest: string;
    requestType: string;
    requestTitle: string;
    requestDescription: string;
    submitRequest: string;
    requestSubmitted: string;
    approveRequest: string;
    rejectRequest: string;
    requestedBy: string;
    requestedAt: string;
    requestReason: string;
  };
  goals: {
    myGoals: string;
    teamGoals: string;
    allGoals: string;
    viewGoals: string;
    createGoal: string;
    editGoal: string;
    goalName: string;
    goalDescription: string;
    assignTo: string;
    startDate: string;
    endDate: string;
    targetValue: string;
    currentProgress: string;
    progress: string;
    deadline: string;
    assigned: string;
    completed: string;
    title: string;
    subtitle: string;
    createNew: string;
    // New translations for goal creation
    goalTitle: string;
    goalDescriptionText: string;
    goalAssignment: string;
    individualGoal: string;
    departmentGoal: string;
    departmentRequired: string;
    usersRequired: string;
    priority: string;
    timeline: string;
    titleRequired: string;
    titleMinLength: string;
    descriptionRequired: string;
    priorityRequired: string;
    timelineRequired: string;
    assignToUsers: string;
    selectDepartment: string;
    selectUsers: string;
    selectDepartmentForGoal: string;
    departmentGoalInfo: string;
    departmentGoalDescription: string;
    lowPriority: string;
    mediumPriority: string;
    highPriority: string;
    createGoalDescription: string;
    goalDetails: string;
    titlePlaceholder: string;
    descriptionPlaceholder: string;
    goalCreatedSuccessfully: string;
    goalUpdatedSuccessfully: string;
    goalCreationFailed: string;
    goalUpdateFailed: string;
    updateGoal: string;
    editGoalDescription: string;
    failedToLoadGoal: string;
    // Additional translations for goals view page
    trackAndManageGoals: string;
    totalGoals: string;
    activeGoals: string;
    pendingReportsWarning: string;
    searchGoals: string;
    filterByStatus: string;
    filterByPriority: string;
    filterByDepartment: string;
    pending: string;
    active: string;
    overdue: string;
    onHold: string;
    cancelled: string;
    of: string;
    viewDetails: string;
    uploadReport: string;
    updateProgress: string;
    updateStatus: string;
    selectStatus: string;
    uploading: string;
    deleteGoal: string;
    goalDeletedSuccessfully: string;
    failedToDeleteGoal: string;
    failedToLoadGoals: string;
    reportRequired: string;
    usersAssigned: string;
    notAssigned: string;
    daysOverdue: string;
    daysRemaining: string;
    viewReports: string;
    reports: string;
    submittedBy: string;
    viewFile: string;
    download: string;
    reportTitle: string;
    reportDescription: string;
    pleaseSelectFile: string;
    reportUploadedSuccessfully: string;
    failedToUploadReport: string;
    reportTitleRequired: string;
    enterReportTitle: string;
    invalidDates: string;
    reportDescriptionRequired: string;
    enterReportDescription: string;
    uploadFiles: string;
    filesRequired: string;
    selectFiles: string;
    isCompletionReport: string;
    progressUpdatedSuccessfully: string;
    failedToUpdateProgress: string;
    progressRequired: string;
    statusRequired: string;
    // Additional missing keys for goals view page
    goal: string;
    actions: string;
    createdByMe: string;
    lastUpdated: string;
    close: string;
    pendingReports: string;
          // Status and other missing keys
      status: string;
      assignedTo: string;
      createdAt: string;
      createdBy: string;
      // Status values
      statusEmProgresso: string;
      statusPendente: string;
      statusFeito: string;
      statusConcluido: string;
      statusBloqueado: string;
             statusEmEspera: string;
       statusOutro: string;
       blocked: string;
       uploadNewReport: string;
       completionReport: string;
       attachedFiles: string;
       noReportsYet: string;
       // Publish and share functionality
       publishGoal: string;
       publish: string;
       shareGoal: string;
       goalPublished: string;
       failedToPublishGoal: string;
       goalSharedSuccessfully: string;
       failedToShareGoal: string;
       failedToLoadUsers: string;
       shareGoalInfo: string;
       shareGoalDescription: string;
       selectUsersToShare: string;
       selectUsers: string;
       message: string;
       shareMessagePlaceholder: string;
       sharing: string;
       pleaseSelectUsers: string;
       // Additional sharing keys
       sharedWithYou: string;
       sharedBy: string;
       sharedOn: string;
       sharingInfo: string;
       // Cross-sucursal sharing
       shareCompletedGoalWithExternalSucursal: string;
       shareCompletedGoalDescription: string;
  };
  sharing: {
    shareWithLocalUsers: string;
    selectLocalUsers: string;
    selectUsersFromSucursal: string;
    shareWithExternalSucursal: string;
    selectSucursal: string;
    pleaseSelectSucursal: string;
    selectRemoteUsers: string;
    pleaseSelectRemoteUsers: string;
    selectUsersFromSelectedSucursal: string;
    messageOptional: string;
    addMessageAboutSharedContent: string;
    share: string;
    sharing: string;
    pleaseSelectUsersToShareWith: string;
    pleaseSelectRemoteUsersToShareWith: string;
    localFileSharingNotImplemented: string;
    sharedSuccessfully: string;
    failedToShare: string;
    failedToLoadSucursals: string;
    failedToLoadUsersFromSucursal: string;
  };
  documents: {
    // Page title and description
    documentManagementSystem: string;
    organizeAndAccessDocuments: string;
    
    // Tab labels
    allDocuments: string;
    myDocuments: string;
    
    // Tab descriptions
    allDocumentsDescription: string;
    myDocumentsDescription: string;
    
    // Tab titles
    allDocumentsTitle: string;
    myDocumentsTitle: string;
    
    // Company-wide description
    companyWideDocuments: string;
    
    // Private storage description
    privateDocumentStorage: string;
  };
  libraries: {
    libraryManagementSystem: string;
    organizeAndAccessLibraries: string;
    allLibraries: string;
    myLibraries: string;
    companyWideLibraries: string;
    privateLibraryStorage: string;
    createLibrary: string;
    libraryName: string;
    libraryDescription: string;
    libraryMembers: string;
    includeMyself: string;
    selectUsers: string;
    selectDepartments: string;
    noMembers: string;
    permissionDenied: string;
    libraryNotFound: string;
    uploadFile: string;
    createFolder: string;
    deleteFile: string;
    editFile: string;
    downloadFile: string;
    copyFile: string;
    moveFile: string;
    renameFile: string;
    fileProperties: string;
    bulkOperations: string;
    searchFiles: string;
    sortBy: string;
    viewMode: string;
    listView: string;
    gridView: string;
    refresh: string;
    loading: string;
    noFiles: string;
    selectLibrary: string;
    chooseLibraryMessage: string;
    newLibrary: string;
    enterLibraryName: string;
    enterLibraryDescription: string;
    files: string;
    createdBy: string;
    members: string;
    departments: string;
    loadingLibraries: string;
    noLibrariesFound: string;
    createFirstLibrary: string;
    libraryCreated: string;
    libraryCreationFailed: string;
    pleaseEnterLibraryName: string;
    selectUsersPlaceholder: string;
    selectDepartmentsPlaceholder: string;
    librarySettings: string;
    libraryPermissions: string;
    libraryAccess: string;
    publicLibrary: string;
    privateLibrary: string;
    sharedLibrary: string;
    libraryType: string;
    libraryVisibility: string;
    librarySharing: string;
    libraryBackup: string;
    libraryArchive: string;
    libraryRestore: string;
    libraryDelete: string;
    libraryDeleteConfirm: string;
    libraryDeleteWarning: string;
    libraryDeleteSuccess: string;
    libraryDeleteFailed: string;
    libraryUpdate: string;
    libraryUpdateSuccess: string;
    libraryUpdateFailed: string;
    libraryDuplicate: string;
    libraryExport: string;
    libraryImport: string;
    librarySync: string;
    libraryBackupSuccess: string;
    libraryBackupFailed: string;
    libraryRestoreSuccess: string;
    libraryRestoreFailed: string;
    libraryArchiveSuccess: string;
    libraryArchiveFailed: string;
    filesUploadedSuccess: string;
    failedToUploadFiles: string;
    successfullyDeletedItems: string;
    failedToDeleteSomeItems: string;
    itemsCopiedToClipboard: string;
    itemsCutToClipboard: string;
    addMember: string;
    selectUser: string;
    pleaseSelectUser: string;
    confirmRemoveMember: string;
    noResultsFound: string;
    search: string;
    edit: string;
    delete: string;
    create: string;
    update: string;
    cancel: string;
    add: string;
    yes: string;
    no: string;
    success: string;
    error: string;
    actions: string;
  };
  files: {
    myFiles: string;
    libraries: string;
    createLibrary: string;
    libraryName: string;
    libraryDescription: string;
    permissions: string;
    selectLibrary: string;
    fileDescription: string;
    fileName: string;
    fileSize: string;
    uploadedBy: string;
    uploadedAt: string;
    downloadFile: string;
    viewFile: string;
    deleteFile: string;
    managePermissions: string;
    libraryMembers: string;
    selectMembers: string;
    addMembers: string;
    individuals: string;
    departments: string;
    includeMyself: string;
    selectUsers: string;
    selectDepartments: string;
    memberPermissions: string;
    canRead: string;
    canWrite: string;
    canDelete: string;
    owner: string;
    noMembers: string;
    uploadProgress: string;
    noFilesFound: string;
    createFolder: string;
    // New translations for file manager
    name: string;
    size: string;
    modified: string;
    actions: string;
    list: string;
    grid: string;
    tree: string;
    sortByName: string;
    sortByDate: string;
    sortBySize: string;
    sortByType: string;
    newFolder: string;
    upload: string;
    documents: string;
    userFiles: string;
    view: string;
    download: string;
    rename: string;
    "delete": string;
    deleteConfirm: string;
    createNewFolder: string;
    createFolderIn: string;
    renameItem: string;
    folderName: string;
    enterFolderName: string;
    description: string;
    optionalDescription: string;
    newName: string;
    enterName: string;
    enterNewName: string;
    uploadFiles: string;
    uploadDragText: string;
    uploadHint: string;
    // Bulk operations
    copy: string;
    move: string;
    cut: string;
    paste: string;
    properties: string;
    editDocument: string;
    clearSelection: string;
    selected: string;
    items: string;
    copySelected: string;
    moveSelected: string;
    deleteSelected: string;
    copySelectedItems: string;
    moveSelectedItems: string;
    selectTargetFolderCopy: string;
    selectTargetFolderMove: string;
    copyToRoot: string;
    moveToRoot: string;
    root: string;
    // Document types
    folder: string;
    document: string;
    image: string;
    pdf: string;
    
    // Missing keys for DocumentsManager
    spreadsheet: string;
    text: string;
    file: string;
    exportAsPdf: string;
    // File sharing
    shareFile: string;
    shareFileDescription: string;
    shareFileWithExternalSucursal: string;
    characters: string;
    words: string;
    richTextEditorPoweredByQuill: string;
    loadingEditor: string;
    documentTitle: string;
    startTypingDocument: string;
    pleaseEnterDocumentTitle: string;
    pleaseEnterContent: string;
    pleaseAddContentBeforePdf: string;
    // Status messages
    folderCreatedSuccess: string;
    documentCreatedSuccess: string;
    documentUpdatedSuccess: string;
    itemRenamedSuccess: string;
    itemCopiedSuccess: string;
    itemMovedSuccess: string;
    itemDeletedSuccess: string;
    filesUploadedSuccess: string;
    bulkCopySuccess: string;
    bulkMoveSuccess: string;
    bulkDeleteSuccess: string;
    documentExportedSuccess: string;
    // Error messages
    failedToLoadDocuments: string;
    failedToCreateFolder: string;
    failedToCreateDocument: string;
    failedToUpdateDocument: string;
    failedToUploadFiles: string;
    failedToDeleteItem: string;
    failedToRenameItem: string;
    failedToCopyItem: string;
    failedToMoveItem: string;
    failedToPasteItem: string;
    failedBulkCopy: string;
    failedBulkMove: string;
    failedToGeneratePdf: string;
    itemNotFound: string;
    failedToLoadDocumentContent: string;
    // UI labels
    goBack: string;
    goForward: string;
    sortOrder: string;
    refresh: string;
    searchDocuments: string;
    noDocumentsFound: string;
    exportAsPdf: string;
    // Additional file management keys
    characters: string;
    words: string;
    richTextEditorPoweredByQuill: string;
    loadingEditor: string;
    documentTitle: string;
      startTypingDocument: string;
      pleaseEnterDocumentTitle: string;
      pleaseEnterContent: string;
      pleaseAddContentBeforePdf: string;
      home: string;
      type: string;
      owner: string;
      created: string;
      lastModified: string;
      subfolders: string;
      files: string;
      mimeType: string;
      unknown: string;
      areYouSureDelete: string;
      yes: string;
      no: string;
      cancel: string;
      close: string;
      save: string;
      export: string;
      noDescription: string;
      targetFolder: string;
      pleaseSelectTargetFolder: string;
      pleaseEnterFolderName: string;
      pleaseEnterNewName: string;
      createNewDocument: string;
      itemProperties: string;
      copyItem: string;
      moveItem: string;
      renameItem: string;
      by: string;
      bulkCopyItems: string;
      bulkMoveItems: string;
      selectTargetFolderForBulkCopy: string;
      selectTargetFolderForBulkMove: string;
      successfullyDeletedItems: string;
      failedToDeleteSomeItems: string;
          // Additional missing keys
    copyText: string;
    moveText: string;
    deleteSelectedText: string;
    // File shares modal
    fileShares: string;
    fileSharedWith: string;
    fileSharedBy: string;
    sharedAt: string;
    message: string;
    remoteShare: string;
    noSharesFound: string;
    loadingShares: string;
    fileSharedSuccessfully: string;
  };
  scanner: {
    title: string;
    description: string;
    scanDocument: string;
    takePhoto: string;
    addPage: string;
    removePage: string;
    generatePdf: string;
    savePdf: string;
    scanningTips: string;
    goodLighting: string;
    keepFlat: string;
    avoidShadows: string;
    centerDocument: string;
    adjustBorders: string;
    camera: string;
    startCamera: string;
    startCameraHint: string;
    stopCamera: string;
    scannedPages: string;
    noPagesScanned: string;
    page: string;
    view: string;
    "delete": string;
    fileName: string;
    fileNamePlaceholder: string;
    captureSuccess: string;
    pdfGenerated: string;
    pdfGenerationFailed: string;
    captureAtLeastOnePage: string;
    enterFileName: string;
    cameraAccessError: string;
    // Additional scanner keys
    useDeviceCamera: string;
    convertToPdf: string;
    scanningTipsTitle: string;
    ensureGoodLighting: string;
    keepDocumentFlat: string;
    avoidShadowsGlare: string;
    centerDocumentFrame: string;
    cameraSection: string;
    scannedPagesSection: string;
    pdfGenerationSection: string;
    fileNameLabel: string;
    fileNameRequired: string;
    enterFileNameWithoutExtension: string;
    generatePdfButton: string;
    generatingPdf: string;
    processingPages: string;
    pageSingular: string;
    pagePlural: string;
    noPagesScannedYet: string;
    clickStartCamera: string;
    toBeginScanning: string;
    pageNumber: string;
    movePageUp: string;
    movePageDown: string;
    previewModal: string;
    unableToAccessCamera: string;
    checkPermissions: string;
    pageCapturedSuccessfully: string;
    pleaseCaptureOnePage: string;
    pleaseEnterFileName: string;
    pdfGeneratedSuccessfully: string;
    failedToGeneratePdf: string;
    tryAgain: string;
  };
  sucursal: {
    management: string;
    manageSucursals: string;
    addSucursal: string;
    sucursalName: string;
    serverUrl: string;
    description: string;
    totalSucursals: string;
    online: string;
    offline: string;
    avgUptime: string;
    responseTime: string;
    uptime: string;
    healthStatus: string;
    serverLogs: string;
    actions: string;
    refreshStatus: string;
    configuration: string;
    viewInBrowser: string;
    basicInformation: string;
    currentStatus: string;
    createdBy: string;
    createSucursal: string;
    editSucursal: string;
    updateSucursal: string;
    confirmDelete: string;
    confirmDeleteMessage: string;
    cancel: string;
    // Additional keys for the component
    addNewSucursal: string;
    enterSucursalName: string;
    enterServerUrl: string;
    enterDescription: string;
    pleaseEnterSucursalName: string;
    pleaseEnterServerUrl: string;
    pleaseEnterDescription: string;
    pleaseEnterValidUrl: string;
    pleaseEnterLocation: string;
    enterLocation: string;
    sucursalWithNameOrUrlExists: string;
    refreshStatusTooltip: string;
    viewDetailsTooltip: string;
    errorsLogged: string;
    time: string;
    details: string;
    createdAt: string;
    location: string;
    status: string;
    errorCount: string;
    ping: string;
    pingSucursal: string;
    pingSuccess: string;
    pingFailed: string;
    serverUnreachable: string;
    connectionTest: string;
    testConnection: string;
    connectionSuccess: string;
    connectionFailed: string;
    latency: string;
    ms: string;
    percent: string;
    na: string;
    accessDenied: string;
    name: string;
    url: string;
    errorType: string;
    description: string;
  };
  profile: {
    title: string;
    description: string;
    editProfile: string;
    updateProfile: string;
    cancel: string;
    personalInfo: string;
    accountInfo: string;
    security: string;
    fullName: string;
    email: string;
    phone: string;
    address: string;
    department: string;
    memberSince: string;
    lastLogin: string;
    userId: string;
    never: string;
    noDepartment: string;
    enterFullName: string;
    enterEmail: string;
    enterPhone: string;
    enterAddress: string;
    selectDepartment: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    enterCurrentPassword: string;
    enterNewPassword: string;
    confirmNewPassword: string;
    passwordRequirements: string;
    passwordsDoNotMatch: string;
    clickToChange: string;
    uploadingAvatar: string;
    onlyImageFiles: string;
    imageSizeLimit: string;
    avatarUploaded: string;
    failedToUploadAvatar: string;
    profileUpdated: string;
    profileUpdateSuccess: string;
    failedToUpdateProfile: string;
    updateError: string;
    passwordChanged: string;
    passwordChangeSuccess: string;
    failedToChangePassword: string;
    passwordChangeError: string;
    passwordSecurity: string;
    passwordSecurityDescription: string;
    departmentChangeInfo: string;
    departmentChangeDescription: string;
    roleDescriptions: {
      superAdmin: string;
      admin: string;
      supervisor: string;
      user: string;
      developer: string;
    };
    validation: {
      required: string;
      email: string;
    };
  };
}

const dictionaries: Record<Locale, Dictionary> = {
  pt: {
    navigation: {
      dashboard: 'Painel',
      homepage: 'Início',
      reports: 'Relatórios',
      submitReports: 'Submeter Relatórios',
      viewReports: 'Ver Relatórios',
      goals: 'Metas',
      viewGoals: 'Ver Metas',
      createGoals: 'Criar Metas',
      editGoals: 'Editar Metas',
      scanner: 'Scanner',
              scan: 'Scanner',

      fileManagement: 'Gestão de Arquivos',
      libraries: 'Bibliotecas',
      documents: 'Documentos',
      management: 'Gestão',
      users: 'Usuários',
      departments: 'Departamentos',
      sucursals: 'Sucursais',
      generalPanel: 'Painel Geral',
      notifications: 'Notificações',
      requests: 'Solicitações',
      profile: 'Perfil',
    },
    common: {
      login: 'Entrar',
      logout: 'Sair',
      save: 'Salvar',
      cancel: 'Cancelar',
      delete: 'Excluir',
      edit: 'Editar',
      view: 'Ver',
      create: 'Criar',
      upload: 'Carregar',
      download: 'Baixar',
      search: 'Pesquisar',
      filter: 'Filtrar',
      approve: 'Aprovar',
      reject: 'Rejeitar',
      pending: 'Pendente',
      completed: 'Concluído',
      active: 'Ativo',
      inactive: 'Inativo',
      loading: 'Carregando...',
      error: 'Erro',
      success: 'Sucesso',
      submit: 'Enviar',
      close: 'Fechar',
      open: 'Abrir',
      yes: 'Sim',
      no: 'Não',
      reload: 'Recarregar',
      refresh: 'Atualizar',
      platformName: 'Totalizer Platform',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      response: 'Resposta',
      all: 'Todos',
      status: 'Status',
      required: 'Este campo é obrigatório',
      accessDenied: 'Acesso negado',
      startDate: 'Data de Início',
      endDate: 'Data de Fim',
          department: 'Departamento',
    logoutSuccess: 'Logout realizado com sucesso',
    logoutError: 'Erro durante o logout, mas sessão foi limpa',
  },
    auth: {
      welcomeBack: 'Bem-vindo de volta',
      enterCredentials: 'Digite suas credenciais para acessar',
      email: 'E-mail',
      password: 'Senha',
      rememberMe: 'Lembrar-me',
      forgotPassword: 'Esqueceu a senha?',
      dontHaveAccount: 'Não tem uma conta?',
      signUp: 'Cadastrar-se',
      createAccount: 'Criar Conta',
      confirmPassword: 'Confirmar Senha',
      fullName: 'Nome Completo',
      department: 'Departamento',
      selectDepartment: 'Selecione um departamento',
      userType: 'Tipo de Usuário',
      requestAccess: 'Solicitar Acesso',
      accountRequested: 'Conta Solicitada',
      waitingApproval: 'Aguardando aprovação do administrador',
      invalidCredentials: 'Credenciais inválidas',
      loginFailed: 'Falha no login',
      checkFormFields: 'Por favor, verifique os campos do formulário e tente novamente.',
      passwordTooShort: 'Senha deve ter pelo menos 6 caracteres',
      passwordsDoNotMatch: 'Senhas não coincidem',
      registrationFailed: 'Falha no registro',
      emailRequired: 'E-mail é obrigatório',
      invalidEmailFormat: 'Formato de e-mail inválido',
      passwordRequired: 'Senha é obrigatória',
      confirmPasswordRequired: 'Confirmação de senha é obrigatória',
      departmentRequired: 'Departamento é obrigatório',
    },
    dashboard: {
      welcomeTo: 'Bem-vindo ao',
      totalUsers: 'Total de Usuários',
      storedFiles: 'Arquivos Armazenados',
      recentActivity: 'Atividade Recente',
      pendingReports: 'Relatórios Pendentes',
      activeGoals: 'Metas Ativas',
      newUsers: 'Novos Usuários',
      quickActions: 'Ações Rápidas',
      addFiles: 'Adicionar Arquivos',
      createLibrary: 'Criar Biblioteca',
      scanDocument: 'Scanner Documento',
      submitReport: 'Submeter Relatório',
      companyOverview: 'Visão Geral da Empresa',
      newUsersThisMonth: 'Novos Usuários Este Mês',
      storageUsage: 'Uso de Armazenamento',
      reportsResponseRate: 'Taxa de Resposta de Relatórios',
      libraries: 'Bibliotecas',
      documents: 'Documentos',
      // Additional dashboard keys
      title: 'Painel',
      welcomeBack: 'Bem-vindo de volta, {name}! Aqui está o que está acontecendo no seu sistema.',
      statistics: {
        totalUsers: 'Total de Usuários',
        activeUsers: 'Usuários Ativos',
        adminUsers: 'Usuários Admin (Admin + Super Admin)',
        pendingUsers: 'Usuários Pendentes'
      },
      quickActions: {
        title: 'Ações Rápidas',
        goToDocuments: 'Ir para Documentos',
        goToLibraries: 'Ir para Bibliotecas',
        scanner: 'Scanner'
      },
      systemInfo: {
        title: 'Informações do Sistema',
        platformVersion: 'Versão da Plataforma',
        databaseStatus: 'Status do Banco',
        lastBackup: 'Último Backup',
        systemHealth: 'Saúde do Sistema',
        activeSessions: 'Sessões Ativas'
      },
      notifications: {
        title: 'Notificações Recentes',
        refresh: 'Atualizar',
        noNotifications: 'Nenhuma notificação encontrada',
        columns: {
          type: 'Tipo',
          title: 'Título',
          description: 'Descrição',
          date: 'Data',
          status: 'Status'
        },
        status: {
          read: 'Lida',
          unread: 'Não lida'
        }
      },
      userStats: {
        title: 'Usuários por Função',
        regularUsers: 'Usuários Regulares',
        supervisors: 'Supervisores',
        admins: 'Admins',
        superAdmins: 'Super Admins',
        developers: 'Desenvolvedores'
      },
      systemOverview: {
        title: 'Visão Geral do Sistema',
        totalDepartments: 'Total de Departamentos',
        inactiveUsers: 'Usuários Inativos',
        userGrowth: 'Crescimento de Usuários',
        systemLoad: 'Carga do Sistema'
      },
      systemStatus: {
        connected: 'Conectado',
        version: 'v1.0.0',
        backupTime: 'Hoje 02:00 AM'
      },
      recentDocuments: {
        title: 'Documentos Recentes',
        refresh: 'Atualizar',
        noDocuments: 'Nenhum documento recente encontrado',
        uploadedBy: 'Enviado por',
        columns: {
          name: 'Nome',
          uploadedBy: 'Enviado por',
          date: 'Data',
          actions: 'Ações'
        },
        openFolder: 'Abrir Pasta',
        downloadFile: 'Baixar Arquivo'
      }
    },
    departments: {
      title: 'Departamentos',
      name: 'Nome',
      description: 'Descrição',
      supervisor: 'Supervisor',
      usersCount: 'Contagem de Usuários',
      createdAt: 'Criado em',
      actions: 'Ações',
      create: 'Criar',
      edit: 'Editar',
      delete: 'Excluir',
      save: 'Salvar',
      cancel: 'Cancelar',
      addDepartment: 'Adicionar Departamento',
      editDepartment: 'Editar Departamento',
      createDepartment: 'Criar Departamento',
      departmentName: 'Nome do Departamento',
      departmentDescription: 'Descrição do Departamento',
      selectSupervisor: 'Selecionar Supervisor',
      noSupervisor: 'Sem supervisor',
      selectDepartmentFirst: 'Selecione o Departamento Primeiro',
      supervisorNote: 'Supervisores podem ser atribuídos de qualquer usuário ativo com papéis de Supervisor, Admin ou Super Admin',
      confirmDelete: 'Tem certeza que deseja excluir este departamento?',
      users: 'usuários',
      manageDepartments: 'Gerenciar Departamentos',
      departmentManagement: 'Gerenciamento de Departamentos',
    },
    users: {
      title: 'Usuários',
      create: 'Criar',
      edit: 'Editar',
      delete: 'Excluir',
      passwordReset: 'Redefinição de Senha',
      temporaryPassword: 'Senha Temporária',
      emailSent: 'E-mail enviado com a nova senha',
      promoteToSuperAdmin: 'Promover para Super Admin',
      removeUser: 'Remover Usuário',
      resetPassword: 'Redefinir Senha',
      userFiles: 'Arquivos do Usuário',
      exportUsers: 'Exportar Usuários',
      totalUsers: 'Total de Usuários',
      superAdmins: 'Super Admins',
      admins: 'Admins',
      supervisors: 'Supervisores',
      normalUsers: 'Usuários Normais',
      active: 'Ativo',
      inactive: 'Inativo',
      pending: 'Pendente',
      userDetails: 'Detalhes do Usuário',
      role: 'Função',
      department: 'Departamento',
      phone: 'Telefone',
      createdAt: 'Criado em',
      actions: 'Ações',
      usersList: 'Lista de Usuários',
      userManagement: 'Gerenciamento de Usuários',
      manageUsers: 'Gerenciar Usuários',
      selectDepartment: 'Selecionar Departamento',
      selectRole: 'Selecionar Função',
      selectStatus: 'Selecionar Status',
      setAsDepartmentAdmin: 'Definir como Admin do Departamento',
      managedDepartments: 'Departamentos Gerenciados',
      departmentAdminDescription: 'Admins de departamento têm permissões adicionais para gerenciar membros e metas do departamento',
      userForm: 'Formulário de Usuário',
      editUser: 'Editar Usuário',
      viewFiles: 'Ver Arquivos',
      promoteToSupervisor: 'Promover a Supervisor do Departamento',
      name: 'Nome',
      email: 'E-mail',
      lastLogin: 'Último Acesso',
      user: 'Usuário',
      createUser: 'Criar Usuário',
      enterUserName: 'Digite o nome do usuário',
      enterEmailAddress: 'Digite o endereço de e-mail',
      selectRole: 'Selecionar Função',
      selectDepartment: 'Selecionar Departamento',
      selectStatus: 'Selecionar Status',
      enterPhoneNumber: 'Digite o número de telefone',
      selectDepartmentsToManage: 'Selecionar departamentos para gerenciar',
      files: 'Arquivos',
      folders: 'Pastas',
      createFolder: 'Criar Pasta',
      uploadFile: 'Enviar Arquivo',
      folderName: 'Nome da Pasta',
      enterFolderName: 'Digite o nome da pasta',
      fileSize: 'Tamanho do Arquivo',
      lastModified: 'Última Modificação',
      noFiles: 'Nenhum arquivo encontrado',
      noFolders: 'Nenhuma pasta encontrada',
      rootFolder: 'Pasta Raiz',
      searchByName: 'Pesquisar por nome',
      filterByStatus: 'Filtrar por status',
      filterByDepartment: 'Filtrar por departamento',
      promoteToSupervisor: 'Promover a Supervisor do Departamento',
      removeUserConfirm: 'Confirmar Remoção',
      removeUserWarning: 'Tem certeza que deseja remover este usuário? Esta ação não pode ser desfeita.',
      viewingFilesFor: 'Visualizando arquivos de',
      fileManagerDescription: 'Navegue e gerencie arquivos e pastas pessoais do usuário',
      userTypes: {
        SUPER_ADMIN: 'Super Administrador',
        ADMIN: 'Administrador',
        USER: 'Usuário',
        SUPERVISOR: 'Supervisor',
        DEVELOPER: 'Desenvolvedor'
      },
    },
    notifications: {
      notifications: 'Notificações',
      markAsRead: 'Marcar como Lido',
      markAllAsRead: 'Marcar Todos como Lidos',
      noNotifications: 'Nenhuma notificação',
      noUnreadNotifications: 'Nenhuma notificação não lida',
      noReadNotifications: 'Nenhuma notificação lida',
      all: 'Todas',
      unread: 'Não lidas',
      read: 'Lidas',
      stayUpdated: 'Mantenha-se atualizado com as atividades importantes da plataforma',
      delete: 'Excluir',
      timeAgo: {
        justNow: 'Agora mesmo',
        minutesAgo: 'min atrás',
        hoursAgo: 'h atrás',
        daysAgo: 'd atrás',
      },
      types: {
        reportSubmitted: 'Relatório Submetido',
        goalUpdated: 'Meta Atualizada',
        userRequest: 'Solicitação de Usuário',
        systemAlert: 'Alerta do Sistema',
        newFile: 'Novo Arquivo',
        responseReceived: 'Resposta Recebida',
      },
    },
    requests: {
      title: 'Solicitações',
      type: 'Tipo',
      priority: 'Prioridade',
      by: 'por',
      viewDetails: 'Ver Detalhes',
      quickApprove: 'Aprovar Rápido',
      quickReject: 'Rejeitar Rápido',
      requestDetails: 'Detalhes da Solicitação',
      requestInformation: 'Informações da Solicitação',
      reviewRequests: 'Revisar e gerenciar solicitações de usuários para contas, acesso e suporte',
      allRequests: 'Todas as Solicitações',
      myRequests: 'Minhas Solicitações',
      userRequests: 'Solicitações de Usuários',
      pendingRequests: 'Solicitações Pendentes',
      approvedRequests: 'Solicitações Aprovadas',
      rejectedRequests: 'Solicitações Rejeitadas',
      updateRequest: 'Atualizar Solicitação',
      reviewedAt: 'Revisado em',
      reviewedBy: 'Revisado por',
      userRequestsManagement: 'Gerenciamento de Solicitações de Usuários',
      pending: 'Pendente',
      inReview: 'Em Revisão',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      createRequest: 'Criar Solicitação',
      requestType: 'Tipo de Solicitação',
      requestTitle: 'Título da Solicitação',
      requestDescription: 'Descrição da Solicitação',
      submitRequest: 'Submeter Solicitação',
      requestSubmitted: 'Solicitação submetida com sucesso',
      approveRequest: 'Aprovar Solicitação',
      rejectRequest: 'Rejeitar Solicitação',
      requestedBy: 'Solicitado por',
      requestedAt: 'Solicitado em',
      requestReason: 'Motivo da Solicitação',
    },
    sucursal: {
      management: 'Gerenciamento de Sucursal',
      manageSucursals: 'Gerenciar e monitorar servidores de filiais em todas as localizações',
      addSucursal: 'Adicionar Nova Sucursal',
      sucursalName: 'Nome da Sucursal',
      serverUrl: 'URL do Servidor',
      description: 'Descrição',
      totalSucursals: 'Total de Sucursais',
      online: 'Online',
      offline: 'Offline',
      avgUptime: 'Tempo Médio de Atividade',
      responseTime: 'Tempo de Resposta',
      uptime: 'Tempo de Atividade',
      healthStatus: 'Status de Saúde',
      serverLogs: 'Logs do Servidor',
      actions: 'Ações',
      refreshStatus: 'Atualizar Status',
      configuration: 'Configuração',
      viewInBrowser: 'Ver no Navegador',
      basicInformation: 'Informações Básicas',
      currentStatus: 'Status Atual',
      createdBy: 'Criado Por',
      createSucursal: 'Criar Sucursal',
      editSucursal: 'Editar Sucursal',
      updateSucursal: 'Atualizar Sucursal',
      confirmDelete: 'Confirmar Exclusão',
      confirmDeleteMessage: 'Tem certeza que deseja excluir esta sucursal? Esta ação não pode ser desfeita.',
      cancel: 'Cancelar',
      // Additional keys for the component
      addNewSucursal: 'Adicionar Nova Sucursal',
      enterSucursalName: 'Digite o nome da sucursal',
      enterServerUrl: 'Digite a URL do servidor',
      enterDescription: 'Digite a descrição',
      pleaseEnterSucursalName: 'Por favor, digite o nome da sucursal',
      pleaseEnterServerUrl: 'Por favor, digite a URL do servidor',
      pleaseEnterDescription: 'Por favor, digite a descrição',
      pleaseEnterValidUrl: 'Por favor, digite uma URL válida',
      pleaseEnterLocation: 'Por favor, digite a localização',
      enterLocation: 'Digite a localização',
      sucursalWithNameOrUrlExists: 'Sucursal com este nome ou URL já existe',
      refreshStatusTooltip: 'Atualizar Status',
      viewDetailsTooltip: 'Ver Detalhes',
      errorsLogged: 'erro(s) registrado(s)',
      time: 'Tempo',
      details: 'Detalhes',
      createdAt: 'Criado em',
      location: 'Localização',
      status: 'Status',
      errorCount: 'Contagem de Erros',
      ping: 'Ping',
      pingSucursal: 'Ping Sucursal',
      pingSuccess: 'Ping realizado com sucesso',
      pingFailed: 'Falha no ping',
      serverUnreachable: 'Servidor inacessível',
      connectionTest: 'Teste de Conexão',
      testConnection: 'Testar Conexão',
      connectionSuccess: 'Conexão bem-sucedida',
      connectionFailed: 'Falha na conexão',
      latency: 'Latência',
      ms: 'ms',
      percent: '%',
      na: 'N/A',
      accessDenied: 'Acesso negado',
      name: 'Nome',
      url: 'URL',
      errorType: 'Tipo de Erro',
      description: 'Descrição',
    },
    reports: {
      submitReport: 'Submeter Relatório',
      reportType: 'Tipo de Relatório',
      title: 'Título',
      description: 'Descrição',
      attachFiles: 'Anexar Arquivos',
      selectSupervisor: 'Selecionar Supervisor',
      selectSupervisors: 'Selecionar Supervisores',
      selectSupervisorsPlaceholder: 'Selecionar supervisores',
      reportSubmitted: 'Relatório Submetido',
      myReports: 'Meus Relatórios',
      teamReports: 'Relatórios da Equipe',
      allReports: 'Todos os Relatórios',
      reportDetails: 'Detalhes do Relatório',
      respond: 'Responder',
      response: 'Resposta',
      status: 'Status',
      submittedBy: 'Submetido por',
      submittedAt: 'Submetido em',
      type: 'Tipo',
      blocked: 'Bloqueado',
      onHold: 'Em Espera',
      respondedAt: 'Respondido em',
      viewReports: 'Ver Relatórios',
      // New translations
      submitReportDescription: 'Submeta seu relatório ao seu supervisor para revisão e feedback.',
      selectReportType: 'Selecionar tipo de relatório',
      selectSupervisorPlaceholder: 'Selecionar supervisor',
      pleaseSelectReportType: 'Por favor, selecione um tipo de relatório',
      pleaseSelectSupervisor: 'Por favor, selecione um supervisor',
      reportTitlePlaceholder: 'Digite o título do relatório',
      reportDescriptionPlaceholder: 'Digite a descrição do relatório',
      failedToLoadSupervisors: 'Falha ao carregar supervisores',
      failedToSubmitReport: 'Falha ao submeter relatório',
      uploadProgress: 'Progresso do Upload',
      uploadingFiles: 'Carregando arquivos',
      uploadComplete: 'Upload concluído',
      shareGoal: 'Compartilhar Meta',
      goalPublished: 'Meta publicada com sucesso',
      failedToPublishGoal: 'Falha ao publicar meta',
      goalSharedSuccessfully: 'Meta compartilhada com sucesso',
      failedToShareGoal: 'Falha ao compartilhar meta',
      failedToLoadUsers: 'Falha ao carregar usuários',
      shareGoalInfo: 'Compartilhar Meta Concluída',
      shareGoalDescription: 'Você pode compartilhar esta meta concluída com outros usuários.',
      selectUsersToShare: 'Selecionar Usuários para Compartilhar',
      selectUsers: 'Selecionar usuários',
      message: 'Mensagem',
      shareMessagePlaceholder: 'Digite uma mensagem opcional...',
      sharing: 'Compartilhando',
      pleaseSelectUsers: 'Por favor, selecione pelo menos um usuário',
      // Cross-sucursal sharing
      shareCompletedGoalWithExternalSucursal: 'Compartilhar Meta Concluída com Sucursal Externa',
      shareCompletedGoalDescription: 'Compartilhar a meta concluída "{goalName}" com usuários de outras sucursais para colaboração interorganizacional',
      publishGoal: 'Publicar Meta',
      publish: 'Publicar',
      pending: 'Pendente',
      responded: 'Respondido',
      archived: 'Arquivado',
      allReportsTab: 'Todos',
      pendingTab: 'Pendentes',
      respondedTab: 'Respondidos',
      archivedTab: 'Arquivados',
      loadingUserData: 'Carregando dados do usuário...',
      actions: 'Ações',
      viewReport: 'Ver Relatório',
      respondToReport: 'Responder ao Relatório',
      submitResponse: 'Submeter Resposta',
      responseModalTitle: 'Responder ao Relatório',
      writeResponse: 'Escreva sua resposta',
      reportResponseSubmitted: 'Resposta submetida com sucesso!',
      failedToRespond: 'Falha ao responder ao relatório',
      noReportsFound: 'Nenhum relatório encontrado',
      clickToUploadFiles: 'Clique para fazer upload de arquivos',
      supportedFormats: 'Formatos suportados: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (Máx 10MB cada)',
      pleaseEnterTitle: 'Por favor, digite um título',
      pleaseEnterDescription: 'Por favor, digite uma descrição',
      describeReportDetail: 'Descreva seu relatório em detalhes...',
      failedToLoadReports: 'Falha ao carregar relatórios',
      // Report types
      monthlyProgressReport: 'Relatório de Progresso Mensal',
      issueReport: 'Relatório de Problema',
      projectUpdate: 'Atualização de Projeto',
      expenseReport: 'Relatório de Despesas',
      performanceReview: 'Avaliação de Desempenho',
      incidentReport: 'Relatório de Incidente',
      other: 'Outro',
      predefinedTypes: 'Tipos Predefinidos',
      customType: 'Tipo Personalizado',
      enterCustomType: 'Digite o tipo de relatório personalizado',
      pleaseEnterCustomType: 'Por favor, digite o tipo de relatório personalizado',
      enterReportType: 'Digite o tipo de relatório',
      pleaseEnterReportType: 'Por favor, digite o tipo de relatório',
    },
    goals: {
      myGoals: 'Minhas Metas',
      teamGoals: 'Metas da Equipe',
      allGoals: 'Todas as Metas',
      viewGoals: 'Ver Metas',
      createGoal: 'Criar Meta',
      editGoal: 'Editar Meta',
      goalName: 'Nome da Meta',
      goalDescription: 'Descrição da Meta',
      assignTo: 'Atribuir para',
      startDate: 'Data de Início',
      endDate: 'Data de Término',
      targetValue: 'Valor Meta',
      currentProgress: 'Progresso Atual',
      progress: 'Progresso',
      deadline: 'Prazo',
      assigned: 'Atribuído',
      completed: 'Concluída',
      title: 'Gestão de Metas',
      subtitle: 'Acompanhe e gerencie metas e objetivos organizacionais',
      createNew: 'Criar Nova Meta',
      // New translations for goal creation
      goalTitle: 'Título da Meta',
      goalDescriptionText: 'Descrição da Meta',
      goalAssignment: 'Atribuição da Meta',
      individualGoal: 'Meta Individual (atribuída a usuários específicos)',
      departmentGoal: 'Meta de Departamento (visível para todos os membros do departamento)',
      departmentRequired: 'Por favor selecione o departamento',
      usersRequired: 'Por favor selecione pelo menos um usuário',
      priority: 'Prioridade',
      timeline: 'Cronograma',
      titleRequired: 'Por favor digite o título da meta',
      titleMinLength: 'O título deve ter pelo menos 3 caracteres',
      descriptionRequired: 'Por favor digite a descrição da meta',
      priorityRequired: 'Por favor selecione a prioridade',
      timelineRequired: 'Por favor selecione o cronograma',
      assignToUsers: 'Atribuir a Usuários',
      selectDepartment: 'Selecionar departamento primeiro',
      selectUsers: 'Selecionar usuários do departamento',
      selectDepartmentForGoal: 'Selecionar departamento para esta meta',
      departmentGoalInfo: 'Meta de Departamento',
      departmentGoalDescription: 'Quando você seleciona uma meta de departamento, todos os usuários desse departamento serão automaticamente atribuídos à meta.',
      lowPriority: 'Baixa Prioridade',
      mediumPriority: 'Média Prioridade',
      highPriority: 'Alta Prioridade',
      createGoalDescription: 'Crie uma nova meta e acompanhe seu progresso',
      goalDetails: 'Detalhes da Meta',
      titlePlaceholder: 'Digite um título claro e específico para a meta',
      descriptionPlaceholder: 'Descreva sua meta em detalhes, incluindo como o sucesso se parece',
      goalCreatedSuccessfully: 'Meta criada com sucesso!',
      goalUpdatedSuccessfully: 'Meta atualizada com sucesso!',
      goalCreationFailed: 'Falha ao criar meta',
      goalUpdateFailed: 'Falha ao atualizar meta',
      updateGoal: 'Atualizar Meta',
      editGoalDescription: 'Edite os detalhes da meta existente',
      failedToLoadGoal: 'Falha ao carregar meta',
      // Additional translations for goals view page
      trackAndManageGoals: 'Acompanhe e gerencie suas metas e objetivos',
      totalGoals: 'Total de Metas',
      activeGoals: 'Metas Ativas',
      pendingReportsWarning: '{count} meta(s) precisa(m) de relatórios de conclusão antes de serem marcadas como finalizadas.',
      searchGoals: 'Pesquisar metas...',
      filterByStatus: 'Filtrar por Status',
      filterByPriority: 'Filtrar por Prioridade',
      filterByDepartment: 'Filtrar por Departamento',
      pending: 'Pendente',
      active: 'Ativo',
      overdue: 'Atrasado',
      onHold: 'Em Espera',
      cancelled: 'Cancelado',
      of: 'de',
      goals: 'Metas',
      viewDetails: 'Ver Detalhes',
      uploadReport: 'Carregar Relatório',
      updateProgress: 'Atualizar Progresso',
      updateStatus: 'Atualizar Status',
      selectStatus: 'Selecionar Status',
      uploading: 'Carregando...',
      deleteGoal: 'Excluir Meta',
      goalDeletedSuccessfully: 'Meta excluída com sucesso!',
      failedToDeleteGoal: 'Falha ao excluir meta',
      failedToLoadGoals: 'Falha ao carregar metas',
      reportRequired: 'Relatório Necessário',
      usersAssigned: 'usuários atribuídos',
      notAssigned: 'Não atribuído',
      daysOverdue: 'dias atrasado',
      daysRemaining: 'dias restantes',
      viewReports: 'Ver Relatórios',
      reports: 'Relatórios',
      submittedBy: 'Submetido por',
      viewFile: 'Ver Arquivo',
      download: 'Baixar',
      reportTitle: 'Título do Relatório',
      reportDescription: 'Descrição do Relatório',
      pleaseSelectFile: 'Por favor selecione um arquivo',
      reportUploadedSuccessfully: 'Relatório carregado com sucesso!',
      failedToUploadReport: 'Falha ao carregar relatório',
      reportTitleRequired: 'Título do relatório é obrigatório',
      enterReportTitle: 'Digite o título do relatório',
      invalidDates: 'Datas inválidas selecionadas',
      reportDescriptionRequired: 'Descrição do relatório é obrigatória',
      enterReportDescription: 'Digite a descrição do relatório',
      uploadFiles: 'Carregar Arquivos',
      filesRequired: 'Arquivos são obrigatórios',
      selectFiles: 'Selecionar Arquivos',
      isCompletionReport: 'Relatório de Conclusão',
      progressUpdatedSuccessfully: 'Progresso atualizado com sucesso!',
      failedToUpdateProgress: 'Falha ao atualizar progresso',
      progressRequired: 'Progresso é obrigatório',
      statusRequired: 'Status é obrigatório',
      // Additional missing keys for goals view page
      goal: 'Meta',
      actions: 'Ações',
      createdByMe: 'Criadas por Mim',
      lastUpdated: 'Última Atualização',
      // Status and other missing keys
      status: 'Status',
      assignedTo: 'Atribuído a',
      createdAt: 'Criado em',
      createdBy: 'Criado por',
      close: 'Fechar',
      pendingReports: 'Relatórios Pendentes',
      // Status values
      statusEmProgresso: 'Em Progresso',
      statusPendente: 'Pendente',
      statusFeito: 'Feito',
      statusConcluido: 'Concluído',
      statusBloqueado: 'Bloqueado',
             statusEmEspera: 'Em Espera',
       statusOutro: 'Outro',
       blocked: 'Bloqueado',
      uploadNewReport: 'Upload Novo Relatório',
      completionReport: 'Relatório de Conclusão',
      attachedFiles: 'Ficheiros Anexados',
      noReportsYet: 'Ainda não há relatórios',
      uploadFirstReport: 'Faça upload do primeiro relatório',
      // Additional missing keys for goal reports
      description: 'Descrição',
      submittedAt: 'Submetido em',
      type: 'Tipo',
      fileDownloadedSuccessfully: 'Ficheiro descarregado com sucesso',
      downloadFailed: 'Falha no download',
      noFilesAttached: 'Nenhum ficheiro anexado',
      uploadComplete: 'Upload Concluído',
      uploadingFiles: 'A Carregar Ficheiros',
      // Status update related keys
      statusUpdatedSuccessfully: 'Status atualizado com sucesso!',
      failedToUpdateStatus: 'Falha ao atualizar status',
      noStatusChange: 'Nenhuma mudança de status detectada',
      currentStatus: 'Status Atual',
      newStatus: 'Novo Status',
      selectNewStatus: 'Selecionar novo status',
      updating: 'Atualizando...',
      // New status values
      pending: 'Pendente',
      inProgress: 'Em Progresso',
      onHold: 'Em Espera',
      awaiting: 'Aguardando',
      done: 'Feito',
      // Additional missing keys
      departmentGoals: 'Metas do Departamento',
      manageAndTrackGoals: 'Gerir e acompanhar as suas metas e objetivos',
      searchGoals: 'Pesquisar metas',
      // Publish and share functionality
      publishGoal: 'Publicar Meta',
      publish: 'Publicar',
      shareGoal: 'Compartilhar Meta',
      goalPublished: 'Meta publicada com sucesso!',
      failedToPublishGoal: 'Falha ao publicar meta',
      goalSharedSuccessfully: 'Meta compartilhada com sucesso!',
      failedToShareGoal: 'Falha ao compartilhar meta',
      failedToLoadUsers: 'Falha ao carregar usuários',
      shareGoalInfo: 'Compartilhar Meta Concluída',
      shareGoalDescription: 'Você pode compartilhar esta meta concluída com outros usuários.',
      selectUsersToShare: 'Selecionar Usuários para Compartilhar',
      selectUsers: 'Selecionar usuários',
      message: 'Mensagem',
      shareMessagePlaceholder: 'Digite uma mensagem opcional...',
      sharing: 'Compartilhando',
      pleaseSelectUsers: 'Por favor selecione pelo menos um usuário',
      sharedWithYou: 'Compartilhado Com Você',
      sharedBy: 'Compartilhado por',
      sharedOn: 'Compartilhado em',
      sharingInfo: 'Informações de Compartilhamento',
    },
    sharing: {
      shareWithLocalUsers: 'Compartilhar com Usuários Locais',
      selectLocalUsers: 'Selecionar Usuários Locais',
      selectUsersFromSucursal: 'Selecionar usuários da sua sucursal',
      shareWithExternalSucursal: 'Compartilhar com Sucursal Externa',
      selectSucursal: 'Selecionar Sucursal',
      pleaseSelectSucursal: 'Por favor selecione uma sucursal',
      selectRemoteUsers: 'Selecionar Usuários Remotos',
      pleaseSelectRemoteUsers: 'Por favor selecione usuários remotos',
      selectUsersFromSelectedSucursal: 'Selecionar usuários da sucursal selecionada',
      messageOptional: 'Mensagem (Opcional)',
      addMessageAboutSharedContent: 'Adicione uma mensagem sobre este conteúdo compartilhado...',
      share: 'Compartilhar',
      sharing: 'Compartilhando...',
      pleaseSelectUsersToShareWith: 'Por favor selecione usuários para compartilhar',
      pleaseSelectRemoteUsersToShareWith: 'Por favor selecione usuários remotos para compartilhar',
      localFileSharingNotImplemented: 'Compartilhamento local de arquivos ainda não implementado',
      sharedSuccessfully: 'Compartilhado com sucesso!',
      failedToShare: 'Falha ao compartilhar',
      failedToLoadSucursals: 'Falha ao carregar sucursals',
      failedToLoadUsersFromSucursal: 'Falha ao carregar usuários da sucursal selecionada',
    },
    documents: {
      // Page title and description
      documentManagementSystem: 'Sistema de Gestão de Documentos',
      organizeAndAccessDocuments: 'Organize e acesse documentos com estrutura hierárquica de pastas, múltiplos modos de visualização e recursos colaborativos',
      
      // Tab labels
      allDocuments: 'Todos os Documentos',
      myDocuments: 'Meus Documentos',
      
      // Tab descriptions
      allDocumentsDescription: 'Documentos da empresa acessíveis a todos os funcionários',
      myDocumentsDescription: 'Armazenamento de documentos criados por mim',
      
      // Tab titles
      allDocumentsTitle: 'Todos os Documentos - Disponível para Todos os Usuários',
      myDocumentsTitle: 'Meus Documentos - Seus Documentos',
      
      // Company-wide description
      companyWideDocuments: 'Documentos da empresa acessíveis a todos os funcionários',
      
      // Private storage description
      privateDocumentStorage: 'Armazenamento privado de documentos para usuários individuais',
    },
    libraries: {
      libraryManagementSystem: 'Sistema de Gerenciamento de Bibliotecas',
      organizeAndAccessLibraries: 'Organize e acesse suas bibliotecas de documentos com controle de acesso baseado em permissões',
      allLibraries: 'Todas as Bibliotecas',
      myLibraries: 'Minhas Bibliotecas',
      companyWideLibraries: 'Acesse bibliotecas que você tem permissão para visualizar',
      privateLibraryStorage: 'Suas bibliotecas',
      createLibrary: 'Criar Nova Biblioteca',
      libraryName: 'Nome da Biblioteca',
      libraryDescription: 'Descrição da Biblioteca',
      libraryMembers: 'Membros da Biblioteca',
      includeMyself: 'Incluir-me como membro',
      selectUsers: 'Selecionar Usuários',
      selectDepartments: 'Selecionar Departamentos',
      noMembers: 'Sem membros',
      permissionDenied: 'Você não tem permissão para acessar esta biblioteca',
      libraryNotFound: 'Biblioteca não encontrada',
      uploadFile: 'Enviar Arquivo',
      createFolder: 'Criar Pasta',
      deleteFile: 'Excluir Arquivo',
      editFile: 'Editar Arquivo',
      downloadFile: 'Baixar Arquivo',
      copyFile: 'Copiar Arquivo',
      moveFile: 'Mover Arquivo',
      renameFile: 'Renomear Arquivo',
      fileProperties: 'Propriedades do Arquivo',
      bulkOperations: 'Operações em Lote',
      searchFiles: 'Pesquisar arquivos...',
      sortBy: 'Ordenar por',
      viewMode: 'Modo de Visualização',
      listView: 'Visualização em Lista',
      gridView: 'Visualização em Grade',
      refresh: 'Atualizar',
      loading: 'Carregando...',
      noFiles: 'Nenhum arquivo neste local',
      selectLibrary: 'Selecione uma Biblioteca',
      chooseLibraryMessage: 'Escolha uma biblioteca da lista para visualizar e gerenciar seus arquivos',
      newLibrary: 'Nova Biblioteca',
      enterLibraryName: 'Digite o nome da biblioteca',
      enterLibraryDescription: 'Digite a descrição da biblioteca (opcional)',
      files: 'arquivos',
      createdBy: 'Criado por',
      members: 'membros',
      departments: 'departamentos',
      loadingLibraries: 'Carregando bibliotecas...',
      noLibrariesFound: 'Nenhuma biblioteca encontrada',
      createFirstLibrary: 'Crie sua primeira biblioteca para começar',
      libraryCreated: 'Biblioteca criada com sucesso',
      libraryCreationFailed: 'Falha ao criar biblioteca',
      pleaseEnterLibraryName: 'Por favor, digite o nome da biblioteca',
      selectUsersPlaceholder: 'Selecione usuários para adicionar à biblioteca',
      selectDepartmentsPlaceholder: 'Selecione departamentos para adicionar à biblioteca',
      librarySettings: 'Configurações da Biblioteca',
      libraryPermissions: 'Permissões da Biblioteca',
      libraryAccess: 'Acesso da Biblioteca',
      publicLibrary: 'Biblioteca Pública',
      privateLibrary: 'Biblioteca Privada',
      sharedLibrary: 'Biblioteca Compartilhada',
      libraryType: 'Tipo de Biblioteca',
      libraryVisibility: 'Visibilidade da Biblioteca',
      librarySharing: 'Compartilhamento da Biblioteca',
      libraryBackup: 'Backup da Biblioteca',
      libraryArchive: 'Arquivar Biblioteca',
      libraryRestore: 'Restaurar Biblioteca',
      libraryDelete: 'Excluir Biblioteca',
      libraryDeleteConfirm: 'Tem certeza de que deseja excluir esta biblioteca?',
      libraryDeleteWarning: 'Esta ação não pode ser desfeita. Todos os arquivos serão permanentemente excluídos.',
      libraryDeleteSuccess: 'Biblioteca excluída com sucesso',
      libraryDeleteFailed: 'Falha ao excluir biblioteca',
      libraryUpdate: 'Atualizar Biblioteca',
      libraryUpdateSuccess: 'Biblioteca atualizada com sucesso',
      libraryUpdateFailed: 'Falha ao atualizar biblioteca',
      libraryDuplicate: 'Duplicar Biblioteca',
      libraryExport: 'Exportar Biblioteca',
      libraryImport: 'Importar Biblioteca',
      librarySync: 'Sincronizar Biblioteca',
      libraryBackupSuccess: 'Biblioteca salva com sucesso',
      libraryBackupFailed: 'Falha ao salvar biblioteca',
      libraryRestoreSuccess: 'Biblioteca restaurada com sucesso',
      libraryRestoreFailed: 'Falha ao restaurar biblioteca',
      libraryArchiveSuccess: 'Biblioteca arquivada com sucesso',
      libraryArchiveFailed: 'Falha ao arquivar biblioteca',
      filesUploadedSuccess: 'Arquivos enviados com sucesso',
      failedToUploadFiles: 'Falha ao enviar arquivos',
      successfullyDeletedItems: 'Itens excluídos com sucesso',
      failedToDeleteSomeItems: 'Falha ao excluir alguns itens',
      itemsCopiedToClipboard: 'Itens copiados para a área de transferência',
      itemsCutToClipboard: 'Itens recortados para a área de transferência',
      addMember: 'Adicionar Membro',
      selectUser: 'Selecionar Usuário',
      pleaseSelectUser: 'Por favor, selecione um usuário',
      confirmRemoveMember: 'Tem certeza de que deseja remover este membro?',
      noResultsFound: 'Nenhum resultado encontrado',
      search: 'Pesquisar',
      edit: 'Editar',
      delete: 'Excluir',
      create: 'Criar',
      update: 'Atualizar',
      cancel: 'Cancelar',
      add: 'Adicionar',
      yes: 'Sim',
      no: 'Não',
      success: 'Sucesso',
      error: 'Erro',
      actions: 'Ações',
      memberAddedSuccess: 'Membro adicionado com sucesso',
      memberAddFailed: 'Falha ao adicionar membro',
      memberRemovedSuccess: 'Membro removido com sucesso',
      memberRemoveFailed: 'Falha ao remover membro',
      removeMemberConfirm: 'Tem certeza de que deseja remover este membro?',
      removeMemberWarning: 'Esta ação não pode ser desfeita.',
      remove: 'Remover',
              creator: 'Criador',
        overview: 'Visão Geral',
        backToLibraries: 'Voltar às Bibliotecas',
        manageMembers: 'Gerenciar Membros',
        editLibrary: 'Editar Biblioteca',
        libraryInfo: 'Informações da Biblioteca',
        files: 'Arquivos',
        manageFiles: 'Gerenciar Arquivos',
        fileManagement: 'Gerenciamento de Arquivos',
        search: 'Pesquisar',
        refresh: 'Atualizar',
        noLibrariesFound: 'Nenhuma biblioteca encontrada',
        noResultsFound: 'Nenhum resultado encontrado',
        libraryUpdate: 'Atualizar Biblioteca',
        pleaseEnterLibraryName: 'Por favor, insira o nome da biblioteca',
        enterLibraryName: 'Insira o nome da biblioteca',
        libraryDescription: 'Descrição',
        enterLibraryDescription: 'Insira a descrição da biblioteca',
        libraryMembers: 'Membros',
        selectUsersPlaceholder: 'Selecione usuários para adicionar como membros',
        create: 'Criar',
        cancel: 'Cancelar',
        update: 'Atualizar',
        selectUser: 'Selecionar Usuário',
        pleaseSelectUser: 'Por favor, selecione um usuário',
        add: 'Adicionar',
        noMembers: 'Nenhum membro encontrado',
        selectLibraryFirst: 'Por favor, selecione uma biblioteca primeiro',
    },
    files: {
      myFiles: 'Meus Arquivos',
      libraries: 'Bibliotecas',
      createLibrary: 'Criar Biblioteca',
      libraryName: 'Nome da Biblioteca',
      libraryDescription: 'Descrição da Biblioteca',
      permissions: 'Permissões',
      selectLibrary: 'Selecionar Biblioteca',
      fileDescription: 'Descrição do Arquivo',
      fileName: 'Nome do Arquivo',
      fileSize: 'Tamanho do Arquivo',
      uploadedBy: 'Enviado por',
      uploadedAt: 'Enviado em',
      downloadFile: 'Baixar Arquivo',
      viewFile: 'Ver Arquivo',
      deleteFile: 'Excluir Arquivo',
      managePermissions: 'Gerenciar Permissões',
      libraryMembers: 'Membros da Biblioteca',
      selectMembers: 'Selecionar Membros',
      addMembers: 'Adicionar Membros',
      individuals: 'Indivíduos',
      departments: 'Departamentos',
      includeMyself: 'Incluir-me',
      selectUsers: 'Selecionar Usuários',
      selectDepartments: 'Selecionar Departamentos',
      memberPermissions: 'Permissões do Membro',
      canRead: 'Pode Ler',
      canWrite: 'Pode Escrever',
      canDelete: 'Pode Excluir',
      owner: 'Proprietário',
      noMembers: 'Nenhum Membro',
      uploadProgress: 'Progresso do Upload',
      noFilesFound: 'Nenhum arquivo encontrado',
      createFolder: 'Criar Pasta',
      name: 'Nome',
      size: 'Tamanho',
      modified: 'Modificado',
      actions: 'Ações',
      list: 'Lista',
      grid: 'Grade',
      tree: 'Árvore',
      sortByName: 'Ordenar por Nome',
      sortByDate: 'Ordenar por Data',
      sortBySize: 'Ordenar por Tamanho',
      sortByType: 'Ordenar por Tipo',
      newFolder: 'Nova Pasta',
      upload: 'Enviar',
      documents: 'Documentos',
      userFiles: 'Arquivos do Usuário',
      view: 'Ver',
      download: 'Baixar',
      rename: 'Renomear',
      delete: 'Excluir',
      deleteConfirm: 'Tem certeza de que deseja excluir este item?',
      createNewFolder: 'Criar Nova Pasta',
      createFolderIn: 'Criar pasta em',
      renameItem: 'Renomear Item',
      folderName: 'Nome da Pasta',
      enterFolderName: 'Digite o nome da pasta',
      description: 'Descrição',
      optionalDescription: 'Descrição opcional',
      newName: 'Novo Nome',
      enterName: 'Digite o nome',
      enterNewName: 'Digite o novo nome',
      uploadFiles: 'Enviar Arquivos',
      uploadDragText: 'Arraste arquivos aqui ou clique para selecionar',
      uploadHint: 'Suporte para upload único ou em massa',
      // Bulk operations
      copy: 'Copiar',
      move: 'Mover',
      cut: 'Recortar',
      paste: 'Colar',
      properties: 'Propriedades',
      editDocument: 'Editar Documento',
      clearSelection: 'Limpar Seleção',
      selected: 'Selecionado',
      items: 'itens',
      copySelected: 'Copiar Selecionados',
      moveSelected: 'Mover Selecionados',
      deleteSelected: 'Excluir Selecionados',
      copySelectedItems: 'Copiar Itens Selecionados',
      moveSelectedItems: 'Mover Itens Selecionados',
      selectTargetFolderCopy: 'Selecione uma pasta de destino para copiar os itens selecionados:',
      selectTargetFolderMove: 'Selecione uma pasta de destino para mover os itens selecionados:',
      copyToRoot: 'Copiar para Raiz',
      moveToRoot: 'Mover para Raiz',
      root: 'Raiz',
      bulkCopyItems: 'Copiar Itens Selecionados',
      bulkMoveItems: 'Mover Itens Selecionados',
      selectTargetFolderForBulkCopy: 'Selecione uma pasta de destino para copiar os itens selecionados:',
      selectTargetFolderForBulkMove: 'Selecione uma pasta de destino para mover os itens selecionados:',
      successfullyDeletedItems: '{{count}} item(s) excluído(s) com sucesso',
      failedToDeleteSomeItems: 'Falha ao excluir alguns itens',
      // Document types
      folder: 'Pasta',
      // File sharing
      shareFile: 'Compartilhar Arquivo',
      shareFileDescription: 'Compartilhar "{fileName}" com usuários da sua sucursal ou de outras sucursais',
      shareFileWithExternalSucursal: 'Compartilhar Arquivo com Sucursal Externa',
      document: 'Documento',
      image: 'Imagem',
      pdf: 'PDF',
      spreadsheet: 'Planilha',
      text: 'Texto',
      file: 'Arquivo',
      // Status messages
      folderCreatedSuccess: 'Pasta criada com sucesso',
      documentCreatedSuccess: 'Documento criado com sucesso',
      documentUpdatedSuccess: 'Documento atualizado com sucesso',
      itemRenamedSuccess: 'Item renomeado com sucesso',
      itemCopiedSuccess: 'Item copiado com sucesso',
      itemMovedSuccess: 'Item movido com sucesso',
      itemDeletedSuccess: 'Item excluído com sucesso',
      filesUploadedSuccess: 'Arquivos enviados com sucesso',
      bulkCopySuccess: '{{count}} item(ns) copiado(s) com sucesso',
      bulkMoveSuccess: '{{count}} item(ns) movido(s) com sucesso',
      bulkDeleteSuccess: '{{count}} item(ns) excluído(s) com sucesso',
      documentExportedSuccess: 'Documento exportado como HTML com sucesso',
      // Error messages
      failedToLoadDocuments: 'Falha ao carregar documentos',
      failedToCreateFolder: 'Falha ao criar pasta',
      failedToCreateDocument: 'Falha ao criar documento',
      failedToUpdateDocument: 'Falha ao atualizar documento',
      failedToUploadFiles: 'Falha ao enviar arquivos',
      failedToDeleteItem: 'Falha ao excluir item',
      failedToRenameItem: 'Falha ao renomear item',
      failedToCopyItem: 'Falha ao copiar item',
      failedToMoveItem: 'Falha ao mover item',
      failedToPasteItem: 'Falha ao colar item',
      failedBulkCopy: 'Falha ao preparar cópia em massa',
      failedBulkMove: 'Falha ao preparar movimentação em massa',
              failedToGeneratePdf: 'Falha ao gerar PDF',
        itemNotFound: 'Item não encontrado',
        failedToLoadDocumentContent: 'Falha ao carregar conteúdo do documento',
      // UI labels
      goBack: 'Voltar',
      goForward: 'Avançar',
      sortOrder: 'Ordem de Classificação',
      refresh: 'Atualizar',
      searchDocuments: 'Pesquisar documentos...',
      noDocumentsFound: 'Nenhum documento encontrado',
                exportAsPdf: 'Exportar como PDF',
      characters: 'Caracteres',
      words: 'Palavras',
      richTextEditorPoweredByQuill: 'Editor de Texto Rico alimentado por Quill',
      loadingEditor: 'Carregando editor...',
      documentTitle: 'Título do Documento',
      startTypingDocument: 'Comece a digitar seu documento...',
      pleaseEnterDocumentTitle: 'Por favor, digite um título para o documento',
      pleaseEnterContent: 'Por favor, digite algum conteúdo',
      pleaseAddContentBeforePdf: 'Por favor, adicione algum conteúdo antes de gerar o PDF',
      home: 'Início',
      type: 'Tipo',
      owner: 'Proprietário',
      created: 'Criado',
      lastModified: 'Última Modificação',
      subfolders: 'Subpastas',
      files: 'Arquivos',
      mimeType: 'Tipo MIME',
      unknown: 'Desconhecido',
      areYouSureDelete: 'Tem certeza de que deseja excluir este item?',
      yes: 'Sim',
      no: 'Não',
      cancel: 'Cancelar',
      close: 'Fechar',
      save: 'Salvar',
      export: 'Exportar',
      noDescription: 'Sem descrição',
      targetFolder: 'Pasta de Destino',
      pleaseSelectTargetFolder: 'Por favor, selecione a pasta de destino',
      pleaseEnterFolderName: 'Por favor, digite o nome da pasta',
      pleaseEnterNewName: 'Por favor, digite o novo nome',
      createNewDocument: 'Criar Novo Documento',
    sendDocument: 'Enviar Documento',
      itemProperties: 'Propriedades do Item',
      copyItem: 'Copiar Item',
      moveItem: 'Mover Item',
      renameItem: 'Renomear Item',
      by: 'Por',
      copyText: 'Copiar',
      moveText: 'Mover',
      deleteSelectedText: 'Excluir Selecionados',
      // File shares modal
      fileShares: 'Partilhas do Ficheiro',
      fileSharedWith: 'Este ficheiro foi partilhado com',
      fileSharedBy: 'Partilhado por',
      sharedAt: 'Partilhado em',
      message: 'Mensagem',
      remoteShare: 'Partilha remota',
      noSharesFound: 'Nenhuma partilha encontrada para este ficheiro',
      loadingShares: 'A carregar partilhas...',
      fileSharedSuccessfully: 'Ficheiro partilhado com sucesso!',
      // Clipboard messages
      itemCutToClipboard: '{{name}} cortado para a área de transferência',
      itemCopiedToClipboard: '{{name}} copiado para a área de transferência',
      itemPastedSuccess: '{{name}} colado com sucesso',
      itemsCutToClipboard: '{{count}} itens cortados para a área de transferência',
      itemsCopiedToClipboard: '{{count}} itens copiados para a área de transferência',
      itemsPastedSuccess: '{{count}} itens colados com sucesso',
      paste: 'Colar',
      cut: 'Cortar',
    },
    scanner: {
      title: 'Scanner',
      description: 'Scanner documentos e gere PDFs',
      scanDocument: 'Scanner Documento',
      takePhoto: 'Tirar Foto',
      addPage: 'Adicionar Página',
      removePage: 'Remover Página',
      generatePdf: 'Gerar PDF',
      savePdf: 'Salvar PDF',
      scanningTips: 'Dicas de Digitalização',
      goodLighting: 'Boa Iluminação',
      keepFlat: 'Manter Plano',
      avoidShadows: 'Evitar Sombras',
      centerDocument: 'Centralizar Documento',
      adjustBorders: 'Ajustar Bordas',
      camera: 'Câmera',
      startCamera: 'Iniciar Câmera',
      startCameraHint: 'Clique em "Iniciar Câmera" para começar a scanner',
      stopCamera: 'Parar Câmera',
      scannedPages: 'Páginas Digitalizadas',
      noPagesScanned: 'Nenhuma página digitalizada',
      page: 'Página',
      view: 'Ver',
      "delete": 'Excluir',
      fileName: 'Nome do Arquivo',
      fileNamePlaceholder: 'Digite o nome do arquivo (sem extensão)',
      captureSuccess: 'Página capturada com sucesso!',
      pdfGenerated: 'PDF gerado com sucesso!',
      pdfGenerationFailed: 'Falha ao gerar PDF. Tente novamente.',
      captureAtLeastOnePage: 'Por favor, capture pelo menos uma página antes de gerar o PDF.',
      enterFileName: 'Por favor, digite um nome de arquivo.',
      cameraAccessError: 'Não foi possível acessar a câmera. Verifique as permissões.',
      // Additional scanner keys
      useDeviceCamera: 'Use a câmera do seu dispositivo para scanner documentos e convertê-los em PDF.',
      convertToPdf: 'Converter para PDF',
      scanningTipsTitle: 'Dicas de Digitalização',
      ensureGoodLighting: '• Garanta boa iluminação para melhor qualidade',
      keepDocumentFlat: '• Mantenha o documento plano e estável',
      avoidShadowsGlare: '• Evite sombras e brilho',
      centerDocumentFrame: '• Centralize o documento no quadro',
      cameraSection: 'Câmera',
      scannedPagesSection: 'Páginas Digitalizadas',
      pdfGenerationSection: 'Geração de PDF',
      fileNameLabel: 'Nome do Arquivo *',
      fileNameRequired: 'Nome do arquivo é obrigatório',
      enterFileNameWithoutExtension: 'Digite o nome do arquivo (sem extensão)',
      generatePdfButton: 'Gerar PDF',
      generatingPdf: 'Gerando PDF...',
      processingPages: 'Processando',
      pageSingular: 'página',
      pagePlural: 'páginas',
      noPagesScannedYet: 'Nenhuma página digitalizada ainda',
      clickStartCamera: 'Clique em "Iniciar Câmera"',
      toBeginScanning: 'para começar a scanner',
      pageNumber: 'Página',
      movePageUp: 'Mover para cima',
      movePageDown: 'Mover para baixo',
      previewModal: 'Visualização',
      unableToAccessCamera: 'Não foi possível acessar a câmera.',
      checkPermissions: 'Verifique as permissões.',
      pageCapturedSuccessfully: 'Página capturada com sucesso!',
      pleaseCaptureOnePage: 'Por favor, capture pelo menos uma página antes de gerar o PDF.',
      pleaseEnterFileName: 'Por favor, digite um nome de arquivo.',
      pdfGeneratedSuccessfully: 'PDF "{fileName}.pdf" gerado com sucesso!',
      failedToGeneratePdf: 'Falha ao gerar PDF. Tente novamente.',
      tryAgain: 'Tente novamente',
    },
    sucursal: {
      management: 'Gerenciamento de Sucursal',
      manageSucursals: 'Gerenciar e monitorar servidores de filiais em todas as localizações',
      addSucursal: 'Adicionar Nova Sucursal',
      sucursalName: 'Nome da Sucursal',
      serverUrl: 'URL do Servidor',
      description: 'Descrição',
      totalSucursals: 'Total de Sucursais',
      online: 'Online',
      offline: 'Offline',
      avgUptime: 'Tempo Médio de Atividade',
      responseTime: 'Tempo de Resposta',
      uptime: 'Tempo de Atividade',
      healthStatus: 'Status de Saúde',
      serverLogs: 'Logs do Servidor',
      actions: 'Ações',
      refreshStatus: 'Atualizar Status',
      configuration: 'Configuração',
      viewInBrowser: 'Ver no Navegador',
      basicInformation: 'Informações Básicas',
      currentStatus: 'Status Atual',
      createdBy: 'Criado Por',
      createSucursal: 'Criar Sucursal',
      editSucursal: 'Editar Sucursal',
      updateSucursal: 'Atualizar Sucursal',
      confirmDelete: 'Confirmar Exclusão',
      confirmDeleteMessage: 'Tem certeza que deseja excluir esta sucursal? Esta ação não pode ser desfeita.',
      cancel: 'Cancelar',
      addNewSucursal: 'Adicionar Nova Sucursal',
      enterSucursalName: 'Digite o nome da sucursal',
      enterServerUrl: 'Digite a URL do servidor',
      enterDescription: 'Digite a descrição',
      pleaseEnterSucursalName: 'Por favor, digite o nome da sucursal',
      pleaseEnterServerUrl: 'Por favor, digite a URL do servidor',
      pleaseEnterDescription: 'Por favor, digite a descrição',
      pleaseEnterValidUrl: 'Por favor, digite uma URL válida',
      pleaseEnterLocation: 'Por favor, digite a localização',
      enterLocation: 'Digite a localização',
      sucursalWithNameOrUrlExists: 'Sucursal com este nome ou URL já existe',
      refreshStatusTooltip: 'Atualizar Status',
      viewDetailsTooltip: 'Ver Detalhes',
      errorsLogged: 'erro(s) registrado(s)',
      time: 'Tempo',
      details: 'Detalhes',
      createdAt: 'Criado em',
      location: 'Localização',
      status: 'Status',
      errorCount: 'Contagem de Erros',
      ping: 'Ping',
      pingSucursal: 'Ping Sucursal',
      pingSuccess: 'Ping realizado com sucesso',
      pingFailed: 'Falha no ping',
      serverUnreachable: 'Servidor inacessível',
      connectionTest: 'Teste de Conexão',
      testConnection: 'Testar Conexão',
      connectionSuccess: 'Conexão bem-sucedida',
      connectionFailed: 'Falha na conexão',
      latency: 'Latência',
      ms: 'ms',
      percent: '%',
      na: 'N/A',
      accessDenied: 'Acesso negado',
      name: 'Nome',
      url: 'URL',
      errorType: 'Tipo de Erro',
      description: 'Descrição',
    },
    profile: {
      title: 'Perfil do Usuário',
      description: 'Gerencie suas informações pessoais, configurações de conta e segurança',
      editProfile: 'Editar Perfil',
      updateProfile: 'Atualizar Perfil',
      cancel: 'Cancelar',
      personalInfo: 'Informações Pessoais',
      accountInfo: 'Informações da Conta',
      security: 'Segurança',
      fullName: 'Nome Completo',
      email: 'E-mail',
      phone: 'Telefone',
      address: 'Endereço',
      department: 'Departamento',
      memberSince: 'Membro desde',
      lastLogin: 'Último Acesso',
      userId: 'ID do Usuário',
      never: 'Nunca',
      noDepartment: 'Sem departamento',
      enterFullName: 'Digite o nome completo',
      enterEmail: 'Digite o e-mail',
      enterPhone: 'Digite o telefone',
      enterAddress: 'Digite o endereço',
      selectDepartment: 'Selecione o departamento',
      changePassword: 'Alterar Senha',
      currentPassword: 'Senha Atual',
      newPassword: 'Nova Senha',
      confirmPassword: 'Confirmar Senha',
      enterCurrentPassword: 'Digite a senha atual',
      enterNewPassword: 'Digite a nova senha',
      confirmNewPassword: 'Confirme a nova senha',
      passwordRequirements: 'A senha deve ter pelo menos 8 caracteres',
      passwordsDoNotMatch: 'As senhas não coincidem',
      clickToChange: 'Clique para alterar',
      uploadingAvatar: 'Carregando avatar',
      onlyImageFiles: 'Apenas arquivos de imagem são permitidos',
      imageSizeLimit: 'O arquivo deve ter menos de 2MB',
      avatarUploaded: 'Avatar carregado com sucesso',
      failedToUploadAvatar: 'Falha ao carregar avatar',
      profileUpdated: 'Perfil Atualizado',
      profileUpdateSuccess: 'Seu perfil foi atualizado com sucesso',
      failedToUpdateProfile: 'Falha ao atualizar perfil',
      updateError: 'Erro ao atualizar perfil',
      passwordChanged: 'Senha Alterada',
      passwordChangeSuccess: 'Sua senha foi alterada com sucesso',
      failedToChangePassword: 'Falha ao alterar senha',
      passwordChangeError: 'Erro ao alterar senha',
      passwordSecurity: 'Segurança da Senha',
      passwordSecurityDescription: 'Mantenha sua senha segura e altere-a regularmente',
      departmentChangeInfo: 'Alteração de Departamento',
      departmentChangeDescription: 'Apenas administradores podem alterar departamentos. Entre em contato com o suporte se necessário.',
      roleDescriptions: {
        superAdmin: 'Super Administrador com acesso total ao sistema',
        admin: 'Administrador com permissões elevadas',
        supervisor: 'Supervisor com permissões de equipe',
        user: 'Usuário padrão com acesso básico',
        developer: 'Desenvolvedor com acesso completo ao sistema',
      },
      validation: {
        required: 'Este campo é obrigatório',
        email: 'Digite um e-mail válido',
      },
    },
  },
  en: {
    navigation: {
      dashboard: 'Dashboard',
      homepage: 'Home',
      reports: 'Reports',
      submitReports: 'Submit Reports',
      viewReports: 'View Reports',
      goals: 'Goals',
      viewGoals: 'View Goals',
      createGoals: 'Create Goals',
      editGoals: 'Edit Goals',
      scanner: 'Scanner',


      fileManagement: 'File Management',
      libraries: 'Libraries',
      documents: 'Documents',
      management: 'Management',
      users: 'Users',
      departments: 'Departments',
      sucursals: 'Sucursals',
      generalPanel: 'General Panel',
      notifications: 'Notifications',
      requests: 'Requests',
      profile: 'Profile',
    },
    common: {
      login: 'Login',
      logout: 'Logout',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      create: 'Create',
      upload: 'Upload',
      download: 'Download',
      search: 'Search',
      filter: 'Filter',
      approve: 'Approve',
      reject: 'Reject',
      pending: 'Pending',
      completed: 'Completed',
      active: 'Active',
      inactive: 'Inactive',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      submit: 'Submit',
      close: 'Close',
      open: 'Open',
      yes: 'Yes',
      no: 'No',
      reload: 'Reload',
      refresh: 'Refresh',
      platformName: 'Totalizer Platform',
      approved: 'Approved',
      rejected: 'Rejected',
      response: 'Response',
      all: 'All',
      status: 'Status',
      required: 'This field is required',
      accessDenied: 'Access denied',
      startDate: 'Start Date',
      endDate: 'End Date',
          department: 'Department',
    logoutSuccess: 'Logged out successfully',
    logoutError: 'Error during logout, but session cleared',
  },
    auth: {
      welcomeBack: 'Welcome back',
      enterCredentials: 'Enter your credentials to access',
      email: 'Email',
      password: 'Password',
      rememberMe: 'Remember me',
      forgotPassword: 'Forgot password?',
      dontHaveAccount: 'Don\'t have an account?',
      signUp: 'Sign Up',
      createAccount: 'Create Account',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      department: 'Department',
      selectDepartment: 'Select a department',
      userType: 'User Type',
      requestAccess: 'Request Access',
      accountRequested: 'Account Requested',
      waitingApproval: 'Waiting for administrator approval',
      invalidCredentials: 'Invalid credentials',
      loginFailed: 'Login failed',
      checkFormFields: 'Please check the form fields and try again.',
      passwordTooShort: 'Password must be at least 6 characters',
      passwordsDoNotMatch: 'Passwords do not match',
      registrationFailed: 'Registration failed',
      emailRequired: 'Email is required',
      invalidEmailFormat: 'Invalid email format',
      passwordRequired: 'Password is required',
      confirmPasswordRequired: 'Confirm password is required',
      departmentRequired: 'Department is required',
    },
    dashboard: {
      welcomeTo: 'Welcome to',
      totalUsers: 'Total Users',
      storedFiles: 'Stored Files',
      recentActivity: 'Recent Activity',
      pendingReports: 'Pending Reports',
      activeGoals: 'Active Goals',
      newUsers: 'New Users',
      quickActions: 'Quick Actions',
      addFiles: 'Add Files',
      createLibrary: 'Create Library',
      scanDocument: 'Scan Document',
      submitReport: 'Submit Report',
      companyOverview: 'Company Overview',
      newUsersThisMonth: 'New Users This Month',
      storageUsage: 'Storage Usage',
      reportsResponseRate: 'Reports Response Rate',
      libraries: 'Libraries',
      documents: 'Documents',
      // Additional dashboard keys
      title: 'Dashboard',
      welcomeBack: 'Welcome back, {name}! Here\'s what\'s happening in your system.',
      statistics: {
        totalUsers: 'Total Users',
        activeUsers: 'Active Users',
        adminUsers: 'Admin Users (Admin + Super Admin)',
        pendingUsers: 'Pending Users'
      },
      quickActions: {
        title: 'Quick Actions',
        goToDocuments: 'Go to Documents',
        goToLibraries: 'Go to Libraries',
        scanner: 'Scanner'
      },
      systemInfo: {
        title: 'System Information',
        platformVersion: 'Platform Version',
        databaseStatus: 'Database Status',
        lastBackup: 'Last Backup',
        systemHealth: 'System Health',
        activeSessions: 'Active Sessions'
      },
      notifications: {
        title: 'Recent Notifications',
        refresh: 'Refresh',
        noNotifications: 'No notifications found',
        columns: {
          type: 'Type',
          title: 'Title',
          description: 'Description',
          date: 'Date',
          status: 'Status'
        },
        status: {
          read: 'Read',
          unread: 'Unread'
        }
      },
      userStats: {
        title: 'Users by Role',
        regularUsers: 'Regular Users',
        supervisors: 'Supervisors',
        admins: 'Admins',
        superAdmins: 'Super Admins',
        developers: 'Developers'
      },
      systemOverview: {
        title: 'System Overview',
        totalDepartments: 'Total Departments',
        inactiveUsers: 'Inactive Users',
        userGrowth: 'User Growth',
        systemLoad: 'System Load'
      },
      systemStatus: {
        connected: 'Connected',
        version: 'v1.0.0',
        backupTime: 'Today 02:00 AM'
      },
      recentDocuments: {
        title: 'Recent Documents',
        refresh: 'Refresh',
        noDocuments: 'No recent documents found',
        uploadedBy: 'Uploaded by',
        columns: {
          name: 'Name',
          uploadedBy: 'Uploaded by',
          date: 'Date',
          actions: 'Actions'
        },
        openFolder: 'Open Folder',
        downloadFile: 'Download File'
      }
    },
    departments: {
      title: 'Departments',
      name: 'Name',
      description: 'Description',
      supervisor: 'Supervisor',
      usersCount: 'Users Count',
      createdAt: 'Created At',
      actions: 'Actions',
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      cancel: 'Cancel',
      addDepartment: 'Add Department',
      editDepartment: 'Edit Department',
      createDepartment: 'Create Department',
      departmentName: 'Department Name',
      departmentDescription: 'Department Description',
      selectSupervisor: 'Select Supervisor',
      noSupervisor: 'No Supervisor',
      selectDepartmentFirst: 'Select Department First',
      supervisorNote: 'Supervisors can be assigned to any active user with Supervisor, Admin, or Super Admin roles',
      confirmDelete: 'Are you sure you want to delete this department?',
      users: 'users',
      manageDepartments: 'Manage Departments',
      departmentManagement: 'Department Management',
    },
    users: {
      title: 'Users',
      create: 'Create',
      edit: 'Edit',
      delete: 'Delete',
      passwordReset: 'Password Reset',
      temporaryPassword: 'Temporary Password',
      emailSent: 'Email sent with new password',
      promoteToSuperAdmin: 'Promote to Super Admin',
      removeUser: 'Remove User',
      resetPassword: 'Reset Password',
      userFiles: 'User Files',
      exportUsers: 'Export Users',
      totalUsers: 'Total Users',
      superAdmins: 'Super Admins',
      admins: 'Admins',
      supervisors: 'Supervisors',
      normalUsers: 'Normal Users',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      userDetails: 'User Details',
      role: 'Role',
      department: 'Department',
      phone: 'Phone',
      createdAt: 'Created At',
      actions: 'Actions',
      usersList: 'Users List',
      userManagement: 'User Management',
      manageUsers: 'Manage Users',
      selectDepartment: 'Select Department',
      selectRole: 'Select Role',
      selectStatus: 'Select Status',
      setAsDepartmentAdmin: 'Set as Department Admin',
      managedDepartments: 'Managed Departments',
      departmentAdminDescription: 'Department admins have additional permissions to manage members and goals of the department',
      userForm: 'User Form',
      editUser: 'Edit User',
      viewFiles: 'View Files',
      promoteToSupervisor: 'Promote to Department Supervisor',
      name: 'Name',
      email: 'Email',
      lastLogin: 'Last Login',
      user: 'User',
      createUser: 'Create User',
      enterUserName: 'Enter user name',
      enterEmailAddress: 'Enter email address',
      selectRole: 'Select Role',
      selectDepartment: 'Select Department',
      selectStatus: 'Select Status',
      enterPhoneNumber: 'Enter phone number',
      selectDepartmentsToManage: 'Select departments to manage',
      files: 'Files',
      folders: 'Folders',
      createFolder: 'Create Folder',
      uploadFile: 'Upload File',
      folderName: 'Folder Name',
      enterFolderName: 'Enter folder name',
      fileSize: 'File Size',
      lastModified: 'Last Modified',
      noFiles: 'No files found',
      noFolders: 'No folders found',
      rootFolder: 'Root Folder',
      searchByName: 'Search by name',
      filterByStatus: 'Filter by status',
      filterByDepartment: 'Filter by department',
      promoteToSupervisor: 'Promote to Department Supervisor',
      removeUserConfirm: 'Confirm Removal',
      removeUserWarning: 'Are you sure you want to remove this user? This action cannot be undone.',
      viewingFilesFor: 'Viewing files for',
      fileManagerDescription: 'Browse and manage user\'s personal files and folders',
      userTypes: {
        SUPER_ADMIN: 'Super Administrator',
        ADMIN: 'Administrator',
        USER: 'User',
        SUPERVISOR: 'Supervisor',
        DEVELOPER: 'Developer'
      },
    },
    notifications: {
      notifications: 'Notifications',
      markAsRead: 'Mark as Read',
      markAllAsRead: 'Mark All as Read',
      noNotifications: 'No notifications',
      noUnreadNotifications: 'No unread notifications',
      noReadNotifications: 'No read notifications',
      all: 'All',
      unread: 'Unread',
      read: 'Read',
      stayUpdated: 'Stay updated with important platform activities',
      delete: 'Delete',
      timeAgo: {
        justNow: 'Just now',
        minutesAgo: 'm ago',
        hoursAgo: 'h ago',
        daysAgo: 'd ago',
      },
      types: {
        reportSubmitted: 'Report Submitted',
        goalUpdated: 'Goal Updated',
        userRequest: 'User Request',
        systemAlert: 'System Alert',
        newFile: 'New File',
        responseReceived: 'Response Received',
      },
    },
    requests: {
      title: 'Requests',
      type: 'Type',
      priority: 'Priority',
      by: 'by',
      viewDetails: 'View Details',
      quickApprove: 'Quick Approve',
      quickReject: 'Quick Reject',
      requestDetails: 'Request Details',
      requestInformation: 'Request Information',
      reviewRequests: 'Review and manage user requests for accounts, access, and support',
      allRequests: 'All Requests',
      myRequests: 'My Requests',
      userRequests: 'User Requests',
      pendingRequests: 'Pending Requests',
      approvedRequests: 'Approved Requests',
      rejectedRequests: 'Rejected Requests',
      updateRequest: 'Update Request',
      reviewedAt: 'Reviewed At',
      reviewedBy: 'Reviewed By',
      userRequestsManagement: 'User Request Management',
      pending: 'Pending',
      inReview: 'In Review',
      approved: 'Approved',
      rejected: 'Rejected',
      createRequest: 'Create Request',
      requestType: 'Request Type',
      requestTitle: 'Request Title',
      requestDescription: 'Request Description',
      submitRequest: 'Submit Request',
      requestSubmitted: 'Request submitted successfully',
      approveRequest: 'Approve Request',
      rejectRequest: 'Reject Request',
      requestedBy: 'Requested By',
      requestedAt: 'Requested At',
      requestReason: 'Request Reason',
    },
    sucursal: {
      management: 'Sucursal Management',
      manageSucursals: 'Manage and monitor servers at all locations',
      addSucursal: 'Add New Sucursal',
      sucursalName: 'Sucursal Name',
      serverUrl: 'Server URL',
      description: 'Description',
      totalSucursals: 'Total Sucursals',
      online: 'Online',
      offline: 'Offline',
      avgUptime: 'Average Uptime',
      responseTime: 'Response Time',
      uptime: 'Uptime',
      healthStatus: 'Health Status',
      serverLogs: 'Server Logs',
      actions: 'Actions',
      refreshStatus: 'Refresh Status',
      configuration: 'Configuration',
      viewInBrowser: 'View in Browser',
      basicInformation: 'Basic Information',
      currentStatus: 'Current Status',
      createdBy: 'Created By',
      createSucursal: 'Create Sucursal',
      editSucursal: 'Edit Sucursal',
      updateSucursal: 'Update Sucursal',
      confirmDelete: 'Confirm Delete',
      confirmDeleteMessage: 'Are you sure you want to delete this sucursal? This action cannot be undone.',
      cancel: 'Cancel',
      // Additional keys for the component
      addNewSucursal: 'Add New Sucursal',
      enterSucursalName: 'Enter sucursal name',
      enterServerUrl: 'Enter server URL',
      enterDescription: 'Enter description',
      pleaseEnterSucursalName: 'Please enter sucursal name',
      pleaseEnterServerUrl: 'Please enter server URL',
      pleaseEnterDescription: 'Please enter description',
      pleaseEnterValidUrl: 'Please enter a valid URL',
      pleaseEnterLocation: 'Please enter location',
      enterLocation: 'Enter location',
      sucursalWithNameOrUrlExists: 'Sucursal with this name or URL already exists',
      refreshStatusTooltip: 'Refresh Status',
      viewDetailsTooltip: 'View Details',
      errorsLogged: 'error(s) logged',
      time: 'Time',
      details: 'Details',
      createdAt: 'Created At',
      location: 'Location',
      status: 'Status',
      errorCount: 'Error Count',
      ping: 'Ping',
      pingSucursal: 'Ping Sucursal',
      pingSuccess: 'Ping successful',
      pingFailed: 'Ping failed',
      serverUnreachable: 'Server unreachable',
      connectionTest: 'Connection Test',
      testConnection: 'Test Connection',
      connectionSuccess: 'Connection successful',
      connectionFailed: 'Connection failed',
      latency: 'Latency',
      ms: 'ms',
      percent: '%',
      na: 'N/A',
      accessDenied: 'Access denied',
      name: 'Name',
      url: 'URL',
      errorType: 'Error Type',
      description: 'Description',
    },
    reports: {
      submitReport: 'Submit Report',
      reportType: 'Report Type',
      title: 'Title',
      description: 'Description',
      attachFiles: 'Attach Files',
      selectSupervisor: 'Select Supervisor',
      selectSupervisors: 'Select Supervisors',
      selectSupervisorsPlaceholder: 'Select supervisors',
      reportSubmitted: 'Report Submitted',
      myReports: 'My Reports',
      teamReports: 'Team Reports',
      allReports: 'All Reports',
      reportDetails: 'Report Details',
      respond: 'Respond',
      response: 'Response',
      status: 'Status',
      submittedBy: 'Submitted By',
      submittedAt: 'Submitted At',
      type: 'Type',
      blocked: 'Blocked',
      onHold: 'On Hold',
      respondedAt: 'Responded At',
      viewReports: 'View Reports',
      // New translations
      submitReportDescription: 'Submit your report to your supervisor for review and feedback.',
      selectReportType: 'Select report type',
      selectSupervisorPlaceholder: 'Select supervisor',
      pleaseSelectReportType: 'Please select a report type',
      pleaseSelectSupervisor: 'Please select a supervisor',
      reportTitlePlaceholder: 'Enter report title',
      reportDescriptionPlaceholder: 'Enter report description',
      failedToLoadSupervisors: 'Failed to load supervisors',
      failedToSubmitReport: 'Failed to submit report',
      uploadProgress: 'Upload Progress',
      uploadingFiles: 'Uploading files',
      uploadComplete: 'Upload complete',
      shareGoal: 'Share Goal',
      goalPublished: 'Goal published successfully',
      failedToPublishGoal: 'Failed to publish goal',
      goalSharedSuccessfully: 'Goal shared successfully',
      failedToShareGoal: 'Failed to share goal',
      failedToLoadUsers: 'Failed to load users',
      shareGoalInfo: 'Share Goal Complete',
      shareGoalDescription: 'You can share this completed goal with super administrators.',
      selectUsersToShare: 'Select Users to Share',
      selectUsers: 'Select users',
      message: 'Message',
      shareMessagePlaceholder: 'Enter an optional message...',
      sharing: 'Sharing',
      pleaseSelectUsers: 'Please select at least one user',
      // Cross-sucursal sharing
      shareCompletedGoalWithExternalSucursal: 'Share Completed Goal with External Sucursal',
      shareCompletedGoalDescription: 'Share the completed goal "{goalName}" with users from other sucursals for cross-organizational collaboration',
      sharedWithYou: 'Shared With You',
      sharedBy: 'Shared by',
      sharedOn: 'Shared on',
      sharingInfo: 'Sharing Information',
      publishGoal: 'Publish Goal',
      publish: 'Publish',
      pending: 'Pending',
      responded: 'Responded',
      archived: 'Archived',
      allReportsTab: 'All',
      pendingTab: 'Pending',
      respondedTab: 'Responded',
      archivedTab: 'Archived',
      loadingUserData: 'Loading user data...',
      actions: 'Actions',
      viewReport: 'View Report',
      respondToReport: 'Respond to Report',
      submitResponse: 'Submit Response',
      responseModalTitle: 'Respond to Report',
      writeResponse: 'Write your response',
      reportResponseSubmitted: 'Response submitted successfully!',
      failedToRespond: 'Failed to respond to report',
      noReportsFound: 'No reports found',
      clickToUploadFiles: 'Click to upload files',
      supportedFormats: 'Supported formats: PDF, DOC, DOCX, XLS, XLSX, PNG, JPG (Max 10MB each)',
      pleaseEnterTitle: 'Please enter a title',
      pleaseEnterDescription: 'Please enter a description',
      describeReportDetail: 'Describe your report in detail...',
      failedToLoadReports: 'Failed to load reports',
      // Report types
      monthlyProgressReport: 'Monthly Progress Report',
      issueReport: 'Issue Report',
      projectUpdate: 'Project Update',
      expenseReport: 'Expense Report',
      performanceReview: 'Performance Review',
      incidentReport: 'Incident Report',
      other: 'Other',
      predefinedTypes: 'Predefined Types',
      customType: 'Custom Type',
      enterCustomType: 'Enter custom report type',
      pleaseEnterCustomType: 'Please enter custom report type',
      enterReportType: 'Enter report type',
      pleaseEnterReportType: 'Please enter report type',
    },
    goals: {
      myGoals: 'My Goals',
      teamGoals: 'Team Goals',
      allGoals: 'All Goals',
      viewGoals: 'View Goals',
      createGoal: 'Create Goal',
      editGoal: 'Edit Goal',
      goalName: 'Goal Name',
      goalDescription: 'Goal Description',
      assignTo: 'Assign To',
      startDate: 'Start Date',
      endDate: 'End Date',
      targetValue: 'Target Value',
      currentProgress: 'Current Progress',
      progress: 'Progress',
      deadline: 'Deadline',
      assigned: 'Assigned',
      completed: 'Completed',
      title: 'Goal Management',
      subtitle: 'Track and manage your goals and organizational objectives',
      createNew: 'Create New Goal',
      // New translations for goal creation
      goalTitle: 'Goal Title',
      goalDescriptionText: 'Goal Description',
      goalAssignment: 'Goal Assignment',
      individualGoal: 'Individual Goal (assigned to specific users)',
      departmentGoal: 'Department Goal (visible to all department members)',
      departmentRequired: 'Please select the department',
      usersRequired: 'Please select at least one user',
      priority: 'Priority',
      timeline: 'Timeline',
      titleRequired: 'Please enter the goal title',
      titleMinLength: 'The title must be at least 3 characters',
      descriptionRequired: 'Please enter the goal description',
      priorityRequired: 'Please select the priority',
      timelineRequired: 'Please select the timeline',
      assignToUsers: 'Assign To Users',
      selectDepartment: 'Select department first',
      selectUsers: 'Select users of the department',
      selectDepartmentForGoal: 'Select department for this goal',
      departmentGoalInfo: 'Department Goal',
      departmentGoalDescription: 'When you select a department goal, all users of that department will be automatically assigned to the goal.',
      lowPriority: 'Low Priority',
      mediumPriority: 'Medium Priority',
      highPriority: 'High Priority',
      createGoalDescription: 'Create a new goal and track its progress',
      goalDetails: 'Goal Details',
      titlePlaceholder: 'Enter a clear and specific title for the goal',
      descriptionPlaceholder: 'Describe your goal in detail, including how success looks',
      goalCreatedSuccessfully: 'Goal created successfully!',
      goalUpdatedSuccessfully: 'Goal updated successfully!',
      goalCreationFailed: 'Failed to create goal',
      goalUpdateFailed: 'Failed to update goal',
      updateGoal: 'Update Goal',
      editGoalDescription: 'Edit existing goal details',
      failedToLoadGoal: 'Failed to load goal',
      // Additional translations for goals view page
      trackAndManageGoals: 'Track and manage your goals and objectives',
      totalGoals: 'Total Goals',
      activeGoals: 'Active Goals',
      pendingReportsWarning: '{count} goal(s) needs completion reports before being marked as completed.',
      searchGoals: 'Search goals...',
      filterByStatus: 'Filter by Status',
      filterByPriority: 'Filter by Priority',
      filterByDepartment: 'Filter by Department',
      pending: 'Pending',
      active: 'Active',
      overdue: 'Overdue',
      onHold: 'On Hold',
      cancelled: 'Cancelled',
      of: 'of',
      goals: 'goals',
      viewDetails: 'View Details',
      uploadReport: 'Upload Report',
      updateProgress: 'Update Progress',
      updateStatus: 'Update Status',
      selectStatus: 'Select Status',
      uploading: 'Uploading...',
      deleteGoal: 'Delete Goal',
      goalDeletedSuccessfully: 'Goal deleted successfully!',
      failedToDeleteGoal: 'Failed to delete goal',
      failedToLoadGoals: 'Failed to load goals',
      reportRequired: 'Report Required',
      usersAssigned: 'users assigned',
      notAssigned: 'Not assigned',
      daysOverdue: 'days overdue',
      daysRemaining: 'days remaining',
      viewReports: 'View Reports',
      reports: 'Reports',
      submittedBy: 'Submitted By',
      viewFile: 'View File',
      download: 'Download',
      reportTitle: 'Report Title',
      reportDescription: 'Report Description',
      pleaseSelectFile: 'Please select a file',
      reportUploadedSuccessfully: 'Report uploaded successfully!',
      failedToUploadReport: 'Failed to upload report',
      reportTitleRequired: 'Report title is required',
      enterReportTitle: 'Enter report title',
      invalidDates: 'Invalid dates selected',
      reportDescriptionRequired: 'Report description is required',
      enterReportDescription: 'Enter report description',
      uploadFiles: 'Upload Files',
      filesRequired: 'Files are required',
      selectFiles: 'Select Files',
      isCompletionReport: 'Completion Report',
      progressUpdatedSuccessfully: 'Progress updated successfully!',
      failedToUpdateProgress: 'Failed to update progress',
      progressRequired: 'Progress is required',
      statusRequired: 'Status is required',
      // Additional missing keys for goals view page
      goal: 'Goal',
      actions: 'Actions',
      createdByMe: 'Created by Me',
      lastUpdated: 'Last Updated',
      // Status and other missing keys
      status: 'Status',
      assignedTo: 'Assigned To',
      createdAt: 'Created At',
      createdBy: 'Created By',
      close: 'Close',
      pendingReports: 'Pending Reports',
      // Status values
      statusEmProgresso: 'In Progress',
      statusPendente: 'Pending',
      statusFeito: 'Done',
      statusConcluido: 'Completed',
      statusBloqueado: 'Blocked',
             statusEmEspera: 'On Hold',
       statusOutro: 'Other',
       blocked: 'Blocked',
      uploadNewReport: 'Upload New Report',
      completionReport: 'Completion Report',
      attachedFiles: 'Attached Files',
      noReportsYet: 'No reports yet',
      uploadFirstReport: 'Upload your first report',
      // Additional missing keys for goal reports
      description: 'Description',
      submittedAt: 'Submitted At',
      type: 'Type',
      fileDownloadedSuccessfully: 'File downloaded successfully',
      downloadFailed: 'Download failed',
      noFilesAttached: 'No files attached',
      uploadComplete: 'Upload Complete',
      uploadingFiles: 'Uploading Files',
      // Status update related keys
      statusUpdatedSuccessfully: 'Status updated successfully!',
      failedToUpdateStatus: 'Failed to update status',
      noStatusChange: 'No status change detected',
      currentStatus: 'Current Status',
      newStatus: 'New Status',
      selectNewStatus: 'Select new status',
      updating: 'Updating...',
      // New status values
      pending: 'Pending',
      inProgress: 'In Progress',
      onHold: 'On Hold',
      awaiting: 'Awaiting',
      done: 'Done',
      // Additional missing keys
      departmentGoals: 'Department Goals',
      manageAndTrackGoals: 'Manage and track your goals and objectives',
      searchGoals: 'Search goals',
      // Publish and share functionality
      publishGoal: 'Publish Goal',
      publish: 'Publish',
      shareGoal: 'Share Goal',
      goalPublished: 'Goal published successfully!',
      failedToPublishGoal: 'Failed to publish goal',
      goalSharedSuccessfully: 'Goal shared successfully!',
      failedToShareGoal: 'Failed to share goal',
      failedToLoadUsers: 'Failed to load users',
      shareGoalInfo: 'Share Goal Complete',
      shareGoalDescription: 'You can share this completed goal with super administrators.',
      selectUsersToShare: 'Select Users to Share',
      selectUsers: 'Select users',
      message: 'Message',
      shareMessagePlaceholder: 'Enter an optional message...',
      sharing: 'Sharing',
      pleaseSelectUsers: 'Please select at least one user',
    },
    sharing: {
      shareWithLocalUsers: 'Share with Local Users',
      selectLocalUsers: 'Select Local Users',
      selectUsersFromSucursal: 'Select users from your sucursal',
      shareWithExternalSucursal: 'Share with External Sucursal',
      selectSucursal: 'Select Sucursal',
      pleaseSelectSucursal: 'Please select a sucursal',
      selectRemoteUsers: 'Select Remote Users',
      pleaseSelectRemoteUsers: 'Please select remote users',
      selectUsersFromSelectedSucursal: 'Select users from the selected sucursal',
      messageOptional: 'Message (Optional)',
      addMessageAboutSharedContent: 'Add a message about this shared content...',
      share: 'Share',
      sharing: 'Sharing...',
      pleaseSelectUsersToShareWith: 'Please select users to share with',
      pleaseSelectRemoteUsersToShareWith: 'Please select remote users to share with',
      localFileSharingNotImplemented: 'Local file sharing not yet implemented',
      sharedSuccessfully: 'Shared successfully!',
      failedToShare: 'Failed to share',
      failedToLoadSucursals: 'Failed to load sucursals',
      failedToLoadUsersFromSucursal: 'Failed to load users from selected sucursal',
    },
    documents: {
      // Page title and description
      documentManagementSystem: 'Document Management System',
      organizeAndAccessDocuments: 'Organize and access documents with hierarchical folder structure, multiple view modes, and collaborative features',
      
      // Tab labels
      allDocuments: 'All Documents',
      myDocuments: 'My Documents',
      
      // Tab descriptions
      allDocumentsDescription: 'Company-wide documents accessible to all employees',
      myDocumentsDescription: 'Private document storage for individual users',
      
      // Tab titles
      allDocumentsTitle: 'All Documents - Available to All Users',
      myDocumentsTitle: 'My Documents - Your Private Storage',
      
      // Company-wide description
      companyWideDocuments: 'Company-wide documents accessible to all employees',
      
      // Private storage description
      privateDocumentStorage: 'Private document storage for individual users',
    },
    libraries: {
      libraryManagementSystem: 'Library Management System',
      organizeAndAccessLibraries: 'Organize and access your document libraries with permission-based access control',
      allLibraries: 'All Libraries',
      myLibraries: 'My Libraries',
      companyWideLibraries: 'Access libraries you have permission to view',
      privateLibraryStorage: 'Libraries you created and manage',
      createLibrary: 'Create New Library',
      libraryName: 'Library Name',
      libraryDescription: 'Library Description',
      libraryMembers: 'Library Members',
      includeMyself: 'Include myself as a member',
      selectUsers: 'Select Users',
      selectDepartments: 'Select Departments',
      noMembers: 'No members',
      permissionDenied: 'You don\'t have permission to access this library',
      libraryNotFound: 'Library not found',
      uploadFile: 'Upload File',
      createFolder: 'Create Folder',
      deleteFile: 'Delete File',
      editFile: 'Edit File',
      downloadFile: 'Download File',
      copyFile: 'Copy File',
      moveFile: 'Move File',
      renameFile: 'Rename File',
      fileProperties: 'File Properties',
      bulkOperations: 'Bulk Operations',
      searchFiles: 'Search files...',
      sortBy: 'Sort by',
      viewMode: 'View Mode',
      listView: 'List View',
      gridView: 'Grid View',
      refresh: 'Refresh',
      loading: 'Loading...',
      noFiles: 'No files in this location',
      selectLibrary: 'Select a Library',
      chooseLibraryMessage: 'Choose a library from the list to view and manage its files',
      newLibrary: 'New Library',
      enterLibraryName: 'Enter library name',
      enterLibraryDescription: 'Enter library description (optional)',
      files: 'files',
      createdBy: 'Created by',
      members: 'members',
      departments: 'departments',
      loadingLibraries: 'Loading libraries...',
      noLibrariesFound: 'No libraries found',
      createFirstLibrary: 'Create your first library to get started',
      libraryCreated: 'Library created successfully',
      libraryCreationFailed: 'Failed to create library',
      pleaseEnterLibraryName: 'Please enter library name',
      selectUsersPlaceholder: 'Select users to add to the library',
      selectDepartmentsPlaceholder: 'Select departments to add to the library',
      enterLibraryDescription: 'Enter library description',
      librarySettings: 'Library Settings',
      libraryPermissions: 'Library Permissions',
      libraryAccess: 'Library Access',
      publicLibrary: 'Public Library',
      privateLibrary: 'Private Library',
      sharedLibrary: 'Shared Library',
      libraryType: 'Library Type',
      libraryVisibility: 'Library Visibility',
      librarySharing: 'Library Sharing',
      libraryBackup: 'Library Backup',
      libraryArchive: 'Archive Library',
      libraryRestore: 'Restore Library',
      libraryDelete: 'Delete Library',
      libraryDeleteConfirm: 'Are you sure you want to delete this library?',
      libraryDeleteWarning: 'This action cannot be undone. All files will be permanently deleted.',
      libraryDeleteSuccess: 'Library deleted successfully',
      libraryDeleteFailed: 'Failed to delete library',
      libraryUpdate: 'Update Library',
      libraryUpdateSuccess: 'Library updated successfully',
      libraryUpdateFailed: 'Failed to update library',
      libraryDuplicate: 'Duplicate Library',
      libraryExport: 'Export Library',
      libraryImport: 'Import Library',
      librarySync: 'Sync Library',
      libraryBackupSuccess: 'Library backed up successfully',
      libraryBackupFailed: 'Failed to backup library',
      libraryRestoreSuccess: 'Library restored successfully',
      libraryRestoreFailed: 'Failed to restore library',
      libraryArchiveSuccess: 'Library archived successfully',
      libraryArchiveFailed: 'Failed to archive library',
      filesUploadedSuccess: 'Files uploaded successfully',
      failedToUploadFiles: 'Failed to upload files',
      successfullyDeletedItems: 'Items deleted successfully',
      failedToDeleteSomeItems: 'Failed to delete some items',
      itemsCopiedToClipboard: 'Items copied to clipboard',
      itemsCutToClipboard: 'Items cut to clipboard',
      addMember: 'Add Member',
      selectUser: 'Select User',
      pleaseSelectUser: 'Please select a user',
      confirmRemoveMember: 'Are you sure you want to remove this member?',
      noResultsFound: 'No results found',
      search: 'Search',
      edit: 'Edit',
      delete: 'Delete',
      create: 'Create',
      update: 'Update',
      cancel: 'Cancel',
      add: 'Add',
      yes: 'Yes',
      no: 'No',
      success: 'Success',
      error: 'Error',
      actions: 'Actions',
      memberAddedSuccess: 'Member added successfully',
      memberAddFailed: 'Failed to add member',
      memberRemovedSuccess: 'Member removed successfully',
      memberRemoveFailed: 'Failed to remove member',
      removeMemberConfirm: 'Are you sure you want to remove this member?',
      removeMemberWarning: 'This action cannot be undone.',
      remove: 'Remove',
              creator: 'Creator',
        overview: 'Overview',
        backToLibraries: 'Back to Libraries',
        manageMembers: 'Manage Members',
        editLibrary: 'Edit Library',
        libraryInfo: 'Library Information',
        files: 'Files',
        manageFiles: 'Manage Files',
        fileManagement: 'File Management',
        search: 'Search',
        refresh: 'Refresh',
        noLibrariesFound: 'No libraries found',
        noResultsFound: 'No results found',
        libraryUpdate: 'Update Library',
        pleaseEnterLibraryName: 'Please enter library name',
        enterLibraryName: 'Enter library name',
        libraryDescription: 'Description',
        enterLibraryDescription: 'Enter library description',
        libraryMembers: 'Members',
        selectUsersPlaceholder: 'Select users to add as members',
        create: 'Create',
        cancel: 'Cancel',
        update: 'Update',
        selectUser: 'Select User',
        pleaseSelectUser: 'Please select a user',
        add: 'Add',
        noMembers: 'No members found',
        selectLibraryFirst: 'Please select a library first',
    },
    files: {
      myFiles: 'My Files',
      libraries: 'Libraries',
      createLibrary: 'Create Library',
      libraryName: 'Library Name',
      libraryDescription: 'Library Description',
      permissions: 'Permissions',
      selectLibrary: 'Select Library',
      fileDescription: 'File Description',
      fileName: 'File Name',
      fileSize: 'File Size',
      uploadedBy: 'Uploaded by',
      uploadedAt: 'Uploaded at',
      downloadFile: 'Download File',
      viewFile: 'View File',
      deleteFile: 'Delete File',
      managePermissions: 'Manage Permissions',
      libraryMembers: 'Library Members',
      selectMembers: 'Select Members',
      addMembers: 'Add Members',
      individuals: 'Individuals',
      departments: 'Departments',
      includeMyself: 'Include Myself',
      selectUsers: 'Select Users',
      selectDepartments: 'Select Departments',
      memberPermissions: 'Member Permissions',
      canRead: 'Can Read',
      canWrite: 'Can Write',
      canDelete: 'Can Delete',
      owner: 'Owner',
      noMembers: 'No Members',
      uploadProgress: 'Upload Progress',
      noFilesFound: 'No files found',
      createFolder: 'Create Folder',
      name: 'Name',
      size: 'Size',
      modified: 'Modified',
      actions: 'Actions',
      list: 'List',
      grid: 'Grid',
      tree: 'Tree',
      sortByName: 'Sort by Name',
      sortByDate: 'Sort by Date',
      sortBySize: 'Sort by Size',
      sortByType: 'Sort by Type',
      newFolder: 'New Folder',
      upload: 'Upload',
      documents: 'Documents',
      userFiles: 'User Files',
      view: 'View',
      download: 'Download',
      rename: 'Rename',
      delete: 'Delete',
      deleteConfirm: 'Are you sure you want to delete this item?',
      createNewFolder: 'Create New Folder',
      createFolderIn: 'Create folder in',
      renameItem: 'Rename Item',
      folderName: 'Folder Name',
      enterFolderName: 'Enter folder name',
      description: 'Description',
      optionalDescription: 'Optional description',
      newName: 'New Name',
      enterName: 'Enter name',
      enterNewName: 'Enter new name',
      uploadFiles: 'Upload Files',
      uploadDragText: 'Drag files here or click to select',
      uploadHint: 'Support for single or bulk upload',
      // Bulk operations
      copy: 'Copy',
      move: 'Move',
      cut: 'Cut',
      paste: 'Paste',
      properties: 'Properties',
      editDocument: 'Edit Document',
      clearSelection: 'Clear Selection',
      selected: 'Selected',
      items: 'items',
      copySelected: 'Copy Selected',
      moveSelected: 'Move Selected',
      deleteSelected: 'Delete Selected',
      copySelectedItems: 'Copy Selected Items',
      moveSelectedItems: 'Move Selected Items',
      selectTargetFolderCopy: 'Select a target folder to copy the selected items to:',
      selectTargetFolderMove: 'Select a target folder to move the selected items to:',
      copyToRoot: 'Copy to Root',
      moveToRoot: 'Move to Root',
      root: 'Root',
      bulkCopyItems: 'Copy Selected Items',
      bulkMoveItems: 'Move Selected Items',
      selectTargetFolderForBulkCopy: 'Select a target folder to copy the selected items to:',
      selectTargetFolderForBulkMove: 'Select a target folder to move the selected items to:',
      // File sharing
      shareFile: 'Share File',
      shareFileDescription: 'Share "{fileName}" with users from your sucursal or from other sucursals',
      shareFileWithExternalSucursal: 'Share File with External Sucursal',
      successfullyDeletedItems: 'Successfully deleted {{count}} item(s)',
      failedToDeleteSomeItems: 'Failed to delete some items',
      // Document types
      folder: 'Folder',
      document: 'Document',
      image: 'Image',
      pdf: 'PDF',
      spreadsheet: 'Spreadsheet',
      text: 'Text',
      file: 'File',
      // Status messages
      folderCreatedSuccess: 'Folder created successfully',
      documentCreatedSuccess: 'Document created successfully',
      documentUpdatedSuccess: 'Document updated successfully',
      itemRenamedSuccess: 'Item renamed successfully',
      itemCopiedSuccess: 'Item copied successfully',
      itemMovedSuccess: 'Item moved successfully',
      itemDeletedSuccess: 'Item deleted successfully',
      filesUploadedSuccess: 'Files uploaded successfully',
      bulkCopySuccess: 'Successfully copied {{count}} item(s)',
      bulkMoveSuccess: 'Successfully moved {{count}} item(s)',
      bulkDeleteSuccess: 'Successfully deleted {{count}} item(s)',
      documentExportedSuccess: 'Document exported as HTML successfully',
      // Error messages
      failedToLoadDocuments: 'Failed to load documents',
      failedToCreateFolder: 'Failed to create folder',
      failedToCreateDocument: 'Failed to create document',
      failedToUpdateDocument: 'Failed to update document',
      failedToUploadFiles: 'Failed to upload files',
      failedToDeleteItem: 'Failed to delete item',
      failedToRenameItem: 'Failed to rename item',
      failedToCopyItem: 'Failed to copy item',
      failedToMoveItem: 'Failed to move item',
      failedToPasteItem: 'Failed to paste item',
      failedBulkCopy: 'Failed to prepare bulk copy',
      failedBulkMove: 'Failed to prepare bulk move',
              failedToGeneratePdf: 'Failed to generate PDF',
        itemNotFound: 'Item not found',
        failedToLoadDocumentContent: 'Failed to load document content',
      // UI labels
      goBack: 'Go Back',
      goForward: 'Go Forward',
      sortOrder: 'Sort Order',
      refresh: 'Refresh',
      searchDocuments: 'Search documents...',
      noDocumentsFound: 'No documents found',
                exportAsPdf: 'Export as PDF',
      characters: 'Characters',
      words: 'Words',
      richTextEditorPoweredByQuill: 'Rich Text Editor powered by Quill',
      loadingEditor: 'Loading editor...',
      documentTitle: 'Document Title',
      startTypingDocument: 'Start typing your document...',
      pleaseEnterDocumentTitle: 'Please enter a document title',
      pleaseEnterContent: 'Please enter some content',
      pleaseAddContentBeforePdf: 'Please add some content before generating PDF',
      home: 'Home',
      type: 'Type',
      owner: 'Owner',
      created: 'Created',
      lastModified: 'Last Modified',
      subfolders: 'Subfolders',
      files: 'Files',
      mimeType: 'MIME Type',
      unknown: 'Unknown',
      areYouSureDelete: 'Are you sure you want to delete this item?',
      yes: 'Yes',
      no: 'No',
      cancel: 'Cancel',
      close: 'Close',
      save: 'Save',
      export: 'Export',
      noDescription: 'No description',
      targetFolder: 'Target Folder',
      pleaseSelectTargetFolder: 'Please select target folder',
      pleaseEnterFolderName: 'Please enter folder name',
      pleaseEnterNewName: 'Please enter new name',
      createNewDocument: 'Create New Document',
    sendDocument: 'Send Document',
      itemProperties: 'Item Properties',
      copyItem: 'Copy Item',
      moveItem: 'Move Item',
      renameItem: 'Rename Item',
      by: 'By',
      copyText: 'Copy',
      moveText: 'Move',
      deleteSelectedText: 'Delete Selected',
      // File shares modal
      fileShares: 'File Shares',
      fileSharedWith: 'This file has been shared with',
      fileSharedBy: 'Shared by',
      sharedAt: 'Shared at',
      message: 'Message',
      remoteShare: 'Remote share',
      noSharesFound: 'No shares found for this file',
      loadingShares: 'Loading shares...',
      fileSharedSuccessfully: 'File shared successfully!',
      // Clipboard messages
      itemCutToClipboard: '{{name}} cut to clipboard',
      itemCopiedToClipboard: '{{name}} copied to clipboard',
      itemPastedSuccess: '{{name}} pasted successfully',
      itemsCutToClipboard: '{{count}} items cut to clipboard',
      itemsCopiedToClipboard: '{{count}} items copied to clipboard',
      itemsPastedSuccess: '{{count}} items pasted successfully',
      paste: 'Paste',
      cut: 'Cut',
    },
    scanner: {
      title: 'Scanner',
      description: 'Scan documents and generate PDFs',
      scanDocument: 'Scan Document',
      takePhoto: 'Take Photo',
      addPage: 'Add Page',
      removePage: 'Remove Page',
      generatePdf: 'Generate PDF',
      savePdf: 'Save PDF',
      scanningTips: 'Scanning Tips',
      goodLighting: 'Good Lighting',
      keepFlat: 'Keep Flat',
      avoidShadows: 'Avoid Shadows',
      centerDocument: 'Center Document',
      adjustBorders: 'Adjust Borders',
      camera: 'Camera',
      startCamera: 'Start Camera',
      startCameraHint: 'Click "Start Camera" to begin scanning',
      stopCamera: 'Stop Camera',
      scannedPages: 'Scanned Pages',
      noPagesScanned: 'No pages scanned',
      page: 'Page',
      view: 'View',
      "delete": 'Delete',
      fileName: 'File Name',
      fileNamePlaceholder: 'Enter file name (without extension)',
      captureSuccess: 'Page captured successfully!',
      pdfGenerated: 'PDF generated successfully!',
      pdfGenerationFailed: 'Failed to generate PDF. Please try again.',
      captureAtLeastOnePage: 'Please capture at least one page before generating PDF.',
      enterFileName: 'Please enter a file name.',
      cameraAccessError: 'Unable to access camera. Please check permissions.',
      // Additional scanner keys
      useDeviceCamera: 'Use your device camera to scan documents and convert them to PDF.',
      convertToPdf: 'Convert to PDF',
      scanningTipsTitle: 'Scanning Tips',
      ensureGoodLighting: '• Ensure good lighting for better quality',
      keepDocumentFlat: '• Keep the document flat and steady',
      avoidShadowsGlare: '• Avoid shadows and glare',
      centerDocumentFrame: '• Center the document in the frame',
      cameraSection: 'Camera',
      scannedPagesSection: 'Scanned Pages',
      pdfGenerationSection: 'PDF Generation',
      fileNameLabel: 'File Name *',
      fileNameRequired: 'File name is required',
      enterFileNameWithoutExtension: 'Enter file name (without extension)',
      generatePdfButton: 'Generate PDF',
      generatingPdf: 'Generating PDF...',
      processingPages: 'Processing',
      pageSingular: 'page',
      pagePlural: 'pages',
      noPagesScannedYet: 'No pages scanned yet',
      clickStartCamera: 'Click "Start Camera"',
      toBeginScanning: 'to begin scanning',
      pageNumber: 'Page',
      movePageUp: 'Move up',
      movePageDown: 'Move down',
      previewModal: 'Preview',
      unableToAccessCamera: 'Unable to access camera.',
      checkPermissions: 'Please check permissions.',
      pageCapturedSuccessfully: 'Page captured successfully!',
      pleaseCaptureOnePage: 'Please capture at least one page before generating PDF.',
      pleaseEnterFileName: 'Please enter a file name.',
      pdfGeneratedSuccessfully: 'PDF "{fileName}.pdf" generated successfully!',
      failedToGeneratePdf: 'Failed to generate PDF. Please try again.',
      tryAgain: 'Try again',
    },
    sucursal: {
      management: 'Sucursal Management',
      manageSucursals: 'Manage and monitor servers at all locations',
      addSucursal: 'Add New Sucursal',
      sucursalName: 'Sucursal Name',
      serverUrl: 'Server URL',
      description: 'Description',
      totalSucursals: 'Total Sucursals',
      online: 'Online',
      offline: 'Offline',
      avgUptime: 'Average Uptime',
      responseTime: 'Response Time',
      uptime: 'Uptime',
      healthStatus: 'Health Status',
      serverLogs: 'Server Logs',
      actions: 'Actions',
      refreshStatus: 'Refresh Status',
      configuration: 'Configuration',
      viewInBrowser: 'View in Browser',
      basicInformation: 'Basic Information',
      currentStatus: 'Current Status',
      createdBy: 'Created By',
      createSucursal: 'Create Sucursal',
      editSucursal: 'Edit Sucursal',
      updateSucursal: 'Update Sucursal',
      confirmDelete: 'Confirm Delete',
      confirmDeleteMessage: 'Are you sure you want to delete this sucursal? This action cannot be undone.',
      cancel: 'Cancel',
      addNewSucursal: 'Add New Sucursal',
      enterSucursalName: 'Enter sucursal name',
      enterServerUrl: 'Enter server URL',
      enterDescription: 'Enter description',
      pleaseEnterSucursalName: 'Please enter sucursal name',
      pleaseEnterServerUrl: 'Please enter server URL',
      pleaseEnterDescription: 'Please enter description',
      pleaseEnterValidUrl: 'Please enter a valid URL',
      pleaseEnterLocation: 'Please enter location',
      enterLocation: 'Enter location',
      sucursalWithNameOrUrlExists: 'Sucursal with this name or URL already exists',
      refreshStatusTooltip: 'Refresh Status',
      viewDetailsTooltip: 'View Details',
      errorsLogged: 'error(s) logged',
      time: 'Time',
      details: 'Details',
      createdAt: 'Created At',
      location: 'Location',
      status: 'Status',
      errorCount: 'Error Count',
      ping: 'Ping',
      pingSucursal: 'Ping Sucursal',
      pingSuccess: 'Ping successful',
      pingFailed: 'Ping failed',
      serverUnreachable: 'Server unreachable',
      connectionTest: 'Connection Test',
      testConnection: 'Test Connection',
      connectionSuccess: 'Connection successful',
      connectionFailed: 'Connection failed',
      latency: 'Latency',
      ms: 'ms',
      percent: '%',
      na: 'N/A',
      accessDenied: 'Access denied',
      name: 'Name',
      url: 'URL',
      errorType: 'Error Type',
      description: 'Description',
    },
    profile: {
      title: 'User Profile',
      description: 'Manage your personal information, account settings, and security',
      editProfile: 'Edit Profile',
      updateProfile: 'Update Profile',
      cancel: 'Cancel',
      personalInfo: 'Personal Information',
      accountInfo: 'Account Information',
      security: 'Security',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone',
      address: 'Address',
      department: 'Department',
      memberSince: 'Member Since',
      lastLogin: 'Last Login',
      userId: 'User ID',
      never: 'Never',
      noDepartment: 'No Department',
      enterFullName: 'Enter full name',
      enterEmail: 'Enter email',
      enterPhone: 'Enter phone number',
      enterAddress: 'Enter address',
      selectDepartment: 'Select department',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmPassword: 'Confirm Password',
      enterCurrentPassword: 'Enter current password',
      enterNewPassword: 'Enter new password',
      confirmNewPassword: 'Confirm new password',
      passwordRequirements: 'Password must be at least 8 characters',
      passwordsDoNotMatch: 'Passwords do not match',
      clickToChange: 'Click to change',
      uploadingAvatar: 'Uploading avatar',
      onlyImageFiles: 'Only image files are allowed',
      imageSizeLimit: 'File must be less than 2MB',
      avatarUploaded: 'Avatar uploaded successfully',
      failedToUploadAvatar: 'Failed to upload avatar',
      profileUpdated: 'Profile Updated',
      profileUpdateSuccess: 'Your profile has been updated successfully',
      failedToUpdateProfile: 'Failed to update profile',
      updateError: 'Error updating profile',
      passwordChanged: 'Password Changed',
      passwordChangeSuccess: 'Your password has been changed successfully',
      failedToChangePassword: 'Failed to change password',
      passwordChangeError: 'Error changing password',
      passwordSecurity: 'Password Security',
      passwordSecurityDescription: 'Keep your password secure and change it regularly',
      departmentChangeInfo: 'Department Change',
      departmentChangeDescription: 'Only administrators can change departments. Contact support if needed.',
      roleDescriptions: {
        superAdmin: 'Super Administrator with full system access',
        admin: 'Administrator with elevated permissions',
        supervisor: 'Supervisor with team permissions',
        user: 'Standard user with basic access',
        developer: 'Developer with full system access',
      },
      validation: {
        required: 'This field is required',
        email: 'Please enter a valid email',
      },
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] || dictionaries[defaultLocale];
}

export function getLocaleFromUrl(pathname: string): Locale {
  const segments = pathname.split('/');
  const maybeLocale = segments[1] as Locale;
  return locales.includes(maybeLocale) ? maybeLocale : defaultLocale;
}
