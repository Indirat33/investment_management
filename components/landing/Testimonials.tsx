const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Financial Analyst",
    comment:
      "This platform made managing my investment portfolio simple and efficient.",
  },
  {
    name: "Michael Lee",
    role: "Business Owner",
    comment:
      "The analytics and reporting tools helped me make better investment decisions.",
  },
  {
    name: "Emily Carter",
    role: "Investor",
    comment:
      "A clean, secure, and easy-to-use investment management platform.",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="bg-slate-100 py-24"
    >
      <div className="mx-auto max-w-7xl px-8">

        <div className="text-center">
          <h2 className="text-5xl font-bold text-slate-900">
            What Our Users Say
          </h2>

          <p className="mt-5 text-lg text-slate-600">
            Feedback from investors who trust our platform.
          </p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">

          {testimonials.map((user) => (
            <div
              key={user.name}
              className="rounded-2xl bg-white p-8 shadow-md transition hover:-translate-y-2 hover:shadow-xl"
            >
              <p className="text-slate-600 leading-7">
                "{user.comment}"
              </p>

              <div className="mt-8">
                <h3 className="text-xl font-bold text-slate-900">
                  {user.name}
                </h3>

                <p className="text-blue-600">
                  {user.role}
                </p>
              </div>
            </div>
          ))}

        </div>

      </div>
    </section>
  );
}