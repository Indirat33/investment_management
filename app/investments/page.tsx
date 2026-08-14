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
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  PieChart,
  Wallet,
  Layers,
  FileText,
  FileSpreadsheet,
} from "lucide-react";
import { exportToExcel, exportToPDF } from "@/lib/exportUtils";

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

const CATEGORIES = [
  "All Categories",
  "Stocks",
  "Mutual Funds",
  "Crypto",
  "Real Estate",
  "Fixed Deposit",
  "Gold",
  "Bonds",
  "Other",
];

const CATEGORY_COLORS: Record<string, string> = {
  Stocks: "bg-blue-50 text-blue-700 border-blue-200",
  "Mutual Funds": "bg-emerald-50 text-emerald-700 border-emerald-200",
  Crypto: "bg-purple-50 text-purple-700 border-purple-200",
  "Real Estate": "bg-amber-50 text-amber-700 border-amber-200",
  "Fixed Deposit": "bg-teal-50 text-teal-700 border-teal-200",
  Gold: "bg-yellow-50 text-yellow-800 border-yellow-200",
  Bonds: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Other: "bg-slate-100 text-slate-700 border-slate-200",
};

export default function InvestmentsPage() {
  const router = useRouter();

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Filters & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [sortBy, setSortBy] = useState("date-desc");

  // Edit Modal State
  const [editingItem, setEditingItem] = useState<Investment | null>(null);
  const [editAssetName, setEditAssetName] = useState("");
  const [editCategory, setEditCategory] = useState("Stocks");
  const [editAmount, setEditAmount] = useState("");
  const [editCurrentValue, setEditCurrentValue] = useState("");
  const [editPurchaseDate, setEditPurchaseDate] = useState("");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchInvestments = async () => {
    try {
      const meRes = await fetch("/api/auth/me");
      if (meRes.ok) {
        const meData = await meRes.json();
        setUser(meData.user);
      }

      const response = await fetch("/api/investments");
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to load investments");
      }
      const data = await response.json();
      if (data.success) {
        setInvestments(data.investments);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error("Error fetching investments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

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

  // Filtered & Sorted investments computation
  const filteredInvestments = useMemo(() => {
    return investments
      .filter((item) => {
        const matchesSearch = item.assetName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          selectedCategory === "All Categories" ||
          item.category.toLowerCase() === selectedCategory.toLowerCase();
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === "date-desc")
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        if (sortBy === "date-asc")
          return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
        if (sortBy === "amount-desc") return b.amount - a.amount;
        if (sortBy === "amount-asc") return a.amount - b.amount;
        if (sortBy === "profit-desc") return b.profitLoss - a.profitLoss;
        if (sortBy === "value-desc") return b.currentValue - a.currentValue;
        return 0;
      });
  }, [investments, searchQuery, selectedCategory, sortBy]);

  // Open Edit Modal
  const openEditModal = (item: Investment) => {
    setEditingItem(item);
    setEditAssetName(item.assetName);
    setEditCategory(item.category);
    setEditAmount(item.amount.toString());
    setEditCurrentValue(item.currentValue.toString());
    setEditPurchaseDate(
      new Date(item.purchaseDate).toISOString().split("T")[0]
    );
    setEditError("");
  };

  // Submit Edit
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setEditError("");
    const numAmount = Number(editAmount);
    const numCurrentValue = Number(editCurrentValue);

    if (isNaN(numAmount) || isNaN(numCurrentValue)) {
      setEditError("Amount and Current Value must be valid numbers.");
      return;
    }

    setUpdating(true);

    try {
      const response = await fetch(`/api/investments/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assetName: editAssetName,
          category: editCategory,
          amount: numAmount,
          currentValue: numCurrentValue,
          purchaseDate: editPurchaseDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setEditError(data.message || "Failed to update investment.");
        setUpdating(false);
        return;
      }

      setEditingItem(null);
      await fetchInvestments();
    } catch (error) {
      console.error("Update error:", error);
      setEditError("Something went wrong while updating.");
    } finally {
      setUpdating(false);
    }
  };

  // Submit Delete
  const handleDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);

    try {
      const response = await fetch(`/api/investments/${deletingId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setDeletingId(null);
        await fetchInvestments();
      }
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">
            Loading investments...
          </p>
        </div>
      </div>
    );
  }

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
                className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium"
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
                Your Investments
              </h2>
              <p className="mt-1 text-slate-500">
                Manage, edit, filter, and track all your active financial assets.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {investments.length > 0 && (
                <>
                  <button
                    onClick={() => exportToExcel(filteredInvestments)}
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
                  >
                    <FileSpreadsheet size={18} />
                    Export Excel
                  </button>

                  <button
                    onClick={() => exportToPDF(filteredInvestments, summary, user?.name)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 transition shadow-sm"
                  >
                    <FileText size={18} />
                    Export PDF
                  </button>
                </>
              )}

              <Link
                href="/investments/add"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition"
              >
                <PlusCircle size={18} />
                Add Investment
              </Link>
            </div>
          </div>

          {/* Quick Metrics Header Cards */}
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Invested
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    Rs. {(summary?.totalInvested || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Wallet size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Current Portfolio Value
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    Rs. {(summary?.totalCurrentValue || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                  <PieChart size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Net Profit / Loss
                  </p>
                  <h3
                    className={`mt-1 text-2xl font-bold ${
                      (summary?.totalProfitLoss || 0) >= 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {(summary?.totalProfitLoss || 0) >= 0 ? "+" : ""}
                    Rs. {(summary?.totalProfitLoss || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </div>
                <div
                  className={`rounded-xl p-3 ${
                    (summary?.totalProfitLoss || 0) >= 0
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  <TrendingUp size={22} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Assets
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-slate-900">
                    {summary?.totalCount || 0}
                  </h3>
                </div>
                <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                  <Layers size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search asset name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-100 outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-slate-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By Filter */}
              <div className="flex items-center gap-2">
                <ArrowUpDown size={16} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 focus:border-blue-600 focus:bg-white outline-none transition"
                >
                  <option value="date-desc">Newest First</option>
                  <option value="date-asc">Oldest First</option>
                  <option value="amount-desc">Highest Investment</option>
                  <option value="amount-asc">Lowest Investment</option>
                  <option value="profit-desc">Highest Profit</option>
                  <option value="value-desc">Highest Current Value</option>
                </select>
              </div>
            </div>
          </div>

          {/* Investments Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
            {filteredInvestments.length === 0 ? (
              <div className="p-12 text-center">
                <TrendingUp size={48} className="mx-auto text-slate-300 mb-3" />
                <h4 className="text-lg font-bold text-slate-800">
                  {investments.length === 0
                    ? "No investments added yet"
                    : "No matching investments found"}
                </h4>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  {investments.length === 0
                    ? "Start tracking your wealth by creating your first investment record."
                    : "Try adjusting your search query or category filters."}
                </p>
                {investments.length === 0 && (
                  <Link
                    href="/investments/add"
                    className="inline-flex items-center gap-2 mt-5 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition"
                  >
                    <PlusCircle size={16} /> Add First Investment
                  </Link>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4">Asset Name</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Purchase Date</th>
                      <th className="px-6 py-4">Invested Amount</th>
                      <th className="px-6 py-4">Current Value</th>
                      <th className="px-6 py-4">Profit / Loss</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvestments.map((item) => {
                      const roi = item.amount > 0 ? (item.profitLoss / item.amount) * 100 : 0;
                      const isProfit = item.profitLoss >= 0;

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/80 transition">
                          <td className="px-6 py-4 font-semibold text-slate-900">
                            {item.assetName}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                                CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other
                              }`}
                            >
                              {item.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {new Date(item.purchaseDate).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            Rs. {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-900">
                            Rs. {item.currentValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col">
                              <span
                                className={`font-bold ${
                                  isProfit ? "text-emerald-600" : "text-rose-600"
                                }`}
                              >
                                {isProfit ? "+" : ""}Rs.{" "}
                                {item.profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <span
                                className={`text-xs font-medium ${
                                  isProfit ? "text-emerald-600" : "text-rose-600"
                                }`}
                              >
                                {isProfit ? "+" : ""}
                                {roi.toFixed(2)}%
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditModal(item)}
                                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Investment"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => setDeletingId(item.id)}
                                className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete Investment"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
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

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-xl font-bold text-slate-900">Edit Investment</h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X size={20} />
              </button>
            </div>

            {editError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Asset Name
                </label>
                <input
                  type="text"
                  value={editAssetName}
                  onChange={(e) => setEditAssetName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 text-sm outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 text-sm bg-white outline-none focus:border-blue-600"
                >
                  {CATEGORIES.filter((c) => c !== "All Categories").map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Invested Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editAmount}
                    onChange={(e) => setEditAmount(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 text-sm outline-none focus:border-blue-600"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Current Market Value (Rs.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editCurrentValue}
                    onChange={(e) => setEditCurrentValue(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 text-sm outline-none focus:border-blue-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={editPurchaseDate}
                  onChange={(e) => setEditPurchaseDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 p-3 text-slate-900 text-sm bg-white outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-200 text-center animate-in fade-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Delete Investment</h3>
            <p className="text-sm text-slate-500 mt-2">
              Are you sure you want to delete this investment record? This action cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={() => setDeletingId(null)}
                className="w-full py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full py-2.5 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
