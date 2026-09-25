"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  PlusCircle,
  User,
  LogOut,
  Wallet,
  PieChart as PieChartIcon,
  BarChart3,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  Layers,
  ArrowRight,
  ArrowLeftRight,
  HelpCircle,
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

type Summary = {
  totalInvested: number;
  totalCurrentValue: number;
  totalProfitLoss: number;
  roiPercentage: number;
  totalCount: number;
};

type CategoryStat = {
  category: string;
  invested: number;
  currentValue: number;
  profitLoss: number;
  count: number;
  percentage: number;
  roiPercentage: number;
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

const formatCurrency = (val: number) =>
  `Rs. ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function PortfolioPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [meRes, invRes] = await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/investments"),
        ]);

        if (meRes.status === 401 || invRes.status === 401) {
          router.push("/login");
          return;
        }

        const meData = await meRes.json();
        const invData = await invRes.json();

        if (meData.success) setUser(meData.user);
        if (invData.success) {
          setInvestments(invData.investments || []);
          setSummary(invData.summary || null);
        }
      } catch (err) {
        console.error("Failed to load portfolio:", err);
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
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      router.push("/login");
    }
  };

  // Category statistics breakdown
  const categoryStats = useMemo<CategoryStat[]>(() => {
    if (!investments.length) return [];
    const totalVal = investments.reduce((acc, i) => acc + i.currentValue, 0);

    const map: Record<string, { invested: number; currentValue: number; profitLoss: number; count: number }> = {};

    investments.forEach((item) => {
      if (!map[item.category]) {
        map[item.category] = { invested: 0, currentValue: 0, profitLoss: 0, count: 0 };
      }
      map[item.category].invested += item.amount;
      map[item.category].currentValue += item.currentValue;
      map[item.category].profitLoss += item.profitLoss;
      map[item.category].count += 1;
    });

    return Object.entries(map).map(([category, stats]) => ({
      category,
      invested: stats.invested,
      currentValue: stats.currentValue,
      profitLoss: stats.profitLoss,
      count: stats.count,
      percentage: totalVal > 0 ? (stats.currentValue / totalVal) * 100 : 0,
      roiPercentage: stats.invested > 0 ? (stats.profitLoss / stats.invested) * 100 : 0,
    })).sort((a, b) => b.currentValue - a.currentValue);
  }, [investments]);

  // Diversification score calculation
  const diversificationInfo = useMemo(() => {
    const numCategories = categoryStats.length;
    if (numCategories === 0) return { score: "N/A", label: "No Assets", color: "text-slate-400", bg: "bg-slate-50 border-slate-200" };

    const highestAllocation = Math.max(...categoryStats.map((c) => c.percentage));

    if (numCategories >= 4 && highestAllocation <= 40) {
      return { score: "Optimal", label: "Well Balanced across multiple asset classes", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" };
    }
    if (numCategories >= 2 && highestAllocation <= 65) {
      return { score: "Moderate", label: "Moderate diversification, consider spreading risk", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" };
    }
    return { score: "Concentrated", label: "High concentration risk in top asset class", color: "text-rose-700", bg: "bg-rose-50 border-rose-200" };
  }, [categoryStats]);

  // Best & Worst performers
  const { topPerformer, lowestPerformer } = useMemo(() => {
    if (!investments.length) return { topPerformer: null, lowestPerformer: null };

    const withRoi = investments.map((inv) => ({
      ...inv,
      roi: inv.amount > 0 ? (inv.profitLoss / inv.amount) * 100 : 0,
    }));

    const sorted = [...withRoi].sort((a, b) => b.roi - a.roi);
    return {
      topPerformer: sorted[0],
      lowestPerformer: sorted.length > 1 ? sorted[sorted.length - 1] : null,
    };
  }, [investments]);

  // Chart data
  const pieData = useMemo(() => {
    return categoryStats.map((cat) => ({
      name: cat.category,
      value: cat.currentValue,
    }));
  }, [categoryStats]);

  const barData = useMemo(() => {
    return categoryStats.map((cat) => ({
      category: cat.category,
      Invested: cat.invested,
      "Current Value": cat.currentValue,
    }));
  }, [categoryStats]);

  // Filtered investments list
  const filteredInvestments = useMemo(() => {
    return investments.filter((item) => {
      const matchesCategory =
        selectedCategory === "ALL" || item.category === selectedCategory;
      const matchesSearch =
        item.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [investments, selectedCategory, searchQuery]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">Loading your portfolio analytics...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Left Sidebar */}
        <aside className="w-64 bg-slate-900 p-6 flex flex-col justify-between hidden md:flex shrink-0">
          <div>
            <Link href="/" className="text-2xl font-bold text-white tracking-tight">
              Invest<span className="text-blue-500">Pro</span>
            </Link>

            <nav className="mt-8 space-y-2">
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
                href="/portfolio"
                className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium"
              >
                <PieChartIcon size={20} />
                Portfolio
              </Link>

              <Link
                href="/transactions"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
              >
                <ArrowLeftRight size={20} />
                Transactions
              </Link>

              <Link
                href="/investments/add"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
              >
                <PlusCircle size={20} />
                Add Investment
              </Link>

              <Link
                href="/support"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
              >
                <HelpCircle size={20} />
                Support & Help
              </Link>

              <Link
                href="/profile"
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
              >
                <User size={20} />
                Profile
              </Link>

              {(user?.role === "ADMIN" || user?.role === "SUPERADMIN") && (
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
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-red-400 hover:bg-slate-800 transition disabled:opacity-50"
          >
            <LogOut size={20} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </aside>

        {/* Main Content Area */}
        <section className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-3xl font-bold text-slate-900">Portfolio Analytics</h1>
                <span className="rounded-full bg-blue-100 px-3 py-0.5 text-xs font-semibold text-blue-700 border border-blue-200">
                  Live Portfolio
                </span>
              </div>
              <p className="mt-1 text-slate-500">
                Asset allocation breakdown, risk analysis, and performance metrics.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/investments/add"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white shadow-sm hover:bg-blue-700 transition text-sm"
              >
                <PlusCircle size={16} /> Add Asset
              </Link>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Total Portfolio Value */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Portfolio Value
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(summary?.totalCurrentValue || 0)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    From {summary?.totalCount || 0} active asset{(summary?.totalCount || 0) === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Wallet size={24} />
                </div>
              </div>
            </div>

            {/* Total Invested Capital */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Invested
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {formatCurrency(summary?.totalInvested || 0)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Across {categoryStats.length} asset class{categoryStats.length === 1 ? "" : "es"}
                  </p>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <BarChart3 size={24} />
                </div>
              </div>
            </div>

            {/* Net Return / ROI */}
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
                    className={`mt-1 text-xs font-semibold flex items-center gap-1 ${
                      (summary?.totalProfitLoss || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {(summary?.roiPercentage || 0) >= 0 ? (
                      <ArrowUpRight size={14} />
                    ) : (
                      <ArrowDownRight size={14} />
                    )}
                    {(summary?.roiPercentage || 0).toFixed(2)}% Overall ROI
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

            {/* Diversification Score */}
            <div className={`rounded-2xl p-6 shadow-sm border ${diversificationInfo.bg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Diversification
                  </p>
                  <h3 className={`mt-2 text-2xl font-bold ${diversificationInfo.color}`}>
                    {diversificationInfo.score}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-1">
                    {diversificationInfo.label}
                  </p>
                </div>
                <div className="rounded-xl bg-white/80 p-3 text-slate-700 shadow-xs">
                  <Layers size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Highlights: Best vs Lagging Asset */}
          {investments.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 mb-8">
              {topPerformer && (
                <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-6 border border-emerald-200/80">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      <Award size={14} /> Top Performing Asset
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        CATEGORY_BADGES[topPerformer.category] || CATEGORY_BADGES.Other
                      }`}
                    >
                      {topPerformer.category}
                    </span>
                  </div>

                  <h4 className="mt-4 text-xl font-bold text-slate-900">{topPerformer.assetName}</h4>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Current Value</p>
                      <p className="text-lg font-bold text-slate-800">
                        {formatCurrency(topPerformer.currentValue)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Gain / ROI</p>
                      <p className="text-lg font-bold text-emerald-600">
                        +{formatCurrency(topPerformer.profitLoss)} (+{topPerformer.roi.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {lowestPerformer && (
                <div className="rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-transparent p-6 border border-slate-200/80">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800">
                      <Sparkles size={14} /> Asset Overview
                    </span>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                        CATEGORY_BADGES[lowestPerformer.category] || CATEGORY_BADGES.Other
                      }`}
                    >
                      {lowestPerformer.category}
                    </span>
                  </div>

                  <h4 className="mt-4 text-xl font-bold text-slate-900">{lowestPerformer.assetName}</h4>
                  <div className="mt-3 flex items-baseline justify-between">
                    <div>
                      <p className="text-xs text-slate-500">Current Value</p>
                      <p className="text-lg font-bold text-slate-800">
                        {formatCurrency(lowestPerformer.currentValue)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Performance</p>
                      <p
                        className={`text-lg font-bold ${
                          lowestPerformer.profitLoss >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {lowestPerformer.profitLoss >= 0 ? "+" : ""}
                        {formatCurrency(lowestPerformer.profitLoss)} ({lowestPerformer.roi.toFixed(1)}%)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Visual Charts */}
          {categoryStats.length > 0 ? (
            <div className="grid gap-8 lg:grid-cols-2 mb-8">
              {/* Asset Allocation Donut */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <PieChartIcon className="text-blue-600" size={18} /> Asset Allocation
                  </h3>
                  <span className="text-xs text-slate-500">By market value</span>
                </div>

                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
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
                      <Tooltip formatter={(val) => [formatCurrency(Number(val)), "Value"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Capital Invested vs Value */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BarChart3 className="text-indigo-600" size={18} /> Invested vs Market Value
                  </h3>
                  <span className="text-xs text-slate-500">By Category</span>
                </div>

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
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white mb-8">
              <PieChartIcon size={48} className="mx-auto text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No Portfolio Data Yet</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
                Add your investments to unlock asset allocation breakdowns, performance analytics, and risk health metrics.
              </p>
              <Link
                href="/investments/add"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 transition"
              >
                <PlusCircle size={18} /> Add Your First Asset
              </Link>
            </div>
          )}

          {/* Category Breakdown Table */}
          {categoryStats.length > 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 mb-8">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Asset Class Breakdown</h3>
              <p className="text-sm text-slate-500 mb-6">
                Allocation weights, capital deployment, and returns per asset class.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Asset Class</th>
                      <th className="px-5 py-3.5">Allocation</th>
                      <th className="px-5 py-3.5">Invested</th>
                      <th className="px-5 py-3.5">Market Value</th>
                      <th className="px-5 py-3.5">Gain / Loss</th>
                      <th className="px-5 py-3.5">ROI</th>
                      <th className="px-5 py-3.5">Assets</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {categoryStats.map((cat) => (
                      <tr key={cat.category} className="hover:bg-slate-50/70 transition">
                        <td className="px-5 py-4 font-semibold text-slate-900 flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other }}
                          />
                          {cat.category}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-2 w-24 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${cat.percentage}%`,
                                  backgroundColor: CATEGORY_COLORS[cat.category] || CATEGORY_COLORS.Other,
                                }}
                              />
                            </div>
                            <span className="font-semibold text-slate-800 text-xs">
                              {cat.percentage.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4">{formatCurrency(cat.invested)}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {formatCurrency(cat.currentValue)}
                        </td>
                        <td
                          className={`px-5 py-4 font-semibold ${
                            cat.profitLoss >= 0 ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          {cat.profitLoss >= 0 ? "+" : ""}
                          {formatCurrency(cat.profitLoss)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              cat.roiPercentage >= 0
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {cat.roiPercentage >= 0 ? "+" : ""}
                            {cat.roiPercentage.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500">{cat.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Holdings Explorer */}
          {investments.length > 0 && (
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Portfolio Holdings</h3>
                  <p className="text-sm text-slate-500">
                    Individual assets currently held in your portfolio.
                  </p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search holdings..."
                      className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-slate-700 bg-white"
                  >
                    <option value="ALL">All Asset Classes</option>
                    {categoryStats.map((c) => (
                      <option key={c.category} value={c.category}>
                        {c.category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Asset</th>
                      <th className="px-5 py-3.5">Class</th>
                      <th className="px-5 py-3.5">Invested</th>
                      <th className="px-5 py-3.5">Current Value</th>
                      <th className="px-5 py-3.5">Profit / Loss</th>
                      <th className="px-5 py-3.5">ROI</th>
                      <th className="px-5 py-3.5">Purchase Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvestments.map((item) => {
                      const roi = item.amount > 0 ? (item.profitLoss / item.amount) * 100 : 0;
                      return (
                        <tr key={item.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {item.assetName}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                                CATEGORY_BADGES[item.category] || CATEGORY_BADGES.Other
                              }`}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td className="px-5 py-4">{formatCurrency(item.amount)}</td>
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {formatCurrency(item.currentValue)}
                          </td>
                          <td
                            className={`px-5 py-4 font-semibold ${
                              item.profitLoss >= 0 ? "text-emerald-600" : "text-rose-600"
                            }`}
                          >
                            {item.profitLoss >= 0 ? "+" : ""}
                            {formatCurrency(item.profitLoss)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                                roi >= 0
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-rose-50 text-rose-700"
                              }`}
                            >
                              {roi >= 0 ? "+" : ""}
                              {roi.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            {new Date(item.purchaseDate).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
