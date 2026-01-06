"use client";

import { usePathname, useRouter } from "next/navigation";
import { DashboardTabs } from "../../../components/DashboardTabs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  
  // Determine active tab from pathname
  let activeTab = "forensic";
  if (pathname?.includes("/analytics")) {
    activeTab = "analytics";
  } else if (pathname?.includes("/policy")) {
    activeTab = "policy";
  }

  const handleTabChange = (tab: string) => {
    if (tab === "forensic") {
      router.push("/dashboard");
    } else if (tab === "analytics") {
      router.push("/dashboard/analytics");
    } else if (tab === "policy") {
      router.push("/dashboard/policy");
    }
  };

  return (
    <DashboardTabs activeTab={activeTab} onTabChange={handleTabChange}>
      {children}
    </DashboardTabs>
  );
}

