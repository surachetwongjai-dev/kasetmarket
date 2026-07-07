// แก้ไขประกาศ (เจ้าของเท่านั้น) — M5

import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { updateListingAction } from "@/features/listings/actions";
import { ListingForm } from "@/features/listings/components/listing-form";
import { ListingStatusBadge } from "@/features/listings/components/listing-status-badge";
import { getMyListingForEdit } from "@/features/listings/queries";

export const metadata: Metadata = {
  title: "แก้ไขประกาศ",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const listing = await getMyListingForEdit(id, session.user.id);
  if (!listing) notFound();

  const action = updateListingAction.bind(null, listing.id);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <div className="flex items-center gap-3">
        <h1 className="font-heading text-2xl font-bold text-primary-dk">
          แก้ไขประกาศ
        </h1>
        <ListingStatusBadge status={listing.status} />
      </div>
      <div className="mt-6">
        <ListingForm
          action={action}
          submitLabel="บันทึกการแก้ไข"
          defaults={{
            title: listing.title,
            description: listing.description,
            price: String(listing.price),
            unit: listing.unit,
            negotiable: listing.negotiable,
            category: listing.category,
            province: listing.province,
            district: listing.district ?? "",
            contactPhone: listing.contactPhone ?? "",
            contactLine: listing.contactLine ?? "",
            images: listing.images.map((img) => ({
              key: img.url, // ใช้ url เป็น key ได้ — DB เก็บเฉพาะ url
              url: img.url,
            })),
          }}
        />
      </div>
    </main>
  );
}
