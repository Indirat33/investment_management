import Link from "next/link";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-slate-950 text-white py-16"
    >
      <div className="mx-auto max-w-7xl px-8 grid gap-12 md:grid-cols-4">

        <div>
          <h2 className="text-3xl font-bold text-blue-400">
            InvestPro
          </h2>

          <p className="mt-5 text-slate-400 leading-7">
            A modern digital investment management platform
            designed for secure portfolio management and
            financial growth.
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold">
            Platform
          </h3>

          <ul className="mt-5 space-y-3 text-slate-400">
            <li><Link href="/">Home</Link></li>
            <li><a href="#features">Features</a></li>
            <li><a href="#how">How It Works</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold">
            Company
          </h3>

          <ul className="mt-5 space-y-3 text-slate-400">
            <li>About Us</li>
            <li>Privacy Policy</li>
            <li>Terms & Conditions</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold">
            Contact
          </h3>

          <ul className="mt-5 space-y-3 text-slate-400">
            <li>Email: info@investpro.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>New York, USA</li>
          </ul>
        </div>

      </div>

      <div className="mt-12 border-t border-slate-800 pt-8 text-center text-slate-500">
        © 2026 InvestPro. All rights reserved.
      </div>
    </footer>
  );
}