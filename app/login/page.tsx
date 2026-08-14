"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setMessage("");

    if (!email || !password) {
      setMessage("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Invalid email or password.");
        return;
      }

      alert("Login Successful!");

      // Redirect directly to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Login error:", error);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-slate-900">
          Welcome Back
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Login to your InvestPro account.
        </p>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          {/* Email */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-900">
              Email Address
            </label>

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-900">
              Password
            </label>

            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />
          </div>

          {/* Error message */}
          {message && (
            <p className="text-center text-sm text-red-600">
              {message}
            </p>
          )}

          {/* Login button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}