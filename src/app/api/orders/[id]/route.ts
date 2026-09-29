import { prisma } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    await prisma.orders.delete({ where: { order_id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { status } = await req.json();
  if (!["Open", "Paid", "Cancelled"].includes(status))
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  try {
    const order = await prisma.orders.update({
      where: { order_id: Number(id) },
      data: { status },
    });
    return NextResponse.json(order);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
