import Link from "next/link";
import SocialIcons from "./SocialIcons";

export default function CTA() {
  return (
    <section className="bg-gradient-to-b from-blue-600 to-blue-700 py-24">
      <div className="mx-auto max-w-5xl px-8 text-center text-white">

        <h2 className="text-4xl md:text-5xl font-bold">
          Ready to Start Your Investment Journey?
        </h2>

        <p className="mt-6 text-xl text-blue-100 max-w-2xl mx-auto">
          Build, monitor, and grow your portfolio with a secure and
          modern investment management platform.
        </p>

        <div className="mt-10 flex justify-center gap-5">

          <Link
            href="/register"
            className="rounded-xl bg-white px-8 py-4 font-semibold text-blue-600 hover:bg-slate-100 transition shadow-lg"
          >
            Get Started Free
          </Link>

          <Link
            href="#features"
            className="rounded-xl border border-white px-8 py-4 font-semibold hover:bg-white hover:text-blue-600 transition"
          >
            Learn More
          </Link>

        </div>

        <div className="mt-14 pt-10 border-t border-blue-500/40">
          <p className="text-sm font-medium text-blue-100 mb-4">
            Connect with our community across social platforms
          </p>
          <SocialIcons
            variant="pill"
            className="flex flex-wrap items-center justify-center gap-2.5"
            itemClassName="bg-blue-800/60 border-blue-400/30 text-white hover:bg-white hover:text-blue-600"
          />
        </div>

      </div>
    </section>
  );
}