import { prisma } from "@/lib/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const items = await prisma.menu_item.findMany({
    where: category ? { category: category as any } : undefined,
    orderBy: { item_name: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  try {
    const item = await prisma.menu_item.create({
      data: {
        item_name: body.item_name,
        category: body.category,
        price: body.price,
        is_available: body.is_available ?? true,
      },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (e: any) {
    if (e.code === "P2002")
      return NextResponse.json({ error: "Item name already exists" }, { status: 409 });
    return NextResponse.json({ error: "Invalid data" }, { status: 400 });
  }
}
