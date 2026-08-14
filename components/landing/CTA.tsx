import Link from "next/link";

export default function CTA() {
  return (
    <section className="bg-blue-600 py-24">
      <div className="mx-auto max-w-5xl px-8 text-center text-white">

        <h2 className="text-5xl font-bold">
          Ready to Start Your Investment Journey?
        </h2>

        <p className="mt-6 text-xl text-blue-100">
          Build, monitor, and grow your portfolio with a secure and
          modern investment management platform.
        </p>

        <div className="mt-10 flex justify-center gap-5">

          <Link
            href="#"
            className="rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 hover:bg-slate-100 transition"
          >
            Get Started
          </Link>

          <Link
            href="#features"
            className="rounded-xl border border-white px-8 py-4 font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Learn More
          </Link>

        </div>

      </div>
    </section>
  );
}