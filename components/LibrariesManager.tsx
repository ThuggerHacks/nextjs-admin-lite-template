'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Space,
  Modal,
  Form,
  Input,
  message,
  Table,
  Tooltip,
  Typography,
  Avatar,
  Input as AntInput,
  Empty,
  Divider,
  Select,
  Popconfirm,
  List,
  Skeleton,
  Tag,
  Tabs,
} from 'antd';
import {
  FolderOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
  SearchOutlined,
  ReloadOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/types';
import { libraryService } from '@/lib/services/libraryService';
import { userService } from '@/lib/services/userService';
import { libraryFileService } from '@/lib/services/libraryFileService';
import type { User as UserType } from '@/lib/services/userService';
import type { Library, LibraryMember } from '@/lib/services/libraryService';
import type { LibraryFolder, LibraryFile } from '@/lib/services/libraryFileService';
import LibraryFileManager from '@/components/LibraryFileManager';

const { TextArea } = Input;
const { Title, Text } = Typography;
const { Search } = AntInput;

interface LibrariesManagerProps {
  mode: 'all' | 'personal';
  canWrite?: boolean;
  canDelete?: boolean;
  title?: string;
}

interface CreateLibraryForm {
  name: string;
  description?: string;
  userIds: string[];
}

export default function LibrariesManager({
  mode,
  canWrite = false,
  canDelete = false,
  title,
}: LibrariesManagerProps) {
  const [libraries, setLibraries] = useState<Library[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isMembersModalVisible, setIsMembersModalVisible] = useState(false);
  const [isAddMemberModalVisible, setIsAddMemberModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [addMemberForm] = Form.useForm();
  const [users, setUsers] = useState<UserType[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);


  const { user } = useUser();
  const { t } = useTranslation();

  // Load libraries from API
  const loadLibraries = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      
      // Get libraries where user is a member (including created ones)
      const response = await libraryService.getMyLibraries();
      setLibraries(response);
      
    } catch (error) {
      console.error('Failed to load libraries:', error);
      message.error(t('libraries.error'));
      setLibraries([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id, t]);

  // Load users for member selection from API
  const loadUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      
      // Get all users from the same sucursal
      const response = await userService.getAll();
      setUsers(response.users);
    } catch (error) {
      console.error('Failed to load users:', error);
      message.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  // Load data only once when component mounts
  useEffect(() => {
    if (user?.id) {
      loadLibraries();
      loadUsers();
    }
  }, [user?.id]); // Only depend on user ID, not functions

  // Check if user can manage library
  const canManageLibrary = useCallback((library: Library) => {
    if (!user) return false;
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPER_ADMIN) return true;
    return library.userId === user.id; // Only creator can manage
  }, [user]);

  // Get member count from library
  const getMemberCount = useCallback((library: Library) => {
    if (library._count?.members) {
      return library._count.members;
    }
    return library.members?.length || 0;
  }, []);

  // Filter libraries based on search - memoized to prevent unnecessary recalculations
  const filteredLibraries = useMemo(() => {
    return libraries.filter(library =>
      library.name.toLowerCase().includes(searchText.toLowerCase()) ||
      library.description?.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [libraries, searchText]);

  // Library columns for table - memoized to prevent recreation
  const libraryColumns = useMemo(() => [
    {
      title: t('libraries.libraryName'),
      dataIndex: 'name',
      key: 'name',
      render: (name: string, library: Library) => (
        <div className="flex items-center space-x-3">
          <FolderOutlined className="text-blue-500 text-xl" />
          <div>
            <div className="font-medium cursor-pointer hover:text-blue-600" 
                 onClick={() => setSelectedLibrary(library)}>
              {name}
            </div>
            {library.description && (
              <div className="text-sm text-gray-500">{library.description}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: t('libraries.createdBy'),
      dataIndex: 'user',
      key: 'createdBy',
      render: (user: any) => (
        <div className="flex items-center space-x-2">
          <Avatar size="small" icon={<UserOutlined />} />
          <span>{user?.name}</span>
        </div>
      ),
    },
    {
      title: t('libraries.members'),
      key: 'members',
      render: (library: Library) => (
        <div className="flex items-center space-x-2">
          <TeamOutlined className="text-gray-400" />
          <span>{getMemberCount(library)} {getMemberCount(library) === 1 ? 'member' : 'members'}</span>
        </div>
      ),
    },
    {
      title: t('libraries.actions'),
      key: 'actions',
      render: (library: Library) => (
        <Space>
          <Tooltip title={t('libraries.edit')}>
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setSelectedLibrary(library);
                editForm.setFieldsValue({
                  name: library.name,
                  description: library.description,
                });
                setIsEditModalVisible(true);
              }}
              disabled={!canManageLibrary(library)}
            />
          </Tooltip>
          <Tooltip title={t('libraries.libraryMembers')}>
            <Button
              icon={<TeamOutlined />}
              size="small"
              onClick={() => {
                setSelectedLibrary(library);
                setIsMembersModalVisible(true);
              }}
            />
          </Tooltip>
          {canManageLibrary(library) && (
            <Popconfirm
              title={t('libraries.libraryDeleteConfirm')}
              description={t('libraries.libraryDeleteWarning')}
              onConfirm={() => handleDeleteLibrary(library.id)}
              okText={t('libraries.yes')}
              cancelText={t('libraries.no')}
            >
              <Tooltip title={t('libraries.delete')}>
                <Button
                  icon={<DeleteOutlined />}
                  size="small"
                  danger
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ], [t, getMemberCount, canManageLibrary]);

  // Safety check for user context
  if (!user) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="text-lg">Loading user context...</div>
          <div className="text-sm text-gray-500">Please wait while we load your profile</div>
        </div>
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  // Handle library creation
  const handleCreateLibrary = async (values: CreateLibraryForm) => {
    try {
      setLoading(true);
      
      // Create library with API
      const newLibrary = await libraryService.create({
        name: values.name,
        description: values.description,
        userIds: values.userIds || [],
      });

      // Refresh libraries list
      await loadLibraries();
      
      setIsCreateModalVisible(false);
      createForm.resetFields();
      message.success(t('libraries.libraryCreated'));
    } catch (error) {
      console.error('Failed to create library:', error);
      message.error(t('libraries.libraryCreationFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle library update
  const handleUpdateLibrary = async (values: { name?: string; description?: string }) => {
    if (!selectedLibrary) return;

    try {
      setLoading(true);
      
      // Update library with API
      await libraryService.update(selectedLibrary.id, values);
      
      // Refresh libraries list
      await loadLibraries();
      
      setIsEditModalVisible(false);
      editForm.resetFields();
      message.success(t('libraries.libraryUpdateSuccess'));
    } catch (error) {
      console.error('Failed to update library:', error);
      message.error(t('libraries.libraryUpdateFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle library deletion
  const handleDeleteLibrary = async (libraryId: string) => {
    try {
      setLoading(true);
      
      // Delete library with API
      await libraryService.delete(libraryId);
      
      // Refresh libraries list
      await loadLibraries();
      
      if (selectedLibrary?.id === libraryId) {
        setSelectedLibrary(null);
      }
      message.success(t('libraries.libraryDeleteSuccess'));
    } catch (error) {
      console.error('Failed to delete library:', error);
      message.error(t('libraries.libraryDeleteFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle adding member
  const handleAddMember = async (values: { userId: string }) => {
    if (!selectedLibrary) return;

    try {
      setLoading(true);
      
      // Add member with API
      await libraryService.addMember(selectedLibrary.id, { userId: values.userId });
      
      // Refresh libraries list to get updated member count
      await loadLibraries();
      
      setIsAddMemberModalVisible(false);
      addMemberForm.resetFields();
      message.success(t('libraries.memberAddedSuccess'));
    } catch (error) {
      console.error('Failed to add member:', error);
      message.error(t('libraries.memberAddFailed'));
    } finally {
      setLoading(false);
    }
  };

  // Handle removing member
  const handleRemoveMember = async (memberId: string) => {
    if (!selectedLibrary) return;

    try {
      setLoading(true);
      
      // Remove member with API
      await libraryService.removeMember(selectedLibrary.id, memberId);
      
      // Refresh libraries list to get updated member count
      await loadLibraries();
      
      message.success(t('libraries.memberRemovedSuccess'));
    } catch (error) {
      console.error('Failed to remove member:', error);
      message.error(t('libraries.memberRemoveFailed'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  // If a library is selected, show files/folders directly
  if (selectedLibrary) {
    return (
      <div className="space-y-6">
        <Card>
          <Row justify="space-between" align="middle">
            <Col>
          <Button 
                icon={<FolderOutlined />} 
                onClick={() => setSelectedLibrary(null)}
                style={{ marginBottom: '16px' }}
              >
                ← {t('libraries.backToLibraries')}
          </Button>
              <Title level={2}>{selectedLibrary.name}</Title>
              {selectedLibrary.description && (
                <Text type="secondary">{selectedLibrary.description}</Text>
              )}
            </Col>
          </Row>
        </Card>

        <Card>
          <LibraryFileManager
            libraryId={selectedLibrary.id}
            libraryName={selectedLibrary.name}
            canWrite={true}
            canDelete={canManageLibrary(selectedLibrary)}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <Card>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={3} style={{ margin: 0 }}>
              {title || t('libraries.libraryManagementSystem')}
            </Title>
            <Text type="secondary">
              {t('libraries.privateLibraryStorage')}
            </Text>
          </Col>
          <Col>
            <Space>
              <Search
                placeholder={t('libraries.search')}
                allowClear
                style={{ width: 200 }}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              <Button 
                icon={<ReloadOutlined />} 
                onClick={loadLibraries}
                loading={loading}
              >
                {t('libraries.refresh')}
              </Button>
          {canWrite && (
              <Button
                type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => setIsCreateModalVisible(true)}
              >
                  {t('libraries.createLibrary')}
              </Button>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Libraries table */}
      <Card>
        {filteredLibraries.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <span>
                {libraries.length === 0 
                  ? t('libraries.noLibrariesFound')
                  : t('libraries.noResultsFound')
                }
              </span>
            }
          />
        ) : (
          <Table
            columns={libraryColumns}
            dataSource={filteredLibraries}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} items`,
            }}
          />
        )}
      </Card>

      {/* Create Library Modal */}
      <Modal
        title={t('libraries.createLibrary')}
        open={isCreateModalVisible}
        onCancel={() => {
          setIsCreateModalVisible(false);
          createForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={createForm}
          onFinish={handleCreateLibrary}
          layout="vertical"
        >
          <Form.Item
            label={t('libraries.libraryName')}
            name="name"
            rules={[{ required: true, message: t('libraries.pleaseEnterLibraryName') }]}
          >
            <Input placeholder={t('libraries.enterLibraryName')} />
          </Form.Item>
          
          <Form.Item
            label={t('libraries.libraryDescription')}
            name="description"
          >
            <TextArea
              rows={3}
              placeholder={t('libraries.enterLibraryDescription')}
            />
          </Form.Item>
          
          <Form.Item
            label={t('libraries.libraryMembers')}
            name="userIds"
          >
                <Select
                  mode="multiple"
              placeholder={t('libraries.selectUsersPlaceholder')}
              loading={loadingUsers}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {users
                .filter(u => u.id !== user.id) // Don't show current user
                .map(u => (
                  <Select.Option key={u.id} value={u.id}>
                    {u.name} ({u.email}) - {u.department?.name || 'No Department'}
                    </Select.Option>
                ))
              }
                </Select>
              </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('libraries.create')}
              </Button>
              <Button onClick={() => setIsCreateModalVisible(false)}>
                {t('libraries.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Library Modal */}
      <Modal
        title={t('libraries.libraryUpdate')}
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={editForm}
          onFinish={handleUpdateLibrary}
          layout="vertical"
        >
          <Form.Item
            label={t('libraries.libraryName')}
            name="name"
            rules={[{ required: true, message: t('libraries.pleaseEnterLibraryName') }]}
          >
            <Input placeholder={t('libraries.enterLibraryName')} />
          </Form.Item>
          
          <Form.Item
            label={t('libraries.libraryDescription')}
            name="description"
          >
            <TextArea
              rows={3}
              placeholder={t('libraries.enterLibraryDescription')}
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('libraries.update')}
              </Button>
              <Button onClick={() => setIsEditModalVisible(false)}>
                {t('libraries.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Library Members Modal */}
      <Modal
        title={selectedLibrary ? `${selectedLibrary.name} - ${t('libraries.libraryMembers')}` : t('libraries.libraryMembers')}
        open={isMembersModalVisible}
        onCancel={() => {
          setIsMembersModalVisible(false);
        }}
        footer={null}
        width={800}
      >
        {selectedLibrary ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Text strong>{t('libraries.members')}: {getMemberCount(selectedLibrary)}</Text>
              {canManageLibrary(selectedLibrary) && (
                <Button
                  type="primary"
                  icon={<UserAddOutlined />}
                  onClick={() => setIsAddMemberModalVisible(true)}
                >
                  {t('libraries.addMember')}
              </Button>
              )}
            </div>

            <Divider />

            {selectedLibrary.members && selectedLibrary.members.length > 0 ? (
              <List
                dataSource={selectedLibrary.members}
                renderItem={(member) => (
                  <List.Item
                    actions={
                      canManageLibrary(selectedLibrary) && member.userId !== selectedLibrary.userId ? (
                        [
                          <Popconfirm
                            key="remove"
                            title={t('libraries.removeMemberConfirm')}
                            description={t('libraries.removeMemberWarning')}
                            onConfirm={() => handleRemoveMember(member.userId)}
                            okText={t('libraries.yes')}
                            cancelText={t('libraries.no')}
                          >
                            <Button
                              icon={<UserDeleteOutlined />}
                              size="small"
                              danger
                            >
                              {t('libraries.remove')}
              </Button>
                          </Popconfirm>
                        ]
                      ) : []
                    }
                  >
                    <List.Item.Meta
                      avatar={<Avatar icon={<UserOutlined />} />}
                      title={
                        <div className="flex items-center space-x-2">
                          <span>{member.user.name}</span>
                          {member.userId === selectedLibrary.userId && (
                            <Tag color="blue">{t('libraries.creator')}</Tag>
                          )}
                          <Tag color="green">{member.user.role}</Tag>
                        </div>
                      }
                      description={member.user.email}
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Empty description={t('libraries.noMembers')} />
            )}
          </div>
        ) : (
          <Empty description={t('libraries.selectLibraryFirst')} />
        )}
      </Modal>

      {/* Add Member Modal */}
      <Modal
        title={t('libraries.addMember')}
        open={isAddMemberModalVisible}
        onCancel={() => {
          setIsAddMemberModalVisible(false);
        }}
        footer={null}
        width={500}
      >
        <Form
          form={addMemberForm}
          onFinish={handleAddMember}
          layout="vertical"
        >
          <Form.Item
            label={t('libraries.selectUser')}
            name="userId"
            rules={[{ required: true, message: t('libraries.pleaseSelectUser') }]}
          >
            <Select
              placeholder={t('libraries.selectUser')}
              showSearch
              filterOption={(input, option) =>
                (option?.children as unknown as string)?.toLowerCase().includes(input.toLowerCase())
              }
            >
              {users
                .filter(u => 
                  u.id !== user.id && // Don't show current user
                  !selectedLibrary?.members?.some(m => m.userId === u.id) // Don't show existing members
                )
                .map(u => (
                  <Select.Option key={u.id} value={u.id}>
                    {u.name} ({u.email}) - {u.department?.name || 'No Department'}
                  </Select.Option>
                ))
              }
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                {t('libraries.add')}
              </Button>
              <Button onClick={() => setIsAddMemberModalVisible(false)}>
                {t('libraries.cancel')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
