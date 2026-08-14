export default function Stats() {
  const stats = [
    {
      value: "25K+",
      title: "Active Investors",
      description: "Trusted users growing their wealth with our platform.",
    },
    {
      value: "Rs. 50M+",
      title: "Assets Managed",
      description: "Investment portfolios managed securely every day.",
    },
    {
      value: "120+",
      title: "Countries",
      description: "Serving investors around the world.",
    },
    {
      value: "99.9%",
      title: "Customer Satisfaction",
      description: "Committed to a secure and reliable experience.",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-8">
        <div className="mb-14 text-center">
          <h2 className="text-4xl font-bold text-slate-900">
            Trusted by Investors Worldwide
          </h2>

          <p className="mt-4 text-lg text-slate-600">
            Helping individuals and businesses manage investments with
            confidence.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-8 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
            >
              <h3 className="text-5xl font-extrabold text-blue-600">
                {stat.value}
              </h3>

              <h4 className="mt-5 text-xl font-semibold text-slate-900">
                {stat.title}
              </h4>

              <p className="mt-3 text-slate-600">
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}