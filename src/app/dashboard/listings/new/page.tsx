// ลงประกาศใหม่ (M5)

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { createListingAction } from "@/features/listings/actions";
import { ListingForm } from "@/features/listings/components/listing-form";
import { isListingType } from "@/config/listingTypes";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "ลงประกาศใหม่",
};

export default async function NewListingPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { type } = await searchParams;
  const listingType = isListingType(type) ? type : "SELL";

  // เติมช่องติดต่อจากโปรไฟล์ให้เลย ลดการพิมพ์บนมือถือ
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { phone: true, province: true },
  });

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-primary-dk">
        ลงประกาศใหม่
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        เลือกได้ทั้ง&quot;ขายสินค้า&quot;และ&quot;ต้องการซื้อ&quot; —
        ผู้สนใจติดต่อคุณตรงทางโทรศัพท์หรือ LINE
      </p>
      <div className="mt-6">
        <ListingForm
          action={createListingAction}
          submitLabel="ลงประกาศ"
          defaults={{
            listingType,
            contactPhone: user?.phone ?? "",
            province: user?.province ?? "",
          }}
        />
      </div>
    </main>
  );
}
