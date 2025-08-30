"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { onStart } from "@/lib/router-events/events";
import { useCollapse } from "@/hooks/use-collapse-store";
import { useUser } from "@/contexts/UserContext";
import { useTranslation } from "@/contexts/LanguageContext";
import { UserRole } from "@/types";

import {
  HomeOutlined,
  FileTextOutlined,
  FileOutlined,
  AimOutlined,
  ScanOutlined,
  FolderOutlined,
  SettingOutlined,
  UserOutlined,
  DashboardOutlined,
  BellOutlined,
  TeamOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  EditOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, ConfigProvider, Divider } from "antd";

type MenuItem = Required<MenuProps>["items"][number];

const getItem = (
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: "group"
): MenuItem => {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
};

const SiderPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, hasRole } = useUser();
  const { t } = useTranslation();

  const { isCollapsed, onOpen, onClose } = useCollapse();
  
  // Memoize selected keys to prevent unnecessary recalculations
  const selectedKeys = useMemo(() => "/" + pathname.split("/").reverse()[0], [pathname]);

  // Memoize click handler to prevent unnecessary re-renders
  const onClick = useMemo((): MenuProps["onClick"] => (e) => {
    const targetKey = e.key as string;
    
    // Only navigate if it's a direct page URL (not a parent menu)
    if (targetKey && targetKey !== '/goals' && targetKey !== '/management') {
      if (pathname !== targetKey) {
        router.push(targetKey);
        onStart();
      }
    }
  }, [pathname, router, onStart]);

  // Memoize menu items to prevent unnecessary re-renders
  const menuItems = useMemo((): MenuProps["items"] => {
    if (!user) return [];

    const items: MenuProps["items"] = [];

    // Cache role checks to avoid repeated comparisons
    const userRole = user.role;
    const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;
    const isDeveloper = userRole === UserRole.DEVELOPER;
    const isAdmin = userRole === UserRole.ADMIN;
    const isSupervisor = userRole === UserRole.SUPERVISOR;
    const isUser = userRole === UserRole.USER;

    // Dashboard - Admin, Super Admin, Developer (Supervisors cannot access)
    if (isAdmin || isSuperAdmin || isDeveloper) {
      items.push(
        getItem(t("navigation.dashboard"), "/management/dashboard", <DashboardOutlined />)
      );
    }

    // Goals - All users
    const goalsChildren: MenuItem[] = [];
    goalsChildren.push(
      getItem(t("navigation.viewGoals"), "/goals/view", <AimOutlined />)
    );
    
    // Supervisors and above can create goals
    if (isSupervisor || isAdmin || isSuperAdmin || isDeveloper) {
      goalsChildren.push(
        getItem(t("navigation.createGoals"), "/goals/create", <EditOutlined />)
      );
    }

    items.push(
      getItem(
        t("navigation.goals"),
        "/goals",
        <AimOutlined />,
        goalsChildren
      )
    );

    // Scanner - All users
    items.push(
      getItem(t("navigation.scan"), "/scanner", <ScanOutlined />)
    );

    // Documents - All users
    items.push(
      getItem(t("navigation.documents"), "/documents", <FileOutlined />)
    );

    // Libraries - All users
    items.push(
      getItem(t("navigation.libraries"), "/libraries", <FolderOutlined />)
    );

    // Management section - Admin, Supervisor, Super Admin, Developer
    if (isAdmin || isSupervisor || isSuperAdmin || isDeveloper) {
      const managementChildren: MenuItem[] = [];

      // Users management - Admin, Supervisor (only users from their department), Super Admin, Developer
      if (isAdmin || isSupervisor || isSuperAdmin || isDeveloper) {
        managementChildren.push(
          getItem(t("navigation.users"), "/management/users", <TeamOutlined />)
        );
      }

      // Departments - Super Admin, Developer
      if (isSuperAdmin || isDeveloper) {
        managementChildren.push(
          getItem(t("navigation.departments"), "/departments", <TeamOutlined />)
        );
      }

      // Requests - Admin, Supervisor, Super Admin, Developer
      if (isAdmin || isSupervisor || isSuperAdmin || isDeveloper) {
        managementChildren.push(
          getItem(t("navigation.requests"), "/management/requests", <UserOutlined />)
        );
      }

      // Sucursals - Only Developer
      if (isDeveloper) {
        managementChildren.push(
          getItem(t("navigation.sucursals"), "/sucursals", <GlobalOutlined />)
        );
      }

      items.push(
        getItem(
          t("navigation.management"),
          "/management",
          <SettingOutlined />,
          managementChildren
        )
      );
    }

    // Notifications - All users
    items.push(
      getItem(t("navigation.notifications"), "/notifications", <BellOutlined />)
    );

    // Profile - All users
    items.push(
      getItem(t("navigation.profile"), "/profile", <UserOutlined />)
    );

    return items;
  }, [user, t]);

  const items = menuItems || [];

  // Memoize theme configuration to prevent unnecessary re-renders
  const themeConfig = useMemo(() => ({
    token: {
      motion: false,
    },
    components: {
      Menu: {
        collapsedIconSize: 14,
        collapsedWidth: 50,
        itemBorderRadius: 0,
        itemMarginInline: 0,
        itemMarginBlock: 0,
      },
    },
  }), []);

  // Memoize className to prevent unnecessary re-renders
  const sidebarClassName = useMemo(() => cn(
    "flex flex-col h-full overflow-y-auto scrollbar overflow-x-hidden transition-all",
    isCollapsed ? "w-[50px]" : "w-[210px]"
  ), [isCollapsed]);

  return (
    <div className={sidebarClassName}>
      <ConfigProvider theme={themeConfig}>
        <Menu
          onClick={onClick}
          defaultSelectedKeys={[selectedKeys]}
          defaultOpenKeys={["/goals", "/management"]}
          mode="inline"
          items={items}
          inlineCollapsed={isCollapsed}
        />
      </ConfigProvider>
      <div className="mt-auto">
        <div className="mb-[60px] relative hidden md:block">
          <ConfigProvider
            theme={{
              components: {
                Divider: {
                  marginLG: 12,
                },
              },
            }}
          >
            <Divider />
          </ConfigProvider>
          {isCollapsed ? (
            <MenuUnfoldOutlined
              onClick={onClose}
              className="text-lg ml-[18px]"
            />
          ) : (
            <MenuFoldOutlined onClick={onOpen} className="text-lg ml-[18px]" />
          )}
        </div>
      </div>
    </div>
  );
};

// Wrap component with React.memo for performance optimization
const MemoizedSiderPage = React.memo(SiderPage);

export default MemoizedSiderPage;
export type { MenuItem };

// Export a function to get menu items for other components that might need it
export const getMenuItemsForUser = (user: any, hasRole: (role: any) => boolean, t: (key: string) => string) => {
  if (!user) return [];
  
  // This is a simplified version for external use
  // You can expand this if needed by other components
  return [];
};
