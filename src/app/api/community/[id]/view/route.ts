// POST /api/community/:id/view — เพิ่มยอดวิวกระทู้ (ยิงจาก ViewTracker ฝั่ง client)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  await prisma.thread.updateMany({
    where: { id, hidden: false },
    data: { views: { increment: 1 } },
  });
  return NextResponse.json({ ok: true });
}
