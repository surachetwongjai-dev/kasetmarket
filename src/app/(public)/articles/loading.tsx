export default function ArticlesLoading() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <div className="h-8 w-56 animate-pulse rounded bg-muted" />
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col overflow-hidden rounded-xl border border-border bg-card"
          >
            <div className="aspect-[16/9] animate-pulse bg-muted" />
            <div className="flex flex-col gap-2 p-3">
              <div className="h-5 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
