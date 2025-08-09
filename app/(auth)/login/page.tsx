"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Form, Input, Button, Checkbox, message, Tabs, Select, Divider } from "antd";
import { UserOutlined, LockOutlined, MailOutlined, TeamOutlined, GlobalOutlined } from "@ant-design/icons";

import { useUser } from "@/contexts/UserContext";
import { useLanguage, useTranslation } from "@/contexts/LanguageContext";
import { UserRole } from "@/types";

export default function LoginPage() {
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("login");
  
  const { login } = useUser();
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();
  const router = useRouter();

  const handleLogin = async (values: { email: string; password: string; remember: boolean }) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        message.success(t("auth.welcomeBack"));
        router.push("/homepage");
      } else {
        message.error(t("auth.invalidCredentials") + " Try: joao@empresa.com / 123456");
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(t("auth.loginFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (values: any) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      message.success(t("auth.accountRequested"));
      message.info(t("auth.waitingApproval"));
      setActiveTab("login");
    } catch (error) {
      message.error("Registration failed");
    } finally {
      setLoading(false);
    }
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
          onFinish={handleLogin}
          layout="vertical"
          size="large"
        >
          <Form.Item
            label={t("auth.email")}
            name="email"
            rules={[
              { required: true, message: `${t("auth.email")} is required` },
              { type: "email", message: "Invalid email format" },
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
            rules={[{ required: true, message: `${t("auth.password")} is required` }]}
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
              htmlType="submit"
              loading={loading}
              className="w-full"
              size="large"
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
          onFinish={handleRegister}
          layout="vertical"
          size="large"
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
              { required: true, message: `${t("auth.email")} is required` },
              { type: "email", message: "Invalid email format" },
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
            rules={[{ required: true, message: `${t("auth.department")} is required` }]}
          >
            <Input
              prefix={<TeamOutlined />}
              placeholder={t("auth.department")}
            />
          </Form.Item>

          <Form.Item
            label={t("auth.password")}
            name="password"
            rules={[
              { required: true, message: `${t("auth.password")} is required` },
              { min: 6, message: "Password must be at least 6 characters" },
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
              { required: true, message: `${t("auth.confirmPassword")} is required` },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
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
              htmlType="submit"
              loading={loading}
              className="w-full"
              size="large"
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
            <h1 className="text-2xl font-bold text-gray-800">Totalizer Platform</h1>
            <p className="text-gray-600">{t("auth.enterCredentials")}</p>
          </div>

          <Tabs 
            activeKey={activeTab} 
            onChange={(key) => setActiveTab(key)} 
            centered 
            items={tabItems}
          />
        </Card>
      </div>
    </div>
  );
}
