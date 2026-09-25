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
  PieChart,
  ShieldCheck,
  ArrowLeftRight,
  HelpCircle,
  Send,
  LifeBuoy,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Headphones,
  FileQuestion,
  X,
} from "lucide-react";

type UserType = {
  id: string;
  name: string;
  email: string;
  role?: string;
  createdAt: string;
};

type SupportTicket = {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: string;
  status: string; // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  message: string;
  createdAt: string;
};

type Summary = {
  totalTickets: number;
  openCount: number;
  resolvedCount: number;
};

const FAQ_ITEMS = [
  {
    q: "How is portfolio return (ROI) calculated?",
    a: "ROI is calculated as ((Current Market Value - Total Capital Invested) / Total Capital Invested) * 100. It updates in real time whenever you modify an asset's current valuation.",
  },
  {
    q: "Which asset categories are supported on InvestPro?",
    a: "InvestPro supports Stocks, Mutual Funds, Cryptocurrencies, Real Estate, Fixed Deposits, Gold, Government & Corporate Bonds, and custom asset classes under 'Other'.",
  },
  {
    q: "How do I record my deposits and asset transactions?",
    a: "Navigate to the 'Transactions' page in your sidebar and click 'Record Transaction'. You can choose Buy, Sell, Deposit, Withdrawal, or Dividend to maintain your complete financial ledger.",
  },
  {
    q: "How does the Diversification Health score work?",
    a: "Your diversification rating assesses asset class distribution. Portfolios spread across 4+ asset categories with no single class exceeding 40% receive an 'Optimal' rating.",
  },
  {
    q: "How long does it take for support tickets to be resolved?",
    a: "Our support and advisory team typically reviews and responds to priority inquiries within 2 to 4 business hours.",
  },
];

const STATUS_BADGES: Record<string, string> = {
  OPEN: "bg-blue-50 text-blue-700 border-blue-200",
  IN_PROGRESS: "bg-indigo-50 text-indigo-700 border-indigo-200",
  RESOLVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  CLOSED: "bg-slate-100 text-slate-700 border-slate-200",
};

const PRIORITY_BADGES: Record<string, string> = {
  LOW: "bg-slate-100 text-slate-700 border-slate-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HIGH: "bg-orange-50 text-orange-700 border-orange-200",
  URGENT: "bg-rose-50 text-rose-700 border-rose-200",
};

export default function SupportPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserType | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Form State
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Portfolio & Investments");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formFeedback, setFormFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // FAQ Accordion State
  const [faqSearch, setFaqSearch] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const loadTickets = async () => {
    try {
      const [meRes, supRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/support"),
      ]);

      if (meRes.status === 401 || supRes.status === 401) {
        router.push("/login");
        return;
      }

      const meData = await meRes.json();
      const supData = await supRes.json();

      if (meData.success) setUser(meData.user);
      if (supData.success) {
        setTickets(supData.tickets || []);
        setSummary(supData.summary || null);
      }
    } catch (err) {
      console.error("Failed to load support data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
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

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormFeedback(null);

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, priority, message }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setFormFeedback({ type: "error", text: data.message || "Failed to submit ticket." });
        return;
      }

      setFormFeedback({ type: "success", text: data.message || "Ticket submitted successfully!" });
      setSubject("");
      setMessage("");
      setPriority("MEDIUM");
      await loadTickets();
    } catch (err) {
      console.error("Submit ticket error:", err);
      setFormFeedback({ type: "error", text: "Something went wrong while submitting your request." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredFaqs = useMemo(() => {
    if (!faqSearch) return FAQ_ITEMS;
    return FAQ_ITEMS.filter(
      (item) =>
        item.q.toLowerCase().includes(faqSearch.toLowerCase()) ||
        item.a.toLowerCase().includes(faqSearch.toLowerCase())
    );
  }, [faqSearch]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">Loading Help Center...</p>
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
                className="flex items-center gap-3 rounded-lg bg-blue-600 px-4 py-3 text-white font-medium"
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Support & Help Desk</h1>
            <p className="mt-1 text-slate-500">
              Submit support tickets, track active inquiries, and explore FAQs.
            </p>
          </div>

          {/* Contact Support Cards */}
          <div className="grid gap-6 sm:grid-cols-3 mb-8">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex items-center gap-4">
              <div className="rounded-xl bg-blue-50 p-3.5 text-blue-600">
                <Mail size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email Assistance
                </p>
                <h4 className="mt-1 font-bold text-slate-900">support@investpro.com</h4>
                <p className="text-xs text-slate-500">2-4h response time</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex items-center gap-4">
              <div className="rounded-xl bg-indigo-50 p-3.5 text-indigo-600">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Phone Line
                </p>
                <h4 className="mt-1 font-bold text-slate-900">+1 (555) 123-4567</h4>
                <p className="text-xs text-slate-500">Mon - Fri, 9am - 6pm EST</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200/80 flex items-center gap-4">
              <div className="rounded-xl bg-emerald-50 p-3.5 text-emerald-600">
                <Headphones size={24} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Active Tickets
                </p>
                <h4 className="mt-1 font-bold text-slate-900">
                  {summary?.openCount || 0} Open / {summary?.totalTickets || 0} Total
                </h4>
                <p className="text-xs text-slate-500">Real-time status tracking</p>
              </div>
            </div>
          </div>

          {/* Grid Layout: Submit Ticket Form + Ticket Tracker */}
          <div className="grid gap-8 lg:grid-cols-12 mb-8">
            {/* Submit Ticket Form */}
            <div className="lg:col-span-6 rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-200/80">
              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <MessageSquare size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Create Support Ticket</h3>
                  <p className="text-xs text-slate-500">Describe your issue or question in detail</p>
                </div>
              </div>

              {formFeedback && (
                <div
                  className={`mb-5 rounded-xl border px-4 py-3 text-sm font-medium flex items-center justify-between ${
                    formFeedback.type === "success"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {formFeedback.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{formFeedback.text}</span>
                  </div>
                  <button onClick={() => setFormFeedback(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={14} />
                  </button>
                </div>
              )}

              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Subject / Topic
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Brief summary of your inquiry"
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="Portfolio & Investments">Portfolio & Investments</option>
                      <option value="Transactions & Ledger">Transactions & Ledger</option>
                      <option value="Account & Security">Account & Security</option>
                      <option value="Technical Issue">Technical Issue</option>
                      <option value="General Question">General Question</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                      Priority
                    </label>
                    <select
                      value={priority}
                      onChange={(e) => setPriority(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="LOW">LOW</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="HIGH">HIGH</option>
                      <option value="URGENT">URGENT</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Message Description
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Please explain the details or problem you are encountering..."
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm hover:bg-blue-700 transition disabled:opacity-50 text-sm"
                >
                  <Send size={16} />
                  {submitting ? "Submitting Ticket..." : "Submit Ticket"}
                </button>
              </form>
            </div>

            {/* My Support Tickets List */}
            <div className="lg:col-span-6 rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-200/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                      <Clock size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">Your Tickets</h3>
                      <p className="text-xs text-slate-500">Status updates on submitted inquiries</p>
                    </div>
                  </div>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                    {tickets.length} total
                  </span>
                </div>

                {tickets.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center bg-slate-50/50 my-6">
                    <LifeBuoy size={40} className="mx-auto text-slate-400 mb-2.5" />
                    <h4 className="font-bold text-slate-800 text-sm">No Tickets Yet</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Whenever you submit a question or issue, it will be tracked here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1">
                    {tickets.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-xl border border-slate-200/80 p-4 hover:border-blue-300 transition bg-slate-50/50"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-bold text-slate-900 text-sm truncate">
                            {t.subject}
                          </span>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border shrink-0 ${
                              STATUS_BADGES[t.status] || STATUS_BADGES.OPEN
                            }`}
                          >
                            {t.status}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 mb-2">{t.message}</p>

                        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-200/60">
                          <span className="font-mono font-medium text-blue-600">#{t.ticketNumber}</span>
                          <span
                            className={`px-2 py-0.5 rounded-md font-semibold border ${
                              PRIORITY_BADGES[t.priority] || PRIORITY_BADGES.MEDIUM
                            }`}
                          >
                            {t.priority}
                          </span>
                          <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 text-center">
                <p className="text-xs text-slate-500">
                  Need urgent help? Reach out directly via <span className="font-semibold text-slate-700">support@investpro.com</span>
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Knowledge Base / FAQs */}
          <div className="rounded-2xl bg-white p-6 md:p-8 shadow-sm border border-slate-200/80">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <FileQuestion size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Frequently Asked Questions</h3>
                  <p className="text-xs text-slate-500">Instant answers to common platform questions</p>
                </div>
              </div>

              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  placeholder="Search FAQ..."
                  className="pl-9 pr-4 py-2 text-sm rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-full sm:w-64"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredFaqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={index}
                    className={`rounded-xl border transition ${
                      isOpen ? "border-blue-200 bg-blue-50/20" : "border-slate-200/80 bg-white"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                      className="flex w-full items-center justify-between p-4 text-left font-semibold text-slate-900 text-sm"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? <ChevronUp size={16} className="text-blue-600" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs md:text-sm text-slate-600 leading-relaxed border-t border-blue-100/60 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
