"use client";

import Link from "next/link";

export default function Navbar() {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow-sm z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold text-blue-600">
          InvestPro
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className="text-slate-700 hover:text-blue-600 font-medium transition"
          >
            Home
          </Link>

          <a
            href="#features"
            className="text-slate-700 hover:text-blue-600 font-medium transition"
          >
            Features
          </a>

          <a
            href="#how-it-works"
            className="text-slate-700 hover:text-blue-600 font-medium transition"
          >
            How It Works
          </a>

          <a
            href="#testimonials"
            className="text-slate-700 hover:text-blue-600 font-medium transition"
          >
            Testimonials
          </a>
        </div>

        {/* Right Side Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="rounded-lg border border-blue-600 px-5 py-2 font-medium text-blue-600 transition hover:bg-blue-50"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-blue-600 px-5 py-2 font-medium text-white transition hover:bg-blue-700"
          >
            Register
          </Link>
        </div>
      </nav>
    </header>
  );
}