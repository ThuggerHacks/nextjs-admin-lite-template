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
    digitalize: string;
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
    delete: string;
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
    delete: string;
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
    delete: string;
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
  };
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
          uploadingFiles: string;
      uploadComplete: string;
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
      publishGoal: string;
      publish: string;
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
    goals: string;
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
    delete: string;
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
  };
  scanner: {
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
      scan: 'Digitalizar',
      digitalize: 'Digitalizar',
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
      scanDocument: 'Digitalizar Documento',
      submitReport: 'Submeter Relatório',
      companyOverview: 'Visão Geral da Empresa',
      newUsersThisMonth: 'Novos Usuários Este Mês',
      storageUsage: 'Uso de Armazenamento',
      reportsResponseRate: 'Taxa de Resposta de Relatórios',
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
      done: 'Concluído',
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
    },
    scanner: {
      scanDocument: 'Digitalizar Documento',
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
      scan: 'Digitalize',
      digitalize: 'Digitalize',
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
    },
    scanner: {
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
