"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Button, Checkbox, message, Tabs, Select, Divider } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined, GlobalOutlined } from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useLanguage, useTranslation } from "@/contexts/LanguageContext";
import { UserRole } from "@/types";
import { authService } from "@/lib/services/authService";
import { departmentService, Department } from "@/lib/services/departmentService";

export default function LoginPage() {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  
  const { login } = useUser();
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();
  const router = useRouter();

  // Fetch departments on component mount
  useEffect(() => {
    const fetchDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const depts = await departmentService.getAllDepartments();
        if (process.env.NODE_ENV === 'development') {
          console.log('Fetched departments:', depts);
        }
        setDepartments(depts || []);
      } catch (error) {
        console.error('Failed to fetch departments:', error);
        message.error('Failed to load departments');
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };

    fetchDepartments();
  }, []);

  const handleLogin = async (values: { email: string; password: string; remember: boolean }) => {
    // Prevent any form reload
    console.log('Login handler called with:', { email: values.email, remember: values.remember });
    setLoading(true);
    
    try {
      const result = await login(values.email, values.password);
      console.log('Login result:', result);
      
      if (result.success && result.user) {
        message.success(t("auth.welcomeBack"));
        
        console.log('Login successful, user object:', result.user);
        console.log('Current localStorage token:', localStorage.getItem('token'));
        
        // Role and department-based routing
        const getRedirectPath = (user: any) => {
          const { role, departmentId } = user;
          console.log('User role and department:', { role, departmentId });
          
          // Super Admin and Developer can access everything
          if (role === 'SUPER_ADMIN' || role === 'DEVELOPER') {
            return '/management/dashboard';
          }
          
          // Admin - check if they have a department
          if (role === 'ADMIN') {
            if (departmentId) {
              return '/departments'; // Manage their department
            }
            return '/management/dashboard'; // General admin dashboard
          }
          
          // Supervisor - must manage their department
          if (role === 'SUPERVISOR') {
            if (departmentId) {
              return `/departments`; // Manage their specific department
            }
            return '/homepage'; // Fallback if no department assigned
          }
          
          // Regular User - access their department's content
          if (role === 'USER') {
            if (departmentId) {
              return '/homepage'; // User dashboard with department context
            }
            return '/profile'; // Complete profile setup if no department
          }
          
          // Default fallback
          return '/homepage';
        };
        
        const redirectPath = getRedirectPath(result.user);
        console.log('Redirecting to:', redirectPath);
        
        // Add a small delay to ensure token is saved before redirect
        setTimeout(() => {
          router.replace(redirectPath);
        }, 100);
      } else {
        console.error('Login failed:', result.error);
        message.error(result.error || t("auth.invalidCredentials"));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      message.error(error.message || t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    // Prevent any form reload
    console.log('Register handler called with:', values);
    setLoading(true);
    
    try {
      const registerData = {
        name: values.name,
        email: values.email,
        password: values.password,
        departmentId: values.department,
        role: UserRole.USER // Default role for new registrations
      };
      
      console.log('Sending registration data:', registerData);
      const response = await authService.register(registerData);
      console.log('Registration response:', response);
      
      // Success - show messages and switch to login tab
      message.success(response.message || t("auth.accountRequested"));
      message.info(t("auth.waitingApproval"));
      
      // Clear form and switch to login tab
      registerForm.resetFields();
      setActiveTab("login");
      
      } catch (error: any) {
    console.error('Registration error:', error);

    // Extract error message from response
    let errorMessage = t("auth.registrationFailed") || "Registration failed";
    if (error.response?.data?.error) {
      errorMessage = error.response.data.error;
    } else if (error.response?.data?.errors) {
      // Handle validation errors array
      const errors = error.response.data.errors;
      errorMessage = errors.map((err: any) => err.msg || err.message).join(', ');
    } else if (error.message) {
      errorMessage = error.message;
    }

    message.error(errorMessage);
  } finally {
    setLoading(false);
  }
  };

  // Prevent form submission refresh with explicit preventDefault
  const handleFormSubmit = (handler: Function) => {
    return async (values: any) => {
      // Prevent any potential form submission
      return handler(values);
    };
  };

  // Create explicit form submission handlers that prevent default
  const onLoginSubmit = async (values: { email: string; password: string; remember: boolean }) => {
    return handleLogin(values);
  };

  const onRegisterSubmit = async (values: any) => {
    return handleRegister(values);
  };

  const handleLanguageChange = (value: 'pt' | 'en') => {
    setLocale(value);
  };

  const tabItems = [
    {
      key: 'login',
      label: t("common.login"),
      children: (
        <Form
          form={loginForm}
          name="login"
          onFinishFailed={(errorInfo) => {
            console.log('Login form validation failed:', errorInfo);
            message.error(t("auth.checkFormFields"));
          }}
          layout="vertical"
          size="large"
          preserve={false}
        >
          <Form.Item
            label={t("auth.email")}
            name="email"
            rules={[
              { required: true, message: t("auth.emailRequired") || `${t("auth.email")} is required` },
              { type: "email", message: t("auth.invalidEmailFormat") || "Invalid email format" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t("auth.email")}
            />
          </Form.Item>

          <Form.Item
            label={t("auth.password")}
            name="password"
            rules={[{ required: true, message: t("auth.passwordRequired") || `${t("auth.password")} is required` }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("auth.password")}
            />
          </Form.Item>

          <Form.Item>
            <div className="flex justify-between items-center">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox>{t("auth.rememberMe")}</Checkbox>
              </Form.Item>
              <Button type="link" className="p-0">
                {t("auth.forgotPassword")}
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="button"
              loading={loading}
              className="w-full"
              size="large"
              onClick={async () => {
                try {
                  const values = await loginForm.validateFields();
                  await onLoginSubmit(values);
                } catch (error) {
                  console.log('Login form validation failed:', error);
                  message.error(t("auth.checkFormFields"));
                }
              }}
            >
              {t("common.login")}
            </Button>
          </Form.Item>
        </Form>
      )
    },
    {
      key: 'register',
      label: t("auth.signUp"),
      children: (
        <Form
          form={registerForm}
          name="register"
          onFinishFailed={(errorInfo) => {
            console.log('Register form validation failed:', errorInfo);
            message.error(t("auth.checkFormFields"));
          }}
          layout="vertical"
          size="large"
          preserve={false}
        >
          <Form.Item
            label={t("auth.fullName")}
            name="name"
            rules={[{ required: true, message: `${t("auth.fullName")} is required` }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder={t("auth.fullName")}
            />
          </Form.Item>

          <Form.Item
            label={t("auth.email")}
            name="email"
            rules={[
              { required: true, message: t("auth.emailRequired") || `${t("auth.email")} is required` },
              { type: "email", message: t("auth.invalidEmailFormat") || "Invalid email format" },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder={t("auth.email")}
            />
          </Form.Item>

          <Form.Item
            label={t("auth.department")}
            name="department"
            rules={[{ required: true, message: t("auth.departmentRequired") || `${t("auth.department")} is required` }]}
          >
            <Select
              loading={loadingDepartments}
              placeholder={t("auth.selectDepartment")}
              allowClear
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={departments?.map(dept => ({
                value: dept?.id || '',
                label: dept?.name || '',
              })) || []}
            />
          </Form.Item>

          <Form.Item
            label={t("auth.password")}
            name="password"
            rules={[
              { required: true, message: `${t("auth.password")} is required` },
              { min: 6, message: t("auth.passwordTooShort") || "Password must be at least 6 characters" },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("auth.password")}
            />
          </Form.Item>

          <Form.Item
            label={t("auth.confirmPassword")}
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: t("auth.confirmPasswordRequired") || `${t("auth.confirmPassword")} is required` },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t("auth.passwordsDoNotMatch") || "Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t("auth.confirmPassword")}
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="button"
              loading={loading}
              className="w-full"
              size="large"
              onClick={async () => {
                try {
                  const values = await registerForm.validateFields();
                  await onRegisterSubmit(values);
                } catch (error) {
                  console.log('Register form validation failed:', error);
                  message.error(t("auth.checkFormFields"));
                }
              }}
            >
              {t("auth.requestAccess")}
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 px-4">
      <div className="w-full max-w-md">
        {/* Language Switcher */}
        <div className="flex justify-center mb-6">
          <Select
            value={locale}
            onChange={handleLanguageChange}
            size="large"
            style={{ width: 120 }}
            suffixIcon={<GlobalOutlined />}
            options={[
              { value: 'pt', label: 'Português' },
              { value: 'en', label: 'English' },
            ]}
          />
        </div>

        <Card className="shadow-2xl">
          <div className="text-center mb-6">
            <div className="text-4xl mb-2">📊</div>
            <h1 className="text-2xl font-bold text-gray-800">{t("common.platformName")}</h1>
            <p className="text-gray-600">{t("auth.enterCredentials")}</p>
          </div>

          <Tabs 
            activeKey={activeTab} 
            onChange={(key) => setActiveTab(key)} 
            centered 
            items={tabItems}
            onTabClick={(key, event) => {
              event?.preventDefault?.();
              event?.stopPropagation?.();
            }}
          />
        </Card>
      </div>
    </div>
  );
}
