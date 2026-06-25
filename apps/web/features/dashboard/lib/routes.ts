import {
  LayoutDashboard,
  Lightbulb,
  FileText,
  Kanban,
  Github,
  GitPullRequest,
  History,
  CreditCard,
  Settings,
} from "lucide-react";

export interface RouteItem {
  label: string;
  href: string;
  icon: any;
}

export const dashboardRoutes: RouteItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Feature Requests",
    href: "/dashboard/feature-requests",
    icon: Lightbulb,
  },
  {
    label: "PRD Editor",
    href: "/dashboard/prds",
    icon: FileText,
  },
  {
    label: "Task Board",
    href: "/dashboard/tasks",
    icon: Kanban,
  },
  {
    label: "GitHub",
    href: "/dashboard/github",
    icon: Github,
  },
  {
    label: "Pull Requests",
    href: "/dashboard/prs",
    icon: GitPullRequest,
  },
  {
    label: "Review History",
    href: "/dashboard/reviews",
    icon: History,
  },
  {
    label: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

