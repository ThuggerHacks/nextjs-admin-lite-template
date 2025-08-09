"use client";

import "./breadcrumb.css";

import { usePathname } from "next/navigation";
import { useTranslation } from "@/contexts/LanguageContext";

import { Breadcrumb } from "antd";

const getPathLabels = (url: string, t: (key: string) => string) => {
  const pathSegments = url.split("/").filter((i) => i);
  const labels: { title: string }[] = [];

  // Define static route mapping for breadcrumbs
  const routeMap: { [key: string]: string } = {
    '/homepage': t("navigation.homepage"),
    '/reports': t("navigation.reports"),
    '/reports/submit': t("navigation.submitReports"),
    '/reports/view': t("navigation.viewReports"),
    '/goals': t("navigation.goals"),
    '/goals/view': t("navigation.viewGoals"),
    '/goals/create': t("navigation.createGoals"),
    '/goals/edit': t("navigation.editGoals"),
    '/scanner': t("navigation.scan"),
    '/digitalize': t("navigation.digitalize"),
    '/libraries': t("navigation.libraries"),
    '/documents': t("navigation.documents"),
    '/management': t("navigation.management"),
    '/management/users': t("navigation.users"),
    '/management/dashboard': t("navigation.generalPanel"),
    '/management/requests': t("navigation.requests"),
    '/notifications': t("navigation.notifications"),
    '/profile': t("navigation.profile"),
    '/form-page': 'Form Pages',
    '/form-page/basic-form-page': 'Basic Form',
    '/form-page/step-form-page': 'Step Form',
    '/table': 'Tables',
  };

  // Build path progressively
  let currentPath = '';
  for (let i = 0; i < pathSegments.length; i++) {
    currentPath += `/${pathSegments[i]}`;
    const title = routeMap[currentPath];
    
    if (title) {
      labels.push({
        title: title,
      });
    } else {
      // Fallback: use the segment name formatted
      const formattedSegment = pathSegments[i]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      labels.push({
        title: formattedSegment,
      });
    }
  }

  return labels;
};

const NavBreadcrumb = () => {
  const pathname = usePathname();
  const { t } = useTranslation();
  const labels = getPathLabels(pathname, t);

  return (
    <div className="custom-breadcrumb ml-2 cursor-pointer">
      <Breadcrumb items={labels} />
    </div>
  );
};

export default NavBreadcrumb;
