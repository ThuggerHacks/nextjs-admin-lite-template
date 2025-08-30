"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { FloatButton, Drawer, Card, Typography, List } from "antd";
import { QuestionCircleOutlined, BulbOutlined, FileTextOutlined, PhoneOutlined } from "@ant-design/icons";
import NavBreadcrumb from "@/components/nav-breadcrumb/page";
import HeaderPage from "@/components/layout/header/page";
import SiderPage from "@/components/layout/sidebar/page";

import { cn } from "@/lib/utils";
import { useCollapse } from "@/hooks/use-collapse-store";
import { useSettingStore } from "@/hooks/use-setting-store";
import { useThemeToken } from "@/theme/use-theme-token";
import { useUser } from "@/contexts/UserContext";

import { ThemeMode } from "@/types";

const { Title, Text } = Typography;

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { isCollapsed } = useCollapse();
  const { settings } = useSettingStore();
  const { colorBgContainer, colorBgElevated } = useThemeToken();
  const { user, isAuthenticated, loading, isLoggingOut, isLoggingIn } = useUser();
  const router = useRouter();
  const [helpDrawerVisible, setHelpDrawerVisible] = useState(false);

  // Memoize help items to prevent unnecessary re-renders
  const helpItems = useMemo(() => [
    {
      title: "Goals Management",
      description: "Create individual or department-wide goals, track progress with reports",
      icon: <BulbOutlined />
    },
    {
      title: "File Management", 
      description: "Upload and organize files with progress tracking across libraries",
      icon: <FileTextOutlined />
    },
    {
      title: "User Management",
      description: "Manage users, roles, and permissions (Admin/Super Admin only)",
      icon: <QuestionCircleOutlined />
    },
    {
      title: "Sucursal Management",
      description: "Monitor branch servers and diagnostics (Developer only)", 
      icon: <PhoneOutlined />
    }
  ], []);

  // Memoize style objects to prevent unnecessary re-renders
  const sidebarStyle = useMemo(() => ({
    color: settings.themeMode === ThemeMode.Dark ? "#ffffff" : "",
    backgroundColor: settings.themeMode === ThemeMode.Dark ? colorBgElevated : "",
  }), [settings.themeMode, colorBgElevated]);

  const breadcrumbStyle = useMemo(() => ({
    color: settings.themeMode === ThemeMode.Dark ? "#ffffff" : "",
    backgroundColor: settings.themeMode === ThemeMode.Dark ? colorBgElevated : "",
  }), [settings.themeMode, colorBgElevated]);

  const mainStyle = useMemo(() => ({
    color: settings.themeMode === ThemeMode.Dark ? "#ffffff" : "",
    backgroundColor: settings.themeMode === ThemeMode.Dark ? colorBgElevated : "",
  }), [settings.themeMode, colorBgElevated]);

  // Memoize className to prevent unnecessary re-renders
  const breadcrumbClassName = useMemo(() => cn(
    "fixed w-full top-[48px] h-[40px] z-10 transition-all",
    isCollapsed ? "ml-[50px]" : "ml-[210px]"
  ), [isCollapsed]);

  const mainClassName = useMemo(() => cn(
    "w-full min-h-[100vh] bg-[#f0f4f7] p-2 pt-[98px] transition-spacing",
    isCollapsed ? "ml-[50px]" : "ml-[210px]"
  ), [isCollapsed]);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

         if (loading || isLoggingOut || isLoggingIn) {
    
    const loadingMessage = isLoggingOut 
      ? "Logging out..." 
      : isLoggingIn 
        ? "Logging in..." 
        : "Loading Totalizer Platform...";
    
    const subMessage = isLoggingOut 
      ? "Please wait while we secure your session" 
      : isLoggingIn 
        ? "Please wait while we authenticate you" 
        : "Please wait while we prepare your workspace";
    
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg">
          <div className="mb-6 flex justify-center">
            <Image
              src="/icon.png"
              alt="Platform Logo"
              width={80}
              height={80}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>
          <div className="text-xl font-medium text-gray-700">{loadingMessage}</div>
          <div className="mt-2 text-sm text-gray-500">{subMessage}</div>
          
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <div className="h-[48px] fixed w-full bg-primary-500 z-10">
        <HeaderPage />
      </div>
      <div className="flex min-h-full ">
        <div
          className="fixed top-[48px] h-full shadow-md border-r bg-white border-zinc-200 z-10"
          style={sidebarStyle}
        >
          <SiderPage />
        </div>
        <div className={breadcrumbClassName}>
          <div
            className="h-full flex items-center bg-[#f0f4f7]"
            style={breadcrumbStyle}
          >
            <NavBreadcrumb />
          </div>
        </div>
        <main
          className={mainClassName}
          style={mainStyle}
        >
          {children}
        </main>
      </div>

      {/* Help Float Button */}
      <FloatButton
        icon={<QuestionCircleOutlined />}
        type="primary"
        style={{ right: 24, bottom: 24 }}
        onClick={() => setHelpDrawerVisible(true)}
        tooltip="Help & Documentation"
      />

      {/* Help Drawer */}
      <Drawer
        title="Platform Help & Documentation"
        placement="right"
        width={400}
        open={helpDrawerVisible}
        onClose={() => setHelpDrawerVisible(false)}
      >
        <div className="space-y-4">
          <Card size="small">
            <Title level={5}>Welcome to Tonelizer Platform!</Title>
            <Text type="secondary">
              A comprehensive administrative platform for managing goals, files, users, and branch operations.
            </Text>
          </Card>

          <Card size="small" title="Key Features">
            <List
              dataSource={helpItems}
              renderItem={(item: any) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={item.icon}
                    title={item.title}
                    description={item.description}
                  />
                </List.Item>
              )}
            />
          </Card>

          <Card size="small" title="Quick Start">
            <div className="space-y-2">
              <Text strong>For Users:</Text>
              <ul className="ml-4 text-sm">
                <li>Set individual goals and track progress</li>
                <li>Submit progress reports with attachments</li>
                <li>Access shared documents and libraries</li>
              </ul>
              
              <Text strong>For Admins:</Text>
              <ul className="ml-4 text-sm">
                <li>Create department-wide goals</li>
                <li>Manage team members and permissions</li>
                <li>Review and approve goal reports</li>
              </ul>

              <Text strong>For Super Admins:</Text>
              <ul className="ml-4 text-sm">
                <li>Full platform administration</li>
                <li>Monitor branch servers (Sucursals)</li>
                <li>Reset user passwords and manage roles</li>
              </ul>
            </div>
          </Card>

          <Card size="small" title="Support">
            <Text>
              Need help? Contact the IT support team or refer to the internal documentation portal.
            </Text>
          </Card>
        </div>
      </Drawer>
    </>
  );
};

// Wrap component with React.memo for performance optimization
const MemoizedMainLayout = React.memo(MainLayout);

export default MemoizedMainLayout;
