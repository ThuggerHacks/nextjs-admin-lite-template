'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Table, Modal, Form, Input, Select, message, Space, Popconfirm, Card, Typography, Switch } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UsergroupAddOutlined } from '@ant-design/icons';
import { departmentService, userService } from '@/lib/services';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { UserRole } from '@/types';
import type { Department, CreateDepartmentRequest } from '@/lib/services/departmentService';
import type { User } from '@/lib/services/userService';
import { MdOutlineRefresh } from 'react-icons/md';

const { Title, Text } = Typography;
const { Option } = Select;

const DepartmentsPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string | null>(null);
  const [canSeeTemperatureMenu, setCanSeeTemperatureMenu] = useState<boolean>(false);

  const { user, canAccess, hasRole } = useUser();
  const { t } = useTranslation();

  // Load departments
  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const departments = await departmentService.getAll();
      setDepartments(departments || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
      message.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  // Load users for supervisor selection
  const loadUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      const response = await userService.getAll();
      setUsers(response.users || []);
    } catch (error) {
      console.error('Failed to load users:', error);
      message.error(t('common.error'));
      setUsers([]);
    } finally {
      setUsersLoading(false);
    }
  }, [t]);

  useEffect(() => {
    loadDepartments();
    loadUsers();
  }, []);

  const handleCreate = () => {
    setEditingDepartment(null);
    setIsModalVisible(true);
    setSelectedSupervisorId(null);
    setCanSeeTemperatureMenu(false);
    form.resetFields();
  };

  const handleEdit = (department: Department) => {
    console.log('Editing department:', department);
    console.log('canSeeTemperatureMenu from department:', department.canSeeTemperatureMenu);
    setEditingDepartment(department);
    setIsModalVisible(true);
    const supervisorId = department.supervisorId || null;
    setSelectedSupervisorId(supervisorId);
    const temperatureMenuValue = department.canSeeTemperatureMenu || false;
    setCanSeeTemperatureMenu(temperatureMenuValue);
    form.setFieldsValue({
      name: department.name,
      description: department.description,
      supervisorId: supervisorId,
      canSeeTemperatureMenu: temperatureMenuValue,
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await departmentService.delete(id);
      message.success(t('common.success'));
      loadDepartments();
    } catch (error) {
      console.error('Failed to delete department:', error);
      message.error(t('common.error'));
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      console.log('Form values:', values);
      console.log('canSeeTemperatureMenu value:', values.canSeeTemperatureMenu);
      
      const departmentData: CreateDepartmentRequest = {
        name: values.name,
        description: values.description,
        supervisorId: selectedSupervisorId || undefined,
        canSeeTemperatureMenu: canSeeTemperatureMenu,
      };

      console.log('Frontend sending department data:', departmentData);

      if (editingDepartment) {
        const result = await departmentService.update(editingDepartment.id, departmentData);
        if (result) {
          message.success(t('common.success'));
          setIsModalVisible(false);
          form.resetFields();
          setSelectedSupervisorId(null);
          loadDepartments();
        } else {
          message.error(t('common.error'));
        }
      } else {
        const result = await departmentService.create(departmentData);
        if (result) {
          message.success(t('common.success'));
          setIsModalVisible(false);
          form.resetFields();
          setSelectedSupervisorId(null);
          loadDepartments();
        } else {
          message.error(t('common.error'));
        }
      }
    } catch (error) {
      console.error('Failed to save department:', error);
      message.error(t('common.error'));
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedSupervisorId(null);
    setCanSeeTemperatureMenu(false);
    setEditingDepartment(null);
  };

  // Get users for supervisor selection (for supervisor selection)
  const getSupervisorUsers = () => {
    return users.filter(user => 
      user.status === 'ACTIVE' && 
      (user.role === 'SUPERVISOR' || user.role === 'ADMIN')
    );
  };

  // Filter departments based on search text
  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchText.toLowerCase()) ||
    (dept.description && dept.description.toLowerCase().includes(searchText.toLowerCase()))
  );

  const columns = [
    {
      title: t('departments.name'),
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Department, b: Department) => a.name.localeCompare(b.name),
    },
    {
      title: t('departments.description'),
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => text || '-',
    },
    {
      title: t('departments.supervisor'),
      key: 'supervisor',
      render: (record: Department) => {
        if (record.supervisor) {
          return (
            <div>
              <div style={{ fontWeight: 500 }}>{record.supervisor.name}</div>
              <div style={{ color: '#666', fontSize: '12px' }}>{record.supervisor.email}</div>
              <div style={{ color: '#888', fontSize: '11px' }}>Role: {record.supervisor.role}</div>
            </div>
          );
        } else {
          return (
            <span style={{ color: '#999', fontStyle: 'italic' }}>{t('departments.noSupervisor')}</span>
          );
        }
      },
    },
    {
      title: t('departments.usersCount'),
      key: 'usersCount',
      render: (record: Department) => {
        const userCount = record.users?.length || 0;
        return (
          <span>
            <UsergroupAddOutlined style={{ marginRight: 4 }} />
            {userCount} {t('departments.users')}
          </span>
        );
      },
    },
    {
      title: t('departments.createdAt'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
      sorter: (a: Department, b: Department) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: t('departments.actions'),
      key: 'actions',
      render: (record: Department) => (
        <Space>
          <Button
            type="primary"
            ghost
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            {t('departments.edit')}
          </Button>
          <Popconfirm
            title={t('departments.confirmDelete')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('common.yes')}
            cancelText={t('common.no')}
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              {t('departments.delete')}
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              {t("departments.departmentManagement")}
            </Title>
            <Text type="secondary">
              {t("departments.manageDepartments")}
            </Text>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              icon={<MdOutlineRefresh />}
              onClick={loadDepartments}
              loading={loading}
            >
              {t("common.refresh")}
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              {t("departments.addDepartment")}
            </Button>
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <Input.Search
            placeholder={t('common.search')}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={filteredDepartments}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} departments`,
          }}
        />
      </Card>

      <Modal
        title={editingDepartment ? t('departments.editDepartment') : t('departments.createDepartment')}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label={t('departments.departmentName')}
            rules={[
              { required: true, message: t('common.required') },
              { min: 2, message: 'Name must be at least 2 characters' },
            ]}
          >
            <Input placeholder={t('departments.departmentName')} />
          </Form.Item>

          <Form.Item
            name="description"
            label={t('departments.departmentDescription')}
            rules={[
              { max: 500, message: 'Description must be less than 500 characters' },
            ]}
          >
            <Input.TextArea
              placeholder={t('departments.departmentDescription')}
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="supervisorId"
            label={t('departments.supervisor')}
          >
            <Select
              placeholder={t('departments.selectSupervisor')}
              loading={usersLoading}
              allowClear
              showSearch
              value={selectedSupervisorId}
              onChange={(value) => {
                setSelectedSupervisorId(value);
                form.setFieldValue('supervisorId', value);
              }}
              filterOption={(input, option) =>
                option?.children?.toString().toLowerCase().includes(input.toLowerCase()) ?? false
              }
            >
              {getSupervisorUsers().map(user => (
                <Option key={user.id} value={user.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>{user.name}</span>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      {user.role} - {user.email}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
              {t('departments.supervisorNote')}
            </div>
          </Form.Item>

          <Form.Item
            label={t('departments.canSeeTemperatureMenu')}
          >
            <Switch 
              checked={canSeeTemperatureMenu}
              checkedChildren={t('common.yes')} 
              unCheckedChildren={t('common.no')}
              onChange={(checked) => {
                setCanSeeTemperatureMenu(checked);
                form.setFieldValue('canSeeTemperatureMenu', checked);
                console.log('Switch changed to:', checked);
              }}
            />
            <div style={{ marginTop: '4px', fontSize: '12px', color: '#666' }}>
              {t('departments.temperatureMenuNote')}
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DepartmentsPage;
