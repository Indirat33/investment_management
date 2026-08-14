import Link from "next/link";

export default function Hero() {
  return (
    <section className="min-h-screen bg-slate-950 flex items-center pt-24">
      <div className="mx-auto max-w-7xl px-8 grid items-center gap-16 lg:grid-cols-2">

        {/* Left Side */}
        <div>
          <span className="inline-block rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Smart Investment Management
          </span>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight text-white lg:text-6xl">
            Grow Your Wealth with
            <span className="text-blue-500"> InvestPro</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Manage your investments, monitor portfolio performance,
            analyze financial reports, and make smarter investment
            decisions—all from one secure platform.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="rounded-lg bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700"
            >
              Get Started
            </Link>

            <a
              href="#features"
              className="rounded-lg border border-slate-500 px-8 py-4 text-lg font-semibold text-white transition hover:bg-slate-800"
            >
              Learn More
            </a>
          </div>

          <div className="mt-10 flex gap-10">
            <div>
              <h3 className="text-3xl font-bold text-white">10K+</h3>
              <p className="text-slate-400">Active Users</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">$25M+</h3>
              <p className="text-slate-400">Assets Managed</p>
            </div>

            <div>
              <h3 className="text-3xl font-bold text-white">99.9%</h3>
              <p className="text-slate-400">Secure Platform</p>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex justify-center">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

            <h2 className="text-2xl font-bold text-slate-900">
              Portfolio Overview
            </h2>

            <div className="mt-8 space-y-6">

              <div className="rounded-xl bg-slate-100 p-5">
                <p className="text-sm text-slate-500">
                  Total Investment
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  $125,430
                </h3>
              </div>

              <div className="rounded-xl bg-green-100 p-5">
                <p className="text-sm text-green-700">
                  Total Profit
                </p>

                <h3 className="mt-2 text-3xl font-bold text-green-700">
                  +18.7%
                </h3>
              </div>

              <div className="rounded-xl bg-blue-100 p-5">
                <p className="text-sm text-blue-700">
                  Monthly Growth
                </p>

                <h3 className="mt-2 text-3xl font-bold text-blue-700">
                  +$3,250
                </h3>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
}