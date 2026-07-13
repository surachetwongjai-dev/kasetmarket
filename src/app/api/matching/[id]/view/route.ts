// POST /api/matching/:id/view — เพิ่มยอดวิวโพสจับคู่ (ยิงจาก ViewTracker ฝั่ง client)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  // updateMany = ไม่ throw ถ้า id ไม่มีจริง + นับเฉพาะโพสที่แสดงอยู่
  await prisma.matchPost.updateMany({
    where: { id, status: "ACTIVE" },
    data: { views: { increment: 1 } },
  });
  return NextResponse.json({ ok: true });
}
