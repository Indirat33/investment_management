"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  TrendingUp,
  Wallet,
  BarChart3,
  PieChart as PieChartIcon,
  LogOut,
  Trash2,
  Crown,
  UserMinus,
} from "lucide-react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

type AdminType = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Summary = {
  totalUsers: number;
  totalAdmins: number;
  totalInvestments: number;
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  roiPercentage: number;
};

type CategoryBreakdown = {
  category: string;
  amount: number;
  currentValue: number;
  profitLoss: number;
  count: number;
  percentage: number;
  roiPercentage: number;
};

type UserStat = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  investmentCount: number;
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  roiPercentage: number;
};

type RecentInvestment = {
  id: string;
  assetName: string;
  category: string;
  amount: number;
  currentValue: number;
  profitLoss: number;
  purchaseDate: string;
  user: { id: string; name: string; email: string };
};

const CATEGORY_COLORS: Record<string, string> = {
  Stocks: "#3b82f6",
  "Mutual Funds": "#10b981",
  Crypto: "#a855f7",
  "Real Estate": "#f59e0b",
  "Fixed Deposit": "#14b8a6",
  Gold: "#eab308",
  Bonds: "#6366f1",
  Other: "#64748b",
};

const CATEGORY_BADGES: Record<string, string> = {
  Stocks: "bg-blue-50 text-blue-700 border-blue-200",
  "Mutual Funds": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Crypto: "bg-purple-50 text-purple-700 border-purple-200",
  "Real Estate": "bg-amber-50 text-amber-700 border-amber-200",
  "Fixed Deposit": "bg-teal-50 text-teal-700 border-teal-200",
  Gold: "bg-yellow-50 text-yellow-800 border-yellow-200",
  Bonds: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Other: "bg-slate-100 text-slate-700 border-slate-200",
};

const formatCurrency = (value: number) =>
  `Rs. ${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

export default function AdminDashboardPage() {
  const router = useRouter();

  const [admin, setAdmin] = useState<AdminType | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);
  const [userStats, setUserStats] = useState<UserStat[]>([]);
  const [recentInvestments, setRecentInvestments] = useState<RecentInvestment[]>([]);

  const [loading, setLoading] = useState(true);
  const [forbidden, setForbidden] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [search, setSearch] = useState("");

  const loadStats = async () => {
    const res = await fetch("/api/admin/stats");

    if (res.status === 401) {
      router.push("/login");
      return;
    }

    if (res.status === 403) {
      setForbidden(true);
      return;
    }

    const data = await res.json();
    if (data.success) {
      setAdmin(data.admin);
      setSummary(data.summary);
      setCategoryBreakdown(data.categoryBreakdown);
      setUserStats(data.userStats);
      setRecentInvestments(data.recentInvestments);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await loadStats();
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleRoleChange = async (user: UserStat) => {
    const nextRole = user.role === "ADMIN" ? "USER" : "ADMIN";
    setActionUserId(user.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.message || "Failed to update role." });
        return;
      }

      setMessage({ type: "success", text: `${user.name} is now ${nextRole}.` });
      await loadStats();
    } catch (error) {
      console.error("Role update error:", error);
      setMessage({ type: "error", text: "Something went wrong while updating the role." });
    } finally {
      setActionUserId(null);
    }
  };

  const handleDelete = async (user: UserStat) => {
    const confirmed = window.confirm(
      `Delete ${user.name} (${user.email}) and all of their investments? This cannot be undone.`
    );
    if (!confirmed) return;

    setActionUserId(user.id);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/users/${user.id}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMessage({ type: "error", text: data.message || "Failed to delete user." });
        return;
      }

      setMessage({ type: "success", text: `${user.name} has been deleted.` });
      await loadStats();
    } catch (error) {
      console.error("Delete user error:", error);
      setMessage({ type: "error", text: "Something went wrong while deleting the user." });
    } finally {
      setActionUserId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">Loading admin dashboard...</p>
        </div>
      </main>
    );
  }

  if (forbidden) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200/80">
          <div className="mx-auto w-fit rounded-xl bg-rose-50 p-3 text-rose-600">
            <ShieldCheck size={28} />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Admin access required</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your account does not have permission to view this page.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 transition"
          >
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  }

  if (!admin) {
    return null;
  }

  const filteredUsers = userStats.filter((user) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return (
      user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    );
  });

  const pieData = categoryBreakdown.map((item) => ({
    name: item.category,
    value: item.currentValue,
  }));

  const barData = categoryBreakdown.map((item) => ({
    category: item.category,
    Invested: item.amount,
    "Current Value": item.currentValue,
  }));

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 bg-slate-900 text-white p-6 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 text-white tracking-tight">InvestPro</h1>
            <p className="mb-10 text-xs font-semibold uppercase tracking-wider text-blue-400">
              Admin Panel
            </p>

            <nav className="space-y-2">
              <Link
                href="/admin"
                className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium"
              >
                <ShieldCheck size={20} />
                Admin Dashboard
              </Link>

              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
              >
                <LayoutDashboard size={20} />
                My Dashboard
              </Link>

              <Link
                href="/investments"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
              >
                <TrendingUp size={20} />
                Investments
              </Link>
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Admin Dashboard</h2>
              <p className="mt-1 text-slate-500">
                Platform-wide users, portfolios, and performance overview.
              </p>
            </div>

            <span className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white">
              <Crown size={16} className="text-amber-400" />
              {admin.name}
            </span>
          </div>

          {message && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium ${
                message.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Statistics Summary Grid */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Users
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {summary?.totalUsers || 0}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {summary?.totalAdmins || 0} admin
                    {(summary?.totalAdmins || 0) === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Users size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Invested
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(summary?.totalInvested || 0)}
                  </h3>
                  <p className="mt-1 text-xs font-semibold text-slate-500">
                    {summary?.totalInvestments || 0} assets
                  </p>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <Wallet size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Platform Value
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(summary?.totalCurrentValue || 0)}
                  </h3>
                </div>
                <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                  <PieChartIcon size={24} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Net Profit / Loss
                  </p>
                  <h3
                    className={`mt-2 text-2xl font-bold ${
                      (summary?.totalProfitLoss || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {(summary?.totalProfitLoss || 0) >= 0 ? "+" : ""}
                    {formatCurrency(summary?.totalProfitLoss || 0)}
                  </h3>
                  <p
                    className={`mt-1 text-xs font-semibold ${
                      (summary?.totalProfitLoss || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {(summary?.roiPercentage || 0) >= 0 ? "▲" : "▼"}{" "}
                    {(summary?.roiPercentage || 0).toFixed(2)}% ROI
                  </p>
                </div>
                <div
                  className={`rounded-xl p-3 ${
                    (summary?.totalProfitLoss || 0) >= 0
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  <TrendingUp size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Charts */}
          {categoryBreakdown.length > 0 && (
            <div className="grid gap-8 lg:grid-cols-2 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <PieChartIcon className="text-blue-600" size={18} /> Platform Asset Allocation
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={CATEGORY_COLORS[entry.name] || CATEGORY_COLORS.Other}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(val) => [formatCurrency(Number(val)), "Value"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
                  <BarChart3 className="text-indigo-600" size={18} /> Invested vs Current Value
                </h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(val) => [formatCurrency(Number(val))]} />
                      <Legend />
                      <Bar dataKey="Invested" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Current Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* User Management */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">User Management</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Every registered user with their portfolio totals.
                </p>
              </div>

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name or email"
                className="w-full sm:w-72 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {filteredUsers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center bg-slate-50/50">
                <Users size={44} className="mx-auto text-slate-400" />
                <p className="mt-3 font-semibold text-slate-700">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">User</th>
                      <th className="px-5 py-3.5">Role</th>
                      <th className="px-5 py-3.5">Assets</th>
                      <th className="px-5 py-3.5">Invested</th>
                      <th className="px-5 py-3.5">Current Value</th>
                      <th className="px-5 py-3.5">Profit / Loss</th>
                      <th className="px-5 py-3.5">Joined</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              user.role === "ADMIN"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-slate-100 text-slate-700 border-slate-200"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">{user.investmentCount}</td>
                        <td className="px-5 py-4">{formatCurrency(user.totalInvested)}</td>
                        <td className="px-5 py-4">{formatCurrency(user.totalCurrentValue)}</td>
                        <td
                          className={`px-5 py-4 font-semibold ${
                            user.totalProfitLoss >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {user.totalProfitLoss >= 0 ? "+" : ""}
                          {formatCurrency(user.totalProfitLoss)}
                          <span className="ml-1 text-xs font-medium">
                            ({user.roiPercentage.toFixed(1)}%)
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleRoleChange(user)}
                              disabled={actionUserId === user.id || user.id === admin.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              {user.role === "ADMIN" ? (
                                <>
                                  <UserMinus size={14} /> Make user
                                </>
                              ) : (
                                <>
                                  <Crown size={14} /> Make admin
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => handleDelete(user)}
                              disabled={actionUserId === user.id || user.id === admin.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent platform investments */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <h3 className="text-xl font-bold text-slate-900 mb-1">Recent Platform Investments</h3>
            <p className="mb-6 text-sm text-slate-500">
              Latest assets added across every user account.
            </p>

            {recentInvestments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center bg-slate-50/50">
                <TrendingUp size={44} className="mx-auto text-slate-400" />
                <p className="mt-3 font-semibold text-slate-700">No investments recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Asset Name</th>
                      <th className="px-5 py-3.5">Owner</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Invested</th>
                      <th className="px-5 py-3.5">Current Value</th>
                      <th className="px-5 py-3.5">Profit / Loss</th>
                      <th className="px-5 py-3.5">Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentInvestments.map((investment) => (
                      <tr key={investment.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {investment.assetName}
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-medium text-slate-700">{investment.user.name}</p>
                          <p className="text-xs text-slate-500">{investment.user.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              CATEGORY_BADGES[investment.category] || CATEGORY_BADGES.Other
                            }`}
                          >
                            {investment.category}
                          </span>
                        </td>
                        <td className="px-5 py-4">{formatCurrency(investment.amount)}</td>
                        <td className="px-5 py-4">{formatCurrency(investment.currentValue)}</td>
                        <td
                          className={`px-5 py-4 font-semibold ${
                            investment.profitLoss >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {investment.profitLoss >= 0 ? "+" : ""}
                          {formatCurrency(investment.profitLoss)}
                        </td>
                        <td className="px-5 py-4">
                          {new Date(investment.purchaseDate).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
