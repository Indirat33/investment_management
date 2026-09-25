import Link from "next/link";
import SocialIcons from "./SocialIcons";

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

          <div className="mt-7">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3.5">
              Follow Our Channels
            </p>
            <SocialIcons variant="button" size="lg" className="flex items-center gap-3.5" />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold">
            Platform
          </h3>

          <ul className="mt-5 space-y-3 text-slate-400">
            <li><Link href="/" className="hover:text-blue-400 transition">Home</Link></li>
            <li><a href="#features" className="hover:text-blue-400 transition">Features</a></li>
            <li><a href="#how" className="hover:text-blue-400 transition">How It Works</a></li>
            <li><a href="#testimonials" className="hover:text-blue-400 transition">Testimonials</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold">
            Company
          </h3>

          <ul className="mt-5 space-y-3 text-slate-400">
            <li className="hover:text-blue-400 transition cursor-pointer">About Us</li>
            <li className="hover:text-blue-400 transition cursor-pointer">Privacy Policy</li>
            <li className="hover:text-blue-400 transition cursor-pointer">Terms & Conditions</li>
            <li className="hover:text-blue-400 transition cursor-pointer">Security & Compliance</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold">
            Contact & Community
          </h3>

          <ul className="mt-5 space-y-3 text-slate-400">
            <li>Email: info@investpro.com</li>
            <li>Phone: +1 (555) 123-4567</li>
            <li>New York, USA</li>
          </ul>

          <div className="mt-7">
            <p className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3.5">
              Join the Conversation
            </p>
            <SocialIcons variant="minimal" size="lg" className="flex items-center gap-5" />
          </div>
        </div>

      </div>

      <div className="mt-12 border-t border-slate-800 pt-8 px-8 mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
        <div>
          © 2026 InvestPro. All rights reserved.
        </div>
        <SocialIcons variant="minimal" size="md" className="flex items-center gap-5" />
      </div>
    </footer>
  );
}