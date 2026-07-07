// POST /api/articles/:id/view — เพิ่มยอดอ่านบทความ (ยิงจาก ViewTracker)

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  await prisma.article.updateMany({
    where: { id, published: true },
    data: { views: { increment: 1 } },
  });
  return NextResponse.json({ ok: true });
}
