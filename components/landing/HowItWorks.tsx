const steps = [
  {
    number: "01",
    title: "Create an Account",
    description:
      "Sign up and securely access your personalized investment dashboard.",
  },
  {
    number: "02",
    title: "Build Your Portfolio",
    description:
      "Add investments, organize your assets, and monitor portfolio growth.",
  },
  {
    number: "03",
    title: "Track Performance",
    description:
      "View real-time insights, financial reports, and investment analytics.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="bg-white py-24"
    >
      <div className="mx-auto max-w-7xl px-8">

        <div className="text-center">
          <h2 className="text-5xl font-bold text-slate-900">
            How It Works
          </h2>

          <p className="mt-5 text-lg text-slate-600 max-w-3xl mx-auto">
            Start managing your investments in just three simple steps.
          </p>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-3">

          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border border-slate-200 bg-slate-50 p-10 text-center shadow-sm transition hover:-translate-y-2 hover:shadow-xl"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white">
                {step.number}
              </div>

              <h3 className="mt-8 text-2xl font-bold text-slate-900">
                {step.title}
              </h3>

              <p className="mt-5 leading-7 text-slate-600">
                {step.description}
              </p>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}