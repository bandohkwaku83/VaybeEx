const stats = [
  { value: "50+", label: "Curated trips" },
  { value: "12", label: "Destinations" },
  { value: "2.4k", label: "Happy travelers" },
  { value: "4.8", label: "Average rating" },
];

export function StatsBar() {
  return (
    <section className="border-b border-stone-200 bg-white py-10">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 px-4 sm:px-6 md:grid-cols-4 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <p className="font-serif text-3xl font-bold text-[#1e3636] sm:text-4xl">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-stone-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
