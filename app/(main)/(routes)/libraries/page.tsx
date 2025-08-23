'use client';

import React, { useState } from 'react';
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
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { Library, LibraryPermission, LibraryMemberSelection, UserRole } from '@/types';
import FileManager from '@/components/FileManager/FileManager';
import EnhancedFileManager from '@/components/EnhancedFileManager';

const { TextArea } = Input;
const { Title } = Typography;

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
  const [libraries, setLibraries] = useState<Library[]>(mockLibraries);
  const [selectedLibrary, setSelectedLibrary] = useState<string | null>(null);
  const [isLibraryModalVisible, setIsLibraryModalVisible] = useState(false);
  const [libraryForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('libraries');
  
  // Member selection state
  const [memberSelection, setMemberSelection] = useState<LibraryMemberSelection>({
    includeCreator: true,
    selectedUsers: [],
    selectedDepartments: [],
  });
  
  const { user, hasRole, canAccess } = useUser();
  const { t } = useTranslation();

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
      p.type === 'department' && p.targetId === user?.department
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
      key: 'libraries',
      label: 'Libraries',
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

          {/* Enhanced File Manager */}
          {selectedLibrary && selectedLibraryData && (
            <Col xs={24} lg={18}>
              <EnhancedFileManager
                mode="library"
                libraryId={selectedLibrary}
                libraryName={selectedLibraryData.name}
                canWrite={libraryPermissions?.canWrite || false}
                canDelete={libraryPermissions?.canDelete || false}
                title={`${selectedLibraryData.name} - ${selectedLibraryData.description}`}
                rootPath={`/Libraries/${selectedLibraryData.name}`}
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
  ];

  return (
    <div className="space-y-6">
      <Card>
        <Title level={3} className="mb-2">
          📚 {t("navigation.libraries")}
        </Title>
        <p className="text-gray-600">
          Manage your document libraries with full file management capabilities
        </p>
      </Card>

      <Card>
        <Tabs items={tabItems} activeKey={activeTab} onChange={setActiveTab} />
      </Card>

      {/* Create Library Modal */}
      <Modal
        title={t("files.createLibrary")}
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
            label={t("files.libraryName")}
            name="name"
            rules={[{ required: true, message: 'Please enter library name' }]}
          >
            <Input placeholder="Enter library name" />
          </Form.Item>

          <Form.Item
            label={t("files.libraryDescription")}
            name="description"
          >
            <TextArea
              rows={3}
              placeholder="Enter library description (optional)"
            />
          </Form.Item>

          <Divider />
          
          <Title level={5}>{t("files.libraryMembers")}</Title>
          
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
              {t("files.includeMyself")}
            </Checkbox>
          </Form.Item>

          <Form.Item label={t("files.selectUsers")}>
            <Select
              mode="multiple"
              placeholder={t("files.selectUsers")}
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

          <Form.Item label={t("files.selectDepartments")}>
            <Select
              mode="multiple"
              placeholder={t("files.selectDepartments")}
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
                {t("common.create")}
              </Button>
              <Button onClick={() => setIsLibraryModalVisible(false)}>
                {t("common.cancel")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
