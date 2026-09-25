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
  PieChart,
  ShieldCheck,
  ArrowLeftRight,
  HelpCircle,
  Search,
  Filter,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Receipt,
  Download,
  Calendar,
  Layers,
} from "lucide-react";

type UserType = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
};

type Transaction = {
  id: string;
  type: string; // BUY, SELL, DEPOSIT, WITHDRAWAL, DIVIDEND
  assetName: string;
  category: string;
  amount: number;
  status: string; // COMPLETED, PENDING, CANCELLED
  date: string;
  notes?: string;
  createdAt: string;
};

type Summary = {
  totalInflow: number;
  totalOutflow: number;
  netVolume: number;
  totalCount: number;
};

const TYPE_CONFIG: Record<
  string,
  { label: string; badge: string; icon: any; isPositive: boolean }
> = {
  BUY: {
    label: "Buy Asset",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: ArrowDownLeft,
    isPositive: false,
  },
  SELL: {
    label: "Sell Asset",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    icon: ArrowUpRight,
    isPositive: true,
  },
  DEPOSIT: {
    label: "Deposit",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    icon: ArrowDownLeft,
    isPositive: true,
  },
  WITHDRAWAL: {
    label: "Withdrawal",
    badge: "bg-rose-50 text-rose-700 border-rose-200",
    icon: ArrowUpRight,
    isPositive: false,
  },
  DIVIDEND: {
    label: "Dividend",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    icon: ArrowDownLeft,
    isPositive: true,
  },
};

const CATEGORIES = [
  "Stocks",
  "Mutual Funds",
  "Crypto",
  "Real Estate",
  "Fixed Deposit",
  "Gold",
  "Bonds",
  "Cash & Deposit",
  "Other",
];

const formatCurrency = (val: number) =>
  `Rs. ${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export default function TransactionsPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Filters & search
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Create Modal
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalMessage, setModalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [pageMessage, setPageMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    type: "BUY",
    assetName: "",
    category: "Stocks",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    notes: "",
    status: "COMPLETED",
  });

  const loadTransactions = async () => {
    try {
      const [meRes, txRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/transactions"),
      ]);

      if (meRes.status === 401 || txRes.status === 401) {
        router.push("/login");
        return;
      }

      const meData = await meRes.json();
      const txData = await txRes.json();

      if (meData.success) setUser(meData.user);
      if (txData.success) {
        setTransactions(txData.transactions || []);
        setSummary(txData.summary || null);
      }
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setModalMessage(null);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setModalMessage({ type: "error", text: data.message || "Failed to record transaction." });
        return;
      }

      setPageMessage({ type: "success", text: "Transaction successfully recorded!" });
      setShowModal(false);
      setFormData({
        type: "BUY",
        assetName: "",
        category: "Stocks",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        notes: "",
        status: "COMPLETED",
      });
      await loadTransactions();
    } catch (err) {
      console.error("Create tx error:", err);
      setModalMessage({ type: "error", text: "Something went wrong." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = window.confirm(`Delete transaction for "${name}"?`);
    if (!confirm) return;

    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      const data = await res.json();

      if (data.success) {
        setPageMessage({ type: "success", text: "Transaction removed." });
        await loadTransactions();
      } else {
        setPageMessage({ type: "error", text: data.message || "Could not delete transaction." });
      }
    } catch (err) {
      console.error("Delete error:", err);
      setPageMessage({ type: "error", text: "Failed to delete transaction." });
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesType = typeFilter === "ALL" || t.type === typeFilter;
      const matchesCategory = categoryFilter === "ALL" || t.category === categoryFilter;
      const matchesSearch =
        t.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [transactions, typeFilter, categoryFilter, searchQuery]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">Loading your transaction records...</p>
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
                className="flex items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-slate-800 transition"
              >
                <PieChart size={20} />
                Portfolio
              </Link>

              <Link
                href="/transactions"
                className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium"
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
              <h1 className="text-3xl font-bold text-slate-900">Transaction History</h1>
              <p className="mt-1 text-slate-500">
                Log and monitor all your asset purchases, sales, deposits, and dividend income.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white shadow-sm hover:bg-blue-700 transition text-sm"
              >
                <PlusCircle size={16} /> Record Transaction
              </button>
            </div>
          </div>

          {pageMessage && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm font-medium flex items-center justify-between ${
                pageMessage.type === "success"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              <div className="flex items-center gap-2">
                {pageMessage.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>{pageMessage.text}</span>
              </div>
              <button onClick={() => setPageMessage(null)} className="text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            </div>
          )}

          {/* Metric Summary Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {/* Total Inflow */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Inflow
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-emerald-600">
                    +{formatCurrency(summary?.totalInflow || 0)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Deposits, sales & dividends
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <ArrowDownLeft size={24} />
                </div>
              </div>
            </div>

            {/* Total Outflow */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Outflow
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-rose-600">
                    -{formatCurrency(summary?.totalOutflow || 0)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Purchases & withdrawals
                  </p>
                </div>
                <div className="rounded-xl bg-rose-50 p-3 text-rose-600">
                  <ArrowUpRight size={24} />
                </div>
              </div>
            </div>

            {/* Net Transacted Volume */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Net Transacted
                  </p>
                  <h3
                    className={`mt-2 text-2xl font-bold ${
                      (summary?.netVolume || 0) >= 0 ? "text-emerald-600" : "text-slate-900"
                    }`}
                  >
                    {(summary?.netVolume || 0) >= 0 ? "+" : ""}
                    {formatCurrency(summary?.netVolume || 0)}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Net cash & capital flow
                  </p>
                </div>
                <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Wallet size={24} />
                </div>
              </div>
            </div>

            {/* Total Records */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Total Records
                  </p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">
                    {summary?.totalCount || 0}
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    All-time recorded transactions
                  </p>
                </div>
                <div className="rounded-xl bg-purple-50 p-3 text-purple-600">
                  <Receipt size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Transactions Ledger Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80">
            {/* Top Toolbar: Type Tabs & Filters */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-slate-100 pb-5">
              {/* Type Tabs */}
              <div className="flex flex-wrap items-center gap-1.5">
                {["ALL", "BUY", "SELL", "DEPOSIT", "WITHDRAWAL", "DIVIDEND"].map((t) => (
                  <button
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                      typeFilter === t
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              {/* Search & Category */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search asset or notes..."
                    className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full sm:w-56"
                  />
                </div>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3.5 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blue-500 text-slate-700 bg-white"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Table */}
            {filteredTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-slate-50/50">
                <Receipt size={48} className="mx-auto text-slate-400 mb-3" />
                <h3 className="text-lg font-bold text-slate-800">No Transactions Found</h3>
                <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                  {searchQuery || typeFilter !== "ALL"
                    ? "No records match your active search filters."
                    : "You have not recorded any transaction history yet."}
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 font-medium text-white hover:bg-blue-700 transition text-sm"
                >
                  <PlusCircle size={16} /> Record First Transaction
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-5 py-3.5">Type</th>
                      <th className="px-5 py-3.5">Asset / Reference</th>
                      <th className="px-5 py-3.5">Category</th>
                      <th className="px-5 py-3.5">Amount</th>
                      <th className="px-5 py-3.5">Status</th>
                      <th className="px-5 py-3.5">Date</th>
                      <th className="px-5 py-3.5">Notes</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.map((tx) => {
                      const config = TYPE_CONFIG[tx.type] || {
                        label: tx.type,
                        badge: "bg-slate-100 text-slate-700 border-slate-200",
                        icon: ArrowLeftRight,
                        isPositive: true,
                      };
                      const Icon = config.icon;

                      return (
                        <tr key={tx.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badge}`}
                            >
                              <Icon size={12} />
                              {config.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-semibold text-slate-900">
                            {tx.assetName}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {tx.category}
                          </td>
                          <td
                            className={`px-5 py-4 font-bold ${
                              config.isPositive ? "text-emerald-600" : "text-slate-900"
                            }`}
                          >
                            {config.isPositive ? "+" : "-"}
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${
                                tx.status === "COMPLETED"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : tx.status === "PENDING"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-slate-100 text-slate-700 border-slate-200"
                              }`}
                            >
                              {tx.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-500">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">
                            {tx.notes || "—"}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleDelete(tx.id, tx.assetName)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition"
                              title="Delete transaction"
                            >
                              <Trash2 size={15} />
                            </button>
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

      {/* Record Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Receipt size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Record Transaction</h3>
                  <p className="text-xs text-slate-500">Log a new buy, sell, deposit, or dividend</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X size={20} />
              </button>
            </div>

            {modalMessage && (
              <div
                className={`mt-4 rounded-xl border px-4 py-3 text-sm font-medium ${
                  modalMessage.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {modalMessage.text}
              </div>
            )}

            <form onSubmit={handleCreateTransaction} className="mt-5 space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Transaction Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["BUY", "SELL", "DEPOSIT", "WITHDRAWAL", "DIVIDEND"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFormData({ ...formData, type: t })}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        formData.type === t
                          ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Asset Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Asset / Reference Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.assetName}
                  onChange={(e) => setFormData({ ...formData, assetName: e.target.value })}
                  placeholder="e.g. Apple (AAPL), Bank Deposit, Bitcoin"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Category & Amount */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Amount (Rs.)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    min="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Date & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Notes (Optional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional memo or transaction reference"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Modal Buttons */}
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
