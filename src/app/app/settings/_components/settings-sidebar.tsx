"use client";

import {
  DashboardSidebarNav,
  DashboardSidebarNavMain,
  DashboardSidebarNavLink,
} from "@/components/dashboard/sidebar";
import { usePathname, useRouter } from "next/navigation";

export function SettingsSidebar() {
  const pathname = usePathname();
  const isActive = (path: string) => path === pathname;

  return (
    <aside>
      <DashboardSidebarNav>
        <DashboardSidebarNavMain>
          <DashboardSidebarNavLink
            href={"/app/settings/"}
            active={isActive("/app/settings/")}
          >
            Meu Perfil
          </DashboardSidebarNavLink>
          <DashboardSidebarNavLink
            href={"/app/settings/theme"}
            active={isActive("/app/settings/theme")}
          >
            Aparência
          </DashboardSidebarNavLink>
          <DashboardSidebarNavLink
            href={"/app/settings/billing"}
            active={isActive("/app/settings/billing")}
          >
            Assinatura
          </DashboardSidebarNavLink>
        </DashboardSidebarNavMain>
      </DashboardSidebarNav>
    </aside>
  );
}
