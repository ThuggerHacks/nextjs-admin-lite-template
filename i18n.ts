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
    userType: string;
    requestAccess: string;
    accountRequested: string;
    waitingApproval: string;
    invalidCredentials: string;
    loginFailed: string;
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
  };
  reports: {
    submitReport: string;
    reportType: string;
    title: string;
    description: string;
    attachFiles: string;
    selectSupervisor: string;
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
    respondedAt: string;
    viewReports: string;
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
  };
  files: {
    myFiles: string;
    libraries: string;
    createLibrary: string;
    libraryName: string;
    libraryDescription: string;
    permissions: string;
    uploadFiles: string;
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
  users: {
    userManagement: string;
    addUser: string;
    removeUser: string;
    promoteUser: string;
    demoteUser: string;
    activateUser: string;
    deactivateUser: string;
    userName: string;
    userEmail: string;
    userDepartment: string;
    userRole: string;
    userStatus: string;
    lastLogin: string;
    createdAt: string;
    actions: string;
    sendInvite: string;
    userTypes: {
      user: string;
      admin: string;
      superAdmin: string;
    };
  };
  notifications: {
    notifications: string;
    markAsRead: string;
    markAllAsRead: string;
    noNotifications: string;
    reportSubmitted: string;
    goalUpdated: string;
    userRequest: string;
    systemAlert: string;
    newFile: string;
    responseReceived: string;
  };
  requests: {
    userRequests: string;
    pendingRequests: string;
    approvedRequests: string;
    rejectedRequests: string;
    requestDetails: string;
    approveRequest: string;
    rejectRequest: string;
    requestedBy: string;
    requestedAt: string;
    requestReason: string;
  };
  profile: {
    myProfile: string;
    editProfile: string;
    personalInfo: string;
    changePassword: string;
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
    updateProfile: string;
    changesDepartment: string;
    pendingApproval: string;
    contactInfo: string;
    phone: string;
    address: string;
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
      userType: 'Tipo de Usuário',
      requestAccess: 'Solicitar Acesso',
      accountRequested: 'Conta Solicitada',
      waitingApproval: 'Aguardando aprovação do administrador',
      invalidCredentials: 'Credenciais inválidas',
      loginFailed: 'Falha no login',
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
    },
    reports: {
      submitReport: 'Submeter Relatório',
      reportType: 'Tipo de Relatório',
      title: 'Título',
      description: 'Descrição',
      attachFiles: 'Anexar Arquivos',
      selectSupervisor: 'Selecionar Supervisor',
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
      respondedAt: 'Respondido em',
      viewReports: 'Ver Relatórios',
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
    },
    files: {
      myFiles: 'Meus Arquivos',
      libraries: 'Bibliotecas',
      createLibrary: 'Criar Biblioteca',
      libraryName: 'Nome da Biblioteca',
      libraryDescription: 'Descrição da Biblioteca',
      permissions: 'Permissões',
      uploadFiles: 'Carregar Arquivos',
      selectLibrary: 'Selecionar Biblioteca',
      fileDescription: 'Descrição do Arquivo',
      fileName: 'Nome do Arquivo',
      fileSize: 'Tamanho',
      uploadedBy: 'Carregado por',
      uploadedAt: 'Carregado em',
      downloadFile: 'Baixar Arquivo',
      viewFile: 'Ver Arquivo',
      deleteFile: 'Excluir Arquivo',
      managePermissions: 'Gerenciar Permissões',
      libraryMembers: 'Membros da Biblioteca',
      selectMembers: 'Selecionar Membros',
      addMembers: 'Adicionar Membros',
      individuals: 'Indivíduos',
      departments: 'Departamentos',
      includeMyself: 'Incluir a mim mesmo',
      selectUsers: 'Selecionar Usuários',
      selectDepartments: 'Selecionar Departamentos',
      memberPermissions: 'Permissões dos Membros',
      canRead: 'Pode Ler',
      canWrite: 'Pode Escrever',
      canDelete: 'Pode Excluir',
      owner: 'Proprietário',
      noMembers: 'Sem membros',
    },
    scanner: {
      scanDocument: 'Digitalizar Documento',
      takePhoto: 'Tirar Foto',
      addPage: 'Adicionar Página',
      removePage: 'Remover Página',
      generatePdf: 'Gerar PDF',
      savePdf: 'Salvar PDF',
      scanningTips: 'Dicas de Digitalização',
      goodLighting: 'Use boa iluminação',
      keepFlat: 'Mantenha o documento plano',
      avoidShadows: 'Evite sombras',
      centerDocument: 'Centralize o documento',
      adjustBorders: 'Ajuste as bordas',
    },
    users: {
      userManagement: 'Gestão de Usuários',
      addUser: 'Adicionar Usuário',
      removeUser: 'Remover Usuário',
      promoteUser: 'Promover Usuário',
      demoteUser: 'Despromover Usuário',
      activateUser: 'Ativar Usuário',
      deactivateUser: 'Desativar Usuário',
      userName: 'Nome do Usuário',
      userEmail: 'E-mail do Usuário',
      userDepartment: 'Departamento',
      userRole: 'Função',
      userStatus: 'Status',
      lastLogin: 'Último Acesso',
      createdAt: 'Criado em',
      actions: 'Ações',
      sendInvite: 'Enviar Convite',
      userTypes: {
        user: 'Usuário',
        admin: 'Administrador',
        superAdmin: 'Super Administrador',
      },
    },
    notifications: {
      notifications: 'Notificações',
      markAsRead: 'Marcar como Lida',
      markAllAsRead: 'Marcar Todas como Lidas',
      noNotifications: 'Nenhuma notificação',
      reportSubmitted: 'Relatório submetido',
      goalUpdated: 'Meta atualizada',
      userRequest: 'Solicitação de usuário',
      systemAlert: 'Alerta do sistema',
      newFile: 'Novo arquivo',
      responseReceived: 'Resposta recebida',
    },
    requests: {
      userRequests: 'Solicitações de Usuários',
      pendingRequests: 'Solicitações Pendentes',
      approvedRequests: 'Solicitações Aprovadas',
      rejectedRequests: 'Solicitações Rejeitadas',
      requestDetails: 'Detalhes da Solicitação',
      approveRequest: 'Aprovar Solicitação',
      rejectRequest: 'Rejeitar Solicitação',
      requestedBy: 'Solicitado por',
      requestedAt: 'Solicitado em',
      requestReason: 'Motivo da Solicitação',
    },
    profile: {
      myProfile: 'Meu Perfil',
      editProfile: 'Editar Perfil',
      personalInfo: 'Informações Pessoais',
      changePassword: 'Alterar Senha',
      currentPassword: 'Senha Atual',
      newPassword: 'Nova Senha',
      confirmNewPassword: 'Confirmar Nova Senha',
      updateProfile: 'Atualizar Perfil',
      changesDepartment: 'Mudança de Departamento',
      pendingApproval: 'Pendente de Aprovação',
      contactInfo: 'Informações de Contato',
      phone: 'Telefone',
      address: 'Endereço',
    },
  },
  en: {
    navigation: {
      dashboard: 'Dashboard',
      homepage: 'Homepage',
      reports: 'Reports',
      submitReports: 'Submit Reports',
      viewReports: 'View Reports',
      goals: 'Goals',
      viewGoals: 'View Goals',
      createGoals: 'Create Goals',
      editGoals: 'Edit Goals',
      scanner: 'Scanner',
      scan: 'Scan',
      digitalize: 'Digitalize',
      fileManagement: 'File Management',
      libraries: 'Libraries',
      documents: 'Documents',
      management: 'Management',
      users: 'Users',
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
    },
    auth: {
      welcomeBack: 'Welcome Back',
      enterCredentials: 'Enter your credentials to access',
      email: 'Email',
      password: 'Password',
      rememberMe: 'Remember Me',
      forgotPassword: 'Forgot Password?',
      dontHaveAccount: "Don't have an account?",
      signUp: 'Sign Up',
      createAccount: 'Create Account',
      confirmPassword: 'Confirm Password',
      fullName: 'Full Name',
      department: 'Department',
      userType: 'User Type',
      requestAccess: 'Request Access',
      accountRequested: 'Account Requested',
      waitingApproval: 'Waiting for administrator approval',
      invalidCredentials: 'Invalid credentials',
      loginFailed: 'Login failed',
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
    },
    reports: {
      submitReport: 'Submit Report',
      reportType: 'Report Type',
      title: 'Title',
      description: 'Description',
      attachFiles: 'Attach Files',
      selectSupervisor: 'Select Supervisor',
      reportSubmitted: 'Report Submitted',
      myReports: 'My Reports',
      teamReports: 'Team Reports',
      allReports: 'All Reports',
      reportDetails: 'Report Details',
      respond: 'Respond',
      response: 'Response',
      status: 'Status',
      submittedBy: 'Submitted by',
      submittedAt: 'Submitted at',
      respondedAt: 'Responded at',
      viewReports: 'View Reports',
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
    },
    files: {
      myFiles: 'My Files',
      libraries: 'Libraries',
      createLibrary: 'Create Library',
      libraryName: 'Library Name',
      libraryDescription: 'Library Description',
      permissions: 'Permissions',
      uploadFiles: 'Upload Files',
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
      noMembers: 'No members',
    },
    scanner: {
      scanDocument: 'Scan Document',
      takePhoto: 'Take Photo',
      addPage: 'Add Page',
      removePage: 'Remove Page',
      generatePdf: 'Generate PDF',
      savePdf: 'Save PDF',
      scanningTips: 'Scanning Tips',
      goodLighting: 'Use good lighting',
      keepFlat: 'Keep document flat',
      avoidShadows: 'Avoid shadows',
      centerDocument: 'Center the document',
      adjustBorders: 'Adjust borders',
    },
    users: {
      userManagement: 'User Management',
      addUser: 'Add User',
      removeUser: 'Remove User',
      promoteUser: 'Promote User',
      demoteUser: 'Demote User',
      activateUser: 'Activate User',
      deactivateUser: 'Deactivate User',
      userName: 'User Name',
      userEmail: 'User Email',
      userDepartment: 'Department',
      userRole: 'Role',
      userStatus: 'Status',
      lastLogin: 'Last Login',
      createdAt: 'Created at',
      actions: 'Actions',
      sendInvite: 'Send Invite',
      userTypes: {
        user: 'User',
        admin: 'Administrator',
        superAdmin: 'Super Administrator',
      },
    },
    notifications: {
      notifications: 'Notifications',
      markAsRead: 'Mark as Read',
      markAllAsRead: 'Mark All as Read',
      noNotifications: 'No notifications',
      reportSubmitted: 'Report submitted',
      goalUpdated: 'Goal updated',
      userRequest: 'User request',
      systemAlert: 'System alert',
      newFile: 'New file',
      responseReceived: 'Response received',
    },
    requests: {
      userRequests: 'User Requests',
      pendingRequests: 'Pending Requests',
      approvedRequests: 'Approved Requests',
      rejectedRequests: 'Rejected Requests',
      requestDetails: 'Request Details',
      approveRequest: 'Approve Request',
      rejectRequest: 'Reject Request',
      requestedBy: 'Requested by',
      requestedAt: 'Requested at',
      requestReason: 'Request Reason',
    },
    profile: {
      myProfile: 'My Profile',
      editProfile: 'Edit Profile',
      personalInfo: 'Personal Information',
      changePassword: 'Change Password',
      currentPassword: 'Current Password',
      newPassword: 'New Password',
      confirmNewPassword: 'Confirm New Password',
      updateProfile: 'Update Profile',
      changesDepartment: 'Department Change',
      pendingApproval: 'Pending Approval',
      contactInfo: 'Contact Information',
      phone: 'Phone',
      address: 'Address',
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
