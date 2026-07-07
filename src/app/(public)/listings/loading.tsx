import { ListingGridSkeleton } from "@/features/listings/components/listing-card-skeleton";

export default function ListingsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6">
      <div className="h-7 w-64 animate-pulse rounded bg-muted" />
      <div className="mt-4 h-11 w-full animate-pulse rounded-lg bg-muted" />
      <div className="mt-5">
        <ListingGridSkeleton count={12} />
      </div>
    </main>
  );
}
