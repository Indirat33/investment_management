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
  ArrowLeft,
  Calendar,
  Tag,
  PieChart,
} from "lucide-react";

const CATEGORIES = [
  "Stocks",
  "Mutual Funds",
  "Crypto",
  "Real Estate",
  "Fixed Deposit",
  "Gold",
  "Bonds",
  "Other",
];

export default function AddInvestmentPage() {
  const router = useRouter();

  const [assetName, setAssetName] = useState("");
  const [category, setCategory] = useState("Stocks");
  const [amount, setAmount] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [currentValue, setCurrentValue] = useState("");

  const [loading, setLoading] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Auto-fill current value with purchase amount if empty
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setAmount(val);
    if (!currentValue || currentValue === amount) {
      setCurrentValue(val);
    }
  };

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg("");

    if (!assetName.trim() || !category || !amount || !purchaseDate || !currentValue) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }

    const numAmount = Number(amount);
    const numCurrentValue = Number(currentValue);

    if (isNaN(numAmount) || isNaN(numCurrentValue)) {
      setErrorMsg("Amount and Current Value must be valid numbers.");
      return;
    }

    if (numAmount < 0 || numCurrentValue < 0) {
      setErrorMsg("Amount cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assetName,
          category,
          amount: numAmount,
          purchaseDate,
          currentValue: numCurrentValue,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMsg(data.message || "Failed to add investment.");
        setLoading(false);
        return;
      }

      // Success redirect
      router.push("/investments");
    } catch (error) {
      console.error("Submit error:", error);
      setErrorMsg("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  const calcAmount = Number(amount) || 0;
  const calcCurrent = Number(currentValue) || 0;
  const calcProfitLoss = calcCurrent - calcAmount;
  const calcROI = calcAmount > 0 ? (calcProfitLoss / calcAmount) * 100 : 0;

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
                className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium"
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
          <div className="max-w-4xl mx-auto">
            {/* Top Navigation Back */}
            <div className="mb-6 flex items-center justify-between">
              <Link
                href="/investments"
                className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition"
              >
                <ArrowLeft size={16} /> Back to Investments
              </Link>
            </div>

            {/* Page Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                Add New Investment
              </h2>
              <p className="mt-1 text-slate-500">
                Enter your investment details to track real-time returns & portfolio growth.
              </p>
            </div>

            {/* Form Container */}
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200/80">
                {errorMsg && (
                  <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                    {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Asset Name */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Asset Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Apple Inc., Nifty 50 Index, Downtown Apartment"
                      value={assetName}
                      onChange={(e) => setAssetName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 p-3.5 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-3.5 text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition appearance-none pr-10"
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      <Tag
                        size={18}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </div>

                  {/* Amount & Current Value Grid */}
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Purchase Amount (Rs.) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={amount}
                          onChange={handleAmountChange}
                          className="w-full rounded-xl border border-slate-300 p-3.5 pl-12 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                          required
                        />
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-500 text-sm select-none">
                          Rs.
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Current Market Value (Rs.) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={currentValue}
                          onChange={(e) => setCurrentValue(e.target.value)}
                          className="w-full rounded-xl border border-slate-300 p-3.5 pl-12 text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                          required
                        />
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-semibold text-slate-500 text-sm select-none">
                          Rs.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Purchase Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={purchaseDate}
                        onChange={(e) => setPurchaseDate(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 p-3.5 text-slate-900 bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition"
                        required
                      />
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-blue-600 py-3.5 text-white font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 active:scale-[0.99] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Adding Investment..." : "Save Investment"}
                  </button>
                </form>
              </div>

              {/* Side Summary Card Preview */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-lg mb-4">
                    <PieChart className="text-blue-600" size={20} />
                    Investment Summary
                  </div>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Asset Name</span>
                      <span className="font-semibold text-slate-900 truncate max-w-[150px]">
                        {assetName || "—"}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Category</span>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                        {category}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Initial Amount</span>
                      <span className="font-semibold text-slate-900">
                        Rs. {calcAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Current Value</span>
                      <span className="font-semibold text-slate-900">
                        Rs. {calcCurrent.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span className="text-slate-500">Est. Profit / Loss</span>
                      <span
                        className={`font-bold ${
                          calcProfitLoss >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {calcProfitLoss >= 0 ? "+" : ""}Rs.{" "}
                        {calcProfitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between py-2">
                      <span className="text-slate-500">ROI %</span>
                      <span
                        className={`font-bold ${
                          calcROI >= 0 ? "text-emerald-600" : "text-rose-600"
                        }`}
                      >
                        {calcROI >= 0 ? "+" : ""}
                        {calcROI.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50/80 rounded-2xl p-6 border border-blue-100 text-blue-900 text-sm leading-relaxed">
                  💡 <strong>Pro Tip:</strong> Keep your investment current values updated periodically to get accurate portfolio returns and overall performance tracking.
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
