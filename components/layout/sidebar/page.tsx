"use client";

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
  const selectedKeys = "/" + pathname.split("/").reverse()[0];

  const onClick: MenuProps["onClick"] = (e) => {
    // For leaf nodes (pages), use the key directly
    // For parent nodes, don't navigate
    const targetKey = e.key as string;
    
    // Only navigate if it's a direct page URL (not a parent menu)
    if (targetKey && targetKey !== '/reports' && targetKey !== '/goals' && targetKey !== '/management') {
      if (pathname !== targetKey) {
        router.push(targetKey);
        onStart();
      }
    }
  };

  // Build menu items based on user role
  const getMenuItems = (): MenuProps["items"] => {
    if (!user) return [];

    const menuItems: MenuProps["items"] = [];

    // Super Admin and Developer can access everything
    const isSuperAdminOrDeveloper = hasRole(UserRole.SUPER_ADMIN) || hasRole(UserRole.DEVELOPER);
    const isAdminOrHigher = hasRole(UserRole.ADMIN) || isSuperAdminOrDeveloper;
    const isSupervisorOrHigher = hasRole(UserRole.SUPERVISOR) || isAdminOrHigher;

    // Dashboard/Homepage - All users
    if (isAdminOrHigher) {
      menuItems.push(
        getItem(t("navigation.dashboard"), "/management/dashboard", <DashboardOutlined />)
      );
    } else {
      menuItems.push(
        getItem(t("navigation.homepage"), "/homepage", <HomeOutlined />)
      );
    }

    // Management section - Supervisor and above
    if (isSupervisorOrHigher) {
      const managementChildren: MenuItem[] = [];

      // Users management - Admin and above
      if (isAdminOrHigher) {
        managementChildren.push(
          getItem(t("navigation.users"), "/management/users", <TeamOutlined />)
        );
      }

      // Departments - Supervisor and above
      managementChildren.push(
        getItem(t("navigation.departments"), "/departments", <TeamOutlined />)
      );

      // Requests - Supervisor and above (for approving users)
      managementChildren.push(
        getItem(t("navigation.requests"), "/management/requests", <UserOutlined />)
      );

      // Super Admin and Developer specific items
      if (isSuperAdminOrDeveloper) {
        managementChildren.push(
          getItem(t("navigation.sucursals"), "/sucursals", <GlobalOutlined />)
        );
      }

      menuItems.push(
        getItem(
          t("navigation.management"),
          "/management",
          <SettingOutlined />,
          managementChildren
        )
      );
    }

    // Goals section - All users can view, Supervisors and above can manage
    const goalsChildren: MenuItem[] = [];

    // All users can view assigned goals
    goalsChildren.push(
      getItem(t("navigation.viewGoals"), "/goals/view", <AimOutlined />)
    );

    // Supervisors and above can create goals
    if (isSupervisorOrHigher) {
      goalsChildren.push(
        getItem(t("navigation.createGoals"), "/goals/create", <EditOutlined />)
      );
    }

    menuItems.push(
      getItem(
        t("navigation.goals"),
        "/goals",
        <AimOutlined />,
        goalsChildren
      )
    );

    // Reports section - All users
    const reportsChildren: MenuItem[] = [];

    // All users can submit reports
    reportsChildren.push(
      getItem(t("navigation.submitReports"), "/reports/submit", <UploadOutlined />)
    );

    // Supervisors and above can view reports
    if (isSupervisorOrHigher) {
      reportsChildren.push(
        getItem(t("navigation.viewReports"), "/reports/view", <FileTextOutlined />)
      );
    }

    menuItems.push(
      getItem(
        t("navigation.reports"),
        "/reports",
        <FileTextOutlined />,
        reportsChildren
      )
    );

    // Documents and Files - All users
    menuItems.push(
      getItem(t("navigation.documents"), "/documents", <FileOutlined />)
    );

    // Libraries - All users
    menuItems.push(
      getItem(t("navigation.libraries"), "/libraries", <FolderOutlined />)
    );

    // Scanner - All users can scan documents
    menuItems.push(
      getItem(t("navigation.scan"), "/scanner", <ScanOutlined />)
    );

    // Digitalize - All users
    menuItems.push(
      getItem(t("navigation.digitalize"), "/digitalize", <FileTextOutlined />)
    );

    // Notifications - All users
    menuItems.push(
      getItem(t("navigation.notifications"), "/notifications", <BellOutlined />)
    );

    // Profile - All users
    menuItems.push(
      getItem(t("navigation.profile"), "/profile", <UserOutlined />)
    );

    return menuItems;
  };

  const items = getMenuItems();

  return (
    <div
      className={cn(
        "flex flex-col h-full overflow-y-auto scrollbar overflow-x-hidden transition-all",
        isCollapsed ? "w-[50px]" : "w-[210px]"
      )}
    >
      <ConfigProvider
        theme={{
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
        }}
      >
        <Menu
          onClick={onClick}
          defaultSelectedKeys={[selectedKeys]}
          defaultOpenKeys={["/reports", "/goals", "/management"]}
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

export default SiderPage;
export type { MenuItem };

// Export a function to get menu items for other components that might need it
export const getMenuItemsForUser = (user: any, hasRole: (role: any) => boolean, t: (key: string) => string) => {
  if (!user) return [];
  
  // This is a simplified version for external use
  // You can expand this if needed by other components
  return [];
};
