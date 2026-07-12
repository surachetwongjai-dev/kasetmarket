// แก้ข้อมูลร้าน (admin — D5) — ใช้ ShopForm เดียวกับฟอร์มลงทะเบียน

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getShopForEdit } from "@/features/directory/queries";
import { updateShopAction } from "@/features/directory/actions";
import { ShopForm } from "@/features/directory/components/shop-form";

export const metadata: Metadata = {
  title: "แก้ข้อมูลร้าน",
};

export default async function EditShopPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const shop = await getShopForEdit(id);
  if (!shop) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="font-heading text-lg font-semibold">
        แก้ข้อมูลร้าน: {shop.name}
      </h2>
      <div className="mt-4">
        <ShopForm action={updateShopAction} initial={shop} mode="admin-edit" />
      </div>
    </div>
  );
}
