import type { LucideIcon } from "lucide-react";

export type ChatSidebarItem = {
  label: string;
  icon: LucideIcon;
  active?: boolean;
};

export type ChatMenuItem = {
  label: string;
  icon?: LucideIcon;
  trailing?: boolean;
  muted?: boolean;
  separatorBefore?: boolean;
};
