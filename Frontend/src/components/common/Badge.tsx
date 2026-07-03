import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  color?: "blue" | "green" | "amber" | "red" | "gray" | "purple";
  className?: string;
}

// Generalized version of the color-coded pill pattern your pages already
// repeat inline (MatchBadge, StatusBadge, ApplicationStatusBadge, etc.)
// Not currently used anywhere — available to de-duplicate that pattern later.
const COLOR_CLASSES: Record<NonNullable<BadgeProps["color"]>, string> = {
  blue: "bg-blue-50 text-blue-700",
  green: "bg-green-50 text-green-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-600",
  gray: "bg-gray-100 text-gray-600",
  purple: "bg-purple-50 text-purple-700",
};

export default function Badge({ children, color = "gray", className = "" }: BadgeProps) {
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${COLOR_CLASSES[color]} ${className}`}
    >
      {children}
    </span>
  );
}