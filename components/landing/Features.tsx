const features = [
  {
    icon: "📈",
    title: "Portfolio Management",
    description:
      "Track and manage all your investments from one intuitive dashboard.",
  },
  {
    icon: "💹",
    title: "Real-Time Analytics",
    description:
      "Monitor investment performance with live charts and detailed reports.",
  },
  {
    icon: "🔒",
    title: "Secure Platform",
    description:
      "Protect your financial data with industry-standard security measures.",
  },
  {
    icon: "💳",
    title: "Transaction History",
    description:
      "View and organize every investment, deposit, and withdrawal easily.",
  },
  {
    icon: "🔔",
    title: "Smart Notifications",
    description:
      "Receive updates about portfolio performance and important activities.",
  },
  {
    icon: "📊",
    title: "Financial Reports",
    description:
      "Generate comprehensive reports to better understand your investments.",
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-slate-100 py-24">
      <div className="mx-auto max-w-7xl px-8">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-slate-900">
            Powerful Features
          </h2>

          <p className="mt-5 text-lg text-slate-600 max-w-3xl mx-auto">
            Everything you need to manage your investments, monitor portfolio
            performance, and make informed financial decisions.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl bg-white p-8 shadow-md transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="text-5xl">{feature.icon}</div>

              <h3 className="mt-6 text-2xl font-bold text-slate-900">
                {feature.title}
              </h3>

              <p className="mt-4 leading-7 text-slate-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}