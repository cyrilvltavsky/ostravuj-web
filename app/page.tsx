const CATEGORIES = [
  {
    slug: "gastro",
    name: "Gastro",
    emoji: "🍜",
    description: "Restaurace, bistra, kavárny, pekařství.",
  },
  {
    slug: "aktivity",
    name: "Aktivity",
    emoji: "🎯",
    description: "Zážitky, sport, kultura.",
  },
  {
    slug: "rande",
    name: "Rande tipy",
    emoji: "💞",
    description: "Romantická místa pro dva.",
  },
  {
    slug: "zdarma",
    name: "Zdarma",
    emoji: "🎉",
    description: "Místa a akce bez vstupného.",
  },
] as const;

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-20">
      <header className="mb-16 text-center">
        <h1 className="bg-gradient-to-r from-orange-500 via-pink-500 to-indigo-500 bg-clip-text text-6xl font-extrabold tracking-tight text-transparent sm:text-7xl">
          Ostravuj
        </h1>
        <p className="mt-4 text-xl text-neutral-600">
          Objevuj nejlepší místa v Ostravě.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {CATEGORIES.map((cat) => (
          <div
            key={cat.slug}
            className="group rounded-2xl border border-neutral-200 bg-white p-8 transition hover:border-neutral-300 hover:shadow-lg"
          >
            <div className="mb-3 text-4xl">{cat.emoji}</div>
            <h2 className="text-xl font-semibold">{cat.name}</h2>
            <p className="mt-2 text-sm text-neutral-500">{cat.description}</p>
          </div>
        ))}
      </section>

      <footer className="mt-24 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500">
        <p>© 2026 Ostravuj. Nejlepší místa v Ostravě.</p>
      </footer>
    </main>
  );
}
