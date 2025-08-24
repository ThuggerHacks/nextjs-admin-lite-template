"use client";

import React, { useState, useEffect } from "react";
import { 
  Card, 
  Form, 
  Input, 
  Button, 
  Select, 
  Avatar, 
  Row, 
  Col, 
  Divider, 
  message,
  Upload,
  Space,
  Tag,
  Alert,
  Progress,
  Typography,
  Modal,
  Tabs,
  Descriptions,
  Badge,
  Tooltip,
  Switch,
  notification
} from "antd";
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  UploadOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  BankOutlined,
  CrownOutlined,
  LockOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  SecurityScanOutlined,
  CalendarOutlined,
  IdcardOutlined,
  GlobalOutlined,
  BellOutlined,
  KeyOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CodeOutlined
} from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { UserRole, UserStatus } from "@/types";
import { userService } from "@/lib/services/userService";
import { departmentService } from "@/lib/services/departmentService";

const { Option } = Select;
const { TextArea } = Input;
const { Text, Title } = Typography;
const { TabPane } = Tabs;

export default function ProfilePage() {
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([]);
  
  const { user, updateCurrentUser } = useUser();
  const { t } = useTranslation();

  useEffect(() => {
    // Fetch departments from the backend
    const fetchDepartments = async () => {
      try {
        const deps = await departmentService.getAllDepartments();
        setDepartments(deps.map(dept => ({ id: dept.id, name: dept.name })));
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        // Fallback to hardcoded departments if API fails
        setDepartments([
          { id: '1', name: 'Administração Geral' },
          { id: '2', name: 'Recursos Humanos' },
          { id: '3', name: 'Vendas' },
          { id: '4', name: 'Marketing' },
          { id: '5', name: 'TI' },
          { id: '6', name: 'Financeiro' },
          { id: '7', name: 'Operações' },
          { id: '8', name: 'Jurídico' }
        ]);
      }
    };

    fetchDepartments();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const getUserRoleInfo = () => {
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return {
          label: t("users.userTypes.SUPER_ADMIN"),
          color: 'red',
          icon: <CrownOutlined />,
          description: t("profile.roleDescriptions.superAdmin")
        };
      case UserRole.ADMIN:
        return {
          label: t("users.userTypes.ADMIN"),
          color: 'blue',
          icon: <BankOutlined />,
          description: t("profile.roleDescriptions.admin")
        };
      case UserRole.SUPERVISOR:
        return {
          label: t("users.userTypes.SUPERVISOR"),
          color: 'purple',
          icon: <SecurityScanOutlined />,
          description: t("profile.roleDescriptions.supervisor")
        };
      case UserRole.USER:
        return {
          label: t("users.userTypes.USER"),
          color: 'green',
          icon: <UserOutlined />,
          description: t("profile.roleDescriptions.user")
        };
      case UserRole.DEVELOPER:
        return {
          label: t("users.userTypes.DEVELOPER"),
          color: 'orange',
          icon: <CodeOutlined />,
          description: t("profile.roleDescriptions.developer")
        };
      default:
        return {
          label: 'Unknown',
          color: 'default',
          icon: <UserOutlined />,
          description: ''
        };
    }
  };

  const getUserStatusInfo = () => {
    switch (user.status) {
      case UserStatus.ACTIVE:
        return { color: 'success', text: t("users.active") };
              case UserStatus.INACTIVE:
          return { color: 'error', text: t("users.inactive") };
        case UserStatus.PENDING:
          return { color: 'warning', text: t("users.pending") };
      default:
        return { color: 'default', text: 'Unknown' };
    }
  };

  const roleInfo = getUserRoleInfo();
  const statusInfo = getUserStatusInfo();

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      // Update user profile via API
      const updatedUser = await userService.updateProfile({
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        departmentId: values.department
      });
      
      // Update user context
      updateCurrentUser({
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        address: updatedUser.address,
        departmentId: updatedUser.departmentId,
        department: updatedUser.department
      });
      setIsEditing(false);
      
      notification.success({
        message: t("profile.profileUpdated"),
        description: t("profile.profileUpdateSuccess"),
        placement: 'topRight'
      });
    } catch (error: any) {
      notification.error({
        message: t("profile.failedToUpdateProfile"),
        description: error.message || t("profile.updateError"),
        placement: 'topRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    setPasswordLoading(true);
    try {
      await userService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword
      });
      
      setShowPasswordModal(false);
      passwordForm.resetFields();
      
      notification.success({
        message: t("profile.passwordChanged"),
        description: t("profile.passwordChangeSuccess"),
        placement: 'topRight'
      });
    } catch (error: any) {
      notification.error({
        message: t("profile.failedToChangePassword"),
        description: error.message || t("profile.passwordChangeError"),
        placement: 'topRight'
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      address: user.address || '',
      department: user.departmentId || '',
    });
    setIsEditing(false);
  };

  const uploadProps = {
    beforeUpload: async (file: any) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error(t("profile.onlyImageFiles"));
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error(t("profile.imageSizeLimit"));
        return false;
      }
      
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        // Upload avatar using the userService method
        const result = await userService.uploadProfilePicture(file);
        setAvatarUrl(result.avatar);
        
        // Update user context with new avatar
        updateCurrentUser({ avatar: result.avatar });
        
        message.success(t("profile.avatarUploaded"));
      } catch (error) {
        console.error('Avatar upload error:', error);
        message.error(t("profile.failedToUploadAvatar"));
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
      
      return false; // Prevent auto upload
    },
  };

  const renderProfileOverview = () => (
    <Card className="h-full">
      <div className="text-center">
        <div className="mb-6">
          {isEditing ? (
            <div>
              <Upload {...uploadProps} showUploadList={false}>
                <div className="cursor-pointer">
                  <Avatar 
                    size={120} 
                    src={avatarUrl || user.avatar}
                    icon={!avatarUrl && !user.avatar && <UserOutlined />}
                    className="border-4 border-gray-200 hover:border-blue-300 transition-colors"
                  />
                  <div className="mt-2 text-sm text-blue-500">
                    <UploadOutlined /> {t("profile.clickToChange")}
                  </div>
                </div>
              </Upload>
              
              {isUploading && (
                <div className="mt-3">
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {t("profile.uploadingAvatar")} {Math.round(uploadProgress)}%
                  </Text>
                  <Progress
                    percent={Math.round(uploadProgress)}
                    size="small"
                    status={uploadProgress === 100 ? 'success' : 'active'}
                    className="mt-2"
                  />
                </div>
              )}
            </div>
          ) : (
            <Avatar 
              size={120} 
              src={user.avatar}
              icon={!user.avatar && <UserOutlined />}
              className="border-4 border-gray-200"
            />
          )}
        </div>
        
        <Title level={3} className="mb-3">{user.name}</Title>
        
        <Space direction="vertical" align="center" className="w-full mb-4">
          <Badge 
            status={statusInfo.color as any} 
            text={statusInfo.text}
            className="text-sm"
          />
          <Tag color={roleInfo.color} icon={roleInfo.icon} className="px-3 py-1">
            {roleInfo.label}
          </Tag>
          <p className="text-gray-600 text-sm max-w-xs">{roleInfo.description}</p>
        </Space>

        <Divider />

        <Space direction="vertical" align="start" className="w-full text-left">
          <div className="flex items-center gap-2 text-sm">
            <BankOutlined className="text-gray-500" />
            <span>{user.department?.name || t("profile.noDepartment")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MailOutlined className="text-gray-500" />
            <span className="break-all">{user.email}</span>
          </div>
          {user.phone && (
            <div className="flex items-center gap-2 text-sm">
              <PhoneOutlined className="text-gray-500" />
              <span>{user.phone}</span>
            </div>
          )}
          {user.address && (
            <div className="flex items-center gap-2 text-sm">
              <HomeOutlined className="text-gray-500" />
              <span className="break-words">{user.address}</span>
            </div>
          )}
        </Space>

        {!isEditing && (
          <Button 
            type="primary" 
            icon={<EditOutlined />}
            onClick={() => setIsEditing(true)}
            className="mt-6"
            block
          >
            {t("profile.editProfile")}
          </Button>
        )}
      </div>
    </Card>
  );

  const renderAccountInfo = () => (
    <Card title={t("profile.accountInfo")} className="mt-4">
      <Descriptions column={1} size="small">
        <Descriptions.Item label={t("profile.memberSince")}>
          {new Date(user.createdAt).toLocaleDateString()}
        </Descriptions.Item>
        <Descriptions.Item label={t("profile.lastLogin")}>
          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : t("profile.never")}
        </Descriptions.Item>
        <Descriptions.Item label={t("profile.userId")}>
          <Text code className="text-xs">{user.id}</Text>
        </Descriptions.Item>
      </Descriptions>
    </Card>
  );

  const renderPersonalInfoForm = () => (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <UserOutlined />
          {t("profile.personalInfo")}
        </div>
      }
    >
      {user.role === UserRole.USER && (
        <Alert
          message={t("profile.departmentChangeInfo")}
          description={t("profile.departmentChangeDescription")}
          type="info"
          showIcon
          className="mb-6"
        />
      )}

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          address: user.address || '',
          department: user.departmentId || '',
        }}
        onFinish={handleSave}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={t("profile.fullName")}
              name="name"
              rules={[{ required: true, message: t("profile.validation.required") }]}
            >
              <Input
                prefix={<UserOutlined />}
                disabled={!isEditing}
                placeholder={t("profile.enterFullName")}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={t("profile.email")}
              name="email"
              rules={[
                { required: true, message: t("profile.validation.required") },
                { type: 'email', message: t("profile.validation.email") }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                disabled={!isEditing}
                placeholder={t("profile.enterEmail")}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={t("profile.phone")}
              name="phone"
            >
              <Input
                prefix={<PhoneOutlined />}
                disabled={!isEditing}
                placeholder={t("profile.enterPhone")}
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={t("profile.department")}
              name="department"
              rules={[{ required: true, message: t("profile.validation.required") }]}
            >
              <Select
                disabled={!isEditing}
                placeholder={t("profile.selectDepartment")}
              >
                {departments.map(dept => (
                  <Option key={dept.id} value={dept.id}>{dept.name}</Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item
              label={t("profile.address")}
              name="address"
            >
              <TextArea
                rows={3}
                disabled={!isEditing}
                placeholder={t("profile.enterAddress")}
              />
            </Form.Item>
          </Col>
        </Row>

        {isEditing && (
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <Button onClick={handleCancel} block>
              {t("profile.cancel")}
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
              block
            >
              {t("profile.updateProfile")}
            </Button>
          </div>
        )}
      </Form>
    </Card>
  );

  const renderSecuritySection = () => (
    <Card 
      title={
        <div className="flex items-center gap-2">
          <LockOutlined />
          {t("profile.security")}
        </div>
      } 
      className="mt-6"
    >
      <Alert
        message={t("profile.passwordSecurity")}
        description={t("profile.passwordSecurityDescription")}
        type="warning"
        showIcon
        className="mb-4"
      />
      
      <Button 
        type="default" 
        icon={<KeyOutlined />}
        onClick={() => setShowPasswordModal(true)}
        block
      >
        {t("profile.changePassword")}
      </Button>
    </Card>
  );

  const renderPasswordModal = () => (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <LockOutlined />
          {t("profile.changePassword")}
        </div>
      }
      open={showPasswordModal}
      onCancel={() => {
        setShowPasswordModal(false);
        passwordForm.resetFields();
      }}
      footer={null}
      width={500}
    >
      <Form
        form={passwordForm}
        layout="vertical"
        onFinish={handlePasswordChange}
      >
        <Form.Item
          label={t("profile.currentPassword")}
          name="currentPassword"
          rules={[{ required: true, message: t("profile.validation.required") }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder={t("profile.enterCurrentPassword")}
            iconRender={(visible) => (
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            )}
          />
        </Form.Item>

        <Form.Item
          label={t("profile.newPassword")}
          name="newPassword"
          rules={[
            { required: true, message: t("profile.validation.required") },
            { min: 8, message: t("profile.passwordRequirements") }
          ]}
        >
          <Input.Password
            prefix={<KeyOutlined />}
            placeholder={t("profile.enterNewPassword")}
            iconRender={(visible) => (
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            )}
          />
        </Form.Item>

        <Form.Item
          label={t("profile.confirmPassword")}
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: t("profile.validation.required") },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error(t("profile.passwordsDoNotMatch")));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<KeyOutlined />}
            placeholder={t("profile.confirmNewPassword")}
            iconRender={(visible) => (
              visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
            )}
          />
        </Form.Item>

        <div className="flex justify-end gap-3 mt-6">
          <Button 
            onClick={() => {
              setShowPasswordModal(false);
              passwordForm.resetFields();
            }}
          >
            {t("profile.cancel")}
          </Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={passwordLoading}
            icon={<CheckCircleOutlined />}
          >
            {t("profile.changePassword")}
          </Button>
        </div>
      </Form>
    </Modal>
  );

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <Title level={2} className="flex items-center gap-2">
          <UserOutlined />
          {t("profile.title")}
        </Title>
        <Text type="secondary">
          {t("profile.description")}
        </Text>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Profile Overview & Account Info */}
        <Col xs={24} lg={8}>
          {renderProfileOverview()}
          {renderAccountInfo()}
        </Col>

        {/* Right Column - Forms */}
        <Col xs={24} lg={16}>
          {renderPersonalInfoForm()}
          {renderSecuritySection()}
        </Col>
      </Row>

      {renderPasswordModal()}
    </div>
  );
}
