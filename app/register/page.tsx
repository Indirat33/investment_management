"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
} from "lucide-react";


export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage("");

    if (!name || !email || !password || !confirmPassword) {
      setMessage("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message);
      } else {
        alert("Registration Successful!");
        router.push("/");
      }
    } catch {
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">

        <h1 className="text-3xl font-bold text-center text-slate-900">
          Create Your Account
        </h1>

        <p className="mt-2 text-center text-gray-600">
          Join InvestPro and start managing your investments.
        </p>

        <form onSubmit={handleRegister} className="mt-8 space-y-5">

          {/* Full Name */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-900">
              Full Name
            </label>

            <input
  type="text"
  placeholder="Enter your full name"
  value={name}
  onChange={(e) => setName(e.target.value)}
  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
/>
            
          </div>

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
  placeholder="Create a password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
/>
            
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-2 text-sm font-medium text-slate-900">
              Confirm Password
            </label>

            <input
  type="password"
  placeholder="Confirm your password"
  value={confirmPassword}
  onChange={(e) => setConfirmPassword(e.target.value)}
  className="w-full rounded-lg border border-gray-300 bg-white p-3 text-black placeholder:text-gray-400 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
/>
            
          </div>

         {message && (
  <p className="text-center text-sm text-red-600">
    {message}
  </p>
)}
          <button
  type="submit"
  disabled={loading}
  className="w-full rounded-lg bg-blue-600 py-3 text-white font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-400"
>
  {loading ? "Creating Account..." : "Create Account"}
</button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>

      </div>
    </main>
  );
}