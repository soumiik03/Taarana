export type StatusType =
  | "draft"
  | "in_progress"
  | "under_review"
  | "approved"
  | "shipped"
  | "rejected"
  | "pending";

export interface StatusStyle {
  label: string;
  bg: string;
  text: string;
  dot: string;
}

export const statusStyles: Record<StatusType, StatusStyle> = {
  draft: {
    label: "Draft",
    bg: "bg-[#252525]",
    text: "text-[#9B9B9B]",
    dot: "bg-[#9B9B9B]",
  },
  in_progress: {
    label: "In Progress",
    bg: "bg-[#1E293B]/60",
    text: "text-[#38BDF8]",
    dot: "bg-[#38BDF8]",
  },
  under_review: {
    label: "Under Review",
    bg: "bg-[#3B2E1E]/60",
    text: "text-[#F59E0B]",
    dot: "bg-[#F59E0B]",
  },
  approved: {
    label: "Approved",
    bg: "bg-[#14532D]/40",
    text: "text-[#4ADE80]",
    dot: "bg-[#4ADE80]",
  },
  shipped: {
    label: "Shipped",
    bg: "bg-[#312E81]/60",
    text: "text-[#818CF8]",
    dot: "bg-[#818CF8]",
  },
  rejected: {
    label: "Rejected",
    bg: "bg-[#7F1D1D]/40",
    text: "text-[#F87171]",
    dot: "bg-[#F87171]",
  },
  pending: {
    label: "Pending",
    bg: "bg-[#27272A]",
    text: "text-[#A1A1AA]",
    dot: "bg-[#A1A1AA]",
  },
};
