"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  PlusCircle,
  User,
  LogOut,
  Wallet,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowRight,
  Sparkles,
  ShieldCheck,
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

type UserType = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
};

type Investment = {
  id: string;
  assetName: string;
  category: string;
  amount: number;
  purchaseDate: string;
  currentValue: number;
  profitLoss: number;
  createdAt: string;
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

type Summary = {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  roiPercentage: number;
  totalCount: number;
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

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [categoryBreakdown, setCategoryBreakdown] = useState<CategoryBreakdown[]>([]);

  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const fetchData = async () => {
      try {
        // Fetch User
        const meRes = await fetch("/api/auth/me");
        if (!meRes.ok) {
          router.push("/login");
          return;
        }
        const meData = await meRes.json();
        setUser(meData.user);

        // Fetch Analytics
        const analyticsRes = await fetch("/api/analytics");
        if (analyticsRes.ok) {
          const data = await analyticsRes.json();
          if (data.success) {
            setSummary(data.summary);
            setCategoryBreakdown(data.categoryBreakdown);
          }
        }

        // Fetch Investments list
        const invRes = await fetch("/api/investments");
        if (invRes.ok) {
          const invData = await invRes.json();
          if (invData.success) {
            setInvestments(invData.investments);
          }
        }
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
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

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">
            Loading investment analytics...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const recentInvestments = investments.slice(0, 5);

  // Pie chart data
  const pieData = categoryBreakdown.map((item) => ({
    name: item.category,
    value: item.currentValue,
    percentage: item.percentage,
  }));

  // Bar chart data
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
            <h1 className="text-2xl font-bold mb-10 text-white tracking-tight">
              InvestPro
            </h1>

            <nav className="space-y-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium"
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
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
              >
                <User size={20} />
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
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">
                Welcome back, {user.name} 👋
              </h2>
              <p className="mt-1 text-slate-500">
                Real-time portfolio metrics, asset allocation, and performance analytics.
              </p>
            </div>

            <Link
              href="/investments/add"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
            >
              <PlusCircle size={18} />
              Add Investment
            </Link>
          </div>

          {/* Statistics Summary Grid */}
          <div className="grid gap-6 md:grid-cols-4 mb-8">
            {/* Total Investment */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Invested
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    Rs. {(summary?.totalInvested || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Wallet size={24} />
                </div>
              </div>
            </div>

            {/* Current Value */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Current Portfolio Value
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    Rs. {(summary?.totalCurrentValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <PieChartIcon size={24} />
                </div>
              </div>
            </div>

            {/* Total Profit */}
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
                    Rs. {(summary?.totalProfitLoss || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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

            {/* Total Assets Count */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Assets
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {summary?.totalCount || 0}
                  </h3>
                </div>
                <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                  <BarChart3 size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Visual Analytics Charts Row */}
          {investments.length > 0 && isMounted && (
            <div className="grid gap-8 lg:grid-cols-2 mb-8">
              {/* Asset Allocation Pie Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <PieChartIcon className="text-blue-600" size={18} /> Asset Allocation
                    </h3>
                    <p className="text-xs text-slate-500">Distribution by category</p>
                  </div>
                </div>

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
                        formatter={(val: any) => [
                          `Rs. ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                          "Value",
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Performance Comparison Bar Chart */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <BarChart3 className="text-indigo-600" size={18} /> Invested vs Current Value
                    </h3>
                    <p className="text-xs text-slate-500">Category growth comparison</p>
                  </div>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(val: any) => [
                          `Rs. ${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="Invested" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Current Value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Category Distribution Progress Bars */}
          {categoryBreakdown.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 mb-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="text-amber-500" size={18} /> Category Breakdown & Portfolio Weight
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categoryBreakdown.map((cat) => (
                  <div key={cat.category} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          CATEGORY_BADGES[cat.category] || CATEGORY_BADGES.Other
                        }`}
                      >
                        {cat.category}
                      </span>
                      <span className="text-xs font-bold text-slate-700">
                        {cat.percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-3">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(cat.percentage, 100)}%`,
                          backgroundColor: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other,
                        }}
                      ></div>
                    </div>

                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Value: Rs. {cat.currentValue.toLocaleString()}</span>
                      <span
                        className={`font-semibold ${
                          cat.profitLoss >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {cat.profitLoss >= 0 ? "+" : ""}{cat.roiPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Investments Section */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Recent Investments
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Your latest added investment portfolio assets
                </p>
              </div>

              {investments.length > 0 && (
                <Link
                  href="/investments"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  View All ({investments.length}) <ArrowRight size={16} />
                </Link>
              )}
            </div>

            {recentInvestments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center bg-slate-50/50">
                <TrendingUp size={44} className="mx-auto text-slate-400" />
                <p className="mt-3 font-semibold text-slate-700">
                  No investments recorded yet
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Start building your portfolio by adding your first investment.
                </p>
                <Link
                  href="/investments/add"
                  className="inline-flex items-center gap-2 mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                >
                  <PlusCircle size={16} /> Add First Investment
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Asset Name</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Invested Amount</th>
                      <th className="px-5 py-3.5">Current Value</th>
                      <th className="px-5 py-3.5">Profit / Loss</th>
                      <th className="px-5 py-3.5">Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recentInvestments.map((item) => {
                      const isProfit = item.profitLoss >= 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {item.assetName}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                CATEGORY_BADGES[item.category] || CATEGORY_BADGES.Other
                              }`}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-900">
                            Rs. {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-4 font-medium text-slate-900">
                            Rs. {item.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`font-bold ${
                                isProfit ? "text-emerald-600" : "text-rose-600"
                              }`}
                            >
                              {isProfit ? "+" : ""}Rs.{" "}
                              {item.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            {new Date(item.purchaseDate).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                        </tr>
                      );
                    })}
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