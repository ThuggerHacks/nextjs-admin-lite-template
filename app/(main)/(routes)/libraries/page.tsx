'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  List,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Typography,
  Divider,
  Select,
  Checkbox,
  Tabs,
} from 'antd';
import {
  FolderOutlined,
  PlusOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
  FileOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Library, LibraryPermission, LibraryMemberSelection, UserRole } from '@/types';
import LibrariesManager from '@/components/LibrariesManager';

const { TextArea } = Input;
const { Title, Text } = Typography;

// Mock data
const mockUsers = [
  { id: '1', name: 'João Silva', email: 'joao@empresa.com', department: 'IT' },
  { id: '2', name: 'Maria Santos', email: 'maria@empresa.com', department: 'HR' },
  { id: '3', name: 'Pedro Costa', email: 'pedro@empresa.com', department: 'Finance' },
  { id: '4', name: 'Ana Oliveira', email: 'ana@empresa.com', department: 'Marketing' },
  { id: '5', name: 'Carlos Silva', email: 'carlos@empresa.com', department: 'Operations' },
  { id: '6', name: 'Lucia Fernandes', email: 'lucia@empresa.com', department: 'Legal' },
];

const mockDepartments = [
  'IT',
  'HR',
  'Finance',
  'Marketing',
  'Operations',
  'Legal',
  'Sales',
  'Support',
];

const mockLibraries: Library[] = [
  {
    id: '1',
    name: 'Company Documents',
    description: 'Official company documents and policies',
    createdBy: { id: '1', name: 'João Silva' } as any,
    createdAt: new Date('2024-01-15'),
    permissions: [
      {
        id: '1',
        targetId: '1',
        type: 'user',
        canRead: true,
        canWrite: true,
        canDelete: true,
      },
    ],
    fileCount: 45,
  },
  {
    id: '2',
    name: 'HR Resources',
    description: 'Human resources documents and forms',
    createdBy: { id: '2', name: 'Maria Santos' } as any,
    createdAt: new Date('2024-02-01'),
    permissions: [
      {
        id: '2',
        targetId: 'HR',
        type: 'department',
        canRead: true,
        canWrite: true,
        canDelete: false,
      },
    ],
    fileCount: 23,
  },
  {
    id: '3',
    name: 'Project Files',
    description: 'Active project documentation',
    createdBy: { id: '3', name: 'Pedro Costa' } as any,
    createdAt: new Date('2024-02-15'),
    permissions: [
      {
        id: '3',
        targetId: '3',
        type: 'user',
        canRead: true,
        canWrite: true,
        canDelete: true,
      },
    ],
    fileCount: 67,
  },
];

export default function LibrariesPage() {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
  const [isLibraryModalVisible, setIsLibraryModalVisible] = useState(false);
  const [libraryForm] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  
  // Member selection state
  const [memberSelection, setMemberSelection] = useState<LibraryMemberSelection>({
    includeCreator: true,
    selectedUsers: [],
    selectedDepartments: [],
  });
  
  const { user, hasRole, canAccess } = useUser();
  const { t } = useTranslation();

  // Load libraries on component mount
  useEffect(() => {
    const loadLibraries = async () => {
      setLoading(true);
      try {
        // Simulate API call delay to prevent blinking
        await new Promise(resolve => setTimeout(resolve, 100));
        setLibraries(mockLibraries);
      } catch (error) {
        console.error('Failed to load libraries:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadLibraries();
    }
  }, [user]);

  const getMemberCount = (library: Library): string => {
    const userCount = library.permissions.filter(p => p.type === 'user').length;
    const deptCount = library.permissions.filter(p => p.type === 'department').length;
    
    if (userCount === 0 && deptCount === 0) {
      return t('files.noMembers');
    }
    
    const parts: string[] = [];
    if (userCount > 0) {
      parts.push(`${userCount} ${userCount === 1 ? 'user' : 'users'}`);
    }
    if (deptCount > 0) {
      parts.push(`${deptCount} ${deptCount === 1 ? 'department' : 'departments'}`);
    }
    
    return parts.join(', ');
  };

  const canEditLibrary = (library: Library): boolean => {
    if (hasRole(UserRole.SUPER_ADMIN)) return true;
    if (hasRole(UserRole.ADMIN)) return true;
    return library.createdBy.id === user?.id;
  };

  const canAccessLibrary = (library: Library): boolean => {
    if (hasRole(UserRole.SUPER_ADMIN)) return true;
    
    // Check if user has direct permission
    const hasUserPermission = library.permissions.some(p => 
      p.type === 'user' && p.targetId === user?.id
    );
    
    // Check if user's department has permission
    const hasDepartmentPermission = library.permissions.some(p => 
      p.type === 'department' && p.targetId === user?.department?.id
    );
    
    return hasUserPermission || hasDepartmentPermission || library.createdBy.id === user?.id;
  };

  const getLibraryPermissions = (library: Library) => {
    if (!user) return { canRead: false, canWrite: false, canDelete: false };
    
    if (hasRole(UserRole.SUPER_ADMIN)) {
      return { canRead: true, canWrite: true, canDelete: true };
    }
    
    if (library.createdBy.id === user.id) {
      return { canRead: true, canWrite: true, canDelete: true };
    }
    
    // Find user's specific permissions
    const userPermission = library.permissions.find(p => 
      p.type === 'user' && p.targetId === user.id
    );
    
    if (userPermission) {
      return {
        canRead: userPermission.canRead,
        canWrite: userPermission.canWrite,
        canDelete: userPermission.canDelete,
      };
    }
    
    // Check department permissions
    const deptPermission = library.permissions.find(p => 
      p.type === 'department' && p.targetId === user.department?.id
    );
    
    if (deptPermission) {
      return {
        canRead: deptPermission.canRead,
        canWrite: deptPermission.canWrite,
        canDelete: deptPermission.canDelete,
      };
    }
    
    return { canRead: false, canWrite: false, canDelete: false };
  };

  const handleCreateLibrary = async (values: any) => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Build permissions array based on member selection
      const permissions: LibraryPermission[] = [];
      
      // Add creator permission if included
      if (memberSelection.includeCreator && user) {
        permissions.push({
          id: `${Date.now()}-creator`,
          targetId: user.id,
          type: 'user',
          canRead: true,
          canWrite: true,
          canDelete: true,
        });
      }
      
      // Add selected users permissions
      memberSelection.selectedUsers.forEach((userId, index) => {
        const selectedUser = mockUsers.find(u => u.id === userId);
        if (selectedUser) {
          permissions.push({
            id: `${Date.now()}-user-${index}`,
            targetId: selectedUser.id,
            type: 'user',
            canRead: true,
            canWrite: false,
            canDelete: false,
          });
        }
      });
      
      // Add selected departments permissions
      memberSelection.selectedDepartments.forEach((deptName, index) => {
        permissions.push({
          id: `${Date.now()}-dept-${index}`,
          targetId: deptName,
          type: 'department',
          canRead: true,
          canWrite: false,
          canDelete: false,
        });
      });
      
      const newLibrary: Library = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        createdBy: user!,
        createdAt: new Date(),
        permissions,
        fileCount: 0,
      };
      
      setLibraries(prev => [...prev, newLibrary]);
      setIsLibraryModalVisible(false);
      libraryForm.resetFields();
      
      // Reset member selection
      setMemberSelection({
        includeCreator: true,
        selectedUsers: [],
        selectedDepartments: [],
      });
      
      message.success(t('common.success') + '!');
    } catch (error) {
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const selectedLibraryData = libraries.find(lib => lib.id === selectedLibrary);
  const libraryPermissions = selectedLibraryData ? getLibraryPermissions(selectedLibraryData) : null;

  const tabItems = [
    {
      key: 'all',
      label: (
        <span>
          <GlobalOutlined />
          {t('libraries.allLibraries')}
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {/* Libraries List */}
          <Col xs={24} lg={selectedLibrary ? 6 : 24}>
            <Card 
              title="Libraries" 
              size="small"
              extra={
                canAccess([UserRole.ADMIN, UserRole.SUPER_ADMIN]) && (
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={() => setIsLibraryModalVisible(true)}
                  >
                    New Library
                  </Button>
                )
              }
            >
              <List
                dataSource={libraries.filter(canAccessLibrary)}
                renderItem={(library) => (
                  <List.Item
                    className={`cursor-pointer p-3 rounded hover:bg-gray-50 ${
                      selectedLibrary === library.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedLibrary(library.id)}
                  >
                    <List.Item.Meta
                      avatar={<FolderOutlined className="text-xl text-blue-500" />}
                      title={library.name}
                      description={
                        <div>
                          <div className="text-gray-600">{library.description}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {library.fileCount} files • Created by {library.createdBy.name}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            👥 {getMemberCount(library)}
                          </div>
                        </div>
                      }
                    />
                    {canEditLibrary(library) && (
                      <Button icon={<SettingOutlined />} size="small" type="text" />
                    )}
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Library Manager */}
          {selectedLibrary && selectedLibraryData && (
            <Col xs={24} lg={18}>
              <LibrariesManager
                mode="all"
                canWrite={libraryPermissions?.canWrite || false}
                canDelete={libraryPermissions?.canDelete || false}
                title={`${selectedLibraryData.name} - ${selectedLibraryData.description}`}
                onDocumentsChange={() => {
                  // Refresh library data when files change
                  const updatedLibrary = { ...selectedLibraryData, fileCount: selectedLibraryData.fileCount + 1 };
                  setLibraries(prev => prev.map(lib => 
                    lib.id === selectedLibrary ? updatedLibrary : lib
                  ));
                }}
              />
            </Col>
          )}

          {!selectedLibrary && (
            <Col xs={24}>
              <Card className="text-center py-12">
                <FolderOutlined className="text-6xl text-gray-300 mb-4" />
                <Title level={4} type="secondary">Select a Library</Title>
                <p className="text-gray-500">
                  Choose a library from the list to view and manage its files
                </p>
              </Card>
            </Col>
          )}
        </Row>
      ),
    },
    {
      key: 'personal',
      label: (
        <span>
          <UserOutlined />
          {t('libraries.myLibraries')}
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          {/* My Libraries List */}
          <Col xs={24} lg={selectedLibrary ? 6 : 24}>
            <Card 
              title={t('libraries.myLibraries')} 
              size="small"
              extra={
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  size="small"
                  onClick={() => setIsLibraryModalVisible(true)}
                >
                  {t('libraries.newLibrary')}
                </Button>
              }
            >
              <List
                dataSource={libraries.filter(lib => lib.createdBy.id === user?.id)}
                renderItem={(library) => (
                  <List.Item
                    className={`cursor-pointer p-3 rounded hover:bg-gray-50 ${
                      selectedLibrary === library.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                    }`}
                    onClick={() => setSelectedLibrary(library.id)}
                  >
                    <List.Item.Meta
                      avatar={<FolderOutlined className="text-xl text-blue-500" />}
                      title={library.name}
                      description={
                        <div>
                          <div className="text-gray-600">{library.description}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            {library.fileCount} {t('libraries.files')} • {t('libraries.createdBy')} {library.createdBy.name}
                          </div>
                          <div className="text-xs text-blue-600 mt-1">
                            👥 {getMemberCount(library)}
                          </div>
                        </div>
                      }
                    />
                    <Button icon={<SettingOutlined />} size="small" type="text" />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Library Manager for My Libraries */}
          {selectedLibrary && selectedLibraryData && (
            <Col xs={24} lg={18}>
              <LibrariesManager
                mode="personal"
                canWrite={true}
                canDelete={true}
                title={`${selectedLibraryData.name} - ${selectedLibraryData.description}`}
                onDocumentsChange={() => {
                  // Refresh library data when files change
                  const updatedLibrary = { ...selectedLibraryData, fileCount: selectedLibraryData.fileCount + 1 };
                  setLibraries(prev => prev.map(lib => 
                    lib.id === selectedLibrary ? updatedLibrary : lib
                  ));
                }}
              />
            </Col>
          )}

          {!selectedLibrary && (
            <Col xs={24}>
              <Card className="text-center py-12">
                <FolderOutlined className="text-6xl text-gray-300 mb-4" />
                <Title level={4} type="secondary">{t('libraries.selectLibrary')}</Title>
                <p className="text-gray-500">
                  {t('libraries.chooseLibraryMessage')}
                </p>
              </Card>
            </Col>
          )}
        </Row>
      ),
    },
  ];

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Text type="secondary">{t('libraries.loadingLibraries')}</Text>
          </div>
        </Card>
      </div>
    );
  }

  // Show empty state if no libraries
  if (libraries.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <FolderOutlined style={{ color: '#1890ff' }} />
                {t('libraries.libraryManagementSystem')}
              </Title>
              <Text type="secondary">
                {t('libraries.organizeAndAccessLibraries')}
              </Text>
            </Col>
          </Row>
        </Card>
        
        <Card className="text-center py-12">
          <FolderOutlined className="text-6xl text-gray-300 mb-4" />
          <Title level={4} type="secondary">{t('libraries.noLibrariesFound')}</Title>
          <p className="text-gray-500 mb-4">{t('libraries.createFirstLibrary')}</p>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsLibraryModalVisible(true)}
          >
            {t('libraries.createLibrary')}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FolderOutlined style={{ color: '#1890ff' }} />
              {t('libraries.libraryManagementSystem')}
            </Title>
            <Text type="secondary">
              {t('libraries.organizeAndAccessLibraries')}
            </Text>
          </Col>
        </Row>

        <Divider />

        {/* Features Overview */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <GlobalOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <Title level={5}>{t('libraries.allLibraries')}</Title>
              <Text type="secondary">{t('libraries.companyWideLibraries')}</Text>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ textAlign: 'center', padding: '16px' }}>
              <UserOutlined style={{ fontSize: '24px', color: '#722ed1', marginBottom: '8px' }} />
              <Title level={5}>{t('libraries.myLibraries')}</Title>
              <Text type="secondary">{t('libraries.privateLibraryStorage')}</Text>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Library Tabs */}
      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
        />
      </Card>

      {/* Create Library Modal */}
      <Modal
        title={t("libraries.createLibrary")}
        open={isLibraryModalVisible}
        onCancel={() => setIsLibraryModalVisible(false)}
        footer={null}
      >
        <Form
          form={libraryForm}
          onFinish={handleCreateLibrary}
          layout="vertical"
        >
          <Form.Item
            label={t("libraries.libraryName")}
            name="name"
            rules={[{ required: true, message: t('libraries.pleaseEnterLibraryName') }]}
          >
            <Input placeholder={t('libraries.enterLibraryName')} />
          </Form.Item>

          <Form.Item
            label={t("libraries.libraryDescription")}
            name="description"
          >
            <TextArea
              rows={3}
              placeholder={t('libraries.enterLibraryDescription')}
            />
          </Form.Item>

          <Divider />
          
          <Title level={5}>{t("libraries.libraryMembers")}</Title>
          
          <Form.Item>
            <Checkbox
              checked={memberSelection.includeCreator}
              onChange={(e) => 
                setMemberSelection(prev => ({ 
                  ...prev, 
                  includeCreator: e.target.checked 
                }))
              }
            >
              {t("files.includeMyself") || "Include myself as a member"}
            </Checkbox>
          </Form.Item>

          <Form.Item label={t("files.selectUsers") || "Select Users"}>
            <Select
              mode="multiple"
              placeholder={t("files.selectUsers") || "Select Users"}
              value={memberSelection.selectedUsers}
              onChange={(value) => 
                setMemberSelection(prev => ({ 
                  ...prev, 
                  selectedUsers: value 
                }))
              }
              style={{ width: '100%' }}
            >
              {mockUsers.map(user => (
                <Select.Option key={user.id} value={user.id}>
                  {user.name} ({user.email})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label={t("files.selectDepartments") || "Select Departments"}>
            <Select
              mode="multiple"
              placeholder={t("files.selectDepartments") || "Select Departments"}
              value={memberSelection.selectedDepartments}
              onChange={(value) => 
                setMemberSelection(prev => ({ 
                  ...prev, 
                  selectedDepartments: value 
                }))
              }
              style={{ width: '100%' }}
            >
              {mockDepartments.map(dept => (
                <Select.Option key={dept} value={dept}>
                  {dept}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Divider />

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t("common.create") || "Create"}
              </Button>
              <Button onClick={() => setIsLibraryModalVisible(false)}>
                {t("common.cancel") || "Cancel"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
