import {
  BookOpen, ChartLine, CircleAlert, ClipboardCheck, Ellipsis, GraduationCap, Headphones,
  Layers, LayoutDashboard, Library, Mic, Newspaper, PenLine, Settings,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_PRIMARY: NavItem[] = [
  { href: "/dashboard", label: "Today", icon: LayoutDashboard },
  { href: "/vocabulary", label: "Vocabulary", icon: Layers },
  { href: "/speaking", label: "Speaking", icon: Mic },
  { href: "/listening", label: "Listening", icon: Headphones },
  { href: "/reading", label: "Reading", icon: BookOpen },
  { href: "/writing", label: "Writing", icon: PenLine },
  { href: "/grammar", label: "Grammar", icon: Library },
  { href: "/nt2", label: "NT2 exam", icon: GraduationCap },
];

export const NAV_SECONDARY: NavItem[] = [
  { href: "/mistakes", label: "My mistakes", icon: CircleAlert },
  { href: "/progress", label: "Progress", icon: ChartLine },
  { href: "/blog", label: "Blog", icon: Newspaper },
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
export const PRACTICE_ROUTES = ["/practice", "/listening", "/reading", "/writing", "/grammar", "/nt2"];
