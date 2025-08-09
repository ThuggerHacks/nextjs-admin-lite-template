"use client";

import { useState } from "react";
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
  Typography
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
  CrownOutlined
} from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { UserRole } from "@/types";

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

export default function ProfilePage() {
  const [form] = Form.useForm();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const { user, setUser } = useUser();
  const { t } = useTranslation();

  if (!user) {
    return <div>Loading...</div>;
  }

  const departments = [
    'Administração Geral',
    'Recursos Humanos',
    'Vendas',
    'Marketing',
    'TI',
    'Financeiro',
    'Operações',
    'Jurídico'
  ];

  const handleSave = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update user context
      const updatedUser = {
        ...user,
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        department: values.department,
        avatar: avatarUrl || user.avatar,
      };
      
      setUser(updatedUser);
      setIsEditing(false);
      message.success('Profile updated successfully!');
    } catch (error) {
      message.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      department: user.department,
    });
    setIsEditing(false);
  };

  const getUserRoleInfo = () => {
    switch (user.role) {
      case UserRole.SUPER_ADMIN:
        return {
          label: t("users.userTypes.superAdmin"),
          color: 'red',
          icon: <CrownOutlined />,
          description: 'Full platform access and user management'
        };
      case UserRole.ADMIN:
        return {
          label: t("users.userTypes.admin"),
          color: 'blue',
          icon: <BankOutlined />,
          description: 'Department management and team oversight'
        };
      case UserRole.USER:
        return {
          label: t("users.userTypes.user"),
          color: 'green',
          icon: <UserOutlined />,
          description: 'Access to personal tasks and department resources'
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

  const roleInfo = getUserRoleInfo();

  const uploadProps = {
    beforeUpload: async (file: any) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('You can only upload image files!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must be smaller than 2MB!');
        return false;
      }
      
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += Math.random() * 15 + 5) {
          await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 100));
          setUploadProgress(Math.min(progress, 100));
          if (progress >= 100) break;
        }
        
        // Create preview URL
        const url = URL.createObjectURL(file);
        setAvatarUrl(url);
        message.success('Avatar uploaded successfully!');
      } catch (error) {
        message.error('Failed to upload avatar');
      } finally {
        setIsUploading(false);
        setUploadProgress(0);
      }
      
      return false; // Prevent auto upload
    },
  };

  return (
    <div className="p-6">
      <Row gutter={[24, 24]}>
        {/* Profile Overview */}
        <Col xs={24} lg={8}>
          <Card>
            <div className="text-center">
              <div className="mb-4">
                {isEditing ? (
                  <div>
                    <Upload {...uploadProps} showUploadList={false}>
                      <div className="cursor-pointer">
                        <Avatar 
                          size={120} 
                          src={avatarUrl || user.avatar}
                          icon={!avatarUrl && !user.avatar && <UserOutlined />}
                          className="border-4 border-gray-200 hover:border-blue-300"
                        />
                        <div className="mt-2 text-sm text-blue-500">
                          <UploadOutlined /> Click to change
                        </div>
                      </div>
                    </Upload>
                    
                    {/* Upload Progress */}
                    {isUploading && (
                      <div style={{ marginTop: 12 }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          Uploading avatar... {Math.round(uploadProgress)}%
                        </Text>
                        <Progress
                          percent={Math.round(uploadProgress)}
                          size="small"
                          status={uploadProgress === 100 ? 'success' : 'active'}
                          style={{ marginTop: 4 }}
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
              
              <h2 className="text-2xl font-bold mb-2">{user.name}</h2>
              
              <Space direction="vertical" align="center">
                <Tag color={roleInfo.color} icon={roleInfo.icon} className="px-3 py-1">
                  {roleInfo.label}
                </Tag>
                <p className="text-gray-600 text-sm">{roleInfo.description}</p>
              </Space>

              <Divider />

              <Space direction="vertical" align="start" className="w-full">
                <div className="flex items-center gap-2">
                  <BankOutlined className="text-gray-500" />
                  <span>{user.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MailOutlined className="text-gray-500" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneOutlined className="text-gray-500" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.address && (
                  <div className="flex items-center gap-2">
                    <HomeOutlined className="text-gray-500" />
                    <span>{user.address}</span>
                  </div>
                )}
              </Space>

              {!isEditing && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={() => setIsEditing(true)}
                  className="mt-4"
                  block
                >
                  {t("profile.editProfile")}
                </Button>
              )}
            </div>
          </Card>

          <Card title="Account Information" className="mt-4">
            <Space direction="vertical" className="w-full">
              <div>
                <span className="text-gray-600">Member since:</span>
                <div>{user.createdAt.toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-600">Last login:</span>
                <div>{user.lastLogin?.toLocaleString() || 'Never'}</div>
              </div>
              <div>
                <span className="text-gray-600">User ID:</span>
                <div className="font-mono text-sm">{user.id}</div>
              </div>
            </Space>
          </Card>
        </Col>

        {/* Profile Form */}
        <Col xs={24} lg={16}>
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
                message="Department Change Request"
                description="If you need to change your department, the change will require approval from a Super Administrator."
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
                department: user.department,
              }}
              onFinish={handleSave}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Full Name"
                    name="name"
                    rules={[{ required: true, message: 'Please enter your full name' }]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: 'Please enter your email' },
                      { type: 'email', message: 'Please enter a valid email' }
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      disabled={!isEditing}
                      placeholder="Enter your email"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Phone"
                    name="phone"
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      disabled={!isEditing}
                      placeholder="Enter your phone number"
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    label="Department"
                    name="department"
                    rules={[{ required: true, message: 'Please select your department' }]}
                  >
                    <Select
                      disabled={!isEditing}
                      placeholder="Select department"
                    >
                      {departments.map(dept => (
                        <Option key={dept} value={dept}>{dept}</Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24}>
                  <Form.Item
                    label="Address"
                    name="address"
                  >
                    <TextArea
                      rows={3}
                      disabled={!isEditing}
                      placeholder="Enter your address"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {isEditing && (
                <div className="flex justify-end gap-3 mt-6">
                  <Button onClick={handleCancel}>
                    {t("common.cancel")}
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    {t("profile.updateProfile")}
                  </Button>
                </div>
              )}
            </Form>
          </Card>

          {/* Password Change Section */}
          <Card title="Security" className="mt-6">
            <Alert
              message="Password Security"
              description="For security reasons, password changes require email verification. Click the button below to receive a password reset link."
              type="warning"
              showIcon
              className="mb-4"
            />
            
            <Button type="default">
              {t("profile.changePassword")}
            </Button>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
