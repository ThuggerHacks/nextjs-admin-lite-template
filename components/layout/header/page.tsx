"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

import { useCollapse } from "@/hooks/use-collapse-store";
import { useUser } from "@/contexts/UserContext";
import { useLanguage, useTranslation } from "@/contexts/LanguageContext";
import { onStart } from "@/lib/router-events/events";

import {
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Avatar, Dropdown, Button, Select, message } from "antd";

import SettingButton from "./setting-button";
import NotificationDropdown from "@/components/NotificationDropdown";

const HeaderPage: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { isCollapsed, onOpen, onClose } = useCollapse();
  const { user, logout } = useUser();
  const { locale, setLocale } = useLanguage();
  const { t } = useTranslation();

  const userMenuItems: MenuProps["items"] = [
    {
      key: "/profile",
      label: t("navigation.profile"),
      icon: <UserOutlined />,
    },
    {
      key: "logout",
      label: t("common.logout"),
      icon: <LogoutOutlined />,
    },
  ];

  const handleLogout = async () => {
    try {
      // Call logout from context (which handles all storage clearing)
      await logout();
      
      // Navigate to login
      router.push("/login");
      onStart();
      
      message.success(t("common.logoutSuccess") || "Logged out successfully");
    } catch (error) {
      console.error('Logout error:', error);
      // Even if there's an error, redirect to login
      router.push("/login");
      onStart();
      message.error(t("common.logoutError") || "Error during logout, but session cleared");
    }
  };

  const onClick: MenuProps["onClick"] = ({ key }) => {
    if (key === "logout") {
      handleLogout();
    } else if (pathname !== key) {
      router.push(key);
      onStart();
    }
  };

  const handleLanguageChange = (value: 'pt' | 'en') => {
    setLocale(value);
  };

  const getUserRoleDisplay = () => {
    if (!user) return '';
    
    // Use the userTypes translation
    return t(`users.userTypes.${user.role}`) || user.role;
  };

  return (
    <div className="h-full flex items-center">
      <div className="flex text-white text-lg ml-4">
        <div className="flex items-center">
          <Image
            src="/icon.png"
            alt="Platform Logo"
            width={32}
            height={32}
            className="pr-2 rounded"
          />
          <span className="hidden md:block transition-all">
            {t("common.platformName")}
          </span>
        </div>
      </div>
      
      <div className="block md:hidden text-white">
        {isCollapsed ? (
          <MenuUnfoldOutlined onClick={onClose} />
        ) : (
          <MenuFoldOutlined onClick={onOpen} />
        )}
      </div>
      
      <div className="ml-auto mr-5 text-white flex items-center gap-4">
        {/* Language Switcher */}
        <Select
          value={locale}
          onChange={handleLanguageChange}
          size="small"
          style={{ 
            width: 80,
            backgroundColor: 'transparent',
            borderColor: 'rgba(255, 255, 255, 0.3)'
          }}
          suffixIcon={<GlobalOutlined style={{ color: 'white' }} />}
          dropdownStyle={{ minWidth: 100 }}
          className="custom-select"
          options={[
            { value: 'pt', label: 'PT' },
            { value: 'en', label: 'EN' },
          ]}
        />

        {/* Notifications */}
        <NotificationDropdown />

        {/* Settings */}
        <div className="flex items-center text-2xl animate-spin-slow cursor-pointer">
          <SettingButton />
        </div>

        {/* User Menu */}
        {user && (
          <Dropdown
            menu={{ items: userMenuItems, onClick }}
            className="h-[48px] flex items-center"
          >
            <div className="cursor-pointer">
              <Avatar
                size={32}
                src={user.avatar}
                icon={!user.avatar && <UserOutlined />}
              />
              <span className="ml-2 hidden lg:inline">
                {user.name}
              </span>
              <span className="ml-1 text-xs opacity-75 hidden xl:inline">
                ({getUserRoleDisplay()})
              </span>
            </div>
          </Dropdown>
        )}
      </div>
    </div>
  );
};

export default HeaderPage;
