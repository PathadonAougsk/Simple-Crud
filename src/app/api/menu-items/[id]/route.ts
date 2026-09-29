import { prisma } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const item = await prisma.menu_item.findUnique({ where: { item_id: Number(id) } });
  return item
    ? NextResponse.json(item)
    : NextResponse.json({ error: "Not found" }, { status: 404 });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const body = await req.json();
  try {
    const item = await prisma.menu_item.update({
      where: { item_id: Number(id) },
      data: body,
    });
    return NextResponse.json(item);
  } catch (e: any) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}

export async function DELETE(_: NextRequest, { params }: Ctx) {
  const { id } = await params;
  try {
    await prisma.menu_item.delete({ where: { item_id: Number(id) } });
    return new NextResponse(null, { status: 204 });
  } catch (e: any) {
    if (e.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (e.code === "P2003")
      return NextResponse.json({ error: "Item is used in orders" }, { status: 409 });
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
