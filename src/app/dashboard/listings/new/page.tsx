// ลงประกาศใหม่ (M5)

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/features/auth";
import { createListingAction } from "@/features/listings/actions";
import { ListingForm } from "@/features/listings/components/listing-form";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "ลงประกาศใหม่",
};

export default async function NewListingPage() {
  const session = await auth();
  if (!session) redirect("/login");

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
        ลงประกาศฟรี ผู้ซื้อติดต่อคุณตรงทางโทรศัพท์หรือ LINE
      </p>
      <div className="mt-6">
        <ListingForm
          action={createListingAction}
          submitLabel="ลงประกาศ"
          defaults={{
            contactPhone: user?.phone ?? "",
            province: user?.province ?? "",
          }}
        />
      </div>
    </main>
  );
}
