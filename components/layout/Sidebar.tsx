"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  ArrowLeftRight,
  PlusCircle,
  HelpCircle,
  User,
  ShieldCheck,
  LogOut,
} from "lucide-react";

interface SidebarProps {
  userRole?: string;
  activePath?: string;
}

export default function Sidebar({ userRole, activePath }: SidebarProps) {
  const currentPathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const pathname = activePath || currentPathname;

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.push("/login");
    }
  };

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      iconColor: "text-sky-400",
      iconBg: "bg-sky-500/15 group-hover:bg-sky-500/25",
      activeBg: "bg-sky-600 text-white shadow-md shadow-sky-950/40",
      activeIconBg: "bg-sky-500/30 text-white",
    },
    {
      label: "Investments",
      href: "/investments",
      icon: TrendingUp,
      iconColor: "text-emerald-400",
      iconBg: "bg-emerald-500/15 group-hover:bg-emerald-500/25",
      activeBg: "bg-emerald-600 text-white shadow-md shadow-emerald-950/40",
      activeIconBg: "bg-emerald-500/30 text-white",
    },
    {
      label: "Portfolio",
      href: "/portfolio",
      icon: PieChart,
      iconColor: "text-purple-400",
      iconBg: "bg-purple-500/15 group-hover:bg-purple-500/25",
      activeBg: "bg-purple-600 text-white shadow-md shadow-purple-950/40",
      activeIconBg: "bg-purple-500/30 text-white",
    },
    {
      label: "Transactions",
      href: "/transactions",
      icon: ArrowLeftRight,
      iconColor: "text-amber-400",
      iconBg: "bg-amber-500/15 group-hover:bg-amber-500/25",
      activeBg: "bg-amber-600 text-white shadow-md shadow-amber-950/40",
      activeIconBg: "bg-amber-500/30 text-white",
    },
    {
      label: "Add Investment",
      href: "/investments/add",
      icon: PlusCircle,
      iconColor: "text-teal-400",
      iconBg: "bg-teal-500/15 group-hover:bg-teal-500/25",
      activeBg: "bg-teal-600 text-white shadow-md shadow-teal-950/40",
      activeIconBg: "bg-teal-500/30 text-white",
    },
    {
      label: "Support & Help",
      href: "/support",
      icon: HelpCircle,
      iconColor: "text-pink-400",
      iconBg: "bg-pink-500/15 group-hover:bg-pink-500/25",
      activeBg: "bg-pink-600 text-white shadow-md shadow-pink-950/40",
      activeIconBg: "bg-pink-500/30 text-white",
    },
    {
      label: "Profile",
      href: "/profile",
      icon: User,
      iconColor: "text-indigo-400",
      iconBg: "bg-indigo-500/15 group-hover:bg-indigo-500/25",
      activeBg: "bg-indigo-600 text-white shadow-md shadow-indigo-950/40",
      activeIconBg: "bg-indigo-500/30 text-white",
    },
  ];

  const showAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN";

  return (
    <aside className="w-64 bg-slate-900 p-6 flex flex-col justify-between hidden md:flex shrink-0 min-h-screen border-r border-slate-800/80">
      <div>
        {/* Brand Logo */}
        <Link href="/" className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <span>Invest<span className="text-blue-500">Pro</span></span>
        </Link>

        {/* Navigation Items */}
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const isActive =
              item.href === "/investments"
                ? pathname === "/investments"
                : pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition-all duration-150 ${
                  isActive
                    ? item.activeBg
                    : "text-slate-300 hover:bg-slate-800/90 hover:text-white"
                }`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 shrink-0 ${
                    isActive ? item.activeIconBg : `${item.iconBg} ${item.iconColor}`
                  }`}
                >
                  <Icon size={19} />
                </div>
                <span className="text-sm font-semibold">{item.label}</span>
              </Link>
            );
          })}

          {/* Admin Panel Link */}
          {showAdmin && (
            <Link
              href="/admin"
              className={`group flex items-center gap-3 rounded-xl px-3.5 py-2.5 font-medium transition-all duration-150 mt-3 pt-3 border-t border-slate-800/80 ${
                pathname === "/admin"
                  ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md shadow-amber-950/40"
                  : "text-slate-300 hover:bg-slate-800/90 hover:text-white"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors duration-150 shrink-0 ${
                  pathname === "/admin"
                    ? "bg-amber-500/30 text-white"
                    : "bg-amber-500/15 text-amber-400 group-hover:bg-amber-500/25"
                }`}
              >
                <ShieldCheck size={19} />
              </div>
              <span className="text-sm font-semibold">Admin Panel</span>
            </Link>
          )}
        </nav>
      </div>

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-slate-400 hover:bg-slate-800/90 hover:text-rose-400 transition-colors duration-150 disabled:opacity-50 mt-8"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20 transition-colors duration-150 shrink-0">
          <LogOut size={19} />
        </div>
        <span className="text-sm font-semibold">{loggingOut ? "Logging out..." : "Logout"}</span>
      </button>
    </aside>
  );
}
