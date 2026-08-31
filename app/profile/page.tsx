"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  PlusCircle,
  User as UserIcon,
  LogOut,
  KeyRound,
  ShieldCheck,
  Mail,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Wallet,
  PieChart,
} from "lucide-react";

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
};

type Summary = {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  roiPercentage: number;
  totalCount: number;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPw, setUpdatingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        const invRes = await fetch("/api/investments");
        if (invRes.ok) {
          const invData = await invRes.json();
          setSummary(invData.summary);
        }
      } catch (error) {
        console.error("Fetch profile data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      router.push("/login");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwMsg({ type: "error", text: "Please fill in all password fields." });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwMsg({ type: "error", text: "New password and confirmation do not match." });
      return;
    }

    if (newPassword.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }

    setUpdatingPw(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setPwMsg({ type: "error", text: data.message || "Failed to change password." });
        setUpdatingPw(false);
        return;
      }

      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Password change error:", error);
      setPwMsg({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setUpdatingPw(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">
            Loading profile information...
          </p>
        </div>
      </main>
    );
  }

  if (!user) return null;

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-10 text-white tracking-tight">
              InvestPro
            </h1>

            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
              >
                <LayoutDashboard size={20} />
                Dashboard
              </Link>

              <Link
                href="/investments"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
              >
                <TrendingUp size={20} />
                Investments
              </Link>

              <Link
                href="/investments/add"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
              >
                <PlusCircle size={20} />
                Add Investment
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium"
              >
                <UserIcon size={20} />
                Profile
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
                >
                  <ShieldCheck size={20} />
                  Admin Panel
                </Link>
              )}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-red-400 hover:bg-slate-800 transition"
          >
            <LogOut size={20} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                User Profile & Account Settings
              </h2>
              <p className="mt-1 text-slate-500">
                Manage your account credentials, security preferences, and portfolio overview.
              </p>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
              {/* User Overview Card */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 text-center">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600 font-bold text-2xl mb-4">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {user.name}
                  </h3>
                  <p className="text-sm text-slate-500 flex items-center justify-center gap-1.5 mt-1">
                    <Mail size={14} /> {user.email}
                  </p>

                  <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-left text-sm">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" /> Joined
                      </span>
                      <span className="font-semibold text-slate-900">
                        {new Date(user.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-emerald-500" /> Account Status
                      </span>
                      <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-xs">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Mini Portfolio Stats */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                  <h4 className="font-bold text-slate-900 text-base mb-4">
                    Account Stats
                  </h4>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Total Invested</span>
                      <span className="font-semibold text-slate-900">
                        Rs. {(summary?.totalInvested || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Current Value</span>
                      <span className="font-semibold text-slate-900">
                        Rs. {(summary?.totalCurrentValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">Net Profit</span>
                      <span
                        className={`font-bold ${
                          (summary?.totalProfitLoss || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {(summary?.totalProfitLoss || 0) >= 0 ? "+" : ""}Rs.{" "}
                        {(summary?.totalProfitLoss || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security & Password Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                      <KeyRound size={22} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Change Password
                      </h3>
                      <p className="text-xs text-slate-500">
                        Update your account password to maintain security.
                      </p>
                    </div>
                  </div>

                  {pwMsg && (
                    <div
                      className={`mb-6 p-4 rounded-xl border flex items-center gap-3 text-sm ${
                        pwMsg.type === "success"
                          ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}
                    >
                      {pwMsg.type === "success" ? (
                        <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                      ) : (
                        <AlertCircle size={18} className="shrink-0 text-red-600" />
                      )}
                      <span>{pwMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Current Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter your current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-3.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Enter new password (min. 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-3.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        placeholder="Confirm your new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-3.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition text-sm"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updatingPw}
                      className="w-full rounded-xl bg-blue-600 py-3.5 text-white font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-50"
                    >
                      {updatingPw ? "Updating Password..." : "Update Password"}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
