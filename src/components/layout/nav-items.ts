import {
  BookA, BookOpen, BookText, ChartLine, CircleAlert, ClipboardCheck, Ellipsis, Headphones,
  Layers, LayoutDashboard, Mic, PenLine, Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_PRIMARY: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/dictionary", label: "Dictionary", icon: BookA },
  { href: "/vocabulary", label: "Vocabulary", icon: Layers },
  { href: "/grammar", label: "Grammar", icon: BookText },
  { href: "/speaking", label: "Speaking", icon: Mic },
  { href: "/listening", label: "Listening", icon: Headphones },
  { href: "/reading", label: "Reading", icon: BookOpen },
  { href: "/writing", label: "Writing", icon: PenLine },
];

export const NAV_SECONDARY: NavItem[] = [
  { href: "/mistakes", label: "My mistakes", icon: CircleAlert },
  { href: "/progress", label: "Progress", icon: ChartLine },
  { href: "/settings", label: "Settings", icon: Settings },
];

/** Mobile bottom bar: the five most frequent destinations. */
export const NAV_MOBILE: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/vocabulary", label: "Words", icon: Layers },
  { href: "/speaking", label: "Speak", icon: Mic },
  { href: "/practice", label: "Practice", icon: ClipboardCheck },
  { href: "/more", label: "More", icon: Ellipsis },
];

/** Routes that count as "Practice" on the mobile bar. */
export const PRACTICE_ROUTES = ["/practice", "/listening", "/reading", "/writing"];
